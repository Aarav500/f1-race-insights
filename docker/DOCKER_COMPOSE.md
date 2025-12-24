# Docker Compose Usage Guide

## Quick Start

**Start all services (API + Database)**:
```bash
cp .env.example .env  # Create your .env file
docker-compose up --build
```

**Start without database**:
```bash
# Comment out the depends_on and db sections in docker-compose.yml
docker-compose up api
```

## Services

### API Service
- **Port**: 8000
- **Health**: http://localhost:8000/health
- **Docs**: http://localhost:8000/docs
- **Development**: Repo mounted for live reload

### Database (PostgreSQL)
- **Port**: 5432
- **User/Password**: Set in .env file
- **Persistence**: Named volume `f1-postgres-data`

## Named Volumes

**FastF1 Cache** (`fastf1-cache`):
- Persists downloaded F1 data across restarts
- Avoids re-downloading on container restart

**Data Cache** (`data-cache`):
- Persists feature computations

**PostgreSQL Data** (`postgres-data`):
- Persists database data

## Environment Variables

Copy `.env.example` to `.env` and customize:

```bash
cp .env.example .env
```

**Key variables**:
- `POSTGRES_USER`: Database user
- `POSTGRES_PASSWORD`: Database password
- `POSTGRES_DB`: Database name
- `LOG_LEVEL`: API log level (debug/info/warning)

## Development Mode

The API service mounts the entire repository as a volume for development:

```yaml
volumes:
  - .:/app  # Live reload
```

**To disable** (production), comment this out and use:
```yaml
volumes:
  - ./models:/app/models:ro
```

## Commands

**Start services**:
```bash
docker-compose up
```

**Build and start**:
```bash
docker-compose up --build
```

**Start in background**:
```bash
docker-compose up -d
```

**View logs**:
```bash
docker-compose logs -f api
docker-compose logs -f db
```

**Stop services**:
```bash
docker-compose down
```

**Remove volumes** (clean slate):
```bash
docker-compose down -v
```

## Database Access

**Connect via psql**:
```bash
docker exec -it f1-race-insights-db psql -U f1user -d f1db
```

**From host**:
```bash
psql -h localhost -p 5432 -U f1user -d f1db
```

## Troubleshooting

**API won't start**:
- Check logs: `docker-compose logs api`
- Verify .env file exists
- Ensure port 8000 not in use

**Database connection fails**:
- Check db health: `docker-compose ps`
- Verify credentials in .env match
- Wait for db to be ready (healthcheck)

**Cache not persisting**:
- Check volumes: `docker volume ls`
- Ensure volumes mounted correctly
