"use client";


import { useEffect, useState } from "react";
import {
  Upload,
  Image as ImageIcon,
  ScanSearch,
  Sparkles,
  LoaderCircle,
  CheckCircle2,
  AlertCircle,
  X,
  Boxes,
  ChevronRight,
} from "lucide-react";


const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];


export default function VisionPage() {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);


  useEffect(() => {
    if (!file) {
      setPreviewUrl("");
      return;
    }


    const url = URL.createObjectURL(file);
    setPreviewUrl(url);


    return () => URL.revokeObjectURL(url);
  }, [file]);


  function handleFileChange(event) {
    const selected = event.target.files?.[0] || null;


    setError("");
    setResult(null);


    if (!selected) {
      setFile(null);
      return;
    }


    if (!ACCEPTED_TYPES.includes(selected.type)) {
      setFile(null);
      setError("Gunakan gambar JPEG, PNG, atau WebP.");
      event.target.value = "";
      return;
    }


    if (selected.size > MAX_UPLOAD_BYTES) {
      setFile(null);
      setError("Ukuran gambar maksimum 8 MiB.");
      event.target.value = "";
      return;
    }


    setFile(selected);
  }


  async function runDetection() {
    if (!file || loading) return;


    setLoading(true);
    setError("");
    setResult(null);


    try {
      const form = new FormData();
      form.append("image", file);


      const response = await fetch("/api/vision/detect", {
        method: "POST",
        body: form,
        cache: "no-store",
      });


      const data = await response.json();


      if (!response.ok) {
        throw new Error(
          data.error || data.detail || "Deteksi gagal."
        );
      }


      if (
        !Array.isArray(data.detections) ||
        typeof data.count !== "number"
      ) {
        throw new Error(
          "Format hasil deteksi dari backend tidak sesuai."
        );
      }


      setResult(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan saat memproses gambar."
      );
    } finally {
      setLoading(false);
    }
  }


  function resetDetection() {
    if (loading) return;


    setFile(null);
    setResult(null);
    setError("");


    const input = document.getElementById("vision-image");
    if (input) input.value = "";
  }


  return (
    <main className="min-h-screen bg-background px-4 pb-20 pt-28 text-foreground sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">


        {/* Page heading */}
        <header className="mb-10">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-500">
            <Sparkles size={14} />
            COMPUTER VISION LAB
          </div>


          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
                Object Detection
                <span className="text-emerald-500">.</span>
              </h1>


              <p className="mt-4 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
                Analisis gambar menggunakan YOLO dan lihat objek,
                tingkat confidence, serta lokasi deteksinya.
              </p>
            </div>


            <div className="flex w-fit items-center gap-2 rounded-xl border border-border bg-card px-4 py-3">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-50" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
              </span>
              <span className="text-sm text-muted-foreground">
                YOLO Detection
              </span>
            </div>
          </div>
        </header>


        {/* Upload and preview */}
        <section className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">


          {/* Upload panel */}
          <div className="rounded-2xl border border-border bg-card p-5 sm:p-7">
            <div className="mb-6 flex items-start gap-3">
              <div className="rounded-xl bg-emerald-500/10 p-3 text-emerald-500">
                <Upload size={22} />
              </div>


              <div>
                <h2 className="text-lg font-semibold">
                  Upload image
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Pilih gambar untuk dianalisis.
                </p>
              </div>
            </div>


            <label
              htmlFor="vision-image"
              className="group flex min-h-52 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-border bg-background/60 px-5 py-8 text-center transition hover:border-emerald-500/60 hover:bg-emerald-500/5"
            >
              <div className="mb-4 rounded-2xl border border-border bg-card p-4 transition group-hover:border-emerald-500/30">
                <ImageIcon size={30} className="text-emerald-500" />
              </div>


              <span className="font-medium">
                {file
                  ? "Ganti gambar"
                  : "Klik untuk memilih gambar"}
              </span>


              <span className="mt-2 text-sm text-muted-foreground">
                atau pilih file dari komputer
              </span>


              <span className="mt-4 rounded-full border border-border px-3 py-1 text-xs text-muted-foreground">
                JPEG · PNG · WebP · Maks. 8 MiB
              </span>
            </label>


            <input
              id="vision-image"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileChange}
              disabled={loading}
              className="sr-only"
            />


            {file && (
              <div className="mt-4 flex items-center gap-3 rounded-xl border border-border p-3">
                <div className="rounded-lg bg-emerald-500/10 p-2 text-emerald-500">
                  <ImageIcon size={20} />
                </div>


                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {file.name}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {(file.size / (1024 * 1024)).toFixed(2)} MiB
                  </p>
                </div>


                <button
                  type="button"
                  onClick={resetDetection}
                  disabled={loading}
                  aria-label="Hapus gambar"
                  className="rounded-lg p-2 text-muted-foreground transition hover:bg-muted hover:text-foreground"
                >
                  <X size={18} />
                </button>
              </div>
            )}


            {error && (
              <div
                role="alert"
                className="mt-4 flex gap-2 rounded-xl border border-red-500/20 bg-red-500/5 p-3 text-sm text-red-500"
              >
                <AlertCircle size={18} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}


            <button
              type="button"
              onClick={runDetection}
              disabled={!file || loading}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 px-5 py-3.5 font-semibold text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {loading ? (
                <>
                  <LoaderCircle
                    size={19}
                    className="animate-spin"
                  />
                  Sedang menganalisis...
                </>
              ) : (
                <>
                  <ScanSearch size={19} />
                  Deteksi objek
                  <ChevronRight size={18} />
                </>
              )}
            </button>


            <p className="mt-3 text-center text-xs leading-5 text-muted-foreground">
              Hasil bergantung pada kemampuan model dan kualitas gambar.
            </p>
          </div>


          {/* Preview / annotated result */}
          <div className="flex min-h-[360px] flex-col overflow-hidden rounded-2xl border border-border bg-card">
            <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-4 sm:px-6">
              <div>
                <h2 className="font-semibold">
                  {result ? "Detection output" : "Image preview"}
                </h2>
                <p className="mt-1 text-xs text-muted-foreground">
                  {result
                    ? "Visualisasi bounding box"
                    : "Gambar sebelum diproses"}
                </p>
              </div>


              {result && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-500">
                  <CheckCircle2 size={14} />
                  Selesai
                </span>
              )}
            </div>


            <div className="flex flex-1 items-center justify-center bg-black/[0.025] p-4 dark:bg-white/[0.015] sm:p-6">
              {result?.annotated_image ? (
                <img
                  src={result.annotated_image}
                  alt="Hasil deteksi YOLO dengan bounding box"
                  className="max-h-[520px] w-full rounded-lg object-contain"
                />
              ) : previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Preview gambar yang akan dianalisis"
                  className="max-h-[520px] w-full rounded-lg object-contain"
                />
              ) : (
                <div className="flex max-w-xs flex-col items-center text-center">
                  <div className="mb-4 rounded-2xl border border-border bg-background p-5">
                    <ScanSearch
                      size={38}
                      className="text-muted-foreground"
                    />
                  </div>
                  <p className="font-medium">
                    Belum ada gambar
                  </p>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    Gambar yang kamu pilih dan hasil deteksi akan
                    ditampilkan di area ini.
                  </p>
                </div>
              )}
            </div>


            <div className="border-t border-border px-5 py-3 sm:px-6">
              <p className="truncate text-xs text-muted-foreground">
                {file ? file.name : "Menunggu gambar dipilih"}
              </p>
            </div>
          </div>
        </section>


        {/* Detection summary */}
        {result && (
          <section className="mt-8 space-y-6">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
              <div>
                <div className="mb-2 flex items-center gap-2 text-sm text-emerald-500">
                  <CheckCircle2 size={17} />
                  Analysis completed
                </div>


                <h2 className="text-2xl font-bold tracking-tight">
                  Hasil deteksi
                </h2>


                <p className="mt-2 text-sm text-muted-foreground">
                  Ringkasan prediksi dari gambar yang dianalisis.
                </p>
              </div>


              <button
                type="button"
                onClick={resetDetection}
                className="w-fit rounded-xl border border-border px-4 py-2.5 text-sm font-medium transition hover:bg-muted"
              >
                Analisis gambar lain
              </button>
            </div>


            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-border bg-card p-5">
                <div className="mb-4 flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Objek terdeteksi
                  </span>
                  <Boxes size={19} className="text-emerald-500" />
                </div>


                <p className="text-3xl font-bold tabular-nums">
                  {result.count}
                </p>


                <p className="mt-2 text-xs text-muted-foreground">
                  Total prediksi bounding box
                </p>
              </div>


              <div className="rounded-2xl border border-border bg-card p-5">
                <div className="mb-4 flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Model
                  </span>
                  <Sparkles size={19} className="text-emerald-500" />
                </div>


                <p className="break-all text-xl font-bold">
                  {result.model || "YOLO"}
                </p>


                <p className="mt-2 text-xs text-muted-foreground">
                  Model yang digunakan backend
                </p>
              </div>


              <div className="rounded-2xl border border-border bg-card p-5">
                <div className="mb-4 flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Confidence threshold
                  </span>
                  <ScanSearch size={19} className="text-emerald-500" />
                </div>


                <p className="text-3xl font-bold tabular-nums">
                  {typeof result.confidence_threshold === "number"
                    ? `${(result.confidence_threshold * 100).toFixed(0)}%`
                    : "—"}
                </p>


                <p className="mt-2 text-xs text-muted-foreground">
                  Ambang minimum inferensi
                </p>
              </div>
            </div>


            <div className="overflow-hidden rounded-2xl border border-border bg-card">
              <div className="flex flex-col gap-1 border-b border-border px-5 py-4 sm:px-6">
                <h3 className="font-semibold">
                  Daftar objek
                </h3>
                <p className="text-sm text-muted-foreground">
                  Label, confidence, dan koordinat bounding box.
                </p>
              </div>


              {result.count === 0 ? (
                <div className="px-6 py-12 text-center">
                  <ScanSearch
                    size={30}
                    className="mx-auto mb-3 text-muted-foreground"
                  />
                  <p className="font-medium">
                    Tidak ada objek terdeteksi
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Coba gambar lain dengan objek yang lebih jelas.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[620px] text-left text-sm">
                    <thead className="bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
                      <tr>
                        <th className="px-5 py-4 font-medium">#</th>
                        <th className="px-5 py-4 font-medium">Label</th>
                        <th className="px-5 py-4 font-medium">
                          Confidence
                        </th>
                        <th className="px-5 py-4 font-medium">
                          Bounding box (x1, y1, x2, y2)
                        </th>
                      </tr>
                    </thead>


                    <tbody className="divide-y divide-border">
                      {result.detections.map((item, index) => (
                        <tr
                          key={`${item.class_id}-${index}`}
                          className="transition hover:bg-muted/30"
                        >
                          <td className="px-5 py-4 text-muted-foreground">
                            {index + 1}
                          </td>


                          <td className="px-5 py-4">
                            <span className="inline-flex items-center gap-2 font-medium">
                              <span className="h-2 w-2 rounded-full bg-emerald-500" />
                              {item.label}
                            </span>
                          </td>


                          <td className="px-5 py-4">
                            <div className="flex min-w-28 items-center gap-3">
                              <span className="w-16 tabular-nums">
                                {(
                                  typeof item.confidence_percent === "number"
                                    ? item.confidence_percent
                                    : item.confidence * 100
                                ).toFixed(2)}%
                              </span>


                              <div className="h-1.5 w-16 overflow-hidden rounded-full bg-muted">
                                <div
                                  className="h-full rounded-full bg-emerald-500"
                                  style={{
                                    width: `${Math.max(
                                      0,
                                      Math.min(
                                        100,
                                        typeof item.confidence_percent === "number"
                                          ? item.confidence_percent
                                          : item.confidence * 100
                                      )
                                    )}%`,
                                  }}
                                />
                              </div>
                            </div>
                          </td>


                          <td className="px-5 py-4 font-mono text-xs text-muted-foreground">
                            {item.bbox_xyxy.x1.toFixed(0)},{" "}
                            {item.bbox_xyxy.y1.toFixed(0)},{" "}
                            {item.bbox_xyxy.x2.toFixed(0)},{" "}
                            {item.bbox_xyxy.y2.toFixed(0)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}


              <div className="border-t border-border px-5 py-3 text-xs text-muted-foreground sm:px-6">
                Hasil merupakan prediksi model, bukan jaminan identifikasi objek yang benar.
              </div>
            </div>
          </section>
        )}


        <footer className="mt-12 border-t border-border pt-5">
          <p className="text-center text-xs text-muted-foreground">
            Computer Vision Lab · Powered by YOLO
          </p>
        </footer>
      </div>
    </main>
  );
}
