from __future__ import annotations

from uuid import uuid4

from .hash_utils import attach_hashes
from .schemas import now_iso


def normalize_row(row: dict, *, dataset_id: str, domain: str | None = None) -> dict:
    source = row.get("source") if isinstance(row.get("source"), dict) else {}
    quality = row.get("quality") if isinstance(row.get("quality"), dict) else {}
    metadata = row.get("metadata") if isinstance(row.get("metadata"), dict) else {}
    normalized = {
        "id": str(row.get("id") or f"rec_{uuid4().hex}"),
        "dataset_id": str(row.get("dataset_id") or dataset_id),
        "domain": str(row.get("domain") or domain or infer_domain(dataset_id)),
        "task_type": str(row.get("task_type") or row.get("task") or "instruction-tuning"),
        "instruction": str(row.get("instruction") or row.get("prompt") or row.get("question") or ""),
        "input": str(row.get("input") or ""),
        "output": stringify_output(row.get("output") if "output" in row else row.get("completion") if "completion" in row else row.get("answer") or ""),
        "source": {
            "source_type": source.get("source_type") or row.get("source_type") or "internal",
            "source_name": source.get("source_name") or row.get("source_name") or dataset_id,
            "source_uri": source.get("source_uri") or row.get("source_uri"),
            "license": source.get("license") if "license" in source else row.get("license"),
            "created_by": source.get("created_by") or row.get("created_by"),
            "created_at": source.get("created_at") or row.get("created_at") or now_iso(),
        },
        "quality": {
            "tier": quality.get("tier") or "jelly",
            "score": float(quality.get("score") or 0.0),
            "flags": list(quality.get("flags") or []),
            "grader": quality.get("grader") or "ungraded",
            "graded_at": quality.get("graded_at") or now_iso(),
        },
        "hashes": row.get("hashes") if isinstance(row.get("hashes"), dict) else {},
        "metadata": {
            "model_used": metadata.get("model_used") or row.get("model_used"),
            "prompt_template": metadata.get("prompt_template") or row.get("prompt_template"),
            "version": metadata.get("version") or "v1",
            "notes": metadata.get("notes") or row.get("notes"),
        },
    }
    return attach_hashes(normalized)


def stringify_output(value: object) -> str:
    if isinstance(value, str):
        return value
    return "" if value is None else str(value)


def infer_domain(dataset_id: str) -> str:
    parts = dataset_id.lower().split("-")
    return parts[-2] if len(parts) > 2 else "general"

