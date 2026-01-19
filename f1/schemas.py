"""Pydantic schemas for F1 race predictions and analysis."""

from datetime import datetime
from typing import Any

from pydantic import BaseModel, Field


class FeatureImpact(BaseModel):
    """Feature impact for model explanation."""

    name: str = Field(..., description="Feature name")
    value: float = Field(..., description="Feature value")
    impact: float = Field(..., description="Impact on prediction (SHAP value or similar)")


class PredictionResponse(BaseModel):
    """Response model for race predictions."""

    race_id: str = Field(..., description="Race identifier (e.g., '2024_Monaco')")
    model_name: str = Field(..., description="Name of the model used for prediction")
    win_prob: dict[str, float] = Field(
        ..., description="Win probability for each driver (driver -> probability)"
    )
    podium_prob: dict[str, float] = Field(
        ..., description="Podium probability for each driver (driver -> probability)"
    )
    expected_finish: dict[str, float] = Field(
        ..., description="Expected finishing position for each driver (driver -> position)"
    )
    generated_at: datetime = Field(
        default_factory=datetime.utcnow, description="Timestamp when prediction was generated"
    )

    class Config:
        """Pydantic configuration."""

        json_schema_extra = {
            "example": {
                "race_id": "2024_Monaco",
                "model_name": "XGBoost_v1",
                "win_prob": {"VER": 0.35, "HAM": 0.25, "LEC": 0.20},
                "podium_prob": {"VER": 0.75, "HAM": 0.65, "LEC": 0.60},
                "expected_finish": {"VER": 1.8, "HAM": 2.3, "LEC": 3.1},
                "generated_at": "2024-05-26T14:00:00Z",
            }
        }


class ExplainResponse(BaseModel):
    """Response model for prediction explanation."""

    race_id: str = Field(..., description="Race identifier")
    driver_id: str = Field(..., description="Driver identifier (e.g., 'VER', 'HAM')")
    model_name: str = Field(..., description="Name of the model used")
    top_features: list[FeatureImpact] = Field(
        ..., description="Top features influencing the prediction, ordered by absolute impact"
    )

    class Config:
        """Pydantic configuration."""

        json_schema_extra = {
            "example": {
                "race_id": "2024_Monaco",
                "driver_id": "VER",
                "model_name": "XGBoost_v1",
                "top_features": [
                    {"name": "qualifying_position", "value": 1.0, "impact": 0.32},
                    {"name": "avg_lap_time", "value": 72.5, "impact": -0.18},
                    {"name": "track_experience", "value": 8.0, "impact": 0.15},
                ],
            }
        }


class CounterfactualRequest(BaseModel):
    """Request model for counterfactual analysis."""

    race_id: str = Field(..., description="Race identifier")
    driver_id: str = Field(..., description="Driver identifier")
    changes: dict[str, Any] = Field(
        ..., description="Feature changes to apply (feature_name -> new_value)"
    )

    class Config:
        """Pydantic configuration."""

        json_schema_extra = {
            "example": {
                "race_id": "2024_Monaco",
                "driver_id": "HAM",
                "changes": {"qualifying_position": 1, "tire_strategy": "soft-medium-soft"},
            }
        }


class PredictionOutcome(BaseModel):
    """Prediction outcome for counterfactual comparison."""

    win_prob: float = Field(..., description="Win probability")
    podium_prob: float = Field(..., description="Podium probability")
    expected_finish: float = Field(..., description="Expected finishing position")


class CounterfactualResponse(BaseModel):
    """Response model for counterfactual analysis."""

    race_id: str = Field(..., description="Race identifier")
    driver_id: str = Field(..., description="Driver identifier")
    model_name: str = Field(default="", description="Model used for prediction")
    baseline: PredictionOutcome = Field(..., description="Original prediction")
    counterfactual: PredictionOutcome = Field(..., description="Prediction with changes applied")
    delta: dict[str, float] = Field(
        ...,
        description="Difference between counterfactual and baseline (positive = improvement)",
    )
    changes: dict[str, Any] = Field(default_factory=dict, description="Changes that were applied")

    class Config:
        """Pydantic configuration."""

        json_schema_extra = {
            "example": {
                "race_id": "2024_Monaco",
                "driver_id": "HAM",
                "baseline": {
                    "win_prob": 0.25,
                    "podium_prob": 0.65,
                    "expected_finish": 2.3,
                },
                "counterfactual": {
                    "win_prob": 0.42,
                    "podium_prob": 0.78,
                    "expected_finish": 1.6,
                },
                "delta": {
                    "win_prob": 0.17,
                    "podium_prob": 0.13,
                    "expected_finish": -0.7,
                },
            }
        }
