from __future__ import annotations

import random
from collections import defaultdict
from pathlib import Path

from .io import read_jsonl, write_json, write_jsonl


def split_records(path: str | Path, *, train: float = 0.9, val: float = 0.05, test: float = 0.05, seed: int = 42) -> tuple[Path, Path, Path, Path, dict]:
    if round(train + val + test, 6) != 1.0:
        raise ValueError("train, val, and test ratios must sum to 1.0")
    rows, errors = read_jsonl(path)
    if not rows:
        raise ValueError("cannot split an empty dataset")
    dataset_id = rows[0]["dataset_id"]
    export_dir = Path("data/exports") / dataset_id
    export_dir.mkdir(parents=True, exist_ok=True)
    groups: dict[tuple[str, str], list[dict]] = defaultdict(list)
    for row in rows:
        groups[(str(row.get("domain")), str(row.get("task_type")))].append(row)
    rng = random.Random(seed)
    buckets = {"train": [], "val": [], "test": []}
    for group_rows in groups.values():
        shuffled = list(group_rows)
        rng.shuffle(shuffled)
        n = len(shuffled)
        train_n = round(n * train)
        val_n = round(n * val)
        if n >= 3:
            train_n = max(1, min(train_n, n - 2))
            val_n = max(1, min(val_n, n - train_n - 1))
        test_n = n - train_n - val_n
        if test_n < 0:
            test_n = 0
            val_n = n - train_n
        buckets["train"].extend(shuffled[:train_n])
        buckets["val"].extend(shuffled[train_n : train_n + val_n])
        buckets["test"].extend(shuffled[train_n + val_n :])
    train_path = write_jsonl(export_dir / "train.jsonl", buckets["train"])
    val_path = write_jsonl(export_dir / "val.jsonl", buckets["val"])
    test_path = write_jsonl(export_dir / "test.jsonl", buckets["test"])
    report = {
        "dataset_id": dataset_id,
        "seed": seed,
        "records_in": len(rows) + len(errors),
        "splits": {name: len(value) for name, value in buckets.items()},
        "ratios": {"train": train, "val": val, "test": test},
    }
    report_path = write_json(Path("data/reports") / f"{dataset_id}.split_report.json", report)
    return train_path, val_path, test_path, report_path, report

