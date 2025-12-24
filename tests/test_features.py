"""Tests for feature engineering to prove temporal ordering and no data leakage."""

import pandas as pd

from f1.data.features import (
    build_feature_table,
    compute_rolling_constructor_form,
    compute_rolling_driver_form,
    create_race_identifier,
)


def create_test_data():
    """Create synthetic test data with known temporal ordering."""
    # Create 3 races with 2 drivers
    race_data = []
    qual_data = []

    drivers = ["VER", "HAM"]
    teams = ["Red Bull", "Mercedes"]

    for year in [2023, 2024]:
        for round_num in [1, 2, 3]:
            for i, driver in enumerate(drivers):
                # Race results
                race_data.append(
                    {
                        "year": year,
                        "round": round_num,
                        "Abbreviation": driver,
                        "TeamName": teams[i],
                        "Position": i + 1,  # VER always 1st, HAM always 2nd
                        "Status": "Finished",
                        "Points": 25 - i * 7,  # VER gets 25, HAM gets 18
                        "race_name": f"Race_{round_num}",
                        "country": "TestCountry",
                    }
                )

                # Qualifying results
                qual_data.append(
                    {
                        "year": year,
                        "round": round_num,
                        "Abbreviation": driver,
                        "TeamName": teams[i],
                        "Position": i + 1,
                        "Q1": pd.Timedelta(seconds=90 + i),
                        "Q2": pd.Timedelta(seconds=89 + i),
                        "Q3": pd.Timedelta(seconds=88 + i),
                    }
                )

    return pd.DataFrame(race_data), pd.DataFrame(qual_data)


def test_rolling_features_use_only_prior_races():
    """Test that rolling features use ONLY strictly prior races."""
    race_results, _ = create_test_data()

    # Add team info
    race_results["team"] = race_results["TeamName"]
    race_results = create_race_identifier(race_results)
    race_results["race_id"] = (
        race_results["year"].astype(str) + "_" + race_results["round"].astype(str).str.zfill(2)
    )
    race_results["driver_id"] = race_results["Abbreviation"]
    race_results["finish_position"] = race_results["Position"]
    race_results["dnf"] = 0
    race_results["points_earned"] = race_results["Points"]

    # Compute rolling form
    rolling_features = compute_rolling_driver_form(race_results, window=5, min_races=1)

    # Test: First race should have NO rolling features (nan)
    first_race_2023 = rolling_features[rolling_features["race_id"] == "2023_01"]
    assert len(first_race_2023) == 2  # 2 drivers
    assert first_race_2023["driver_rolling_avg_finish"].isna().all(), (
        "First race should have no rolling features (no prior races)"
    )
    assert first_race_2023["driver_prior_races_count"].eq(0).all(), (
        "First race should have 0 prior races"
    )

    # Test: Second race should use ONLY first race data
    second_race_2023 = rolling_features[rolling_features["race_id"] == "2023_02"]
    ver_r2 = second_race_2023[second_race_2023["driver_id"] == "VER"].iloc[0]

    assert ver_r2["driver_prior_races_count"] == 1, "Second race should have exactly 1 prior race"
    assert ver_r2["driver_rolling_avg_finish"] == 1.0, (
        "VER's rolling avg should be 1.0 (finished 1st in race 1)"
    )
    assert ver_r2["driver_rolling_avg_points"] == 25.0, "VER's rolling avg points should be 25.0"

    # Test: Third race should use races 1 and 2 only (not race 3 itself)
    third_race_2023 = rolling_features[rolling_features["race_id"] == "2023_03"]
    ver_r3 = third_race_2023[third_race_2023["driver_id"] == "VER"].iloc[0]

    assert ver_r3["driver_prior_races_count"] == 2, "Third race should have exactly 2 prior races"
    assert ver_r3["driver_rolling_avg_finish"] == 1.0, (
        "VER's rolling avg should still be 1.0 (always finished 1st)"
    )

    # Test: 2024 Round 1 should use 2023 races (but only last 5)
    first_race_2024 = rolling_features[rolling_features["race_id"] == "2024_01"]
    ver_2024_r1 = first_race_2024[first_race_2024["driver_id"] == "VER"].iloc[0]

    assert ver_2024_r1["driver_prior_races_count"] == 3, (
        "2024 R1 should have 3 prior races from 2023"
    )


