"""Feature engineering for F1 race predictions with strict temporal ordering.

This module ensures no data leakage by using only strictly prior races for
rolling features and statistics.
"""

import logging
from pathlib import Path

import numpy as np
import pandas as pd

logger = logging.getLogger(__name__)


def load_raw_data(data_dir: Path) -> tuple[pd.DataFrame, pd.DataFrame]:
    """Load raw race and qualifying data from parquet files.

    Args:
        data_dir: Directory containing raw parquet files

    Returns:
        Tuple of (race_results, qualifying_results) DataFrames
    """
    logger.info(f"Loading raw data from {data_dir}")

    race_files = sorted(data_dir.glob("race_results_*.parquet"))
    qual_files = sorted(data_dir.glob("qualifying_results_*.parquet"))

    if not race_files or not qual_files:
        raise ValueError(f"No data files found in {data_dir}")

    # Load all race results
    race_dfs = [pd.read_parquet(f) for f in race_files]
    race_results = pd.concat(race_dfs, ignore_index=True)

    # Load all qualifying results
    qual_dfs = [pd.read_parquet(f) for f in qual_files]
    qual_results = pd.concat(qual_dfs, ignore_index=True)

    logger.info(f"Loaded {len(race_results)} race results, {len(qual_results)} qualifying results")
    return race_results, qual_results


def create_race_identifier(df: pd.DataFrame) -> pd.DataFrame:
    """Add unique race identifier to DataFrame.

    Args:
        df: DataFrame with 'year' and 'round' columns

    Returns:
        DataFrame with added 'race_id' column
    """
    df = df.copy()
    df["race_id"] = df["year"].astype(str) + "_" + df["round"].astype(str).str.zfill(2)
    return df


def extract_qualifying_features(qual_results: pd.DataFrame) -> pd.DataFrame:
    """Extract qualifying-based features.

    Args:
        qual_results: Raw qualifying results

    Returns:
        DataFrame with qualifying features per (race_id, driver)
    """
    df = create_race_identifier(qual_results)

    # Convert Q1/Q2/Q3 times to seconds if they're timedelta
    for col in ["Q1", "Q2", "Q3"]:
        if col in df.columns and pd.api.types.is_timedelta64_dtype(df[col]):
            df[col] = df[col].dt.total_seconds()

    # Use best qualifying time (Q3 if available, else Q2, else Q1)
    df["best_quali_time"] = df["Q3"].fillna(df["Q2"]).fillna(df["Q1"])

    # Qualifying position
    features = df[
        ["race_id", "year", "round", "Abbreviation", "Position", "TeamName", "best_quali_time"]
    ].copy()
    features.rename(
        columns={"Abbreviation": "driver_id", "Position": "quali_position", "TeamName": "team"}, inplace=True
    )

    # Calculate delta to pole (pole = position 1)
    pole_times = df.groupby("race_id")["best_quali_time"].min()
    features["pole_time"] = features["race_id"].map(pole_times)
    features["quali_delta_to_pole"] = features["best_quali_time"] - features["pole_time"]

    # Calculate delta to teammate
    team_times: pd.Series = df.groupby(["race_id", "TeamName"])["best_quali_time"].transform(
        lambda x: x.min() if len(x) > 1 else np.nan
    )
    features["quali_delta_to_teammate"] = df["best_quali_time"] - team_times
    # If driver has the best time on team, delta is 0, else it's positive
    features.loc[features["quali_delta_to_teammate"] < 0, "quali_delta_to_teammate"] = 0

    features.drop(columns=["best_quali_time", "pole_time"], inplace=True)

    return features


def extract_race_features(race_results: pd.DataFrame) -> pd.DataFrame:
    """Extract race-based features.

    Args:
        race_results: Raw race results

    Returns:
        DataFrame with race outcome features per (race_id, driver)
    """
    df = create_race_identifier(race_results)

    features = df[
        [
            "race_id",
            "year",
            "round",
            "Abbreviation",
            "Position",
            "Status",
            "Points",
            "race_name",
            "country",
        ]
    ].copy()
    features.rename(
        columns={
            "Abbreviation": "driver_id",
            "Position": "finish_position",
            "race_name": "track_name",
            "track_country": "track_country",
        },
        inplace=True,
    )

    # DNF proxy: 1 if did not finish, 0 if finished
    features["dnf"] = (~features["Status"].str.contains("Finished", na=False)).astype(int)

    # Points earned
    features["points_earned"] = features["Points"].fillna(0)

    return features


