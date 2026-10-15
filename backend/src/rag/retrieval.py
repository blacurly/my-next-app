
from functools import lru_cache

import chromadb
from sentence_transformers import SentenceTransformer

from .config import CHROMA_DIR, EMBEDDING_MODEL
from .indexing import COLLECTION_NAME


@lru_cache(maxsize=1)
def get_model():
    """Muat model embedding satu kali per proses Python."""
    print("Memuat model embedding...")
    return SentenceTransformer(EMBEDDING_MODEL)


@lru_cache(maxsize=1)
def get_collection():
    """Gunakan kembali koneksi collection ChromaDB."""
    client = chromadb.PersistentClient(path=str(CHROMA_DIR))

    return client.get_or_create_collection(
        name=COLLECTION_NAME,
        metadata={"hnsw:space": "cosine"},
    )


def retrieve(question: str, top_k: int = 5):
    question = question.strip()

    if not question:
        raise ValueError("Pertanyaan tidak boleh kosong.")

    if top_k < 1:
        raise ValueError("top_k minimal 1.")

    collection = get_collection()

    if collection.count() == 0:
        raise RuntimeError(
            "Indeks kosong. Jalankan pipeline indexing terlebih dahulu."
        )

    model = get_model()

    question_embedding = model.encode(
        [question],
        normalize_embeddings=True,
        show_progress_bar=False,
    ).tolist()

    results = collection.query(
        query_embeddings=question_embedding,
        n_results=min(top_k, collection.count()),
        include=["documents", "metadatas", "distances"],
    )

    matches = []

    for i, document in enumerate(results["documents"][0]):
        metadata = results["metadatas"][0][i]

        matches.append({
            "text": document,
            "title": metadata.get("title", "Tidak diketahui"),
            "source_file": metadata.get("source_file", ""),
            "page": metadata.get("page"),
            "distance": float(results["distances"][0][i]),
        })

    return matches


def print_results(question: str, top_k: int = 5):
    matches = retrieve(question, top_k)

    print(f"\nPertanyaan: {question}")

    for rank, match in enumerate(matches, start=1):
        print("\n" + "=" * 50)
        print(f"Hasil {rank}: {match['title']}")
        print(f"Halaman: {match['page']}")
        print(f"Distance: {match['distance']:.4f}")
        print(match["text"])
