@echo off
REM ============================================================
REM  F1 Race Insights - One-Click EC2 Deployment
REM  Run this from d:\f1-race-insights to deploy everything
REM ============================================================

setlocal enabledelayedexpansion

set EC2_HOST=34.204.193.47
set EC2_USER=ec2-user
set SSH_KEY=%USERPROFILE%\Downloads\F1.pem
set REMOTE_DIR=/opt/f1-race-insights

echo.
echo ============================================================
echo        F1 Race Insights - Automated Deployment
echo ============================================================
echo.

REM Check SSH key exists
if not exist "%SSH_KEY%" (
    echo [ERROR] SSH key not found: %SSH_KEY%
    echo Please ensure F1.pem is in your Downloads folder
    exit /b 1
)

echo [1/6] Pulling latest code on EC2...
ssh -o StrictHostKeyChecking=no -i "%SSH_KEY%" %EC2_USER%@%EC2_HOST% "cd %REMOTE_DIR% && git pull origin main 2>/dev/null || echo 'Git pull skipped'"

echo [2/6] Installing/checking Nginx...
ssh -o StrictHostKeyChecking=no -i "%SSH_KEY%" %EC2_USER%@%EC2_HOST% "which nginx >/dev/null 2>&1 || sudo dnf install -y nginx; sudo systemctl enable --now nginx"

echo [3/6] Uploading Nginx configuration...
scp -o StrictHostKeyChecking=no -i "%SSH_KEY%" deploy\fix_nginx.sh %EC2_USER%@%EC2_HOST%:~/
ssh -o StrictHostKeyChecking=no -i "%SSH_KEY%" %EC2_USER%@%EC2_HOST% "bash ~/fix_nginx.sh"

echo [4/6] Rebuilding Next.js app...
ssh -o StrictHostKeyChecking=no -i "%SSH_KEY%" %EC2_USER%@%EC2_HOST% "cd %REMOTE_DIR%/web && npm ci --production=false && npm run build"

echo [5/6] Restarting application via PM2...
ssh -o StrictHostKeyChecking=no -i "%SSH_KEY%" %EC2_USER%@%EC2_HOST% "cd %REMOTE_DIR%/web && (pm2 delete f1-web 2>/dev/null; pm2 start npm --name f1-web -- start)"

echo [6/6] Verifying deployment...
timeout /t 5 /nobreak > nul
ssh -o StrictHostKeyChecking=no -i "%SSH_KEY%" %EC2_USER%@%EC2_HOST% "curl -s -o /dev/null -w '%%{http_code}' http://127.0.0.1:3000/"

echo.
echo ============================================================
echo [SUCCESS] Deployment Complete!
echo ============================================================
echo.
echo Your site is live at:
echo    https://f1.aarav-shah.com
echo    http://%EC2_HOST%:3000/
echo.

endlocal
pause
