"""Tests for counterfactual analysis."""

import pandas as pd

from f1.analysis.counterfactuals import (
    apply_deltas,
    sanity_test_qualifying_degradation,
    sanity_test_qualifying_improvement,
)


def create_test_race_data():
    """Create test race data."""
    return pd.DataFrame(
        {
            "race_id": ["2024_01"] * 5,
            "driver_id": ["VER", "HAM", "LEC", "SAI", "PER"],
            "team": ["Red Bull", "Mercedes", "Ferrari", "Ferrari", "Red Bull"],
            "quali_position": [1, 2, 3, 4, 5],
            "driver_rolling_avg_finish": [1.8, 2.5, 3.0, 4.0, 3.5],
            "driver_rolling_avg_points": [22, 18, 15, 12, 14],
            "constructor_rolling_avg_finish": [1.5, 2.5, 2.8, 2.8, 1.5],
            "constructor_rolling_avg_points": [450, 350, 380, 380, 450],
            "driver_rolling_dnf_rate": [0.05, 0.08, 0.10, 0.12, 0.06],
            "constructor_rolling_dnf_rate": [0.03, 0.07, 0.09, 0.09, 0.03],
            "finish_position": [1, 2, 3, 4, 5],
        }
    )


def test_qualifying_delta_improvement():
    """Test qualifying position improvement."""
    data = create_test_race_data()

    # Improve VER from P1 to... wait, already P1, let's do HAM
    modified = apply_deltas(data, "HAM", {"qualifying_position_delta": -1})

    # HAM should move from P2 to P1
    assert modified.loc[modified["driver_id"] == "HAM", "quali_position"].values[0] == 1
    print("✓ Qualifying improvement works")


def test_qualifying_delta_degradation():
    """Test qualifying position degradation."""
    data = create_test_race_data()

    # Degrade VER from P1 to P3
    modified = apply_deltas(data, "VER", {"qualifying_position_delta": +2})

    assert modified.loc[modified["driver_id"] == "VER", "quali_position"].values[0] == 3
    print("✓ Qualifying degradation works")


def test_qualifying_clamping():
    """Test that qualifying position is clamped to [1, 20]."""
    data = create_test_race_data()

    # Try to improve beyond P1
    modified = apply_deltas(data, "VER", {"qualifying_position_delta": -10})
    assert modified.loc[modified["driver_id"] == "VER", "quali_position"].values[0] == 1

    # Try to degrade beyond P20
    modified = apply_deltas(data, "PER", {"qualifying_position_delta": +50})
    assert modified.loc[modified["driver_id"] == "PER", "quali_position"].values[0] == 20

    print("✓ Qualifying position clamping works")


def test_driver_form_delta():
    """Test driver form delta application."""
    data = create_test_race_data()

    original_finish = data.loc[data["driver_id"] == "HAM", "driver_rolling_avg_finish"].values[0]
    original_points = data.loc[data["driver_id"] == "HAM", "driver_rolling_avg_points"].values[0]

    # Apply 10% improvement
    modified = apply_deltas(data, "HAM", {"driver_form_delta": 0.1})

    new_finish = modified.loc[modified["driver_id"] == "HAM", "driver_rolling_avg_finish"].values[0]
    new_points = modified.loc[modified["driver_id"] == "HAM", "driver_rolling_avg_points"].values[0]

    # Finish should improve (decrease)
    assert new_finish < original_finish
    # Points should improve (increase)
    assert new_points > original_points

    print("✓ Driver form delta works")


def test_reliability_delta():
    """Test reliability risk delta."""
    data = create_test_race_data()

    original_dnf = data.loc[data["driver_id"] == "LEC", "driver_rolling_dnf_rate"].values[0]

    # Increase DNF risk by 0.05
    modified = apply_deltas(data, "LEC", {"reliability_risk_delta": 0.05})

    new_dnf = modified.loc[modified["driver_id"] == "LEC", "driver_rolling_dnf_rate"].values[0]

    assert abs(new_dnf - (original_dnf + 0.05)) < 1e-6

    print("✓ Reliability delta works")


def test_multiple_deltas():
    """Test applying multiple deltas at once."""
    data = create_test_race_data()

    changes = {
        "qualifying_position_delta": -1,
        "driver_form_delta": 0.1,
        "reliability_risk_delta": -0.02,
    }

    modified = apply_deltas(data, "SAI", changes)

    # All changes should be applied
    assert modified.loc[modified["driver_id"] == "SAI", "quali_position"].values[0] == 3  # 4->3

    print("✓ Multiple deltas work")


def test_sanity_tests():
    """Run built-in sanity tests."""
    sanity_test_qualifying_improvement()
    sanity_test_qualifying_degradation()
    print("✓ Sanity tests pass")


if __name__ == "__main__":
    print("Running counterfactual tests...\n")

    print("Test 1: Qualifying improvement")
    test_qualifying_delta_improvement()
    print()

    print("Test 2: Qualifying degradation")
    test_qualifying_delta_degradation()
    print()

    print("Test 3: Qualifying clamping")
    test_qualifying_clamping()
    print()

    print("Test 4: Driver form delta")
    test_driver_form_delta()
    print()

    print("Test 5: Reliability delta")
    test_reliability_delta()
    print()

    print("Test 6: Multiple deltas")
    test_multiple_deltas()
    print()

    print("Test 7: Sanity tests")
    test_sanity_tests()
    print()

    print("=" * 60)
    print("All counterfactual tests passed! ✓")
    print("=" * 60)
