from __future__ import annotations

from defendable_datasets.grade import tier_for_score


def test_tier_scoring_maps_correctly() -> None:
    assert tier_for_score(95) == "royal_jelly"
    assert tier_for_score(80) == "honey"
    assert tier_for_score(55) == "jelly"
    assert tier_for_score(10) == "propolis"

