export interface MediationCase {
  centerId?: bigint;
  centerAddress?: string;
  centerEmail?: string;
  centerPhone?: bigint;
  centerCommune?: string;
  centerRegion?: string;
  caseNuc: bigint;
  caseCount?: bigint;
  matterType?: string;
  isVif?: boolean;
  sessionType?: string;
  sessionDate?: string;
  applicantFullName?: string;
  applicantMobile?: bigint;
  applicantEmail?: string;
  applicantAddress?: string;
  applicantCommune?: string;
  applicantRegion?: string;
  applicantGender?: string;
  applicantBirthDate?: string;
  respondentFullName?: string;
  respondentMobile?: bigint;
  respondentEmail?: string;
  respondentAddress?: string;
  respondentCommune?: string;
  respondentRegion?: string;
  respondentGender?: string;
  respondentBirthDate?: string;
  smsStatusApplicant?: string;
  smsStatusRespondent?: string;
  emailStatusApplicant?: string;
  emailStatusRespondent?: string;
  pensionActual?: string;
  promedioSueldoLiquido?: string;
  regimenVisitasActual?: string;
  cuidadoPersonalActual?: string;
}

export interface InteractionData {
  caseNuc: bigint;
  created_at: string;
  source: string;
  conversation?: string;
  userType: string;
}

export interface OutputAIReport {
  caseNuc: bigint;
  created_at: string;
  output?: string;
}

export interface AppointmentData {
  nombre: string;
  fecha: string;
  hora: string;
  lugar: string;
}

export interface TelegramMessage {
  chatId: string;
  appointmentData: AppointmentData;
}

export interface Env {
  SUPABASE_URL: string;
  SUPABASE_KEY: string;
  TELEGRAM_API_URL: string;
  OPENAI_API_KEY: string;
  ELEVENLABS_API_KEY?: string;
  ELEVENLABS_AGENT_ID?: string;
  ELEVENLABS_AGENT_PHONE_ID?: string;
  CENTER_NAME?: string;
}

export interface ChatKitSession {
  id: string;
  object: string;
  model: string;
  modalities: string[];
  instructions: string;
  voice: string;
  turn_detection: object;
  input_audio_format: string;
  output_audio_format: string;
  input_audio_transcription: object | null;
  tool_choice: string;
  temperature: number;
  max_response_output_tokens: string | number;
  client_secret: {
    value: string;
    expires_at: number;
  };
  tools: any[];
}

/**
 * Type for a row from the "users" table (mediation cases)
 */
export interface UserCaseRow {
  centerId?: number;
  centerAddress?: string;
  centerEmail?: string;
  centerPhone?: number;
  centerCommune?: string;
  centerRegion?: string;
  caseNuc: number;
  caseCount?: number;
  matterType?: string;
  isVif?: boolean;
  sessionType?: string;
  sessionDate?: string;
  sessionDate_txt?: string;
  applicantFullName?: string;
  applicantMobile?: string | number;
  applicantEmail?: string;
  applicantAddress?: string;
  applicantCommune?: string;
  applicantRegion?: string;
  applicantGender?: string;
  applicantBirthDate?: string;
  respondentFullName?: string;
  respondentMobile?: string | number;
  respondentEmail?: string;
  respondentAddress?: string;
  respondentCommune?: string;
  respondentRegion?: string;
  respondentGender?: string;
  respondentBirthDate?: string;
  smsStatusApplicant?: string;
  smsStatusRespondent?: string;
  emailStatusApplicant?: string;
  emailStatusRespondent?: string;
  pensionActual?: number;
  promedioSueldoLiquido?: string;
  regimenVisitasActual?: string;
  cuidadoPersonalActual?: string;
}

/**
 * Request body for outbound call endpoint
 */
export interface OutboundCallRequest {
  caseNuc: number | string;
  overrideToNumber?: string;
}

/**
 * Dynamic variables for ElevenLabs conversation
 */
