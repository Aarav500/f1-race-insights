#!/bin/bash
#
# F1 Race Insights - EC2 Bootstrap Script
# 
# This script prepares an EC2 instance for deploying the F1 Race Insights application.
# It installs Docker, Docker Compose plugin, Git, and optionally UFW firewall.
# The script is idempotent and safe to run multiple times.
#
# Usage:
#   sudo bash ec2_bootstrap.sh
#
# Supports:
#   - Amazon Linux 2 / Amazon Linux 2023
#   - Ubuntu 20.04 / 22.04 / 24.04
#   - Debian 11 / 12
#
# Author: F1 Race Insights Team
# License: MIT

set -euo pipefail  # Exit on error, undefined variables, and pipe failures

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
APP_DIR="/opt/f1-race-insights"
APP_USER="${DEPLOY_USER:-ec2-user}"  # Default to ec2-user, can override with env var

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root
check_root() {
    if [ "$EUID" -ne 0 ]; then
        log_error "This script must be run as root (use sudo)"
        exit 1
    fi
    log_success "Running as root"
}

# Detect OS distribution
detect_os() {
    if [ -f /etc/os-release ]; then
        . /etc/os-release
        OS=$ID
        OS_VERSION=$VERSION_ID
        log_info "Detected OS: $OS $OS_VERSION"
    else
        log_error "Cannot detect OS. /etc/os-release not found."
        exit 1
    fi
}

# Update package manager
update_packages() {
    log_info "Updating package manager..."
    
    case $OS in
        amzn|amazonlinux)
            yum update -y &>/dev/null || log_warning "Failed to update yum packages"
            ;;
        ubuntu|debian)
            apt-get update -y &>/dev/null || log_warning "Failed to update apt packages"
            ;;
        *)
            log_warning "Unsupported OS: $OS. Skipping package update."
            ;;
    esac
    
    log_success "Package manager updated"
}

# Install Docker
install_docker() {
    log_info "Checking Docker installation..."
    
    if command -v docker &> /dev/null; then
        DOCKER_VERSION=$(docker --version | awk '{print $3}' | sed 's/,$//')
        log_success "Docker is already installed (version: $DOCKER_VERSION)"
        return 0
    fi
    
    log_info "Installing Docker..."
    
    case $OS in
        amzn|amazonlinux)
            # Amazon Linux
            yum install -y docker &>/dev/null
            ;;
        ubuntu|debian)
            # Ubuntu/Debian - Install Docker from official repository
            apt-get install -y ca-certificates curl gnupg lsb-release &>/dev/null
            
            # Add Docker's official GPG key (idempotent)
            install -m 0755 -d /etc/apt/keyrings
            if [ ! -f /etc/apt/keyrings/docker.gpg ]; then
                curl -fsSL https://download.docker.com/linux/$OS/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
                chmod a+r /etc/apt/keyrings/docker.gpg
            fi
            
            # Add Docker repository (idempotent)
            if [ ! -f /etc/apt/sources.list.d/docker.list ]; then
                echo \
                  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/$OS \
                  $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
            fi
            
            apt-get update -y &>/dev/null
            apt-get install -y docker-ce docker-ce-cli containerd.io &>/dev/null
            ;;
        *)
            log_error "Unsupported OS for Docker installation: $OS"
            exit 1
            ;;
    esac
    
    log_success "Docker installed successfully"
}

# Install Docker Compose Plugin
install_docker_compose() {
    log_info "Checking Docker Compose plugin installation..."
    
    if docker compose version &> /dev/null; then
        COMPOSE_VERSION=$(docker compose version | awk '{print $4}')
        log_success "Docker Compose plugin is already installed (version: $COMPOSE_VERSION)"
        return 0
    fi
    
    log_info "Installing Docker Compose plugin..."
    
    case $OS in
        amzn|amazonlinux)
            # Amazon Linux - install docker-compose-plugin
            yum install -y docker-compose-plugin &>/dev/null || {
                # Fallback: install standalone docker-compose
                log_warning "docker-compose-plugin not available, installing standalone version..."
                COMPOSE_VERSION="v2.24.0"
                curl -SL "https://github.com/docker/compose/releases/download/${COMPOSE_VERSION}/docker-compose-linux-$(uname -m)" \
                    -o /usr/local/bin/docker-compose
                chmod +x /usr/local/bin/docker-compose
                ln -sf /usr/local/bin/docker-compose /usr/bin/docker-compose
            }
            ;;
        ubuntu|debian)
            # Ubuntu/Debian - should be installed with docker-ce
            apt-get install -y docker-compose-plugin &>/dev/null
            ;;
        *)
            log_error "Unsupported OS for Docker Compose installation: $OS"
            exit 1
            ;;
    esac
    
    log_success "Docker Compose plugin installed successfully"
}

# Start and enable Docker service
configure_docker_service() {
    log_info "Configuring Docker service..."
    
    # Start Docker service
    if systemctl is-active --quiet docker; then
        log_success "Docker service is already running"
    else
        log_info "Starting Docker service..."
        systemctl start docker
        log_success "Docker service started"
    fi
    
    # Enable Docker to start on boot
    if systemctl is-enabled --quiet docker; then
        log_success "Docker service is already enabled"
    else
        log_info "Enabling Docker service..."
        systemctl enable docker &>/dev/null
        log_success "Docker service enabled"
    fi
}

