from __future__ import annotations

import json
from pathlib import Path

import pytest


@pytest.fixture()
def workdir(tmp_path: Path, monkeypatch: pytest.MonkeyPatch) -> Path:
    monkeypatch.chdir(tmp_path)
    return tmp_path


def sample_record(record_id: str = "r1", instruction: str | None = None, output: str | None = None) -> dict:
    return {
        "id": record_id,
        "dataset_id": "SWARM-DATA-20260528-CRE-V1",
        "domain": "cre",
        "task_type": "investment_memo",
        "instruction": "Write a clear investment memo for this stabilized multifamily acquisition." if instruction is None else instruction,
        "input": "NOI 1200000, purchase price 15000000, occupancy 94%.",
        "output": "The acquisition has an 8.00% going-in cap rate based on NOI of 1,200,000 and purchase price of 15,000,000. Review rent roll durability, expense load, debt service coverage, and market rent support before making a final investment decision." if output is None else output,
        "source": {
            "source_type": "internal",
            "source_name": "quality-foundry-test",
            "source_uri": None,
            "license": "cc-by-4.0",
            "created_by": "pytest",
            "created_at": "2026-05-28T00:00:00+00:00",
        },
        "quality": {
            "tier": "jelly",
            "score": 0.0,
            "flags": [],
            "grader": "ungraded",
            "graded_at": "2026-05-28T00:00:00+00:00",
        },
        "hashes": {"record_sha256": "", "content_sha256": ""},
        "metadata": {"model_used": None, "prompt_template": None, "version": "v1", "notes": None},
    }


def write_jsonl(path: Path, rows: list[dict] | list[str]) -> Path:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8") as handle:
        for row in rows:
            if isinstance(row, str):
                handle.write(row + "\n")
            else:
                handle.write(json.dumps(row) + "\n")
    return path
