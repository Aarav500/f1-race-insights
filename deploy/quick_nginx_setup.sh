#!/bin/bash
# Quick Nginx config setup for f1.aarav-shah.com

# Create the config file for f1 subdomain
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
    }

    location /api/ {
        proxy_pass http://127.0.0.1:8000/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
EOF

# Move to nginx config and reload
sudo mv /tmp/f1.aarav-shah.conf /etc/nginx/conf.d/
sudo nginx -t && sudo systemctl reload nginx
echo "DONE - Nginx configured for f1.aarav-shah.com"
