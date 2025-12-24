"""Baseline models for F1 race predictions.

Provides simple baseline models with a common interface:
- fit(train_df): Train the model
- predict(df): Generate predictions
"""

import logging
from abc import ABC, abstractmethod
from pathlib import Path

import joblib
import numpy as np
import pandas as pd

logger = logging.getLogger(__name__)


class BaselineModel(ABC):
    """Abstract base class for baseline models."""

    @abstractmethod
    def fit(self, train_df: pd.DataFrame) -> "BaselineModel":
        """Train the model on training data.

        Args:
            train_df: Training DataFrame with features and outcomes

        Returns:
            Self for method chaining
        """
        pass

    @abstractmethod
    def predict(self, df: pd.DataFrame) -> pd.DataFrame:
        """Generate predictions for input data.

        Args:
            df: DataFrame with features

        Returns:
            DataFrame with predictions (win_prob, podium_prob per driver)
        """
        pass

    def save(self, filepath: Path) -> None:
        """Save model to disk.

        Args:
            filepath: Path to save model
        """
        filepath.parent.mkdir(parents=True, exist_ok=True)
        joblib.dump(self, filepath)
        logger.info(f"Model saved to {filepath}")

    @classmethod
    def load(cls, filepath: Path) -> "BaselineModel":
        """Load model from disk.

        Args:
            filepath: Path to model file

        Returns:
            Loaded model instance
        """
        model: BaselineModel = joblib.load(filepath)
        logger.info(f"Model loaded from {filepath}")
        return model


class QualifyingFrequencyBaseline(BaselineModel):
    """Baseline model using empirical frequencies from qualifying positions.

    Computes P(win|quali_pos) and P(podium|quali_pos) from historical data.
    """

    def __init__(self):
        self.win_probs: dict[int, float] = {}
        self.podium_probs: dict[int, float] = {}
        self.default_win_prob = 0.0
        self.default_podium_prob = 0.0

    def fit(self, train_df: pd.DataFrame) -> "QualifyingFrequencyBaseline":
        """Compute empirical win and podium probabilities by qualifying position.

        Args:
            train_df: DataFrame with 'quali_position' and 'finish_position'

        Returns:
            Self
        """
        logger.info("Training QualifyingFrequencyBaseline...")

        # Group by qualifying position
        position_groups = train_df.groupby("quali_position")

        # Compute win probability (finished 1st) for each quali position
        for quali_pos, group in position_groups:
            if "finish_position" in group.columns:
                total = len(group)
                wins = (group["finish_position"] == 1).sum()
                podiums = (group["finish_position"] <= 3).sum()

                # Convert quali_pos safely using pd.to_numeric
                quali_pos_numeric = pd.to_numeric(quali_pos, errors="coerce")
                quali_pos_int = int(float(quali_pos_numeric)) if pd.notna(quali_pos_numeric) else 20
                self.win_probs[quali_pos_int] = wins / total if total > 0 else 0.0
                self.podium_probs[quali_pos_int] = podiums / total if total > 0 else 0.0

        # Set defaults for unseen positions
        if self.win_probs:
            self.default_win_prob = float(np.mean(list(self.win_probs.values())))
            self.default_podium_prob = float(np.mean(list(self.podium_probs.values())))

        logger.info(f"Trained on {len(train_df)} samples")
        logger.info(f"Learned probabilities for positions 1-{max(self.win_probs.keys())}")

        return self

    def predict(self, df: pd.DataFrame) -> pd.DataFrame:
        """Predict win and podium probabilities based on qualifying position.

        Args:
            df: DataFrame with 'quali_position' column

        Returns:
            DataFrame with predictions
        """
        predictions = []

        for _, row in df.iterrows():
            quali_pos = int(float(row["quali_position"])) if pd.notna(row["quali_position"]) else 20

            win_prob = self.win_probs.get(quali_pos, self.default_win_prob)
            podium_prob = self.podium_probs.get(quali_pos, self.default_podium_prob)

            predictions.append(
                {
                    "race_id": row.get("race_id"),
                    "driver_id": row.get("driver_id"),
                    "quali_position": quali_pos,
                    "win_prob": win_prob,
                    "podium_prob": podium_prob,
                }
            )

        return pd.DataFrame(predictions)