export interface ElevenLabsDynamicVariables {
  requested_name: string;
  requester_name: string;
  center_name: string;
  hearing_date: string;
  hearing_location: string;
  case_id: string;
  session_type?: string;
  [key: string]: string | undefined;
}

/**
 * ElevenLabs outbound call payload
 */
export interface ElevenLabsOutboundCallPayload {
  agent_id: string;
  agent_phone_number_id: string;
  to_number: string;
  conversation_initiation_client_data: {
    conversation_config_override?: {
      agent?: {
        language?: string;
      };
    };
    custom_llm_extra_body?: Record<string, unknown>;
    user_id?: string;
    source_info?: Record<string, unknown>;
    dynamic_variables: ElevenLabsDynamicVariables;
  };
}

/**
 * Success response for outbound call
 */
export interface OutboundCallSuccessResponse {
  status: "CALL_TRIGGERED";
  caseNuc: number | string;
  toNumber: string;
  elevenlabs: unknown;
}

/**
 * Error response for outbound call
 */
export interface OutboundCallErrorResponse {
  status: "CALL_FAILED";
  error: "ELEVENLABS_ERROR";
  details: {
    status: number;
    body: unknown;
  };
}

/**
 * Transcript entry from ElevenLabs webhook
 */
export interface ElevenLabsTranscriptEntry {
  role: "agent" | "user";
  message: string | null;
  [key: string]: unknown;
}

/**
 * Analysis object from ElevenLabs webhook
 */
export interface ElevenLabsAnalysis {
  call_successful?: string;
  transcript_summary?: string | null;
  call_summary_title?: string;
  [key: string]: unknown;
}

/**
 * Phone call metadata from ElevenLabs webhook
 */
export interface ElevenLabsPhoneCallMetadata {
  direction?: string;
  external_number?: string;
  [key: string]: unknown;
}

/**
 * Metadata object from ElevenLabs webhook
 */
export interface ElevenLabsMetadata {
  phone_call?: ElevenLabsPhoneCallMetadata;
  [key: string]: unknown;
}

/**
 * ElevenLabs post-call webhook payload
 */
export interface ElevenLabsPostCallWebhook {
  data?: {
    agent_id?: string;
    conversation_id: string;
    status?: string;
    user_id?: string | null;
    transcript?: ElevenLabsTranscriptEntry[];
    metadata?: ElevenLabsMetadata;
    analysis?: ElevenLabsAnalysis;
    conversation_initiation_client_data?: {
      dynamic_variables?: Record<string, unknown> & {
        case_id?: string | number;
      };
      [key: string]: unknown;
    };
    has_audio?: boolean;
    has_user_audio?: boolean;
    has_response_audio?: boolean;
    [key: string]: unknown;
  };
  // Legacy format support (direct fields at root level)
  agent_id?: string;
  conversation_id?: string;
  status?: string;
  user_id?: string | null;
  transcript?: ElevenLabsTranscriptEntry[];
  metadata?: ElevenLabsMetadata;
  analysis?: ElevenLabsAnalysis;
  conversation_initiation_client_data?: {
    dynamic_variables?: Record<string, unknown> & {
      case_id?: string | number;
    };
    [key: string]: unknown;
  };
  has_audio?: boolean;
  has_user_audio?: boolean;
  has_response_audio?: boolean;
  [key: string]: unknown;
}

/**
 * Voice summary row in Supabase
 */
export interface VoiceSummaryRow {
  id?: string;
  caseNuc: number | string;
  conversation_id: string;
  last_message: string | null;
  summary: string | null;
  payload: Record<string, unknown>;
  created_at?: string;
}

/**
 * Success response for post-call webhook
 */
export interface PostCallWebhookSuccessResponse {
  status: "stored";
  conversation_id: string;
  case_nuc: number | string;
}

/**
 * Error response for post-call webhook
 */
export interface PostCallWebhookErrorResponse {
  status: "error_storing";
  reason: "missing_case_id" | "db_error" | "parsing_error";
  details: string;
}
