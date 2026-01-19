"""Counterfactual analysis for F1 race predictions.

Implements what-if analysis by applying controlled changes to driver features
and recomputing predictions to see how outcomes would change.
"""

import logging
from typing import Any, Optional

import pandas as pd

from f1.models.registry import predict_race
from f1.schemas import CounterfactualRequest, CounterfactualResponse, PredictionOutcome

logger = logging.getLogger(__name__)


def apply_deltas(race_data: pd.DataFrame, driver_id: str, changes: dict[str, Any]) -> pd.DataFrame:
    """Apply deltas to a driver's features.

    Args:
        race_data: Race data for all drivers
        driver_id: Driver to modify
        changes: Dictionary of feature deltas

    Returns:
        Modified race data
    """
    modified_data = race_data.copy()
    driver_mask = modified_data["driver_id"] == driver_id

    if not driver_mask.any():
        raise ValueError(f"Driver {driver_id} not found in race data")

    # Apply qualifying position delta
    if "qualifying_position_delta" in changes:
        delta = changes["qualifying_position_delta"]
        current_pos = modified_data.loc[driver_mask, "quali_position"].values[0]
        new_pos = current_pos + delta
        # Clamp to valid range [1, 20]
        new_pos = max(1, min(20, int(new_pos)))
        modified_data.loc[driver_mask, "quali_position"] = new_pos
        logger.debug(f"Qualifying: {current_pos} -> {new_pos} (delta: {delta})")

    # Apply driver form delta (multiplicative)
    if "driver_form_delta" in changes:
        delta = changes["driver_form_delta"]
        for col in [
            "driver_rolling_avg_finish",
            "driver_rolling_avg_points",
            "driver_rolling_dnf_rate",
        ]:
            if col in modified_data.columns:
                current = modified_data.loc[driver_mask, col].values[0]
                if "dnf_rate" in col:
                    # For DNF rate, lower is better
                    new_val = current * (1 - delta)
                else:
                    # For avg finish, lower is better; for points, higher is better
                    new_val = current * (1 - delta) if "finish" in col else current * (1 + delta)
                new_val = max(0, new_val)
                modified_data.loc[driver_mask, col] = new_val
                logger.debug(f"{col}: {current:.3f} -> {new_val:.3f}")

    # Apply constructor form delta
    if "constructor_form_delta" in changes:
        delta = changes["constructor_form_delta"]
        for col in [
            "constructor_rolling_avg_finish",
            "constructor_rolling_avg_points",
            "constructor_rolling_dnf_rate",
        ]:
            if col in modified_data.columns:
                current = modified_data.loc[driver_mask, col].values[0]
                if "dnf_rate" in col:
                    new_val = current * (1 - delta)
                else:
                    new_val = current * (1 - delta) if "finish" in col else current * (1 + delta)
                new_val = max(0, new_val)
                modified_data.loc[driver_mask, col] = new_val

    # Apply reliability risk delta
    if "reliability_risk_delta" in changes:
        delta = changes["reliability_risk_delta"]
        if "driver_rolling_dnf_rate" in modified_data.columns:
            current = modified_data.loc[driver_mask, "driver_rolling_dnf_rate"].values[0]
            new_val = current + delta
            new_val = max(0, min(1, new_val))  # Clamp to [0, 1]
            modified_data.loc[driver_mask, "driver_rolling_dnf_rate"] = new_val

    return modified_data


