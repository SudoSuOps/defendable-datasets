from __future__ import annotations

import pytest
from pydantic import ValidationError

from defendable_datasets.schemas import DatasetRecord
from tests.conftest import sample_record


def test_schema_accepts_canonical_record() -> None:
    record = DatasetRecord.model_validate(sample_record())
    assert record.id == "r1"


def test_missing_instruction_gets_rejected() -> None:
    row = sample_record(instruction="")
    with pytest.raises(ValidationError):
        DatasetRecord.model_validate(row)


def test_missing_output_gets_rejected() -> None:
    row = sample_record(output="")
    with pytest.raises(ValidationError):
        DatasetRecord.model_validate(row)

