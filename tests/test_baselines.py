"""Tests for baseline models to ensure determinism and correctness."""

import tempfile
from pathlib import Path

import pandas as pd

from f1.models.baselines import EloBaseline, QualifyingFrequencyBaseline


def create_test_race_data():
    """Create synthetic F1 race data for testing."""
    data = []

    # Create 3 races with 5 drivers each
    drivers = ["VER", "HAM", "LEC", "SAI", "PER"]
    teams = ["Red Bull", "Mercedes", "Ferrari", "Ferrari", "Red Bull"]

    for season in [2023]:
        for round_num in [1, 2, 3]:
            for i, driver in enumerate(drivers):
                # Qualifying position correlates with finish (but not perfectly)
                quali_pos = i + 1
                # Add some variation in finish position
                if round_num == 2 and driver == "HAM":
                    finish_pos = 1  # HAM wins race 2
                elif driver == "VER":
                    finish_pos = 1 if round_num != 2 else 2
                else:
                    finish_pos = quali_pos

                data.append(
                    {
                        "season": season,
                        "round": round_num,
                        "race_id": f"{season}_{round_num:02d}",
                        "driver_id": driver,
                        "team": teams[i],
                        "quali_position": quali_pos,
                        "finish_position": finish_pos,
                    }
                )

    return pd.DataFrame(data)


def test_qualifying_baseline_determinism():
    """Test that QualifyingFrequencyBaseline produces same results on same data."""
    df = create_test_race_data()

    # Train model twice
    model1 = QualifyingFrequencyBaseline()
    model1.fit(df)

    model2 = QualifyingFrequencyBaseline()
    model2.fit(df)

    # Check that learned probabilities are identical
    assert model1.win_probs == model2.win_probs, "Win probabilities should be deterministic"
    assert model1.podium_probs == model2.podium_probs, (
        "Podium probabilities should be deterministic"
    )

    # Make predictions
    test_df = df[df["round"] == 1].copy()
    pred1 = model1.predict(test_df)
    pred2 = model2.predict(test_df)

    # Check predictions are identical
    pd.testing.assert_frame_equal(pred1, pred2)
    print("✓ QualifyingFrequencyBaseline is deterministic")


def test_elo_baseline_determinism():
    """Test that EloBaseline produces same results on same data."""
    df = create_test_race_data()

    # Train model twice with same parameters
    model1 = EloBaseline(k_factor=32.0, initial_rating=1500.0)
    model1.fit(df)

    model2 = EloBaseline(k_factor=32.0, initial_rating=1500.0)
    model2.fit(df)

    # Check that ratings are identical
    assert model1.driver_ratings == model2.driver_ratings, "Driver ratings should be deterministic"
    assert model1.constructor_ratings == model2.constructor_ratings, (
        "Constructor ratings should be deterministic"
    )

    # Make predictions
    test_df = df[df["round"] == 3].copy()
    pred1 = model1.predict(test_df)
    pred2 = model2.predict(test_df)

    # Check predictions are identical
    pd.testing.assert_frame_equal(pred1, pred2)
    print("✓ EloBaseline is deterministic")


def test_qualifying_baseline_probabilities():
    """Test that qualifying baseline produces valid probabilities."""
    df = create_test_race_data()

    model = QualifyingFrequencyBaseline()
    model.fit(df)

    # Make predictions
    test_df = df[df["round"] == 1].copy()
    predictions = model.predict(test_df)

    # Check probabilities are in [0, 1]
    assert (predictions["win_prob"] >= 0).all() and (predictions["win_prob"] <= 1).all()
    assert (predictions["podium_prob"] >= 0).all() and (predictions["podium_prob"] <= 1).all()

    # Check win_prob <= podium_prob (winning means you're on podium)
    assert (predictions["win_prob"] <= predictions["podium_prob"]).all()

    print("✓ QualifyingFrequencyBaseline produces valid probabilities")


def test_elo_baseline_probabilities():
    """Test that Elo baseline produces valid probabilities."""
    df = create_test_race_data()

    model = EloBaseline()
    model.fit(df)

    # Make predictions
    test_df = df[df["round"] == 3].copy()
    predictions = model.predict(test_df)

    # Check probabilities are in [0, 1]
    assert (predictions["win_prob"] >= 0).all() and (predictions["win_prob"] <= 1).all()
    assert (predictions["podium_prob"] >= 0).all() and (predictions["podium_prob"] <= 1).all()

    # Check probabilities sum to ~1 for each race
    for race_id in predictions["race_id"].unique():
        race_preds = predictions[predictions["race_id"] == race_id]
        win_prob_sum = race_preds["win_prob"].sum()
        assert abs(win_prob_sum - 1.0) < 0.01, (
            f"Win probabilities should sum to 1, got {win_prob_sum}"
        )

    print("✓ EloBaseline produces valid probabilities")


