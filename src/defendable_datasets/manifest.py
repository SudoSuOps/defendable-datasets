from __future__ import annotations

from collections import Counter
from pathlib import Path
from typing import Any

from .hash_utils import file_sha256
from .io import read_jsonl, write_json
from .provenance import COMPUTE_PROVENANCE
from .schemas import PackageManifest, now_iso


def build_manifest(export_dir: str | Path, *, version: str = "v1") -> tuple[Path, dict[str, Any]]:
    directory = Path(export_dir)
    split_paths = {"train": directory / "train.jsonl", "val": directory / "val.jsonl", "test": directory / "test.jsonl"}
    all_rows: list[dict[str, Any]] = []
    splits: dict[str, int] = {}
    for split_name, split_path in split_paths.items():
        rows, _ = read_jsonl(split_path) if split_path.exists() else ([], [])
        splits[split_name] = len(rows)
        all_rows.extend(rows)
    if not all_rows:
        raise ValueError(f"no split rows found in {directory}")
    dataset_id = str(all_rows[0]["dataset_id"])
    domain = str(all_rows[0]["domain"])
    quality_counts = Counter(str(row.get("quality", {}).get("tier", "jelly")) for row in all_rows)
    source_types = Counter(str(row.get("source", {}).get("source_type", "unknown")) for row in all_rows)
    licenses = Counter(str(row.get("source", {}).get("license", "unknown")) for row in all_rows)
    hashes = {f"{name}_sha256": file_sha256(path) for name, path in split_paths.items() if path.exists()}
    receipts = sorted(str(path) for path in Path("data/receipts").joinpath(dataset_id).glob("*_receipt.json"))
    manifest = PackageManifest(
        dataset_id=dataset_id,
        domain=domain,
        version=version,
        created_at=now_iso(),
        record_count=sum(splits.values()),
        splits=splits,
        quality_counts={tier: quality_counts.get(tier, 0) for tier in ["royal_jelly", "honey", "jelly", "propolis"]},
        hashes=hashes,
        provenance_summary={"source_types": dict(source_types), "compute": COMPUTE_PROVENANCE},
        license_summary=dict(licenses),
        receipts=receipts,
    ).model_dump()
    manifest_path = write_json(directory / "manifest.json", manifest)
    manifest["hashes"]["manifest_sha256"] = file_sha256(manifest_path)
    write_json(manifest_path, manifest)
    write_json(Path("data/manifests") / f"{dataset_id}.manifest.json", manifest)
    return manifest_path, manifest

