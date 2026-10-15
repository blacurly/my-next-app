
import json

from sentence_transformers import SentenceTransformer

from .config import (
    CHUNKS_FILE,
    EMBEDDINGS_FILE,
    EMBEDDING_MODEL,
    EMBEDDING_BATCH_SIZE,
)


def run_embedding():
    if not CHUNKS_FILE.exists():
        raise FileNotFoundError(
            "File chunks.jsonl belum ada. Jalankan chunking dahulu."
        )

    model = SentenceTransformer(EMBEDDING_MODEL)

    with open(CHUNKS_FILE, encoding="utf-8") as source:
        chunks = [
            json.loads(line)
            for line in source
            if line.strip()
        ]

    if not chunks:
        print("Tidak ada chunk untuk di-embedding.")
        return

    texts = [chunk["text"] for chunk in chunks]

    vectors = model.encode(
        texts,
        batch_size=EMBEDDING_BATCH_SIZE,
        normalize_embeddings=True,
        show_progress_bar=True,
    )

    with open(EMBEDDINGS_FILE, "w", encoding="utf-8") as output:
        for chunk, vector in zip(chunks, vectors):
            record = {
                **chunk,
                "embedding": vector.tolist(),
            }

            output.write(
                json.dumps(record, ensure_ascii=False) + "\n"
            )

    print(f"Total embedding: {len(vectors)}")
    print(f"Dimensi vektor: {len(vectors[0])}")
    print(f"Output: {EMBEDDINGS_FILE}")


if __name__ == "__main__":
    run_embedding()
