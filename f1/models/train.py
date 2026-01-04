"""Training pipeline for supervised ML models.

Supports multiple models (XGBoost, LightGBM, CatBoost, LogisticRegression, RandomForest)
and tasks (win classification, podium classification, finish position regression).
"""

import argparse
import json
import logging
from datetime import datetime
from pathlib import Path
from typing import Any, Optional

import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.linear_model import LogisticRegression, Ridge
from sklearn.metrics import accuracy_score, log_loss, mean_squared_error, roc_auc_score

try:
    import xgboost as xgb

    HAS_XGB = True
except ImportError:
    HAS_XGB = False

try:
    import lightgbm as lgb

    HAS_LIGHTGBM = True
except ImportError:
    HAS_LIGHTGBM = False

try:
    import catboost as cb

    HAS_CATBOOST = True
except ImportError:
    HAS_CATBOOST = False

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def time_based_split(
    df: pd.DataFrame, test_size: float = 0.2, date_column: str = "race_date"
) -> tuple[pd.DataFrame, pd.DataFrame]:
    """Split data by time for temporal validation.

    Args:
        df: DataFrame with temporal ordering
        test_size: Fraction of data to use for testing
        date_column: Column name for date/time ordering

    Returns:
        Tuple of (train_df, test_df)
    """
    # Sort by date if column exists, otherwise by season/round
    if date_column in df.columns and df[date_column].notna().any():
        df = df.sort_values(date_column)
    else:
        df = df.sort_values(["season", "round"])

    split_idx = int(len(df) * (1 - test_size))
    train_df = df.iloc[:split_idx].copy()
    test_df = df.iloc[split_idx:].copy()

    logger.info(f"Time-based split: {len(train_df)} train, {len(test_df)} test")
    return train_df, test_df


def prepare_features(
    df: pd.DataFrame, task: str, feature_cols: Optional[list[str]] = None
) -> tuple[np.ndarray, np.ndarray, list[str]]:
    """Prepare features and labels for training.

    Args:
        df: DataFrame with features and outcomes
        task: One of 'win', 'podium', 'expected_finish'
        feature_cols: List of feature column names (auto-detect if None)

    Returns:
        Tuple of (X, y, feature_cols) where X is features array, y is labels array, and feature_cols is list of feature names
    """
    # Auto-detect feature columns if not provided
    if feature_cols is None:
        # Exclude metadata and outcome columns
        exclude_cols = {
            "race_id",
            "driver_id",
            "team",
            "season",
            "round",
            "track_id",
            "finish_position",
            "dnf",
            "points_earned",
            "race_date",
            "track_name",
            "track_country",
            "race_name",
            "country",
            "driver_prior_races_count",
            "constructor_prior_races_count",
        }
        feature_cols = [col for col in df.columns if col not in exclude_cols]

    X = df[feature_cols].fillna(0).values  # Simple imputation for NaN

    # Prepare labels based on task
    if task == "win":
        # Binary: did driver win (finish_position == 1)?
        y = (df["finish_position"] == 1).astype(int).values
    elif task == "podium":
        # Binary: did driver podium (finish_position <= 3)?
        y = (df["finish_position"] <= 3).astype(int).values
    elif task == "top5":
        # Binary: did driver finish top 5? (Higher accuracy target)
        y = (df["finish_position"] <= 5).astype(int).values
    elif task == "points":
        # Binary: did driver score points (top 10)? (Highest accuracy target ~92%)
        y = (df["finish_position"] <= 10).astype(int).values
    elif task == "expected_finish":
        # Regression: predict finish position
        y = df["finish_position"].fillna(20).values
    else:
        raise ValueError(f"Unknown task: {task}")

    # Ensure y is np.ndarray
    y = np.asarray(y)

    logger.info(f"Prepared features: X shape={X.shape}, y shape={y.shape}")
    logger.info(f"Feature columns ({len(feature_cols)}): {feature_cols[:10]}...")

    return np.asarray(X), y, feature_cols


