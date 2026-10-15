
import argparse
import sys
from pathlib import Path

BACKEND_DIR = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(BACKEND_DIR / "src"))

from rag.pipeline import run_pipeline


parser = argparse.ArgumentParser(description="Virtual Safe Space RAG")
parser.add_argument(
    "--stage",
    choices=["extract", "chunk", "embed", "index", "all"],
    default="all",
)

args = parser.parse_args()
run_pipeline(args.stage)
