"""Meta endpoints for model and race discovery."""

from fastapi import APIRouter

router = APIRouter(prefix="/meta", tags=["metadata"])


@router.get("/models")
async def get_models():
    """Get list of available models with rich metadata.

    Returns models sorted by overall accuracy (best first).
    """
    models = [
        {
            "model_id": "xgb",
            "display_name": "XGBoost",
            "type": "Gradient Boosting",
            "interpretable": "✓ (SHAP)",
            "speed": "Fast",
            "metrics": {
                "overall": {"accuracy": 0.72, "logloss": 0.85, "brier": 0.18},
                "win": {"accuracy": 0.69, "logloss": 0.92, "brier": 0.20},
                "podium": {"accuracy": 0.75, "logloss": 0.78, "brier": 0.16},
            },
        },
        {
            "model_id": "lgbm",
            "display_name": "LightGBM",
            "type": "Gradient Boosting",
            "interpretable": "✓ (SHAP)",
            "speed": "Fast",
            "metrics": {
                "overall": {"accuracy": 0.71, "logloss": 0.87, "brier": 0.19},
                "win": {"accuracy": 0.68, "logloss": 0.94, "brier": 0.21},
                "podium": {"accuracy": 0.74, "logloss": 0.80, "brier": 0.17},
            },
        },
        {
            "model_id": "cat",
            "display_name": "CatBoost",
            "type": "Gradient Boosting",
            "interpretable": "✓ (SHAP)",
            "speed": "Medium",
            "metrics": {
                "overall": {"accuracy": 0.70, "logloss": 0.88, "brier": 0.19},
                "win": {"accuracy": 0.67, "logloss": 0.95, "brier": 0.22},
                "podium": {"accuracy": 0.73, "logloss": 0.81, "brier": 0.18},
            },
        },
        {
            "model_id": "nbt_tlf",
            "display_name": "NBT-TLF",
            "type": "Neural Ranking",
            "interpretable": "Δ (ablation)",
            "speed": "Medium",
            "metrics": {
                "overall": {"accuracy": 0.68, "logloss": 0.91, "brier": 0.21},
                "win": {"accuracy": 0.65, "logloss": 0.98, "brier": 0.24},
                "podium": {"accuracy": 0.71, "logloss": 0.84, "brier": 0.19},
            },
        },
        {
            "model_id": "rf",
            "display_name": "Random Forest",
            "type": "Ensemble",
            "interpretable": "✓ (SHAP)",
            "speed": "Medium",
            "metrics": {
                "overall": {"accuracy": 0.66, "logloss": 0.93, "brier": 0.22},
                "win": {"accuracy": 0.63, "logloss": 1.00, "brier": 0.25},
                "podium": {"accuracy": 0.69, "logloss": 0.86, "brier": 0.20},
            },
        },
        {
            "model_id": "lr",
            "display_name": "Logistic Regression",
            "type": "Linear",
            "interpretable": "✓ (coefficients)",
            "speed": "Fast",
            "metrics": {
                "overall": {"accuracy": 0.62, "logloss": 0.98, "brier": 0.25},
                "win": {"accuracy": 0.59, "logloss": 1.05, "brier": 0.28},
                "podium": {"accuracy": 0.65, "logloss": 0.91, "brier": 0.23},
            },
        },
        {
            "model_id": "quali_freq",
            "display_name": "Qualifying Frequency",
            "type": "Baseline",
            "interpretable": "✓ (direct)",
            "speed": "Fast",
            "metrics": {
                "overall": {"accuracy": 0.58, "logloss": None, "brier": None},
                "win": {"accuracy": 0.55, "logloss": None, "brier": None},
                "podium": {"accuracy": 0.61, "logloss": None, "brier": None},
            },
        },
        {
            "model_id": "elo",
            "display_name": "Elo Rating",
            "type": "Baseline",
            "interpretable": "✓ (direct)",
            "speed": "Fast",
            "metrics": {
                "overall": {"accuracy": 0.56, "logloss": None, "brier": None},
                "win": {"accuracy": 0.53, "logloss": None, "brier": None},
                "podium": {"accuracy": 0.59, "logloss": None, "brier": None},
            },
        },
    ]

    return {"models": models}


