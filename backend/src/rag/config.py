
import os
from pathlib import Path
from dotenv import load_dotenv

# backend/
BACKEND_DIR = Path(__file__).resolve().parents[2]

load_dotenv(BACKEND_DIR / ".env")

DOCUMENTS_DIR = BACKEND_DIR / "documents"
INCOMING_DIR = DOCUMENTS_DIR / "incoming"
PROCESSED_DIR = DOCUMENTS_DIR / "processed"

DATA_DIR = BACKEND_DIR / "data"
RAW_PAGES_FILE = DATA_DIR / "raw_pages.jsonl"
CHUNKS_FILE = DATA_DIR / "chunks.jsonl"
EMBEDDINGS_FILE = DATA_DIR / "embeddings.jsonl"
CHROMA_DIR = DATA_DIR / "chroma"

EMBEDDING_MODEL = (
    "sentence-transformers/"
    "paraphrase-multilingual-MiniLM-L12-v2"
)

CHUNK_SIZE = 1000
CHUNK_OVERLAP = 180
EMBEDDING_BATCH_SIZE = 32

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")

for directory in [
    INCOMING_DIR,
    PROCESSED_DIR,
    DATA_DIR,
    CHROMA_DIR,
]:
    directory.mkdir(parents=True, exist_ok=True)
