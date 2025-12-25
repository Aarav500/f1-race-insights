"""Probability calibration for F1 race predictions.

Calibrates model outputs to well-calibrated probabilities:
- Tree models: Calibrate predicted probabilities directly
- NBT-TLF: Convert scores to probabilities with isotonic regression
"""

import logging
from typing import Optional, Union

import numpy as np
import pandas as pd
from sklearn.isotonic import IsotonicRegression

logger = logging.getLogger(__name__)


class ProbabilityCalibrator:
    """Calibrator for converting model outputs to calibrated probabilities."""

    def __init__(self, method: str = "isotonic"):
        """Initialize calibrator.

        Args:
            method: Calibration method ('isotonic', 'sigmoid', or 'none')
        """
        self.method = method
        self.calibrator = None

        if method == "isotonic":
            self.calibrator = IsotonicRegression(out_of_bounds="clip")

    def fit(self, scores: np.ndarray, true_outcomes: np.ndarray):
        """Fit calibrator on validation data.

        Args:
            scores: Model scores or probabilities [n_samples]
            true_outcomes: True binary outcomes [n_samples]
        """
        if self.method == "isotonic":
            if self.calibrator is not None:
                self.calibrator.fit(scores, true_outcomes)
                logger.info("Isotonic calibrator fitted")
        elif self.method == "sigmoid":
            # Platt scaling: fit logistic regression on scores
            from sklearn.linear_model import LogisticRegression

            self.calibrator = LogisticRegression()
            self.calibrator.fit(scores.reshape(-1, 1), true_outcomes)
            logger.info("Sigmoid calibrator fitted")

    def transform(self, scores: np.ndarray) -> np.ndarray:
        """Transform scores to calibrated probabilities.

        Args:
            scores: Model scores or probabilities [n_samples]

        Returns:
            Calibrated probabilities [n_samples]
        """
        if self.method == "none" or self.calibrator is None:
            return np.asarray(np.clip(scores, 0, 1))

        if self.method == "isotonic":
            result = self.calibrator.transform(scores)
            return np.asarray(result)
        elif self.method == "sigmoid":
            result = self.calibrator.predict_proba(scores.reshape(-1, 1))[:, 1]
            return np.asarray(result)

        return np.asarray(scores)


def normalize_race_probabilities(race_probs: pd.DataFrame, prob_cols: list[str]) -> pd.DataFrame:
    """Normalize probabilities to sum to 1 within a race.

    Args:
        race_probs: DataFrame with driver predictions for one race
        prob_cols: List of probability columns to normalize

    Returns:
        DataFrame with normalized probabilities
    """
    race_probs = race_probs.copy()

    for col in prob_cols:
        if col in race_probs.columns:  # noqa: SIM102
            total = race_probs[col].sum()
            if total > 0:
                race_probs[col] = race_probs[col] / total
            else:
                # If all probabilities are 0, assign uniform
                race_probs[col] = 1.0 / len(race_probs)

    return race_probs


