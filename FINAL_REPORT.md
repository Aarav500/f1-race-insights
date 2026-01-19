# F1 Race Insights - Final System Report

**Report Generated**: December 23, 2025  
**Project Repository**: https://github.com/Aarav500/f1-race-insights

---

## Table of Contents

1. [System Overview](#system-overview)
2. [System Components](#system-components)
3. [Local Development Setup](#local-development-setup)
4. [Verification & Testing](#verification--testing)
5. [Artifact Outputs](#artifact-outputs)
6. [EC2 Deployment](#ec2-deployment)
7. [Metrics & Results](#metrics--results)

---

## System Overview

F1 Race Insights is a production-ready machine learning system for Formula 1 race outcome prediction. The system implements rigorous data engineering practices, multiple modeling approaches (from baselines to custom neural architectures), comprehensive evaluation frameworks, and interpretability tools.

### Key Capabilities

- **Data Ingestion**: Automated collection from FastF1 API (2020-2025 seasons)
- **Feature Engineering**: Temporal rolling features with strict no-leakage guarantees
- **Model Zoo**: 8 model types including custom NBT-TLF neural ranking model
- **Evaluation**: Walk-forward backtesting, calibration analysis, comprehensive metrics
- **Interpretability**: SHAP values, permutation importance, ablation studies
- **Counterfactual Analysis**: What-if prediction scenarios for driver performance
- **REST API**: FastAPI-based prediction and analysis endpoints
- **Web UI**: Next.js TypeScript application with interactive visualizations
- **Production Deployment**: Docker containerization, CI/CD pipeline, EC2 deployment scripts

---

## System Components

### 1. Data Ingestion (FastF1)

**Implementation**: `scripts/ingest.py`, `f1/data/loader.py`

- Downloads race schedules, results, and qualifying data from FastF1 API
- Covers seasons 2020-2025
- Stores raw data in Parquet format (`data/raw/`)
- Implements FastF1 caching to avoid repeated API calls (`data/fastf1_cache/`)
- Handles API rate limiting and error recovery

**Usage**:
```bash
python -m scripts.ingest
```

### 2. Feature Engineering

**Implementation**: `f1/data/features.py`

**Features Generated**:
- Qualifying position and deltas
- Rolling driver form (last 3, 5, 10 races)
- Rolling constructor form
- DNF rates (driver and constructor)
- Track-specific features
- Temporal features (season, round)
- Head-to-head statistics

**Temporal Guarantees**:
- Strict walk-forward validation
- No data leakage: features computed only from past races
- Features saved to `data/processed/features.parquet`

### 3. Model Zoo (8 Models)

**Baselines** (`f1/models/baselines.py`):
1. **Qualifying Frequency** - Historical qualifying position frequencies
2. **Elo Ratings** - Dynamic skill ratings updated after each race

**Tree-Based Models** (`f1/models/train.py`):
3. **XGBoost** - Gradient boosted decision trees
4. **LightGBM** - Fast gradient boosting with histogram-based splits
5. **CatBoost** - Gradient boosting with categorical feature support

**Linear/Ensemble Models**:
6. **Logistic Regression** - Linear model for win probability
7. **Random Forest** - Ensemble of decision trees

**Neural Ranking Model** (`f1/models/nbt_tlf.py`):
8. **NBT-TLF** (Neural Bradley-Terry with Temporal Latent Factors)
   - Custom PyTorch implementation
   - Pairwise ranking approach
   - Driver and constructor embeddings
   - Temporal latent factors
   - Qualifying position features
   - Trained on pairwise comparisons

**Model Registry** (`f1/models/registry.py`):
- Centralized model registration and loading
- Standardized prediction interface
- Model metadata and versioning

### 4. Backtesting & Evaluation

**Implementation**: `scripts/backtest.py`, `f1/evaluation/backtest.py`

**Walk-Forward Validation**:
- Respects temporal ordering
- Training set: all races before test race
- Minimum training races: 20 (configurable)
- Evaluates on each race in validation set

**Metrics** (`f1/evaluation/metrics.py`):
- **AUC-ROC**: Area under ROC curve
- **Brier Score**: Mean squared error of probabilities
- **Log Loss**: Negative log-likelihood
- **Accuracy**: Correct predictions
- **Top-3 Accuracy**: Predicted top-3 finishers

**Calibration Analysis** (`f1/evaluation/calibration.py`):
- Expected Calibration Error (ECE)
- Reliability diagrams
- Calibration curves

**Output**: `reports/backtest.json`, `reports/backtest.md`

### 5. Explainability

**Implementation**: `f1/analysis/explain.py`

**Methods**:
1. **SHAP Values** - Shapley additive explanations for tree models
   - TreeExplainer for XGBoost/LightGBM/CatBoost
   - Feature importance rankings
   - Per-prediction explanations

2. **Permutation Importance** - Model-agnostic feature importance
   - Measures impact of shuffling each feature
   - Provides global importance rankings

3. **Ablation Analysis** - For NBT-TLF neural model
   - Remove embedding components to measure impact
   - Tests driver embeddings, constructor embeddings, temporal factors

**API Endpoint**: `GET /api/f1/explain/race/{race_id}`

### 6. Counterfactual Analysis

**Implementation**: `f1/analysis/counterfactuals.py`

**Capabilities**:
- What-if scenarios for driver predictions
- Modify qualifying position, form, constructor
- Generate alternative predictions
- Compare baseline vs counterfactual probabilities

**Example**: "What if Hamilton qualified 2 positions higher?"

**API Endpoint**: `POST /api/f1/counterfactual`

### 7. REST API (FastAPI)

**Implementation**: `api/main.py`, `api/routers/`

**Endpoints**:
- `GET /health` - Health check
- `GET /api/f1/predict/race/{race_id}` - Race predictions
- `GET /api/f1/explain/race/{race_id}` - Prediction explanations
- `POST /api/f1/counterfactual` - Counterfactual analysis
- `GET /api/f1/available-races` - List available races
- `GET /api/f1/available-models` - List available models

**Features**:
- Automatic API documentation (OpenAPI/Swagger)
- Request validation with Pydantic
- Error handling and logging
- Model caching for performance
- CORS support for web UI

**Configuration**: `api/core/config.py` using Pydantic settings

### 8. Web UI (Next.js)

**Implementation**: `web/src/`

**Pages**:
- **Overview** (`/`) - System introduction and quick links
- **Race Predictions** (`/predictions`) - Interactive race outcome predictions
- **Explanations** (`/explanations`) - Feature importance visualizations
- **Counterfactuals** (`/counterfactuals`) - What-if scenario analysis

**Technology Stack**:
- Next.js 14 (App Router)
- TypeScript
- TailwindCSS
- React hooks for state management
- API integration with FastAPI backend

**Features**:
- Real-time predictions with model selection
- Interactive charts and visualizations
- Responsive design
- Error handling and loading states

---

## Local Development Setup

### Prerequisites

- **Python**: 3.10 or higher
- **Node.js**: 18+ (for web UI)
- **RAM**: 4GB+ recommended
- **Disk**: 10GB+ for FastF1 cache and models
- **Docker**: Optional, for containerized deployment

### Option 1: Virtual Environment (Recommended for Development)

#### 1. Clone Repository

```bash
git clone https://github.com/Aarav500/f1-race-insights.git
cd f1-race-insights
```

#### 2. Create Virtual Environment

**Windows**:
```bash
python -m venv .venv
.venv\Scripts\activate
```

**Linux/Mac**:
```bash
python -m venv .venv
source .venv/bin/activate
```

#### 3. Install Python Dependencies

```bash
pip install --upgrade pip
pip install -r requirements.txt
```

#### 4. Configure Environment

```bash
# Copy example environment file
cp .env.example .env

# Edit .env with your settings (optional for local dev)
# DATA_DIR, MODEL_DIR, CACHE_DIR are pre-configured
```

#### 5. Ingest Data

```bash
# Download F1 data from FastF1 API
python -m scripts.ingest

# This creates:
# - data/raw/*.parquet (race data)
# - data/fastf1_cache/ (FastF1 cache)
```

#### 6. Generate Features

```bash
# Create feature dataset
python -m f1.data.features

# Output: data/processed/features.parquet
```

#### 7. Train Models

```bash
# Train a single model (e.g., XGBoost)
python -m f1.models.train --model xgb --task win

# Saved to: models/xgb_win.pkl

# Train all models
for model in quali_freq elo xgb lgbm cat lr rf; do
    python -m f1.models.train --model $model --task win
done

# Train NBT-TLF (requires pairwise data)
python -m f1.models.pairwise  # Generate pairwise dataset
python -m f1.models.nbt_tlf --data data/pairwise/train.parquet
```

#### 8. Start API Server

```bash
# Development server with auto-reload
uvicorn api.main:app --reload --host 0.0.0.0 --port 8000

# API available at: http://localhost:8000
# API docs: http://localhost:8000/docs
```

#### 9. Start Web UI (Optional)

```bash
cd web

# Install dependencies
npm install

# Start development server
npm run dev

# Web UI available at: http://localhost:3000
```

### Option 2: Docker Compose (Production-like Environment)

#### 1. Clone Repository

```bash
git clone https://github.com/Aarav500/f1-race-insights.git
cd f1-race-insights
```

#### 2. Configure Environment

```bash
cp .env.example .env
# Edit .env if needed (defaults work for local Docker)
```

#### 3. Build and Start Services

```bash
# Start all services (API, Web UI, PostgreSQL)
docker-compose up --build -d

# Services:
# - API: http://localhost:8000
# - Web UI: http://localhost:3000
# - PostgreSQL: localhost:5432
```

#### 4. Check Service Health

```bash
# View logs
docker-compose logs -f

# Check container status
docker-compose ps

# API health check
curl http://localhost:8000/health
```

#### 5. Run Commands in Containers

```bash
# Ingest data
docker-compose exec api python -m scripts.ingest

# Run backtest
docker-compose exec api python scripts/backtest.py --models all --task win

# Access API container shell
docker-compose exec api bash
```

#### 6. Stop Services

```bash
# Stop services
docker-compose down

# Stop and remove volumes (removes data)
docker-compose down -v
```

### Makefile Targets

The project includes a comprehensive Makefile for common tasks:

```bash
# Local development targets
make install      # Install dependencies
make dev          # Run development server
make test         # Run tests with coverage
make lint         # Run linting (ruff)
make format       # Format code (black + isort)
make smoke        # Run smoke tests
make backtest     # Run backtesting
make clean        # Clean temporary files

# Docker Compose targets
make docker-up        # Start all services
make docker-down      # Stop services
make docker-logs      # View logs
make docker-test      # Run tests in container
make docker-backtest  # Run backtest in container
make docker-clean     # Stop and remove volumes
```

---

## Verification & Testing

### 1. Unit Tests

**Location**: `tests/`

**Test Coverage**:
- `test_baselines.py` - Baseline model tests
- `test_features.py` - Feature engineering tests
- `test_pairwise.py` - Pairwise data generation tests
- `test_calibration.py` - Calibration metric tests
- `test_counterfactuals.py` - Counterfactual analysis tests
- `test_registry.py` - Model registry tests
- `test_smoke.py` - Quick smoke tests

**Run Tests**:
```bash
# All tests with coverage
pytest tests/ -v --cov=f1 --cov=api --cov-report=term-missing

# Smoke tests only (quick validation)
pytest tests/ -v -m smoke

# Specific test file
pytest tests/test_baselines.py -v

# In Docker
docker-compose exec api pytest tests/ -v
```

**Expected Results**: All tests should pass with >80% code coverage.

### 2. Backtesting Validation

**Purpose**: Compare all models using walk-forward validation

**Run Backtest**:
```bash
# Local
python scripts/backtest.py --models all --task win

# Docker
docker-compose exec api python scripts/backtest.py --models all --task win

# Specific models
python scripts/backtest.py --models xgb,lgbm,cat --task win
```

**Output Files**:
- `reports/backtest.json` - Detailed per-race results
- `reports/backtest.md` - Summary comparison table

**Validation Checks**:
- All models complete without errors
- Metrics are within expected ranges (AUC: 0.5-1.0, Brier: 0.0-1.0)
- No NaN or infinite values
- Temporal ordering is preserved (test races always after training)

### 3. API Verification

**Start API**:
```bash
# Local
uvicorn api.main:app --reload --port 8000

# Docker
docker-compose up api -d
```

**Test Endpoints**:
```bash
# Health check
curl -s http://localhost:8000/health
# Expected: {"status":"ok"}

# List available races
curl -s http://localhost:8000/api/f1/available-races | jq

# List available models
curl -s http://localhost:8000/api/f1/available-models | jq

# Get race predictions (example race)
curl -s "http://localhost:8000/api/f1/predict/race/2024_01?model=xgb" | jq

# Get explanations for a driver
curl -s "http://localhost:8000/api/f1/explain/race/2024_01?driver_id=VER&model=xgb" | jq

# Counterfactual analysis
curl -X POST "http://localhost:8000/api/f1/counterfactual?model=xgb" \
  -H "Content-Type: application/json" \
  -d '{
    "race_id": "2024_01",
    "driver_id": "HAM",
    "changes": {"qualifying_position_delta": -2}
  }' | jq
```

**Expected**: All endpoints return valid JSON responses without errors.

### 4. Web UI Verification

**Start Services**:
```bash
# Start API and Web UI
docker-compose up api web -d

# Or locally
uvicorn api.main:app --reload --port 8000 &
cd web && npm run dev
```

**Manual Testing Checklist**:
- [ ] Navigate to http://localhost:3000
- [ ] Overview page loads without errors
- [ ] Navigate to Predictions page
- [ ] Select a race and model from dropdowns
- [ ] Verify predictions are displayed
- [ ] Navigate to Explanations page
- [ ] Select race, driver, and model
- [ ] Verify feature importance is shown
- [ ] Navigate to Counterfactuals page
- [ ] Configure a scenario and generate predictions
- [ ] Verify baseline vs counterfactual comparison

**Browser Console**: Should have no JavaScript errors.

---

## Artifact Outputs

The system generates various artifacts during data ingestion, training, and evaluation:

### 1. Data Artifacts

**Location**: `data/`

```
data/
├── raw/                          # Raw data from FastF1
│   ├── schedule_YYYY.parquet    # Race schedules by season
│   ├── results_YYYY.parquet     # Race results by season
│   └── qualifying_YYYY.parquet  # Qualifying results by season
│
├── processed/                    # Processed features
│   ├── features.parquet         # Feature dataset for training
│   └── pairwise/                # Pairwise comparisons for NBT-TLF
│       ├── train.parquet
│       └── test.parquet
│
├── fastf1_cache/                # FastF1 API cache (gitignored)
│   └── *.pickle                 # Cached session data
│
└── cache/                       # Feature cache (gitignored)
    └── *.pkl                    # Cached processed data
```

### 2. Model Artifacts

**Location**: `models/`

```
models/
├── quali_freq_win.pkl           # Qualifying frequency baseline
├── elo_win.pkl                  # Elo rating baseline
├── xgb_win.pkl                  # XGBoost model
├── lgbm_win.pkl                 # LightGBM model
├── cat_win.pkl                  # CatBoost model
├── lr_win.pkl                   # Logistic Regression
├── rf_win.pkl                   # Random Forest
└── nbt_tlf_win.pt               # NBT-TLF PyTorch model
```

**Model Metadata** (stored in model files):
- Training date
- Hyperparameters
- Feature names
- Training data statistics
- Version information

### 3. Evaluation Reports

**Location**: `reports/`

```
reports/
├── backtest.json                # Detailed backtest results
│   ├── Per-race predictions
│   ├── Per-model metrics
│   └── Configuration metadata
│
├── backtest.md                  # Human-readable comparison table
│   └── Model rankings by metric
│
├── calibration/                 # Calibration analysis
│   ├── model_name_reliability.png
│   └── model_name_calibration.json
│
└── explanations/                # SHAP explanations
    ├── race_id_driver_id_shap.json
    └── race_id_driver_id_shap.png
```

### 4. Logs

**Location**: Application logs

```
# Docker container logs
docker-compose logs api > logs/api.log
docker-compose logs web > logs/web.log

# Systemd logs (EC2 deployment)
journalctl -u f1-api > logs/systemd_api.log
```

---

## EC2 Deployment

The system includes comprehensive deployment automation for AWS EC2.

### Prerequisites

- AWS Account with EC2 access
- GitHub repository with Actions enabled
- Domain name (optional, for HTTPS)
- SSH key pair for EC2 access

### Deployment Architecture

```
Internet → Nginx (reverse proxy + SSL)
             ↓
          Docker Compose
             ├── f1-api (FastAPI)
             ├── f1-web (Next.js)
             └── postgres (Database)
```

### Step 1: EC2 Instance Setup

**Launch Instance**:
- **OS**: Ubuntu 22.04 LTS or Amazon Linux 2023
- **Instance Type**: t3.small or larger (2 vCPU, 2GB RAM minimum)
- **Storage**: 20GB+ EBS volume
- **Security Group**:
  - SSH (22) - Your IP only
  - HTTP (80) - 0.0.0.0/0
  - HTTPS (443) - 0.0.0.0/0
  - Custom TCP (8000) - Optional for API access

**Connect to Instance**:
```bash
ssh -i your-key.pem ubuntu@<EC2-PUBLIC-IP>
```

### Step 2: Bootstrap Script

**Run the automated bootstrap script**:
```bash
# Download bootstrap script
wget https://raw.githubusercontent.com/Aarav500/f1-race-insights/main/deploy/ec2_bootstrap.sh

# Make executable
chmod +x ec2_bootstrap.sh

# Run as root
sudo bash ec2_bootstrap.sh
```

**What it installs**:
- Docker Engine
- Docker Compose plugin
- Git
- Nginx
- UFW firewall (Ubuntu/Debian)
- Utilities (htop, vim, curl, wget)
- Creates application directory: `/opt/f1-race-insights`
- Adds user to docker group

**Post-bootstrap**:
```bash
# Log out and back in for docker group to take effect
exit
ssh -i your-key.pem ubuntu@<EC2-PUBLIC-IP>

# Or use newgrp
newgrp docker
```

### Step 3: Manual Deployment

**Clone Repository**:
```bash
cd /opt/f1-race-insights
git clone https://github.com/Aarav500/f1-race-insights.git .
```

**Configure Environment**:
```bash
# Copy production environment template
cp deploy/env.prod.example .env.prod

# Edit with your settings
nano .env.prod
```

**Required Variables in `.env.prod`**:
```bash
ENV=prod
API_HOST=0.0.0.0
API_PORT=8000

# Database (local PostgreSQL)
POSTGRES_USER=f1user
POSTGRES_PASSWORD=<CHANGE-ME-STRONG-PASSWORD>
POSTGRES_DB=f1db
DATABASE_URL=postgresql://f1user:<PASSWORD>@db:5432/f1db

# AWS (optional, for S3 storage)
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=<YOUR-KEY>
AWS_SECRET_ACCESS_KEY=<YOUR-SECRET>
S3_BUCKET=<YOUR-BUCKET>

# Application
LOG_LEVEL=info
DATA_DIR=/app/data
MODEL_DIR=/app/models
```

**Start Services**:
```bash
# Use production docker-compose file
docker-compose -f deploy/docker-compose.prod.yml up -d

# Check status
docker-compose -f deploy/docker-compose.prod.yml ps

# View logs
docker-compose -f deploy/docker-compose.prod.yml logs -f
```

### Step 4: Configure Nginx (Reverse Proxy)

**Install Nginx**:
```bash
sudo apt update
sudo apt install nginx -y
```

**Configure Site**:
```bash
# Copy provided Nginx config
sudo cp deploy/nginx.conf /etc/nginx/sites-available/f1-api

# Create symlink
sudo ln -s /etc/nginx/sites-available/f1-api /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

**Configure SSL with Let's Encrypt** (if using domain):
```bash
sudo apt install certbot python3-certbot-nginx -y

# Get certificate (follow prompts)
sudo certbot --nginx -d yourdomain.com

# Auto-renewal cron job is created automatically
```

### Step 5: Systemd Service (Auto-Start on Boot)

**Install Service**:
```bash
# Copy service file
sudo cp deploy/f1.service /etc/systemd/system/

# Reload systemd
sudo systemctl daemon-reload

# Enable service
sudo systemctl enable f1.service

# Start service
sudo systemctl start f1.service

# Check status
sudo systemctl status f1.service
```

**Service Management**:
```bash
# Start
sudo systemctl start f1.service

# Stop
sudo systemctl stop f1.service

# Restart
sudo systemctl restart f1.service

# View logs
sudo journalctl -u f1.service -f
```

### Step 6: GitHub Actions CI/CD (Automated Deployment)

**GitHub Secrets Required** (see `deploy/GITHUB_SECRETS.md`):

Configure in GitHub → Settings → Secrets and variables → Actions:

```
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=<IAM-USER-KEY>
AWS_SECRET_ACCESS_KEY=<IAM-USER-SECRET>
EC2_HOST=<EC2-PUBLIC-IP>
EC2_USERNAME=ubuntu
EC2_SSH_PRIVATE_KEY=<PRIVATE-KEY-CONTENTS>
GHCR_PAT=<GITHUB-PERSONAL-ACCESS-TOKEN>
POSTGRES_PASSWORD=<SAME-AS-ENV-PROD>
DATABASE_URL=postgresql://f1user:<PASSWORD>@db:5432/f1db
S3_BUCKET=<YOUR-BUCKET-NAME>
```

**Workflow File**: `.github/workflows/docker-build.yml`

**What it does**:
1. Triggers on push to `main` branch
2. Builds Docker images for API and Web
3. Pushes images to GitHub Container Registry (GHCR)
4. SSH into EC2 instance
5. Pulls latest images
6. Restarts services with `docker-compose`

**Manual Trigger**:
```bash
# Push to main branch
git add .
git commit -m "Deploy update"
git push origin main

# GitHub Actions will automatically deploy
```

### Step 7: Verify Deployment

**Health Checks**:
```bash
# API health
curl https://yourdomain.com/health
# Expected: {"status":"ok"}

# API docs
curl https://yourdomain.com/docs
# Expected: HTML page

# Prediction endpoint
curl "https://yourdomain.com/api/f1/predict/race/2024_01?model=xgb"
# Expected: JSON predictions
```

**Check Logs**:
```bash
# Systemd service logs
sudo journalctl -u f1.service -n 100

# Docker container logs
docker-compose -f deploy/docker-compose.prod.yml logs api
docker-compose -f deploy/docker-compose.prod.yml logs web

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### Step 8: Restart Services After Updates

**Option 1: Systemd Service**:
```bash
# Pulls latest images and restarts
sudo systemctl reload f1.service
```

**Option 2: Manual**:
```bash
cd /opt/f1-race-insights

# Pull latest code
git pull origin main

# Pull latest Docker images (if using GHCR)
docker-compose -f deploy/docker-compose.prod.yml pull

# Restart services
docker-compose -f deploy/docker-compose.prod.yml down
docker-compose -f deploy/docker-compose.prod.yml up -d
```

**Option 3: GitHub Actions**:
```bash
# Simply push to main branch
git push origin main
# Automated deployment will handle the rest
```

### Troubleshooting

**API Container Won't Start**:
```bash
# Check logs
docker-compose -f deploy/docker-compose.prod.yml logs api

# Check environment variables
docker-compose -f deploy/docker-compose.prod.yml exec api env

# Restart container
docker-compose -f deploy/docker-compose.prod.yml restart api
```

**Database Connection Issues**:
```bash
# Check database container
docker-compose -f deploy/docker-compose.prod.yml ps db

# Test connection
docker-compose -f deploy/docker-compose.prod.yml exec db psql -U f1user -d f1db
```

**Nginx Errors**:
```bash
# Test configuration
sudo nginx -t

# Check error logs
sudo tail -f /var/log/nginx/error.log
```

**Disk Space Issues**:
```bash
# Check disk usage
df -h

# Clean up Docker
docker system prune -a --volumes

# Clean up old logs
sudo journalctl --vacuum-time=7d
```

---

## Metrics & Results

### Important Statement on Metrics

> **No Fabricated Metrics**
>
> This report does NOT contain fabricated or hypothetical metrics. All performance numbers must be generated by actually running the backtest script on real data. Metrics are only reported after executing:
>
> ```bash
> python scripts/backtest.py --models all --task win
> ```
>
> Results are saved to `reports/backtest.json` and `reports/backtest.md`.

### Where Metrics Are Generated

**Backtest Script**: `scripts/backtest.py`
- Runs walk-forward validation on all models
- Computes metrics per race and aggregates
- Saves detailed results to JSON
- Generates markdown comparison table

**Evaluation Module**: `f1/evaluation/`
- `metrics.py` - Metric computation functions
- `calibration.py` - Calibration analysis
- `backtest.py` - Walk-forward backtesting framework

**Calibration Analysis**: `f1/evaluation/calibration.py`
- Computes Expected Calibration Error (ECE)
- Generates reliability diagrams
- Assesses probability calibration quality

### How to Generate Metrics

**Step 1: Ensure Data and Models Exist**
```bash
# Ingest data (if not already done)
python -m scripts.ingest

# Generate features
python -m f1.data.features

# Train all models
python -m f1.models.train --model xgb --task win
python -m f1.models.train --model lgbm --task win
python -m f1.models.train --model cat --task win
# ... etc for all models
```

**Step 2: Run Backtest**
```bash
# Run backtest for all models
python scripts/backtest.py --models all --task win

# Or specific models
python scripts/backtest.py --models xgb,lgbm,cat --task win
```

**Step 3: View Results**
```bash
# View markdown summary
cat reports/backtest.md

# View detailed JSON results
cat reports/backtest.json | jq

# Or open in a text editor
```

### Sample Output Structure

The backtest generates metrics in the following format:

**`reports/backtest.json`**:
```json
{
  "config": {
    "models": ["xgb", "lgbm", "cat", ...],
    "task": "win",
    "min_train_races": 20,
    "test_races": 50
  },
  "results": {
    "xgb": {
      "auc": 0.XXX,
      "brier_score": 0.XXX,
      "log_loss": 0.XXX,
      "accuracy": 0.XXX,
      "ece": 0.XXX,
      "per_race_predictions": [...]
    },
    "lgbm": {...},
    ...
  },
  "timestamp": "2025-12-23T19:26:35Z"
}
```

**`reports/backtest.md`**:
```markdown
# Backtest Results

| Model | AUC | Brier Score | Log Loss | Accuracy | ECE |
|-------|-----|-------------|----------|----------|-----|
| XGBoost | 0.XXX | 0.XXX | 0.XXX | 0.XXX | 0.XXX |
| LightGBM | 0.XXX | 0.XXX | 0.XXX | 0.XXX | 0.XXX |
| CatBoost | 0.XXX | 0.XXX | 0.XXX | 0.XXX | 0.XXX |
...
```

### Metric Interpretation

- **AUC-ROC**: 0.5-1.0 (higher is better, 0.5 = random, 1.0 = perfect)
- **Brier Score**: 0.0-1.0 (lower is better, 0.0 = perfect)
- **Log Loss**: 0.0+ (lower is better)
- **Accuracy**: 0.0-1.0 (higher is better)
- **ECE**: 0.0-1.0 (lower is better, measures calibration)

### Expected Performance Ranges

Based on F1 race prediction literature:
- **Baseline Models**: AUC ~0.60-0.70
- **Tree Models**: AUC ~0.70-0.80
- **Neural Models**: AUC ~0.75-0.85

**Note**: Actual results depend on:
- Training data quantity (seasons available)
- Feature quality
- Hyperparameter tuning
- Race complexity and unpredictability

---

## Conclusion

F1 Race Insights is a comprehensive, production-ready machine learning system for Formula 1 race prediction. The system demonstrates:

✅ **Complete Data Pipeline**: Automated ingestion, feature engineering, temporal validation  
✅ **Model Diversity**: 8 models from baselines to custom neural architectures  
✅ **Rigorous Evaluation**: Walk-forward backtesting, calibration, comprehensive metrics  
✅ **Interpretability**: SHAP, permutation importance, ablation analysis  
✅ **Production Deployment**: Docker, CI/CD, EC2 automation, systemd integration  
✅ **User Interfaces**: REST API + Next.js web application  
✅ **Testing & Verification**: Unit tests, integration tests, end-to-end validation  

All code, documentation, and deployment automation is available in the repository. Metrics are generated transparently from backtest scripts, not fabricated.

For questions or issues, refer to:
- `README.md` - Quick start guide
- `docs/F1.md` - Technical specification
- `deploy/README_DEPLOY.md` - Deployment details
- `deploy/GITHUB_SECRETS.md` - CI/CD configuration
- GitHub Issues - Bug reports and feature requests

---

**End of Report**
