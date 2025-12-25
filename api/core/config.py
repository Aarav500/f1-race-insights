"""Application configuration management."""

from functools import lru_cache
from pathlib import Path
from typing import Optional

from pydantic import Field
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings loaded from environment variables.

    All settings have sensible defaults for local development.
    Override via environment variables or .env file.
    """

    # Environment
    env: str = Field(default="local", description="Environment: local/dev/prod")

    # API Configuration
    api_host: str = Field(default="0.0.0.0", description="API host")
    api_port: int = Field(default=8000, description="API port")
    api_reload: bool = Field(default=True, description="Enable auto-reload (dev only)")
    log_level: str = Field(default="info", description="Log level")

    # Data Storage Directories
    data_dir: str = Field(default="./data", description="Root data directory")
    cache_dir: str = Field(default="./data/cache", description="Cache directory for processed data")
    model_dir: str = Field(default="./models", description="Model artifacts directory")
    reports_dir: str = Field(default="./reports", description="Reports output directory")

    # FastF1 Configuration
    fastf1_cache_enabled: bool = Field(default=True, description="Enable FastF1 cache")
    fastf1_cache_dir: str = Field(
        default="./data/fastf1_cache", description="FastF1 cache directory"
    )

    # Database (Optional)
    database_url: Optional[str] = Field(
        default=None, description="Database connection URL (PostgreSQL, SQLite, etc.)"
    )

    # ML Configuration
    random_seed: int = Field(default=42, description="Random seed for reproducibility")
    n_jobs: int = Field(default=-1, description="Number of parallel jobs (-1 = all cores)")
    optuna_n_trials: int = Field(default=100, description="Optuna hyperparameter trials")

    # Model Training
    train_test_split: float = Field(default=0.2, description="Train/test split ratio")
    validation_split: float = Field(default=0.2, description="Validation split ratio")
    early_stopping_rounds: int = Field(default=50, description="Early stopping patience")

    # Feature Engineering
    enable_feature_selection: bool = Field(
        default=True, description="Enable automatic feature selection"
    )
    feature_importance_threshold: float = Field(
        default=0.01, description="Feature importance threshold for selection"
    )

    # Backtesting
    backtest_start_year: int = Field(default=2022, description="Backtest start year")
    backtest_end_year: int = Field(default=2024, description="Backtest end year")

    # Monitoring & Logging
    enable_metrics: bool = Field(default=True, description="Enable metrics collection")
    metrics_dir: str = Field(default="./metrics", description="Metrics output directory")

    class Config:
        """Pydantic configuration."""

        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = False
        extra = "ignore"  # Ignore extra env vars

    def ensure_directories(self) -> None:
        """Create necessary directories if they don't exist."""
        directories = [
            self.data_dir,
            self.cache_dir,
            self.model_dir,
            self.reports_dir,
            self.fastf1_cache_dir,
            self.metrics_dir,
        ]

        for directory in directories:
            Path(directory).mkdir(parents=True, exist_ok=True)

    @property
    def is_local(self) -> bool:
        """Check if running in local environment."""
        return self.env == "local"

    @property
    def is_dev(self) -> bool:
        """Check if running in dev environment."""
        return self.env == "dev"

    @property
    def is_prod(self) -> bool:
        """Check if running in production."""
        return self.env == "prod"


@lru_cache
def get_settings() -> Settings:
    """Get cached settings instance.

    Returns:
        Settings instance with configuration loaded from environment
    """
    settings = Settings()

    # Ensure directories exist (safe to call multiple times)
    settings.ensure_directories()

    return settings
