#!/bin/bash
#
# F1 Race Insights - Nginx Setup Script for Amazon Linux 2023
#
# Run on EC2: sudo bash setup_nginx.sh
#
# This script:
#   1. Installs and enables Nginx
#   2. Configures firewall (if active)
#   3. Copies site configuration
#   4. Sets up Let's Encrypt (optional)
#

set -euo pipefail

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Configuration
DEPLOY_DIR="${DEPLOY_DIR:-/opt/f1-race-insights/deploy}"
DOMAIN="${DOMAIN:-aarav-shah.com}"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "       F1 Race Insights - Nginx Setup"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Step 1: Update system and install Nginx
log_info "Step 1: Installing Nginx..."
sudo dnf update -y
sudo dnf install -y nginx
log_success "Nginx installed"

# Step 2: Enable and start Nginx
log_info "Step 2: Enabling Nginx service..."
sudo systemctl enable --now nginx
sudo systemctl status nginx --no-pager || true
log_success "Nginx service enabled and started"

# Step 3: Verify listening on :80
log_info "Step 3: Verifying port binding..."
sudo ss -tulpn | egrep ':80|:443' || log_warning "No services on :80/:443 yet"

# Step 4: Configure firewall (if firewalld is active)
log_info "Step 4: Configuring firewall..."
if systemctl is-active --quiet firewalld; then
    sudo firewall-cmd --permanent --add-service=http
    sudo firewall-cmd --permanent --add-service=https
    sudo firewall-cmd --reload
    log_success "Firewall configured for HTTP/HTTPS"
else
    log_info "firewalld not active, skipping firewall configuration"
fi

# Step 5: Copy site configuration
log_info "Step 5: Copying site configuration..."
if [ -f "${DEPLOY_DIR}/nginx/conf.d/aarav-shah.conf" ]; then
    sudo cp "${DEPLOY_DIR}/nginx/conf.d/aarav-shah.conf" /etc/nginx/conf.d/
    log_success "Site configuration copied"
else
    log_warning "Site config not found at ${DEPLOY_DIR}/nginx/conf.d/aarav-shah.conf"
    log_info "You may need to copy it manually"
fi

# Step 6: Test and reload Nginx
log_info "Step 6: Testing Nginx configuration..."
if sudo nginx -t; then
    sudo systemctl reload nginx
    log_success "Nginx configuration valid and reloaded"
else
    log_error "Nginx configuration test failed!"
    exit 1
fi

# Step 7: Verify HTTP is working
log_info "Step 7: Testing HTTP..."
if curl -s -o /dev/null -w "%{http_code}" http://localhost | grep -q "200\|301"; then
    log_success "HTTP is working"
else
    log_warning "HTTP test returned unexpected status"
fi

# Step 8: Install certbot for Let's Encrypt
log_info "Step 8: Installing Certbot for Let's Encrypt..."
sudo dnf install -y certbot python3-certbot-nginx
log_success "Certbot installed"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
log_success "Nginx setup complete!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📝 Next steps:"
echo "   1. Ensure DNS for ${DOMAIN} points to this server's public IP"
echo "   2. Run: sudo certbot --nginx -d ${DOMAIN} -d www.${DOMAIN}"
echo "   3. Test: curl -I https://f1.${DOMAIN}/"
echo ""
echo "🔍 Useful commands:"
echo "   • Check status:  sudo systemctl status nginx"
echo "   • View logs:     sudo tail -f /var/log/nginx/error.log"
echo "   • Test config:   sudo nginx -t"
echo "   • Reload:        sudo systemctl reload nginx"
echo ""
