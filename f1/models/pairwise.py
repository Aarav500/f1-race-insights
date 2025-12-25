"""Pairwise dataset builder for Bradley-Terry models.

Converts race results into pairwise comparisons where each pair (driver_i, driver_j)
represents a head-to-head comparison with outcome y=1 if driver_i beat driver_j.
"""

import logging
from typing import Union

import numpy as np
import pandas as pd

logger = logging.getLogger(__name__)


def create_pairwise_comparisons(
    features_df: pd.DataFrame, include_dnf: bool = False
) -> pd.DataFrame:
    """Convert race results into pairwise comparisons for Bradley-Terry model.

    For each race with n drivers, creates all pairwise comparisons (i, j) where:
    - y = 1 if driver i finished ahead of driver j (finish_i < finish_j)
    - y = 0 if driver j finished ahead of driver i

    Args:
        features_df: DataFrame with race features per driver (from features.py)
        include_dnf: If True, include DNF drivers in comparisons

    Returns:
        DataFrame with pairwise comparisons
    """
    logger.info("Creating pairwise comparisons...")

    # Check required columns
    required_cols = ["race_id", "driver_id", "season", "round"]
    missing_cols = [col for col in required_cols if col not in features_df.columns]
    if missing_cols:
        raise ValueError(f"Missing required columns: {missing_cols}")

    # Need finish_position for determining winners
    if "finish_position" not in features_df.columns:
        raise ValueError("DataFrame must contain 'finish_position' for pairwise comparisons")

    pairwise_data = []

    # Process each race
    for race_id, race_data in features_df.groupby("race_id"):
        race_data = race_data.copy()

        # Filter out DNFs if requested
        if not include_dnf:
            # Assume DNF if finish_position is NaN or > 20
            mask = race_data["finish_position"].notna() & (race_data["finish_position"] <= 20)
            race_data = race_data[mask]

        n_drivers = len(race_data)

        # Generate all pairwise comparisons
        drivers = race_data.to_dict("records")

        for i in range(n_drivers):
            for j in range(i + 1, n_drivers):  # Only generate each pair once (i < j in index)
                driver_i = drivers[i]
                driver_j = drivers[j]

                finish_i = driver_i["finish_position"]
                finish_j = driver_j["finish_position"]

                # Determine winner (lower finish position = better)
                if pd.notna(finish_i) and pd.notna(finish_j):
                    # Create both orderings to capture full comparison
                    # (i, j) with y=1 if i beat j
                    y_ij = 1 if finish_i < finish_j else 0

                    # Build pairwise row
                    pair_row = create_pair_features(driver_i, driver_j, y_ij, str(race_id))
                    pairwise_data.append(pair_row)

    pairwise_df = pd.DataFrame(pairwise_data)
    logger.info(
        f"Created {len(pairwise_df)} pairwise comparisons from {features_df['race_id'].nunique()} races"
    )

    return pairwise_df


def create_pair_features(driver_i: dict, driver_j: dict, y: int, race_id: str) -> dict:
    """Create feature row for a pairwise comparison.

    Args:
        driver_i: Features for driver i
        driver_j: Features for driver j
        y: 1 if driver_i beat driver_j, 0 otherwise
        race_id: Race identifier

    Returns:
        Dictionary with pairwise features
    """
    # Base features
    pair_features = {
        "race_id": race_id,
        "season": driver_i.get("season"),
        "round": driver_i.get("round"),
        "driver_i": driver_i["driver_id"],
        "driver_j": driver_j["driver_id"],
        "y": y,
    }

    # Add date if available
    if "race_date" in driver_i:
        pair_features["race_date"] = driver_i["race_date"]

    # Track identifier
    if "track_id" in driver_i:
        pair_features["track_id"] = driver_i["track_id"]

    # Constructor/team information
    if "team" in driver_i:
        pair_features["team_i"] = driver_i["team"]
        pair_features["team_j"] = driver_j["team"]
        pair_features["same_team"] = int(driver_i["team"] == driver_j["team"])

    # Delta features (key for Bradley-Terry: difference in strengths)
    feature_cols = [
        "quali_position",
        "quali_delta_to_pole",
        "driver_rolling_avg_finish",
        "driver_rolling_avg_points",
        "driver_rolling_dnf_rate",
        "constructor_rolling_avg_finish",
        "constructor_rolling_avg_points",
    ]

    for col in feature_cols:
        if col in driver_i and col in driver_j:
            val_i: float = float(driver_i[col]) if pd.notna(driver_i[col]) else 0.0
            val_j: float = float(driver_j[col]) if pd.notna(driver_j[col]) else 0.0

            # Delta: positive means driver_i is better on this metric
            # For position features (lower is better), flip sign
            if "position" in col or "finish" in col:
                pair_features[f"delta_{col}"] = val_j - val_i  # Flip for positions
            else:
                pair_features[f"delta_{col}"] = val_i - val_j

    # Individual features (both drivers)
    for col in feature_cols:
        if col in driver_i:
            pair_features[f"{col}_i"] = float(driver_i[col]) if pd.notna(driver_i[col]) else 0.0
        if col in driver_j:
            pair_features[f"{col}_j"] = float(driver_j[col]) if pd.notna(driver_j[col]) else 0.0

    return pair_features


