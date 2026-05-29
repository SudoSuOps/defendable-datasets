from __future__ import annotations

from pathlib import Path

from defendable_datasets.validate import validate_records
from tests.conftest import sample_record, write_jsonl


def test_invalid_json_row_gets_rejected(workdir: Path) -> None:
    path = write_jsonl(workdir / "input.jsonl", [sample_record(), "{broken json"])
    _, _, _, report = validate_records(path)
    assert report["records_out"] == 1
    assert report["records_rejected"] == 1


def test_placeholder_junk_gets_rejected(workdir: Path) -> None:
    row = sample_record(output="TODO")
    path = write_jsonl(workdir / "input.jsonl", [row])
    _, _, _, report = validate_records(path)
    assert report["records_out"] == 0
    assert "placeholder_text" in report["top_failure_reasons"]