def compute_rolling_driver_form(
    race_features: pd.DataFrame, window: int = 5, min_races: int = 1
) -> pd.DataFrame:
    """Compute rolling driver form using ONLY strictly prior races.

    Args:
        race_features: DataFrame with race results
        window: Number of prior races to consider
        min_races: Minimum races required for calculation

    Returns:
        DataFrame with rolling form features
    """
    # Sort by year and round to ensure temporal ordering
    df = race_features.sort_values(["year", "round"]).copy()

    # Create a global race index for ordering
    race_order = (
        df[["year", "round"]]
        .drop_duplicates()
        .sort_values(["year", "round"])
        .reset_index(drop=True)
    )
    race_order["race_index"] = list(range(len(race_order)))
    df = df.merge(race_order, on=["year", "round"])

    rolling_features = []

    for driver in df["driver_id"].unique():
        driver_races = df[df["driver_id"] == driver].sort_values("race_index").copy()

        # For each race, calculate form using ONLY prior races
        for _idx, row in driver_races.iterrows():
            current_race_idx = row["race_index"]

            # Get strictly prior races (race_index < current_race_idx)
            prior_races = driver_races[driver_races["race_index"] < current_race_idx].tail(window)

            if len(prior_races) >= min_races:
                # Average finish position (lower is better)
                avg_finish = prior_races["finish_position"].mean()
                # Average points
                avg_points = prior_races["points_earned"].mean()
                # DNF rate
                dnf_rate = prior_races["dnf"].mean()
            else:
                # Not enough prior data
                avg_finish = np.nan
                avg_points = np.nan
                dnf_rate = np.nan

            rolling_features.append(
                {
                    "race_id": row["race_id"],
                    "driver_id": driver,
                    "driver_rolling_avg_finish": avg_finish,
                    "driver_rolling_avg_points": avg_points,
                    "driver_rolling_dnf_rate": dnf_rate,
                    "driver_prior_races_count": len(prior_races),
                }
            )

    return pd.DataFrame(rolling_features)


def compute_rolling_constructor_form(
    race_features: pd.DataFrame, window: int = 5, min_races: int = 1
) -> pd.DataFrame:
    """Compute rolling constructor (team) form using ONLY strictly prior races.

    Args:
        race_features: DataFrame with race results including team
        window: Number of prior races to consider
        min_races: Minimum races required for calculation

    Returns:
        DataFrame with rolling constructor form features
    """
    # Need team information - merge if needed
    df = race_features.sort_values(["year", "round"]).copy()

    # Create race index
    race_order = (
        df[["year", "round"]]
        .drop_duplicates()
        .sort_values(["year", "round"])
        .reset_index(drop=True)
    )
    race_order["race_index"] = list(range(len(race_order)))
    df = df.merge(race_order, on=["year", "round"])

    rolling_features = []

    # Group by (team, race) to get all drivers for that team in that race
    for (_year, _round_num), race_data in df.groupby(["year", "round"]):
        current_race = race_data.iloc[0]
        current_race_idx = current_race["race_index"]

        for team in race_data["team"].unique():
            team_drivers = race_data[race_data["team"] == team]

            # Get all prior races for this team
            prior_team_races = df[
                (df["team"] == team) & (df["race_index"] < current_race_idx)
            ].tail(window * 2)  # Teams have 2 drivers typically

            if len(prior_team_races) >= min_races:
                # Team average finish
                team_avg_finish = prior_team_races["finish_position"].mean()
                # Team average points
                team_avg_points = prior_team_races["points_earned"].mean()
                # Team DNF rate
                team_dnf_rate = prior_team_races["dnf"].mean()
            else:
                team_avg_finish = np.nan
                team_avg_points = np.nan
                team_dnf_rate = np.nan

            # Add features for each driver in this team
            for _, driver_row in team_drivers.iterrows():
                rolling_features.append(
                    {
                        "race_id": driver_row["race_id"],
                        "driver_id": driver_row["driver_id"],
                        "team": team,
                        "constructor_rolling_avg_finish": team_avg_finish,
                        "constructor_rolling_avg_points": team_avg_points,
                        "constructor_rolling_dnf_rate": team_dnf_rate,
                        "constructor_prior_races_count": len(prior_team_races),
                    }
                )

    return pd.DataFrame(rolling_features)


