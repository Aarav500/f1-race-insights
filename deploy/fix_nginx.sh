#!/bin/bash
# Fix Nginx config - remove trailing slash from proxy_pass

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

    # Redirect root to app (without trailing slash)
    location = / {
        return 302 /f1-insights;
    }

    # Handle /f1-insights requests - NO TRAILING SLASH in proxy_pass
    location /f1-insights {
        proxy_pass http://127.0.0.1:3000;
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

sudo mv /tmp/aarav-shah.conf /etc/nginx/conf.d/aarav-shah.conf
sudo nginx -t && sudo systemctl reload nginx
echo "NGINX FIXED - No trailing slash"
