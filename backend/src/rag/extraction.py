
import hashlib
import json
from datetime import datetime, timezone

import fitz
#import pymupdf as fitz

from .config import INCOMING_DIR, RAW_PAGES_FILE


def calculate_sha256(file_path):
    digest = hashlib.sha256()

    with open(file_path, "rb") as file:
        for block in iter(lambda: file.read(1024 * 1024), b""):
            digest.update(block)

    return digest.hexdigest()


def extract_pdf(pdf_path):
    pdf_path = pdf_path.resolve()
    document_id = calculate_sha256(pdf_path)
    records = []

    with fitz.open(pdf_path) as pdf:
        for page_number, page in enumerate(pdf, start=1):
            text = page.get_text("text").strip()

            if not text:
                continue

            records.append({
                "document_id": document_id,
                "source_file": pdf_path.name,
                "title": pdf_path.stem,
                "page": page_number,
                "text": text,
                "extracted_at": datetime.now(
                    timezone.utc
                ).isoformat(),
            })

    return records


def run_extraction():
    pdf_files = sorted(INCOMING_DIR.glob("*.pdf"))

    if not pdf_files:
        print(f"Tidak ada PDF di {INCOMING_DIR}")
        return

    all_records = []

    for pdf_path in pdf_files:
        try:
            records = extract_pdf(pdf_path)
            all_records.extend(records)

            print(
                f"Berhasil membaca {pdf_path.name}: "
                f"{len(records)} halaman berisi teks"
            )
        except Exception as error:
            print(f"Gagal membaca {pdf_path.name}: {error}")

    with open(RAW_PAGES_FILE, "w", encoding="utf-8") as file:
        for record in all_records:
            file.write(
                json.dumps(record, ensure_ascii=False) + "\n"
            )

    print(f"Total halaman tersimpan: {len(all_records)}")
    print(f"Output: {RAW_PAGES_FILE}")


if __name__ == "__main__":
    run_extraction()
