// Data mapper to transform backend data to frontend types
import type { BackendConversation, BackendCase } from '@/types/backend'
import type { ContactAttempt, MediationCase } from '@/types'

// Map backend source to frontend channel
function mapSourceToChannel(source: BackendConversation['source']): ContactAttempt['channel'] {
  switch (source) {
    case 'whatsapp':
      return 'whatsapp'
    case 'phone_call':
      return 'phone'
    case 'mail':
      return 'email'
    case 'telegram':
      return 'telegram'
    default:
      return 'whatsapp'
  }
}

// Extract participant name from conversation text
function extractParticipantName(conversation: string | undefined | null, userType: string): string {
  // Check if conversation exists and is a string
  if (!conversation || typeof conversation !== 'string') {
    return userType === 'applicant' ? 'Solicitante' : 'Demandado'
  }

  // Try to extract name from conversation text
  // Pattern: "Hola [Name]" or similar
  const nameMatch = conversation.match(/Hola\s+([A-Z][a-zá-úñ]+(?:\s+[A-Z][a-zá-úñ]+)?)/i)
  if (nameMatch && nameMatch[1]) {
    return nameMatch[1]
  }

  // Fallback to generic name based on userType
  return userType === 'applicant' ? 'Solicitante' : 'Demandado'
}

// Determine result from conversation content
function determineContactResult(conversation: string | undefined | null): ContactAttempt['result'] {
  // Check if conversation exists and is a string
  if (!conversation || typeof conversation !== 'string') {
    return 'successful' // Default for missing conversation
  }

  const lowerConv = conversation.toLowerCase()

  if (lowerConv.includes('confirmó') || lowerConv.includes('asistencia confirmada')) {
    return 'successful'
  }
  if (lowerConv.includes('no respondió') || lowerConv.includes('sin respuesta')) {
    return 'no-answer'
  }
  if (lowerConv.includes('rechazó') || lowerConv.includes('declinó')) {
    return 'declined'
  }
  if (lowerConv.includes('programado') || lowerConv.includes('agendado')) {
    return 'scheduled'
  }
  if (lowerConv.includes('positiva') || lowerConv.includes('dispuesto')) {
    return 'positive-disposition'
  }
  if (lowerConv.includes('rechazó') || lowerConv.includes('negó')) {
    return 'refused'
  }

  return 'successful' // Default
}

// Extract notes from conversation
function extractNotes(conversation: string | undefined | null): string {
  // Check if conversation exists and is a string
  if (!conversation || typeof conversation !== 'string') {
    return 'Sin información disponible'
  }

  // Remove timestamp if present
  const withoutTimestamp = conversation.replace(/\[\d{1,2}:\d{2}\s+[AP]M\]\s*/i, '')

  // Remove "Nexo Bot:" prefix if present
  const withoutBot = withoutTimestamp.replace(/Nexo Bot:\s*/i, '')

  // Truncate if too long
  if (withoutBot.length > 200) {
    return withoutBot.substring(0, 200) + '...'
  }

  return withoutBot
}

// Map backend conversation to contact attempt
export function mapConversationToContactAttempt(conv: BackendConversation): ContactAttempt {
  const participantName = extractParticipantName(conv.conversation, conv.userType)

  // Ensure caseNuc is valid before converting to string
  const caseNuc = conv.caseNuc != null ? String(conv.caseNuc) : 'unknown'

  return {
    id: `${conv.caseNuc ?? 'unknown'}-${conv.chatId ?? 'unknown'}-${conv.created_at ?? Date.now()}`,
    caseId: caseNuc,
    channel: mapSourceToChannel(conv.source),
    date: new Date(conv.created_at),
    result: determineContactResult(conv.conversation),
    notes: extractNotes(conv.conversation),
    participantName,
  }
}

// Map backend conversations to contact attempts
export function mapConversationsToContactAttempts(
  conversations: BackendConversation[]
): ContactAttempt[] {
  // Filter out conversations with invalid caseNuc before mapping
  return conversations
    .filter(conv => conv.caseNuc != null && !isNaN(Number(conv.caseNuc)))
    .map(mapConversationToContactAttempt)
}

