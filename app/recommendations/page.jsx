"use client";

import { useState } from "react";

const INTERESTS = [
  ["Teknologi dan AI", "technology"],
  ["Data dan analisis", "data"],
  ["Komunitas dan kegiatan sosial", "community"],
  ["Pemberdayaan perempuan", "women_empowerment"],
  ["Lingkungan dan keberlanjutan", "environment"],
  ["Pendidikan dan belajar", "learning"],
  ["Komunikasi dan kepemimpinan", "communication"],
  ["Desain dan kreativitas", "design"],
  ["Karier dan pengembangan diri", "career"],
  ["Menulis dan membaca", "writing"],
];

const SKILLS = [
  ["Literasi digital", "digital_literacy"],
  ["Python dasar", "python_basic"],
  ["Analisis data", "data_analysis"],
  ["Spreadsheet / Excel", "spreadsheet"],
  ["Komunikasi", "communication"],
  ["Kerja sama tim", "teamwork"],
  ["Menulis", "writing"],
  ["Desain", "design"],
  ["Presentasi", "presentation"],
  ["Mengajar", "teaching"],
  ["Organisasi kegiatan", "organization"],
  ["Membaca", "reading"],
  ["Berpikir kritis", "critical_thinking"],
  ["Pemecahan masalah", "problem_solving"],
  ["Saya masih pemula / belum yakin", "beginner"],
];

const HABITS = [
  ["Belajar mandiri", "self_learning"],
  ["Membaca", "reading"],
  ["Konsisten menjalankan rutinitas", "consistency"],
  ["Bekerja dengan orang lain", "teamwork"],
  ["Menjadi relawan", "volunteering"],
  ["Aktivitas luar ruangan", "outdoor_activity"],
  ["Mencoba dan membuat proyek", "problem_solving"],
];

function MultiSelect({ title, options, value, onChange }) {
  function toggle(feature) {
    onChange(value.includes(feature)
      ? value.filter((item) => item !== feature)
      : [...value, feature]);
  }

  return (
    <fieldset className="mb-6 rounded-xl border p-4">
      <legend className="px-2 font-semibold">{title}</legend>
      <div className="grid gap-2 sm:grid-cols-2">
        {options.map(([label, feature]) => (
          <label key={feature} className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={value.includes(feature)}
              onChange={() => toggle(feature)}
            />
            {label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export default function RecommendationsPage() {
  const [interests, setInterests] = useState([]);
  const [skills, setSkills] = useState([]);
  const [habits, setHabits] = useState([]);
  const [availableMinutes, setAvailableMinutes] = useState(30);
  const [difficulty, setDifficulty] = useState("any");
  const [results, setResults] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submitForm(event) {
    event.preventDefault();
    setError("");
    setResults([]);
    setLoading(true);

    try {
      const response = await fetch("/api/recommendations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          interests,
          skills,
          habits,
          available_minutes: Number(availableMinutes),
          preferred_difficulty: difficulty,
          top_n: 5,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || data.detail || "Gagal mendapatkan rekomendasi.");
      }
      setResults(data.recommendations || []);
      if (!data.recommendations?.length) {
        setError("Belum ada rekomendasi. Coba pilih semua tingkat atau periksa katalog aktivitas.");
      }
    } catch (err) {
      setError(err.message || "Terjadi kesalahan saat meminta rekomendasi.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="mb-2 text-3xl font-bold">Rekomendasi Aktivitas</h1>
      <p className="mb-8 text-gray-600">
        Pilih minat, skill, kebiasaan, dan waktu yang tersedia untuk melihat aktivitas
        yang paling sesuai dengan profilmu.
      </p>

      <form onSubmit={submitForm}>
        <MultiSelect title="1. Apa minatmu?" options={INTERESTS}
          value={interests} onChange={setInterests} />
        <MultiSelect title="2. Skill apa yang kamu miliki?" options={SKILLS}
          value={skills} onChange={setSkills} />
        <MultiSelect title="3. Kebiasaan atau pola aktivitas" options={HABITS}
          value={habits} onChange={setHabits} />

        <div className="mb-6 grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-2">
            <span className="font-semibold">Waktu per aktivitas</span>
            <select className="rounded-lg border p-3" value={availableMinutes}
              onChange={(e) => setAvailableMinutes(e.target.value)}>
              <option value={15}>15 menit</option>
              <option value={30}>30 menit</option>
              <option value={45}>45 menit</option>
              <option value={60}>60 menit</option>
              <option value={90}>90 menit atau lebih</option>
            </select>
          </label>

          <label className="flex flex-col gap-2">
            <span className="font-semibold">Tingkat aktivitas</span>
            <select className="rounded-lg border p-3" value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}>
              <option value="beginner">Pemula</option>
              <option value="intermediate">Menengah</option>
              <option value="any">Semua tingkat</option>
            </select>
          </label>
        </div>

        <button disabled={loading} type="submit"
          className="rounded-lg bg-teal-700 px-5 py-3 font-semibold text-white disabled:opacity-60">
          {loading ? "Menghitung rekomendasi..." : "Dapatkan Rekomendasi"}
        </button>
      </form>

      {error && <p role="alert" className="mt-6 rounded-lg bg-red-50 p-4 text-red-800">{error}</p>}

      {results.length > 0 && (
        <section className="mt-10">
          <h2 className="mb-4 text-2xl font-bold">Hasil rekomendasi</h2>
          <div className="grid gap-4">
            {results.map((item) => (
              <article key={item.id} className="rounded-xl border p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <h3 className="text-lg font-semibold">{item.rank}. {item.title}</h3>
                  <span className="rounded-full bg-teal-50 px-3 py-1 font-semibold text-teal-800">
                    Skor {item.score}/100
                  </span>
                </div>
                <p className="my-2 text-gray-700">{item.description}</p>
                <p className="text-sm text-gray-600">
                  Durasi: {item.duration_minutes} menit · Tingkat: {item.difficulty}
                </p>
                <p className="mt-3 text-sm">{item.reason}</p>
              </article>
            ))}
          </div>
          <p className="mt-4 text-xs text-gray-500">
            Skor menunjukkan kesesuaian, bukan probabilitas keberhasilan. Katalog saat ini
            perlu disesuaikan dengan aktivitas nyata.
          </p>
        </section>
      )}
    </main>
  );
}
