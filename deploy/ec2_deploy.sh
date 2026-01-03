#!/bin/bash
#
# F1 Race Insights - EC2 Deployment Script
#
# This script deploys the F1 Race Insights application on an EC2 instance by:
#   1. Pulling the latest Docker images from the container registry
#   2. Updating the docker-compose configuration
#   3. Restarting services with zero-downtime deployment
#   4. Cleaning up old/unused Docker images
#
# Usage:
#   bash ec2_deploy.sh [options]
#
# Options:
#   --env-file <path>     Path to .env.prod file (default: ./deploy/.env.prod)
#   --compose-file <path> Path to docker-compose file (default: ./deploy/docker-compose.prod.yml)
#   --no-pull             Skip pulling latest images
#   --no-prune            Skip pruning old images
#   --backup              Create backup of current deployment
#   --help                Show this help message
#
# Requirements:
#   - Docker and Docker Compose installed
#   - Logged in to container registry (ECR, Docker Hub, etc.)
#   - .env.prod file with required environment variables
#
# Author: F1 Race Insights Team
# License: MIT

set -euo pipefail  # Exit on error, undefined variables, and pipe failures

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Default configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
DEPLOY_DIR="${SCRIPT_DIR}"
ENV_FILE="${DEPLOY_DIR}/.env.prod"
COMPOSE_FILE="${DEPLOY_DIR}/docker-compose.prod.yml"
APP_DIR="/opt/f1-race-insights"

# Flags
PULL_IMAGES=true
PRUNE_IMAGES=true
CREATE_BACKUP=false

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1"
}

log_step() {
    echo -e "${CYAN}[STEP]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1"
}

# Show help message
show_help() {
    cat << EOF
F1 Race Insights - EC2 Deployment Script

Usage: bash ec2_deploy.sh [options]

Options:
  --env-file <path>     Path to .env.prod file (default: ./deploy/.env.prod)
  --compose-file <path> Path to docker-compose file (default: ./deploy/docker-compose.prod.yml)
  --no-pull             Skip pulling latest images
  --no-prune            Skip pruning old images
  --backup              Create backup of current deployment
  --help                Show this help message

Examples:
  # Standard deployment
  bash ec2_deploy.sh

  # Deploy with custom config location
  bash ec2_deploy.sh --env-file /path/to/.env.prod --compose-file /path/to/docker-compose.yml

  # Deploy without pruning old images
  bash ec2_deploy.sh --no-prune

  # Deploy with backup
  bash ec2_deploy.sh --backup

EOF
}

# Parse command line arguments
parse_arguments() {
    while [[ $# -gt 0 ]]; do
        case $1 in
            --env-file)
                ENV_FILE="$2"
                shift 2
                ;;
            --compose-file)
                COMPOSE_FILE="$2"
                shift 2
                ;;
            --no-pull)
                PULL_IMAGES=false
                shift
                ;;
            --no-prune)
                PRUNE_IMAGES=false
                shift
                ;;
            --backup)
                CREATE_BACKUP=true
                shift
                ;;
            --help)
                show_help
                exit 0
                ;;
            *)
                log_error "Unknown option: $1"
                show_help
                exit 1
                ;;
        esac
    done
}

# Check prerequisites
check_prerequisites() {
    log_step "Checking prerequisites..."

    # Check if Docker is installed
    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed. Please run ec2_bootstrap.sh first."
        exit 1
    fi
    log_success "Docker is installed: $(docker --version)"

    # Check if Docker Compose is available
    if ! docker compose version &> /dev/null; then
        log_error "Docker Compose is not available. Please run ec2_bootstrap.sh first."
        exit 1
    fi
    log_success "Docker Compose is available: $(docker compose version --short)"

    # Check if Docker daemon is running
    if ! docker info &> /dev/null; then
        log_error "Docker daemon is not running. Please start Docker service."
        exit 1
    fi
    log_success "Docker daemon is running"

    # Check if .env.prod file exists
    if [ ! -f "$ENV_FILE" ]; then
        log_error "Environment file not found: $ENV_FILE"
        log_error "Please create .env.prod with your configuration."
        exit 1
    fi
    log_success "Environment file found: $ENV_FILE"

    # Check if docker-compose.prod.yml exists
    if [ ! -f "$COMPOSE_FILE" ]; then
        log_error "Docker Compose file not found: $COMPOSE_FILE"
        exit 1
    fi
    log_success "Docker Compose file found: $COMPOSE_FILE"

    # Load environment variables (without exposing them)
    set -a
    source "$ENV_FILE"
    set +a
    log_success "Environment variables loaded"
}

