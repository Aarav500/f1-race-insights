# Docker Production Deployment Guide (EC2)

This guide explains how to deploy the F1 Race Insights application to EC2 using Docker Compose with pre-built images.

## 📋 Overview

The production deployment uses:
- **Pre-built Docker images** from a container registry (AWS ECR, Docker Hub, etc.)
- **Nginx reverse proxy** for SSL/TLS termination and routing
- **Docker Compose** for orchestration
- **Persistent volumes** for data storage

## 🏗️ Architecture

```
┌─────────────────────────────────────────────┐
│              Internet (HTTPS)               │
└──────────────────┬──────────────────────────┘
                   │
         ┌─────────▼──────────┐
         │  Nginx (Port 443)  │
         │  Reverse Proxy     │
         └─────────┬──────────┘
                   │
       ┌───────────┴───────────┐
       │                       │
┌──────▼───────┐     ┌────────▼────────┐
│  API Service │     │  Web Service    │
│  (Port 8000) │     │  (Port 3000)    │
│  FastAPI     │────▶│  Next.js        │
└──────┬───────┘     └─────────────────┘
       │
       │ (Optional)
┌──────▼───────┐
│  PostgreSQL  │
│  (Use RDS)   │
└──────────────┘
```

## 📦 Services

### 1. Nginx Reverse Proxy
- **Purpose**: SSL/TLS termination, routing, load balancing
- **Ports**: 80 (HTTP → HTTPS redirect), 443 (HTTPS)
- **Configuration**: 
  - Main config: `nginx/nginx.conf`
  - Site config: `nginx/conf.d/f1-insights.conf`

### 2. API Service (FastAPI)
- **Image**: `${DOCKER_REGISTRY}/f1-api:${API_IMAGE_TAG}`
- **Port**: 8000 (internal only, exposed via nginx)
- **Volumes**: 
  - `fastf1-cache` - FastF1 data cache
  - `data-cache` - Application cache
  - `reports` - Generated reports
  - `models` - ML models

### 3. Web Service (Next.js)
- **Image**: `${DOCKER_REGISTRY}/f1-web:${WEB_IMAGE_TAG}`
- **Port**: 3000 (internal only, exposed via nginx)
- **Dependencies**: API service

### 4. Database (Optional)
- **Recommended**: Use managed service (AWS RDS)
- **Alternative**: PostgreSQL 15 in Docker (see commented section)

## 🚀 Deployment Steps

### Prerequisites

