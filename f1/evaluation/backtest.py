"""Walk-forward backtesting framework for F1 race predictions.

Implements temporal cross-validation where models are trained on past data
and tested on future races, respecting chronological order to prevent leakage.
"""

import logging
from typing import Any, Optional

import numpy as np
import pandas as pd

from f1.evaluation.metrics import compute_metrics

logger = logging.getLogger(__name__)


class WalkForwardBacktest:
    """Walk-forward backtesting with expanding window."""

    def __init__(self, min_train_races: int = 10, date_column: str = "race_date"):
        """Initialize backtester.

        Args:
            min_train_races: Minimum number of races for initial training
            date_column: Column name containing race dates
        """
        self.min_train_races = min_train_races
        self.date_column = date_column

    def run(self, data: pd.DataFrame, model_trainer, task: str = "win") -> dict[str, Any]:
        """Run walk-forward backtest.

        Args:
            data: Full dataset with race_date column
            model_trainer: Callable that trains and returns a model
            task: Prediction task ('win', 'podium', or 'finish')

        Returns:
            Dictionary with results
        """
        # Sort by date
        data = data.sort_values(self.date_column).reset_index(drop=True)

        # Get unique race dates
        race_dates = data[self.date_column].unique()
        race_dates = np.sort(race_dates)

        if len(race_dates) < self.min_train_races + 1:
            raise ValueError(
                f"Insufficient data: {len(race_dates)} races < {self.min_train_races + 1} required"
            )

        logger.info(f"Starting walk-forward backtest on {len(race_dates)} races")

        # Collect predictions
        all_predictions = []
        all_actuals = []

        # Walk forward through time
        for test_idx in range(self.min_train_races, len(race_dates)):
            test_date = race_dates[test_idx]
            train_dates = race_dates[:test_idx]

            # Split data
            train_data = data[data[self.date_column].isin(train_dates)]
            test_data = data[data[self.date_column] == test_date]

            logger.debug(
                f"Iteration {test_idx - self.min_train_races + 1}: "
                f"Train on {len(train_dates)} races, test on {test_date}"
            )

            # Train model
            try:
                model = model_trainer(train_data, task)
            except Exception as e:
                logger.warning(f"Model training failed for {test_date}: {e}")
                continue

            # Predict on test set
            try:
                predictions = self._predict(model, test_data, task)
                actuals = self._get_actuals(test_data, task)

                all_predictions.extend(predictions)
                all_actuals.extend(actuals)

            except Exception as e:
                logger.warning(f"Prediction failed for {test_date}: {e}")
                continue

        # Compute metrics
        y_true = np.array(all_actuals)
        y_pred = np.array(all_predictions)

        if task in ["win", "podium"]:
            metrics = compute_metrics(y_true, y_pred, task="classification")
        else:
            metrics = compute_metrics(y_true, y_pred, task="regression")

        results = {
            "n_test_samples": len(all_actuals),
            "n_test_races": sum(1 for i in range(self.min_train_races, len(race_dates))),
            "metrics": metrics,
            "predictions": all_predictions,
            "actuals": all_actuals,
        }

        logger.info(
            f"Backtest complete: {results['n_test_races']} races, "
            f"{results['n_test_samples']} samples"
        )

        return results

    def _predict(self, model: Any, test_data: pd.DataFrame, task: str) -> list[float]:
        """Generate predictions using model.

        Args:
            model: Trained model
            test_data: Test dataset
            task: Prediction task

        Returns:
            List of predictions
        """
        if hasattr(model, "predict"):
            predictions = model.predict(test_data)

            # Extract probabilities or values
            if isinstance(predictions, pd.DataFrame):
                if task == "win":
                    return list(map(float, predictions["win_prob"].tolist()))
                elif task == "podium":
                    return list(map(float, predictions["podium_prob"].tolist()))
                elif task == "finish":
                    series_result = predictions.get(
                        "expected_finish", predictions["finish_position"]
                    )
                    return list(map(float, series_result.tolist()))
                else:
                    # Fallback for unknown task
                    return list(map(float, predictions.iloc[:, 0].tolist()))
            else:
                return list(map(float, predictions.tolist()))
        else:
            raise ValueError("Model must have predict method")

    def _get_actuals(self, test_data: pd.DataFrame, task: str) -> list[float]:
        """Extract actual outcomes from test data.

        Args:
            test_data: Test dataset
            task: Prediction task

        Returns:
            List of actual outcomes
        """
        result: list[float]
        if task == "win":
            result = (test_data["finish_position"] == 1).astype(float).tolist()
            return result
        elif task == "podium":
            result = (test_data["finish_position"] <= 3).astype(float).tolist()
            return result
        elif task == "finish":
            result = test_data["finish_position"].astype(float).tolist()
            return result
        else:
            raise ValueError(f"Unknown task: {task}")


def create_model_trainer(model_type: str, model_params: Optional[dict] = None):
    """Create a model trainer function for a specific model type.

    Args:
        model_type: Type of model ('quali_freq', 'xgb', etc.)
        model_params: Optional model parameters

    Returns:
        Trainer function that takes (train_data, task) and returns trained model
    """
    if model_params is None:
        model_params = {}

    def trainer(train_data: pd.DataFrame, task: str):
        """Train model on given data.

        Args:
            train_data: Training dataset
            task: Prediction task

        Returns:
            Trained model
        """
        if model_type == "quali_freq":
            from f1.models.baselines import BaselineModel, QualifyingFrequencyBaseline

            quali_model: BaselineModel = QualifyingFrequencyBaseline()
            quali_model.fit(train_data)
            return quali_model

        elif model_type == "elo":
            from f1.models.baselines import BaselineModel, EloBaseline

            elo_model: BaselineModel = EloBaseline(**model_params)
            elo_model.fit(train_data)
            return elo_model

        elif model_type in ["xgb", "lgbm", "cat", "lr", "rf"]:
            from f1.models.train import create_model, prepare_features

            # Prepare features
            X_train, y_train, feature_cols = prepare_features(train_data, task)

            # Create and train model
            model = create_model(model_type, task, **model_params)
            model.fit(X_train, y_train)

            # Wrap in predictor
            class ModelWrapper:
                def __init__(self, model, features):
                    self.model = model
                    self.features = features

                def predict(self, data):
                    X, _, _ = prepare_features(data, task, self.features)
                    probs = (
                        self.model.predict_proba(X)
                        if hasattr(self.model, "predict_proba")
                        else self.model.predict(X)
                    )

                    result = data[["race_id", "driver_id"]].copy()
                    if task in ["win", "podium"]:
                        result[f"{task}_prob"] = probs[:, 1] if len(probs.shape) > 1 else probs
                    else:
                        result["expected_finish"] = probs
                    return result

            features = list(X_train.columns) if hasattr(X_train, "columns") else None
            return ModelWrapper(model, features)

        else:
            raise ValueError(f"Unsupported model type: {model_type}")

    return trainer


def aggregate_results(results: dict[str, dict[str, Any]]) -> pd.DataFrame:
    """Aggregate backtest results across models.

    Args:
        results: Dict of model_name -> backtest results

    Returns:
        DataFrame with aggregated metrics
    """
    rows = []

    for model_name, result in results.items():
        row = {"model": model_name}
        row.update(result["metrics"])
        row["n_samples"] = result["n_test_samples"]
        row["n_races"] = result["n_test_races"]
        rows.append(row)

    return pd.DataFrame(rows)