class EloBaseline(BaselineModel):
    """Elo rating system for drivers and constructors.

    Updates ratings chronologically based on race results.
    """

    def __init__(self, k_factor: float = 32.0, initial_rating: float = 1500.0):
        """Initialize Elo baseline.

        Args:
            k_factor: Elo K-factor (higher = more responsive to recent results)
            initial_rating: Starting rating for new drivers/constructors
        """
        self.k_factor = k_factor
        self.initial_rating = initial_rating
        self.driver_ratings: dict[str, float] = {}
        self.constructor_ratings: dict[str, float] = {}
        self.rating_history: list = []

    def _get_driver_rating(self, driver_id: str) -> float:
        """Get driver rating, using initial rating if not found."""
        return self.driver_ratings.get(driver_id, self.initial_rating)

    def _get_constructor_rating(self, team: str) -> float:
        """Get constructor rating, using initial rating if not found."""
        return self.constructor_ratings.get(team, self.initial_rating)

    def _expected_score(self, rating_a: float, rating_b: float) -> float:
        """Calculate expected score for rating_a vs rating_b.

        Args:
            rating_a: Rating of entity A
            rating_b: Rating of entity B

        Returns:
            Expected score (0-1)
        """
        return 1 / (1 + 10 ** ((rating_b - rating_a) / 400))

    def _update_ratings(self, race_results: pd.DataFrame) -> None:
        """Update Elo ratings based on a single race.

        Args:
            race_results: DataFrame with results for one race
        """
        # Sort by finish position
        results = race_results.sort_values("finish_position").copy()
        n_drivers = len(results)

        # Calculate new ratings based on pairwise comparisons
        new_driver_ratings = {}
        new_constructor_ratings = {}

        for i, (_idx_i, driver_i) in enumerate(results.iterrows()):
            driver_id_i = driver_i["driver_id"]
            team_i = driver_i.get("team", "Unknown")

            # Get current ratings
            driver_rating_i = self._get_driver_rating(driver_id_i)
            constructor_rating_i = self._get_constructor_rating(team_i)

            driver_rating_change = 0.0
            constructor_rating_change = 0.0

            # Compare with all other drivers
            for j, (_idx_j, driver_j) in enumerate(results.iterrows()):
                if i == j:
                    continue

                driver_id_j = driver_j["driver_id"]
                team_j = driver_j.get("team", "Unknown")

                # Actual score: 1 if i finished ahead of j, 0 otherwise
                actual_score = 1.0 if i < j else 0.0

                # Expected scores
                driver_expected = self._expected_score(
                    driver_rating_i, self._get_driver_rating(driver_id_j)
                )
                constructor_expected = self._expected_score(
                    constructor_rating_i, self._get_constructor_rating(team_j)
                )

                # Accumulate rating changes
                driver_rating_change += actual_score - driver_expected
                constructor_rating_change += actual_score - constructor_expected

            # Update ratings (average over all opponents)
            new_driver_ratings[driver_id_i] = driver_rating_i + (
                self.k_factor * driver_rating_change
            ) / (n_drivers - 1)
            new_constructor_ratings[team_i] = constructor_rating_i + (
                self.k_factor * constructor_rating_change
            ) / (n_drivers - 1)

        # Apply updates
        self.driver_ratings.update(new_driver_ratings)
        self.constructor_ratings.update(new_constructor_ratings)

    def fit(self, train_df: pd.DataFrame) -> "EloBaseline":
        """Train Elo model by updating ratings chronologically.

        Args:
            train_df: DataFrame with race results, must include:
                - season, round (for temporal ordering)
                - driver_id, team
                - finish_position

        Returns:
            Self
        """
        logger.info("Training EloBaseline...")

        # Reset ratings
        self.driver_ratings = {}
        self.constructor_ratings = {}
        self.rating_history = []

        # Sort by season and round for chronological processing
        train_df = train_df.sort_values(["season", "round"]).copy()

        # Process each race chronologically
        for (season, round_num), race_data in train_df.groupby(["season", "round"], sort=False):
            self._update_ratings(race_data)

            # Record snapshot of ratings
            self.rating_history.append(
                {
                    "season": season,
                    "round": round_num,
                    "driver_ratings": dict(self.driver_ratings),
                    "constructor_ratings": dict(self.constructor_ratings),
                }
            )

        logger.info(f"Trained on {len(train_df)} samples across {len(self.rating_history)} races")
        logger.info(
            f"Tracking {len(self.driver_ratings)} drivers, {len(self.constructor_ratings)} constructors"
        )

        return self

    def predict(self, df: pd.DataFrame) -> pd.DataFrame:
        """Predict win and podium probabilities using Elo ratings.

        Args:
            df: DataFrame with driver_id and team

        Returns:
            DataFrame with predictions
        """
        predictions = []

        # Group by race to normalize probabilities within each race
        for race_id, race_data in df.groupby("race_id"):
            race_predictions = []

            for _, row in race_data.iterrows():
                driver_id = row["driver_id"]
                team = row.get("team", "Unknown")

                # Combined rating (driver + constructor)
                driver_rating = self._get_driver_rating(driver_id)
                constructor_rating = self._get_constructor_rating(team)
                combined_rating = (driver_rating + constructor_rating) / 2

                race_predictions.append(
                    {"driver_id": driver_id, "combined_rating": combined_rating}
                )

            # Convert ratings to probabilities using softmax
            race_pred_df = pd.DataFrame(race_predictions)
            ratings = race_pred_df["combined_rating"].values

            # Softmax for win probability
            ratings_array = np.asarray(ratings)
            exp_ratings = np.exp((ratings_array - ratings_array.max()) / 100)  # Temperature scaling
            win_probs = exp_ratings / exp_ratings.sum()

            # Podium probability (approximate as top-3 in softmax)
            # Use a heuristic: if win_prob is high, podium_prob should be higher
            podium_probs = np.minimum(win_probs * 3, 0.95)  # Scale up but cap

            # Add predictions
            for i, (_, row) in enumerate(race_data.iterrows()):
                predictions.append(
                    {
                        "race_id": race_id,
                        "driver_id": row["driver_id"],
                        "win_prob": win_probs[i],
                        "podium_prob": podium_probs[i],
                        "driver_rating": self._get_driver_rating(row["driver_id"]),
                        "constructor_rating": self._get_constructor_rating(
                            row.get("team", "Unknown")
                        ),
                    }
                )

        return pd.DataFrame(predictions)
