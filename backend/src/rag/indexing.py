
import json

import chromadb

from .config import CHROMA_DIR, EMBEDDINGS_FILE

COLLECTION_NAME = "virtual_safe_space"


def run_indexing():
    if not EMBEDDINGS_FILE.exists():
        raise FileNotFoundError(
            "File embeddings.jsonl belum ada. Jalankan embedding dahulu."
        )

    client = chromadb.PersistentClient(
        path=str(CHROMA_DIR)
    )

    collection = client.get_or_create_collection(
        name=COLLECTION_NAME,
        metadata={"hnsw:space": "cosine"},
    )

    batch_size = 100
    batch = []
    total = 0

    def save_batch(items):
        if not items:
            return

        collection.upsert(
            ids=[item["chunk_id"] for item in items],
            documents=[item["text"] for item in items],
            embeddings=[item["embedding"] for item in items],
            metadatas=[
                {
                    "document_id": item["document_id"],
                    "source_file": item["source_file"],
                    "title": item["title"],
                    "page": item["page"],
                    "chunk_index": item["chunk_index"],
                }
                for item in items
            ],
        )

    with open(EMBEDDINGS_FILE, encoding="utf-8") as source:
        for line in source:
            if not line.strip():
                continue

            batch.append(json.loads(line))

            if len(batch) >= batch_size:
                save_batch(batch)
                total += len(batch)
                batch = []

    if batch:
        save_batch(batch)
        total += len(batch)

    print(f"Total chunk diindeks: {total}")
    print(f"Total item dalam collection: {collection.count()}")


if __name__ == "__main__":
    run_indexing()
