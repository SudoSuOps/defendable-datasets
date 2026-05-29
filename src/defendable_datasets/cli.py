from __future__ import annotations

from pathlib import Path
from typing import Optional

import typer
from rich.console import Console
from rich.table import Table

from .dedupe import dedupe_records
from .export import export_package
from .grade import grade_records
from .io import ensure_dirs, read_jsonl, write_json, write_jsonl
from .manifest import build_manifest
from .normalize import infer_domain, normalize_row
from .receipts import StageTimer, write_receipt
from .reviewers import reviewer_receipt_flags
from .schemas import now_iso
from .split import split_records
from .validate import validate_records

app = typer.Typer(help="DefendableDatasets Quality Foundry CLI.")
console = Console()


@app.command()
def init(dataset_id: str = typer.Option(..., "--dataset-id"), domain: str = typer.Option(..., "--domain")) -> None:
    """Create local working folders and a registry stub."""
    ensure_dirs()
    registry_path = Path("data/manifests/quality_foundry_registry.json")
    registry = []
    if registry_path.exists():
        import json
        registry = json.loads(registry_path.read_text(encoding="utf-8"))
    entry = {"dataset_id": dataset_id, "domain": domain, "created_at": now_iso(), "status": "initialized"}
    registry = [item for item in registry if item.get("dataset_id") != dataset_id] + [entry]
    write_json(registry_path, registry)
    console.print(f"[green]Initialized[/green] {dataset_id} ({domain})")


@app.command()
def ingest(input_path: Path, dataset_id: str = typer.Option(..., "--dataset-id"), domain: Optional[str] = typer.Option(None, "--domain")) -> None:
    """Normalize raw JSONL into the canonical staged schema."""
    ensure_dirs()
    timer = StageTimer()
    rows, errors = read_jsonl(input_path)
    normalized = [normalize_row(row, dataset_id=dataset_id, domain=domain) for row in rows]
    output_path = Path("data/staged") / f"{input_path.stem}.staged.jsonl"
    write_jsonl(output_path, normalized)
    if errors:
        write_jsonl(Path("data/rejected") / f"{input_path.stem}.ingest_errors.jsonl", errors)
    write_receipt(
        dataset_id=dataset_id,
        stage="ingest",
        timer=timer,
        input_path=input_path,
        output_path=output_path,
        records_in=len(rows) + len(errors),
        records_out=len(normalized),
        records_rejected=len(errors),
        flags=["invalid_json"] if errors else [],
    )
    console.print(f"[green]Ingested[/green] {len(normalized)} rows -> {output_path}")


@app.command()
def validate(input_path: Path, rubric: Optional[Path] = typer.Option(None, "--rubric")) -> None:
    """Validate staged JSONL and route failed rows to rejected."""
    timer = StageTimer()
    rows, errors = read_jsonl(input_path)
    dataset_id = str(rows[0].get("dataset_id") if rows else infer_domain(input_path.stem))
    valid_path, rejected_path, report_path, report = validate_records(input_path, config_path=rubric)
    write_receipt(
        dataset_id=dataset_id,
        stage="validate",
        timer=timer,
        input_path=input_path,
        output_path=valid_path,
        records_in=report["records_in"],
        records_out=report["records_out"],
        records_rejected=report["records_rejected"],
        flags=list(report["top_failure_reasons"].keys()),
    )
    console.print(f"[green]Validated[/green] {valid_path} | rejected -> {rejected_path} | report -> {report_path}")


@app.command()
def dedupe(input_path: Path, threshold: float = typer.Option(0.96, "--threshold")) -> None:
    """Remove exact and near duplicate records."""
    timer = StageTimer()
    rows, _ = read_jsonl(input_path)
    dataset_id = str(rows[0].get("dataset_id") if rows else input_path.stem)
    output_path, report_path, report = dedupe_records(input_path, threshold=threshold)
    write_receipt(
        dataset_id=dataset_id,
        stage="dedupe",
        timer=timer,
        input_path=input_path,
        output_path=output_path,
        records_in=report["records_in"],
        records_out=report["records_out"],
        records_rejected=report["duplicate_count"],
        flags=["duplicates_removed"] if report["duplicate_count"] else [],
    )
    console.print(f"[green]Deduped[/green] {output_path} | duplicates={report['duplicate_count']} | report -> {report_path}")


@app.command()
def grade(
    input_path: Path,
    rubric: Optional[Path] = typer.Option(None, "--rubric"),
    reviewer: Optional[str] = typer.Option(None, "--reviewer", help="Reviewer config name or path, for example hack."),
) -> None:
    """Grade rows into royal_jelly, honey, jelly, and propolis."""
    timer = StageTimer()
    rows, _ = read_jsonl(input_path)
    dataset_id = str(rows[0].get("dataset_id") if rows else input_path.stem)
    output_path, report_path, report = grade_records(input_path, rubric=rubric, reviewer=reviewer)
    write_receipt(
        dataset_id=dataset_id,
        stage="grade",
        timer=timer,
        input_path=input_path,
        output_path=output_path,
        records_in=report["records_in"],
        records_out=report["records_out"],
        flags=list(report["flags_summary"].keys()) + reviewer_receipt_flags(report.get("reviewer")),
    )
    print_tiers(report["tier_counts"])
    console.print(f"[green]Graded[/green] {output_path} | report -> {report_path}")


@app.command()
def split(
    input_path: Path,
    train: float = typer.Option(0.9, "--train"),
    val: float = typer.Option(0.05, "--val"),
    test: float = typer.Option(0.05, "--test"),
    seed: int = typer.Option(42, "--seed"),
) -> None:
    """Create train, val, and test JSONL splits."""
    timer = StageTimer()
    rows, _ = read_jsonl(input_path)
    dataset_id = str(rows[0].get("dataset_id") if rows else input_path.stem)
    train_path, val_path, test_path, report_path, report = split_records(input_path, train=train, val=val, test=test, seed=seed)
    write_receipt(
        dataset_id=dataset_id,
        stage="split",
        timer=timer,
        input_path=input_path,
        output_path=train_path,
        records_in=report["records_in"],
        records_out=sum(report["splits"].values()),
    )
    console.print(f"[green]Split[/green] train={train_path} val={val_path} test={test_path} | report -> {report_path}")


@app.command()
def manifest(export_dir: Path) -> None:
    """Create manifest.json for an export directory."""
    timer = StageTimer()
    manifest_path, data = build_manifest(export_dir)
    write_receipt(
        dataset_id=data["dataset_id"],
        stage="manifest",
        timer=timer,
        input_path=export_dir / "train.jsonl",
        output_path=manifest_path,
        records_in=data["record_count"],
        records_out=data["record_count"],
    )
    console.print(f"[green]Manifested[/green] {manifest_path}")


@app.command("export")
def export_cmd(dataset_id: str = typer.Option(..., "--dataset-id")) -> None:
    """Create the final package with cards, reports, SHA256SUMS, and receipts."""
    export_dir = export_package(dataset_id)
    console.print(f"[green]Exported[/green] {export_dir}")


def print_tiers(tier_counts: dict[str, int]) -> None:
    table = Table(title="Quality tiers")
    table.add_column("Tier")
    table.add_column("Count", justify="right")
    for tier, count in tier_counts.items():
        table.add_row(tier, str(count))
    console.print(table)


if __name__ == "__main__":
    app()