def compute_driver_track_history(
    race_features: pd.DataFrame, min_visits: int = 1
) -> pd.DataFrame:
    """Compute driver's historical performance at each specific track.

    This is a high-impact feature that captures circuit-specific driver skill.
    Uses ONLY strictly prior visits to the same track to prevent data leakage.

    Args:
        race_features: DataFrame with race results including track info
        min_visits: Minimum prior track visits required for calculation

    Returns:
        DataFrame with track-specific driver history features
    """
    # Sort by year and round to ensure temporal ordering
    df = race_features.sort_values(["year", "round"]).copy()

    # Create race index for temporal ordering
    race_order = (
        df[["year", "round"]]
        .drop_duplicates()
        .sort_values(["year", "round"])
        .reset_index(drop=True)
    )
    race_order["race_index"] = list(range(len(race_order)))
    df = df.merge(race_order, on=["year", "round"])

    # Create track identifier from country and race_name
    if "track_id" not in df.columns:
        df["track_id"] = df["country"].astype(str) + "_" + df.get("track_name", df.get("race_name", "")).astype(str)

    track_features = []

    for driver in df["driver_id"].unique():
        driver_races = df[df["driver_id"] == driver].sort_values("race_index")

        for _, row in driver_races.iterrows():
            current_race_idx = row["race_index"]
            current_track = row["track_id"]

            # Get strictly prior visits to THIS track
            prior_track_visits = driver_races[
                (driver_races["race_index"] < current_race_idx) &
                (driver_races["track_id"] == current_track)
            ]

            if len(prior_track_visits) >= min_visits:
                # Driver's average finish at this track
                track_avg_finish = prior_track_visits["finish_position"].mean()
                # Best finish at this track
                track_best_finish = prior_track_visits["finish_position"].min()
                # Win rate at this track
                track_win_rate = (prior_track_visits["finish_position"] == 1).mean()
                # Podium rate at this track
                track_podium_rate = (prior_track_visits["finish_position"] <= 3).mean()
                # DNF rate at this track
                track_dnf_rate = prior_track_visits["dnf"].mean()
                # Number of prior visits
                n_visits = len(prior_track_visits)
            else:
                # Not enough prior data for this track
                track_avg_finish = np.nan
                track_best_finish = np.nan
                track_win_rate = np.nan
                track_podium_rate = np.nan
                track_dnf_rate = np.nan
                n_visits = 0

            track_features.append({
                "race_id": row["race_id"],
                "driver_id": driver,
                "driver_track_avg_finish": track_avg_finish,
                "driver_track_best_finish": track_best_finish,
                "driver_track_win_rate": track_win_rate,
                "driver_track_podium_rate": track_podium_rate,
                "driver_track_dnf_rate": track_dnf_rate,
                "driver_track_visits": n_visits,
            })

    return pd.DataFrame(track_features)


