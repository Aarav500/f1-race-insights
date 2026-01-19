# Test Fixtures

This directory contains minimal test fixtures for fast integration testing.

## Contents

- `data/features.parquet`: Minimal feature dataset (5 races, 8 drivers)
- `models/quali_freq.joblib`: Pre-trained qualifying frequency baseline model

## Dataset Details

**Races**: 5 races from 2024 season (2024_01 through 2024_05)
**Drivers**: 8 drivers (VER, HAM, LEC, SAI, PER, RUS, NOR, ALO)
**Total samples**: 40 (5 races × 8 drivers)

## Regenerating Fixtures

```bash
python -m tests.fixtures.generate_fixtures
```

## Usage in Tests

```python
import pytest
from pathlib import Path

@pytest.fixture
def fixture_dir():
    return Path(__file__).parent / "fixtures"

def test_example(fixture_dir):
    features = pd.read_parquet(fixture_dir / "data" / "features.parquet")
    # Use in tests...
```
