"""Ensemble and calibrated models for F1 predictions.

This module implements:
1. Stacking ensemble combining multiple base models
2. Isotonic calibration for probability calibration
3. Blending ensemble with optimized weights
"""

import logging
from typing import Any, Optional

import numpy as np
from sklearn.calibration import CalibratedClassifierCV
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import cross_val_predict

logger = logging.getLogger(__name__)


class CalibratedModel:
    """Wrapper for isotonic-calibrated model predictions."""

    def __init__(self, base_model: Any, method: str = "isotonic", cv: int = 5):
        """Initialize calibrated model.

        Args:
            base_model: Base classifier to calibrate
            method: Calibration method ('isotonic' or 'sigmoid')
            cv: Number of cross-validation folds
        """
        self.base_model = base_model
        self.method = method
        self.cv = cv
        self.calibrated_model: Optional[CalibratedClassifierCV] = None

    def fit(self, X: np.ndarray, y: np.ndarray) -> "CalibratedModel":
        """Fit calibrated model.

        Args:
            X: Training features
            y: Training labels

        Returns:
            Fitted calibrated model
        """
        self.calibrated_model = CalibratedClassifierCV(
            self.base_model, method=self.method, cv=self.cv
        )
        self.calibrated_model.fit(X, y)
        return self

    def predict(self, X: np.ndarray) -> np.ndarray:
        """Predict class labels.

        Args:
            X: Features

        Returns:
            Predicted class labels
        """
        if self.calibrated_model is None:
            raise ValueError("Model not fitted. Call fit() first.")
        return self.calibrated_model.predict(X)

    def predict_proba(self, X: np.ndarray) -> np.ndarray:
        """Predict class probabilities.

        Args:
            X: Features

        Returns:
            Predicted probabilities
        """
        if self.calibrated_model is None:
            raise ValueError("Model not fitted. Call fit() first.")
        return self.calibrated_model.predict_proba(X)


class StackingEnsemble:
    """Stacking ensemble combining multiple base models with a meta-learner.

    Uses cross-validated predictions from base models as features for the meta-learner.
    """

    def __init__(
        self,
        base_models: list[tuple[str, Any]],
        meta_model: Optional[Any] = None,
        cv: int = 5,
        use_probas: bool = True,
    ):
        """Initialize stacking ensemble.

        Args:
            base_models: List of (name, model) tuples
            meta_model: Meta-learner (default: LogisticRegression)
            cv: Number of cross-validation folds for stacking
            use_probas: Use probability predictions (True) or class predictions (False)
        """
        self.base_models = base_models
        self.meta_model = meta_model or LogisticRegression(max_iter=1000, C=0.5)
        self.cv = cv
        self.use_probas = use_probas
        self.fitted_base_models: list[tuple[str, Any]] = []

    def fit(self, X: np.ndarray, y: np.ndarray) -> "StackingEnsemble":
        """Fit the stacking ensemble.

        Args:
            X: Training features
            y: Training labels

        Returns:
            Fitted ensemble
        """
        logger.info(f"Training stacking ensemble with {len(self.base_models)} base models")

        # Generate cross-validated predictions for meta features
        meta_features = []

        for name, model in self.base_models:
            logger.info(f"  Generating CV predictions for {name}")

            if self.use_probas:
                # Get probability predictions
                try:
                    proba = cross_val_predict(model, X, y, cv=self.cv, method="predict_proba")
                    # Use only positive class probability for binary classification
                    if proba.shape[1] == 2:
                        meta_features.append(proba[:, 1])
                    else:
                        meta_features.append(proba)
                except AttributeError:
                    # Model doesn't have predict_proba, use decision_function or predict
                    try:
                        decision = cross_val_predict(
                            model, X, y, cv=self.cv, method="decision_function"
                        )
                        meta_features.append(decision)
                    except AttributeError:
                        preds = cross_val_predict(model, X, y, cv=self.cv)
                        meta_features.append(preds)
            else:
                preds = cross_val_predict(model, X, y, cv=self.cv)
                meta_features.append(preds)

        # Stack meta features
        meta_X = np.column_stack(meta_features)
        logger.info(f"  Meta features shape: {meta_X.shape}")

        # Fit meta model
        logger.info("  Fitting meta model")
        self.meta_model.fit(meta_X, y)

        # Fit base models on full training data
        self.fitted_base_models = []
        for name, model in self.base_models:
            logger.info(f"  Fitting base model {name} on full data")
            model.fit(X, y)
            self.fitted_base_models.append((name, model))

        logger.info("Stacking ensemble training complete")
        return self

    def predict(self, X: np.ndarray) -> np.ndarray:
        """Predict class labels.

        Args:
            X: Features

        Returns:
            Predicted class labels
        """
        meta_X = self._get_meta_features(X)
        return self.meta_model.predict(meta_X)

    def predict_proba(self, X: np.ndarray) -> np.ndarray:
        """Predict class probabilities.

        Args:
            X: Features

        Returns:
            Predicted probabilities
        """
        meta_X = self._get_meta_features(X)
        return self.meta_model.predict_proba(meta_X)

    def _get_meta_features(self, X: np.ndarray) -> np.ndarray:
        """Generate meta features from base model predictions.

        Args:
            X: Features

        Returns:
            Meta feature array
        """
        if not self.fitted_base_models:
            raise ValueError("Ensemble not fitted. Call fit() first.")

        meta_features = []
        for _name, model in self.fitted_base_models:
            if self.use_probas:
                try:
                    proba = model.predict_proba(X)
                    if proba.shape[1] == 2:
                        meta_features.append(proba[:, 1])
                    else:
                        meta_features.append(proba)
                except AttributeError:
                    try:
                        decision = model.decision_function(X)
                        meta_features.append(decision)
                    except AttributeError:
                        preds = model.predict(X)
                        meta_features.append(preds)
            else:
                preds = model.predict(X)
                meta_features.append(preds)

        return np.column_stack(meta_features)


