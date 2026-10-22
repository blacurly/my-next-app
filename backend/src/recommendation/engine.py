"""
Prototype Recommendation System
Approach: rule-based filtering + content-based weighted scoring.

Purpose
-------
A small, standalone prototype to test recommendations based on:
- interests
- skills
- habits / preferred activity patterns
- available time per day

No external libraries are required. Run with:
    python recommendation_system.py

This is a prototype with example activities. Replace ACTIVITY_CATALOG with
your own activity data before integrating it into a website.

Scoring note
------------
The final score is a suitability score (0-100), NOT a probability of success.
"""

from dataclasses import dataclass
from typing import List, Set


# Initial weights. Adjust these after testing with real users.
WEIGHTS = {
    "interest": 0.35,
    "skill": 0.25,
    "habit": 0.20,
    "time": 0.20,
}

TOP_N = 5


@dataclass
class Activity:
    id: str
    title: str
    description: str
    interests: Set[str]
    skills: Set[str]
    supporting_habits: Set[str]
    duration_minutes: int
    difficulty: str
    tags: Set[str]


@dataclass
class UserProfile:
    interests: Set[str]
    skills: Set[str]
    habits: Set[str]
    available_minutes: int
    preferred_difficulty: str


# Example catalog. Edit or replace these records for your own use case.
ACTIVITY_CATALOG: List[Activity] = [
    Activity(
        id="A01",
        title="Belajar AI Dasar",
        description="Belajar konsep dasar AI dan mencoba contoh sederhana.",
        interests={"technology", "ai", "learning"},
        skills={"digital_literacy", "python_basic"},
        supporting_habits={"self_learning", "reading", "consistency"},
        duration_minutes=30,
        difficulty="beginner",
        tags={"learning", "technology"},
    ),
    Activity(
        id="A02",
        title="Membuat Proyek Data Sederhana",
        description="Menganalisis dataset kecil dan menyajikan temuan.",
        interests={"technology", "data", "problem_solving"},
        skills={"python_basic", "spreadsheet", "data_analysis"},
        supporting_habits={"self_learning", "problem_solving", "consistency"},
        duration_minutes=60,
        difficulty="intermediate",
        tags={"learning", "technology", "project"},
    ),
    Activity(
        id="A03",
        title="Menjadi Relawan Komunitas",
        description="Berpartisipasi dalam kegiatan sosial atau komunitas lokal.",
        interests={"community", "social_impact", "women_empowerment"},
        skills={"communication", "teamwork", "organization"},
        supporting_habits={"teamwork", "volunteering", "consistency"},
        duration_minutes=60,
        difficulty="beginner",
        tags={"community", "social_impact"},
    ),
    Activity(
        id="A04",
        title="Belajar Komunikasi Publik",
        description="Latihan menyampaikan ide secara jelas dan terstruktur.",
        interests={"communication", "leadership", "learning"},
        skills={"communication", "presentation", "writing"},
        supporting_habits={"self_learning", "reading", "consistency"},
        duration_minutes=20,
        difficulty="beginner",
        tags={"learning", "career"},
    ),
    Activity(
        id="A05",
        title="Aksi Kecil untuk Lingkungan",
        description="Melakukan aktivitas sederhana yang mendukung keberlanjutan.",
        interests={"environment", "sustainability", "community"},
        skills={"organization", "teamwork", "observation"},
        supporting_habits={"outdoor_activity", "teamwork", "consistency"},
        duration_minutes=30,
        difficulty="beginner",
        tags={"environment", "community"},
    ),
    Activity(
        id="A06",
        title="Membaca dan Merangkum Artikel",
        description="Membangun rutinitas membaca lalu menulis ringkasan singkat.",
        interests={"learning", "reading", "writing"},
        skills={"reading", "writing", "critical_thinking"},
        supporting_habits={"reading", "self_learning", "consistency"},
        duration_minutes=15,
        difficulty="beginner",
        tags={"learning", "personal_growth"},
    ),
    Activity(
        id="A07",
        title="Membangun Portofolio Digital",
        description="Membuat halaman portofolio sederhana untuk menampilkan karya.",
        interests={"technology", "design", "career"},
        skills={"digital_literacy", "writing", "design"},
        supporting_habits={"self_learning", "consistency", "problem_solving"},
        duration_minutes=45,
        difficulty="intermediate",
        tags={"technology", "career", "project"},
    ),
    Activity(
        id="A08",
        title="Mendampingi Belajar Anak",
        description="Membantu anak atau peserta didik memahami materi belajar.",
        interests={"education", "community", "social_impact"},
        skills={"communication", "teaching", "patience"},
        supporting_habits={"teamwork", "volunteering", "consistency"},
        duration_minutes=45,
        difficulty="beginner",
        tags={"education", "community"},
    ),
]


