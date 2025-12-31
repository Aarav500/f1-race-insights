#!/bin/bash
set -euo pipefail
echo "=== Host ==="
hostname; whoami; date
echo "=== Public endpoint from instance metadata (may be private) ==="
curl -s --max-time 2 http://169.254.169.254/latest/meta-data/public-hostname || true
curl -s --max-time 2 http://169.254.169.254/latest/meta-data/public-ipv4 || true

echo "=== Listening ports on host ==="
ss -lntp || netstat -lntp || true

echo "=== Docker containers ==="
docker ps --format "table {{.Names}}\t{{.Image}}\t{{.Ports}}\t{{.Status}}"
echo "=== Docker compose status (if present) ==="
cd /opt/f1-race-insights || true
docker compose ps || true
echo "=== Compose ports from config ==="
docker compose config | sed -n '/ports:/,/^[^ ]/p' || true

echo "=== Local HTTP checks ==="
for p in 80 443 3000 8000 8080; do
  echo "--- curl localhost:$p ---"
  curl -sS -I --max-time 2 "http://127.0.0.1:$p" | head -n 5 || true
done

echo "=== Container logs (last 200 lines) ==="
docker logs --tail 200 f1-race-insights-web 2>/dev/null || true
docker logs --tail 200 f1-race-insights-api 2>/dev/null || true
