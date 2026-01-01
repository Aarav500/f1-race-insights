#!/usr/bin/env bash
#
# F1 Race Insights - Health Check Script
#
# This script validates that all deployed services are responding correctly.
# Used by deployment scripts to verify successful deployment.
#
# Exit codes:
#   0 - All health checks passed
#   1 - One or more health checks failed
#
set -euo pipefail

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Configuration
API_PORT="${API_PORT:-8000}"
WEB_PORT="${WEB_PORT:-3000}"
MAX_RETRIES=30
RETRY_DELAY=2

log_info() {
    echo -e "[INFO] $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Health check for API
check_api_health() {
    log_info "Checking API health on port $API_PORT..."
    
    for i in $(seq 1 $MAX_RETRIES); do
        if curl -sf "http://localhost:$API_PORT/health" > /dev/null 2>&1; then
            log_success "API is healthy (attempt $i/$MAX_RETRIES)"
            return 0
        else
            if [ $i -eq $MAX_RETRIES ]; then
                log_error "API health check failed after $MAX_RETRIES attempts"
                return 1
            fi
            log_info "API not ready, retrying in ${RETRY_DELAY}s... (attempt $i/$MAX_RETRIES)"
            sleep $RETRY_DELAY
        fi
    done
}

# Health check for Web frontend
check_web_health() {
    log_info "Checking Web frontend health on port $WEB_PORT..."
    
    for i in $(seq 1 $MAX_RETRIES); do
        # Check if web server responds with 200 OK
        HTTP_CODE=$(curl -sf -o /dev/null -w "%{http_code}" "http://localhost:$WEB_PORT/" 2>/dev/null || echo "000")
        
        if [ "$HTTP_CODE" = "200" ]; then
            log_success "Web frontend is healthy (attempt $i/$MAX_RETRIES)"
            return 0
        else
            if [ $i -eq $MAX_RETRIES ]; then
                log_error "Web health check failed after $MAX_RETRIES attempts (HTTP $HTTP_CODE)"
                return 1
            fi
            log_info "Web not ready (HTTP $HTTP_CODE), retrying in ${RETRY_DELAY}s... (attempt $i/$MAX_RETRIES)"
            sleep $RETRY_DELAY
        fi
    done
}

# Check Docker containers are running
check_containers() {
    log_info "Checking Docker containers..."
    
    COMPOSE_FILE="${COMPOSE_FILE:-/opt/f1-race-insights/docker-compose.yml}"
    
    if [ ! -f "$COMPOSE_FILE" ]; then
        log_warn "Compose file not found at $COMPOSE_FILE, skipping container check"
        return 0
    fi
    
    # Get list of expected containers
    RUNNING=$(docker compose -f "$COMPOSE_FILE" ps --services --filter "status=running" 2>/dev/null | wc -l)
    EXPECTED=$(docker compose -f "$COMPOSE_FILE" config --services 2>/dev/null | wc -l)
    
    if [ "$RUNNING" -eq "$EXPECTED" ] && [ "$EXPECTED" -gt 0 ]; then
        log_success "All $EXPECTED containers are running"
        return 0
    else
        log_error "Container status mismatch: $RUNNING/$EXPECTED running"
        docker compose -f "$COMPOSE_FILE" ps
        return 1
    fi
}

# Main health check execution
main() {
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "       F1 Race Insights - Health Check"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    
    local all_healthy=true
    
    # Run all health checks
    check_containers || all_healthy=false
    echo ""
    
    check_api_health || all_healthy=false
    echo ""
    
    check_web_health || all_healthy=false
    echo ""
    
    # Summary
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    if [ "$all_healthy" = true ]; then
        log_success "All health checks passed ✓"
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        return 0
    else
        log_error "One or more health checks failed ✗"
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        return 1
    fi
}

# Run main function
main "$@"
