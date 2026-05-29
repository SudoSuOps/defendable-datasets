from __future__ import annotations

from pathlib import Path

from defendable_datasets.hash_utils import attach_hashes
from defendable_datasets.split import split_records
from tests.conftest import sample_record, write_jsonl


def test_split_counts_are_correct(workdir: Path) -> None:
    rows = [attach_hashes(sample_record(f"r{i}", instruction=f"Write a clear investment memo number {i} for this acquisition.")) for i in range(10)]
    path = write_jsonl(workdir / "input.graded.jsonl", rows)
    _, _, _, _, report = split_records(path, train=0.8, val=0.1, test=0.1)
    assert sum(report["splits"].values()) == 10
    assert report["splits"]["train"] == 8

