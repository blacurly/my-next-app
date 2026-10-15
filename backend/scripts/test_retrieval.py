
import sys
from pathlib import Path

BACKEND_DIR = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(BACKEND_DIR / "src"))

from rag.retrieval import print_results


def main():
    print("Virtual Safe Space — RAG Retrieval Test")
    print("Ketik 'exit' untuk berhenti.\n")

    while True:
        question = input("Pertanyaan: ").strip()

        if question.lower() in {"exit", "quit"}:
            break

        if not question:
            continue

        try:
            print_results(question, top_k=5)
        except Exception as error:
            print(f"Terjadi kesalahan: {error}")


if __name__ == "__main__":
    main()