def test_elo_chronological_updates():
    """Test that Elo updates are chronological."""
    df = create_test_race_data()

    model = EloBaseline()
    model.fit(df)

    # Check that we have rating history for each race
    assert len(model.rating_history) == 3, "Should have 3 race snapshots"

    # Check chronological order
    for i in range(len(model.rating_history) - 1):
        curr = model.rating_history[i]
        next_race = model.rating_history[i + 1]

        assert (curr["season"], curr["round"]) < (next_race["season"], next_race["round"]), (
            "Rating updates should be in chronological order"
        )

    print("✓ EloBaseline updates ratings chronologically")


def test_model_persistence():
    """Test that models can be saved and loaded."""
    df = create_test_race_data()

    with tempfile.TemporaryDirectory() as tmpdir:
        # Test qualifying baseline
        model1 = QualifyingFrequencyBaseline()
        model1.fit(df)

        save_path = Path(tmpdir) / "test_qual_model.joblib"
        model1.save(save_path)

        model1_loaded = QualifyingFrequencyBaseline.load(save_path)

        # Check loaded model produces same predictions
        test_df = df[df["round"] == 1].copy()
        pred1 = model1.predict(test_df)
        pred1_loaded = model1_loaded.predict(test_df)
        pd.testing.assert_frame_equal(pred1, pred1_loaded)

        # Test Elo baseline
        model2 = EloBaseline()
        model2.fit(df)

        save_path2 = Path(tmpdir) / "test_elo_model.joblib"
        model2.save(save_path2)

        model2_loaded = EloBaseline.load(save_path2)

        # Check loaded model produces same predictions
        test_df2 = df[df["round"] == 3].copy()
        pred2 = model2.predict(test_df2)
        pred2_loaded = model2_loaded.predict(test_df2)
        pd.testing.assert_frame_equal(pred2, pred2_loaded)

    print("✓ Models can be saved and loaded")


def test_qualifying_baseline_empirical_accuracy():
    """Test that qualifying baseline learns correct empirical probabilities."""
    # Create simple dataset where position 1 always wins
    data = []
    for i in range(10):  # 10 races
        for pos in range(1, 4):  # 3 drivers
            data.append(
                {
                    "season": 2023,
                    "round": i + 1,
                    "race_id": f"2023_{i + 1:02d}",
                    "driver_id": f"D{pos}",
                    "team": f"Team{pos}",
                    "quali_position": pos,
                    "finish_position": pos,  # Perfect correlation
                }
            )

    df = pd.DataFrame(data)

    model = QualifyingFrequencyBaseline()
    model.fit(df)

    # Check learned probabilities
    assert model.win_probs[1] == 1.0, "Position 1 should have 100% win rate"
    assert model.win_probs[2] == 0.0, "Position 2 should have 0% win rate"
    assert model.podium_probs[1] == 1.0, "Position 1 should have 100% podium rate"
    assert model.podium_probs[2] == 1.0, (
        "Position 2 should have 100% podium rate (always finishes top 3)"
    )

    print("✓ QualifyingFrequencyBaseline learns correct empirical probabilities")


def test_elo_rating_changes():
    """Test that Elo ratings change based on results."""
    df = create_test_race_data()

    model = EloBaseline(initial_rating=1500.0)
    model.fit(df)

    # VER won 2 races, should have higher rating
    # HAM won 1 race
    ver_rating = model.driver_ratings["VER"]
    ham_rating = model.driver_ratings["HAM"]

    # VER should have higher rating (won more races)
    assert ver_rating > ham_rating, (
        f"VER ({ver_rating}) should have higher rating than HAM ({ham_rating})"
    )

    # All ratings should be different from initial
    for driver, rating in model.driver_ratings.items():
        if driver in ["VER", "HAM", "LEC"]:  # Drivers who participated
            assert rating != 1500.0, f"{driver} rating should have changed from initial"

    print("✓ Elo ratings change appropriately based on results")


if __name__ == "__main__":
    print("Running baseline model tests...\n")

    print("Test 1: QualifyingFrequencyBaseline determinism")
    test_qualifying_baseline_determinism()
    print()

    print("Test 2: EloBaseline determinism")
    test_elo_baseline_determinism()
    print()

    print("Test 3: QualifyingFrequencyBaseline valid probabilities")
    test_qualifying_baseline_probabilities()
    print()

    print("Test 4: EloBaseline valid probabilities")
    test_elo_baseline_probabilities()
    print()

    print("Test 5: Elo chronological updates")
    test_elo_chronological_updates()
    print()

    print("Test 6: Model persistence")
    test_model_persistence()
    print()

    print("Test 7: QualifyingFrequencyBaseline empirical accuracy")
    test_qualifying_baseline_empirical_accuracy()
    print()

    print("Test 8: Elo rating changes")
    test_elo_rating_changes()
    print()

    print("=" * 60)
    print("All tests passed! ✓")
    print("Models are deterministic and produce valid predictions.")
    print("=" * 60)
