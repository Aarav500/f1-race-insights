#!/bin/bash
#
# F1 Race Insights - CI Gate Script
#
# This script enforces type checking, linting, and testing before deployment.
# All checks must pass for deployment to proceed.
#
# Usage:
#   bash scripts/ci_gate.sh
#
# Exit codes:
#   0 - All checks passed
#   1 - One or more checks failed
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

# Print header
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "       F1 Race Insights - CI Gate"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Print repo root and commit SHA
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
log_info "Repository root: $REPO_ROOT"

if command -v git &> /dev/null && [ -d "$REPO_ROOT/.git" ]; then
    COMMIT_SHA=$(git -C "$REPO_ROOT" rev-parse HEAD)
    COMMIT_SHORT=$(git -C "$REPO_ROOT" rev-parse --short HEAD)
    BRANCH=$(git -C "$REPO_ROOT" rev-parse --abbrev-ref HEAD)
    log_info "Current commit: $COMMIT_SHA"
    log_info "Short commit: $COMMIT_SHORT"
    log_info "Branch: $BRANCH"
else
    log_info "Not in a git repository or git not available"
fi

echo ""

# Track overall success
ALL_PASSED=true

# Clear caches
log_step "Clearing caches..."
cd "$REPO_ROOT"

CACHES=(".mypy_cache" ".ruff_cache" ".pytest_cache")
for cache in "${CACHES[@]}"; do
    if [ -d "$cache" ]; then
        log_info "Removing $cache"
        rm -rf "$cache"
    else
        log_info "$cache not found (skipping)"
    fi
done

log_success "Caches cleared"
echo ""

# Run type checking
log_step "Running type checking (make typecheck)..."
echo ""
if make typecheck; then
    echo ""
    log_success "Type checking passed"
else
    echo ""
    log_error "Type checking failed"
    ALL_PASSED=false
fi
echo ""

# Run linting
log_step "Running linting (make lint)..."
echo ""
if make lint; then
    echo ""
    log_success "Linting passed"
else
    echo ""
    log_error "Linting failed"
    ALL_PASSED=false
fi
echo ""

# Run tests
log_step "Running tests (make test)..."
echo ""
if make test; then
    echo ""
    log_success "Tests passed"
else
    echo ""
    log_error "Tests failed"
    ALL_PASSED=false
fi
echo ""

# Print final result
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if [ "$ALL_PASSED" = true ]; then
    log_success "ALL CHECKS PASSED"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    exit 0
else
    log_error "DEPLOY BLOCKED"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    log_error "One or more checks failed. Deployment is not allowed."
    log_info "Fix the issues above and run this script again."
    echo ""
    exit 1
fi
