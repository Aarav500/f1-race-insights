#!/usr/bin/env bash
#
# F1 Race Insights - Idempotent Deployment Script
#
# This script provides safe, repeatable deployment with disk management.
# Modes:
#   --soft-clean (default): Standard cleanup and redeploy
#   --hard-reset: Full Docker reset (WARNING: destroys all containers/volumes)
#
# Usage:
#   sudo bash ops/deploy.sh [--soft-clean | --hard-reset] [--prune-volumes]
#
# Requirements:
#   - Run with sudo (requires root for Docker operations)
#   - Docker and Docker Compose installed
#   - Git installed
#   - At least 20GB free disk space
#
set -euo pipefail

# Configuration
REPO_URL="https://github.com/Aarav500/f1-race-insights"
REPO_DIR="/opt/f1-race-insights"
COMPOSE_FILE="$REPO_DIR/docker-compose.yml"
LOG_DIR="/var/log/antigravity"
LOG="$LOG_DIR/deploy.log"
MODE="${1:---soft-clean}"          # --soft-clean | --hard-reset
PRUNE_VOLUMES="${2:-}"             # --prune-volumes (optional)
MIN_FREE_GB="${MIN_FREE_GB:-20}"   # Minimum free disk space in GB

# Ensure log directory exists
mkdir -p "$LOG_DIR"

# Redirect all output to log file and stdout
exec > >(tee -a "$LOG") 2>&1

# Color codes for terminal output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1"
}

log_warn() {
    echo -e "${YELLOW}[WARNING]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1"
}

# Header
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "       F1 Race Insights - Deployment Script"
echo "       Mode: $MODE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Step 1: Preflight checks
log_info "== PREFLIGHT CHECKS =="
log_info "Timestamp: $(date -Is)"
log_info "Hostname: $(hostname)"
log_info "User: $(whoami)"
echo ""

log_info "Disk usage:"
df -h / || true
echo ""

log_info "Inode usage:"
df -i / || true
echo ""

log_info "Docker version:"
docker version --format '{{.Server.Version}}' || log_warn "Docker not running or not installed"

log_info "Docker Compose version:"
docker compose version || log_warn "Docker Compose not available"
echo ""

# Validate mode
if [ "$MODE" != "--soft-clean" ] && [ "$MODE" != "--hard-reset" ]; then
    log_error "Invalid mode: $MODE. Use --soft-clean or --hard-reset"
    exit 1
fi

if [ "$MODE" = "--hard-reset" ]; then
    log_warn "⚠️  HARD RESET MODE ENABLED ⚠️"
    log_warn "This will destroy all Docker containers, images, and potentially volumes!"
    log_warn "Only use this for stateless applications or when you have backups."
    echo ""
fi

# Step 2: Stop running containers
log_info "== STOPPING CONTAINERS =="
if [ -f "$COMPOSE_FILE" ]; then
    log_info "Stopping containers from $COMPOSE_FILE..."
    docker compose -f "$COMPOSE_FILE" down --remove-orphans || log_warn "Failed to stop containers (may not be running)"
else
    log_warn "Compose file not found at $COMPOSE_FILE, skipping container shutdown"
fi
echo ""

# Step 3: Docker cleanup
log_info "== DOCKER CLEANUP =="
log_info "Starting Docker system prune..."
docker system prune -af || log_warn "Failed to prune Docker system"
echo ""

# Step 4: Check disk space and conditional volume pruning
log_info "== DISK SPACE CHECK =="
FREE_GB=$(df -BG / | awk 'NR==2{gsub(/G/,"",$4); print $4}')
log_info "Free disk space: ${FREE_GB}GB"

if [ "${FREE_GB:-0}" -lt "$MIN_FREE_GB" ]; then
    log_warn "Low disk space detected (${FREE_GB}GB < ${MIN_FREE_GB}GB threshold)"
    
    if [ "$PRUNE_VOLUMES" = "--prune-volumes" ]; then
        log_warn "Running aggressive cleanup including volumes..."
        docker system prune -af --volumes || log_warn "Failed to prune volumes"
        
        # Re-check disk space
        FREE_GB=$(df -BG / | awk 'NR==2{gsub(/G/,"",$4); print $4}')
        log_info "Free disk space after volume prune: ${FREE_GB}GB"
    fi
    
    # Final check
    if [ "${FREE_GB:-0}" -lt "$MIN_FREE_GB" ]; then
        log_error "Insufficient disk space: ${FREE_GB}GB < ${MIN_FREE_GB}GB"
        log_error "Free up disk space or use --prune-volumes flag"
        df -h /
        exit 1
    fi
