"""Model registry for unified prediction interface.

Provides unified access to all F1 prediction models:
- Baselines: quali_freq, elo
- Zoo: xgb, lgbm, cat, lr, rf
- Custom: nbt_tlf
"""

import json
import logging
from datetime import datetime
from pathlib import Path
from typing import Any

import joblib
import numpy as np
import pandas as pd
import torch

from f1.evaluation.calibration import calibrate_nbt_tlf_scores, calibrate_tree_model_predictions
from f1.models.baselines import BaselineModel
from f1.models.nbt_tlf import NBTTLFTrainer
from f1.schemas import PredictionResponse

logger = logging.getLogger(__name__)


class ModelRegistry:
    """Registry for all F1 prediction models."""

    BASELINES = ["quali_freq", "elo"]
    ZOO_MODELS = ["xgb", "lgbm", "cat", "lr", "rf"]
    CUSTOM_MODELS = ["nbt_tlf"]

    @classmethod
    def get_all_models(cls) -> list[str]:
        """Return list of all supported model names.

        Returns:
            List of model names
        """
        return cls.BASELINES + cls.ZOO_MODELS + cls.CUSTOM_MODELS

    @classmethod
    def is_valid_model(cls, model_name: str) -> bool:
        """Check if model name is valid.

        Args:
            model_name: Name of model to check

        Returns:
            True if valid, False otherwise
        """
        return model_name in cls.get_all_models()

    @classmethod
    def load_model(
        cls, model_name: str, model_dir: Path, task: str = "win", device: str = "cpu"
    ) -> dict[str, Any]:
        """Load model by name from directory.

        Args:
            model_name: Name of model to load
            model_dir: Directory containing models
            task: Task type for zoo models (win/podium/expected_finish)
            device: Device for PyTorch models (cpu/cuda)

        Returns:
            Dictionary with 'model' and optional 'metadata'

        Raises:
            ValueError: If model name is invalid
            FileNotFoundError: If model file not found
        """
        if not cls.is_valid_model(model_name):
            raise ValueError(
                f"Invalid model name: {model_name}. Valid models: {cls.get_all_models()}"
            )

        model_dir = Path(model_dir)

        # Load baseline models
        if model_name in cls.BASELINES:
            return cls._load_baseline(model_name, model_dir)

        # Load zoo models
        elif model_name in cls.ZOO_MODELS:
            return cls._load_zoo_model(model_name, task, model_dir)

        # Load NBT-TLF
        elif model_name == "nbt_tlf":
            return cls._load_nbt_tlf(model_dir, device)

        else:
            raise ValueError(f"Unsupported model: {model_name}")

    @classmethod
    def _load_baseline(cls, model_name: str, model_dir: Path) -> dict[str, Any]:
        """Load baseline model.

        Args:
            model_name: Baseline model name
            model_dir: Model directory

        Returns:
            Dict with loaded model
        """
        model_path = model_dir / f"{model_name}.joblib"

        if not model_path.exists():
            raise FileNotFoundError(f"Model not found: {model_path}")

        model = joblib.load(model_path)
        logger.info(f"Loaded baseline model: {model_name}")

        return {"model": model, "type": "baseline"}

    @classmethod
    def _load_zoo_model(cls, model_name: str, task: str, model_dir: Path) -> dict[str, Any]:
        """Load zoo model (xgb, lgbm, cat, lr, rf).

        Args:
            model_name: Zoo model name
            task: Task type
            model_dir: Model directory

        Returns:
            Dict with loaded model and metadata
        """
        model_subdir = model_dir / model_name
        model_path = model_subdir / f"{model_name}_{task}.joblib"
        metadata_path = model_subdir / f"{model_name}_{task}_metadata.json"

        if not model_path.exists():
            raise FileNotFoundError(f"Model not found: {model_path}")

        # Load model
        model = joblib.load(model_path)

        # Load metadata if available
        metadata = None
        if metadata_path.exists():
            with open(metadata_path) as f:
                metadata = json.load(f)

        logger.info(f"Loaded zoo model: {model_name} ({task})")

        return {"model": model, "metadata": metadata, "type": "zoo", "task": task}

    @classmethod
    def _load_nbt_tlf(cls, model_dir: Path, device: str = "cpu") -> dict[str, Any]:
        """Load NBT-TLF model.

        Args:
            model_dir: Model directory
            device: PyTorch device

        Returns:
            Dict with loaded trainer and config
        """
        nbt_tlf_dir = model_dir / "nbt_tlf"

        if not nbt_tlf_dir.exists():
            raise FileNotFoundError(f"NBT-TLF model not found: {nbt_tlf_dir}")

        trainer, config = NBTTLFTrainer.load(nbt_tlf_dir, device=device)
        logger.info(f"Loaded NBT-TLF model from {nbt_tlf_dir}")

        return {"trainer": trainer, "model": trainer.model, "config": config, "type": "nbt_tlf"}


