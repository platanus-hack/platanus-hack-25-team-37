import { Hono } from "hono";
import { cors } from "hono/cors";
import {
  Env,
  OutboundCallRequest,
  ElevenLabsPostCallWebhook,
  VoiceSummaryRow,
} from "./types";
import {
  getDatabase,
  getConversations,
  getChatIds,
  getConversationByChatId,
  fetchUserCaseByCaseNuc,
  insertVoiceSummary,
} from "./db";
import { createChatKitSession, refreshChatKitSession } from "./chatkit";
import {
  normalizePhoneNumber,
  buildElevenLabsPayload,
  callElevenLabsOutbound,
} from "./elevenlabs";

const app = new Hono<{ Bindings: Env }>();

// CORS
app.use("/*", cors());

// Health check
app.get("/", (c) => {
  return c.json({
    status: "ok",
    service: "wakai-backend",
    timestamp: new Date().toISOString(),
  });
});

// Get all conversations
app.get("/api/conversations", async (c) => {
  try {
    // Validar que las variables de entorno estén configuradas
    if (!c.env.SUPABASE_URL || !c.env.SUPABASE_KEY) {
      return c.json(
        {
          success: false,
          error: "Database configuration missing",
          message:
            "SUPABASE_URL and SUPABASE_KEY must be configured. Use 'wrangler secret put' to set them.",
        },
        500
      );
    }

    const supabase = getDatabase(c.env);
    const conversations = await getConversations(supabase);

    return c.json({
      success: true,
      data: conversations,
      count: conversations.length,
    });
  } catch (error) {
    console.error("Error fetching conversations:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return c.json(
      {
        success: false,
        error: "Failed to fetch conversations",
        message: errorMessage,
        details:
          process.env.ENVIRONMENT === "development" ? String(error) : undefined,
      },
      500
    );
  }
});

// Get all chat IDs
app.get("/api/chat-ids", async (c) => {
  try {
    if (!c.env.SUPABASE_URL || !c.env.SUPABASE_KEY) {
      return c.json(
        {
          success: false,
          error: "Database configuration missing",
          message:
            "SUPABASE_URL and SUPABASE_KEY must be configured. Use 'wrangler secret put' to set them.",
        },
        500
      );
    }

    const supabase = getDatabase(c.env);
    const chatIds = await getChatIds(supabase);

    return c.json({
      success: true,
      data: chatIds,
      count: chatIds.length,
    });
  } catch (error) {
    console.error("Error fetching chat IDs:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return c.json(
      {
        success: false,
        error: "Failed to fetch chat IDs",
        message: errorMessage,
      },
      500
    );
  }
});

// Get conversation by chat ID
app.get("/api/conversations/:chatId", async (c) => {
  try {
    if (!c.env.SUPABASE_URL || !c.env.SUPABASE_KEY) {
      return c.json(
        {
          success: false,
          error: "Database configuration missing",
          message:
            "SUPABASE_URL and SUPABASE_KEY must be configured. Use 'wrangler secret put' to set them.",
        },
        500
      );
    }

    const chatId = c.req.param("chatId");
    const supabase = getDatabase(c.env);
    const conversation = await getConversationByChatId(supabase, chatId);

    if (!conversation) {
      return c.json(
        {
          success: false,
          error: "Conversation not found",
          message: `No conversation found for chat ID: ${chatId}`,
        },
        404
      );
    }

    return c.json({
      success: true,
      chatId,
      data: conversation,
      message_count: conversation.message_count,
    });
  } catch (error) {
    console.error("Error fetching conversation by chat ID:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return c.json(
      {
        success: false,
        error: "Failed to fetch conversation",
        message: errorMessage,
      },
      500
    );
  }
});

