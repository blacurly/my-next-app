"use client";

import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";

const CHAT_DATA_NOTICE_VERSION = "v1";

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [consent, setConsent] = useState(false);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Generate the anonymous session ID in the browser, after mounting.
  useEffect(() => {
    if (typeof window !== "undefined" && window.crypto?.randomUUID) {
      setSessionId(window.crypto.randomUUID());
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, loading, isOpen]);

  async function sendMessage(event) {
    event.preventDefault();

    const text = question.trim();

    if (!text || loading) return;

    if (!consent) {
      setError(
        "Silakan baca pemberitahuan dan setujui pengolahan data sebelum memulai percakapan."
      );
      return;
    }

    if (!sessionId) {
      setError(
        "Sesi chat belum siap. Silakan tunggu sebentar, lalu coba kembali."
      );
      return;
    }

    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setQuestion("");
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: text,
          sessionId,
          consent,
          consentNoticeVersion: CHAT_DATA_NOTICE_VERSION,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || data.detail || "Belum bisa memproses pertanyaan."
        );
      }

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.answer || "Maaf, jawaban belum tersedia.",
          sources: Array.isArray(data.sources) ? data.sources : [],
        },
      ]);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Koneksi chatbot bermasalah."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed bottom-5 right-5 z-[100] font-sans">
      {isOpen && (
        <section
          role="dialog"
          aria-label="Chat Virtual Safe Space"
          aria-modal="false"
          className="mb-3 flex h-[min(620px,calc(100dvh-110px))] w-[min(380px,calc(100vw-32px))] flex-col overflow-hidden rounded-2xl border border-[#303033] bg-[#0B0B0C] text-white shadow-2xl"
        >
          {/* Header */}
          <header className="flex shrink-0 items-center gap-3 border-b border-[#303033] bg-[#171719] p-4 text-white">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10 text-xl">
              ♡
            </div>

            <div className="min-w-0 flex-1">
              <h2 className="font-semibold">Virtual Safe Space</h2>
              <p className="text-xs text-gray-400">
                Ruang aman untuk bertanya
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="Tutup chatbot"
              className="rounded-lg px-3 py-2 text-xl text-gray-300 transition hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              ×
            </button>
          </header>

          {/* Conversation */}
          <div
            className="flex-1 space-y-4 overflow-y-auto bg-[#0B0B0C] p-4"
            aria-live="polite"
            aria-relevant="additions"
          >
            {messages.length === 0 && (
              <div className="rounded-2xl border border-[#303033] bg-[#171719] p-4 text-sm leading-6 text-gray-200">
                <p className="mb-2 font-semibold text-white">
                  Halo, kamu boleh mulai dari sini.
                </p>
                <p>
                  Kamu bisa bertanya tentang hak, informasi hukum, atau
                  cara mencari pendampingan. Kamu tidak perlu membagikan
                  nama maupun detail identitas pribadi.
                </p>
              </div>
            )}

            {messages.map((message, index) => (
              <article
                key={`${message.role}-${index}`}
                className={
                  message.role === "user"
                    ? "ml-6 rounded-2xl rounded-br-sm bg-[#262629] p-3 text-white"
                    : "mr-1 rounded-2xl rounded-bl-sm border border-[#303033] bg-[#171719] p-3 text-gray-200"
                }
              >
                <p className="mb-2 text-xs font-semibold text-gray-400">
                  {message.role === "user" ? "Kamu" : "Virtual Safe Space"}
                </p>

                {message.role === "assistant" ? (
                  <div className="break-words text-sm leading-6 text-gray-200 [&_p]:mb-2 [&_p:last-child]:mb-0 [&_strong]:font-semibold [&_strong]:text-white [&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:mb-1 [&_h1]:mb-2 [&_h1]:text-base [&_h1]:font-semibold [&_h1]:text-white [&_h2]:mb-2 [&_h2]:text-base [&_h2]:font-semibold [&_h2]:text-white [&_h3]:mb-1 [&_h3]:font-semibold [&_h3]:text-white [&_a]:text-gray-100 [&_a]:underline">
                    <ReactMarkdown>{message.content}</ReactMarkdown>
                  </div>
                ) : (
                  <p className="whitespace-pre-wrap break-words text-sm leading-6 text-white">
                    {message.content}
                  </p>
                )}

                {message.sources?.length > 0 && (
                  <div className="mt-4 border-t border-[#303033] pt-3">
                    <p className="mb-2 text-xs font-semibold text-gray-400">
                      Referensi
                    </p>

                    <ul className="space-y-2">
                      {message.sources.map((source, sourceIndex) => (
                        <li
                          key={`${source.file || source.title || "source"}-${source.page ?? "na"}-${sourceIndex}`}
                          className="text-xs leading-5 text-gray-300"
                        >
                          <span className="font-medium text-gray-100">
                            {source.title || source.file || "Dokumen referensi"}
                          </span>
                          {source.page != null && (
                            <span className="text-gray-400">
                              {" "}· Halaman {source.page}
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </article>
            ))}

            {loading && (
              <div
                role="status"
                className="mr-8 rounded-2xl border border-[#303033] bg-[#171719] p-3 text-sm text-gray-300"
              >
                <span className="mr-2 inline-block animate-pulse">●</span>
                Sedang menyiapkan jawaban...
              </div>
            )}

            {error && (
              <div
                role="alert"
                className="rounded-xl border border-red-900 bg-red-950/40 p-3 text-sm leading-5 text-red-200"
              >
                {error}
                <button
                  type="button"
                  onClick={() => {
                    setError("");
                    inputRef.current?.focus();
                  }}
                  className="ml-2 underline underline-offset-2"
                >
                  Coba lagi
                </button>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input and data notice */}
          <form
            onSubmit={sendMessage}
            className="shrink-0 border-t border-[#303033] bg-[#111113] p-3"
          >
            <div className="mb-3 rounded-xl border border-[#303033] bg-[#171719] p-3">
              <p className="mb-2 text-xs font-semibold text-white">
                Pemberitahuan pengolahan data
              </p>
              <p className="text-[11px] leading-5 text-gray-300">
                Jika kamu menyetujui, percakapan dapat disimpan dalam bentuk
                yang diminimalkan atau disamarkan untuk evaluasi dan peningkatan
                kualitas chatbot. Hindari menuliskan nama, alamat, nomor telepon,
                atau detail lain yang dapat mengidentifikasi dirimu maupun orang
                lain. Jangan gunakan chatbot ini untuk keadaan darurat. Lihat
                kebijakan privasi Virtual Safe Space untuk informasi mengenai
                tujuan, masa penyimpanan, akses, dan permintaan penghapusan data.
              </p>

              <label className="mt-3 flex cursor-pointer items-start gap-2 text-xs leading-5 text-gray-200">
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(event) => setConsent(event.target.checked)}
                  disabled={loading}
                  className="mt-1 h-4 w-4 shrink-0 accent-white"
                />
                <span>
                  Saya telah membaca pemberitahuan di atas dan menyetujui
                  pengolahan percakapan untuk evaluasi serta peningkatan kualitas
                  chatbot.
                </span>
              </label>
            </div>

            <div className="flex items-end gap-2">
              <label htmlFor="vss-question" className="sr-only">
                Tulis pertanyaan
              </label>

              <textarea
                ref={inputRef}
                id="vss-question"
                value={question}
                onChange={(event) => setQuestion(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    event.currentTarget.form?.requestSubmit();
                  }
                }}
                placeholder="Tulis pertanyaanmu..."
                rows={2}
                maxLength={4000}
                disabled={loading || !consent}
                className="min-w-0 flex-1 resize-none rounded-xl border border-[#303033] bg-[#171719] px-3 py-2 text-sm leading-5 text-white placeholder:text-gray-500 outline-none transition focus:border-gray-500 focus:ring-2 focus:ring-white/10 disabled:cursor-not-allowed disabled:opacity-60"
              />

              <button
                type="submit"
                disabled={loading || !question.trim() || !consent || !sessionId}
                aria-label="Kirim pesan"
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-lg font-semibold text-black transition hover:bg-gray-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#111113] disabled:cursor-not-allowed disabled:opacity-40"
              >
                ↑
              </button>
            </div>

            <p className="mt-2 text-[10px] leading-4 text-gray-500">
              Hindari mengirim identitas atau informasi pribadi yang sensitif.
              Chatbot ini bukan layanan darurat.
            </p>
          </form>
        </section>
      )}

      {/* Floating toggle */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          aria-label={isOpen ? "Tutup ruang chat" : "Buka ruang chat"}
          aria-expanded={isOpen}
          className="flex items-center gap-2 rounded-full border border-[#303033] bg-white px-5 py-4 text-sm font-semibold text-black shadow-lg transition hover:bg-gray-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/30"
        >
          <span aria-hidden="true" className="text-xl">
            {isOpen ? "×" : "♡"}
          </span>
          <span>{isOpen ? "Tutup" : "Butuh bantuan?"}</span>
        </button>
      </div>
    </div>
  );
}
