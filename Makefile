.PHONY: help dev test lint format typecheck smoke ingest train backtest clean install
.PHONY: docker-up docker-down docker-logs docker-test docker-backtest docker-clean

# Default target
help:
	@echo "F1 Race Insights - Available targets:"
	@echo ""
	@echo "Local Development:"
	@echo "  make install    - Install dependencies"
	@echo "  make dev        - Run development server"
	@echo "  make test       - Run all tests"
	@echo "  make lint       - Run linting (ruff)"
	@echo "  make format     - Format code (black + isort)"
	@echo "  make typecheck  - Run type checking (mypy)"
	@echo "  make smoke      - Run smoke tests"
	@echo "  make ingest     - Ingest F1 data"
	@echo "  make train      - Train models"
	@echo "  make backtest   - Run backtesting"
	@echo "  make clean      - Clean temporary files"
	@echo ""
	@echo "Docker Compose:"
	@echo "  make docker-up        - Start services (API + DB)"
	@echo "  make docker-down      - Stop services"
	@echo "  make docker-logs      - View logs"
	@echo "  make docker-test      - Run tests in container"
	@echo "  make docker-backtest  - Run backtest in container"
	@echo "  make docker-clean     - Stop and remove volumes"

# Install dependencies
install:
	pip install --upgrade pip
	pip install -r requirements.txt

# Run development server
dev:
	uvicorn api.main:app --reload --host 0.0.0.0 --port 8000

# Run all tests with coverage
test:
	pytest tests/ -v --cov=f1 --cov=api --cov-report=term-missing --cov-report=html

# Run linting
lint:
	ruff check .

# Format code
format:
	black .
	isort .
	@echo "Code formatted successfully"

# Run type checking
typecheck:
	mypy f1/ api/ --ignore-missing-imports

# Run smoke tests (quick validation)
smoke:
	pytest tests/ -v -m smoke --no-cov

# Ingest F1 data
ingest:
	python -m scripts.ingest_data

# Train models
train:
	python -m scripts.train_models

# Run backtesting
backtest:
	python -m scripts.run_backtest

# Clean temporary files
clean:
	find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
	find . -type f -name "*.pyc" -delete 2>/dev/null || true
	find . -type f -name "*.pyo" -delete 2>/dev/null || true
	find . -type d -name ".pytest_cache" -exec rm -rf {} + 2>/dev/null || true
	find . -type d -name ".mypy_cache" -exec rm -rf {} + 2>/dev/null || true
	find . -type d -name ".ruff_cache" -exec rm -rf {} + 2>/dev/null || true
	find . -type d -name "htmlcov" -exec rm -rf {} + 2>/dev/null || true
	find . -type f -name ".coverage" -delete 2>/dev/null || true
	@echo "Cleaned temporary files"

# Docker Compose targets
docker-up:
	@echo "Starting services with Docker Compose..."
	docker-compose up --build -d
	@echo "Services started!"
	@echo "API: http://localhost:8000"
	@echo "Docs: http://localhost:8000/docs"

docker-down:
	@echo "Stopping services..."
	docker-compose down
	@echo "Services stopped"

docker-logs:
	docker-compose logs -f

docker-test:
	@echo "Running tests in container..."
	docker-compose exec api pytest tests/ -v
	@echo "Tests complete"

docker-backtest:
	@echo "Running backtest in container..."
	docker-compose exec api python scripts/backtest.py --models all --task win
	@echo "Backtest complete. Check reports/ directory"

docker-clean:
	@echo "Stopping services and removing volumes..."
	docker-compose down -v
	@echo "Cleaned up Docker resources"
