from __future__ import annotations

from pathlib import Path

from defendable_datasets.hash_utils import attach_hashes
from defendable_datasets.manifest import build_manifest
from tests.conftest import sample_record, write_jsonl


def test_manifest_includes_required_fields(workdir: Path) -> None:
    export_dir = workdir / "data/exports/SWARM-DATA-20260528-CRE-V1"
    row = attach_hashes(sample_record())
    write_jsonl(export_dir / "train.jsonl", [row])
    write_jsonl(export_dir / "val.jsonl", [])
    write_jsonl(export_dir / "test.jsonl", [])
    _, manifest = build_manifest(export_dir)
    for field in ["dataset_id", "domain", "record_count", "splits", "quality_counts", "hashes", "provenance_summary", "license_summary", "receipts"]:
        assert field in manifest
    assert "manifest_sha256" in manifest["hashes"]

