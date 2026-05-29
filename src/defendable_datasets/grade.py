from __future__ import annotations

import re
from pathlib import Path

from .config import load_domain_config
from .hash_utils import attach_hashes
from .io import read_jsonl, write_json, write_jsonl
from .reviewers import load_reviewer, reviewer_name
from .schemas import now_iso


def grade_records(path: str | Path, *, rubric: str | Path | None = None, reviewer: str | Path | None = None) -> tuple[Path, Path, dict]:
    rows, errors = read_jsonl(path)
    domain = rows[0].get("domain") if rows else None
    config = load_domain_config(rubric, domain)
    reviewer_config = load_reviewer(reviewer)
    graded: list[dict] = []
    tier_counts = {"royal_jelly": 0, "honey": 0, "jelly": 0, "propolis": 0}
    flags_summary: dict[str, int] = {}
    for row in rows:
        score, flags = score_record(row, config.red_flags)
        tier = tier_for_score(score)
        row["quality"] = {"tier": tier, "score": score, "flags": flags, "grader": reviewer_name(reviewer_config), "graded_at": now_iso()}
        if reviewer_config:
            row.setdefault("metadata", {})
            row["metadata"]["reviewer"] = {
                "id": reviewer_config.get("id"),
                "node_id": reviewer_config.get("node_id"),
                "worker_id": reviewer_config.get("worker_id"),
                "model": reviewer_config.get("model"),
                "role": reviewer_config.get("role"),
            }
        row = attach_hashes(row)
        graded.append(row)
        tier_counts[tier] += 1
        for flag in flags:
            flags_summary[flag] = flags_summary.get(flag, 0) + 1
    base = Path(path).name.replace(".deduped.jsonl", "").replace(".jsonl", "")
    output_path = Path("data/clean") / f"{base}.graded.jsonl"
    report_path = Path("data/reports") / f"{base}.grading_report.json"
    write_jsonl(output_path, graded)
    report = {
        "records_in": len(rows) + len(errors),
        "records_out": len(graded),
        "tier_counts": tier_counts,
        "flags_summary": flags_summary,
        "reviewer": reviewer_config,
    }
    write_json(report_path, report)
    return output_path, report_path, report


def score_record(row: dict, red_flags: list[str] | None = None) -> tuple[float, list[str]]:
    flags: list[str] = []
    instruction = str(row.get("instruction") or "")
    output = str(row.get("output") or "")
    source = row.get("source") or {}
    score = 100.0
    if len(instruction.strip()) < 30:
        score -= 15
        flags.append("weak_instruction")
    if len(output.strip()) < 120:
        score -= 18
        flags.append("thin_output")
    if not source.get("source_name"):
        score -= 10
        flags.append("weak_provenance")
    if "license" not in source:
        score -= 10
        flags.append("missing_license")
    if source.get("source_type") in {"public", "licensed", "human", "internal"}:
        score += 3
    if not re.search(r"[.!?]\s*$", output.strip()):
        score -= 4
        flags.append("formatting_quality")
    if any(token in output.lower() for token in ["todo", "lorem ipsum", "n/a"]):
        score -= 40
        flags.append("placeholder_text")
    if red_flags:
        lowered = f"{instruction}\n{output}".lower()
        for red_flag in red_flags:
            if red_flag.replace("_", " ") in lowered:
                score -= 20
                flags.append(red_flag)
    return max(0.0, min(100.0, round(score, 2))), sorted(set(flags))


def tier_for_score(score: float) -> str:
    if score >= 90:
        return "royal_jelly"
    if score >= 75:
        return "honey"
    if score >= 50:
        return "jelly"
    return "propolis"
