from __future__ import annotations

from difflib import SequenceMatcher
from pathlib import Path

from .io import read_jsonl, write_json, write_jsonl


def dedupe_records(path: str | Path, *, threshold: float = 0.96) -> tuple[Path, Path, dict]:
    rows, errors = read_jsonl(path)
    kept: list[dict] = []
    duplicates: list[dict] = []
    by_content: dict[str, dict] = {}
    for row in rows:
        content = row.get("hashes", {}).get("content_sha256")
        duplicate_of = by_content.get(content)
        if duplicate_of:
            keep = best_record(duplicate_of, row)
            drop = row if keep is duplicate_of else duplicate_of
            by_content[content] = keep
            duplicates.append({"id": drop.get("id"), "duplicate_of": keep.get("id"), "reason": "exact_content_hash"})
            continue
        near = find_near_duplicate(row, kept, threshold)
        if near:
            keep = best_record(near, row)
            drop = row if keep is near else near
            if keep is row:
                kept.remove(near)
                kept.append(row)
            duplicates.append({"id": drop.get("id"), "duplicate_of": keep.get("id"), "reason": "near_instruction_output"})
            by_content[content] = keep
            continue
        by_content[content] = row
        kept.append(row)
    base = Path(path).name.replace(".valid.jsonl", "").replace(".jsonl", "")
    output_path = Path("data/clean") / f"{base}.deduped.jsonl"
    report_path = Path("data/reports") / f"{base}.duplicate_report.json"
    write_jsonl(output_path, kept)
    report = {"records_in": len(rows) + len(errors), "records_out": len(kept), "duplicate_count": len(duplicates), "duplicates": duplicates}
    write_json(report_path, report)
    return output_path, report_path, report


def best_record(a: dict, b: dict) -> dict:
    return a if float(a.get("quality", {}).get("score") or 0) >= float(b.get("quality", {}).get("score") or 0) else b


def find_near_duplicate(row: dict, kept: list[dict], threshold: float) -> dict | None:
    target = comparable(row)
    for existing in kept:
        if SequenceMatcher(None, target, comparable(existing)).ratio() >= threshold:
            return existing
    return None


def comparable(row: dict) -> str:
    return f"{row.get('instruction', '')}\n{row.get('output', '')}".lower().strip()