def calibrate_tree_model_predictions(
    predictions: pd.DataFrame,
    validation_df: Optional[pd.DataFrame] = None,
    method: str = "isotonic",
) -> pd.DataFrame:
    """Calibrate predictions from tree-based models.

    Args:
        predictions: DataFrame with predicted probabilities
        validation_df: Optional validation data for fitting calibrator
        method: Calibration method

    Returns:
        DataFrame with calibrated probabilities
    """
    calibrated = predictions.copy()

    # Calibrate win probabilities
    if (
        "win_prob" in predictions.columns
        and validation_df is not None
        and "win_prob" in validation_df.columns
    ):
        # Fit calibrator on validation data
        calibrator = ProbabilityCalibrator(method)
        y_true = np.asarray((validation_df["finish_position"] == 1).astype(int).values)
        y_pred = np.asarray(validation_df["win_prob"].values)

        calibrator.fit(y_pred, y_true)
        calibrated["win_prob"] = calibrator.transform(np.asarray(predictions["win_prob"].values))

    # Ensure bounded [0, 1]
    if "win_prob" in predictions.columns:
        calibrated["win_prob"] = np.clip(calibrated["win_prob"], 0, 1)

    # Calibrate podium probabilities
    if (
        "podium_prob" in predictions.columns
        and validation_df is not None
        and "podium_prob" in validation_df.columns
    ):
        calibrator = ProbabilityCalibrator(method)
        y_true = np.asarray((validation_df["finish_position"] <= 3).astype(int).values)
        y_pred = np.asarray(validation_df["podium_prob"].values)

        calibrator.fit(y_pred, y_true)
        calibrated["podium_prob"] = calibrator.transform(
            np.asarray(predictions["podium_prob"].values)
        )

    if "podium_prob" in predictions.columns:
        calibrated["podium_prob"] = np.clip(calibrated["podium_prob"], 0, 1)

    # Normalize within races to ensure probabilities sum to 1
    if "race_id" in calibrated.columns:
        calibrated = (
            calibrated.groupby("race_id", group_keys=False)
            .apply(lambda x: normalize_race_probabilities(x, ["win_prob", "podium_prob"]))
            .reset_index(drop=True)
        )

    # Ensure win_prob <= podium_prob after normalization (podium is superset of win)
    if "win_prob" in calibrated.columns and "podium_prob" in calibrated.columns:
        calibrated["podium_prob"] = np.maximum(calibrated["podium_prob"], calibrated["win_prob"])

    return calibrated


def calibrate_nbt_tlf_scores(
    scores_df: pd.DataFrame,
    validation_df: Optional[pd.DataFrame] = None,
    score_col: str = "score",
    method: str = "isotonic",
) -> pd.DataFrame:
    """Calibrate NBT-TLF scores to probabilities.

    Args:
        scores_df: DataFrame with model scores per driver
        validation_df: Optional validation data with scores and outcomes
        score_col: Name of score column
        method: Calibration method

    Returns:
        DataFrame with calibrated win and podium probabilities
    """
    calibrated = scores_df.copy()

    # Step 1: Convert scores to raw probabilities via softmax (within race)
    if "race_id" in calibrated.columns:

        def softmax_within_race(group):
            scores = np.asarray(group[score_col].values)
            # Softmax: exp(scores) / sum(exp(scores))
            exp_scores = np.exp(scores - scores.max())  # Subtract max for numerical stability
            win_probs = exp_scores / exp_scores.sum()

            group["win_prob_raw"] = win_probs

            # Podium prob heuristic: ensure win_prob <= podium_prob <= 1
            # Simple approach: podium is win prob scaled up, but clamped
            podium_raw = win_probs * 2.5
            podium_probs = np.maximum(podium_raw, win_probs)  # At least win_prob
            podium_probs = np.minimum(podium_probs, 1.0)  # At most 1.0

            group["podium_prob_raw"] = podium_probs
            return group

        calibrated = (
            calibrated.groupby("race_id", group_keys=False)
            .apply(softmax_within_race)
            .reset_index(drop=True)
        )
    else:
        # No race grouping, just use sigmoid
        calibrated["win_prob_raw"] = 1 / (1 + np.exp(-calibrated[score_col]))
        calibrated["podium_prob_raw"] = np.minimum(calibrated["win_prob_raw"] * 3, 0.95)

    # Step 2: Calibrate using validation data (optional isotonic regression)
    if (
        validation_df is not None
        and method != "none"
        and "finish_position" in validation_df.columns
    ):
        # Compute raw probabilities for validation
        val_with_probs = validation_df.copy()

        if "race_id" in val_with_probs.columns:  # noqa: SIM102
            val_with_probs = (
                val_with_probs.groupby("race_id", group_keys=False)
                .apply(softmax_within_race)
                .reset_index(drop=True)
            )

        # Fit isotonic regression
        win_calibrator = ProbabilityCalibrator(method)
        y_true_win = np.asarray((val_with_probs["finish_position"] == 1).astype(int).values)
        y_pred_win = np.asarray(val_with_probs["win_prob_raw"].values)

        win_calibrator.fit(y_pred_win, y_true_win)
        calibrated["win_prob"] = win_calibrator.transform(
            np.asarray(calibrated["win_prob_raw"].values)
        )

        # Calibrate podium probabilities
        podium_calibrator = ProbabilityCalibrator(method)
        y_true_podium = np.asarray((val_with_probs["finish_position"] <= 3).astype(int).values)
        y_pred_podium = np.asarray(val_with_probs["podium_prob_raw"].values)

        podium_calibrator.fit(y_pred_podium, y_true_podium)
        calibrated["podium_prob"] = podium_calibrator.transform(
            np.asarray(calibrated["podium_prob_raw"].values)
        )
    elif validation_df is not None and method != "none":
        logger.warning("Validation data missing finish_position, skipping calibration")
        calibrated["win_prob"] = calibrated["win_prob_raw"]
        calibrated["podium_prob"] = calibrated["podium_prob_raw"]
    else:
        # No calibration, use raw probabilities
        calibrated["win_prob"] = calibrated["win_prob_raw"]
        calibrated["podium_prob"] = calibrated["podium_prob_raw"]

    # Ensure bounded [0, 1]
    calibrated["win_prob"] = np.clip(calibrated["win_prob"], 0, 1)
    calibrated["podium_prob"] = np.clip(calibrated["podium_prob"], 0, 1)

    # Step 3: Normalize to ensure sum to 1 within each race
    if "race_id" in calibrated.columns:
        calibrated = (
            calibrated.groupby("race_id", group_keys=False)
            .apply(lambda x: normalize_race_probabilities(x, ["win_prob", "podium_prob"]))
            .reset_index(drop=True)
        )

    # Ensure win_prob <= podium_prob after normalization (podium is superset of win)
    calibrated["podium_prob"] = np.maximum(calibrated["podium_prob"], calibrated["win_prob"])

    return calibrated