def validate_pairwise_dataset(pairwise_df: pd.DataFrame) -> dict:
    """Validate pairwise dataset and return statistics.

    Args:
        pairwise_df: Pairwise comparison DataFrame

    Returns:
        Dictionary with validation statistics
    """
    stats: dict[str, Union[int, float, str]] = {}

    # Count races and pairs
    stats["num_races"] = pairwise_df["race_id"].nunique()
    stats["total_pairs"] = len(pairwise_df)
    avg_pairs_per_race: float = float(stats["total_pairs"]) / float(stats["num_races"])
    stats["avg_pairs_per_race"] = avg_pairs_per_race

    # Check for balance
    y_mean: float = pairwise_df["y"].mean()
    stats["y_mean"] = y_mean
    y_balance: str = f"{pairwise_df['y'].sum()} wins / {len(pairwise_df)} total"
    stats["y_balance"] = y_balance

    # Check for missing values in key columns
    key_cols = ["race_id", "driver_i", "driver_j", "y"]
    for col in key_cols:
        if col in pairwise_df.columns:
            missing = pairwise_df[col].isna().sum()
            if missing > 0:
                stats[f"{col}_missing"] = missing

    # Average number of drivers per race
    drivers_per_race: list[int] = []
    for race_id in pairwise_df["race_id"].unique():
        race_pairs = pairwise_df[pairwise_df["race_id"] == race_id]
        # Each driver appears in multiple pairs
        unique_drivers = set(race_pairs["driver_i"].unique()) | set(race_pairs["driver_j"].unique())
        drivers_per_race.append(len(unique_drivers))

    avg_drivers_per_race: float = float(np.mean(np.array(drivers_per_race)))
    stats["avg_drivers_per_race"] = avg_drivers_per_race

    logger.info("Pairwise dataset validation:")
    for key, value in stats.items():
        logger.info(f"  {key}: {value}")

    return stats


def expected_pairs_count(n_drivers: int) -> int:
    """Calculate expected number of pairwise comparisons.

    For n drivers, we generate C(n, 2) = n*(n-1)/2 unique pairs.

    Args:
        n_drivers: Number of drivers in race

    Returns:
        Expected number of pairs
    """
    return n_drivers * (n_drivers - 1) // 2


if __name__ == "__main__":
    # Example usage
    import sys

    if len(sys.argv) < 2:
        print("Usage: python -m f1.models.pairwise <features.parquet>")
        sys.exit(1)

    # Load features
    features_path = sys.argv[1]
    logger.info(f"Loading features from {features_path}")
    features_df = pd.read_parquet(features_path)

    # Create pairwise dataset
    pairwise_df = create_pairwise_comparisons(features_df)

    # Validate
    stats = validate_pairwise_dataset(pairwise_df)

    # Save
    output_path = features_path.replace(".parquet", "_pairwise.parquet")
    pairwise_df.to_parquet(output_path, index=False)
    logger.info(f"Saved pairwise dataset to {output_path}")
