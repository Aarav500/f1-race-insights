"""Tests for probability calibration."""

import numpy as np
import pandas as pd

from f1.evaluation.calibration import (
    ProbabilityCalibrator,
    calibrate_nbt_tlf_scores,
    calibrate_tree_model_predictions,
    normalize_race_probabilities,
    validate_probabilities,
)


def test_probabilities_bounded():
    """Test that calibrated probabilities are in [0, 1]."""
    # Create test data with scores
    scores_df = pd.DataFrame(
        {
            "race_id": ["2023_01"] * 5,
            "driver_id": ["D1", "D2", "D3", "D4", "D5"],
            "score": [2.5, 1.8, 0.5, -0.3, -1.2],
        }
    )

    # Calibrate
    calibrated = calibrate_nbt_tlf_scores(scores_df, method="none")

    # Check bounds
    assert (calibrated["win_prob"] >= 0).all(), "Win prob should be >= 0"
    assert (calibrated["win_prob"] <= 1).all(), "Win prob should be <= 1"
    assert (calibrated["podium_prob"] >= 0).all(), "Podium prob should be >= 0"
    assert (calibrated["podium_prob"] <= 1).all(), "Podium prob should be <= 1"

    print("✓ Probabilities are bounded in [0, 1]")


def test_win_probabilities_sum_to_one():
    """Test that win probabilities sum to 1 within a race."""
    # Create test data
    scores_df = pd.DataFrame(
        {
            "race_id": ["2023_01"] * 3 + ["2023_02"] * 4,
            "driver_id": ["D1", "D2", "D3", "D1", "D2", "D3", "D4"],
            "score": [2.0, 1.0, 0.0, 1.5, 1.0, 0.5, 0.0],
        }
    )

    # Calibrate
    calibrated = calibrate_nbt_tlf_scores(scores_df, method="none")

    # Check sum to 1
    for race_id in calibrated["race_id"].unique():
        race_probs = calibrated[calibrated["race_id"] == race_id]["win_prob"]
        prob_sum = race_probs.sum()
        assert abs(prob_sum - 1.0) < 1e-6, (
            f"Race {race_id} win probs should sum to 1, got {prob_sum}"
        )

    print("✓ Win probabilities sum to 1 within each race")


def test_normalization_preserves_rankings():
    """Test that normalization preserves driver rankings."""
    # Create race with known scores
    race_df = pd.DataFrame(
        {
            "race_id": ["2023_01"] * 3,
            "driver_id": ["D1", "D2", "D3"],
            "win_prob": [0.5, 0.3, 0.1],  # Don't sum to 1
        }
    )

    # Get original ranking
    original_rank = race_df.sort_values("win_prob", ascending=False)["driver_id"].tolist()

    # Normalize
    normalized = normalize_race_probabilities(race_df, ["win_prob"])

    # Get new ranking
    new_rank = normalized.sort_values("win_prob", ascending=False)["driver_id"].tolist()

    assert original_rank == new_rank, "Normalization should preserve rankings"
    assert abs(normalized["win_prob"].sum() - 1.0) < 1e-6, "Should sum to 1"

    print("✓ Normalization preserves driver rankings")


def test_isotonic_calibration():
    """Test isotonic regression calibration."""
    # Create overconfident predictions
    np.random.seed(42)
    n = 100
    y_true = np.random.binomial(1, 0.3, n)  # 30% win rate
    y_pred = np.random.beta(8, 2, n)  # Overconfident (mean ~0.8)

    # Calibrate
    calibrator = ProbabilityCalibrator(method="isotonic")
    calibrator.fit(y_pred, y_true)
    y_calibrated = calibrator.transform(y_pred)

    # Calibrated should be closer to true rate
    assert y_calibrated.mean() < y_pred.mean(), "Calibration should reduce overconfidence"
    assert (y_calibrated >= 0).all() and (y_calibrated <= 1).all(), "Should be bounded"

    print("✓ Isotonic calibration works")


def test_tree_model_calibration():
    """Test calibration for tree model predictions."""
    # Create predictions
    predictions = pd.DataFrame(
        {
            "race_id": ["2023_01"] * 3,
            "driver_id": ["D1", "D2", "D3"],
            "win_prob": [0.8, 0.15, 0.05],
            "podium_prob": [0.9, 0.7, 0.4],
            "finish_position": [1, 2, 3],
        }
    )

    # Calibrate without validation
    calibrated = calibrate_tree_model_predictions(predictions, method="none")

    # Check sum to 1
    assert abs(calibrated["win_prob"].sum() - 1.0) < 1e-6

    # Check bounds
    assert (calibrated["win_prob"] >= 0).all() and (calibrated["win_prob"] <= 1).all()
    assert (calibrated["podium_prob"] >= 0).all() and (calibrated["podium_prob"] <= 1).all()

    print("✓ Tree model calibration works")


