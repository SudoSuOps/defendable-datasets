from __future__ import annotations

from pathlib import Path
from typing import Any

from .io import read_json, read_jsonl
from .provenance import COMPUTE_PROVENANCE


def write_dataset_card(export_dir: str | Path, manifest: dict[str, Any]) -> Path:
    directory = Path(export_dir)
    content = f"""# Dataset Card

Dataset ID: {manifest["dataset_id"]}
Domain: {manifest["domain"]}
Version: {manifest["version"]}
Created: {manifest["created_at"]}
Record Count: {manifest["record_count"]}

## Intended Use

Model-ready fine-tuning and evaluation workflows compatible with the declared domain and task types.

## Not Intended For

Unreviewed clinical, legal, financial, safety-critical, or compliance-sensitive deployment.

## Source Types

{manifest["provenance_summary"].get("source_types", {})}

## Compute Provenance

{COMPUTE_PROVENANCE}

## License Summary

{manifest["license_summary"]}

## Quality Method

Deterministic schema, validation, dedupe, grading, split, manifest, and receipt pipeline.

## Validation Checks

Required fields, source block, license field, placeholder text, private data patterns, domain task rules, length bounds, stable hashes.

## Known Limitations

LLM judge grading, Merkle anchoring, and object-storage delivery are extension points.

## Train/Val/Test Counts

{manifest["splits"]}

## Hash Manifest

{manifest["hashes"]}

## Receipt List

{chr(10).join(f"- {receipt}" for receipt in manifest["receipts"])}
"""
    path = directory / "DATASET_CARD.md"
    path.write_text(content, encoding="utf-8")
    return path


def write_quality_report(export_dir: str | Path, manifest: dict[str, Any]) -> Path:
    directory = Path(export_dir)
    rows = []
    for split in ["train", "val", "test"]:
        split_rows, _ = read_jsonl(directory / f"{split}.jsonl")
        rows.extend(split_rows)
    accepted = [row for row in rows if row.get("quality", {}).get("tier") != "propolis"]
    flags: dict[str, int] = {}
    for row in rows:
        for flag in row.get("quality", {}).get("flags", []):
            flags[flag] = flags.get(flag, 0) + 1
    content = f"""# Quality Report

## Executive Summary

Dataset package created by DefendableDatasets Quality Foundry. {COMPUTE_PROVENANCE}

Total Records: {len(rows)}
Accepted Records: {len(accepted)}
Rejected Records: {manifest["quality_counts"].get("propolis", 0)}
Royal Jelly Count: {manifest["quality_counts"].get("royal_jelly", 0)}
Honey Count: {manifest["quality_counts"].get("honey", 0)}
Jelly Count: {manifest["quality_counts"].get("jelly", 0)}
Propolis Count: {manifest["quality_counts"].get("propolis", 0)}
Top Failure Reasons: {flags}
Duplicate Count: see duplicate report receipt
Provenance Coverage: {manifest["provenance_summary"]}
License Coverage: {manifest["license_summary"]}
Recommended Use: Fine-tuning preparation, evaluation, and dataset registry export after final domain review.
Risk Notes: Review any propolis records and gated license records before production training.
"""
    path = directory / "QUALITY_REPORT.md"
    path.write_text(content, encoding="utf-8")
    return path


def write_sha256sums(export_dir: str | Path, manifest: dict[str, Any]) -> Path:
    directory = Path(export_dir)
    lines = []
    for key, value in manifest["hashes"].items():
        if key.endswith("_sha256"):
            filename = key.replace("_sha256", ".jsonl") if key != "manifest_sha256" else "manifest.json"
            lines.append(f"{value}  {filename}")
    path = directory / "SHA256SUMS.txt"
    path.write_text("\n".join(lines) + "\n", encoding="utf-8")
    return path

