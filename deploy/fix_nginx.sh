#!/bin/bash
# ============================================================
#  Nginx Configuration Script - Applied during deployment
#  Creates proper reverse proxy config with SSL
# ============================================================

cat > /tmp/aarav-shah.conf << 'EOF'
server {
    listen 80;
    server_name aarav-shah.com www.aarav-shah.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl;
    server_name aarav-shah.com www.aarav-shah.com;

    ssl_certificate /etc/letsencrypt/live/aarav-shah.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/aarav-shah.com/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    # Redirect root to app
    location = / {
        return 302 /f1-insights;
    }

    # F1 Race Insights - Next.js app
    location /f1-insights {
        proxy_pass http://127.0.0.1:3000;
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

    # API backend
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

sudo mv /tmp/aarav-shah.conf /etc/nginx/conf.d/aarav-shah.conf

# Test and reload
if sudo nginx -t; then
    sudo systemctl reload nginx
    echo "✅ Nginx configuration applied successfully"
else
    echo "❌ Nginx configuration test failed!"
    exit 1
fi
