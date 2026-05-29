from __future__ import annotations

from defendable_datasets.hash_utils import attach_hashes
from tests.conftest import sample_record


def test_content_hashes_are_stable() -> None:
    first = attach_hashes(sample_record())
    second = attach_hashes(sample_record())
    assert first["hashes"]["content_sha256"] == second["hashes"]["content_sha256"]
    assert first["hashes"]["record_sha256"] == second["hashes"]["record_sha256"]