# Add user to docker group
add_user_to_docker_group() {
    log_info "Adding user '$APP_USER' to docker group..."
    
    # Check if user exists
    if ! id "$APP_USER" &>/dev/null; then
        log_warning "User '$APP_USER' does not exist. Skipping docker group assignment."
        return 0
    fi
    
    # Check if user is already in docker group
    if groups "$APP_USER" | grep -q "\bdocker\b"; then
        log_success "User '$APP_USER' is already in docker group"
    else
        usermod -aG docker "$APP_USER"
        log_success "User '$APP_USER' added to docker group (logout required for changes to take effect)"
    fi
}

# Install Git
install_git() {
    log_info "Checking Git installation..."
    
    if command -v git &> /dev/null; then
        GIT_VERSION=$(git --version | awk '{print $3}')
        log_success "Git is already installed (version: $GIT_VERSION)"
        return 0
    fi
    
    log_info "Installing Git..."
    
    case $OS in
        amzn|amazonlinux)
            yum install -y git &>/dev/null
            ;;
        ubuntu|debian)
            apt-get install -y git &>/dev/null
            ;;
        *)
            log_error "Unsupported OS for Git installation: $OS"
            exit 1
            ;;
    esac
    
    log_success "Git installed successfully"
}

# Install UFW (optional)
install_ufw() {
    log_info "Checking UFW installation..."
    
    # Skip UFW on Amazon Linux (use security groups instead)
    if [[ "$OS" == "amzn" || "$OS" == "amazonlinux" ]]; then
        log_warning "UFW is not recommended for Amazon Linux. Use AWS Security Groups instead."
        return 0
    fi
    
    if command -v ufw &> /dev/null; then
        log_success "UFW is already installed"
        return 0
    fi
    
    log_info "Installing UFW..."
    
    case $OS in
        ubuntu|debian)
            apt-get install -y ufw &>/dev/null
            log_success "UFW installed successfully"
            
            # Basic UFW configuration (only if not already configured)
            if ! ufw status | grep -q "Status: active"; then
                log_info "Configuring UFW firewall..."
                ufw --force reset &>/dev/null
                ufw default deny incoming &>/dev/null
                ufw default allow outgoing &>/dev/null
                ufw allow ssh &>/dev/null
                ufw allow 80/tcp &>/dev/null
                ufw allow 443/tcp &>/dev/null
                
                log_warning "UFW rules configured but NOT enabled. To enable: sudo ufw enable"
                log_warning "WARNING: Make sure SSH (port 22) is allowed before enabling UFW!"
            fi
            ;;
        *)
            log_warning "UFW installation not supported on $OS"
            ;;
    esac
}

# Create application directory
create_app_directory() {
    log_info "Creating application directory: $APP_DIR"
    
    if [ -d "$APP_DIR" ]; then
        log_success "Directory $APP_DIR already exists"
    else
        mkdir -p "$APP_DIR"
        log_success "Directory $APP_DIR created"
    fi
    
    # Set ownership if user exists
    if id "$APP_USER" &>/dev/null; then
        chown -R "$APP_USER:$APP_USER" "$APP_DIR"
        log_success "Ownership set to $APP_USER:$APP_USER"
    else
        log_warning "User '$APP_USER' does not exist. Skipping ownership change."
    fi
    
    # Set permissions
    chmod 755 "$APP_DIR"
    log_success "Permissions set to 755"
}

# Install additional useful tools
install_additional_tools() {
    log_info "Installing additional useful tools..."
    
    case $OS in
        amzn|amazonlinux)
            # Amazon Linux extras
            yum install -y \
                htop \
                vim \
                curl \
                wget \
                unzip \
                tar \
                &>/dev/null || log_warning "Some tools may not have installed"
            ;;
        ubuntu|debian)
            apt-get install -y \
                htop \
                vim \
                curl \
                wget \
                unzip \
                tar \
                net-tools \
                &>/dev/null || log_warning "Some tools may not have installed"
            ;;
    esac
    
    log_success "Additional tools installed"
}

# Display summary
display_summary() {
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    log_success "EC2 Bootstrap Complete!"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "📦 Installed packages:"
    echo "  • Docker: $(docker --version 2>/dev/null || echo 'Not installed')"
    echo "  • Docker Compose: $(docker compose version 2>/dev/null || echo 'Not installed')"
    echo "  • Git: $(git --version 2>/dev/null || echo 'Not installed')"
    if command -v ufw &> /dev/null; then
        echo "  • UFW: $(ufw --version 2>/dev/null | head -n1 || echo 'Installed')"
    fi
    echo ""
    echo "📂 Application directory: $APP_DIR"
    echo ""
    echo "⚠️  IMPORTANT:"
    echo "  • User '$APP_USER' has been added to the docker group"
    echo "  • Log out and log back in for docker group membership to take effect"
    echo "  • Or run: newgrp docker"
    echo ""
    echo "🚀 Next steps:"
    echo "  1. Clone the repository to $APP_DIR"
    echo "  2. Copy docker-compose.prod.yml and .env.prod to $APP_DIR"
    echo "  3. Configure .env.prod with your actual credentials"
    echo "  4. Run: cd $APP_DIR && docker compose -f docker-compose.prod.yml up -d"
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
}

# Main execution
main() {
    log_info "Starting F1 Race Insights EC2 Bootstrap..."
    echo ""
    
    # Run all setup steps
    check_root
    detect_os
    update_packages
    install_docker
    install_docker_compose
    configure_docker_service
    add_user_to_docker_group
    install_git
    install_ufw
    create_app_directory
    install_additional_tools
    
    # Display summary
    display_summary
}

# Run main function
main "$@"
