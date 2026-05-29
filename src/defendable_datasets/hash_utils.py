from __future__ import annotations

import hashlib
import json
from pathlib import Path
from typing import Any


def canonical_json(data: Any) -> str:
    return json.dumps(data, sort_keys=True, separators=(",", ":"), ensure_ascii=False)


def sha256_text(value: str) -> str:
    return hashlib.sha256(value.encode("utf-8")).hexdigest()


def sha256_bytes(value: bytes) -> str:
    return hashlib.sha256(value).hexdigest()


def file_sha256(path: str | Path) -> str:
    digest = hashlib.sha256()
    with Path(path).open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def content_hash(record: dict[str, Any]) -> str:
    content = {
        "dataset_id": record.get("dataset_id"),
        "domain": record.get("domain"),
        "task_type": record.get("task_type"),
        "instruction": record.get("instruction"),
        "input": record.get("input"),
        "output": record.get("output"),
        "source": record.get("source"),
    }
    return sha256_text(canonical_json(content))


def record_hash(record: dict[str, Any]) -> str:
    stable = dict(record)
    stable.pop("hashes", None)
    return sha256_text(canonical_json(stable))


def attach_hashes(record: dict[str, Any]) -> dict[str, Any]:
    updated = dict(record)
    hashes = dict(updated.get("hashes") or {})
    hashes["content_sha256"] = content_hash(updated)
    updated["hashes"] = hashes
    updated["hashes"]["record_sha256"] = record_hash(updated)
    return updated