class BlendingEnsemble:
    """Simple blending ensemble with optimized weights.

    Combines probability predictions from multiple models using weighted average.
    """

    def __init__(
        self,
        models: list[tuple[str, Any]],
        weights: Optional[list[float]] = None,
    ):
        """Initialize blending ensemble.

        Args:
            models: List of (name, model) tuples
            weights: Optional weights for each model (default: equal weights)
        """
        self.models = models
        self.weights = weights or [1.0 / len(models)] * len(models)
        self.fitted_models: list[tuple[str, Any]] = []

        if len(self.weights) != len(self.models):
            raise ValueError("Number of weights must match number of models")

        # Normalize weights
        total = sum(self.weights)
        self.weights = [w / total for w in self.weights]

    def fit(self, X: np.ndarray, y: np.ndarray) -> "BlendingEnsemble":
        """Fit all models.

        Args:
            X: Training features
            y: Training labels

        Returns:
            Fitted ensemble
        """
        logger.info(f"Training blending ensemble with {len(self.models)} models")
        self.fitted_models = []

        for name, model in self.models:
            logger.info(f"  Fitting {name}")
            model.fit(X, y)
            self.fitted_models.append((name, model))

        return self

    def predict(self, X: np.ndarray) -> np.ndarray:
        """Predict class labels.

        Args:
            X: Features

        Returns:
            Predicted class labels
        """
        proba = self.predict_proba(X)
        return (proba[:, 1] > 0.5).astype(int)

    def predict_proba(self, X: np.ndarray) -> np.ndarray:
        """Predict blended probabilities.

        Args:
            X: Features

        Returns:
            Blended probability predictions
        """
        if not self.fitted_models:
            raise ValueError("Ensemble not fitted. Call fit() first.")

        # Collect all probabilities
        all_probas = []
        for (_name, model), weight in zip(self.fitted_models, self.weights):
            proba = model.predict_proba(X)
            all_probas.append(proba * weight)

        # Weighted average
        blended = np.sum(all_probas, axis=0)
        return blended


def create_optimized_ensemble(task: str = "win", seed: int = 42) -> StackingEnsemble:
    """Create an optimized stacking ensemble for F1 predictions.

    Uses the best performing models: LR, XGB, CatBoost, RF

    Args:
        task: Prediction task ('win' or 'podium')
        seed: Random seed

    Returns:
        Configured stacking ensemble
    """
    from f1.models.train import create_model

    base_models = [
        ("lr", create_model("lr", task, seed, optimized=True)),
        ("xgb", create_model("xgb", task, seed, optimized=True)),
        ("cat", create_model("cat", task, seed, optimized=True)),
        ("rf", create_model("rf", task, seed, optimized=True)),
    ]

    meta_model = LogisticRegression(
        max_iter=1000,
        C=0.5,
        class_weight="balanced",
        random_state=seed,
    )

    return StackingEnsemble(base_models, meta_model, cv=5, use_probas=True)


def create_calibrated_model(
    model_name: str, task: str = "win", seed: int = 42
) -> CalibratedModel:
    """Create a calibrated version of a model.

    Args:
        model_name: Base model name ('xgb', 'lgbm', 'cat', 'lr', 'rf')
        task: Prediction task
        seed: Random seed

    Returns:
        Calibrated model wrapper
    """
    from f1.models.train import create_model

    base_model = create_model(model_name, task, seed, optimized=True)
    return CalibratedModel(base_model, method="isotonic", cv=5)
