"""API smoke tests for F1 Race Insights.

Tests critical API endpoints that the frontend relies on.
These tests verify basic connectivity and response shapes.

NOTE: These are integration tests that require a running API server.
They will be skipped automatically if the API is not available.
Run with: docker-compose up -d && pytest tests/test_api_smoke.py -v
"""


import pytest
import requests

# Base URL for API (adjust if needed for local testing)
API_BASE_URL = "http://localhost:8000"


# Check if API is available
def _is_api_available() -> bool:
    """Check if the API server is running and accessible."""
    try:
        response = requests.get(f"{API_BASE_URL}/health", timeout=2)
        return response.status_code == 200
    except (requests.ConnectionError, requests.Timeout):
        return False


# Skip all tests in this module if API is not available
pytestmark = pytest.mark.skipif(
    not _is_api_available(),
    reason="API server not running on localhost:8000. Start with: docker-compose up -d"
)


def test_health_endpoint():
    """Test that health endpoint returns 200."""
    response = requests.get(f"{API_BASE_URL}/health")
    assert response.status_code == 200
    data = response.json()
    assert "status" in data


def test_models_endpoint():
    """Test that models endpoint returns models list."""
    response = requests.get(f"{API_BASE_URL}/api/f1/models")
    assert response.status_code == 200
    data = response.json()

    # Verify response shape
    assert "models" in data
    assert "count" in data
    assert isinstance(data["models"], list)
    assert data["count"] > 0

    # Verify each model has required fields
    for model in data["models"]:
        assert "id" in model
        assert "name" in model
        assert "type" in model
        assert "description" in model
        assert "supports_shap" in model
        assert "supports_counterfactual" in model


def test_predict_endpoint():
    """Test that prediction endpoint works for a valid race/model."""
    response = requests.get(
        f"{API_BASE_URL}/api/f1/predict/race/2024_01",
        params={"model": "xgb"}
    )

    # May return 404 if data not available, but should not 500
    assert response.status_code in [200, 404]

    if response.status_code == 200:
        data = response.json()
        assert "race_id" in data
        assert "model_name" in data
        assert "win_prob" in data
        assert "podium_prob" in data
        assert "expected_finish" in data


def test_counterfactual_endpoint():
    """Test that counterfactual endpoint accepts POST requests."""
    payload = {
        "race_id": "2024_01",
        "driver_id": "VER",
        "changes": {"qualifying_position_delta": -1}
    }

    response = requests.post(
        f"{API_BASE_URL}/api/f1/counterfactual",
        json=payload,
        params={"model": "xgb"}
    )

    # May return 404 if data not available, but should not 500
    assert response.status_code in [200, 404, 422]  # 422 = validation error

    if response.status_code == 200:
        data = response.json()
        assert "baseline" in data
        assert "counterfactual" in data
        assert "delta" in data


def test_backtest_endpoint():
    """Test that backtest endpoint returns 404 or 200 with data."""
    response = requests.get(f"{API_BASE_URL}/api/f1/reports/backtest")

    # Should return 404 if not run yet, or 200 with data
    assert response.status_code in [200, 404]

    if response.status_code == 404:
        data = response.json()
        assert "detail" in data

    if response.status_code == 200:
        data = response.json()
        # Backtest report should be a non-empty dict
        assert isinstance(data, dict)


if __name__ == "__main__":
    # Allow running smoke tests directly
    pytest.main([__file__, "-v"])
