from __future__ import annotations

import re
from pathlib import Path
from typing import Any

from pydantic import ValidationError

from .config import load_domain_config
from .hash_utils import attach_hashes
from .io import read_jsonl, write_json, write_jsonl
from .schemas import DatasetRecord, DomainConfig

PRIVATE_PATTERNS = [
    re.compile(r"\b\d{3}-\d{2}-\d{4}\b"),
    re.compile(r"\b(?:\d[ -]*?){13,16}\b"),
]
PLACEHOLDERS = ["todo", "lorem ipsum", "n/a", "tbd", "placeholder"]


def validate_records(path: str | Path, *, config_path: str | Path | None = None) -> tuple[Path, Path, Path, dict[str, Any]]:
    rows, json_errors = read_jsonl(path)
    domain = rows[0].get("domain") if rows else None
    config = load_domain_config(config_path, domain)
    valid: list[dict[str, Any]] = []
    rejected: list[dict[str, Any]] = list(json_errors)
    for row in rows:
        errors = row_failures(row, config)
        if errors:
            rejected.append({"id": row.get("id"), "errors": errors, "row": row})
            continue
        record = DatasetRecord.model_validate(row)
        valid.append(attach_hashes(record.model_dump()))

    base = clean_base(path, ".staged")
    valid_path = Path("data/clean") / f"{base}.valid.jsonl"
    rejected_path = Path("data/rejected") / f"{base}.rejected.jsonl"
    report_path = Path("data/reports") / f"{base}.validation_report.json"
    write_jsonl(valid_path, valid)
    write_jsonl(rejected_path, rejected)
    report = {
        "input_path": str(path),
        "records_in": len(rows) + len(json_errors),
        "records_out": len(valid),
        "records_rejected": len(rejected),
        "top_failure_reasons": summarize_failures(rejected),
    }
    write_json(report_path, report)
    return valid_path, rejected_path, report_path, report


def row_failures(row: dict[str, Any], config: DomainConfig) -> list[str]:
    failures: list[str] = []
    try:
        DatasetRecord.model_validate(row)
    except ValidationError as exc:
        failures.extend(error["loc"][-1].__str__() for error in exc.errors())
    instruction = str(row.get("instruction") or "")
    output = str(row.get("output") or "")
    source = row.get("source") if isinstance(row.get("source"), dict) else {}
    haystack = f"{instruction}\n{output}".lower()
    if len(instruction.strip()) < config.quality_rules.min_instruction_chars:
        failures.append("instruction_too_short")
    if len(output.strip()) < config.quality_rules.min_output_chars:
        failures.append("output_too_short")
    if len(output) > config.quality_rules.max_output_chars:
        failures.append("output_too_long")
    if config.quality_rules.require_source_block and not source:
        failures.append("missing_source")
    if "license" not in source:
        failures.append("missing_license")
    if config.allowed_task_types and row.get("task_type") not in config.allowed_task_types:
        failures.append("task_type_not_allowed")
    if config.quality_rules.reject_placeholder_text and any(token in haystack for token in PLACEHOLDERS):
        failures.append("placeholder_text")
    if any(pattern.search(haystack) for pattern in PRIVATE_PATTERNS):
        failures.append("private_data_risk")
    if "\ufffd" in haystack:
        failures.append("broken_encoding")
    return sorted(set(failures))


def summarize_failures(rejected: list[dict[str, Any]]) -> dict[str, int]:
    summary: dict[str, int] = {}
    for item in rejected:
        errors = item.get("errors") or [item.get("error", "invalid_json")]
        for error in errors:
            summary[str(error)] = summary.get(str(error), 0) + 1
    return dict(sorted(summary.items(), key=lambda item: item[1], reverse=True))


def clean_base(path: str | Path, suffix: str) -> str:
    name = Path(path).name
    if name.endswith(f"{suffix}.jsonl"):
        return name[: -len(f"{suffix}.jsonl")]
    return Path(path).stem