fi
echo ""

# Step 5: Hard reset (optional)
if [ "$MODE" = "--hard-reset" ]; then
    log_warn "== HARD RESET =="
    log_warn "Performing full Docker reset..."
    
    # Stop Docker daemon
    log_info "Stopping Docker daemon..."
    systemctl stop docker || log_warn "Failed to stop Docker"
    
    # Remove Docker data directories
    log_info "Removing Docker data directories..."
    rm -rf /var/lib/docker /var/lib/containerd || log_warn "Failed to remove Docker directories"
    
    # Start Docker daemon
    log_info "Starting Docker daemon..."
    systemctl start docker || {
        log_error "Failed to start Docker daemon"
        exit 1
    }
    
    # Wait for Docker to be ready
    sleep 5
    log_info "Docker daemon restarted"
    
    # Remove repository directory
    log_warn "Removing repository directory: $REPO_DIR"
    rm -rf "$REPO_DIR" || log_warn "Failed to remove repository directory"
fi
echo ""

# Step 6: Clone or update repository
log_info "== REPOSITORY SETUP =="
if [ ! -d "$REPO_DIR/.git" ]; then
    log_info "Cloning repository from $REPO_URL to $REPO_DIR..."
    git clone "$REPO_URL" "$REPO_DIR" || {
        log_error "Failed to clone repository"
        exit 1
    }
    log_success "Repository cloned successfully"
else
    log_info "Repository already exists, updating..."
fi

cd "$REPO_DIR" || {
    log_error "Failed to change to repository directory"
    exit 1
}

log_info "Fetching latest changes from origin/main..."
git fetch origin main || {
    log_error "Failed to fetch from remote"
    exit 1
}

log_info "Resetting to origin/main..."
git reset --hard origin/main || {
    log_error "Failed to reset to origin/main"
    exit 1
}

log_info "Cleaning untracked files..."
git clean -fdx || log_warn "Failed to clean untracked files"

log_success "Repository updated to latest main branch"
COMMIT_HASH=$(git rev-parse --short HEAD)
log_info "Current commit: $COMMIT_HASH"
echo ""

# Step 7: Pull Docker images
log_info "== PULLING DOCKER IMAGES =="
if [ -f "$COMPOSE_FILE" ]; then
    log_info "Pulling latest images from registry..."
    docker compose -f "$COMPOSE_FILE" pull || {
        log_error "Failed to pull Docker images"
        exit 1
    }
    log_success "Docker images pulled successfully"
else
    log_error "Compose file not found: $COMPOSE_FILE"
    exit 1
fi
echo ""

# Step 8: Start services
log_info "== STARTING SERVICES =="
log_info "Starting containers with docker compose up -d..."
docker compose -f "$COMPOSE_FILE" up -d || {
    log_error "Failed to start containers"
    exit 1
}

# Wait for containers to initialize
log_info "Waiting for containers to initialize..."
sleep 10
echo ""

# Step 9: Health check
log_info "== HEALTH CHECK =="
HEALTHCHECK_SCRIPT="$REPO_DIR/ops/healthcheck.sh"

if [ -f "$HEALTHCHECK_SCRIPT" ]; then
    log_info "Running health check script..."
    if bash "$HEALTHCHECK_SCRIPT"; then
        log_success "Health check passed"
    else
        log_error "Health check failed"
        log_error "Check container logs: docker compose -f $COMPOSE_FILE logs"
        exit 1
    fi
else
    log_warn "Health check script not found at $HEALTHCHECK_SCRIPT"
    log_warn "Skipping automated health checks"
    
    # Basic container status check
    log_info "Container status:"
    docker compose -f "$COMPOSE_FILE" ps
fi
echo ""

# Success
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
log_success "DEPLOY_OK"
log_success "Deployment completed successfully!"
log_info "Deployed commit: $COMMIT_HASH"
log_info "Log file: $LOG"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

log_info "📝 Useful commands:"
log_info "  View logs: docker compose -f $COMPOSE_FILE logs -f"
log_info "  Check status: docker compose -f $COMPOSE_FILE ps"
log_info "  Restart: sudo bash $REPO_DIR/ops/deploy.sh"
echo ""

exit 0
