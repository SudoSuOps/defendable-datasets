from __future__ import annotations

from pathlib import Path

from defendable_datasets.grade import grade_records
from defendable_datasets.hash_utils import attach_hashes
from defendable_datasets.io import read_jsonl
from defendable_datasets.reviewers import load_reviewer
from tests.conftest import sample_record, write_jsonl

repo_root = Path(__file__).resolve().parents[1]


def test_hack_reviewer_config_loads() -> None:
    reviewer = load_reviewer("hack")
    assert reviewer
    assert reviewer["id"] == "hack"
    assert reviewer["model"] == "hf.co/LiquidAI/LFM2.5-8B-A1B-GGUF:Q4_K_M"


def test_grade_with_hack_reviewer_attaches_metadata(workdir: Path) -> None:
    row = sample_record(task_type="wacc_calculation")
    row["domain"] = "finance"
    row = attach_hashes(row)
    path = write_jsonl(workdir / "input.deduped.jsonl", [row])
    output_path, _, report = grade_records(
        path,
        rubric=repo_root / "configs/domains/finance.yaml",
        reviewer=repo_root / "configs/reviewers/hack.yaml",
    )
    graded, _ = read_jsonl(output_path)
    assert report["reviewer"]["id"] == "hack"
    assert graded[0]["quality"]["grader"] == "hack"
    assert graded[0]["metadata"]["reviewer"]["node_id"] == "node_hack_orin"
