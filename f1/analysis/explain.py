"""Model explanation methods for F1 predictions.

Provides interpretability for various model types:
- SHAP for tree models (xgb, lgbm, cat)
- Permutation importance for linear/ensemble models (lr, rf)
- Component ablation for NBT-TLF
"""

import logging
from typing import Any

import numpy as np
import pandas as pd
import shap
import torch
from sklearn.inspection import permutation_importance

from f1.models.registry import ModelRegistry
from f1.schemas import ExplainResponse, FeatureImpact

logger = logging.getLogger(__name__)


def explain_prediction(
    race_id: str,
    driver_id: str,
    model_name: str,
    race_data: pd.DataFrame,
    model_dir: str = "models",
    top_k: int = 10,
) -> ExplainResponse:
    """Explain prediction for a specific driver.

    Args:
        race_id: Race identifier
        driver_id: Driver to explain
        model_name: Name of model
        race_data: Full race dataset
        model_dir: Model directory
        top_k: Number of top features to return

    Returns:
        ExplainResponse with feature impacts
    """
    from pathlib import Path

    # Filter to race and driver - ensure DataFrames not Series
    race_df: pd.DataFrame = race_data.loc[race_data["race_id"] == race_id].copy()
    driver_df: pd.DataFrame = race_df.loc[race_df["driver_id"] == driver_id].copy()

    if driver_df.empty:
        raise ValueError(f"Driver {driver_id} not found in race {race_id}")

    # Load model
    model_info = ModelRegistry.load_model(model_name, Path(model_dir))
    model_type = model_info["type"]

    # Generate explanations based on model type
    if model_type == "zoo" and model_name in ["xgb", "lgbm", "cat"]:
        feature_impacts = _explain_tree_model(model_info, race_df, driver_df, top_k)

    elif model_type == "zoo" and model_name in ["lr", "rf"]:
        feature_impacts = _explain_linear_ensemble(model_info, race_df, driver_df, top_k)

    elif model_type == "nbt_tlf":
        feature_impacts = _explain_nbt_tlf(model_info, driver_df, top_k)

    elif model_type == "baseline":
        # Simple explanation for baselines
        feature_impacts = _explain_baseline(model_name, driver_df)

    else:
        raise ValueError(f"Explanation not supported for model type: {model_type}")

    return ExplainResponse(
        race_id=race_id,
        driver_id=driver_id,
        model_name=model_name,
        top_features=feature_impacts[:top_k],
    )


def _explain_tree_model(
    model_info: dict, race_df: pd.DataFrame, driver_df: pd.DataFrame, top_k: int
) -> list[FeatureImpact]:
    """Explain tree model using SHAP.

    Args:
        model_info: Model information
        race_df: Race data
        driver_df: Driver-specific data
        top_k: Number of features

    Returns:
        List of FeatureImpact
    """
    model = model_info["model"]
    metadata = model_info.get("metadata", {})

    # Get feature columns
    feature_cols = metadata.get("features", [])
    if not feature_cols:
        # Use all numeric columns
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

    # Prepare data
    X_driver = driver_df[feature_cols].fillna(0)

    try:
        # Use TreeExplainer for efficiency
        explainer = shap.TreeExplainer(model)
        shap_values = explainer.shap_values(X_driver)

        # For binary classification, take positive class
        if isinstance(shap_values, list):
            shap_values = shap_values[1]

        # Get impacts
        if len(shap_values.shape) > 1:
            shap_values = shap_values[0]

        # Create feature impacts
        feature_impacts = []
        for idx, col in enumerate(feature_cols):
            feature_impacts.append(
                FeatureImpact(
                    name=col,
                    value=float(X_driver[col].values[0]),
                    impact=float(abs(shap_values[idx])),
                )
            )

        # Sort by absolute impact
        feature_impacts.sort(key=lambda x: x.impact, reverse=True)

        logger.info(f"SHAP analysis complete: {len(feature_impacts)} features")
        return feature_impacts[:top_k]

    except Exception as e:
        logger.warning(f"SHAP failed, using feature importance: {e}")
        # Fallback to feature importance
        return _fallback_feature_importance(model, feature_cols, driver_df)


def _explain_linear_ensemble(
    model_info: dict, race_df: pd.DataFrame, driver_df: pd.DataFrame, top_k: int
) -> list[FeatureImpact]:
    """Explain linear/ensemble model using permutation importance.

    Args:
        model_info: Model information
        race_df: Race data
        driver_df: Driver-specific data
        top_k: Number of features

    Returns:
        List of FeatureImpact
    """
    model = model_info["model"]
    metadata = model_info.get("metadata", {})

    # Get feature columns
    feature_cols = metadata.get("features", [])
    if not feature_cols:
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

    # Prepare data
    X_race = race_df[feature_cols].fillna(0).values
    X_driver = driver_df[feature_cols].fillna(0)

    # Get actual outcomes for permutation importance
    if "finish_position" in race_df.columns:
        y_race = (race_df["finish_position"] == 1).astype(int).values
    else:
        logger.warning("No finish_position, using dummy outcomes")
        y_race = np.zeros(len(race_df))

    try:
        # Compute permutation importance
        result = permutation_importance(model, X_race, y_race, n_repeats=10, random_state=42)

        # Create feature impacts
        feature_impacts = []
        for idx, col in enumerate(feature_cols):
            feature_impacts.append(
                FeatureImpact(
                    name=col,
                    value=float(X_driver[col].values[0]),
                    impact=float(result.importances_mean[idx]),
                )
            )

        # Sort by importance
        feature_impacts.sort(key=lambda x: x.impact, reverse=True)

        logger.info(f"Permutation importance complete: {len(feature_impacts)} features")
        return feature_impacts[:top_k]

    except Exception as e:
        logger.warning(f"Permutation importance failed: {e}")
        return _fallback_feature_importance(model, feature_cols, driver_df)


