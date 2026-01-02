"""API contract tests - verify response schemas.

These tests ensure that API endpoints return the expected data structures.
Contract tests are fast and strict - they fail if the API shape changes.
"""

import pytest
from fastapi.testclient import TestClient

from api.main import app

client = TestClient(app)


class TestMetaEndpoints:
    """Test /meta endpoints return correct structures."""

    def test_meta_seasons_contract(self):
        """Verify /meta/seasons returns correct structure."""
        response = client.get("/meta/seasons")
        assert response.status_code == 200

        data = response.json()
        assert "seasons" in data, "Response must contain 'seasons' field"
        assert "latest" in data, "Response must contain 'latest' field"

        assert isinstance(data["seasons"], list), "seasons must be a list"
        assert isinstance(data["latest"], int), "latest must be an integer"

        # Seasons should be sorted descending
        if len(data["seasons"]) > 1:
            assert data["seasons"] == sorted(data["seasons"], reverse=True), \
                "Seasons should be sorted descending (latest first)"

        # Latest should be the first season
        if data["seasons"]:
            assert data["latest"] == data["seasons"][0], \
                "latest should be the first (highest) season"

    def test_meta_races_contract(self):
        """Verify /meta/races returns correct structure."""
        response = client.get("/meta/races?season=2024")
        assert response.status_code == 200

        data = response.json()
        assert "races" in data, "Response must contain 'races' field"
        assert isinstance(data["races"], list), "races must be a list"

        # Verify each race has required fields
        for race in data["races"]:
            assert "race_id" in race, "Each race must have race_id"
            assert "name" in race, "Each race must have name"
            assert "season" in race, "Each race must have season"
            assert "round" in race, "Each race must have round"
            assert "date" in race, "Each race must have date"

            assert isinstance(race["race_id"], str), "race_id must be string"
            assert isinstance(race["name"], str), "name must be string"
            assert isinstance(race["season"], int), "season must be integer"
            assert isinstance(race["round"], int), "round must be integer"

    def test_meta_races_no_season_param(self):
        """Verify /meta/races works without season parameter."""
        response = client.get("/meta/races")
        assert response.status_code == 200

        data = response.json()
        assert "races" in data

    def test_meta_models_contract(self):
        """Verify /meta/models returns correct structure."""
        response = client.get("/meta/models")
        assert response.status_code == 200

        data = response.json()
        assert "models" in data, "Response must contain 'models' field"
        assert isinstance(data["models"], list), "models must be a list"
        assert len(data["models"]) > 0, "Should have at least one model"

        # Verify each model has required fields
        for model in data["models"]:
            assert "model_id" in model, "Each model must have model_id"
            assert "display_name" in model, "Each model must have display_name"
            assert "type" in model, "Each model must have type"
            assert "metrics" in model, "Each model must have metrics"

            assert isinstance(model["model_id"], str), "model_id must be string"
            assert isinstance(model["display_name"], str), "display_name must be string"
            assert isinstance(model["metrics"], dict), "metrics must be dict"

            # Verify metrics structure
            metrics = model["metrics"]
            assert "overall" in metrics, "metrics must have overall"
            assert isinstance(metrics["overall"], dict), "overall must be dict"

            overall = metrics["overall"]
            assert "accuracy" in overall, "overall must have accuracy"
            assert isinstance(overall["accuracy"], (int, float)), "accuracy must be numeric"


class TestCounterfactualContract:
    """Test counterfactual endpoint response structure."""

    @pytest.mark.skip(reason="Requires features data to be available")
    def test_counterfactual_response_delta_structure(self):
        """Verify counterfactual response has correct delta structure.

        Delta should be a dict with win_prob, podium_prob, expected_finish keys.
        """
        # This test requires actual data and a working model
        # Skipping for now, but structure is defined
        request_body = {
            "race_id": "2024_01",
            "driver_id": "VER",
            "changes": {"qualifying_position_delta": -2}
        }

        response = client.post("/api/f1/counterfactual?model=xgb", json=request_body)

        if response.status_code == 200:
            data = response.json()

            # Verify structure
            assert "delta" in data, "Response must have delta"
            assert isinstance(data["delta"], dict), "delta must be a dict"

            # Delta must have these numeric fields
            assert "win_prob" in data["delta"], "delta must have win_prob"
            assert "podium_prob" in data["delta"], "delta must have podium_prob"
            assert "expected_finish" in data["delta"], "delta must have expected_finish"

            assert isinstance(data["delta"]["win_prob"], (int, float)), \
                "delta.win_prob must be numeric"
            assert isinstance(data["delta"]["podium_prob"], (int, float)), \
                "delta.podium_prob must be numeric"
            assert isinstance(data["delta"]["expected_finish"], (int, float)), \
                "delta.expected_finish must be numeric"


class TestBacktestContract:
    """Test backtest report endpoint."""

    def test_backtest_endpoint_exists(self):
        """Verify /api/f1/reports/backtest endpoint exists."""
        response = client.get("/api/f1/reports/backtest")

        # Should return either 200 (report exists) or 404 (not generated yet)
        assert response.status_code in [200, 404], \
            "Endpoint should exist (200 or 404)"

        if response.status_code == 200:
            data = response.json()
            # Verify basic structure if report exists
            assert isinstance(data, dict), "Response should be a dict"
            # Expected keys: run_timestamp, config, results
            assert "run_timestamp" in data or "results" in data, \
                "Response should have run_timestamp or results"


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
