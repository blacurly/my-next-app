
"use client";

import { useState } from "react";

export default function ChatbotPage() {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function sendMessage(event) {
    event.preventDefault();

    const text = question.trim();
    if (!text || loading) return;

    setMessages((previous) => [
      ...previous,
      { role: "user", content: text },
    ]);
    setQuestion("");
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: text }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Gagal mendapatkan jawaban.");
      }

      setMessages((previous) => [
        ...previous,
        {
          role: "assistant",
          content: data.answer,
          sources: data.sources || [],
        },
      ]);
    } catch (err) {
      setError(err.message || "Terjadi kesalahan.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col px-4 py-8">
      <header className="mb-6">
        <p className="text-sm font-medium text-violet-600">
          Virtual Safe Space
        </p>
        <h1 className="mt-2 text-3xl font-bold">
          Ruang aman untuk bertanya
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          Kamu bisa bertanya tentang hak, informasi hukum, dan akses
          pendampingan. Jawaban AI dapat memiliki keterbatasan.
        </p>
      </header>

      <section
        aria-live="polite"
        className="flex-1 space-y-5 rounded-2xl border border-gray-200 p-4"
      >
        {messages.length === 0 && (
          <div className="rounded-xl bg-gray-50 p-4 text-sm text-gray-700">
            Kamu boleh mulai dengan pertanyaan yang ingin kamu pahami.
            Kamu tidak perlu membagikan nama atau detail identitas pribadi.
          </div>
        )}

        {messages.map((message, index) => (
          <article
            key={index}
            className={
              message.role === "user"
                ? "ml-6 rounded-2xl bg-violet-100 p-4"
                : "mr-4 rounded-2xl bg-gray-50 p-4"
            }
          >
            <p className="mb-2 text-xs font-semibold text-gray-500">
              {message.role === "user" ? "Kamu" : "Virtual Safe Space"}
            </p>

            <p className="whitespace-pre-wrap text-sm leading-7 text-gray-900">
              {message.content}
            </p>

            {message.sources?.length > 0 && (
              <div className="mt-4 border-t border-gray-200 pt-3">
                <p className="mb-2 text-xs font-semibold text-gray-600">
                  Referensi yang ditemukan
                </p>

                <ul className="space-y-2">
                  {message.sources.map((source, sourceIndex) => (
                    <li
                      key={`${source.file}-${source.page}-${sourceIndex}`}
                      className="text-xs text-gray-600"
                    >
                      <span className="font-medium">
                        {source.title}
                      </span>
                      {source.page != null && (
                        <span> — halaman {source.page}</span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </article>
        ))}

        {loading && (
          <p className="text-sm text-gray-500" role="status">
            Sedang menyiapkan jawaban...
          </p>
        )}

        {error && (
          <p role="alert" className="text-sm text-red-600">
            {error}
          </p>
        )}
      </section>

      <form onSubmit={sendMessage} className="mt-4 flex gap-2">
        <label htmlFor="question" className="sr-only">
          Tulis pertanyaan
        </label>

        <input
          id="question"
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          placeholder="Tulis pertanyaanmu..."
          maxLength={4000}
          disabled={loading}
          className="min-w-0 flex-1 rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-violet-500"
        />

        <button
          type="submit"
          disabled={loading || !question.trim()}
          className="rounded-xl bg-violet-600 px-5 py-3 text-sm font-medium text-white hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Kirim
        </button>
      </form>

      <p className="mt-3 text-xs leading-5 text-gray-500">
        Chatbot ini merupakan alat bantu informasi, bukan pengganti
        pendampingan profesional. Jika kamu berada dalam bahaya langsung,
        prioritaskan keselamatanmu dan hubungi layanan darurat atau orang
        tepercaya yang aman dijangkau.
      </p>
    </main>
  );
}
