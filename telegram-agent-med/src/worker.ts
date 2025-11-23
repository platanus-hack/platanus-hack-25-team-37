/// <reference types="@cloudflare/workers-types" />
import { Telegraf, Context } from 'telegraf';
import { OpenAIService } from './services/openaiService';
import { KVStore } from './services/kvStore';
import { MediationAppointment } from './types';

interface Env {
  TELEGRAM_BOT_TOKEN: string;
  OPENAI_API_KEY: string;
  CONVERSATIONS: KVNamespace;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;

    // Inicializar servicios (en Cloudflare Workers se inicializan en cada request)
    const bot = new Telegraf(env.TELEGRAM_BOT_TOKEN);
    const openaiService = new OpenAIService(env.OPENAI_API_KEY);
    const kvStore = new KVStore(env.CONVERSATIONS);
    
    // Configurar handlers del bot
    setupBotHandlers(bot, openaiService, kvStore);

    // Webhook de Telegram
    if (path === '/webhook' && request.method === 'POST') {
      try {
        const update = await request.json();
        await bot.handleUpdate(update);
        return new Response('OK', { status: 200 });
      } catch (error: any) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }

    // API Endpoints
    if (path === '/api/send-mediation' && request.method === 'POST') {
      try {
        const body = await request.json();
        const chatId = body.phoneNumber || body.chatId;
        const { appointmentData } = body;

        if (!chatId || !appointmentData) {
          return new Response(JSON.stringify({
            error: 'Se requieren chatId (o phoneNumber) y appointmentData',
            hint: 'El chatId es el número que obtienes con el comando /chatid en el bot o desde /api/chat-ids'
          }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          });
        }

        if (!appointmentData.nombre || !appointmentData.fecha || !appointmentData.hora || !appointmentData.lugar) {
          return new Response(JSON.stringify({
            error: 'appointmentData debe contener: nombre, fecha, hora, lugar'
          }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          });
        }

        const mediationData: MediationAppointment = {
          nombre: appointmentData.nombre,
          fecha: appointmentData.fecha,
          hora: appointmentData.hora,
          lugar: appointmentData.lugar,
          mediador: appointmentData.mediador,
          notasAdicionales: appointmentData.notasAdicionales
        };

        const message = await openaiService.generateMediationMessage(mediationData);

        try {
          await bot.telegram.sendMessage(chatId, message);
          await kvStore.addMessage(chatId.toString(), {
            role: 'assistant',
            content: message,
            timestamp: new Date().toISOString()
          });

          return new Response(JSON.stringify({
            success: true,
            message: 'Mensaje enviado correctamente',
            sentMessage: message,
            chatId: chatId.toString()
          }), {
            headers: { 'Content-Type': 'application/json' }
          });
        } catch (telegramError: any) {
          let errorMessage = 'No se pudo enviar el mensaje.';
          let hint = '';
          
          if (telegramError.response?.error_code === 400) {
            if (telegramError.response.description?.includes('chat not found')) {
              errorMessage = 'El usuario no ha iniciado una conversación con el bot.';
              hint = 'El usuario debe enviar /start al bot primero. Luego puedes obtener su Chat ID con /chatid o desde /api/chat-ids';
            } else if (telegramError.response.description?.includes('chat_id')) {
              errorMessage = 'Chat ID inválido.';
              hint = 'Verifica que el chatId sea correcto. Puedes obtenerlo con el comando /chatid en el bot.';
            }
          }
          
          return new Response(JSON.stringify({
            error: errorMessage,
            details: telegramError.response?.description || telegramError.message,
            hint: hint || 'Verifica que el chatId sea válido y que el usuario haya iniciado una conversación con el bot usando /start.'
          }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          });
        }
      } catch (error: any) {
        return new Response(JSON.stringify({
          error: 'Error interno del servidor',
          details: error.message
        }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }

    if (path === '/api/conversations' && request.method === 'GET') {
      const conversations = await kvStore.getAllConversations();
      return new Response(JSON.stringify(conversations), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (path === '/api/chat-ids' && request.method === 'GET') {
      const conversations = await kvStore.getAllConversations();
      const chatIds = Object.keys(conversations).map(userId => ({
        chatId: userId,
        username: conversations[userId].phoneNumber || 'No disponible',
        lastMessage: conversations[userId].updatedAt,
        messageCount: conversations[userId].messages.length
      }));
      return new Response(JSON.stringify({
        total: chatIds.length,
        chatIds
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (path.startsWith('/api/conversations/') && request.method === 'GET') {
      const userId = path.split('/api/conversations/')[1];
      const conversation = await kvStore.getConversation(userId);
      
      if (!conversation) {
        return new Response(JSON.stringify({ error: 'Conversación no encontrada' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      return new Response(JSON.stringify(conversation), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (path === '/health' && request.method === 'GET') {
      return new Response(JSON.stringify({
        status: 'ok',
        timestamp: new Date().toISOString()
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response('Not Found', { status: 404 });
  }
};

function setupBotHandlers(bot: Telegraf, openaiService: OpenAIService, kvStore: KVStore) {
  bot.start(async (ctx: Context) => {
    const userId = ctx.from!.id.toString();
    const chatId = ctx.chat!.id.toString();
    await ctx.reply(
      '¡Hola! Soy tu asistente de mediaciones familiares. Puedo ayudarte con información sobre tus citas de mediación.\n\n' +
      `📱 Tu Chat ID es: \`${chatId}\`\n` +
      'Guarda este número para usar el endpoint de API.\n' +
      'También puedes usar el comando /chatid para verlo nuevamente.'
    );

    await kvStore.addMessage(userId, {
      role: 'assistant',
      content: '¡Hola! Soy tu asistente de mediaciones familiares.',
      timestamp: new Date().toISOString()
    });
  });

  bot.help(async (ctx: Context) => {
    await ctx.reply(
      'Comandos disponibles:\n' +
      '/start - Iniciar conversación\n' +
      '/help - Mostrar ayuda\n' +
      '/chatid - Mostrar tu Chat ID\n' +
      '/clear - Limpiar historial de conversación\n\n' +
      'También puedes hacerme cualquier pregunta sobre mediaciones.'
    );
  });

  bot.command('chatid', async (ctx: Context) => {
    const chatId = ctx.chat!.id.toString();
    const userId = ctx.from!.id.toString();
    const username = ctx.from!.username ? `@${ctx.from!.username}` : 'No disponible';
    
    await ctx.reply(
      `📱 Tu información:\n\n` +
      `Chat ID: \`${chatId}\`\n` +
      `User ID: \`${userId}\`\n` +
      `Username: ${username}\n\n` +
      `💡 Usa el Chat ID (\`${chatId}\`) en el endpoint de API para enviar mensajes.`
    );
  });

  bot.command('clear', async (ctx: Context) => {
    const userId = ctx.from!.id.toString();
    await kvStore.clearConversation(userId);
    await ctx.reply('Tu historial de conversación ha sido limpiado.');
  });

  bot.on('text', async (ctx: Context) => {
    const userId = ctx.from!.id.toString();
    const userMessage = ctx.message && 'text' in ctx.message ? ctx.message.text : '';

    await kvStore.addMessage(userId, {
      role: 'user',
      content: userMessage,
      timestamp: new Date().toISOString()
    });

    try {
      await ctx.sendChatAction('typing');

      const messages = await kvStore.getMessages(userId);
      const response = await openaiService.generateResponse(messages);

      await kvStore.addMessage(userId, {
        role: 'assistant',
        content: response,
        timestamp: new Date().toISOString()
      });

      await ctx.reply(response);
    } catch (error) {
      await ctx.reply('Lo siento, ocurrió un error al procesar tu mensaje. Por favor intenta nuevamente.');
    }
  });
}

