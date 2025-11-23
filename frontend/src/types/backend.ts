// Backend API types for Wakai backend integration

export interface BackendConversation {
  caseNuc: number
  source: 'whatsapp' | 'mail' | 'phone_call' | 'telegram'
  userType: 'applicant' | 'respondent'
  conversation?: string | null
  created_at: string
  chatId: string
}

export interface ConversationsResponse {
  success: boolean
  data: BackendConversation[]
  count: number
}

export interface BackendCase {
  caseNuc: number
  sessionDate: string
  applicantFullName: string
  applicantRut?: string
  applicantAddress?: string
  applicantCommune?: string
  applicantRegion?: string
  applicantPhone?: string
  applicantEmail?: string
  applicantSex?: string
  respondentFullName?: string
  respondentRut?: string
  respondentAddress?: string
  respondentCommune?: string
  respondentRegion?: string
  respondentPhone?: string
  respondentEmail?: string
  respondentSex?: string
  subject?: string
  sessionType?: string
  relationshipType?: string
  mediationType?: string
  applicantAttendanceConfirmation?: string
  respondentAttendanceConfirmation?: string
  applicantQuestionsRequests?: string
  respondentQuestionsRequests?: string
  applicantAdditionalDataProvided?: string
  respondentContactObservations?: string
  agentAlerts?: string
  created_at?: string
  updated_at?: string
}

export interface CasesResponse {
  success: boolean
  cases: BackendCase[]
  count: number
}

export interface SingleCaseResponse {
  success: boolean
  case: BackendCase
}

export interface ChatIdsResponse {
  success: boolean
  data: string[]
  count: number
}

export interface ConversationByChatIdResponse {
  success: boolean
  chatId: string
  data: BackendConversation[]
  count: number
}

export interface NotificationResult {
  caseNuc: string
  recipient: string
  chatId: string
  sent: boolean
}

export interface SendNotificationsResponse {
  success: boolean
  message: string
  casesCount: number
  notificationsSent: number
  notificationsFailed: number
  results: NotificationResult[]
}

export interface ContactScoringMetrics {
  totalAttempts: number
  successRate: number
  channelsUsed: number
  totalChannels: number
  lastContact: string
  contactsByChannel: {
    whatsapp: number
    telefono: number
    telegram: number
  }
  sentiment: 'Positive' | 'Neutral' | 'Negative'
  scoreGeneral: number
  scoreBreakdown: {
    tasaExito: {
      weight: number
      points: number
    }
    diversidadCanales: {
      weight: number
      points: number
    }
    recencia: {
      weight: number
      points: number
    }
    cantidadIntentos: {
      weight: number
      points: number
    }
  }
  insights?: string[]
}

export interface ContactScoringResponse {
  success: boolean
  caseNuc: string
  metrics: ContactScoringMetrics
}
