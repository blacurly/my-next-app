from typing import List, Literal
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field

from .engine import (
    ACTIVITY_CATALOG,
    UserProfile,
    recommend,
    explain_recommendation,
)

app = FastAPI(
    title="Recommendation System API",
    version="1.0.0",
    description="Rekomendasi aktivitas berdasarkan minat, skill, habit, dan waktu.",
)

class RecommendationRequest(BaseModel):
    interests: List[str] = Field(default_factory=list)
    skills: List[str] = Field(default_factory=list)
    habits: List[str] = Field(default_factory=list)
    available_minutes: int = Field(ge=1, le=1440)
    preferred_difficulty: Literal["beginner", "intermediate", "any"] = "any"
    top_n: int = Field(default=5, ge=1, le=10)

@app.get("/health")
def health():
    return {"status": "ok", "service": "recommendation"}

@app.get("/options")
def get_options():
    # Label dan nilai fitur mengikuti pilihan yang tersedia di engine.py.
    from .engine import INTEREST_OPTIONS, SKILL_OPTIONS, HABIT_OPTIONS
    return {
        "interests": [{"label": label, "value": value}
                      for label, value in INTEREST_OPTIONS.values()],
        "skills": [{"label": label, "value": value}
                   for label, value in SKILL_OPTIONS.values()],
        "habits": [{"label": label, "value": value}
                   for label, value in HABIT_OPTIONS.values()],
        "difficulty": [
            {"label": "Pemula", "value": "beginner"},
            {"label": "Menengah", "value": "intermediate"},
            {"label": "Semua tingkat", "value": "any"},
        ],
        "time_options": [15, 30, 45, 60, 90],
    }

@app.post("/recommend")
def get_recommendations(payload: RecommendationRequest):
    profile = UserProfile(
        interests=set(payload.interests),
        skills=set(payload.skills),
        habits=set(payload.habits),
        available_minutes=payload.available_minutes,
        preferred_difficulty=payload.preferred_difficulty,
    )
    results = recommend(profile, ACTIVITY_CATALOG, top_n=payload.top_n)
    items = []

    for rank, result in enumerate(results, start=1):
        activity = result["activity"]
        items.append({
            "rank": rank,
            "id": activity.id,
            "title": activity.title,
            "description": activity.description,
            "duration_minutes": activity.duration_minutes,
            "difficulty": activity.difficulty,
            "tags": sorted(activity.tags),
            "score": result["score"],
            "components": result["components"],
            "reason": explain_recommendation(result),
        })

    return {
        "count": len(items),
        "score_type": "suitability_score_not_probability",
        "recommendations": items,
        "message": (
            "Katalog aktivitas masih berupa contoh awal."
            if len(ACTIVITY_CATALOG) > 0 else
            "Katalog aktivitas belum berisi data."
        ),
    }