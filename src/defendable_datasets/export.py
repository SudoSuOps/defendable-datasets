from __future__ import annotations

import shutil
from pathlib import Path

from .hash_utils import file_sha256
from .io import write_json
from .manifest import build_manifest
from .receipts import StageTimer, write_receipt
from .reports import write_dataset_card, write_quality_report, write_sha256sums


def export_package(dataset_id: str) -> Path:
    export_dir = Path("data/exports") / dataset_id
    manifest_path = export_dir / "manifest.json"
    if not manifest_path.exists():
        manifest_path, manifest = build_manifest(export_dir)
    else:
        import json
        manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    write_dataset_card(export_dir, manifest)
    write_quality_report(export_dir, manifest)
    write_sha256sums(export_dir, manifest)
    receipts_dir = export_dir / "receipts"
    receipts_dir.mkdir(parents=True, exist_ok=True)
    for receipt in Path("data/receipts").joinpath(dataset_id).glob("*_receipt.json"):
        shutil.copy2(receipt, receipts_dir / receipt.name)
    timer = StageTimer()
    receipt = write_receipt(
        dataset_id=dataset_id,
        stage="export",
        timer=timer,
        input_path=manifest_path,
        output_path=export_dir / "SHA256SUMS.txt",
        records_in=manifest["record_count"],
        records_out=manifest["record_count"],
    )
    shutil.copy2(receipt, receipts_dir / receipt.name)
    return export_dir

