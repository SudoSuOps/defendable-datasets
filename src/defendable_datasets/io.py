from __future__ import annotations

import json
from pathlib import Path
from typing import Any, Iterable


def ensure_parent(path: str | Path) -> Path:
    target = Path(path)
    target.parent.mkdir(parents=True, exist_ok=True)
    return target


def ensure_dirs() -> None:
    for directory in ["data/raw", "data/staged", "data/clean", "data/rejected", "data/exports", "data/manifests", "data/receipts", "data/reports"]:
        Path(directory).mkdir(parents=True, exist_ok=True)


def read_jsonl(path: str | Path) -> tuple[list[dict[str, Any]], list[dict[str, Any]]]:
    rows: list[dict[str, Any]] = []
    errors: list[dict[str, Any]] = []
    with Path(path).open("r", encoding="utf-8") as handle:
        for line_number, line in enumerate(handle, start=1):
            raw = line.strip()
            if not raw:
                continue
            try:
                value = json.loads(raw)
                if not isinstance(value, dict):
                    raise ValueError("row is not a JSON object")
                rows.append(value)
            except Exception as exc:
                errors.append({"line": line_number, "error": str(exc), "raw": raw})
    return rows, errors


def write_jsonl(path: str | Path, rows: Iterable[dict[str, Any]]) -> Path:
    target = ensure_parent(path)
    with target.open("w", encoding="utf-8") as handle:
        for row in rows:
            handle.write(json.dumps(row, sort_keys=True, ensure_ascii=False) + "\n")
    return target


def read_json(path: str | Path) -> Any:
    return json.loads(Path(path).read_text(encoding="utf-8"))


def write_json(path: str | Path, data: Any) -> Path:
    target = ensure_parent(path)
    target.write_text(json.dumps(data, indent=2, sort_keys=True, ensure_ascii=False) + "\n", encoding="utf-8")
    return target


def count_jsonl(path: str | Path) -> int:
    if not Path(path).exists():
        return 0
    with Path(path).open("r", encoding="utf-8") as handle:
        return sum(1 for line in handle if line.strip())

