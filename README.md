# F1 Race Insights

Predictive modeling and analysis system for Formula 1 race outcomes using historical data and machine learning.

## Overview

F1 Race Insights implements multiple modeling approaches from simple baselines to neural ranking models, with rigorous evaluation, interpretability tools, and counterfactual analysis for Formula 1 race predictions.

## Features

- **Data Ingestion**: Automated collection from FastF1 API (2020-2025)
- **Feature Engineering**: Temporal rolling features with strict no-leakage guarantees
- **8 Model Types**:
  - Baselines: Qualifying frequency, Elo ratings
  - Tree models: XGBoost, LightGBM, CatBoost
  - Linear: Logistic Regression, Random Forest  
  - Neural: NBT-TLF (Neural Bradley-Terry with Temporal Latent Factors)
- **Evaluation**: Walk-forward backtesting, calibration, metrics (AUC, Brier, ECE)
- **Interpretability**: SHAP, permutation importance, ablation analysis
- **Counterfactuals**: What-if analysis for driver scenarios
- **REST API**: FastAPI endpoints for predictions and analysis

## Quick Start

```bash
# Clone repository
git clone https://github.com/Aarav500/f1-race-insights
cd f1-race-insights

# Install dependencies
pip install -r requirements.txt

# Ingest data
python -m scripts.ingest

# Train a model
python -m f1.models.train --model xgb --task win

# Run backtest
python scripts/backtest.py --models xgb,lgbm

# Start API
uvicorn api.main:app --reload
```

## Installation

**Requirements**:
- Python 3.10+
- 4GB+ RAM
- 10GB+ disk space

```bash
# Create virtual environment
python -m venv .venv
.venv\Scripts\activate  # Windows
# source .venv/bin/activate  # Linux/Mac

# Install dependencies
pip install -r requirements.txt
```

## Data Ingestion

```bash
python -m scripts.ingest
```

Downloads race schedules, results, and qualifying data from FastF1 API. Saves to `data/raw/` as Parquet files.

See [docs/DATA.md](docs/DATA.md) for details.

## Feature Engineering

```bash
python -m f1.data.features
```

Creates temporal features with no data leakage:
- Qualifying position and deltas
- Rolling driver/constructor form
- DNF rates
- Track and temporal information

## Model Training

```bash
# Train XGBoost for win prediction
python -m f1.models.train --model xgb --task win

# Train NBT-TLF
python -m f1.models.nbt_tlf --data data/pairwise/train.parquet
```

**Supported models**: `quali_freq`, `elo`, `xgb`, `lgbm`, `cat`, `lr`, `rf`, `nbt_tlf`

## Backtesting

Compare all models with walk-forward validation:

```bash
python scripts/backtest.py --models all --task win
```

Generates:
- `reports/backtest.json` - Detailed results
- `reports/backtest.md` - Comparison table

## API Usage

Start server:
```bash
uvicorn api.main:app --reload --port 8000
```

### Endpoints

**Predict Race**:
```bash
curl "http://localhost:8000/api/f1/predict/race/2024_01?model=xgb"
```

**Explain Prediction**:
```bash
curl "http://localhost:8000/api/f1/explain/race/2024_01?driver_id=VER&model=xgb"
```

**Counterfactual Analysis**:
```bash
curl -X POST "http://localhost:8000/api/f1/counterfactual?model=xgb" \
  -H "Content-Type: application/json" \
  -d '{
    "race_id": "2024_01",
    "driver_id": "HAM",
    "changes": {"qualifying_position_delta": -2}
  }'
```

API docs: http://localhost:8000/docs

## Model Comparison

| Model | Type | Interpretable | Speed |
|-------|------|---------------|-------|
| Qualifying Freq | Baseline | ✓ | Fast |
| Elo | Baseline | ✓ | Fast |
| Logistic Regression | Linear | ✓ | Fast |
| Random Forest | Ensemble | △ | Medium |
| XGBoost | Gradient Boosting | △ (SHAP) | Medium |
| LightGBM | Gradient Boosting | △ (SHAP) | Medium |
| CatBoost | Gradient Boosting | △ (SHAP) | Medium |
| NBT-TLF | Neural Ranking | △ (ablation) | Slow |

## Project Structure

```
f1-race-insights/
├── api/                  # FastAPI application
│   ├── routers/         # Endpoints (health, f1)
│   └── core/            # Config, logging
├── f1/                  # Core library
│   ├── data/           # Data loading, features
│   ├── models/         # Model implementations
│   ├── evaluation/     # Metrics, calibration, backtest
│   └── analysis/       # Explanations, counterfactuals
├── scripts/            # CLI scripts
├── tests/              # Test suite  
├── docs/               # Documentation
└── data/               # Data storage (gitignored)
```

## Docker

```bash
# Build
docker build -f docker/Dockerfile.api -t f1-api .

# Run
docker run -p 8000:8000 \
  -v ./data:/app/data:ro \
  -v ./models:/app/models:ro \
  f1-api
```

See [docker/README.md](docker/README.md) for details.

## Deployment

### Quick Deploy (Production)

Deploy to a remote server with idempotent deployment script:

```bash
# Standard deployment (soft clean + redeploy)
sudo bash ops/deploy.sh --soft-clean

# Hard reset (WARNING: destroys all Docker data)
# Only use for stateless apps or with backups
sudo bash ops/deploy.sh --hard-reset

# With volume pruning (if disk space is low)
sudo bash ops/deploy.sh --soft-clean --prune-volumes
```

The deployment script:
- ✅ Checks disk space (requires ≥20GB free)
- ✅ Stops containers and prunes Docker images
- ✅ Updates code from GitHub (main branch)
- ✅ Pulls latest Docker images
- ✅ Starts services with docker-compose
- ✅ Runs health checks
- ✅ Logs everything to `/var/log/antigravity/deploy.log`

### Google Cloud (GCE) Auto-Deploy

For automated deployment on Google Compute Engine VMs:

```bash
# Create VM with startup script
gcloud compute instances create f1-insights \
  --zone=us-central1-a \
  --machine-type=e2-medium \
  --metadata-from-file startup-script=ops/gce-startup.sh

# Or add to existing VM
gcloud compute instances add-metadata f1-insights \
  --zone=us-central1-a \
  --metadata-from-file startup-script=ops/gce-startup.sh

# Using remote URL
gcloud compute instances create f1-insights \
  --metadata startup-script-url=https://raw.githubusercontent.com/Aarav500/f1-race-insights/main/ops/gce-startup.sh
```

The GCE startup script auto-installs Git + Docker and deploys on VM boot.

### Health Check

```bash
bash ops/healthcheck.sh
```

Validates that API (port 8000) and Web (port 3000) are healthy.


## Testing

```bash
# Run all tests
pytest tests/ -v

# Run smoke tests
pytest tests/test_smoke.py -v
```

## Documentation

- [docs/DATA.md](docs/DATA.md) - Data sources and structure
- [docs/F1.md](docs/F1.md) - Technical specification
- [docker/README.md](docker/README.md) - Docker usage

## License

MIT License - See LICENSE file for details.

## References

- FastF1: https://docs.fastf1.dev/
- Shapley Values: Lundberg & Lee (2017)
- Calibration: Guo et al. (2017)