def predict_race(
    race_id: str,
    model_name: str,
    race_data: pd.DataFrame,
    model_dir: Path = Path("models"),
    task: str = "win",
    calibrate: bool = True,
) -> PredictionResponse:
    """Generate predictions for a race using specified model.

    Args:
        race_id: Race identifier (e.g., '2024_Monaco')
        model_name: Name of model to use
        race_data: DataFrame with driver features for the race
        model_dir: Directory containing saved models
        task: Task type for zoo models (win/podium/expected_finish)
        calibrate: Whether to apply calibration

    Returns:
        PredictionResponse with predictions

    Raises:
        ValueError: If race_id not found in race_data
        FileNotFoundError: If model not found
    """
    # Filter to specific race - ensure DataFrame not Series
    race_df: pd.DataFrame = race_data[race_data["race_id"] == race_id].copy()
    if len(race_df) == 1:
        # Even with one row, ensure it's treated as DataFrame
        race_df = race_df.iloc[:1]

    if race_df.empty:
        raise ValueError(f"Race {race_id} not found in data")

    # Load model
    model_info = ModelRegistry.load_model(model_name, model_dir, task=task)
    model_type = model_info["type"]

    # Generate predictions based on model type
    if model_type == "baseline":
        predictions: pd.DataFrame = _predict_baseline(model_info["model"], race_df)

    elif model_type == "zoo":
        predictions = _predict_zoo(model_info, race_df, task)

    elif model_type == "nbt_tlf":
        predictions = _predict_nbt_tlf(model_info, race_df, calibrate)

    else:
        raise ValueError(f"Unknown model type: {model_type}")

    # Apply calibration if requested
    if (
        calibrate
        and model_type in ["baseline", "zoo"]
        and "win_prob" in predictions.columns
        and "podium_prob" in predictions.columns
    ):
        predictions = calibrate_tree_model_predictions(predictions, method="none")

    # Convert to PredictionResponse
    response = _predictions_to_response(race_id, model_name, predictions)

    return response


def _predict_baseline(model: BaselineModel, race_df: pd.DataFrame) -> pd.DataFrame:
    """Generate predictions using baseline model.

    Args:
        model: Baseline model instance
        race_df: Race data

    Returns:
        DataFrame with predictions
    """
    predictions = model.predict(race_df)
    return predictions


def _predict_zoo(model_info: dict[str, Any], race_df: pd.DataFrame, task: str) -> pd.DataFrame:
    """Generate predictions using zoo model.

    Args:
        model_info: Model information dict
        race_df: Race data
        task: Task type

    Returns:
        DataFrame with predictions
    """
    model = model_info["model"]
    metadata = model_info.get("metadata")

    # Get feature columns from metadata or use all numeric columns
    if metadata and "features" in metadata:
        feature_cols = metadata["features"]
    else:
        # Default: use all numeric columns except identifiers
        exclude = {
            "race_id",
            "driver_id",
            "team",
            "season",
            "round",
            "track_id",
            "finish_position",
            "dnf",
            "points_earned",
        }
        feature_cols = [
            col
            for col in race_df.columns
            if col not in exclude and pd.api.types.is_numeric_dtype(race_df[col])
        ]

    # Prepare features
    X = race_df[feature_cols].fillna(0).values

    # Generate predictions
    predictions = race_df[["race_id", "driver_id"]].copy()

    if task in ["win", "podium"]:
        # Classification: predict probabilities
        if hasattr(model, "predict_proba"):
            probs = model.predict_proba(X)
            if task == "win":
                predictions["win_prob"] = probs[:, 1]
                # Heuristic for podium
                predictions["podium_prob"] = np.minimum(probs[:, 1] * 3, 0.95)
            else:  # podium
                predictions["podium_prob"] = probs[:, 1]
                # Heuristic for win
                predictions["win_prob"] = probs[:, 1] / 3
        else:
            # Regression model used for classification (fallback)
            scores = model.predict(X)
            predictions["win_prob"] = 1 / (1 + np.exp(-scores))
            predictions["podium_prob"] = np.minimum(predictions["win_prob"] * 3, 0.95)
    else:
        # Regression: predict finish position
        predictions["expected_finish"] = model.predict(X)
        # Derive probabilities from expected finish (approximate)
        predictions["win_prob"] = 1 / predictions["expected_finish"]
        predictions["podium_prob"] = 3 / predictions["expected_finish"]

    # Ensure probabilities exist
    if "win_prob" not in predictions.columns:
        predictions["win_prob"] = 0.0
    if "podium_prob" not in predictions.columns:
        predictions["podium_prob"] = 0.0

    return predictions


