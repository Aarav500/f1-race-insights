#!/bin/bash
#
# F1 Race Insights - Automated EC2 Deployment
# Run this on your local machine to deploy to EC2
#
# Usage: bash deploy_to_ec2.sh
#

set -e

# Configuration
EC2_HOST="34.204.193.47"
EC2_USER="ec2-user"
SSH_KEY="$HOME/Downloads/F1.pem"  # Update this path if needed
REMOTE_DIR="/opt/f1-race-insights"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log() { echo -e "${BLUE}[INFO]${NC} $1"; }
success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
error() { echo -e "${RED}[ERROR]${NC} $1"; exit 1; }

# Check SSH key exists
[ -f "$SSH_KEY" ] || error "SSH key not found: $SSH_KEY"

SSH_CMD="ssh -o StrictHostKeyChecking=no -i $SSH_KEY $EC2_USER@$EC2_HOST"
SCP_CMD="scp -o StrictHostKeyChecking=no -i $SSH_KEY"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "       F1 Race Insights - Automated EC2 Deployment"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Step 1: Pull latest code on EC2
log "Step 1: Pulling latest code on EC2..."
$SSH_CMD "cd $REMOTE_DIR && git pull" || log "Git pull skipped (may not be a git repo)"

# Step 2: Ensure Nginx is installed and running
log "Step 2: Checking Nginx..."
$SSH_CMD "which nginx >/dev/null 2>&1 || sudo dnf install -y nginx"
$SSH_CMD "sudo systemctl enable --now nginx"
success "Nginx is running"

# Step 3: Upload and apply Nginx config
log "Step 3: Updating Nginx configuration..."
$SCP_CMD deploy/nginx/conf.d/aarav-shah.conf $EC2_USER@$EC2_HOST:/tmp/
$SSH_CMD "sudo mv /tmp/aarav-shah.conf /etc/nginx/conf.d/"
$SSH_CMD "sudo nginx -t && sudo systemctl reload nginx"
success "Nginx configuration updated"

# Step 4: Rebuild Next.js (if needed)
log "Step 4: Rebuilding Next.js application..."
$SSH_CMD "cd $REMOTE_DIR/web && npm ci --production=false && npm run build"
success "Next.js rebuilt"

# Step 5: Restart PM2 or Node process
log "Step 5: Restarting application..."
$SSH_CMD "cd $REMOTE_DIR/web && (pm2 restart f1-web 2>/dev/null || pm2 start npm --name f1-web -- start)"
success "Application restarted"

# Step 6: Verify deployment
log "Step 6: Verifying deployment..."
sleep 3
if $SSH_CMD "curl -s -o /dev/null -w '%{http_code}' http://localhost:3000/" | grep -q "200"; then
    success "Application responding on port 3000"
else
    error "Application health check failed"
fi

if $SSH_CMD "curl -s -o /dev/null -w '%{http_code}' http://localhost/" | grep -q "200\|301\|302"; then
    success "Nginx proxy working"
else
    log "Nginx proxy check inconclusive"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
success "Deployment Complete!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🌐 Your site is live at:"
echo "   https://f1.aarav-shah.com"
echo "   http://$EC2_HOST/"
echo ""
