#!/usr/bin/env bash
#
# F1 Race Insights - GCE VM Startup Script
#
# This script is designed to run on Google Compute Engine VM startup.
# It ensures all dependencies are installed and deploys the application.
#
# Setup Instructions:
#   1. Create a GCE instance with this script as startup-script metadata:
#      gcloud compute instances create f1-insights \
#        --zone=us-central1-a \
#        --machine-type=e2-medium \
#        --metadata-from-file startup-script=ops/gce-startup.sh
#
#   2. Or add to existing instance:
#      gcloud compute instances add-metadata f1-insights \
#        --zone=us-central1-a \
#        --metadata-from-file startup-script=ops/gce-startup.sh
#
#   3. Or use startup-script-url for remote script:
#      gcloud compute instances create f1-insights \
#        --metadata startup-script-url=https://raw.githubusercontent.com/Aarav500/f1-race-insights/main/ops/gce-startup.sh
#
# The script will run automatically on:
#   - Initial VM creation
#   - VM restart/reboot
#
# Logs are written to: /var/log/startup-script.log (managed by GCE)
#
set -euo pipefail

# Configuration
REPO_URL="https://github.com/Aarav500/f1-race-insights"
REPO_DIR="/opt/f1-race-insights"
LOG="/var/log/gce-startup.log"

# Redirect output for debugging
exec > >(tee -a "$LOG") 2>&1

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "       F1 Race Insights - GCE Startup Script"
echo "       Timestamp: $(date -Is)"
echo "       Hostname: $(hostname)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check if this is first run or reboot
if [ -f "/var/lib/f1-insights-deployed" ]; then
    echo "[INFO] Application already deployed, re-running deployment..."
else
    echo "[INFO] First-time setup detected, installing dependencies..."
fi
echo ""

# Step 1: Install Git
echo "[STEP] Installing Git..."
if ! command -v git &> /dev/null; then
    apt-get update -qq
    apt-get install -y git
    echo "[SUCCESS] Git installed: $(git --version)"
else
    echo "[INFO] Git already installed: $(git --version)"
fi
echo ""

# Step 2: Install Docker
echo "[STEP] Installing Docker..."
if ! command -v docker &> /dev/null; then
    echo "[INFO] Docker not found, installing..."
    
    # Install prerequisites
    apt-get update -qq
    apt-get install -y \
        ca-certificates \
        curl \
        gnupg \
        lsb-release
    
    # Add Docker's official GPG key
    install -m 0755 -d /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    chmod a+r /etc/apt/keyrings/docker.gpg
    
    # Set up Docker repository
    echo \
      "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
      $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
    
    # Install Docker Engine
    apt-get update -qq
    apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
    
    echo "[SUCCESS] Docker installed: $(docker --version)"
else
    echo "[INFO] Docker already installed: $(docker --version)"
fi
echo ""

# Step 3: Enable and start Docker
echo "[STEP] Enabling and starting Docker service..."
systemctl enable docker
systemctl start docker
systemctl status docker --no-pager || true
echo ""

# Wait for Docker daemon to be ready
echo "[INFO] Waiting for Docker daemon to be ready..."
for i in {1..10}; do
    if docker info &> /dev/null; then
        echo "[SUCCESS] Docker daemon is running"
        break
    fi
    if [ $i -eq 10 ]; then
        echo "[ERROR] Docker daemon failed to start"
        exit 1
    fi
    echo "[INFO] Waiting for Docker... (attempt $i/10)"
    sleep 2
done
echo ""

# Step 4: Clone repository
echo "[STEP] Setting up application repository..."
if [ ! -d "$REPO_DIR/.git" ]; then
    echo "[INFO] Cloning repository to $REPO_DIR..."
    git clone "$REPO_URL" "$REPO_DIR"
    echo "[SUCCESS] Repository cloned"
else
    echo "[INFO] Repository already exists at $REPO_DIR"
fi
echo ""

# Step 5: Run deployment script
echo "[STEP] Running deployment script..."
DEPLOY_SCRIPT="$REPO_DIR/ops/deploy.sh"

if [ -f "$DEPLOY_SCRIPT" ]; then
    echo "[INFO] Executing: sudo bash $DEPLOY_SCRIPT --soft-clean"
    
    # Run deployment
    if bash "$DEPLOY_SCRIPT" --soft-clean; then
        echo "[SUCCESS] Deployment completed successfully"
        
        # Mark as deployed
        touch /var/lib/f1-insights-deployed
        echo "Deployed at $(date -Is)" >> /var/lib/f1-insights-deployed
    else
        echo "[ERROR] Deployment failed"
        exit 1
    fi
else
    echo "[ERROR] Deployment script not found at $DEPLOY_SCRIPT"
    echo "[INFO] Repository contents:"
    ls -la "$REPO_DIR/"
    exit 1
fi
echo ""

# Success
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "[SUCCESS] GCE Startup Script Completed Successfully"
echo "[INFO] Application is now running"
echo "[INFO] Full logs: $LOG"
echo "[INFO] GCE startup logs: /var/log/startup-script.log"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

exit 0
