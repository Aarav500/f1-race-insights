"""Generate minimal test fixtures for fast integration testing.

Creates a tiny dataset with 5 races and 8 drivers for smoke tests.
"""

from pathlib import Path

import numpy as np
import pandas as pd

# Set seed for reproducibility
np.random.seed(42)

# Minimal drivers (8 instead of 20)
DRIVERS = ["VER", "HAM", "LEC", "SAI", "PER", "RUS", "NOR", "ALO"]
TEAMS = {
    "VER": "Red Bull",
    "PER": "Red Bull",
    "HAM": "Mercedes",
    "RUS": "Mercedes",
    "LEC": "Ferrari",
    "SAI": "Ferrari",
    "NOR": "McLaren",
    "ALO": "Aston Martin",
}


def generate_fixture_data():
    """Generate minimal F1 test data."""

    # Generate 5 races
    races = []
    for round_num in range(1, 6):
        race_id = f"2024_{round_num:02d}"

        # Simulate qualifying and race results
        for i, driver in enumerate(DRIVERS):
            # Qualifying position with some variation
            quali_pos = i + 1

            # Race finish with some variation
            if driver == "VER" and round_num <= 3:
                finish_pos = 1  # VER wins first 3
            elif driver == "HAM" and round_num == 4:
                finish_pos = 1  # HAM wins race 4
            elif driver == "LEC" and round_num == 5:
                finish_pos = 1  # LEC wins race 5
            else:
                finish_pos = quali_pos  # Others finish as qualified

            # Rolling form (improves over time for winners)
            if round_num == 1:
                driver_avg_finish = 5.0
                driver_avg_points = 10.0
            else:
                if driver in ["VER", "HAM", "LEC"]:
                    driver_avg_finish = max(2.0, 5.0 - round_num * 0.5)
                    driver_avg_points = min(20.0, 10.0 + round_num * 2)
                else:
                    driver_avg_finish = 5.0 + i * 0.5
                    driver_avg_points = max(5.0, 15.0 - i * 2)

            races.append(
                {
                    "race_id": race_id,
                    "season": 2024,
                    "round": round_num,
                    "driver_id": driver,
                    "team": TEAMS[driver],
                    "track_id": f"track_{round_num}",
                    "quali_position": quali_pos,
                    "finish_position": finish_pos,
                    "driver_rolling_avg_finish": driver_avg_finish,
                    "driver_rolling_avg_points": driver_avg_points,
                    "driver_rolling_dnf_rate": 0.05 if driver in ["VER", "HAM"] else 0.10,
                    "constructor_rolling_avg_finish": 2.0 if driver in ["VER", "PER"] else 3.0,
                    "constructor_rolling_avg_points": 400.0 if driver in ["VER", "PER"] else 300.0,
                    "constructor_rolling_dnf_rate": 0.03 if driver in ["VER", "PER"] else 0.07,
                    "race_date": 20240000 + round_num * 1000,  # Proxy for chronological order
                }
            )

    return pd.DataFrame(races)


def main():
    """Generate and save fixture data."""
    # Create fixtures directory
    fixtures_dir = Path(__file__).parent
    data_dir = fixtures_dir / "data"
    models_dir = fixtures_dir / "models"

    data_dir.mkdir(exist_ok=True)
    models_dir.mkdir(exist_ok=True)

    print("Generating fixture data...")
    features_df = generate_fixture_data()

    # Save features
    features_path = data_dir / "features.parquet"
    features_df.to_parquet(features_path, index=False)
    print(f"✓ Saved {len(features_df)} samples to {features_path}")

    # Train and save a simple quali_freq model
    print("Training quali_freq model...")
    from f1.models.baselines import QualifyingFrequencyBaseline

    model = QualifyingFrequencyBaseline()
    model.fit(features_df)

    model_path = models_dir / "quali_freq.joblib"
    model.save(model_path)
    print(f"✓ Saved quali_freq model to {model_path}")

    print("\nFixture generation complete!")
    print(f"  Races: {features_df['race_id'].nunique()}")
    print(f"  Drivers: {features_df['driver_id'].nunique()}")
    print(f"  Total samples: {len(features_df)}")


if __name__ == "__main__":
    main()
