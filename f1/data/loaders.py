"""FastF1 data loaders with caching."""

import logging
from pathlib import Path
from typing import Optional

import fastf1
import pandas as pd

logger = logging.getLogger(__name__)

# Enable FastF1 cache
CACHE_DIR = Path("data/cache")
CACHE_DIR.mkdir(parents=True, exist_ok=True)
fastf1.Cache.enable_cache(str(CACHE_DIR))


def get_season_schedule(year: int) -> pd.DataFrame:
    """Fetch race schedule for a given season.

    Args:
        year: Season year (e.g., 2024)

    Returns:
        DataFrame with schedule information
    """
    logger.info(f"Fetching schedule for {year} season")
    schedule = fastf1.get_event_schedule(year)

    # Convert to regular DataFrame and select relevant columns
    df = pd.DataFrame(schedule)

    logger.info(f"Loaded {len(df)} events for {year}")
    return df


def get_race_results(year: int, round_number: int) -> Optional[pd.DataFrame]:
    """Fetch race results for a specific race.

    Args:
        year: Season year
        round_number: Round number (1-based)

    Returns:
        DataFrame with race results or None if race not completed
    """
    try:
        logger.info(f"Fetching race results for {year} Round {round_number}")
        session = fastf1.get_session(year, round_number, "R")
        session.load()

        if session.results is None or len(session.results) == 0:
            logger.warning(f"No race results for {year} Round {round_number}")
            return None

        df = pd.DataFrame(session.results)

        # Add metadata
        df["year"] = year
        df["round"] = round_number
        df["race_name"] = session.event["EventName"]
        df["country"] = session.event["Country"]

        logger.info(f"Loaded {len(df)} results for {year} Round {round_number}")
        return df

    except Exception as e:
        logger.error(f"Error loading race results for {year} Round {round_number}: {e}")
        return None


def get_qualifying_results(year: int, round_number: int) -> Optional[pd.DataFrame]:
    """Fetch qualifying results for a specific race.

    Args:
        year: Season year
        round_number: Round number (1-based)

    Returns:
        DataFrame with qualifying results or None if not available
    """
    try:
        logger.info(f"Fetching qualifying results for {year} Round {round_number}")
        session = fastf1.get_session(year, round_number, "Q")
        session.load()

        if session.results is None or len(session.results) == 0:
            logger.warning(f"No qualifying results for {year} Round {round_number}")
            return None

        df = pd.DataFrame(session.results)

        # Add metadata
        df["year"] = year
        df["round"] = round_number
        df["race_name"] = session.event["EventName"]
        df["country"] = session.event["Country"]

        logger.info(f"Loaded {len(df)} qualifying results for {year} Round {round_number}")
        return df

    except Exception as e:
        logger.error(f"Error loading qualifying results for {year} Round {round_number}: {e}")
        return None


def save_to_parquet(df: pd.DataFrame, filepath: Path) -> None:
    """Save DataFrame to Parquet format.

    Args:
        df: DataFrame to save
        filepath: Path to save file
    """
    filepath.parent.mkdir(parents=True, exist_ok=True)
    df.to_parquet(filepath, index=False)
    logger.info(f"Saved to {filepath}")


def load_season_data(year: int, output_dir: Path) -> dict:
    """Load all data for a season and save to parquet files.

    Args:
        year: Season year
        output_dir: Base directory for output files

    Returns:
        Dictionary with counts of loaded data
    """
    logger.info(f"Loading data for {year} season")

    stats = {"year": year, "schedules": 0, "race_results": 0, "qualifying_results": 0, "errors": 0}

    # Load schedule
    try:
        schedule = get_season_schedule(year)
        schedule_path = output_dir / f"schedule_{year}.parquet"
        save_to_parquet(schedule, schedule_path)
        stats["schedules"] = len(schedule)
    except Exception as e:
        logger.error(f"Error loading schedule for {year}: {e}")
        stats["errors"] += 1

    # Load race and qualifying results for each round
    try:
        schedule = fastf1.get_event_schedule(year)
        num_rounds = len(schedule)

        for round_num in range(1, num_rounds + 1):
            # Race results
            race_df = get_race_results(year, round_num)
            if race_df is not None:
                race_path = output_dir / f"race_results_{year}_r{round_num:02d}.parquet"
                save_to_parquet(race_df, race_path)
                stats["race_results"] += 1

            # Qualifying results
            qual_df = get_qualifying_results(year, round_num)
            if qual_df is not None:
                qual_path = output_dir / f"qualifying_results_{year}_r{round_num:02d}.parquet"
                save_to_parquet(qual_df, qual_path)
                stats["qualifying_results"] += 1

    except Exception as e:
        logger.error(f"Error loading race data for {year}: {e}")
        stats["errors"] += 1

    logger.info(f"Completed loading {year}: {stats}")
    return stats