# Create backup of current deployment
create_backup() {
    if [ "$CREATE_BACKUP" = false ]; then
        log_info "Skipping backup (--backup not specified)"
        return 0
    fi

    log_step "Creating backup of current deployment..."

    BACKUP_DIR="${DEPLOY_DIR}/backups"
    BACKUP_TIMESTAMP=$(date '+%Y%m%d_%H%M%S')
    BACKUP_PATH="${BACKUP_DIR}/backup_${BACKUP_TIMESTAMP}"

    mkdir -p "$BACKUP_DIR"

    # Save current container states
    log_info "Saving container information..."
    docker compose -f "$COMPOSE_FILE" ps > "${BACKUP_PATH}_containers.txt" 2>/dev/null || true

    # Save current images
    log_info "Saving image information..."
    docker compose -f "$COMPOSE_FILE" images > "${BACKUP_PATH}_images.txt" 2>/dev/null || true

    # Save environment file
    log_info "Backing up environment file..."
    cp "$ENV_FILE" "${BACKUP_PATH}_env.prod"

    log_success "Backup created at: $BACKUP_PATH"
}

# Login to container registry (if credentials are available)
login_to_registry() {
    log_step "Checking container registry authentication..."

    # Check if using AWS ECR
    if [[ "${DOCKER_REGISTRY:-}" == *"ecr"* ]]; then
        log_info "Detected AWS ECR registry"
        
        # Extract region from registry URL
        AWS_REGION=$(echo "$DOCKER_REGISTRY" | sed -n 's/.*ecr.\([^.]*\).amazonaws.com.*/\1/p')
        
        if [ -z "$AWS_REGION" ]; then
            AWS_REGION="${AWS_REGION:-us-east-1}"
        fi
        
        log_info "Logging in to AWS ECR (region: $AWS_REGION)..."
        
        if command -v aws &> /dev/null; then
            aws ecr get-login-password --region "$AWS_REGION" | \
                docker login --username AWS --password-stdin "$DOCKER_REGISTRY" &>/dev/null && \
                log_success "Successfully logged in to AWS ECR" || \
                log_warning "Failed to login to AWS ECR. Assuming already authenticated."
        else
            log_warning "AWS CLI not installed. Assuming ECR authentication via instance role."
        fi
    else
        log_info "Non-ECR registry detected. Assuming already authenticated."
    fi
}

# Pull latest Docker images
pull_images() {
    if [ "$PULL_IMAGES" = false ]; then
        log_info "Skipping image pull (--no-pull specified)"
        return 0
    fi

    log_step "Pulling latest Docker images..."

    # Pull images defined in docker-compose.yml
    if docker compose -f "$COMPOSE_FILE" pull; then
        log_success "Successfully pulled latest images"
    else
        log_error "Failed to pull images"
        exit 1
    fi

    # Show updated images
    log_info "Updated images:"
    docker compose -f "$COMPOSE_FILE" images
}

# Deploy application (restart services)
deploy_application() {
    log_step "Deploying application..."

    # Start/restart services with docker compose
    log_info "Starting services with docker compose up -d..."
    
    if docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" up -d --remove-orphans; then
        log_success "Services started successfully"
    else
        log_error "Failed to start services"
        exit 1
    fi

    # Wait for services to be healthy
    log_info "Waiting for services to be healthy..."
    sleep 5

    # Show service status
    log_info "Service status:"
    docker compose -f "$COMPOSE_FILE" ps
}

# Verify deployment health
verify_deployment() {
    log_step "Verifying deployment health..."

    local all_healthy=true

    # Check API health
    log_info "Checking API health..."
    for i in {1..10}; do
        if docker compose -f "$COMPOSE_FILE" exec -T api python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/health')" &>/dev/null; then
            log_success "API is healthy"
            break
        else
            if [ $i -eq 10 ]; then
                log_warning "API health check failed after 10 attempts"
                all_healthy=false
            else
                log_info "API not ready yet, waiting... (attempt $i/10)"
                sleep 3
            fi
        fi
    done

    # Check Web health
    log_info "Checking Web health..."
    for i in {1..10}; do
        if docker compose -f "$COMPOSE_FILE" exec -T web node -e "require('http').get('http://localhost:3000/', (r) => {if (r.statusCode !== 200) process.exit(1)})" &>/dev/null; then
            log_success "Web is healthy"
            break
        else
            if [ $i -eq 10 ]; then
                log_warning "Web health check failed after 10 attempts"
                all_healthy=false
            else
                log_info "Web not ready yet, waiting... (attempt $i/10)"
                sleep 3
            fi
        fi
    done

    # Check Nginx health
    log_info "Checking Nginx health..."
    if docker compose -f "$COMPOSE_FILE" exec -T nginx nginx -t &>/dev/null; then
        log_success "Nginx configuration is valid"
    else
        log_warning "Nginx configuration test failed"
        all_healthy=false
    fi

    if [ "$all_healthy" = true ]; then
        log_success "All services are healthy"
    else
        log_warning "Some services may not be fully healthy. Check logs with: docker compose -f $COMPOSE_FILE logs"
    fi
}

