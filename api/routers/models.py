"""Models metadata API endpoint."""

from fastapi import APIRouter

router = APIRouter(prefix="/api/f1", tags=["models"])


@router.get("/models")
async def get_available_models():
    """Get list of available models with metadata.

    Returns models sorted by approximate accuracy (best first) based on
    typical backtest performance for win probability prediction.

    Returns:
        Dictionary with models list and metadata

    Example:
        GET /api/f1/models
    """
    # Define models with metadata
    # Sorted by approximate AUC performance (best to worst)
    # Based on typical gradient boosting > linear > baselines for F1 data
    models = [
        {
            "id": "xgb",
            "name": "XGBoost",
            "type": "gradient_boosting",
            "description": "Extreme Gradient Boosting - typically best performance",
            "supports_shap": True,
            "supports_counterfactual": True,
        },
        {
            "id": "lgbm",
            "name": "LightGBM",
            "type": "gradient_boosting",
            "description": "Light Gradient Boosting Machine - fast and accurate",
            "supports_shap": True,
            "supports_counterfactual": True,
        },
        {
            "id": "cat",
            "name": "CatBoost",
            "type": "gradient_boosting",
            "description": "CatBoost - handles categorical features well",
            "supports_shap": True,
            "supports_counterfactual": True,
        },
        {
            "id": "nbt_tlf",
            "name": "NBT-TLF",
            "type": "neural_ranking",
            "description": "Neural Boosted Trees with Temporal Latent Factors",
            "supports_shap": False,
            "supports_counterfactual": True,
        },
        {
            "id": "rf",
            "name": "Random Forest",
            "type": "ensemble",
            "description": "Random Forest ensemble",
            "supports_shap": True,
            "supports_counterfactual": True,
        },
        {
            "id": "lr",
            "name": "Logistic Regression",
            "type": "linear",
            "description": "Logistic Regression - interpretable baseline",
            "supports_shap": False,
            "supports_counterfactual": True,
        },
        {
            "id": "elo",
            "name": "Elo Rating",
            "type": "baseline",
            "description": "Elo rating system baseline",
            "supports_shap": False,
            "supports_counterfactual": False,
        },
        {
            "id": "quali_freq",
            "name": "Qualifying Frequency",
            "type": "baseline",
            "description": "Historical qualifying position frequency baseline",
            "supports_shap": False,
            "supports_counterfactual": False,
        },
    ]

    return {"models": models, "count": len(models)}