// Group conversations by case number to create mediation cases
export function mapConversationsToMediationCases(
  conversations: BackendConversation[]
): MediationCase[] {
  // Filter out conversations with invalid caseNuc
  const validConversations = conversations.filter(
    conv => conv.caseNuc != null && !isNaN(Number(conv.caseNuc))
  )

  // Group by caseNuc
  const caseMap = new Map<number, BackendConversation[]>()

  validConversations.forEach(conv => {
    const existing = caseMap.get(conv.caseNuc) || []
    caseMap.set(conv.caseNuc, [...existing, conv])
  })

  // Convert to mediation cases
  const cases: MediationCase[] = []

  for (const [caseNuc, convs] of caseMap.entries()) {
    // Skip if caseNuc is invalid
    if (caseNuc == null) continue

    // Find applicant and respondent conversations
    const applicantConv = convs.find(c => c.userType === 'applicant')
    const respondentConv = convs.find(c => c.userType === 'respondent')

    // Extract participant names
    const participantName = applicantConv
      ? extractParticipantName(applicantConv.conversation, 'applicant')
      : 'Solicitante'
    const participantName2 = respondentConv
      ? extractParticipantName(respondentConv.conversation, 'respondent')
      : undefined

    // Get most recent conversation date
    const sortedConvs = convs.sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
    const mostRecentConv = sortedConvs[0]

    // Skip if no valid conversation found
    if (!mostRecentConv) continue

    // Determine status based on conversation content
    let status: MediationCase['status'] = 'scheduled'
    const allConvText = convs
      .map(c =>
        c.conversation && typeof c.conversation === 'string' ? c.conversation.toLowerCase() : ''
      )
      .filter(Boolean)
      .join(' ')
    if (allConvText.includes('completado') || allConvText.includes('finalizado')) {
      status = 'completed'
    } else if (allConvText.includes('en progreso') || allConvText.includes('en curso')) {
      status = 'in-progress'
    } else if (allConvText.includes('cancelado')) {
      status = 'cancelled'
    }

    // Determine emotional status
    let emotionalStatus: MediationCase['emotionalStatus'] = 'neutral'
    if (allConvText.includes('cooperativo') || allConvText.includes('dispuesto')) {
      emotionalStatus = 'cooperative'
    } else if (allConvText.includes('resistente') || allConvText.includes('rechazó')) {
      emotionalStatus = 'resistant'
    } else if (allConvText.includes('inseguro') || allConvText.includes('dudoso')) {
      emotionalStatus = 'unsure'
    }

    // Ensure caseNuc is valid before converting to string
    const caseId = String(caseNuc)

    cases.push({
      id: caseId,
      participantName,
      participantName2,
      rut: '00.000.000-0', // Not available from backend
      rut2: '00.000.000-0', // Not available from backend
      relationshipType: 'parents', // Default, not available from backend
      mediationType: 'visitation', // Default, not available from backend
      mediationDate: new Date(mostRecentConv.created_at),
      status,
      description: extractNotes(mostRecentConv.conversation),
      emotionalStatus,
      createdAt: new Date(
        sortedConvs[sortedConvs.length - 1]?.created_at ?? mostRecentConv.created_at
      ),
      updatedAt: new Date(mostRecentConv.created_at),
    })
  }

  return cases
}

// Map backend case to frontend mediation case
export function mapBackendCaseToMediationCase(backendCase: BackendCase): MediationCase {
  // Determine relationship type
  let relationshipType: MediationCase['relationshipType'] = 'other'
  const relType = backendCase.relationshipType?.toLowerCase() || ''
  if (relType.includes('padre') || relType.includes('parent')) {
    relationshipType = 'parents'
  } else if (relType.includes('cuidador') || relType.includes('caregiver')) {
    relationshipType = 'caregivers'
  } else if (relType.includes('tutor') || relType.includes('guardian')) {
    relationshipType = 'guardians'
  }

  // Determine mediation type
  let mediationType: MediationCase['mediationType'] = 'other'
  const medType = backendCase.mediationType?.toLowerCase() || ''
  if (medType.includes('visita') || medType.includes('visitation')) {
    mediationType = 'visitation'
  } else if (medType.includes('comunicación') || medType.includes('communication')) {
    mediationType = 'communication'
  } else if (medType.includes('cuidado') || medType.includes('childcare')) {
    mediationType = 'childcare'
  } else if (medType.includes('convivencia') || medType.includes('coexistence')) {
    mediationType = 'coexistence'
  }

  // Determine status (default to scheduled)
  const status: MediationCase['status'] = 'scheduled'

  // Determine emotional status based on confirmations
  let emotionalStatus: MediationCase['emotionalStatus'] = 'neutral'
  const applicantConfirmation = backendCase.applicantAttendanceConfirmation?.toLowerCase() || ''
  const respondentConfirmation = backendCase.respondentAttendanceConfirmation?.toLowerCase() || ''

  if (
    applicantConfirmation.includes('confirmó') ||
    respondentConfirmation.includes('confirmó') ||
    applicantConfirmation.includes('sí') ||
    respondentConfirmation.includes('sí')
  ) {
    emotionalStatus = 'cooperative'
  } else if (
    applicantConfirmation.includes('no') ||
    respondentConfirmation.includes('no') ||
    applicantConfirmation.includes('rechazó') ||
    respondentConfirmation.includes('rechazó')
  ) {
    emotionalStatus = 'resistant'
  } else if (
    applicantConfirmation.includes('duda') ||
    respondentConfirmation.includes('duda') ||
    applicantConfirmation.includes('inseguro') ||
    respondentConfirmation.includes('inseguro')
  ) {
    emotionalStatus = 'unsure'
  }

  // Build description from available data
  const descriptionParts = []
  if (backendCase.subject) {
    descriptionParts.push(`Materia: ${backendCase.subject}`)
  }
  if (backendCase.sessionType) {
    descriptionParts.push(`Tipo de sesión: ${backendCase.sessionType}`)
  }
  if (backendCase.applicantQuestionsRequests) {
    descriptionParts.push(`Solicitudes: ${backendCase.applicantQuestionsRequests}`)
  }
  const description = descriptionParts.length > 0
    ? descriptionParts.join(' | ')
    : 'Caso de mediación familiar'

  return {
    id: String(backendCase.caseNuc),
    participantName: backendCase.applicantFullName,
    participantName2: backendCase.respondentFullName,
    rut: backendCase.applicantRut || '00.000.000-0',
    rut2: backendCase.respondentRut,
    relationshipType,
    mediationType,
    mediationDate: new Date(backendCase.sessionDate),
    status,
    description,
    emotionalStatus,
    createdAt: backendCase.created_at ? new Date(backendCase.created_at) : new Date(),
    updatedAt: backendCase.updated_at ? new Date(backendCase.updated_at) : new Date(),
  }
}

// Map array of backend cases to frontend mediation cases
export function mapBackendCasesToMediationCases(backendCases: BackendCase[]): MediationCase[] {
  return backendCases.map(mapBackendCaseToMediationCase)
}
