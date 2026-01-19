"""Data ingestion script for F1 race data.

Fetches and persists F1 data from FastF1 API for seasons 2020-2025:
- Race schedules
- Race results
- Qualifying results

All data is saved as Parquet files to data/raw/
"""

import logging
import sys
from pathlib import Path

from f1.data.loaders import load_season_data

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='{"timestamp": "%(asctime)s", "level": "%(levelname)s", "logger": "%(name)s", "message": "%(message)s"}',
    handlers=[logging.StreamHandler(sys.stdout)],
)

logger = logging.getLogger(__name__)

# Seasons to ingest
SEASONS = list(range(2020, 2026))  # 2020-2025
OUTPUT_DIR = Path("data/raw")


def main():
    """Run data ingestion for all seasons."""
    logger.info(f"Starting F1 data ingestion for seasons {SEASONS[0]}-{SEASONS[-1]}")
    logger.info(f"Output directory: {OUTPUT_DIR}")

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    all_stats = []

    for year in SEASONS:
        try:
            stats = load_season_data(year, OUTPUT_DIR)
            all_stats.append(stats)

            logger.info(
                f"Season {year} summary: "
                f"{stats['schedules']} schedules, "
                f"{stats['race_results']} races, "
                f"{stats['qualifying_results']} qualifying sessions, "
                f"{stats['errors']} errors"
            )

        except Exception as e:
            logger.error(f"Failed to load season {year}: {e}", exc_info=True)

    # Summary
    total_schedules = sum(s["schedules"] for s in all_stats)
    total_races = sum(s["race_results"] for s in all_stats)
    total_qualifying = sum(s["qualifying_results"] for s in all_stats)
    total_errors = sum(s["errors"] for s in all_stats)

    logger.info("=" * 60)
    logger.info("Data Ingestion Complete")
    logger.info(f"Total schedules: {total_schedules}")
    logger.info(f"Total race results: {total_races}")
    logger.info(f"Total qualifying results: {total_qualifying}")
    logger.info(f"Total errors: {total_errors}")
    logger.info("=" * 60)


if __name__ == "__main__":
    main()