# Labels shown to users and the underlying standardized feature values.
INTEREST_OPTIONS = {
    "1": ("Teknologi dan AI", "technology"),
    "2": ("Data dan analisis", "data"),
    "3": ("Komunitas dan kegiatan sosial", "community"),
    "4": ("Pemberdayaan perempuan", "women_empowerment"),
    "5": ("Lingkungan dan keberlanjutan", "environment"),
    "6": ("Pendidikan dan belajar", "learning"),
    "7": ("Komunikasi dan kepemimpinan", "communication"),
    "8": ("Desain dan kreativitas", "design"),
    "9": ("Karier dan pengembangan diri", "career"),
    "10": ("Menulis dan membaca", "writing"),
}

SKILL_OPTIONS = {
    "1": ("Literasi digital", "digital_literacy"),
    "2": ("Python dasar", "python_basic"),
    "3": ("Analisis data", "data_analysis"),
    "4": ("Spreadsheet / Excel", "spreadsheet"),
    "5": ("Komunikasi", "communication"),
    "6": ("Kerja sama tim", "teamwork"),
    "7": ("Menulis", "writing"),
    "8": ("Desain", "design"),
    "9": ("Presentasi", "presentation"),
    "10": ("Mengajar", "teaching"),
    "11": ("Organisasi kegiatan", "organization"),
    "12": ("Membaca", "reading"),
    "13": ("Berpikir kritis", "critical_thinking"),
    "14": ("Pemecahan masalah", "problem_solving"),
    "15": ("Saya masih pemula / belum yakin", "beginner"),
}

HABIT_OPTIONS = {
    "1": ("Belajar mandiri", "self_learning"),
    "2": ("Membaca", "reading"),
    "3": ("Konsisten menjalankan rutinitas", "consistency"),
    "4": ("Bekerja dengan orang lain", "teamwork"),
    "5": ("Menjadi relawan", "volunteering"),
    "6": ("Aktivitas luar ruangan", "outdoor_activity"),
    "7": ("Mencoba dan membuat proyek", "problem_solving"),
}


def choose_multiple(prompt: str, options: dict) -> Set[str]:
    """Ask for comma-separated option numbers and return feature values."""
    print(f"\n{prompt}")
    for key, (label, _) in options.items():
        print(f"  {key}. {label}")

    valid = set(options.keys())
    while True:
        raw = input("Pilih nomor (pisahkan dengan koma, mis. 1,3): ").strip()
        selected = {part.strip() for part in raw.split(",") if part.strip()}
        if selected and selected.issubset(valid):
            return {options[key][1] for key in selected}
        print("Input tidak valid. Masukkan nomor yang tersedia, dipisahkan koma.")


def choose_time() -> int:
    print("\nBerapa waktu yang tersedia untuk satu aktivitas per hari?")
    print("  1. 15 menit")
    print("  2. 30 menit")
    print("  3. 45 menit")
    print("  4. 60 menit")
    print("  5. 90 menit atau lebih")
    choices = {"1": 15, "2": 30, "3": 45, "4": 60, "5": 90}
    while True:
        answer = input("Pilih nomor: ").strip()
        if answer in choices:
            return choices[answer]
        print("Pilihan tidak valid. Masukkan angka 1-5.")


def choose_difficulty() -> str:
    print("\nTingkat aktivitas yang kamu inginkan:")
    print("  1. Pemula")
    print("  2. Menengah")
    print("  3. Semua tingkat")
    choices = {"1": "beginner", "2": "intermediate", "3": "any"}
    while True:
        answer = input("Pilih nomor: ").strip()
        if answer in choices:
            return choices[answer]
        print("Pilihan tidak valid. Masukkan angka 1-3.")


def overlap_score(user_features: Set[str], activity_features: Set[str]) -> float:
    """
    Score overlap from 0 to 100.
    If the user has no features in a dimension, use a neutral score of 50
    rather than treating missing information as a mismatch.
    """
    if not user_features:
        return 50.0
    return 100.0 * len(user_features & activity_features) / len(user_features)


def time_score(available_minutes: int, duration_minutes: int) -> float:
    """
    Give full score if the activity fits within available time.
    If it exceeds the available time, score it lower instead of automatically
    removing it; hard filtering can be enabled separately if desired.
    """
    if duration_minutes <= available_minutes:
        return 100.0
    return max(0.0, 100.0 * available_minutes / duration_minutes)


