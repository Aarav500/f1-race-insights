# Nginx Reverse Proxy Configuration

This document explains the nginx reverse proxy setup for F1 Race Insights in Docker Compose.

## Overview

The nginx service acts as a reverse proxy, routing traffic to the appropriate backend services:

- **`/`** → Web service (Next.js frontend on port 3000)
- **`/api/`** → API service (FastAPI backend on port 8000)

## Configuration File

**Location**: `deploy/nginx-simple.conf`

This configuration includes:
- ✅ Gzip compression for better performance
- ✅ Security headers (X-Frame-Options, X-Content-Type-Options, X-XSS-Protection)
- ✅ Proper proxy headers for both services
- ✅ Static asset caching
- ✅ Health check endpoint routing

## Routing Details

### Frontend Routes (`/`)
All requests to the root and non-API paths are proxied to the Next.js web service:
```
http://localhost/ → http://web:3000/
http://localhost/about → http://web:3000/about
```

### API Routes (`/api/`)
API requests have the `/api` prefix stripped before being proxied:
```
http://localhost/api/health → http://api:8000/health
http://localhost/api/predict → http://api:8000/predict
```

### Health Check
Direct access to the API health endpoint without `/api` prefix:
```
http://localhost/health → http://api:8000/health
```

## Security Headers

The following security headers are automatically added:

| Header | Value | Purpose |
|--------|-------|---------|
| `X-Frame-Options` | SAMEORIGIN | Prevents clickjacking |
| `X-Content-Type-Options` | nosniff | Prevents MIME type sniffing |
| `X-XSS-Protection` | 1; mode=block | Enables XSS filtering |
| `Referrer-Policy` | strict-origin-when-cross-origin | Controls referrer information |

## Gzip Compression

Gzip is enabled for the following content types:
- `text/plain`, `text/css`, `text/xml`, `text/javascript`
- `application/json`, `application/javascript`
- `application/xml+rss`, `application/rss+xml`
- `font/truetype`, `font/opentype`
- `image/svg+xml`

Compression level: 6 (good balance between speed and size)
Minimum file size: 256 bytes

## Testing the Configuration

### Test nginx configuration syntax
```bash
docker compose -f deploy/docker-compose.prod.yml exec nginx nginx -t
```

### Test routing
```bash
# Test frontend
curl http://localhost/

# Test API
curl http://localhost/api/health

# Test health check
curl http://localhost/health
```

### View nginx logs
```bash
# Access logs
docker compose -f deploy/docker-compose.prod.yml logs nginx | grep access

# Error logs
docker compose -f deploy/docker-compose.prod.yml logs nginx | grep error
```

## Performance Optimization

The configuration includes several performance optimizations:

1. **Keepalive connections**: 32 connections per upstream
2. **Gzip compression**: Reduces bandwidth usage
3. **Static asset caching**: 1 year expiry for static files
4. **TCP optimizations**: `tcp_nopush` and `tcp_nodelay` enabled
5. **Worker connections**: 1024 concurrent connections

## SSL/TLS (Optional)

For production deployments with SSL:

1. Add SSL certificates to `deploy/nginx/ssl/`
2. Update the nginx configuration to listen on port 443
3. Add SSL certificate configuration:
   ```nginx
   listen 443 ssl http2;
   ssl_certificate /etc/nginx/ssl/fullchain.pem;
   ssl_certificate_key /etc/nginx/ssl/privkey.pem;
   ```
4. Uncomment SSL volume in docker-compose.prod.yml

Alternatively, use a load balancer (ALB, CloudFlare) for SSL termination.

## Troubleshooting

### Nginx won't start

```bash
# Check configuration syntax
docker compose -f deploy/docker-compose.prod.yml exec nginx nginx -t

# View nginx logs
docker compose -f deploy/docker-compose.prod.yml logs nginx
```

### 502 Bad Gateway

This usually means the backend service (api or web) is not responding:

```bash
# Check if services are running
docker compose -f deploy/docker-compose.prod.yml ps

# Check backend health
docker compose -f deploy/docker-compose.prod.yml exec api curl http://localhost:8000/health
docker compose -f deploy/docker-compose.prod.yml exec web curl http://localhost:3000/
```

### 404 Not Found on API routes

Verify the API URL structure:
- ✅ Correct: `http://localhost/api/health`
- ❌ Incorrect: `http://localhost/health` (unless using direct health endpoint)

Check nginx logs to see how requests are being routed:
```bash
docker compose -f deploy/docker-compose.prod.yml logs nginx -f
```

## Customization

To modify the nginx configuration:

1. Edit `deploy/nginx-simple.conf`
2. Test the configuration:
   ```bash
   docker compose -f deploy/docker-compose.prod.yml restart nginx
   docker compose -f deploy/docker-compose.prod.yml exec nginx nginx -t
   ```
3. If valid, nginx will automatically reload with the new configuration

## Advanced Setup

For more advanced nginx features, see:
- `deploy/nginx/nginx.conf` - Full nginx configuration with SSL
- `deploy/nginx/conf.d/f1-insights.conf` - Advanced site configuration
- [DOCKER_DEPLOYMENT.md](./DOCKER_DEPLOYMENT.md) - Full deployment guide

## Related Files

- `deploy/docker-compose.prod.yml` - Defines nginx service
- `deploy/nginx-simple.conf` - Nginx configuration file
- `deploy/nginx.conf` - Alternative nginx config for direct EC2 deployment
- `deploy/DOCKER_DEPLOYMENT.md` - Full deployment documentation