// Debug endpoint para probar Telegram directamente
app.post("/api/test-telegram", async (c) => {
  try {
    const { sendTelegramMessage, formatAppointmentData } = await import(
      "./telegram"
    );

    const appointmentData = formatAppointmentData(
      "Juan Pérez Test",
      new Date().toISOString(),
      "Centro de Mediación Test"
    );

    const sent = await sendTelegramMessage(
      c.env.TELEGRAM_API_URL,
      "973106061",
      appointmentData
    );

    return c.json({
      success: sent,
      message: sent
        ? "Telegram message sent successfully"
        : "Failed to send Telegram message",
      appointmentData,
      telegramApiUrl: c.env.TELEGRAM_API_URL,
    });
  } catch (error) {
    console.error("Error in test-telegram:", error);
    return c.json(
      {
        success: false,
        error: "Failed to test Telegram",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      500
    );
  }
});

// ============================================
// Simple Chat Endpoint (OpenAI Direct)
// ============================================

app.post("/api/chat", async (c) => {
  try {
    if (!c.env.OPENAI_API_KEY) {
      return c.json(
        {
          success: false,
          error: "OpenAI API key not configured",
        },
        500
      );
    }

    let body;
    try {
      body = await c.req.json();
    } catch (error) {
      return c.json(
        {
          success: false,
          error: "Invalid JSON in request body",
          message: error instanceof Error ? error.message : "Unknown error",
        },
        400
      );
    }

    const messages = body.messages || [];

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${c.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `Eres el Asistente Wakai, un asistente AI especializado en mediación familiar en Chile.

Tu rol es ayudar a los usuarios a:
- Consultar casos de mediación familiar
- Ver información de contactos y llamadas
- Navegar a casos específicos
- Enviar notificaciones a participantes
- Proporcionar insights y recomendaciones basadas en los datos

Siempre mantén un tono profesional, empático y respetuoso.
Cuando uses las herramientas, explica claramente qué estás haciendo.
Si los datos muestran casos sensibles, mantén la confidencialidad.`,
          },
          ...messages,
        ],
        temperature: 0.8,
        max_tokens: 1000,
        tools: [
          {
            type: "function",
            function: {
              name: "get_all_cases",
              description:
                "Obtiene todos los casos de mediación de la base de datos",
            },
          },
          {
            type: "function",
            function: {
              name: "get_case_by_id",
              description: "Obtiene un caso específico por su ID",
              parameters: {
                type: "object",
                properties: {
                  caseId: {
                    type: "string",
                    description: "ID del caso a buscar",
                  },
                },
                required: ["caseId"],
              },
            },
          },
          {
            type: "function",
            function: {
              name: "get_all_chat_ids",
              description: "Obtiene todos los IDs de chat disponibles",
            },
          },
          {
            type: "function",
            function: {
              name: "send_notifications",
              description: "Envía notificaciones a los contactos pendientes",
            },
          },
          {
            type: "function",
            function: {
              name: "navigate_to_case",
              description: "Navega a la página de detalles de un caso",
              parameters: {
                type: "object",
                properties: {
                  caseId: {
                    type: "string",
                    description: "ID del caso al que navegar",
                  },
                },
                required: ["caseId"],
              },
            },
          },
          {
            type: "function",
            function: {
              name: "navigate_to_case_contacts",
              description: "Navega a la página de contactos de un caso",
              parameters: {
                type: "object",
                properties: {
                  caseId: {
                    type: "string",
                    description: "ID del caso",
                  },
                },
                required: ["caseId"],
              },
            },
          },
        ],
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenAI API error: ${response.status} ${error}`);
    }

    const data = (await response.json()) as {
      choices?: Array<{
        message?: {
          content?: string;
          function_call?: any;
          tool_calls?: Array<any>;
        };
      }>;
    };

    if (
      !data.choices ||
      !Array.isArray(data.choices) ||
      data.choices.length === 0
    ) {
      throw new Error("Invalid response from OpenAI API: no choices found");
    }

    const choice = data.choices[0];

    if (!choice || !choice.message) {
      throw new Error("Invalid response from OpenAI API: no message in choice");
    }

    // Handle tool calls (new API format)
    if (choice.message.tool_calls && choice.message.tool_calls.length > 0) {
      return c.json({
        tool_calls: choice.message.tool_calls,
      });
    }

    // Handle function calls (legacy format for backward compatibility)
    if (choice.message.function_call) {
      return c.json({
        function_call: choice.message.function_call,
      });
    }

    return c.json({
      message: choice.message.content || "",
    });
  } catch (error) {
    console.error("Error in chat endpoint:", error);
    return c.json(
      {
        success: false,
        error: "Failed to process chat message",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      500
    );
  }
});

// ============================================
// ChatKit Endpoints (Legacy - Not Used)
// ============================================

// Start a new ChatKit session
app.post("/api/chatkit/start", async (c) => {
  try {
    if (!c.env.OPENAI_API_KEY) {
      return c.json(
        {
          success: false,
          error: "OpenAI API key not configured",
          message: "Please set OPENAI_API_KEY secret in Cloudflare Workers",
        },
        500
      );
    }

    const session = await createChatKitSession(c.env.OPENAI_API_KEY);

    return c.json({
      client_secret: session.client_secret.value,
      expires_at: session.client_secret.expires_at,
    });
  } catch (error) {
    console.error("Error starting ChatKit session:", error);
    return c.json(
      {
        success: false,
        error: "Failed to start ChatKit session",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      500
    );
  }
});

// Refresh ChatKit session token
app.post("/api/chatkit/refresh", async (c) => {
  try {
    if (!c.env.OPENAI_API_KEY) {
      return c.json(
        {
          success: false,
          error: "OpenAI API key not configured",
          message: "Please set OPENAI_API_KEY secret in Cloudflare Workers",
        },
        500
      );
    }

    let body;
    try {
      body = await c.req.json();
    } catch (error) {
      return c.json(
        {
          success: false,
          error: "Invalid JSON in request body",
          message: error instanceof Error ? error.message : "Unknown error",
        },
        400
      );
    }

    const currentClientSecret = body.currentClientSecret;

    if (!currentClientSecret) {
      return c.json(
        {
          success: false,
          error: "Missing currentClientSecret",
          message: "currentClientSecret is required in request body",
        },
        400
      );
    }

    const session = await refreshChatKitSession(
      c.env.OPENAI_API_KEY,
      currentClientSecret
    );

    return c.json({
      client_secret: session.client_secret.value,
      expires_at: session.client_secret.expires_at,
    });
  } catch (error) {
    console.error("Error refreshing ChatKit session:", error);
    return c.json(
      {
        success: false,
        error: "Failed to refresh ChatKit session",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      500
    );
  }
});

// Endpoint para enviar notificación de prueba a Telegram (chatId fijo) con llamado previo a lambda
app.post("/api/telegram-notification", async (c) => {
  const lambdaUrl =
    "https://ktesy5mgppvxglcxrkzf6hu4bu0mudwn.lambda-url.us-east-1.on.aws/";
  let lambdaOk = false;
  let lambdaStatus = 0,
    lambdaError = "";
  try {
    const lambdaResp = await fetch(lambdaUrl, { method: "POST" });
    lambdaStatus = lambdaResp.status;
    lambdaOk = lambdaResp.ok;
    if (!lambdaOk) lambdaError = await lambdaResp.text();
  } catch (err) {
    lambdaOk = false;
    lambdaError = String(err);
  }
  if (!lambdaOk) {
    return c.json(
      {
        success: false,
        error: "Lambda call failed",
        details: lambdaError,
        lambdaStatus,
      },
      502
    );
  }

  // Enviar mensaje de Telegram al chatId FIJO
  const chatId = "973106061";
  let sent = false;
  let sendError = "";
  try {
    const { sendTelegramMessage, formatAppointmentData } = await import(
      "./telegram"
    );
    const mensaje = (await c.req.json())?.mensaje || "Test mensaje Telegram";
    const appointmentData = formatAppointmentData(
      "Contacto Prueba Telegram",
      new Date().toISOString(),
      "Centro de Mediación Telegram"
    );
    appointmentData.lugar += ` | ${mensaje}`;
    sent = await sendTelegramMessage(
      c.env.TELEGRAM_API_URL,
      chatId,
      appointmentData
    );
  } catch (err) {
    sendError = String(err);
    sent = false;
  }

  return c.json(
    {
      success: sent,
      chatId,
      message: sent
        ? "Telegram notification sent successfully"
        : "Failed to send Telegram notification",
      lambdaStatus,
      sendError: sendError || undefined,
    },
    sent ? 200 : 500
  );
});

app.post("/api/wsp-notification", async (c) => {
  // Llama la Lambda AWS
  const lambdaUrl =
    "https://ktesy5mgppvxglcxrkzf6hu4bu0mudwn.lambda-url.us-east-1.on.aws/";
  let lambdaOk = false;
  let lambdaStatus = 0,
    lambdaError = "";
  try {
    const lambdaResp = await fetch(lambdaUrl, { method: "POST" });
    lambdaStatus = lambdaResp.status;
    lambdaOk = lambdaResp.ok;
    if (!lambdaOk) lambdaError = await lambdaResp.text();
  } catch (err) {
    lambdaOk = false;
    lambdaError = String(err);
  }
  if (!lambdaOk) {
    return c.json(
      {
        success: false,
        error: "Lambda call failed",
        details: lambdaError,
        lambdaStatus,
      },
      502
    );
  }

  // Simular envío WhatsApp
  let sent = true; // true = éxito simulado
  let sendError = "";
  try {
    const body = (await c.req.json()) || {};
    const mensaje = body.mensaje || "Test mensaje WhatsApp";
    const chatId = body.chatId || "973106061";
    console.log(`[WSP] Mensaje a ${chatId}: ${mensaje}`);
    // Aquí iría integración real en el futuro
  } catch (err) {
    sent = false;
    sendError = String(err);
  }

  return c.json(
    {
      success: sent,
      message: sent
        ? "WhatsApp notification sent successfully"
        : "Failed to send WhatsApp notification",
      lambdaStatus,
      sendError: sendError || undefined,
    },
    sent ? 200 : 500
  );
});

app.get("/api/case-report/:caseNuc", async (c) => {
  try {
    const caseNuc = c.req.param("caseNuc");
    const supabase = getDatabase(c.env);
    const { data: cases, error } = await supabase
      .from("users")
      .select("*")
      .eq("caseNuc", caseNuc)
      .limit(1);

    if (error) {
      return c.json({ success: false, error: error.message }, 500);
    }
    if (!cases || !cases.length) {
      return c.json({ success: false, error: "Caso no encontrado" }, 404);
    }
    const mc = cases[0];
    const reporte = {
      nuc: mc.caseNuc?.toString() || "",
      fechaHoraMediacion: mc.sessionDate || "",
      materia: mc.matterType || "",
      tipoSesion: mc.sessionType || "",
      solicitante: {
        nombre: mc.applicantFullName || "",
        sexo: mc.applicantGender || "",
        direccion: mc.applicantAddress || "",
        comuna: mc.applicantCommune || "",
        region: mc.applicantRegion || "",
        confirmacionAsistencia: "",
        dudasOSolicitudes: "",
        datosAdicionalesEntregados: "",
        alertasAgente: "",
      },
      solicitado: {
        nombre: mc.respondentFullName || "",
        sexo: mc.respondentGender || "",
        direccion: mc.respondentAddress || "",
        comuna: mc.respondentCommune || "",
        region: mc.respondentRegion || "",
        confirmacionAsistencia: "",
        dudasOSolicitudes: "",
        observacionesContacto: "",
      },
      datosAdicionales: {},
    };
    if (mc.pensionActual)
      reporte.datosAdicionales.pensionActual = mc.pensionActual;
    if (mc.promedioSueldoLiquido)
      reporte.datosAdicionales.promedioSueldoLiquido = mc.promedioSueldoLiquido;
    if (mc.regimenVisitasActual)
      reporte.datosAdicionales.regimenVisitasActual = mc.regimenVisitasActual;
    if (mc.cuidadoPersonalActual)
      reporte.datosAdicionales.cuidadoPersonalActual = mc.cuidadoPersonalActual;
    return c.json({ success: true, reporte });
  } catch (error) {
    return c.json({ success: false, error: String(error) }, 500);
  }
});

app.get("/api/case/:caseNuc", async (c) => {
  try {
    const caseNuc = c.req.param("caseNuc");
    const supabase = getDatabase(c.env);
    const { data: cases, error } = await supabase
      .from("users")
      .select("*")
      .eq("caseNuc", caseNuc)
      .limit(1);
    if (error) {
      return c.json({ success: false, error: error.message }, 500);
    }
    if (!cases || !cases.length) {
      return c.json({ success: false, error: "Caso no encontrado" }, 404);
    }
    return c.json({ success: true, case: cases[0] });
  } catch (error) {
    return c.json({ success: false, error: String(error) }, 500);
  }
});

app.get("/api/cases", async (c) => {
  try {
    const supabase = getDatabase(c.env);
    const { data: cases, error } = await supabase
      .from("users")
      .select("*")
      .order("caseNuc", { ascending: true });

    if (error) {
      return c.json({ success: false, error: error.message }, 500);
    }
    if (!cases || !cases.length) {
      return c.json({ success: false, error: "No cases found" }, 404);
    }
    return c.json({ success: true, cases });
  } catch (error) {
    return c.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unhandled error",
      },
      500
    );
  }
});

// AI Tools endpoints - public (no authentication for demo)
const aiTools = new Hono<{ Bindings: Env }>();

/**
 * POST /ai-tools/outbound-call
 *
 * Triggers an ElevenLabs outbound call for a mediation case.
 *
 * Request body:
 *   {
 *     "caseNuc": number | string,      // required
 *     "overrideToNumber"?: string      // optional; if provided, use this instead of respondentMobile
 *   }
 *
 * Returns:
 *   - 200: { "status": "CALL_TRIGGERED", "caseNuc": ..., "toNumber": ..., "elevenlabs": ... }
 *   - 404: { "error": "CASE_NOT_FOUND" }
 *   - 502: { "status": "CALL_FAILED", "error": "ELEVENLABS_ERROR", "details": {...} }
 *   - 500: { "error": "INTERNAL_ERROR" }
 */
aiTools.post("/outbound-call", async (c) => {
  try {
    // Parse and validate request body
    const body = await c.req.json<OutboundCallRequest>();

    if (!body.caseNuc) {
      return c.json({ error: "CASE_NOT_FOUND" }, 404);
    }

    // Fetch user case from Supabase
    const supabase = getDatabase(c.env);
    const userCase = await fetchUserCaseByCaseNuc(supabase, body.caseNuc);

    if (!userCase) {
      return c.json({ error: "CASE_NOT_FOUND" }, 404);
    }

    // Resolve destination phone number
    let toNumber: string | null = null;

    if (body.overrideToNumber && body.overrideToNumber.trim() !== "") {
      toNumber = normalizePhoneNumber(body.overrideToNumber);
    } else {
      toNumber = normalizePhoneNumber(userCase.respondentMobile);
    }

    if (!toNumber) {
      return c.json(
        {
          status: "CALL_FAILED",
          error: "ELEVENLABS_ERROR",
          details: {
            status: 400,
            body: { message: "No valid phone number found" },
          },
        },
        502
      );
    }

    // Check required environment variables
    if (!c.env.ELEVENLABS_API_KEY) {
      console.error("ELEVENLABS_API_KEY not set");
      return c.json({ error: "INTERNAL_ERROR" }, 500);
    }

    // Build ElevenLabs payload
    const payload = buildElevenLabsPayload(userCase, toNumber, c.env);

    // Call ElevenLabs API
    const elevenlabsResponse = await callElevenLabsOutbound(
      payload,
      c.env.ELEVENLABS_API_KEY
    );

    // Handle response
    if (elevenlabsResponse.status >= 200 && elevenlabsResponse.status < 300) {
      // Success
      return c.json(
        {
          status: "CALL_TRIGGERED",
          caseNuc: body.caseNuc,
          toNumber,
          elevenlabs: elevenlabsResponse.body,
        },
        200
      );
    } else {
      // ElevenLabs API error
      console.error("ElevenLabs API error:", {
        status: elevenlabsResponse.status,
        body: elevenlabsResponse.body,
      });

      return c.json(
        {
          status: "CALL_FAILED",
          error: "ELEVENLABS_ERROR",
          details: {
            status: elevenlabsResponse.status,
            body: elevenlabsResponse.body,
          },
        },
        502
      );
    }
  } catch (error) {
    console.error("Error in outbound-call endpoint:", error);
    return c.json({ error: "INTERNAL_ERROR" }, 500);
  }
});

/**
 * POST /ai-tools/elevenlabs/post-call
 *
 * Webhook endpoint that receives post-call data from ElevenLabs
 * and stores it in the voice_summaries table.
 *
 * Request body: ElevenLabsPostCallWebhook (full webhook payload)
 *
 * Returns:
 *   - 200: { "status": "stored", "conversation_id": "...", "case_nuc": ... }
 *   - 200: { "status": "error_storing", "reason": "...", "details": "..." }
 *     (Always returns 200 to prevent ElevenLabs from disabling the webhook)
 */
aiTools.post("/elevenlabs/post-call", async (c) => {
  try {
    // Parse webhook body
    const webhook = await c.req.json<ElevenLabsPostCallWebhook>();

    // Handle new format where data is nested under 'data' property
    // Fallback to root level for backward compatibility
    const webhookData = webhook.data || webhook;

    // Extract conversation_id
    const conversationId = webhookData.conversation_id;
    if (!conversationId) {
      console.error("Missing conversation_id in webhook");
      return c.json(
        {
          status: "error_storing",
          reason: "parsing_error",
          details: "Missing conversation_id in webhook",
        },
        200
      );
    }

    // Extract case_id from dynamic_variables
    const caseId =
      webhookData.conversation_initiation_client_data?.dynamic_variables
        ?.case_id;

    if (!caseId) {
      console.error("Missing case_id in webhook dynamic_variables");
      return c.json(
        {
          status: "error_storing",
          reason: "missing_case_id",
          details: "case_id not found in dynamic_variables",
        },
        200
      );
    }

    // Convert case_id to number if possible, otherwise keep as string
    const caseNuc = Number(caseId) || 0;
    if (isNaN(caseNuc)) {
      console.error("Invalid case_id in webhook dynamic_variables");
      return c.json(
        {
          status: "error_storing",
          reason: "invalid_case_id",
          details: "case_id is not a number",
        },
        200
      );
    }

    // Extract summary from analysis
    const summary = webhookData.analysis?.transcript_summary?.trim() || null;

    // Extract last_message from transcript
    let lastMessage: string | null = null;
    if (webhookData.transcript && webhookData.transcript.length > 0) {
      // Find the last entry where role === "agent" and message is not null
      for (let i = webhookData.transcript.length - 1; i >= 0; i--) {
        const entry = webhookData.transcript[i];
        if (entry.role === "agent" && entry.message) {
          lastMessage = entry.message;
          break;
        }
      }

      // Fallback: if no agent message found, use the last non-null message
      if (!lastMessage) {
        for (let i = webhookData.transcript.length - 1; i >= 0; i--) {
          const entry = webhookData.transcript[i];
          if (entry.message) {
            lastMessage = entry.message;
            break;
          }
        }
      }
    }

    // Prepare the voice summary row
    const voiceSummary: VoiceSummaryRow = {
      caseNuc,
      conversation_id: conversationId,
      last_message: lastMessage,
      summary: summary,
      payload: webhook as unknown as Record<string, unknown>,
    };

    // Insert into Supabase
    try {
      const supabase = getDatabase(c.env);
      const inserted = await insertVoiceSummary(supabase, voiceSummary);

      return c.json(
        {
          status: "stored",
          conversation_id: conversationId,
          case_nuc: caseNuc,
        },
        200
      );
    } catch (dbError) {
      console.error("Database error inserting voice summary:", dbError);
      return c.json(
        {
          status: "error_storing",
          reason: "db_error",
          details:
            dbError instanceof Error
              ? dbError.message
              : "Unknown database error",
        },
        200
      );
    }
  } catch (error) {
    console.error("Error processing post-call webhook:", error);
    return c.json(
      {
        status: "error_storing",
        reason: "parsing_error",
        details:
          error instanceof Error ? error.message : "Unknown parsing error",
      },
      200
    );
  }
});

// Mount AI tools routes
app.route("/ai-tools", aiTools);

export default {
  fetch: app.fetch,
};
