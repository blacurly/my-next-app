
import json

from .config import (
    RAW_PAGES_FILE,
    CHUNKS_FILE,
    CHUNK_SIZE,
    CHUNK_OVERLAP,
)


def split_text(text, chunk_size=CHUNK_SIZE,
               overlap=CHUNK_OVERLAP):
    if overlap >= chunk_size:
        raise ValueError("Overlap harus lebih kecil dari chunk size")

    chunks = []
    start = 0

    while start < len(text):
        end = min(start + chunk_size, len(text))
        chunk = text[start:end].strip()

        if chunk:
            chunks.append(chunk)

        if end == len(text):
            break

        start = end - overlap

    return chunks


def run_chunking():
    if not RAW_PAGES_FILE.exists():
        raise FileNotFoundError(
            "File raw_pages.jsonl belum ada. Jalankan extraction dahulu."
        )

    total_chunks = 0

    with open(RAW_PAGES_FILE, encoding="utf-8") as source, \
         open(CHUNKS_FILE, "w", encoding="utf-8") as output:

        for line in source:
            page = json.loads(line)

            for index, chunk in enumerate(split_text(page["text"])):
                record = {
                    **{
                        key: page[key]
                        for key in [
                            "document_id",
                            "source_file",
                            "title",
                            "page",
                        ]
                    },
                    "chunk_index": index,
                    "chunk_id": (
                        f'{page["document_id"]}-'
                        f'p{page["page"]}-c{index}'
                    ),
                    "text": chunk,
                }

                output.write(
                    json.dumps(record, ensure_ascii=False) + "\n"
                )
                total_chunks += 1

    print(f"Total chunk: {total_chunks}")
    print(f"Output: {CHUNKS_FILE}")


if __name__ == "__main__":
    run_chunking()
