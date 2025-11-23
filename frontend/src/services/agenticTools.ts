// Agentic tools for ChatKit - Client-side tool implementations

import { wakaiApi } from './api'

export interface ClientToolCall {
  name: string
  params: Record<string, unknown>
}

/**
 * Get all mediation cases from the database
 */
export async function getAllCases(): Promise<Record<string, unknown>> {
  try {
    const response = await wakaiApi.getAllConversations()
    return {
      success: true,
      data: response.data,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al obtener los casos',
    }
  }
}

/**
 * Get a specific case by ID
 */
export async function getCaseById(caseId: string): Promise<Record<string, unknown>> {
  try {
    const response = await wakaiApi.getConversationByChatId(caseId)
    return {
      success: true,
      data: response.data,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al obtener el caso',
    }
  }
}

/**
 * Get all chat IDs
 */
export async function getAllChatIds(): Promise<Record<string, unknown>> {
  try {
    const response = await wakaiApi.getChatIds()
    return {
      success: true,
      data: response.data,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al obtener los IDs de chat',
    }
  }
}

/**
 * Send notifications to contacts
 */
export async function sendNotificationsToContacts(): Promise<Record<string, unknown>> {
  try {
    const response = await wakaiApi.sendNotifications()
    return {
      success: true,
      data: response,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al enviar notificaciones',
    }
  }
}

/**
 * Navigate to a specific case
 */
export async function navigateToCase(caseId: string): Promise<Record<string, unknown>> {
  try {
    window.location.href = `/cases/${caseId}`
    return {
      success: true,
      data: { caseId, action: 'navigated' },
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al navegar al caso',
    }
  }
}

/**
 * Navigate to case contacts page
 */
export async function navigateToCaseContacts(caseId: string): Promise<Record<string, unknown>> {
  try {
    window.location.href = `/cases/${caseId}/contacts`
    return {
      success: true,
      data: { caseId, action: 'navigated_to_contacts' },
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al navegar a contactos',
    }
  }
}

/**
 * Test WhatsApp notification
 */
export async function testWhatsAppNotification(mensaje?: string): Promise<Record<string, unknown>> {
  try {
    const response = await wakaiApi.testWhatsApp(mensaje)
    return {
      success: true,
      data: response,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al enviar WhatsApp',
    }
  }
}

/**
 * Main tool handler for ChatKit onClientTool
 */
export async function handleClientTool(toolCall: ClientToolCall): Promise<Record<string, unknown>> {
  const { name, params } = toolCall

  switch (name) {
    case 'get_all_cases':
      return await getAllCases()

    case 'get_case_by_id':
      if (!params.caseId || typeof params.caseId !== 'string') {
        return { success: false, error: 'caseId es requerido' }
      }
      return await getCaseById(params.caseId as string)

    case 'get_all_chat_ids':
      return await getAllChatIds()

    case 'send_notifications':
      return await sendNotificationsToContacts()

    case 'navigate_to_case':
      if (!params.caseId || typeof params.caseId !== 'string') {
        return { success: false, error: 'caseId es requerido' }
      }
      return await navigateToCase(params.caseId as string)

    case 'navigate_to_case_contacts':
      if (!params.caseId || typeof params.caseId !== 'string') {
        return { success: false, error: 'caseId es requerido' }
      }
      return await navigateToCaseContacts(params.caseId as string)

    default:
      return {
        success: false,
        error: `Herramienta desconocida: ${name}`,
      }
  }
}