def _explain_nbt_tlf(model_info: dict, driver_df: pd.DataFrame, top_k: int) -> list[FeatureImpact]:
    """Explain NBT-TLF using component ablation.

    Zero-out each component and measure score delta to assess contribution.

    Args:
        model_info: Model information with trainer and config
        driver_df: Driver-specific data
        top_k: Number of features

    Returns:
        List of FeatureImpact
    """
    model = model_info["model"]
    config = model_info["config"]

    driver_to_idx = config.get("driver_to_idx", {})
    constructor_to_idx = config.get("constructor_to_idx", {})
    track_to_idx = config.get("track_to_idx", {})

    # Get driver info
    row = driver_df.iloc[0]
    driver_idx = driver_to_idx.get(row["driver_id"], 0)
    constructor_idx = constructor_to_idx.get(row.get("team", ""), 0)
    track_idx = track_to_idx.get(row.get("track_id", ""), 0)
    race_idx = int(row.get("season", 2024) * 100 + row.get("round", 1))

    model.eval()
    with torch.no_grad():
        # Baseline score
        baseline_score = model.compute_score(
            torch.tensor([driver_idx], dtype=torch.long),
            torch.tensor([constructor_idx], dtype=torch.long),
            torch.tensor([track_idx], dtype=torch.long),
            torch.tensor([race_idx], dtype=torch.long),
        ).item()

        # Ablate driver embedding
        driver_ablated = model.compute_score(
            torch.tensor([0], dtype=torch.long),  # Zero index
            torch.tensor([constructor_idx], dtype=torch.long),
            torch.tensor([track_idx], dtype=torch.long),
            torch.tensor([race_idx], dtype=torch.long),
        ).item()

        # Ablate constructor embedding
        constructor_ablated = model.compute_score(
            torch.tensor([driver_idx], dtype=torch.long),
            torch.tensor([0], dtype=torch.long),
            torch.tensor([track_idx], dtype=torch.long),
            torch.tensor([race_idx], dtype=torch.long),
        ).item()

        # Ablate track embedding
        track_ablated = model.compute_score(
            torch.tensor([driver_idx], dtype=torch.long),
            torch.tensor([constructor_idx], dtype=torch.long),
            torch.tensor([0], dtype=torch.long),
            torch.tensor([race_idx], dtype=torch.long),
        ).item()

    # Compute contributions (deltas from baseline)
    feature_impacts = [
        FeatureImpact(
            name="driver_embedding",
            value=float(driver_idx),
            impact=abs(baseline_score - driver_ablated),
        ),
        FeatureImpact(
            name="constructor_embedding",
            value=float(constructor_idx),
            impact=abs(baseline_score - constructor_ablated),
        ),
        FeatureImpact(
            name="track_embedding",
            value=float(track_idx),
            impact=abs(baseline_score - track_ablated),
        ),
    ]

    # Sort by impact
    feature_impacts.sort(key=lambda x: x.impact, reverse=True)

    logger.info(f"NBT-TLF ablation complete: {len(feature_impacts)} components")
    return feature_impacts[:top_k]


def _explain_baseline(model_name: str, driver_df: pd.DataFrame) -> list[FeatureImpact]:
    """Simple explanation for baseline models."""
    impacts = []

    if model_name == "quali_freq":
        if "quali_position" in driver_df.columns:
            impacts.append(
                FeatureImpact(
                    name="quali_position",
                    value=float(driver_df["quali_position"].values[0]),
                    impact=1.0,
                )
            )
    elif model_name == "elo":
        # Would need access to ratings
        impacts.append(FeatureImpact(name="elo_rating", value=0.0, impact=1.0))

    return impacts


def _fallback_feature_importance(
    model: Any, feature_cols: list[str], driver_df: pd.DataFrame
) -> list[FeatureImpact]:
    """Fallback to model's built-in feature importance."""
    impacts = []

    if hasattr(model, "feature_importances_"):
        importances = model.feature_importances_
        for idx, col in enumerate(feature_cols):
            impacts.append(
                FeatureImpact(
                    name=col,
                    value=float(driver_df[col].values[0]) if col in driver_df.columns else 0.0,
                    impact=float(importances[idx]),
                )
            )
    else:
        # No importances available
        for col in feature_cols[:10]:
            impacts.append(
                FeatureImpact(
                    name=col,
                    value=float(driver_df[col].values[0]) if col in driver_df.columns else 0.0,
                    impact=0.0,
                )
            )

    impacts.sort(key=lambda x: x.impact, reverse=True)
    return impacts
