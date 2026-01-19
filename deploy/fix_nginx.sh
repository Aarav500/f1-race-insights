#!/bin/bash
# ============================================================
#  Nginx Configuration Script - Applied during deployment
#  Creates configurations for both aarav-shah.com and f1.aarav-shah.com
# ============================================================

# Create config for f1.aarav-shah.com (primary subdomain for the app)
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
        
        # Timeouts
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

# Create config for aarav-shah.com (redirects to f1.aarav-shah.com)
cat > /tmp/aarav-shah.conf << 'EOF'
server {
    listen 80;
    server_name aarav-shah.com www.aarav-shah.com;

    # Redirect F1 app requests to the subdomain
    location / {
        root /usr/share/nginx/html;
        index index.html;
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
sudo mv /tmp/aarav-shah.conf /etc/nginx/conf.d/aarav-shah.conf

# Test and reload
if sudo nginx -t; then
    sudo systemctl reload nginx
    echo "✅ Nginx configuration applied successfully"
    echo "   - f1.aarav-shah.com → Next.js app at /"
    echo "   - aarav-shah.com → Static site + API proxy"
else
    echo "❌ Nginx configuration test failed!"
    exit 1
fi
