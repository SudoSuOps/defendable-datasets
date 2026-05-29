from __future__ import annotations

from datetime import datetime, timezone
from typing import Any, Literal

from pydantic import BaseModel, Field, field_validator


SourceType = Literal["synthetic", "human", "public", "licensed", "internal"]
QualityTier = Literal["honey", "jelly", "propolis", "royal_jelly"]
StageName = Literal["ingest", "validate", "dedupe", "grade", "split", "manifest", "export"]


def now_iso() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat()


class Source(BaseModel):
    source_type: SourceType
    source_name: str
    source_uri: str | None = None
    license: str | None = None
    created_by: str | None = None
    created_at: str = Field(default_factory=now_iso)


class Quality(BaseModel):
    tier: QualityTier = "jelly"
    score: float = 0.0
    flags: list[str] = Field(default_factory=list)
    grader: str = "ungraded"
    graded_at: str = Field(default_factory=now_iso)


class Hashes(BaseModel):
    record_sha256: str = ""
    content_sha256: str = ""


class RecordMetadata(BaseModel):
    model_used: str | None = None
    prompt_template: str | None = None
    version: str = "v1"
    notes: str | None = None


class DatasetRecord(BaseModel):
    id: str
    dataset_id: str
    domain: str
    task_type: str
    instruction: str
    input: str = ""
    output: str
    source: Source
    quality: Quality = Field(default_factory=Quality)
    hashes: Hashes = Field(default_factory=Hashes)
    metadata: RecordMetadata = Field(default_factory=RecordMetadata)

    @field_validator("instruction", "output")
    @classmethod
    def required_text(cls, value: str) -> str:
        if not value or not value.strip():
            raise ValueError("field must be non-empty")
        return value


class Receipt(BaseModel):
    receipt_id: str
    dataset_id: str
    stage: StageName
    started_at: str
    finished_at: str
    input_path: str
    output_path: str
    input_sha256: str
    output_sha256: str
    records_in: int
    records_out: int
    records_rejected: int = 0
    flags: list[str] = Field(default_factory=list)
    software_version: str = "0.1.0"


class DomainRules(BaseModel):
    min_instruction_chars: int = 1
    min_output_chars: int = 1
    max_output_chars: int = 12000
    require_numeric_discipline: bool = False
    reject_placeholder_text: bool = True
    require_source_block: bool = True
    require_hardware_fields: bool = False


class DomainConfig(BaseModel):
    domain: str
    allowed_task_types: list[str] = Field(default_factory=list)
    quality_rules: DomainRules = Field(default_factory=DomainRules)
    red_flags: list[str] = Field(default_factory=list)


class PackageManifest(BaseModel):
    dataset_id: str
    domain: str
    version: str = "v1"
    created_at: str = Field(default_factory=now_iso)
    record_count: int
    splits: dict[str, int]
    quality_counts: dict[str, int]
    hashes: dict[str, str]
    provenance_summary: dict[str, Any]
    license_summary: dict[str, Any]
    receipts: list[str]