def validate_probabilities(predictions: pd.DataFrame, tolerance: float = 1e-6) -> dict:
    """Validate that probabilities are well-formed.

    Args:
        predictions: DataFrame with predictions
        tolerance: Tolerance for sum-to-one checks

    Returns:
        Dictionary with validation results
    """
    results: dict[str, Union[bool, list[str], float]] = {"valid": True, "issues": []}
    issues: list[str] = []

    # Check win_prob bounds
    if "win_prob" in predictions.columns:
        if (predictions["win_prob"] < 0).any() or (predictions["win_prob"] > 1).any():
            results["valid"] = False
            issues.append("win_prob has values outside [0, 1]")

        # Check sum to 1 within races
        if "race_id" in predictions.columns and not np.allclose(
            race_sums := predictions.groupby("race_id")["win_prob"].sum(), 1.0, atol=tolerance
        ):
            max_diff = np.abs(race_sums - 1.0).max()
            results["valid"] = False
            issues.append(f"win_prob does not sum to 1 (max diff: {max_diff:.6f})")

    # Check podium_prob bounds
    if "podium_prob" in predictions.columns and (
        (predictions["podium_prob"] < 0).any() or (predictions["podium_prob"] > 1).any()
    ):
        results["valid"] = False
        issues.append("podium_prob has values outside [0, 1]")

    # Check win_prob <= podium_prob (winning implies podium)
    if (
        "win_prob" in predictions.columns
        and "podium_prob" in predictions.columns
        and (predictions["win_prob"] > predictions["podium_prob"] + tolerance).any()
    ):
        results["valid"] = False
        issues.append("Some win_prob > podium_prob")

    # Assign issues list to results
    results["issues"] = issues

    if results["valid"]:
        logger.info("✓ All probability validations passed")
    else:
        for issue in issues:
            logger.warning(f"✗ {issue}")

    return results