def build_feature_table(
    race_results: pd.DataFrame, qual_results: pd.DataFrame, rolling_window: int = 5
) -> pd.DataFrame:
    """Build complete feature table with one row per (race, driver).

    Args:
        race_results: Raw race results
        qual_results: Raw qualifying results
        rolling_window: Window size for rolling features

    Returns:
        DataFrame with all features, ensuring no data leakage
    """
    logger.info("Building feature table...")

    # Extract qualifying features (includes team from TeamName column)
    qual_features = extract_qualifying_features(qual_results)

    # Extract race features (includes team info)
    race_features = extract_race_features(race_results)

    # Get team mapping from race results for any missing team data
    team_mapping = race_results[["year", "round", "Abbreviation", "TeamName"]].drop_duplicates()
    team_mapping.rename(columns={"Abbreviation": "driver_id", "TeamName": "team"}, inplace=True)

    # Ensure qual_features has team column (it should already have it from extract_qualifying_features)
    # But merge to be safe in case of any data inconsistencies
    if "team" not in qual_features.columns:
        qual_features = qual_features.merge(
            team_mapping[["year", "round", "driver_id", "team"]],
            on=["year", "round", "driver_id"],
            how="left",
        )

    # Prepare race features with team for rolling calculations
    race_features_with_team = race_features.merge(
        team_mapping[["year", "round", "driver_id", "team"]],
        on=["year", "round", "driver_id"],
        how="left",
        suffixes=("", "_race"),
    )

    # Use the team column from the merge
    if "team_race" in race_features_with_team.columns:
        race_features_with_team["team"] = race_features_with_team["team"].fillna(
            race_features_with_team["team_race"]
        )
        race_features_with_team.drop(columns=["team_race"], inplace=True)

    logger.info("Computing rolling driver form...")
    driver_rolling = compute_rolling_driver_form(race_features_with_team, window=rolling_window)

    logger.info("Computing rolling constructor form...")
    constructor_rolling = compute_rolling_constructor_form(
        race_features_with_team, window=rolling_window
    )

    logger.info("Computing driver track history...")
    driver_track_history = compute_driver_track_history(race_features_with_team)

    # Merge all features
    features = qual_features.merge(driver_rolling, on=["race_id", "driver_id"], how="left")

    features = features.merge(
        constructor_rolling[
            [
                "race_id",
                "driver_id",
                "constructor_rolling_avg_finish",
                "constructor_rolling_avg_points",
                "constructor_rolling_dnf_rate",
                "constructor_prior_races_count",
            ]
        ],
        on=["race_id", "driver_id"],
        how="left",
    )

    # Merge driver track history features (high-impact for predictions)
    features = features.merge(
        driver_track_history[
            [
                "race_id",
                "driver_id",
                "driver_track_avg_finish",
                "driver_track_best_finish",
                "driver_track_win_rate",
                "driver_track_podium_rate",
                "driver_track_dnf_rate",
                "driver_track_visits",
            ]
        ],
        on=["race_id", "driver_id"],
        how="left",
    )

    # Add track identifier
    track_info = race_results[["year", "round", "race_name", "country"]].drop_duplicates()
    track_info["track_id"] = track_info["country"] + "_" + track_info["race_name"]
    features = features.merge(
        track_info[["year", "round", "track_id"]], on=["year", "round"], how="left"
    )

    # Add race date if available in raw data
    if "EventDate" in race_results.columns:
        race_dates = race_results[["year", "round", "EventDate"]].drop_duplicates()
        race_dates.rename(columns={"EventDate": "race_date"}, inplace=True)
        features = features.merge(race_dates, on=["year", "round"], how="left")

    # Add season and round
    features["season"] = features["year"]

    # Select final columns in logical order
    final_cols = [
        "race_id",
        "season",
        "round",
        "track_id",
        "driver_id",
        "team",
        "quali_position",
        "quali_delta_to_pole",
        "quali_delta_to_teammate",
        "driver_rolling_avg_finish",
        "driver_rolling_avg_points",
        "driver_rolling_dnf_rate",
        "constructor_rolling_avg_finish",
        "constructor_rolling_avg_points",
        "constructor_rolling_dnf_rate",
        # New track-specific features (high-impact)
        "driver_track_avg_finish",
        "driver_track_best_finish",
        "driver_track_win_rate",
        "driver_track_podium_rate",
        "driver_track_dnf_rate",
        "driver_track_visits",
    ]

    # Add optional columns if they exist
    if "race_date" in features.columns:
        final_cols.append("race_date")

    # Include count columns for debugging/verification
    final_cols.extend(["driver_prior_races_count", "constructor_prior_races_count"])

    features = features[final_cols]

    logger.info(f"Feature table built: {len(features)} rows, {len(features.columns)} columns")
    return features
