from __future__ import annotations

from pathlib import Path

from defendable_datasets.export import export_package
from defendable_datasets.hash_utils import attach_hashes
from defendable_datasets.manifest import build_manifest
from defendable_datasets.receipts import StageTimer, write_receipt
from tests.conftest import sample_record, write_jsonl


def test_export_package_includes_required_artifacts(workdir: Path) -> None:
    dataset_id = "SWARM-DATA-20260528-CRE-V1"
    export_dir = workdir / "data/exports" / dataset_id
    row = attach_hashes(sample_record())
    train = write_jsonl(export_dir / "train.jsonl", [row])
    write_jsonl(export_dir / "val.jsonl", [])
    write_jsonl(export_dir / "test.jsonl", [])
    manifest_path, _ = build_manifest(export_dir)
    write_receipt(dataset_id=dataset_id, stage="split", timer=StageTimer(), input_path=train, output_path=train, records_in=1, records_out=1)
    output = export_package(dataset_id)
    for name in ["train.jsonl", "val.jsonl", "test.jsonl", "manifest.json", "DATASET_CARD.md", "QUALITY_REPORT.md", "SHA256SUMS.txt"]:
        assert (output / name).exists()
    assert (output / "receipts").is_dir()
    assert manifest_path.exists()

