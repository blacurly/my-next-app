
export async function POST(request) {
  try {
    const body = await request.json();
    const question = body.question?.trim();

    if (!question) {
      return Response.json(
        { error: "Pertanyaan tidak boleh kosong." },
        { status: 400 }
      );
    }

    const response = await fetch("http://127.0.0.1:8000/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ question }),
      cache: "no-store",
    });

    const data = await response.json();

    if (!response.ok) {
      return Response.json(
        { error: data.detail || "Gagal memproses pertanyaan." },
        { status: response.status }
      );
    }

    return Response.json(data);
  } catch (error) {
    console.error("Chat API error:", error);

    return Response.json(
      { error: "Tidak dapat terhubung ke layanan chatbot." },
      { status: 502 }
    );
  }
}