1. **EC2 Instance** with Docker and Docker Compose installed
2. **Container Registry** (AWS ECR recommended)
3. **Domain Name** configured with DNS pointing to EC2
4. **SSL Certificate** (Let's Encrypt recommended)

### Step 1: Build and Push Images

On your local machine or CI/CD:

```bash
# Login to ECR (if using AWS ECR)
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 123456789012.dkr.ecr.us-east-1.amazonaws.com

# Build images
docker build -f docker/Dockerfile.api -t f1-api:latest .
docker build -f docker/Dockerfile.web -t f1-web:latest .

# Tag images
docker tag f1-api:latest 123456789012.dkr.ecr.us-east-1.amazonaws.com/f1-api:latest
docker tag f1-web:latest 123456789012.dkr.ecr.us-east-1.amazonaws.com/f1-web:latest

# Push images
docker push 123456789012.dkr.ecr.us-east-1.amazonaws.com/f1-api:latest
docker push 123456789012.dkr.ecr.us-east-1.amazonaws.com/f1-web:latest
```

### Step 2: Configure EC2 Instance

SSH into your EC2 instance:

```bash
ssh -i your-key.pem ec2-user@your-ec2-ip
```

Install Docker and Docker Compose:

```bash
# Install Docker
sudo yum update -y
sudo yum install docker -y
sudo service docker start
sudo usermod -a -G docker ec2-user

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

### Step 3: Setup Application Files

```bash
# Create deployment directory
mkdir -p ~/f1-race-insights/deploy
cd ~/f1-race-insights/deploy

# Create necessary directories
mkdir -p nginx/conf.d certbot/conf certbot/www
```

Upload the following files to the deploy directory:
- `docker-compose.prod.yml`
- `.env.prod` (with actual credentials)
- `nginx/nginx.conf`
- `nginx/conf.d/f1-insights.conf`

### Step 4: Configure Environment

Edit `.env.prod` with your actual values:

```bash
vi .env.prod
```

Replace placeholder values:
- `DOCKER_REGISTRY` - Your ECR/Docker Hub registry URL
- `DATABASE_URL` - Your RDS connection string
- `S3_BUCKET` - Your S3 bucket name
- `DOMAIN` - Your domain name
- `LETSENCRYPT_EMAIL` - Your email for SSL certificates

### Step 5: Obtain SSL Certificate (Let's Encrypt)

```bash
# Install certbot
sudo yum install certbot -y

# Obtain certificate (interactive)
sudo certbot certonly --standalone -d your-domain.com -d www.your-domain.com --email your@email.com --agree-tos

# Copy certificates to deploy directory
sudo cp -r /etc/letsencrypt ~/f1-race-insights/deploy/certbot/conf/
sudo chown -R ec2-user:ec2-user ~/f1-race-insights/deploy/certbot/
```

Update `nginx/conf.d/f1-insights.conf` with your domain name.

### Step 6: Start Services

```bash
# Login to container registry (if using ECR)
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 123456789012.dkr.ecr.us-east-1.amazonaws.com

# Pull latest images
docker-compose -f docker-compose.prod.yml pull

# Start services
docker-compose -f docker-compose.prod.yml up -d

# Check status
docker-compose -f docker-compose.prod.yml ps

# View logs
docker-compose -f docker-compose.prod.yml logs -f
```

### Step 7: Verify Deployment

```bash
# Check health endpoints
curl http://localhost/health
curl http://localhost/api/health

# Check from browser
# Visit https://your-domain.com
```

## 🔧 Maintenance

### View Logs

```bash
# All services
docker-compose -f docker-compose.prod.yml logs -f

# Specific service
docker-compose -f docker-compose.prod.yml logs -f api
docker-compose -f docker-compose.prod.yml logs -f web
docker-compose -f docker-compose.prod.yml logs -f nginx
```

### Update Application

```bash
# Pull latest images
docker-compose -f docker-compose.prod.yml pull

# Restart services (zero-downtime)
docker-compose -f docker-compose.prod.yml up -d

# Or restart specific service
docker-compose -f docker-compose.prod.yml up -d api
```

### Backup Data

```bash
# Backup volumes
docker run --rm -v f1-reports-prod:/data -v $(pwd):/backup alpine tar czf /backup/reports-backup.tar.gz -C /data .
docker run --rm -v f1-models-prod:/data -v $(pwd):/backup alpine tar czf /backup/models-backup.tar.gz -C /data .
docker run --rm -v f1-data-cache-prod:/data -v $(pwd):/backup alpine tar czf /backup/cache-backup.tar.gz -C /data .
```

### Renew SSL Certificate

```bash
# Certbot auto-renewal (add to crontab)
0 0 * * * certbot renew --quiet && docker-compose -f ~/f1-race-insights/deploy/docker-compose.prod.yml restart nginx
```

## 🔒 Security Best Practices

1. **Never commit `.env.prod` with real credentials** to version control
2. **Use AWS IAM roles** for EC2 instance to access S3 and RDS (don't hardcode credentials)
3. **Enable RDS encryption** at rest
4. **Use Security Groups** to restrict access:
   - Allow only 80/443 from internet
   - Allow 5432 (PostgreSQL) only from API security group
5. **Regular updates**: Keep Docker images and system packages updated
6. **Enable CloudWatch** logs for monitoring
7. **Use AWS Secrets Manager** for sensitive credentials

## 📊 Monitoring

### Health Checks

All services have health checks configured:
- API: `GET /health`
- Web: `GET /` (Next.js)
- Nginx: `nginx -t`

### Resource Limits

Production resource limits are configured:

- **API**: 2 CPU cores, 4GB RAM
- **Web**: 1 CPU core, 1GB RAM

Adjust in `docker-compose.prod.yml` based on your instance size.

## 🐛 Troubleshooting

### Service won't start

```bash
# Check logs
docker-compose -f docker-compose.prod.yml logs api

# Check container status
docker ps -a

# Restart specific service
docker-compose -f docker-compose.prod.yml restart api
```

### Can't connect to database

```bash
# Test database connection
docker-compose -f docker-compose.prod.yml exec api python -c "from f1.config import settings; print(settings.database_url)"

# Check network connectivity
docker-compose -f docker-compose.prod.yml exec api ping db
```

### SSL certificate issues

```bash
# Test nginx configuration
docker-compose -f docker-compose.prod.yml exec nginx nginx -t

# Check certificate expiry
openssl x509 -in certbot/conf/live/your-domain.com/fullchain.pem -noout -dates
```

## 📝 Notes

- This configuration uses **pre-built images** from a container registry
- Source code is **not mounted** in production (unlike development)
- For production database, use **AWS RDS** instead of Docker PostgreSQL
- Configure **automated backups** for persistent volumes
- Use **AWS Application Load Balancer** for advanced load balancing needs
- Consider **AWS ECS** or **EKS** for larger-scale deployments

## 🔗 Related Documentation

- [GitHub Secrets Configuration](./GITHUB_SECRETS.md)
- [General Deployment Guide](./README_DEPLOY.md)
- [Main README](../README.md)
