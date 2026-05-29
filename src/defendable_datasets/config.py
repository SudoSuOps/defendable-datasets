from __future__ import annotations

from pathlib import Path

import yaml

from .schemas import DomainConfig


def load_domain_config(path: str | Path | None, domain: str | None = None) -> DomainConfig:
    if path:
        data = yaml.safe_load(Path(path).read_text(encoding="utf-8")) or {}
        return DomainConfig.model_validate(data)
    if domain:
        candidate = Path("configs/domains") / f"{domain}.yaml"
        if candidate.exists():
            data = yaml.safe_load(candidate.read_text(encoding="utf-8")) or {}
            return DomainConfig.model_validate(data)
    return DomainConfig(domain=domain or "general", allowed_task_types=[])

