from __future__ import annotations

from pathlib import Path
from typing import Any

import yaml


def load_reviewer(reviewer: str | Path | None) -> dict[str, Any] | None:
    if not reviewer:
        return None
    path = Path(reviewer)
    if not path.exists():
        path = Path("configs/reviewers") / f"{reviewer}.yaml"
    if not path.exists():
        raise FileNotFoundError(f"reviewer config not found: {reviewer}")
    data = yaml.safe_load(path.read_text(encoding="utf-8")) or {}
    return dict(data)


def reviewer_name(reviewer: dict[str, Any] | None) -> str:
    if not reviewer:
        return "deterministic-v1"
    return str(reviewer.get("id") or reviewer.get("name") or "reviewer")


def reviewer_receipt_flags(reviewer: dict[str, Any] | None) -> list[str]:
    if not reviewer:
        return []
    return [
        f"reviewer:{reviewer_name(reviewer)}",
        f"model:{reviewer.get('model', 'unknown')}",
        f"node:{reviewer.get('node_id', 'unknown')}",
    ]

