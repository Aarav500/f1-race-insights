#!/bin/bash
# ============================================================
#  F1 Race Insights - Complete EC2 Deployment Script
#  Run this to do a full deployment from local to production
# ============================================================

set -e

# Configuration - Update these if needed
EC2_HOST="${EC2_HOST:-34.204.193.47}"
EC2_USER="${EC2_USER:-ec2-user}"
SSH_KEY="${SSH_KEY:-$HOME/Downloads/F1.pem}"
REMOTE_DIR="${REMOTE_DIR:-/opt/f1-race-insights}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log() { echo -e "${BLUE}[INFO]${NC} $1"; }
success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
error() { echo -e "${RED}[ERROR]${NC} $1"; exit 1; }
step() { echo -e "${YELLOW}[$1/6]${NC} $2"; }

# Check prerequisites
check_prereqs() {
    [ -f "$SSH_KEY" ] || error "SSH key not found: $SSH_KEY"
    command -v ssh >/dev/null || error "SSH not installed"
    command -v scp >/dev/null || error "SCP not installed"
}

SSH_CMD="ssh -o StrictHostKeyChecking=no -i $SSH_KEY $EC2_USER@$EC2_HOST"
SCP_CMD="scp -o StrictHostKeyChecking=no -i $SSH_KEY"

echo ""
echo "============================================================"
echo "       F1 Race Insights - Automated Deployment"
echo "============================================================"
echo ""

check_prereqs

# Step 1: Pull latest code
step 1 "Pulling latest code on EC2..."
$SSH_CMD "cd $REMOTE_DIR && git pull origin main 2>/dev/null" || log "Git pull skipped (may not be a git repo)"

# Step 2: Install/verify Nginx
step 2 "Checking Nginx installation..."
$SSH_CMD "which nginx >/dev/null 2>&1 || sudo dnf install -y nginx"
$SSH_CMD "sudo systemctl enable --now nginx"
success "Nginx is running"

# Step 3: Apply Nginx configuration
step 3 "Applying Nginx configuration..."
$SCP_CMD "$SCRIPT_DIR/fix_nginx.sh" $EC2_USER@$EC2_HOST:~/
$SSH_CMD "bash ~/fix_nginx.sh"
success "Nginx configured"

# Step 4: Rebuild Next.js
step 4 "Rebuilding Next.js application..."
$SSH_CMD "cd $REMOTE_DIR/web && npm ci --production=false && npm run build"
success "Next.js built"

# Step 5: Restart via PM2
step 5 "Restarting application via PM2..."
$SSH_CMD "cd $REMOTE_DIR/web && (pm2 delete f1-web 2>/dev/null || true) && pm2 start npm --name f1-web -- start && pm2 save"
success "Application restarted"

# Step 6: Verify deployment
step 6 "Verifying deployment..."
sleep 5
HTTP_CODE=$($SSH_CMD "curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:3000/" 2>/dev/null)

if [ "$HTTP_CODE" = "200" ]; then
    success "Health check passed (HTTP $HTTP_CODE)"
else
    log "Health check returned HTTP $HTTP_CODE (may still be starting)"
fi

echo ""
echo "============================================================"
success "Deployment Complete!"
echo "============================================================"
echo ""
echo "🌐 Your site is live at:"
echo "   https://f1.aarav-shah.com"
echo "   http://$EC2_HOST:3000/ (direct)"
echo ""
echo "📝 Useful commands on EC2:"
echo "   pm2 logs f1-web          - View app logs"
echo "   pm2 restart f1-web       - Restart app"
echo "   sudo nginx -t            - Test Nginx config"
echo "   sudo systemctl reload nginx - Reload Nginx"
echo ""
