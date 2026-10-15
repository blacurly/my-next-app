
from .extraction import run_extraction
from .chunking import run_chunking
from .embedding import run_embedding
from .indexing import run_indexing


def run_pipeline(stage="all"):
    stages = {
        "extract": run_extraction,
        "chunk": run_chunking,
        "embed": run_embedding,
        "index": run_indexing,
    }

    if stage == "all":
        for name in ["extract", "chunk", "embed", "index"]:
            print(f"\n=== Tahap: {name} ===")
            stages[name]()
    elif stage in stages:
        stages[stage]()
    else:
        raise ValueError(f"Tahap tidak dikenal: {stage}")
