import OpenAI from 'openai';
import { ConversationMessage, MediationAppointment } from '../types';

export class OpenAIService {
  private client: OpenAI;
  private systemPrompt: string;

  constructor(apiKey: string) {
    this.client = new OpenAI({ apiKey });
    this.systemPrompt = `Eres un asistente especializado en mediaciones familiares.
Tu función es ayudar a las personas a comprender la información sobre sus citas de mediación.
Debes ser amable, profesional y responder de manera clara y concisa.
Cuando proporciones información sobre una cita, asegúrate de mencionar todos los detalles importantes como fecha, hora, lugar y nombre del mediador.`;
  }

  async generateResponse(messages: ConversationMessage[]): Promise<string> {
    try {
      const openaiMessages = [
        { role: 'system' as const, content: this.systemPrompt },
        ...messages
          .filter(msg => msg.role !== 'system')
          .map(msg => ({
            role: msg.role as 'user' | 'assistant',
            content: msg.content
          }))
      ];

      const completion = await this.client.chat.completions.create({
        model: 'gpt-4o',
        messages: openaiMessages,
        temperature: 0.7,
        max_tokens: 500
      });

      return completion.choices[0]?.message?.content || 'Lo siento, no pude generar una respuesta.';
    } catch (error) {
      throw new Error('Error al comunicarse con OpenAI');
    }
  }

  async generateMediationMessage(appointmentData: MediationAppointment): Promise<string> {
    const prompt = `Genera un mensaje amigable, cálido y profesional para informar a alguien sobre su cita de mediación familiar con los siguientes datos:
- Nombre: ${appointmentData.nombre}
- Fecha: ${appointmentData.fecha}
- Hora: ${appointmentData.hora}
- Lugar: ${appointmentData.lugar}
${appointmentData.mediador ? `- Mediador: ${appointmentData.mediador}` : ''}
${appointmentData.notasAdicionales ? `- Notas adicionales: ${appointmentData.notasAdicionales}` : ''}

El mensaje debe:
- Ser cordial y empático
- Incluir todos los detalles de la cita de forma clara
- Mencionar que estamos disponibles para cualquier pregunta o duda
- Ser conciso pero completo

NO incluyas ninguna firma o despedida al final, yo la agregaré.`;

    try {
      const completion = await this.client.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: this.systemPrompt },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 300
      });

      const generatedMessage = completion.choices[0]?.message?.content || 'Error al generar mensaje';

      // Agregar firma de Wakai Team
      return `${generatedMessage}\n\n---\nWakai Team`;
    } catch (error) {
      throw new Error('Error al generar mensaje de mediación');
    }
  }
}
