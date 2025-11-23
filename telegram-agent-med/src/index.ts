import dotenv from 'dotenv';
import { Telegraf } from 'telegraf';
import { OpenAIService } from './services/openaiService';
import { ConversationStore } from './services/conversationStore';
import express from 'express';
import bodyParser from 'body-parser';
import { MediationAppointment } from './types';

dotenv.config();

const requiredEnvVars = ['TELEGRAM_BOT_TOKEN', 'OPENAI_API_KEY'];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`Error: Variable de entorno ${envVar} no está definida`);
    process.exit(1);
  }
}

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN!);
const openaiService = new OpenAIService(process.env.OPENAI_API_KEY!);
const conversationStore = new ConversationStore(process.env.CONVERSATIONS_FILE || './conversations.json');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

bot.start(async (ctx) => {
  const userId = ctx.from.id.toString();
  const chatId = ctx.chat.id.toString();
  await ctx.reply(
    '¡Hola! Soy tu asistente de mediaciones familiares. Puedo ayudarte con información sobre tus citas de mediación.\n\n' +
    `📱 Tu Chat ID es: \`${chatId}\`\n` +
    'Guarda este número para usar el endpoint de API.\n' +
    'También puedes usar el comando /chatid para verlo nuevamente.'
  );

  conversationStore.addMessage(userId, {
    role: 'assistant',
    content: '¡Hola! Soy tu asistente de mediaciones familiares.',
    timestamp: new Date().toISOString()
  });
});

bot.help(async (ctx) => {
  await ctx.reply(
    'Comandos disponibles:\n' +
    '/start - Iniciar conversación\n' +
    '/help - Mostrar ayuda\n' +
    '/chatid - Mostrar tu Chat ID\n' +
    '/clear - Limpiar historial de conversación\n\n' +
    'También puedes hacerme cualquier pregunta sobre mediaciones.'
  );
});

bot.command('chatid', async (ctx) => {
  const chatId = ctx.chat.id.toString();
  const userId = ctx.from.id.toString();
  const username = ctx.from.username ? `@${ctx.from.username}` : 'No disponible';
  
  await ctx.reply(
    `📱 Tu información:\n\n` +
    `Chat ID: \`${chatId}\`\n` +
    `User ID: \`${userId}\`\n` +
    `Username: ${username}\n\n` +
    `💡 Usa el Chat ID (\`${chatId}\`) en el endpoint de API para enviar mensajes.`
  );
});

bot.command('clear', async (ctx) => {
  const userId = ctx.from.id.toString();
  conversationStore.clearConversation(userId);
  await ctx.reply('Tu historial de conversación ha sido limpiado.');
});

bot.on('text', async (ctx) => {
  const userId = ctx.from.id.toString();
  const userMessage = ctx.text;

  conversationStore.addMessage(userId, {
    role: 'user',
    content: userMessage,
    timestamp: new Date().toISOString()
  });

  try {
    await ctx.sendChatAction('typing');

    const messages = conversationStore.getMessages(userId);
    const response = await openaiService.generateResponse(messages);

    conversationStore.addMessage(userId, {
      role: 'assistant',
      content: response,
      timestamp: new Date().toISOString()
    });

    await ctx.reply(response);
  } catch (error) {
    await ctx.reply('Lo siento, ocurrió un error al procesar tu mensaje. Por favor intenta nuevamente.');
  }
});

app.post('/api/send-mediation', async (req, res) => {
  try {
    // Aceptar tanto 'phoneNumber' como 'chatId' para compatibilidad
    const chatId = req.body.phoneNumber || req.body.chatId;
    const { appointmentData } = req.body;

    if (!chatId || !appointmentData) {
      return res.status(400).json({
        error: 'Se requieren chatId (o phoneNumber) y appointmentData',
        hint: 'El chatId es el número que obtienes con el comando /chatid en el bot o desde /api/chat-ids'
      });
    }

    if (!appointmentData.nombre || !appointmentData.fecha || !appointmentData.hora || !appointmentData.lugar) {
      return res.status(400).json({
        error: 'appointmentData debe contener: nombre, fecha, hora, lugar'
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

      const userId = chatId.toString();
      conversationStore.addMessage(userId, {
        role: 'assistant',
        content: message,
        timestamp: new Date().toISOString()
      });

      return res.json({
        success: true,
        message: 'Mensaje enviado correctamente',
        sentMessage: message,
        chatId: userId
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
      
      return res.status(400).json({
        error: errorMessage,
        details: telegramError.response?.description || telegramError.message,
        hint: hint || 'Verifica que el chatId sea válido y que el usuario haya iniciado una conversación con el bot usando /start.'
      });
    }
  } catch (error: any) {
    return res.status(500).json({
      error: 'Error interno del servidor',
      details: error.message
    });
  }
});

app.get('/api/conversations', (req, res) => {
  const conversations = conversationStore.getAllConversations();
  res.json(conversations);
});

app.get('/api/chat-ids', (req, res) => {
  const conversations = conversationStore.getAllConversations();
  const chatIds = Object.keys(conversations).map(userId => ({
    chatId: userId,
    username: conversations[userId].phoneNumber || 'No disponible',
    lastMessage: conversations[userId].updatedAt,
    messageCount: conversations[userId].messages.length
  }));
  res.json({
    total: chatIds.length,
    chatIds
  });
});

app.get('/api/conversations/:userId', (req, res) => {
  const { userId } = req.params;
  const conversation = conversationStore.getConversation(userId);

  if (!conversation) {
    return res.status(404).json({ error: 'Conversación no encontrada' });
  }

  res.json(conversation);
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

async function start() {
  // Iniciar servidor Express primero para que esté disponible incluso si el bot falla
  app.listen(PORT);

  // Intentar iniciar el bot de Telegram
  try {
    await bot.launch();
    process.once('SIGINT', () => bot.stop('SIGINT'));
    process.once('SIGTERM', () => bot.stop('SIGTERM'));
  } catch (error: any) {
    // No salir del proceso, permitir que el servidor Express siga funcionando
  }
}

start();