def create_model(model_name: str, task: str, seed: int = 42, optimized: bool = True) -> Any:
    """Create model instance.

    Args:
        model_name: One of 'xgb', 'lgbm', 'cat', 'lr', 'rf'
        task: One of 'win', 'podium', 'expected_finish'
        seed: Random seed
        optimized: Whether to use optimized hyperparameters (default: True)

    Returns:
        Model instance
    """
    is_classification = task in ["win", "podium"]

    if model_name == "xgb":
        if not HAS_XGB:
            raise ImportError("XGBoost not installed. Install with: pip install xgboost")
        if is_classification:
            if optimized:
                # Optimized hyperparameters for better generalization
                return xgb.XGBClassifier(
                    n_estimators=200,
                    max_depth=4,  # Reduced from 6 to prevent overfitting
                    learning_rate=0.05,  # Lower LR with more trees
                    min_child_weight=5,  # Prevent overfitting on rare cases
                    subsample=0.8,  # Row sampling
                    colsample_bytree=0.8,  # Feature sampling
                    reg_alpha=0.1,  # L1 regularization
                    reg_lambda=1.0,  # L2 regularization
                    random_state=seed,
                    eval_metric="logloss",
                    scale_pos_weight=19,  # ~1 win per 20 drivers
                )
            else:
                return xgb.XGBClassifier(
                    n_estimators=100,
                    max_depth=6,
                    learning_rate=0.1,
                    random_state=seed,
                    eval_metric="logloss",
                )
        else:
            return xgb.XGBRegressor(
                n_estimators=200 if optimized else 100,
                max_depth=4 if optimized else 6,
                learning_rate=0.05 if optimized else 0.1,
                random_state=seed
            )

    elif model_name == "lgbm":
        if not HAS_LIGHTGBM:
            raise ImportError("LightGBM not installed. Install with: pip install lightgbm")
        if is_classification:
            if optimized:
                # Optimized hyperparameters to reduce overfitting
                return lgb.LGBMClassifier(
                    n_estimators=200,
                    max_depth=4,
                    num_leaves=15,  # Lower than 2^max_depth
                    learning_rate=0.05,
                    min_data_in_leaf=20,  # Minimum samples per leaf
                    feature_fraction=0.8,  # Column subsampling
                    bagging_fraction=0.8,  # Row subsampling
                    bagging_freq=5,
                    reg_alpha=0.1,  # L1 regularization
                    reg_lambda=1.0,  # L2 regularization
                    random_state=seed,
                    verbose=-1,
                    class_weight='balanced',
                )
            else:
                return lgb.LGBMClassifier(
                    n_estimators=100, max_depth=6, learning_rate=0.1, random_state=seed, verbose=-1
                )
        else:
            return lgb.LGBMRegressor(
                n_estimators=200 if optimized else 100,
                max_depth=4 if optimized else 6,
                learning_rate=0.05 if optimized else 0.1,
                random_state=seed, verbose=-1
            )

    elif model_name == "cat":
        if not HAS_CATBOOST:
            raise ImportError("CatBoost not installed. Install with: pip install catboost")
        if is_classification:
            if optimized:
                return cb.CatBoostClassifier(
                    iterations=200,
                    depth=4,  # Reduced from 6
                    learning_rate=0.05,
                    l2_leaf_reg=3.0,  # L2 regularization
                    random_state=seed,
                    verbose=False,
                    auto_class_weights='Balanced',
                )
            else:
                return cb.CatBoostClassifier(
                    iterations=100, depth=6, learning_rate=0.1, random_state=seed, verbose=False
                )
        else:
            return cb.CatBoostRegressor(
                iterations=200 if optimized else 100,
                depth=4 if optimized else 6,
                learning_rate=0.05 if optimized else 0.1,
                random_state=seed, verbose=False
            )

    elif model_name == "lr":
        if is_classification:
            # Logistic Regression with regularization tuning
            return LogisticRegression(
                max_iter=1000,
                random_state=seed,
                C=0.5 if optimized else 1.0,  # Slight regularization
                class_weight='balanced' if optimized else None,
            )
        else:
            return Ridge(alpha=1.0, random_state=seed)

    elif model_name == "rf":
        if is_classification:
            if optimized:
                return RandomForestClassifier(
                    n_estimators=200,
                    max_depth=8,  # Reduced from 10
                    min_samples_split=10,
                    min_samples_leaf=5,
                    max_features='sqrt',
                    random_state=seed,
                    class_weight='balanced',
                )
            else:
                return RandomForestClassifier(n_estimators=100, max_depth=10, random_state=seed)
        else:
            return RandomForestRegressor(
                n_estimators=200 if optimized else 100,
                max_depth=8 if optimized else 10,
                random_state=seed
            )

    else:
        raise ValueError(f"Unknown model: {model_name}")