def score_activity(profile: UserProfile, activity: Activity) -> dict:
    """Calculate weighted content-match score for one activity."""
    interest = overlap_score(profile.interests, activity.interests)
    skill = overlap_score(profile.skills, activity.skills)
    habit = overlap_score(profile.habits, activity.supporting_habits)
    time = time_score(profile.available_minutes, activity.duration_minutes)

    score = (
        WEIGHTS["interest"] * interest
        + WEIGHTS["skill"] * skill
        + WEIGHTS["habit"] * habit
        + WEIGHTS["time"] * time
    )

    # A rule-based preference: when a user explicitly wants beginner activities,
    # do not recommend intermediate activities in the main results.
    if profile.preferred_difficulty == "beginner" and activity.difficulty != "beginner":
        return {
            "activity": activity,
            "score": round(score, 1),
            "components": {
                "interest": round(interest, 1),
                "skill": round(skill, 1),
                "habit": round(habit, 1),
                "time": round(time, 1),
            },
            "filtered_out": True,
            "filter_reason": "Pengguna memilih aktivitas tingkat pemula.",
        }

    return {
        "activity": activity,
        "score": round(score, 1),
        "components": {
            "interest": round(interest, 1),
            "skill": round(skill, 1),
            "habit": round(habit, 1),
            "time": round(time, 1),
        },
        "filtered_out": False,
        "filter_reason": "",
    }


def recommend(profile: UserProfile, catalog: List[Activity], top_n: int = TOP_N) -> List[dict]:
    """Filter and rank activities from highest to lowest suitability score."""
    results = [score_activity(profile, activity) for activity in catalog]
    eligible = [item for item in results if not item["filtered_out"]]
    eligible.sort(key=lambda item: item["score"], reverse=True)
    return eligible[:top_n]


def explain_recommendation(result: dict) -> str:
    """Create a short, transparent explanation for a recommendation."""
    activity = result["activity"]
    parts = result["components"]
    reasons = []

    if parts["interest"] >= 50:
        reasons.append("selaras dengan minatmu")
    if parts["skill"] >= 50:
        reasons.append("memanfaatkan skill yang kamu pilih")
    if parts["habit"] >= 50:
        reasons.append("sesuai dengan pola aktivitasmu")
    if parts["time"] == 100:
        reasons.append("durasi sesuai dengan waktu yang tersedia")

    if not reasons:
        reasons.append("memiliki skor kesesuaian total yang relatif tinggi")

    return (
        f"{activity.title} direkomendasikan karena "
        + ", ".join(reasons)
        + "."
    )


def get_user_profile() -> UserProfile:
    print("=" * 64)
    print("PROTOTYPE RECOMMENDATION SYSTEM")
    print("Jawab beberapa pertanyaan untuk mendapatkan rekomendasi aktivitas.")
    print("=" * 64)

    interests = choose_multiple("1. Apa minatmu? Pilih satu atau lebih:", INTEREST_OPTIONS)
    skills = choose_multiple("2. Skill apa yang kamu miliki? Pilih satu atau lebih:", SKILL_OPTIONS)
    habits = choose_multiple("3. Kebiasaan atau pola aktivitas apa yang cocok denganmu?", HABIT_OPTIONS)
    available_minutes = choose_time()
    preferred_difficulty = choose_difficulty()

    return UserProfile(
        interests=interests,
        skills=skills,
        habits=habits,
        available_minutes=available_minutes,
        preferred_difficulty=preferred_difficulty,
    )


def main() -> None:
    profile = get_user_profile()
    recommendations = recommend(profile, ACTIVITY_CATALOG)

    print("\n" + "=" * 64)
    print("HASIL REKOMENDASI")
    print("=" * 64)

    if not recommendations:
        print("Belum ada aktivitas yang cocok dengan aturan saat ini.")
        print("Coba pilih tingkat kesulitan 'Semua tingkat' atau periksa katalog.")
        return

    for rank, result in enumerate(recommendations, start=1):
        activity = result["activity"]
        components = result["components"]
        print(f"\n{rank}. {activity.title} — Skor kesesuaian: {result['score']}/100")
        print(f"   Deskripsi : {activity.description}")
        print(f"   Durasi    : {activity.duration_minutes} menit")
        print(f"   Kesulitan : {activity.difficulty}")
        print(
            "   Rincian skor: "
            f"minat={components['interest']}, "
            f"skill={components['skill']}, "
            f"habit={components['habit']}, "
            f"waktu={components['time']}"
        )
        print(f"   Alasan    : {explain_recommendation(result)}")

    print("\nCatatan: skor menunjukkan kesesuaian, bukan probabilitas keberhasilan.")
    print("Katalog dan bobot saat ini adalah contoh awal untuk pengujian.")


if __name__ == "__main__":
    main()