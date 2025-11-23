// API service for Wakai backend
import type {
  ConversationsResponse,
  ChatIdsResponse,
  ConversationByChatIdResponse,
  SendNotificationsResponse,
  CasesResponse,
  SingleCaseResponse,
  ContactScoringResponse,
} from '@/types/backend'

const API_BASE_URL = 'https://wakai-backend.josebmxfredes.workers.dev'

// WhatsApp notification
export interface WhatsAppNotificationResponse {
  success: boolean
  message: string
  lambdaStatus: number
  sendError: string | null
  [key: string]: unknown
}

export interface CaseReportPerson {
  nombre: string
  sexo?: string
  direccion?: string
  comuna?: string
  region?: string
  confirmacionAsistencia?: string
  dudasOSolicitudes?: string
  datosAdicionalesEntregados?: string
  alertasAgente?: string
  observacionesContacto?: string
}

export interface CaseReport {
  nuc: string
  fechaHoraMediacion?: string
  materia?: string
  tipoSesion?: string
  solicitante?: CaseReportPerson
  solicitado?: CaseReportPerson
  datosAdicionales?: Record<string, string | number>
}

export interface CaseReportResponse {
  success: boolean
  reporte?: CaseReport
  error?: string
}

class WakaiApiService {
  private baseUrl: string

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl
  }

  // Health check
  async healthCheck(): Promise<{ status: string; service: string; timestamp: string }> {
    const response = await fetch(`${this.baseUrl}/`)
    if (!response.ok) {
      throw new Error(`Health check failed: ${response.statusText}`)
    }
    return response.json()
  }

  // Get all conversations
  async getAllConversations(): Promise<ConversationsResponse> {
    const response = await fetch(`${this.baseUrl}/api/conversations`)
    if (!response.ok) {
      throw new Error(`Failed to fetch conversations: ${response.statusText}`)
    }
    return response.json()
  }

  // Get all chat IDs
  async getChatIds(): Promise<ChatIdsResponse> {
    const response = await fetch(`${this.baseUrl}/api/chat-ids`)
    if (!response.ok) {
      throw new Error(`Failed to fetch chat IDs: ${response.statusText}`)
    }
    return response.json()
  }

  // Get conversation by chat ID
  async getConversationByChatId(chatId: string): Promise<ConversationByChatIdResponse> {
    const response = await fetch(`${this.baseUrl}/api/conversations/${chatId}`)
    if (!response.ok) {
      throw new Error(`Failed to fetch conversation for chat ID ${chatId}: ${response.statusText}`)
    }
    return response.json()
  }

  // Send notifications (trigger manual)
  async sendNotifications(): Promise<SendNotificationsResponse> {
    const response = await fetch(`${this.baseUrl}/api/send-notifications`, {
      method: 'POST',
    })
    if (!response.ok) {
      throw new Error(`Failed to send notifications: ${response.statusText}`)
    }
    return response.json()
  }

  // Test Telegram (debug)
  async testTelegram(): Promise<unknown> {
    const response = await fetch(`${this.baseUrl}/api/test-telegram`, {
      method: 'POST',
    })
    if (!response.ok) {
      throw new Error(`Failed to test Telegram: ${response.statusText}`)
    }
    return response.json()
  }

  // Test WhatsApp (debug)
  async testWhatsApp(mensaje?: string): Promise<WhatsAppNotificationResponse> {
    const response = await fetch(`${this.baseUrl}/api/wsp-notification`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mensaje: mensaje || '' }),
    })
    if (!response.ok) {
      throw new Error(`Failed to test WhatsApp: ${response.statusText}`)
    }
    return response.json()
  }

  // Test Outbound Call (debug)
  async testOutboundCall(caseNuc: string | number): Promise<unknown> {
    const response = await fetch(`${this.baseUrl}/ai-tools/outbound-call`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ caseNuc: caseNuc }),
    })
    if (!response.ok) {
      throw new Error(`Failed to test Outbound Call: ${response.statusText}`)
    }
    return response.json()
  }

  async getCaseReport(nuc: string): Promise<CaseReportResponse> {
    const response = await fetch(`${this.baseUrl}/api/case-report/${nuc}`)
    const data = await response.json()
    return data
  }

  // Get all cases
  async getAllCases(): Promise<CasesResponse> {
    const response = await fetch(`${this.baseUrl}/api/cases`)
    if (!response.ok) {
      throw new Error(`Failed to fetch cases: ${response.statusText}`)
    }
    return response.json()
  }

  // Get single case by NUC
  async getCaseByNuc(caseNuc: string | number): Promise<SingleCaseResponse> {
    const response = await fetch(`${this.baseUrl}/api/case/${caseNuc}`)
    if (!response.ok) {
      throw new Error(`Failed to fetch case ${caseNuc}: ${response.statusText}`)
    }
    return response.json()
  }

  // Get contact scoring for a case
  async getContactScoring(caseNuc: string | number): Promise<ContactScoringResponse> {
    const response = await fetch(`${this.baseUrl}/api/contact-scoring/${caseNuc}`)
    if (!response.ok) {
      throw new Error(`Failed to fetch contact scoring for case ${caseNuc}: ${response.statusText}`)
    }
    return response.json()
  }
}

// Export singleton instance
export const wakaiApi = new WakaiApiService()

// Export class for custom instances
export { WakaiApiService }
