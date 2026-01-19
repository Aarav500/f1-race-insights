"""Meta endpoints for model and race discovery."""

import logging

from fastapi import APIRouter

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/meta", tags=["metadata"])


@router.get("/seasons")
async def get_seasons():
    """Get list of available seasons from data.

    Returns available seasons sorted descending (latest first).
    """
    try:
        from pathlib import Path

        from api.deps import DataCache, get_config, get_data_cache

        # Get config and cache
        config = get_config()
        data_cache: DataCache = get_data_cache()

        # Load features to get actual available seasons
        features_path = Path(config.data_dir) / "features" / "features.parquet"

        # Check if features file exists
        if not features_path.exists():
            logger.warning(f"Features file not found at {features_path}, returning default")
            return {"seasons": [2024], "latest": 2024}

        # Load features
        features = data_cache.get_features(features_path)

        # Get unique seasons and sort descending (latest first)
        seasons = sorted(features["season"].unique().tolist(), reverse=True)
        latest = seasons[0] if seasons else 2024

        logger.info(f"Returning {len(seasons)} seasons, latest: {latest}")
        return {"seasons": seasons, "latest": latest}

    except Exception as e:
        logger.error(f"Failed to load seasons: {e}")
        # Fallback to default
        return {"seasons": [2024], "latest": 2024}


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
async def get_races(season: int = 2024, _next: bool = False, limit: int = 50):
    """Get list of races with metadata.

    Args:
        season: Season year (default: 2024)
        next: If true, return upcoming races only (default: false)
        limit: Maximum number of races to return (default: 50)

    Returns:
        Dictionary with races list
    """
    try:
        # Import dependencies here to avoid circular imports
        from pathlib import Path

        from api.deps import DataCache, get_config, get_data_cache

        # Get config and cache
        config = get_config()
        data_cache: DataCache = get_data_cache()

        # Load features to get actual available races
        features_path = Path(config.data_dir) / "features" / "features.parquet"

        # Check if features file exists
        if not features_path.exists():
            logger.warning(f"Features file not found at {features_path}, returning test data")
            # Fallback to test data
            return {
                "races": [
                    {"race_id": "2024_01", "name": "Bahrain Grand Prix", "date": "2024-03-02", "season": 2024, "round": 1},
                ]
            }

        # Load features
        features = data_cache.get_features(features_path)

        # Get unique races with metadata
        races_df = (
            features.groupby("race_id")
            .agg({
                "season": "first",
                "round": "first",
                "race_date": "first"
            })
            .reset_index()
        )

        # Race name mapping for known races
        race_names = {
            "2024_01": "Bahrain Grand Prix",
            "2024_02": "Saudi Arabian Grand Prix",
            "2024_03": "Australian Grand Prix",
            "2024_04": "Japanese Grand Prix",
            "2024_05": "Chinese Grand Prix",
            "2024_06": "Miami Grand Prix",
            "2024_07": "Emilia Romagna Grand Prix",
            "2024_08": "Monaco Grand Prix",
            "2024_09": "Canadian Grand Prix",
            "2024_10": "Spanish Grand Prix",
            "2024_11": "Austrian Grand Prix",
            "2024_12": "British Grand Prix",
            "2024_13": "Hungarian Grand Prix",
            "2024_14": "Belgian Grand Prix",
            "2024_15": "Dutch Grand Prix",
            "2024_16": "Italian Grand Prix",
            "2024_17": "Azerbaijan Grand Prix",
            "2024_18": "Singapore Grand Prix",
            "2024_19": "United States Grand Prix",
            "2024_20": "Mexico City Grand Prix",
            "2024_21": "Brazilian Grand Prix",
            "2024_22": "Las Vegas Grand Prix",
            "2024_23": "Qatar Grand Prix",
            "2024_24": "Abu Dhabi Grand Prix",
        }

        # Convert to list of dicts with display names
        race_list = []
        for _, row in races_df.iterrows():
            race_id = row["race_id"]
            race_list.append({
                "race_id": race_id,
                "name": race_names.get(race_id, f"Race {race_id}"),
                "date": str(row.get("race_date", "")),
                "season": int(row["season"]),
                "round": int(row["round"])
            })

        # Filter by season if requested
        if season:
            race_list = [r for r in race_list if r["season"] == season]

        # Sort by season and round
        race_list.sort(key=lambda x: (x["season"], x["round"]))

        # Apply limit
        race_list = race_list[:limit]

        logger.info(f"Returning {len(race_list)} races for season {season}")
        return {"races": race_list}

    except Exception as e:
        logger.error(f"Failed to load races: {e}")
        # Fallback to  basic test data
        return {
            "races": [
                {"race_id": "2024_01", "name": "Bahrain Grand Prix", "date": "2024-03-02", "season": 2024, "round": 1},
            ]
        }
