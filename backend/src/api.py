
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from rag.retrieval import get_model, get_collection
from rag.generation import generate_answer


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Muat model sebelum menerima request pertama.
    get_model()
    get_collection()
    yield


app = FastAPI(
    title="Virtual Safe Space RAG API",
    version="0.1.0",
    lifespan=lifespan,
)

# Untuk pengujian lokal. Batasi origin saat integrasi deployment.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)


class ChatRequest(BaseModel):
    question: str = Field(min_length=1, max_length=4000)


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/chat")
def chat(request: ChatRequest):
    question = request.question.strip()

    if not question:
        raise HTTPException(
            status_code=400,
            detail="Pertanyaan tidak boleh kosong.",
        )

    try:
        return generate_answer(question, top_k=5)
    except Exception:
        # Jangan kirim detail internal atau API key ke pengguna.
        raise HTTPException(
            status_code=500,
            detail="Maaf, terjadi kesalahan saat memproses pertanyaan.",
        )
