# Docker Usage Guide

## Quick Start with Docker

### Using Docker Compose (Recommended)

```bash
# Build and start the API
docker-compose up --build

# Or run in detached mode
docker-compose up -d

# View logs
docker-compose logs -f

# Stop the service
docker-compose down
```

The API will be available at http://localhost:8000

### Using Docker Directly

**Build the image:**
```bash
docker build -f docker/Dockerfile.api -t f1-api:latest .
```

**Run the container:**
```bash
# Basic run
docker run -p 8000:8000 f1-api:latest

# With data and models mounted (recommended)
docker run -p 8000:8000 \
  -v $(pwd)/data:/app/data:ro \
  -v $(pwd)/models:/app/models:ro \
  f1-api:latest

# With environment variables
docker run -p 8000:8000 \
  -e LOG_LEVEL=debug \
  -v $(pwd)/data:/app/data:ro \
  -v $(pwd)/models:/app/models:ro \
  f1-api:latest
```

## Docker Configuration

### Image Details
- **Base**: Python 3.11 slim
- **Size**: ~600MB (multi-stage build)
- **User**: Non-root (appuser)
- **Port**: 8000
- **Health check**: `/health` endpoint

### Volume Mounts

**Required volumes** (if using models/data):
- `/app/data` - Feature data and FastF1 cache
- `/app/models` - Trained model files

**Optional volumes**:
- `/app/reports` - Output reports (read-write)

### Environment Variables

- `API_HOST` - Host to bind (default: 0.0.0.0)
- `API_PORT` - Port to bind (default: 8000)
- `LOG_LEVEL` - Logging level (default: info)
- `DATA_DIR` - Data directory path (default: /app/data)
- `MODEL_DIR` - Models directory path (default: /app/models)
- `FASTF1_CACHE` - FastF1 cache directory (default: /app/data/fastf1_cache)

## Testing the Container

```bash
# Health check
curl http://localhost:8000/health

# API info
curl http://localhost:8000/

# Interactive docs
open http://localhost:8000/docs

# Example prediction (requires models mounted)
curl "http://localhost:8000/api/f1/predict/race/2024_01?model=xgb"
```

## Production Deployment

### Resource Limits

Set appropriate resource limits:

```bash
docker run -p 8000:8000 \
  --memory=2g \
  --cpus=2 \
  -v ./data:/app/data:ro \
  -v ./models:/app/models:ro \
  f1-api:latest
```

Or in docker-compose.yml:
```yaml
deploy:
  resources:
    limits:
      cpus: '2.0'
      memory: 2G
```

### Security Best Practices

1. ✅ **Non-root user**: Container runs as `appuser` (UID 1000)
2. ✅ **Read-only volumes**: Mount data/models as read-only (`:ro`)
3. ✅ **Minimal base image**: python:3.11-slim
4. ✅ **No cache**: Build doesn't cache sensitive data
5. 🔒 **Add reverse proxy**: Use nginx or Traefik with HTTPS
6. 🔒 **Add authentication**: Protect API endpoints
7. 🔒 **Network isolation**: Use Docker networks

### Monitoring

**Container logs:**
```bash
docker logs -f <container_id>

# Or with docker-compose
docker-compose logs -f api
```

**Container stats:**
```bash
docker stats <container_id>
```

**Health check status:**
```bash
docker inspect --format='{{json .State.Health}}' <container_id> | jq
```

## Troubleshooting

### Issue: Cannot connect to API

**Check container is running:**
```bash
docker ps
```

**Check logs:**
```bash
docker logs <container_id>
```

**Check port mapping:**
```bash
docker port <container_id>
```

### Issue: Models not found

**Solution:** Ensure models directory is mounted:
```bash
-v $(pwd)/models:/app/models:ro
```

### Issue: Permission errors

**Solution:** Ensure host directories have correct permissions:
```bash
chmod -R 755 data/ models/
```

### Issue: Build fails

**Common causes:**
- Missing requirements.txt
- Network issues downloading packages
- Insufficient disk space

**Solution:** Check build logs for specific error.
