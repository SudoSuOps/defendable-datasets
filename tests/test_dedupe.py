from __future__ import annotations

from pathlib import Path

from defendable_datasets.dedupe import dedupe_records
from defendable_datasets.hash_utils import attach_hashes
from tests.conftest import sample_record, write_jsonl


def test_duplicate_rows_are_detected(workdir: Path) -> None:
    row1 = attach_hashes(sample_record("r1"))
    row2 = attach_hashes(sample_record("r2"))
    path = write_jsonl(workdir / "input.valid.jsonl", [row1, row2])
    _, _, report = dedupe_records(path)
    assert report["duplicate_count"] == 1
    assert report["records_out"] == 1

