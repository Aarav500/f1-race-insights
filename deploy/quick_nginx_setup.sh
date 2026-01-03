#!/bin/bash
# Quick Nginx config setup

# Create the config file
cat > /tmp/aarav-shah.conf << 'EOF'
server {
    listen 80;
    server_name aarav-shah.com www.aarav-shah.com;

    location / {
        root /usr/share/nginx/html;
        index index.html;
    }

    location /f1-insights/ {
        proxy_pass http://127.0.0.1:3000/f1-insights/;
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
sudo mv /tmp/aarav-shah.conf /etc/nginx/conf.d/
sudo nginx -t && sudo systemctl reload nginx
echo "DONE - Nginx configured"
