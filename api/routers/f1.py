"""F1 prediction API endpoints."""

import json
import logging
from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException, Query

from api.core.config import Settings
from api.deps import DataCache, get_config, get_data_cache
from f1.analysis.counterfactuals import compute_counterfactual
from f1.models.registry import predict_race
from f1.schemas import CounterfactualRequest, CounterfactualResponse, PredictionResponse

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/f1", tags=["f1"])


@router.get("/races")
async def get_available_races(
    data_cache: DataCache = Depends(get_data_cache), config: Settings = Depends(get_config)
):
    """Get list of available races with metadata.

    Returns:
        List of race information dicts with race_id, season, round, etc.

    Example:
        GET /api/f1/races
    """
    try:
        # Load features
        features_path = Path(config.data_dir) / "features" / "features.parquet"
        features = data_cache.get_features(features_path)

        # Get unique races with metadata
        races = (
            features.groupby("race_id")
            .agg({"season": "first", "round": "first", "race_date": "first"})
            .reset_index()
        )

        # Convert to list of dicts
        race_list = []
        for _, row in races.iterrows():
            race_list.append(
                {
                    "race_id": row["race_id"],
                    "season": int(row["season"]),
                    "round": int(row["round"]),
                    "date": int(row["race_date"]) if "race_date" in row else None,
                }
            )

        # Sort by season and round
        race_list.sort(key=lambda x: (x["season"], x["round"]))

        logger.info(f"Found {len(race_list)} available races")
        return {"races": race_list, "count": len(race_list)}

    except Exception as e:
        logger.error(f"Failed to load races: {e}")
        raise HTTPException(status_code=500, detail=str(e)) from e


@router.get("/reports/backtest")
async def get_backtest_report(config: Settings = Depends(get_config)):
    """Get backtest report if available.

    Returns:
        Backtest results JSON

    Example:
        GET /api/f1/reports/backtest
    """
    try:
        # Look for backtest.json in reports directory
        report_path = Path(config.reports_dir) / "backtest.json"

        if not report_path.exists():
            raise HTTPException(
                status_code=404, detail="Backtest report not found. Run: python scripts/backtest.py"
            )

        # Read and return the JSON
        with open(report_path) as f:
            report_data = json.load(f)

        logger.info(f"Serving backtest report from {report_path}")
        return report_data

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to load backtest report: {e}")
        raise HTTPException(status_code=500, detail=str(e)) from e


@router.get("/predict/race/{race_id}", response_model=PredictionResponse)
async def predict_race_endpoint(
    race_id: str,
    model: str = Query("xgb", description="Model name to use for prediction"),
    data_cache: DataCache = Depends(get_data_cache),
    config: Settings = Depends(get_config),
):
    """Generate race predictions for all drivers.

    Args:
        race_id: Race identifier (e.g., '2024_Monaco' or '2024_01')
        model: Model name (xgb, lgbm, cat, lr, rf, quali_freq, elo, nbt_tlf)

    Returns:
        PredictionResponse with win/podium probabilities and expected finish

    Example:
        GET /api/f1/predict/race/2024_01?model=xgb
    """
    try:
        # Load features
        features_path = Path(config.data_dir) / "features" / "features.parquet"
        features = data_cache.get_features(features_path)

        # Generate predictions
        logger.info(f"Generating predictions for {race_id} using {model}")
        response = predict_race(
            race_id=race_id, model_name=model, race_data=features, model_dir=Path(config.model_dir)
        )

        return response

    except ValueError as e:
        # Race not found or invalid  model - return 400 with helpful message
        error_msg = str(e)
        if "not found in data" in error_msg.lower():
            # Provide list of available races
            try:
                available_races = features["race_id"].unique().tolist()[:10]
                detail = f"Race '{race_id}' not found. Available races include: {', '.join(available_races)}"
            except Exception:
                detail = f"Race '{race_id}' not found in data."
        else:
            detail = error_msg

        logger.warning(f"Bad request for race prediction: {detail}")
        raise HTTPException(status_code=400, detail=detail) from e
    except FileNotFoundError as e:
        logger.error(f"Model or data file not found: {e}")
        raise HTTPException(status_code=404, detail=f"Model or data not found: {e}") from e
    except Exception as e:
        logger.error(f"Prediction failed: {e}")
        raise HTTPException(status_code=500, detail=str(e)) from e


@router.get("/explain/race/{race_id}")
async def explain_prediction_endpoint(
    race_id: str,
    driver_id: str = Query(..., description="Driver ID (e.g., 'VER')"),
    model: str = Query("xgb", description="Model name"),
    top_k: int = Query(10, description="Number of top features to return"),
    data_cache: DataCache = Depends(get_data_cache),
    config: Settings = Depends(get_config),
):
    """Explain prediction for a specific driver.

    Args:
        race_id: Race identifier
        driver_id: Driver to explain (e.g., 'VER', 'HAM')
        model: Model name
        top_k: Number of top features to show

    Returns:
        ExplainResponse with feature impacts

    Example:
        GET /api/f1/explain/race/2024_01?driver_id=VER&model=xgb
    """
    try:
        # Load features
        features_path = Path(config.data_dir) / "features" / "features.parquet"
        features = data_cache.get_features(features_path)

        # Import explain function
        from f1.analysis.explain import explain_prediction

        # Generate explanation
        logger.info(f"Generating explanation for {driver_id} in {race_id} using {model}")
        response = explain_prediction(
            race_id=race_id,
            driver_id=driver_id,
            model_name=model,
            race_data=features,
            model_dir=config.model_dir,
            top_k=top_k,
        )

        return response

    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e)) from e
    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=f"Model or data not found: {e}") from e
    except Exception as e:
        logger.error(f"Explanation failed: {e}")
        raise HTTPException(status_code=500, detail=str(e)) from e


@router.post("/counterfactual", response_model=CounterfactualResponse)
async def counterfactual_endpoint(
    request: CounterfactualRequest,
    model: str = Query("xgb", description="Model name"),
    data_cache: DataCache = Depends(get_data_cache),
    config: Settings = Depends(get_config),
):
    """Compute counterfactual prediction with modified features.

    Args:
        request: CounterfactualRequest with race_id, driver_id, and changes
        model: Model name

    Returns:
        CounterfactualResponse with baseline, counterfactual, and delta

    Example:
        POST /api/f1/counterfactual?model=xgb
        Body: {
            "race_id": "2024_01",
            "driver_id": "HAM",
            "changes": {"qualifying_position_delta": -2}
        }
    """
    try:
        # Load features
        features_path = Path(config.data_dir) / "features" / "features.parquet"
        features = data_cache.get_features(features_path)

        # Compute counterfactual
        logger.info(f"Computing counterfactual for {request.driver_id} in {request.race_id}")
        response = compute_counterfactual(
            request=request, race_data=features, model_name=model, model_dir=config.model_dir
        )

        return response

    except ValueError as e:
        # Invalid request - return 400 with helpful message
        error_msg = str(e)
        logger.warning(f"Bad request for counterfactual: {error_msg}")
        raise HTTPException(status_code=400, detail=error_msg) from e
    except FileNotFoundError as e:
        logger.error(f"Model or data file not found: {e}")
        raise HTTPException(status_code=404, detail=f"Model or data not found: {e}") from e
    except Exception as e:
        logger.error(f"Counterfactual failed: {e}")
        raise HTTPException(status_code=500, detail=str(e)) from e
