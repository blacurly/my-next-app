import { createClient as createSupabaseClient } from "@supabase/supabase-js";

let adminClient;

function getAdminClient() {
  if (!adminClient) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SECRET_KEY;

    if (!url || !key) {
      throw new Error("Konfigurasi server Supabase belum lengkap");
    }

    adminClient = createSupabaseClient(url, key, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }

  return adminClient;
}

export function redactText(value) {
  return String(value ?? "")
    .slice(0, 12000)
    .replace(
      /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi,
      "[EMAIL]"
    )
    .replace(
      /(?:\+?62|0)8\d{7,12}\b/g,
      "[NOMOR TELEPON]"
    );
}

export async function saveChatInteraction({
  sessionId,
  question,
  answer,
  sources,
}) {
  const supabase = getAdminClient();

  const { error } = await supabase
    .from("chat_interactions")
    .insert({
      session_id: sessionId,
      question_redacted: redactText(question),
      answer_redacted: redactText(answer),
      sources: Array.isArray(sources) ? sources : [],
      consent_notice_version:
        process.env.CHAT_DATA_NOTICE_VERSION || "v1",
    });

  if (error) {
    throw new Error("Penyimpanan evaluasi chatbot gagal");
  }
}