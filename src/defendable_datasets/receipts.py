from __future__ import annotations

from pathlib import Path
from time import perf_counter
from typing import Any
from uuid import uuid4

from .hash_utils import file_sha256
from .io import count_jsonl, write_json
from .schemas import Receipt, now_iso


class StageTimer:
    def __init__(self) -> None:
        self.started_at = now_iso()
        self._started = perf_counter()

    def finish(self) -> str:
        _ = perf_counter() - self._started
        return now_iso()


def receipt_path(dataset_id: str, stage: str) -> Path:
    return Path("data/receipts") / dataset_id / f"{stage}_receipt.json"


def write_receipt(
    *,
    dataset_id: str,
    stage: Any,
    timer: StageTimer,
    input_path: str | Path,
    output_path: str | Path,
    records_in: int,
    records_out: int,
    records_rejected: int = 0,
    flags: list[str] | None = None,
) -> Path:
    input_target = Path(input_path)
    output_target = Path(output_path)
    receipt = Receipt(
        receipt_id=f"rcpt_{stage}_{uuid4().hex[:12]}",
        dataset_id=dataset_id,
        stage=stage,
        started_at=timer.started_at,
        finished_at=timer.finish(),
        input_path=str(input_target),
        output_path=str(output_target),
        input_sha256=file_sha256(input_target) if input_target.exists() and input_target.is_file() else "",
        output_sha256=file_sha256(output_target) if output_target.exists() and output_target.is_file() else "",
        records_in=records_in,
        records_out=records_out,
        records_rejected=records_rejected,
        flags=flags or [],
    )
    return write_json(receipt_path(dataset_id, str(stage)), receipt.model_dump())

