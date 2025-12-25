"""Dependency injection for FastAPI."""

import logging
from functools import lru_cache
from pathlib import Path
from typing import Any, Optional

import pandas as pd

from api.core.config import Settings, get_settings
from f1.models.registry import ModelRegistry

logger = logging.getLogger(__name__)


def get_config() -> Settings:
    """Get application configuration.

    Returns:
        Settings instance with environment-based configuration.
    """
    return get_settings()


class ModelCache:
    """Singleton cache for loaded models."""

    _instance = None
    _models: dict[str, Any] = {}

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance

    def get_model(self, model_name: str, model_dir: Path, task: str = "win"):
        """Load and cache model.

        Args:
            model_name: Name of model
            model_dir: Model directory
            task: Task type

        Returns:
            Loaded model info
        """
        cache_key = f"{model_name}_{task}"

        if cache_key not in self._models:
            logger.info(f"Loading model: {cache_key}")
            self._models[cache_key] = ModelRegistry.load_model(model_name, model_dir, task=task)

        return self._models[cache_key]


class DataCache:
    """Singleton cache for feature data."""

    _instance = None
    _features: Optional[pd.DataFrame] = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance

    def get_features(self, features_path: Path) -> pd.DataFrame:
        """Load and cache features.

        Args:
            features_path: Path to features parquet

        Returns:
            Features DataFrame
        """
        if self._features is None:
            logger.info(f"Loading features from {features_path}")
            self._features = pd.read_parquet(features_path)
            logger.info(f"Loaded {len(self._features)} samples")

        return self._features


@lru_cache
def get_model_cache() -> ModelCache:
    """Get singleton model cache."""
    return ModelCache()


@lru_cache
def get_data_cache() -> DataCache:
    """Get singleton data cache."""
    return DataCache()
