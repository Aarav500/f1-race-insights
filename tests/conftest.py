"""Pytest configuration and shared fixtures."""

import pytest


@pytest.fixture(scope="session", autouse=True)
def generate_test_fixtures():
    """Generate test fixtures before running tests.

    This runs automatically before the test session starts and ensures
    features.parquet and model files exist without committing binary files.
    """
    from pathlib import Path

    # Get fixtures directory
    fixtures_dir = Path(__file__).parent / "fixtures"
    data_dir = fixtures_dir / "data"
    models_dir = fixtures_dir / "models"

    # Check if fixtures already exist
    features_path = data_dir / "features.parquet"
    model_path = models_dir / "quali_freq.joblib"

    # Generate fixtures if they don't exist
    if not features_path.exists() or not model_path.exists():
        print("\n🔧 Generating test fixtures...")

        # Import and run fixture generation
        from tests.fixtures.generate_fixtures import main

        main()

        print("✅ Test fixtures generated successfully\n")
    else:
        print("\n✅ Test fixtures already exist\n")
