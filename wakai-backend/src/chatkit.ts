import { Env, ChatKitSession } from './types';

/**
 * Creates a new ChatKit session
 * This generates a client_secret that the frontend will use to authenticate
 */
export async function createChatKitSession(apiKey: string): Promise<ChatKitSession> {
  const response = await fetch('https://api.openai.com/v1/realtime/sessions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-realtime-preview-2024-12-17',
      voice: 'alloy',
      instructions: `Eres el Asistente Wakai, un asistente AI especializado en mediación familiar en Chile.

Tu rol es ayudar a los usuarios a:
- Consultar casos de mediación familiar
- Ver información de contactos y llamadas
- Navegar a casos específicos
- Enviar notificaciones a participantes
- Proporcionar insights y recomendaciones basadas en los datos

Siempre mantén un tono profesional, empático y respetuoso.
Cuando uses las herramientas del cliente, explica claramente qué estás haciendo.
Si los datos muestran casos sensibles, mantén la confidencialidad.`,
      modalities: ['text'],
      temperature: 0.8,
      tools: [
        {
          type: 'function',
          name: 'get_all_cases',
          description: 'Obtiene todos los casos de mediación de la base de datos',
        },
        {
          type: 'function',
          name: 'get_case_by_id',
          description: 'Obtiene un caso específico por su ID',
          parameters: {
            type: 'object',
            properties: {
              caseId: {
                type: 'string',
                description: 'ID del caso a buscar',
              },
            },
            required: ['caseId'],
          },
        },
        {
          type: 'function',
          name: 'get_all_chat_ids',
          description: 'Obtiene todos los IDs de chat disponibles',
        },
        {
          type: 'function',
          name: 'send_notifications',
          description: 'Envía notificaciones a los contactos pendientes',
        },
        {
          type: 'function',
          name: 'navigate_to_case',
          description: 'Navega a la página de detalles de un caso',
          parameters: {
            type: 'object',
            properties: {
              caseId: {
                type: 'string',
                description: 'ID del caso al que navegar',
              },
            },
            required: ['caseId'],
          },
        },
        {
          type: 'function',
          name: 'navigate_to_case_contacts',
          description: 'Navega a la página de contactos de un caso',
          parameters: {
            type: 'object',
            properties: {
              caseId: {
                type: 'string',
                description: 'ID del caso',
              },
            },
            required: ['caseId'],
          },
        },
      ],
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to create ChatKit session: ${response.status} ${error}`);
  }

  return await response.json();
}

/**
 * Refreshes an existing ChatKit session
 * This is called when the client_secret is about to expire
 */
export async function refreshChatKitSession(
  apiKey: string,
  currentClientSecret: string
): Promise<ChatKitSession> {
  // For now, we'll just create a new session
  // OpenAI may add a proper refresh endpoint in the future
  return createChatKitSession(apiKey);
}
