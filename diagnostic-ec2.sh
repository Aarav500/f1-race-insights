#!/bin/bash
# EC2 Deployment Diagnostics Script
# Run this to diagnose deployment issues on the EC2 instance

set -euo pipefail

echo "=========================================="
echo "EC2 Deployment Diagnostics"
echo "=========================================="
echo ""

# System Information
echo "=== System Information ==="
echo "Hostname: $(hostname)"
echo "Uptime: $(uptime)"
echo "Kernel: $(uname -r)"
echo ""

# Disk Space
echo "=== Disk Space Usage ==="
df -h
echo ""

echo "=== Disk Space by Partition ==="
df -h | grep -E '^/dev/'
echo ""

# Docker Disk Usage
echo "=== Docker Disk Usage ==="
if command -v docker >/dev/null 2>&1; then
    echo "--- Docker System DF ---"
    sudo docker system df || echo "Failed to get Docker disk usage"
    echo ""
    
    echo "--- Docker Images ---"
    sudo docker images --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}" || echo "Failed to list images"
    echo ""
    
    echo "--- Docker Containers ---"
    sudo docker ps -a --format "table {{.Names}}\t{{.Status}}\t{{.Size}}" || echo "Failed to list containers"
    echo ""
    
    echo "--- Docker Volumes ---"
    sudo docker volume ls || echo "Failed to list volumes"
    echo ""
else
    echo "Docker not installed"
fi
echo ""

# Memory Usage
echo "=== Memory Usage ==="
free -h
echo ""

# Docker Daemon Status
echo "=== Docker Daemon Status ==="
if command -v systemctl >/dev/null 2>&1; then
    sudo systemctl status docker --no-pager || echo "Docker service not running"
else
    echo "systemctl not available"
fi
echo ""

# Docker Daemon Logs (last 50 lines)
echo "=== Docker Daemon Logs (last 50 lines) ==="
if command -v journalctl >/dev/null 2>&1; then
    sudo journalctl -u docker --no-pager -n 50 || echo "Failed to get Docker logs"
else
    echo "journalctl not available"
fi
echo ""

# Network Connectivity
echo "=== Network Connectivity ==="
echo "--- DNS Resolution ---"
nslookup ghcr.io || echo "DNS resolution failed"
echo ""

echo "--- Ping GHCR ---"
ping -c 3 ghcr.io || echo "Ping failed"
echo ""

echo "--- HTTPS Connectivity to GHCR ---"
curl -sS -o /dev/null -w "HTTP Status: %{http_code}\nTime: %{time_total}s\n" https://ghcr.io || echo "HTTPS connectivity failed"
echo ""

# Repository Status
echo "=== Repository Status ==="
if [ -d "/opt/f1-race-insights" ]; then
    cd /opt/f1-race-insights
    echo "Repository found at: $(pwd)"
    echo "Git branch: $(git branch --show-current 2>/dev/null || echo 'unknown')"
    echo "Git HEAD: $(git rev-parse HEAD 2>/dev/null || echo 'unknown')"
    echo "Git status:"
    git status --short || echo "Failed to get git status"
else
    echo "Repository not found at /opt/f1-race-insights"
fi
echo ""

# Docker Compose Status
echo "=== Docker Compose Status ==="
if [ -d "/opt/f1-race-insights" ]; then
    cd /opt/f1-race-insights
    if [ -f "docker-compose.yml" ]; then
        echo "--- Services Status ---"
        sudo docker compose ps || echo "Failed to get services status"
        echo ""
        
        echo "--- Service Logs (last 20 lines each) ---"
        for service in api web; do
            echo "=== $service logs ==="
            sudo docker compose logs --tail=20 "$service" 2>/dev/null || echo "No logs for $service"
            echo ""
        done
    else
        echo "docker-compose.yml not found"
    fi
else
    echo "Cannot check Docker Compose status - repository not found"
fi
echo ""

echo "=========================================="
echo "Diagnostics Complete"
echo "=========================================="
