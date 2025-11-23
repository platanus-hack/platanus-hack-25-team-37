import { createClient } from "@supabase/supabase-js";
import { Env, UserCaseRow, VoiceSummaryRow } from "./types";
import { v4 as uuidv4 } from "uuid";

export function getDatabase(env: Env) {
  // Extraer URL y key de Supabase
  const supabaseUrl = env.SUPABASE_URL;
  const supabaseKey = env.SUPABASE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      "SUPABASE_URL and SUPABASE_KEY must be configured. Use 'wrangler secret put SUPABASE_URL' and 'wrangler secret put SUPABASE_KEY'"
    );
  }

  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  return supabase;
}

export async function getTodaysCases(
  supabase: ReturnType<typeof createClient>
) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const { data, error } = await supabase
    .from("mediation_cases")
    .select(
      "caseNuc, applicantFullName, respondentFullName, sessionDate, centerAddress, applicantMobile, respondentMobile"
    )
    .gte("sessionDate", today.toISOString())
    .lt("sessionDate", tomorrow.toISOString())
    .not("sessionDate", "is", null)
    .order("sessionDate", { ascending: true });

  if (error) {
    throw new Error(`Error fetching cases: ${error.message}`);
  }

  return data || [];
}

export async function getConversations(
  supabase: ReturnType<typeof createClient>
) {
  // Traer todas las conversaciones
  const { data: conversations, error: convErr } = await supabase
    .from("conversations")
    .select("id, phone_number, created_at, updated_at, status")
    .order("updated_at", { ascending: false });

  if (convErr) {
    throw new Error(`Error fetching conversations: ${convErr.message}`);
  }
  if (!conversations || conversations.length === 0) return [];

  // Para cada conversación, buscar el mensaje más reciente
  const listado = await Promise.all(
    conversations.map(async (conv) => {
      const { data: messages } = await supabase
        .from("messages")
        .select("message_content, sender, created_at")
        .eq("conversation_id", conv.id)
        .order("created_at", { ascending: false })
        .limit(1);
      const lastMessage = messages && messages.length ? messages[0] : null;
      return {
        id: conv.id,
        phone_number: conv.phone_number,
        status: conv.status,
        created_at: conv.created_at,
        updated_at: conv.updated_at,
        last_message: lastMessage ? lastMessage.message_content : "",
        last_sender: lastMessage ? lastMessage.sender : "",
        last_message_at: lastMessage ? lastMessage.created_at : "",
        tieneMensajes: !!lastMessage,
      };
    })
  );
  return listado;
}

export async function getChatIds(supabase: ReturnType<typeof createClient>) {
  const { data, error } = await supabase
    .from("conversations")
    .select("phone_number")
    .order("phone_number", { ascending: true });

  if (error) {
    throw new Error(`Error fetching chat IDs: ${error.message}`);
  }

  // Obtener phone_numbers únicos
  const uniqueIds = [
    ...new Set((data || []).map((item) => item.phone_number).filter(Boolean)),
  ];

  return uniqueIds;
}

export async function getConversationByChatId(
  supabase: ReturnType<typeof createClient>,
  chatId: string
) {
  // Buscar la conversación por phone_number
  const { data: conversations, error: convError } = await supabase
    .from("conversations")
    .select("id, phone_number, created_at, updated_at, status")
    .eq("phone_number", chatId)
    .limit(1);

  if (convError) {
    throw new Error(
      `Error fetching conversation by chat ID: ${convError.message}`
    );
  }

  if (!conversations || conversations.length === 0) {
    return null;
  }

  const conversation = conversations[0];

  // Obtener todos los mensajes de esta conversación
  const { data: messages, error: messagesError } = await supabase
    .from("messages")
    .select("id, message_content, sender, message_sid, created_at")
    .eq("conversation_id", conversation.id)
    .order("created_at", { ascending: false });

  if (messagesError) {
    throw new Error(`Error fetching messages: ${messagesError.message}`);
  }

  return {
    id: conversation.id,
    phone_number: conversation.phone_number,
    chatId: conversation.phone_number,
    status: conversation.status,
    created_at: conversation.created_at,
    updated_at: conversation.updated_at,
    messages: (messages || []).map((msg) => ({
      id: msg.id,
      content: msg.message_content,
      sender: msg.sender,
      message_sid: msg.message_sid,
      created_at: msg.created_at,
    })),
    message_count: messages?.length || 0,
  };
}

/**
 * Fetches a user case from the "users" table by caseNuc
 */
export async function fetchUserCaseByCaseNuc(
  supabase: ReturnType<typeof createClient>,
  caseNuc: string | number
): Promise<UserCaseRow | null> {
  // Convert caseNuc to number for query
  const caseNucNum =
    typeof caseNuc === "string" ? parseInt(caseNuc, 10) : caseNuc;

  if (isNaN(caseNucNum)) {
    throw new Error("Invalid caseNuc: must be a valid number");
  }

  // Fetch the user case with all required fields
  const { data: userCase, error } = await supabase
    .from("users")
    .select("*")
    .eq("caseNuc", caseNucNum)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      // No rows returned
      return null;
    }
    throw new Error(`Error fetching user case: ${error.message}`);
  }

  if (!userCase) {
    return null;
  }

  // Type assertion for the row
  return userCase as unknown as UserCaseRow;
}

/**
 * Inserts a voice summary into the voice_summaries table
 */
export async function insertVoiceSummary(
  supabase: ReturnType<typeof createClient>,
  summary: VoiceSummaryRow
): Promise<VoiceSummaryRow> {
  const { data, error } = await supabase
    .from("voice_summaries")
    .insert({
      caseNuc: summary.caseNuc,
      conversation_id: summary.conversation_id,
      last_message: summary.last_message,
      summary: summary.summary,
      payload: summary.payload,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Error inserting voice summary: ${error.message}`);
  }

  return data as unknown as VoiceSummaryRow;
}
