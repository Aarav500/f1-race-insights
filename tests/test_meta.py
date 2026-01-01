"""Tests for meta endpoints."""

from fastapi.testclient import TestClient

from api.main import app

client = TestClient(app)


def test_get_models():
    """Test /meta/models endpoint returns proper schema and ordering."""
    response = client.get("/meta/models")
    assert response.status_code == 200

    data = response.json()
    assert "models" in data
    assert isinstance(data["models"], list)
    assert len(data["models"]) > 0

    # Verify first model has all required fields
    model = data["models"][0]
    assert "model_id" in model
    assert "display_name" in model
    assert "type" in model
    assert "interpretable" in model
    assert "speed" in model
    assert "metrics" in model

    # Verify metrics structure
    metrics = model["metrics"]
    assert "overall" in metrics
    assert "accuracy" in metrics["overall"]

    # Verify ordering by accuracy (best first)
    accuracies = [m["metrics"]["overall"]["accuracy"] for m in data["models"]]
    assert accuracies == sorted(accuracies, reverse=True), "Models should be sorted by accuracy desc"


def test_get_models_display_names():
    """Test that display names match expected UI labels."""
    response = client.get("/meta/models")
    data = response.json()

    display_names = [m["display_name"] for m in data["models"]]

    expected_names = {
        "XGBoost",
        "LightGBM",
        "CatBoost",
        "NBT-TLF",
        "Random Forest",
        "Logistic Regression",
        "Qualifying Frequency",
        "Elo Rating",
    }

    assert set(display_names) == expected_names, f"Got names: {display_names}"


def test_get_races_default():
    """Test /meta/races endpoint with default params."""
    response = client.get("/meta/races")
    assert response.status_code == 200

    data = response.json()
    assert "races" in data
    assert isinstance(data["races"], list)

    if len(data["races"]) > 0:
        race = data["races"][0]
        assert "race_id" in race
        assert "name" in race
        assert "date" in race
        assert "season" in race
        assert "round" in race


def test_get_races_by_season():
    """Test /meta/races with season filter."""
    response = client.get("/meta/races?season=2024")
    assert response.status_code == 200

    data = response.json()
    races = data["races"]

    # All races should be for 2024
    for race in races:
        assert race["season"] == 2024


def test_get_races_with_limit():
    """Test /meta/races with limit param."""
    response = client.get("/meta/races?season=2024&limit=5")
    assert response.status_code == 200

    data = response.json()
    assert len(data["races"]) <= 5


def test_race_names_not_ids():
    """Test that race names are human-readable, not IDs."""
    response = client.get("/meta/races?season=2024")
    data = response.json()

    if len(data["races"]) > 0:
        race = data["races"][0]
        # Name should contain "Grand Prix"
        assert "Grand Prix" in race["name"], f"Got name: {race['name']}"
        # race_id should be like "2024_01"
        assert race["race_id"].startswith("2024_")