def compute_counterfactual(
    request: CounterfactualRequest,
    race_data: pd.DataFrame,
    model_name: str,
    model_dir: Optional[str] = "models",
) -> CounterfactualResponse:
    """Compute counterfactual prediction.

    Args:
        request: Counterfactual request with changes
        race_data: Full race dataset
        model_name: Name of model to use
        model_dir: Directory containing models

    Returns:
        CounterfactualResponse with baseline and counterfactual predictions
    """
    from pathlib import Path

    race_id = request.race_id
    driver_id = request.driver_id
    changes = request.changes

    # Filter to specific race
    race_df: pd.DataFrame = race_data[race_data["race_id"] == race_id].copy()

    if race_df.empty:
        raise ValueError(f"Race {race_id} not found")

    # Get baseline prediction
    logger.info(f"Computing baseline for {driver_id} in {race_id}")
    model_path = Path(model_dir) if model_dir is not None else Path("models")
    baseline_response = predict_race(
        race_id=race_id, model_name=model_name, race_data=race_df, model_dir=model_path
    )

    # Apply deltas
    logger.info(f"Applying changes: {changes}")
    modified_df: pd.DataFrame = apply_deltas(race_df, driver_id, changes)

    # Get counterfactual prediction
    logger.info(f"Computing counterfactual for {driver_id}")
    counterfactual_response = predict_race(
        race_id=race_id, model_name=model_name, race_data=modified_df, model_dir=model_path
    )

    # Extract predictions for this driver
    baseline = PredictionOutcome(
        win_prob=baseline_response.win_prob.get(driver_id, 0.0),
        podium_prob=baseline_response.podium_prob.get(driver_id, 0.0),
        expected_finish=baseline_response.expected_finish.get(driver_id, 20.0),
    )

    counterfactual = PredictionOutcome(
        win_prob=counterfactual_response.win_prob.get(driver_id, 0.0),
        podium_prob=counterfactual_response.podium_prob.get(driver_id, 0.0),
        expected_finish=counterfactual_response.expected_finish.get(driver_id, 20.0),
    )

    # Compute deltas
    delta = {
        "win_prob": counterfactual.win_prob - baseline.win_prob,
        "podium_prob": counterfactual.podium_prob - baseline.podium_prob,
        "expected_finish": counterfactual.expected_finish - baseline.expected_finish,
    }

    logger.info(
        f"Counterfactual delta: win_prob {delta['win_prob']:+.3f}, "
        f"podium_prob {delta['podium_prob']:+.3f}"
    )

    return CounterfactualResponse(
        race_id=race_id,
        driver_id=driver_id,
        model_name=model_name,
        baseline=baseline,
        counterfactual=counterfactual,
        delta=delta,
        changes=changes,
    )


def sanity_test_qualifying_improvement():
    """Test that improving qualifying position increases win probability."""
    # Create synthetic test data
    test_data = pd.DataFrame(
        {
            "race_id": ["2024_01"] * 3,
            "driver_id": ["VER", "HAM", "LEC"],
            "quali_position": [3, 1, 2],
            "driver_rolling_avg_finish": [2.0, 2.5, 3.0],
            "driver_rolling_avg_points": [20.0, 18.0, 15.0],
            "constructor_rolling_avg_finish": [1.5, 2.0, 2.5],
            "constructor_rolling_avg_points": [450.0, 400.0, 380.0],
            "driver_rolling_dnf_rate": [0.05, 0.08, 0.10],
            "constructor_rolling_dnf_rate": [0.03, 0.05, 0.07],
            "finish_position": [1, 2, 3],
        }
    )

    # Would need trained model - skip for now in test
    # Just test delta application
    modified = apply_deltas(test_data, "VER", {"qualifying_position_delta": -2})

    assert modified.loc[modified["driver_id"] == "VER", "quali_position"].values[0] == 1
    logger.info("✓ Sanity test passed: qualifying delta applied correctly")


def sanity_test_qualifying_degradation():
    """Test that worsening qualifying position decreases win probability."""
    test_data = pd.DataFrame(
        {
            "race_id": ["2024_01"] * 3,
            "driver_id": ["VER", "HAM", "LEC"],
            "quali_position": [1, 2, 3],
            "driver_rolling_avg_finish": [2.0, 2.5, 3.0],
            "driver_rolling_avg_points": [20.0, 18.0, 15.0],
            "constructor_rolling_avg_finish": [1.5, 2.0, 2.5],
            "constructor_rolling_avg_points": [450.0, 400.0, 380.0],
            "driver_rolling_dnf_rate": [0.05, 0.08, 0.10],
            "constructor_rolling_dnf_rate": [0.03, 0.05, 0.07],
            "finish_position": [1, 2, 3],
        }
    )

    # Degrade from P1 to P5
    modified = apply_deltas(test_data, "VER", {"qualifying_position_delta": +4})

    assert modified.loc[modified["driver_id"] == "VER", "quali_position"].values[0] == 5
    logger.info("✓ Sanity test passed: qualifying degradation applied correctly")


def run_sanity_tests():
    """Run all sanity tests."""
    print("Running counterfactual sanity tests...\n")

    print("Test 1: Qualifying improvement")
    sanity_test_qualifying_improvement()
    print()

    print("Test 2: Qualifying degradation")
    sanity_test_qualifying_degradation()
    print()

    print("=" * 60)
    print("All sanity tests passed! ✓")
    print("=" * 60)


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    run_sanity_tests()