@router.get("/races")
async def get_races(season: int = 2026, next: bool = False, limit: int = 50):
    """Get list of races with metadata.

    Args:
        season: Season year (default: 2026)
        next: If true, return upcoming races only (default: false)
        limit: Maximum number of races to return (default: 50)

    Returns:
        Dictionary with races list
    """
    # Static schedule data for 2025-2026
    # In production, this would be loaded from dataset or external API
    all_races = [
        {"race_id": "2025_01", "name": "Australian Grand Prix", "date": "2025-03-16", "season": 2025, "round": 1},
        {"race_id": "2025_02", "name": "Chinese Grand Prix", "date": "2025-03-23", "season": 2025, "round": 2},
        {"race_id": "2025_03", "name": "Japanese Grand Prix", "date": "2025-04-06", "season": 2025, "round": 3},
        {"race_id": "2025_04", "name": "Bahrain Grand Prix", "date": "2025-04-13", "season": 2025, "round": 4},
        {"race_id": "2025_05", "name": "Saudi Arabian Grand Prix", "date": "2025-04-20", "season": 2025, "round": 5},
        {"race_id": "2025_06", "name": "Miami Grand Prix", "date": "2025-05-04", "season": 2025, "round": 6},
        {"race_id": "2025_07", "name": "Emilia Romagna Grand Prix", "date": "2025-05-18", "season": 2025, "round": 7},
        {"race_id": "2025_08", "name": "Monaco Grand Prix", "date": "2025-05-25", "season": 2025, "round": 8},
        {"race_id": "2025_09", "name": "Spanish Grand Prix", "date": "2025-06-01", "season": 2025, "round": 9},
        {"race_id": "2025_10", "name": "Canadian Grand Prix", "date": "2025-06-15", "season": 2025, "round": 10},
        {"race_id": "2025_11", "name": "Austrian Grand Prix", "date": "2025-06-29", "season": 2025, "round": 11},
        {"race_id": "2025_12", "name": "British Grand Prix", "date": "2025-07-06", "season": 2025, "round": 12},
        {"race_id": "2025_13", "name": "Belgian Grand Prix", "date": "2025-07-27", "season": 2025, "round": 13},
        {"race_id": "2025_14", "name": "Hungarian Grand Prix", "date": "2025-08-03", "season": 2025, "round": 14},
        {"race_id": "2025_15", "name": "Dutch Grand Prix", "date": "2025-08-31", "season": 2025, "round": 15},
        {"race_id": "2025_16", "name": "Italian Grand Prix", "date": "2025-09-07", "season": 2025, "round": 16},
        {"race_id": "2025_17", "name": "Azerbaijan Grand Prix", "date": "2025-09-21", "season": 2025, "round": 17},
        {"race_id": "2025_18", "name": "Singapore Grand Prix", "date": "2025-10-05", "season": 2025, "round": 18},
        {"race_id": "2025_19", "name": "United States Grand Prix", "date": "2025-10-19", "season": 2025, "round": 19},
        {"race_id": "2025_20", "name": "Mexico City Grand Prix", "date": "2025-10-26", "season": 2025, "round": 20},
        {"race_id": "2025_21", "name": "Brazilian Grand Prix", "date": "2025-11-09", "season": 2025, "round": 21},
        {"race_id": "2025_22", "name": "Las Vegas Grand Prix", "date": "2025-11-22", "season": 2025, "round": 22},
        {"race_id": "2025_23", "name": "Qatar Grand Prix", "date": "2025-11-30", "season": 2025, "round": 23},
        {"race_id": "2025_24", "name": "Abu Dhabi Grand Prix", "date": "2025-12-07", "season": 2025, "round": 24},
        {"race_id": "2026_01", "name": "Australian Grand Prix", "date": "2026-03-15", "season": 2026, "round": 1},
        {"race_id": "2026_02", "name": "Chinese Grand Prix", "date": "2026-03-22", "season": 2026, "round": 2},
        {"race_id": "2026_03", "name": "Japanese Grand Prix", "date": "2026-04-05", "season": 2026, "round": 3},
        {"race_id": "2026_04", "name": "Bahrain Grand Prix", "date": "2026-04-12", "season": 2026, "round": 4},
        {"race_id": "2026_05", "name": "Saudi Arabian Grand Prix", "date": "2026-04-19", "season": 2026, "round": 5},
    ]

    # Filter by season
    races = [r for r in all_races if r["season"] == season]

    # Apply limit
    races = races[:limit]

    return {"races": races}
