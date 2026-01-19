#!/bin/bash
# ============================================================
# F1 Race Insights - Update Deployment for f1.aarav-shah.com
# Run this on EC2 after SSH'ing in
# ============================================================

set -e

echo "============================================================"
echo "       F1 Race Insights - Server Update"
echo "============================================================"
echo ""

# Step 1: Pull latest code
echo "[1/5] Pulling latest code from GitHub..."
cd /opt/f1-race-insights
git fetch origin
git reset --hard origin/main
echo "✅ Code updated"

# Step 2: Install dependencies and rebuild Next.js
echo ""
echo "[2/5] Rebuilding Next.js application..."
cd /opt/f1-race-insights/web
npm ci --production=false
npm run build
echo "✅ Next.js rebuilt"

# Step 3: Deploy new nginx config for f1.aarav-shah.com
echo ""
echo "[3/5] Updating Nginx configuration..."
cat > /tmp/f1.aarav-shah.conf << 'EOF'
server {
    listen 80;
    server_name f1.aarav-shah.com;

    location / {
        proxy_pass http://127.0.0.1:3000/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:8000/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

sudo mv /tmp/f1.aarav-shah.conf /etc/nginx/conf.d/f1.aarav-shah.conf

# Remove old redirects if any
sudo rm -f /etc/nginx/conf.d/aarav-shah.conf 2>/dev/null || true

# Test and reload nginx
if sudo nginx -t; then
    sudo systemctl reload nginx
    echo "✅ Nginx updated"
else
    echo "❌ Nginx config test failed!"
    exit 1
fi

# Step 4: Restart PM2
echo ""
echo "[4/5] Restarting application..."
cd /opt/f1-race-insights/web
pm2 delete f1-web 2>/dev/null || true
pm2 start npm --name f1-web -- start
pm2 save
echo "✅ Application restarted"

# Step 5: Verify
echo ""
echo "[5/5] Verifying deployment..."
sleep 3
HTTP_CODE=$(curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:3000/)
if [ "$HTTP_CODE" = "200" ]; then
    echo "✅ Health check passed (HTTP $HTTP_CODE)"
else
    echo "⚠️  Health check returned HTTP $HTTP_CODE"
fi

echo ""
echo "============================================================"
echo "✅ Deployment Complete!"
echo "============================================================"
echo ""
echo "🌐 Your site is live at:"
echo "   http://f1.aarav-shah.com (HTTP)"
echo ""
echo "📝 To enable HTTPS, run:"
echo "   sudo certbot --nginx -d f1.aarav-shah.com"
echo ""
echo "🔍 Useful commands:"
echo "   pm2 logs f1-web          - View app logs"
echo "   pm2 restart f1-web       - Restart app"
echo "   sudo nginx -t            - Test Nginx config"
echo ""