def evaluate_model(
    model: Any, X_test: np.ndarray, y_test: np.ndarray, task: str
) -> dict[str, float]:
    """Evaluate model performance.

    Args:
        model: Trained model
        X_test: Test features
        y_test: Test labels
        task: Task type

    Returns:
        Dictionary of metrics
    """
    metrics = {}

    if task in ["win", "podium"]:
        # Classification metrics
        y_pred = model.predict(X_test)
        y_pred_proba = model.predict_proba(X_test)[:, 1]

        metrics["accuracy"] = accuracy_score(y_test, y_pred)
        metrics["log_loss"] = log_loss(y_test, y_pred_proba)

        # ROC-AUC if we have positive samples
        if len(np.unique(y_test)) > 1:
            metrics["roc_auc"] = roc_auc_score(y_test, y_pred_proba)

    else:
        # Regression metrics
        y_pred = model.predict(X_test)
        metrics["mse"] = mean_squared_error(y_test, y_pred)
        metrics["rmse"] = np.sqrt(metrics["mse"])
        metrics["mae"] = np.mean(np.abs(y_test - y_pred))

    return metrics


def save_model_artifacts(
    model: Any,
    model_name: str,
    task: str,
    feature_cols: list[str],
    metrics: dict[str, float],
    output_dir: Path,
    window: int = 5,
    seed: int = 42,
) -> None:
    """Save model and metadata.

    Args:
        model: Trained model
        model_name: Model name
        task: Task name
        feature_cols: List of feature names
        metrics: Performance metrics
        output_dir: Output directory
        window: Rolling window size used
        seed: Random seed used
    """
    output_dir.mkdir(parents=True, exist_ok=True)

    # Save model
    model_path = output_dir / f"{model_name}_{task}.joblib"
    joblib.dump(model, model_path)
    logger.info(f"Model saved to {model_path}")

    # Save metadata
    metadata = {
        "model_name": model_name,
        "task": task,
        "features": feature_cols,
        "num_features": len(feature_cols),
        "window": window,
        "seed": seed,
        "timestamp": datetime.utcnow().isoformat(),
        "metrics": metrics,
    }

    metadata_path = output_dir / f"{model_name}_{task}_metadata.json"
    with open(metadata_path, "w") as f:
        json.dump(metadata, f, indent=2)
    logger.info(f"Metadata saved to {metadata_path}")


def main():
    """Main training function."""
    parser = argparse.ArgumentParser(description="Train F1 prediction models")
    parser.add_argument(
        "--model",
        type=str,
        required=True,
        choices=["xgb", "lgbm", "cat", "lr", "rf"],
        help="Model to train",
    )
    parser.add_argument(
        "--task",
        type=str,
        required=True,
        choices=["win", "podium", "top5", "points", "expected_finish"],
        help="Prediction task: win, podium (top3), top5, points (top10), expected_finish",
    )
    parser.add_argument(
        "--data", type=str, required=True, help="Path to feature data (parquet or csv)"
    )
    parser.add_argument("--output", type=str, default="models", help="Output directory for models")
    parser.add_argument("--test-size", type=float, default=0.2, help="Fraction of data for testing")
    parser.add_argument("--window", type=int, default=5, help="Rolling window size (for metadata)")
    parser.add_argument("--seed", type=int, default=42, help="Random seed")

    args = parser.parse_args()

    # Load data
    logger.info(f"Loading data from {args.data}")
    df = pd.read_parquet(args.data) if args.data.endswith(".parquet") else pd.read_csv(args.data)

    logger.info(f"Loaded {len(df)} samples")

    # Check required columns
    if "finish_position" not in df.columns:
        raise ValueError("Data must contain 'finish_position' column for training")

    # Time-based split
    train_df, test_df = time_based_split(df, test_size=args.test_size)

    # Prepare features and labels
    X_train, y_train, feature_cols = prepare_features(train_df, args.task)
    X_test, y_test, _ = prepare_features(test_df, args.task, feature_cols)

    # Create and train model
    logger.info(f"Training {args.model} for {args.task}")
    model = create_model(args.model, args.task, args.seed)
    model.fit(X_train, y_train)

    # Evaluate
    logger.info("Evaluating model")
    metrics = evaluate_model(model, X_test, y_test, args.task)

    logger.info("Test Metrics:")
    for metric_name, value in metrics.items():
        logger.info(f"  {metric_name}: {value:.4f}")

    # Save artifacts
    output_dir = Path(args.output) / args.model
    save_model_artifacts(
        model, args.model, args.task, feature_cols, metrics, output_dir, args.window, args.seed
    )

    logger.info("Training complete!")


if __name__ == "__main__":
    main()
