import {
  UserCaseRow,
  ElevenLabsDynamicVariables,
  ElevenLabsOutboundCallPayload,
  Env,
} from "./types";

/**
 * Builds the center name from location data or uses env var fallback
 */
export function buildCenterName(userCase: UserCaseRow, env: Env): string {
  // First try env var
  if (env.CENTER_NAME) {
    return env.CENTER_NAME;
  }

  // Build from location data
  const parts: string[] = [];
  if (userCase.centerCommune) {
    parts.push(userCase.centerCommune);
  }
  if (userCase.centerRegion) {
    parts.push(userCase.centerRegion);
  }

  if (parts.length > 0) {
    return `Centro de Mediación ${parts.join(", ")}`;
  }

  // Fallback
  return "Centro de Mediación";
}

/**
 * Builds the full hearing location string
 */
export function buildHearingLocation(userCase: UserCaseRow): string {
  const parts: string[] = [];
  if (userCase.centerAddress) parts.push(userCase.centerAddress);
  if (userCase.centerCommune) parts.push(userCase.centerCommune);
  if (userCase.centerRegion) parts.push(userCase.centerRegion);

  return parts.length > 0 ? parts.join(", ") : "ubicación por confirmar";
}

/**
 * Normalizes a phone number to E.164 format if needed
 * Assumes Chilean numbers (starting with 9) and adds +56 prefix if missing
 */
export function normalizePhoneNumber(
  phone: string | number | null | undefined
): string | null {
  if (!phone) {
    return null;
  }

  let phoneStr = String(phone).trim().replace(/\s+/g, "");

  // Remove any non-digit characters except +
  phoneStr = phoneStr.replace(/[^\d+]/g, "");

  // If it starts with +, assume it's already in E.164
  if (phoneStr.startsWith("+")) {
    return phoneStr;
  }

  // If it starts with 56, add +
  if (phoneStr.startsWith("56")) {
    return `+${phoneStr}`;
  }

  // If it starts with 9 (Chilean mobile), add +56
  if (phoneStr.startsWith("9") && phoneStr.length >= 8) {
    return `+56${phoneStr}`;
  }

  // If it's a valid number, try to add +56
  if (/^\d{8,15}$/.test(phoneStr)) {
    return `+56${phoneStr}`;
  }

  // Return as-is if we can't normalize
  return phoneStr;
}

/**
 * Builds dynamic variables object for ElevenLabs from user case data
 */
export function buildDynamicVariables(
  userCase: UserCaseRow,
  env: Env
): ElevenLabsDynamicVariables {
  const centerName = buildCenterName(userCase, env);
  const hearingLocation = buildHearingLocation(userCase);
  const hearingDate = userCase.sessionDate_txt;

  const variables: ElevenLabsDynamicVariables = {
    requested_name: userCase.respondentFullName || "el solicitado",
    requester_name: userCase.applicantFullName || "el solicitante",
    center_name: centerName,
    hearing_date: hearingDate || "fecha por confirmar",
    hearing_location: hearingLocation,
    case_id: String(userCase.caseNuc),
  };

  if (userCase.sessionType) {
    variables.session_type = userCase.sessionType;
  }

  // Add mediation type if available
  if (userCase.matterType) {
    variables.mediation_type = userCase.matterType;
  }

  return variables;
}

/**
 * Calls ElevenLabs outbound call API
 */
export async function callElevenLabsOutbound(
  payload: ElevenLabsOutboundCallPayload,
  apiKey: string
): Promise<{ status: number; body: unknown }> {
  const response = await fetch(
    "https://api.elevenlabs.io/v1/convai/twilio/outbound-call",
    {
      method: "POST",
      headers: {
        "xi-api-key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    }
  );

  let body: unknown;
  const contentType = response.headers.get("content-type");

  if (contentType && contentType.includes("application/json")) {
    try {
      body = await response.json();
    } catch {
      body = await response.text();
    }
  } else {
    body = await response.text();
  }

  return {
    status: response.status,
    body,
  };
}

/**
 * Builds the complete ElevenLabs outbound call payload
 */
export function buildElevenLabsPayload(
  userCase: UserCaseRow,
  toNumber: string,
  env: Env
): ElevenLabsOutboundCallPayload {
  if (!env.ELEVENLABS_AGENT_ID || !env.ELEVENLABS_AGENT_PHONE_ID) {
    throw new Error(
      "ELEVENLABS_AGENT_ID and ELEVENLABS_AGENT_PHONE_ID must be set"
    );
  }

  const dynamicVariables = buildDynamicVariables(userCase, env);

  return {
    agent_id: env.ELEVENLABS_AGENT_ID,
    agent_phone_number_id: env.ELEVENLABS_AGENT_PHONE_ID,
    to_number: toNumber,
    conversation_initiation_client_data: {
      dynamic_variables: dynamicVariables,
    },
  };
}