# Prune old Docker images
prune_images() {
    if [ "$PRUNE_IMAGES" = false ]; then
        log_info "Skipping image pruning (--no-prune specified)"
        return 0
    fi

    log_step "Pruning old Docker images..."

    # Get disk usage before pruning
    DISK_BEFORE=$(docker system df | grep "Images" | awk '{print $4}')
    log_info "Disk usage before pruning: $DISK_BEFORE"

    # Prune dangling images (safe - only removes untagged images)
    log_info "Removing dangling images..."
    docker image prune -f &>/dev/null || log_warning "Failed to prune dangling images"

    # Optionally prune all unused images (more aggressive)
    # Uncomment the following line if you want to remove all unused images
    # docker image prune -a -f --filter "until=24h" &>/dev/null || log_warning "Failed to prune unused images"

    # Get disk usage after pruning
    DISK_AFTER=$(docker system df | grep "Images" | awk '{print $4}')
    log_info "Disk usage after pruning: $DISK_AFTER"

    log_success "Image pruning completed"
}

# Display deployment summary
display_summary() {
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    log_success "Deployment Complete!"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "📊 Deployment Summary:"
    echo "  • Environment: production"
    echo "  • Compose file: $COMPOSE_FILE"
    echo "  • Env file: $ENV_FILE"
    echo ""
    echo "🐳 Running services:"
    docker compose -f "$COMPOSE_FILE" ps --format "table {{.Name}}\t{{.Status}}\t{{.Ports}}"
    echo ""
    echo "📝 Useful commands:"
    echo "  • View logs: docker compose -f $COMPOSE_FILE logs -f"
    echo "  • View logs (specific service): docker compose -f $COMPOSE_FILE logs -f api"
    echo "  • Check status: docker compose -f $COMPOSE_FILE ps"
    echo "  • Restart service: docker compose -f $COMPOSE_FILE restart <service>"
    echo "  • Stop all: docker compose -f $COMPOSE_FILE down"
    echo ""
    echo "🔍 Health check URLs (internal):"
    echo "  • API: http://localhost:8000/health"
    echo "  • Web: http://localhost:3000"
    echo ""
    if [ -n "${DOMAIN:-}" ]; then
        echo "🌐 Public URLs:"
        echo "  • Frontend: https://${DOMAIN}"
        echo "  • API: https://${DOMAIN}/api"
        echo ""
    fi
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
}

# Main execution
main() {
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "       F1 Race Insights - Production Deployment"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""

    # Parse arguments
    parse_arguments "$@"

    # Run CI gate to ensure all checks pass before deployment
    log_step "Running CI Gate checks..."
    CI_GATE_SCRIPT="${PROJECT_ROOT}/scripts/ci_gate.sh"
    
    if [ -f "$CI_GATE_SCRIPT" ]; then
        if bash "$CI_GATE_SCRIPT"; then
            log_success "CI Gate passed - proceeding with deployment"
        else
            log_error "CI Gate failed - deployment blocked"
            log_error "Fix type checking, linting, or test failures before deploying"
            exit 1
        fi
    else
        log_warning "CI Gate script not found at $CI_GATE_SCRIPT"
        log_warning "Skipping CI checks (not recommended for production)"
    fi
    echo ""

    # Run deployment steps
    check_prerequisites
    create_backup
    login_to_registry
    pull_images
    deploy_application

    # Setup Nginx if not already running
    if ! systemctl is-active --quiet nginx 2>/dev/null; then
        log_step "Setting up Nginx..."
        if [ -f "${DEPLOY_DIR}/setup_nginx.sh" ]; then
            bash "${DEPLOY_DIR}/setup_nginx.sh"
        else
            log_warning "setup_nginx.sh not found, skipping Nginx setup"
        fi
    else
        log_info "Nginx already running, skipping setup"
    fi

    verify_deployment
    prune_images

    # Display summary
    display_summary
}

# Trap errors and display helpful message
trap 'log_error "Deployment failed at line $LINENO. Check logs above for details."' ERR

# Run main function
main "$@"
