#!/bin/bash
#
# F1 Race Insights - Deployment Entry Point
#
# This script is the single entry point for all deployments.
# It enforces CI gate checks before running any deployment scripts.
#
# Usage:
#   bash scripts/deploy.sh
#
# Exit codes:
#   0 - Deployment successful
#   1 - CI gate failed or deployment failed
#

set -euo pipefail  # Exit on error, undefined variables, and pipe failures

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_step() {
    echo -e "${CYAN}[STEP]${NC} $1"
}

# Get script directory and repo root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(dirname "$SCRIPT_DIR")"

# Print header
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "       F1 Race Insights - Deployment Entry Point"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Step 1: Run CI Gate
log_step "STEP 1: Running CI Gate"
echo ""

if bash "$SCRIPT_DIR/ci_gate.sh"; then
    log_success "CI Gate passed - proceeding with deployment"
else
    log_error "CI Gate failed - deployment aborted"
    exit 1
fi

echo ""

# Step 2: Run deployment script
log_step "STEP 2: Running deployment script"
echo ""

# Run ops/deploy.sh (idempotent deployment with disk checks)
DEPLOY_SCRIPT="$REPO_ROOT/ops/deploy.sh"
if [ -f "$DEPLOY_SCRIPT" ]; then
    log_info "Running idempotent deployment script..."
    echo ""
    # Pass --soft-clean by default, but allow override via command line args
    DEPLOY_MODE="${1:---soft-clean}"
    if sudo bash "$DEPLOY_SCRIPT" "$DEPLOY_MODE"; then
        log_success "Deployment completed"
    else
        log_error "Deployment failed"
        exit 1
    fi
else
    # Fallback to legacy EC2 deployment script
    LEGACY_DEPLOY="$REPO_ROOT/deploy/ec2_deploy.sh"
    if [ -f "$LEGACY_DEPLOY" ]; then
        log_info "ops/deploy.sh not found, using legacy EC2 deployment..."
        echo ""
        if bash "$LEGACY_DEPLOY" "$@"; then
            log_success "EC2 deployment completed"
        else
            log_error "EC2 deployment failed"
            exit 1
        fi
    else
        log_error "No deployment script found"
        exit 1
    fi
fi

echo ""

# Success
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
log_success "Deployment Complete"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
