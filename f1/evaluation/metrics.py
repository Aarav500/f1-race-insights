"""Evaluation metrics for F1 race predictions.

Implements standard metrics for assessing prediction quality:
- AUC: Area Under ROC Curve
- LogLoss: Binary cross-entropy
- Brier Score: Mean squared error of probabilities
- MAE: Mean absolute error (for regression)
- ECE: Expected Calibration Error
"""

import logging
from typing import Optional

import numpy as np
from sklearn.metrics import log_loss, mean_absolute_error, roc_auc_score

logger = logging.getLogger(__name__)


def compute_auc(y_true: np.ndarray, y_pred: np.ndarray) -> float:
    """Compute Area Under ROC Curve.

    Args:
        y_true: True binary labels [n_samples]
        y_pred: Predicted probabilities [n_samples]

    Returns:
        AUC score in [0, 1], higher is better
    """
    if len(np.unique(y_true)) < 2:
        logger.warning("AUC undefined for single-class data")
        return 0.5

    try:
        return float(roc_auc_score(y_true, y_pred))
    except ValueError as e:
        logger.warning(f"AUC computation failed: {e}")
        return 0.5


def compute_logloss(y_true: np.ndarray, y_pred: np.ndarray, eps: float = 1e-15) -> float:
    """Compute binary cross-entropy (log loss).

    Args:
        y_true: True binary labels [n_samples]
        y_pred: Predicted probabilities [n_samples]
        eps: Small constant to clip probabilities

    Returns:
        Log loss, lower is better
    """
    # Clip probabilities to avoid log(0)
    y_pred_clipped = np.clip(y_pred, eps, 1 - eps)

    try:
        return float(log_loss(y_true, y_pred_clipped))
    except ValueError as e:
        logger.warning(f"LogLoss computation failed: {e}")
        return float("inf")


def compute_brier_score(y_true: np.ndarray, y_pred: np.ndarray) -> float:
    """Compute Brier score (mean squared error of probabilities).

    Args:
        y_true: True binary labels [n_samples]
        y_pred: Predicted probabilities [n_samples]

    Returns:
        Brier score in [0, 1], lower is better
    """
    squared_diff = (y_pred - y_true) ** 2
    return float(np.mean(squared_diff))


def compute_mae(y_true: np.ndarray, y_pred: np.ndarray) -> float:
    """Compute Mean Absolute Error.

    Args:
        y_true: True values [n_samples]
        y_pred: Predicted values [n_samples]

    Returns:
        MAE, lower is better
    """
    return float(mean_absolute_error(y_true, y_pred))


def compute_ece(y_true: np.ndarray, y_pred: np.ndarray, n_bins: int = 10) -> float:
    """Compute Expected Calibration Error.

    Measures calibration by binning predictions and comparing
    average prediction to actual frequency within each bin.

    Args:
        y_true: True binary labels [n_samples]
        y_pred: Predicted probabilities [n_samples]
        n_bins: Number of bins for calibration

    Returns:
        ECE in [0, 1], lower is better (0 = perfect calibration)
    """
    # Create bins
    bin_edges = np.linspace(0, 1, n_bins + 1)
    bin_indices = np.digitize(y_pred, bin_edges[:-1]) - 1
    bin_indices = np.clip(bin_indices, 0, n_bins - 1)

    ece = 0.0
    total_samples = len(y_true)

    for bin_idx in range(n_bins):
        # Get samples in this bin
        mask = bin_indices == bin_idx
        n_samples_in_bin: int = int(np.sum(mask))

        if n_samples_in_bin == 0:
            continue

        # Average predicted probability in bin
        avg_pred = np.mean(y_pred[mask])

        # Actual frequency of positive class in bin
        actual_freq = np.mean(y_true[mask])

        # Weighted contribution to ECE
        bin_weight = n_samples_in_bin / total_samples
        ece += bin_weight * abs(avg_pred - actual_freq)

    return float(ece)


def compute_metrics(
    y_true: np.ndarray,
    y_pred: np.ndarray,
    task: str = "classification",
    metric_names: Optional[list[str]] = None,
) -> dict[str, float]:
    """Compute all relevant metrics for a task.

    Args:
        y_true: True labels or values
        y_pred: Predicted probabilities or values
        task: 'classification' or 'regression'
        metric_names: Optional list of specific metrics to compute

    Returns:
        Dictionary of metric_name -> value
    """
    results = {}

    if task == "classification":
        # Default classification metrics
        if metric_names is None:
            metric_names = ["auc", "logloss", "brier", "ece"]

        if "auc" in metric_names:
            results["auc"] = compute_auc(y_true, y_pred)

        if "logloss" in metric_names:
            results["logloss"] = compute_logloss(y_true, y_pred)

        if "brier" in metric_names:
            results["brier"] = compute_brier_score(y_true, y_pred)

        if "ece" in metric_names:
            results["ece"] = compute_ece(y_true, y_pred)

    elif task == "regression":
        # Default regression metrics
        if metric_names is None:
            metric_names = ["mae"]

        if "mae" in metric_names:
            results["mae"] = compute_mae(y_true, y_pred)

    else:
        raise ValueError(f"Unknown task: {task}")

    return results


def summarize_metrics(metrics_dict: dict[str, float]) -> str:
    """Create a human-readable summary of metrics.

    Args:
        metrics_dict: Dictionary of metric_name -> value

    Returns:
        Formatted string summary
    """
    lines = ["Metrics Summary:", "=" * 40]

    for metric_name, value in sorted(metrics_dict.items()):
        if metric_name in ["auc", "brier", "ece", "mae"]:
            lines.append(f"{metric_name.upper():10s}: {value:.4f}")
        elif metric_name == "logloss":
            lines.append(f"{'LogLoss':10s}: {value:.4f}")
        else:
            lines.append(f"{metric_name:10s}: {value:.4f}")

    lines.append("=" * 40)
    return "\n".join(lines)
