
import { saveChatInteraction } from "@/lib/chat-data";

export const runtime = "nodejs";

export async function POST(request) {
  try {
    const body = await request.json();

    const question =
      typeof body.question === "string" ? body.question.trim() : "";
    const sessionId = body.sessionId;
    const consent = body.consent;
    const consentNoticeVersion =
      typeof body.consentNoticeVersion === "string"
        ? body.consentNoticeVersion
        : "v1";

    if (!question || question.length > 4000) {
      return Response.json(
        { error: "Pertanyaan tidak valid atau terlalu panjang." },
        { status: 400 }
      );
    }

    if (consent !== true) {
      return Response.json(
        { error: "Persetujuan pemrosesan data diperlukan." },
        { status: 400 }
      );
    }

    const uuidPattern =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

    if (
      typeof sessionId !== "string" ||
      !uuidPattern.test(sessionId)
    ) {
      return Response.json(
        { error: "ID sesi tidak valid." },
        { status: 400 }
      );
    }

    const baseUrl = (
      process.env.FASTAPI_BASE_URL || "http://127.0.0.1:8000"
    ).replace(/\/+$/, "");

    const response = await fetch(`${baseUrl}/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ question }),
      cache: "no-store",
      signal: AbortSignal.timeout(60000),
    });

    let data;

    try {
      data = await response.json();
    } catch {
      return Response.json(
        { error: "Respons layanan chatbot tidak valid." },
        { status: 502 }
      );
    }

    if (!response.ok) {
      return Response.json(
        { error: "Gagal memproses pertanyaan." },
        { status: response.status >= 500 ? 502 : response.status }
      );
    }

    if (typeof data.answer !== "string") {
      return Response.json(
        { error: "Format jawaban chatbot tidak valid." },
        { status: 502 }
      );
    }

    // Simpan interaksi tanpa menggagalkan jawaban jika penyimpanan gagal.
    try {
      await saveChatInteraction({
        sessionId,
        question,
        answer: data.answer,
        sources: Array.isArray(data.sources) ? data.sources : [],
        consentNoticeVersion,
      });
    } catch {
      console.error("Chat interaction storage failed.");
    }

    return Response.json(data);
  } catch (error) {
    if (
      error?.name === "TimeoutError" ||
      error?.name === "AbortError"
    ) {
      return Response.json(
        { error: "Chatbot terlalu lama merespons. Silakan coba lagi." },
        { status: 504 }
      );
    }

    console.error("Chat API request failed.");

    return Response.json(
      { error: "Tidak dapat terhubung ke layanan chatbot." },
      { status: 502 }
    );
  }
}