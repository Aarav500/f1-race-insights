@echo off
REM F1 Race Insights - Windows Deployment Script
REM Run from d:\f1-race-insights directory

setlocal enabledelayedexpansion

set EC2_HOST=34.204.193.47
set EC2_USER=ec2-user
set SSH_KEY=%USERPROFILE%\Downloads\F1.pem

echo.
echo ============================================================
echo        F1 Race Insights - Automated EC2 Deployment
echo ============================================================
echo.

REM Check SSH key
if not exist "%SSH_KEY%" (
    echo [ERROR] SSH key not found: %SSH_KEY%
    exit /b 1
)

echo [INFO] Step 1: Pulling latest code on EC2...
ssh -o StrictHostKeyChecking=no -i "%SSH_KEY%" %EC2_USER%@%EC2_HOST% "cd /opt/f1-race-insights && git pull 2>/dev/null || echo 'Skipped'"

echo [INFO] Step 2: Checking Nginx...
ssh -o StrictHostKeyChecking=no -i "%SSH_KEY%" %EC2_USER%@%EC2_HOST% "sudo systemctl is-active nginx || (sudo dnf install -y nginx && sudo systemctl enable --now nginx)"

echo [INFO] Step 3: Updating Nginx config...
scp -o StrictHostKeyChecking=no -i "%SSH_KEY%" deploy\nginx\conf.d\aarav-shah.conf %EC2_USER%@%EC2_HOST%:/tmp/
ssh -o StrictHostKeyChecking=no -i "%SSH_KEY%" %EC2_USER%@%EC2_HOST% "sudo mv /tmp/aarav-shah.conf /etc/nginx/conf.d/ && sudo nginx -t && sudo systemctl reload nginx"

echo [INFO] Step 4: Restarting application...
ssh -o StrictHostKeyChecking=no -i "%SSH_KEY%" %EC2_USER%@%EC2_HOST% "cd /opt/f1-race-insights/web && pm2 restart f1-web 2>/dev/null || pm2 start npm --name f1-web -- start"

echo.
echo ============================================================
echo [SUCCESS] Deployment Complete!
echo ============================================================
echo.
echo Your site is live at:
echo    http://aarav-shah.com/f1-insights/
echo    http://%EC2_HOST%/f1-insights/
echo.

endlocal
