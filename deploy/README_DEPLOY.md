# F1 Race Insights - Production Deployment Guide

## Overview

This guide covers deployment options for the F1 Race Insights API in production environments.

## Deployment Options

### Option 1: AWS ECS Fargate (Recommended for Production)

**Advantages**:
- Fully managed container orchestration
- Auto-scaling based on load
- No server management
- High availability across AZs
- Easy integration with AWS services (S3, RDS, CloudWatch)

**Architecture**:
```
Internet → ALB → ECS Fargate Tasks → RDS PostgreSQL
                                   → S3 (models/reports)
```

**Steps**:

1. **Build and push Docker image**:
```bash
# Build image
docker build -f docker/Dockerfile.api -t f1-api:latest .

# Tag for ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-1.amazonaws.com
docker tag f1-api:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/f1-api:latest

# Push to ECR
docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/f1-api:latest
```

2. **Create RDS PostgreSQL database**:
```bash
aws rds create-db-instance \
  --db-instance-identifier f1-db \
  --db-instance-class db.t3.micro \
  --engine postgres \
  --master-username f1admin \
  --master-user-password <CHANGE-ME> \
  --allocated-storage 20
```

3. **Create ECS Task Definition**:
- Use `deploy/ecs-task-definition.json` (TODO: create this file)
- Configure environment variables from `deploy/env.prod.example`
- Set secrets in AWS Secrets Manager

4. **Create ECS Service with ALB**:
- Target group: Port 8000
- Health check: `/health`
- Auto-scaling: CPU > 70% or Memory > 80%

5. **Configure DNS**:
- Point your domain to ALB
- Use AWS Certificate Manager for SSL

**Cost estimate**: ~$30-50/month (Fargate + RDS + ALB)

---

### Option 2: EC2 VM (Budget/Development)

**Advantages**:
- Lower cost for small workloads
- Full control over environment
- Simple deployment

**Architecture**:
```
Internet → Nginx (reverse proxy + SSL) → FastAPI (port 8000)
                                       → PostgreSQL (local)
```

**Steps**:

1. **Launch EC2 instance**:
   - OS: Ubuntu 22.04 LTS
   - Instance type: t3.small or larger
   - Security group: Allow 22 (SSH), 80 (HTTP), 443 (HTTPS)

2. **Install dependencies**:
```bash
# SSH into instance
ssh ubuntu@<VM-IP>

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker ubuntu

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

3. **Clone repository**:
```bash
git clone https://github.com/Aarav500/f1-race-insights.git
cd f1-race-insights

# Copy environment file
cp deploy/env.prod.example .env
# Edit .env with production values
nano .env
```

4. **Start services**:
```bash
docker-compose up -d
```

5. **Install and configure Nginx**:
```bash
sudo apt install nginx certbot python3-certbot-nginx -y
sudo cp deploy/nginx.conf /etc/nginx/sites-available/f1-api
sudo ln -s /etc/nginx/sites-available/f1-api /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

6. **Configure SSL with Let's Encrypt**:
```bash
sudo certbot --nginx -d yourdomain.com
```


7. **Setup Systemd Service for Auto-Start on Boot**:

The F1 Race Insights application can be configured to automatically start on system boot using systemd.

**Install the systemd service**:
```bash
# Copy the service file to systemd directory
sudo cp deploy/f1.service /etc/systemd/system/

# Reload systemd to recognize the new service
sudo systemctl daemon-reload

# Enable the service to start on boot
sudo systemctl enable f1.service

# Start the service now
sudo systemctl start f1.service

# Check service status
sudo systemctl status f1.service
```

**Service Management Commands**:
```bash
# Start the service
sudo systemctl start f1.service

# Stop the service
sudo systemctl stop f1.service

# Restart the service
sudo systemctl restart f1.service

# Reload (pull latest images and restart)
sudo systemctl reload f1.service

# Check status
sudo systemctl status f1.service

# View logs
sudo journalctl -u f1.service -f

# View recent logs
sudo journalctl -u f1.service -n 100

# Disable auto-start on boot
sudo systemctl disable f1.service
```