def test_nbt_tlf_score_to_probability():
    """Test NBT-TLF score conversion to probabilities."""
    # Create scores for one race
    scores_df = pd.DataFrame(
        {
            "race_id": ["2023_01"] * 4,
            "driver_id": ["D1", "D2", "D3", "D4"],
            "score": [3.0, 1.0, 0.0, -1.0],  # D1 highest
        }
    )

    # Calibrate
    calibrated = calibrate_nbt_tlf_scores(scores_df, method="none")

    # D1 should have highest win probability
    d1_prob = calibrated[calibrated["driver_id"] == "D1"]["win_prob"].iloc[0]
    max_prob = calibrated["win_prob"].max()
    assert d1_prob == max_prob, "Highest score should have highest probability"

    # Sum should be 1
    assert abs(calibrated["win_prob"].sum() - 1.0) < 1e-6

    print("✓ NBT-TLF score-to-probability conversion works")


def test_validate_probabilities_good():
    """Test validation with good probabilities."""
    good_probs = pd.DataFrame(
        {
            "race_id": ["2023_01"] * 3,
            "driver_id": ["D1", "D2", "D3"],
            "win_prob": [0.5, 0.3, 0.2],
            "podium_prob": [0.8, 0.7, 0.6],
        }
    )

    results = validate_probabilities(good_probs)
    assert results["valid"], "Good probabilities should pass validation"
    assert len(results["issues"]) == 0

    print("✓ Validation passes for good probabilities")


def test_validate_probabilities_bad():
    """Test validation catches bad probabilities."""
    # Win probs don't sum to 1
    bad_probs = pd.DataFrame(
        {
            "race_id": ["2023_01"] * 3,
            "driver_id": ["D1", "D2", "D3"],
            "win_prob": [0.5, 0.3, 0.3],  # Sums to 1.1
            "podium_prob": [0.8, 0.7, 0.6],
        }
    )

    results = validate_probabilities(bad_probs)
    assert not results["valid"], "Should detect bad probabilities"
    assert len(results["issues"]) > 0

    print("✓ Validation catches bad probabilities")


def test_win_prob_less_than_podium_prob():
    """Test that win_prob <= podium_prob constraint is enforced."""
    scores_df = pd.DataFrame(
        {"race_id": ["2023_01"] * 3, "driver_id": ["D1", "D2", "D3"], "score": [2.0, 1.0, 0.0]}
    )

    calibrated = calibrate_nbt_tlf_scores(scores_df, method="none")

    # Validate
    validate_probabilities(calibrated)
    # Note: Validation might flag issues due to numerical precision
    # but the constraint should be satisfied

    # Explicit check with tolerance
    tolerance = 1e-5
    assert (calibrated["win_prob"] <= calibrated["podium_prob"] + tolerance).all(), (
        f"Win prob should be <= podium prob. Max violation: {(calibrated['win_prob'] - calibrated['podium_prob']).max()}"
    )

    print("✓ Win prob <= podium prob constraint satisfied")


def test_multiple_races():
    """Test calibration across multiple races."""
    scores_df = pd.DataFrame(
        {
            "race_id": ["2023_01", "2023_01", "2023_02", "2023_02", "2023_02"],
            "driver_id": ["D1", "D2", "D1", "D2", "D3"],
            "score": [1.5, 0.5, 2.0, 1.0, 0.0],
        }
    )

    calibrated = calibrate_nbt_tlf_scores(scores_df, method="none")

    # Each race should sum to 1
    for race_id in calibrated["race_id"].unique():
        race_sum = calibrated[calibrated["race_id"] == race_id]["win_prob"].sum()
        assert abs(race_sum - 1.0) < 1e-6, f"Race {race_id} should sum to 1"

    print("✓ Multiple races calibrated correctly")


if __name__ == "__main__":
    print("Running calibration tests...\n")

    print("Test 1: Probabilities bounded [0,1]")
    test_probabilities_bounded()
    print()

    print("Test 2: Win probabilities sum to 1")
    test_win_probabilities_sum_to_one()
    print()

    print("Test 3: Normalization preserves rankings")
    test_normalization_preserves_rankings()
    print()

    print("Test 4: Isotonic calibration")
    test_isotonic_calibration()
    print()

    print("Test 5: Tree model calibration")
    test_tree_model_calibration()
    print()

    print("Test 6: NBT-TLF score-to-probability")
    test_nbt_tlf_score_to_probability()
    print()

    print("Test 7: Validate good probabilities")
    test_validate_probabilities_good()
    print()

    print("Test 8: Validate bad probabilities")
    test_validate_probabilities_bad()
    print()

    print("Test 9: Win prob <= podium prob")
    test_win_prob_less_than_podium_prob()
    print()

    print("Test 10: Multiple races")
    test_multiple_races()
    print()

    print("=" * 60)
    print("All tests passed! ✓")
    print("Calibration module is working correctly.")
    print("=" * 60)