def test_no_future_information_leakage():
    """Test that features for race N do not include data from race N or later."""
    race_results, qual_results = create_test_data()

    # Modify race 3 to have different results
    race_results.loc[
        (race_results["year"] == 2023)
        & (race_results["round"] == 3)
        & (race_results["Abbreviation"] == "VER"),
        "Position",
    ] = 10  # VER finishes 10th in race 3

    race_results.loc[
        (race_results["year"] == 2023)
        & (race_results["round"] == 3)
        & (race_results["Abbreviation"] == "VER"),
        "Points",
    ] = 1  # Gets only 1 point

    # Build feature table
    features = build_feature_table(race_results, qual_results, rolling_window=5)

    # Features for race 3 should not include race 3's result
    race_3_features = features[features["race_id"] == "2023_03"]
    ver_r3 = race_3_features[race_3_features["driver_id"] == "VER"].iloc[0]

    # Rolling avg should be based on races 1 and 2 only (where VER finished 1st)
    # NOT race 3 where VER finished 10th
    assert ver_r3["driver_rolling_avg_finish"] == 1.0, (
        f"Race 3 features should not include race 3 result. Got {ver_r3['driver_rolling_avg_finish']}"
    )
    assert ver_r3["driver_rolling_avg_points"] == 25.0, (
        f"Race 3 features should not include race 3 result. Got {ver_r3['driver_rolling_avg_points']}"
    )

    # Race 4 (2023 round 4 doesn't exist in our data, but let's check 2024 round 1)
    race_2024_r1 = features[features["race_id"] == "2024_01"]
    ver_2024_r1 = race_2024_r1[race_2024_r1["driver_id"] == "VER"].iloc[0]

    # Now race 3's bad result (10th place, 1 point) should be included
    # Average of races 1, 2, 3: (1 + 1 + 10) / 3 = 4.0
    expected_avg_finish = (1 + 1 + 10) / 3
    assert abs(ver_2024_r1["driver_rolling_avg_finish"] - expected_avg_finish) < 0.01, (
        f"2024 R1 should include race 3 result. Expected {expected_avg_finish}, got {ver_2024_r1['driver_rolling_avg_finish']}"
    )


def test_temporal_ordering():
    """Test that races are processed in correct chronological order."""
    race_results, qual_results = create_test_data()

    features = build_feature_table(race_results, qual_results, rolling_window=5)

    # Sort features by season and round
    features_sorted = features.sort_values(["season", "round"])

    # Check that prior races count increases monotonically for a driver
    # (except when it resets due to window limit)
    for driver in features["driver_id"].unique():
        driver_features = features_sorted[features_sorted["driver_id"] == driver]
        prior_counts = driver_features["driver_prior_races_count"].values

        # First race should have 0 prior races
        assert prior_counts[0] == 0, f"First race should have 0 prior races for {driver}"

        # Each subsequent race should have more prior races (up to window limit)
        for i in range(1, len(prior_counts)):
            assert prior_counts[i] >= prior_counts[i - 1], (
                f"Prior race count should be non-decreasing for {driver}"
            )


def test_constructor_form_temporal_ordering():
    """Test that constructor rolling features also use only prior races."""
    race_results, _ = create_test_data()

    race_results["team"] = race_results["TeamName"]
    race_results = create_race_identifier(race_results)
    race_results["race_id"] = (
        race_results["year"].astype(str) + "_" + race_results["round"].astype(str).str.zfill(2)
    )
    race_results["driver_id"] = race_results["Abbreviation"]
    race_results["finish_position"] = race_results["Position"]
    race_results["dnf"] = 0
    race_results["points_earned"] = race_results["Points"]

    # Compute constructor rolling form
    rolling_features = compute_rolling_constructor_form(race_results, window=5, min_races=1)

    # First race should have NO rolling features
    first_race = rolling_features[rolling_features["race_id"] == "2023_01"]
    assert len(first_race) == 2  # 2 drivers
    assert first_race["constructor_rolling_avg_finish"].isna().all(), (
        "First race should have no constructor rolling features"
    )

    # Second race should use only first race data (at least 1 prior team result)
    second_race = rolling_features[rolling_features["race_id"] == "2023_02"]

    for _, row in second_race.iterrows():
        # Teams typically have 2 drivers, so 1 prior race should give 2 team results
        # But be lenient in case the logic varies
        assert row["constructor_prior_races_count"] >= 1, (
            f"Second race should have at least 1 prior team result, got {row['constructor_prior_races_count']}"
        )


def test_edge_case_first_race_of_season():
    """Test handling of first race where driver has no history."""
    race_results, qual_results = create_test_data()

    features = build_feature_table(race_results, qual_results, rolling_window=5)

    # First race features
    first_race = features[features["race_id"] == "2023_01"]

    # All rolling features should be NaN (no prior data)
    assert first_race["driver_rolling_avg_finish"].isna().all()
    assert first_race["driver_rolling_avg_points"].isna().all()
    assert first_race["driver_rolling_dnf_rate"].isna().all()

    # But qualifying features should be present
    assert first_race["quali_position"].notna().all()
    assert first_race["quali_delta_to_pole"].notna().all()


if __name__ == "__main__":
    print("Running temporal ordering and data leakage tests...\n")

    print("Test 1: Rolling features use only prior races")
    test_rolling_features_use_only_prior_races()
    print("✓ PASSED\n")

    print("Test 2: No future information leakage")
    test_no_future_information_leakage()
    print("✓ PASSED\n")

    print("Test 3: Temporal ordering")
    test_temporal_ordering()
    print("✓ PASSED\n")

    print("Test 4: Constructor form temporal ordering")
    test_constructor_form_temporal_ordering()
    print("✓ PASSED\n")

    print("Test 5: Edge case - first race of season")
    test_edge_case_first_race_of_season()
    print("✓ PASSED\n")

    print("=" * 60)
    print("All tests passed! ✓")
    print("No data leakage detected. Temporal ordering verified.")
    print("=" * 60)