def _predict_nbt_tlf(
    model_info: dict[str, Any], race_df: pd.DataFrame, calibrate: bool
) -> pd.DataFrame:
    """Generate predictions using NBT-TLF model.

    Args:
        model_info: Model information dict
        race_df: Race data
        calibrate: Whether to calibrate scores

    Returns:
        DataFrame with predictions
    """
    model = model_info["model"]
    config = model_info["config"]

    # Get mappings from config
    driver_to_idx = config.get("driver_to_idx", {})
    constructor_to_idx = config.get("constructor_to_idx", {})
    track_to_idx = config.get("track_to_idx", {})

    # Compute scores for each driver
    model.eval()
    scores = []

    with torch.no_grad():
        for _, row in race_df.iterrows():
            driver_idx = driver_to_idx.get(row["driver_id"], 0)
            constructor_idx = constructor_to_idx.get(row.get("team", ""), 0)
            track_idx = track_to_idx.get(row.get("track_id", ""), 0)
            race_idx = int(row.get("season", 2024) * 100 + row.get("round", 1))

            score = model.compute_score(
                torch.tensor([driver_idx], dtype=torch.long),
                torch.tensor([constructor_idx], dtype=torch.long),
                torch.tensor([track_idx], dtype=torch.long),
                torch.tensor([race_idx], dtype=torch.long),
            )

            scores.append(
                {"race_id": row["race_id"], "driver_id": row["driver_id"], "score": score.item()}
            )

    scores_df = pd.DataFrame(scores)

    # Calibrate scores to probabilities
    if calibrate:
        predictions = calibrate_nbt_tlf_scores(scores_df, method="none")
    else:
        # Simple softmax
        scores_arr = np.asarray(scores_df["score"].values)
        exp_scores = np.exp(scores_arr - scores_arr.max())
        win_probs = exp_scores / exp_scores.sum()

        predictions = scores_df.copy()
        predictions["win_prob"] = win_probs
        predictions["podium_prob"] = np.minimum(win_probs * 2.5, 0.95)

    return predictions


def _predictions_to_response(
    race_id: str, model_name: str, predictions: pd.DataFrame
) -> PredictionResponse:
    """Convert prediction DataFrame to PredictionResponse schema.

    Args:
        race_id: Race identifier
        model_name: Model name
        predictions: DataFrame with predictions

    Returns:
        PredictionResponse instance
    """
    # Extract win probabilities
    win_prob = {}
    for _, row in predictions.iterrows():
        if "win_prob" in predictions.columns:
            win_prob[row["driver_id"]] = float(row["win_prob"])

    # Extract podium probabilities
    podium_prob = {}
    for _, row in predictions.iterrows():
        if "podium_prob" in predictions.columns:
            podium_prob[row["driver_id"]] = float(row["podium_prob"])

    # Compute expected finish from win probabilities
    expected_finish = {}
    sorted_drivers = predictions.sort_values("win_prob", ascending=False)["driver_id"].tolist()
    for idx, driver_id in enumerate(sorted_drivers, 1):
        expected_finish[driver_id] = float(idx)

    return PredictionResponse(
        race_id=race_id,
        model_name=model_name,
        win_prob=win_prob,
        podium_prob=podium_prob,
        expected_finish=expected_finish,
        generated_at=datetime.utcnow(),
    )