**What the service does**:
- Automatically starts Docker Compose services on system boot
- Ensures Docker is running before starting the application
- Gracefully stops services on shutdown
- Restarts services if they fail
- Logs all output to systemd journal
- Supports reload to pull and restart with latest images

**Verify auto-start**:
```bash
# Reboot the system
sudo reboot

# After reboot, check if services are running
docker compose -f /opt/f1-race-insights/deploy/docker-compose.prod.yml ps

# Check systemd service status
sudo systemctl status f1.service
```

**Service File Location**: `/etc/systemd/system/f1.service`

For more details, see the `deploy/f1.service` file.


**Cost estimate**: ~$10-15/month (t3.small EC2)

---

## Environment Configuration

Copy `deploy/env.prod.example` to `.env` and fill in:

```bash
# TODO: Update all values marked with <CHANGE-ME>
ENV=prod
DATABASE_URL=postgresql://user:pass@host:5432/db
S3_BUCKET=your-bucket-name
AWS_REGION=us-east-1
```

---

## Monitoring & Logging

### CloudWatch (ECS)
```bash
# Configure in task definition
"logConfiguration": {
  "logDriver": "awslogs",
  "options": {
    "awslogs-group": "/ecs/f1-api",
    "awslogs-region": "us-east-1",
    "awslogs-stream-prefix": "ecs"
  }
}
```

### Systemd Logs (VM)
```bash
journalctl -u f1-api -f
```

### Application Logs
```bash
# Inside container
docker exec -it f1-race-insights-api tail -f /var/log/api.log
```

---

## Health Checks

**API Health**:
```bash
curl https://yourdomain.com/health
# Expected: {"status": "ok"}
```

**Database connectivity**:
```bash
curl https://yourdomain.com/api/f1/predict/race/2024_01?model=xgb
```

---

## Scaling

### Horizontal Scaling (ECS)
- Configure auto-scaling policy
- Target: 2-5 tasks based on load

### Vertical Scaling (VM)
- Upgrade instance type (t3.small → t3.medium)

---

## Backup & Recovery

### Database Backups
```bash
# RDS: Enable automated backups (retention: 7-30 days)
# VM: Setup pg_dump cron job
0 2 * * * pg_dump -U f1user f1db > /backups/f1db_$(date +\%Y\%m\%d).sql
```

### Model Artifacts
- Store in S3 with versioning enabled
- Lifecycle policy: Archive to Glacier after 90 days

---

## Security Checklist

- [ ] Use environment variables for secrets (no hardcoded credentials)
- [ ] Enable SSL/TLS (HTTPS only)
- [ ] Restrict database security group to API security group only
- [ ] Use IAM roles (no access keys in code)
- [ ] Enable VPC flow logs
- [ ] Set up CloudWatch alarms for errors
- [ ] Regular security updates (EC2) or use Fargate
- [ ] Enable API rate limiting (via ALB or Nginx)

---

## Troubleshooting

### API won't start
```bash
# Check logs
docker logs f1-race-insights-api

# Check environment
docker exec f1-race-insights-api env | grep DATABASE_URL
```

### Database connection issues
```bash
# Test connection
psql -h <db-host> -U f1user -d f1db

# Check security groups (AWS)
```

### High memory usage
```bash
# Monitor resource usage
docker stats

# Scale up instance or increase task memory
```

---

## Rollback Procedure

### ECS Fargate
```bash
# Revert to previous task definition
aws ecs update-service --cluster f1-cluster --service f1-api --task-definition f1-api:PREVIOUS_REVISION
```

### VM
```bash
# Pull previous Docker image
docker pull <account-id>.dkr.ecr.us-east-1.amazonaws.com/f1-api:previous-tag
docker-compose down
docker-compose up -d
```

---

## Cost Optimization

1. **Use Spot instances** for batch jobs (backtesting)
2. **S3 lifecycle policies** to archive old reports
3. **RDS Reserved Instances** for 1-3 year commitment
4. **CloudWatch Logs retention** (7-14 days)
5. **Compress artifacts** before uploading to S3

---

## Support

For deployment issues, check:
- Application logs: `/var/log/api.log`
- System logs: `journalctl -xe`
- Docker logs: `docker logs <container>`
- AWS CloudWatch Logs (ECS)
