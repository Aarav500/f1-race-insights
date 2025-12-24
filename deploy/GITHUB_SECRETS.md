# GitHub Secrets for EC2 Deployment

This document lists all required GitHub Secrets for the EC2 deployment workflow (`.github/workflows/deploy-ec2.yml`).

## Required Secrets

### 1. EC2 SSH Access

#### `EC2_HOST`
**Description**: Public IP address or hostname of your EC2 instance

**How to get**:
1. Go to AWS Console → EC2 → Instances
2. Select your instance
3. Copy the "Public IPv4 address" or "Public IPv4 DNS"

**Example values**:
- IP: `54.123.45.67`
- DNS: `ec2-54-123-45-67.compute-1.amazonaws.com`

**How to set**:
```bash
# Via GitHub UI
Settings → Secrets and variables → Actions → New repository secret
Name: EC2_HOST
Secret: 54.123.45.67

# Via GitHub CLI
gh secret set EC2_HOST -b "54.123.45.67"
```

---

#### `EC2_USER`
**Description**: SSH username for connecting to the EC2 instance

**Common values by OS**:
- Amazon Linux 2 / Amazon Linux 2023: `ec2-user`
- Ubuntu: `ubuntu`
- Debian: `admin`
- RHEL: `ec2-user`

**How to set**:
```bash
# Via GitHub UI
Settings → Secrets and variables → Actions → New repository secret
Name: EC2_USER
Secret: ec2-user

# Via GitHub CLI
gh secret set EC2_USER -b "ec2-user"
```

---

#### `EC2_SSH_KEY`
**Description**: Private SSH key (PEM format) for authenticating to EC2

**How to get**:
```bash
# If you have the .pem file from EC2
cat ~/.ssh/your-ec2-key.pem

# Or generate a new key pair
ssh-keygen -t rsa -b 4096 -C "github-actions-deploy" -f ~/.ssh/f1-deploy-key -N ""
# Then add the public key to EC2: ~/.ssh/authorized_keys
```

**Format**: Include the entire key with headers and footers
```
-----BEGIN RSA PRIVATE KEY-----
MIIEpAIBAAKCAQEA1234567890abcdef...
...multiple lines...
...
-----END RSA PRIVATE KEY-----
```

**How to set**:
```bash
# Via GitHub UI
Settings → Secrets and variables → Actions → New repository secret
Name: EC2_SSH_KEY
Secret: [paste entire private key including -----BEGIN and -----END lines]

# Via GitHub CLI
gh secret set EC2_SSH_KEY < ~/.ssh/your-ec2-key.pem
```

**Security**: This key grants SSH access to your EC2 instance. Treat it as highly sensitive.

---

### 2. Docker Registry

#### `DOCKER_REGISTRY`
**Description**: GitHub Container Registry URL for your images

**Format**: `ghcr.io/{owner}/{repo}`

**How to get**: Replace with your GitHub username/organization and repository name

**Example**: `ghcr.io/aarav500/f1-race-insights`

**How to set**:
```bash
# Via GitHub UI
Settings → Secrets and variables → Actions → New repository secret
Name: DOCKER_REGISTRY
Secret: ghcr.io/aarav500/f1-race-insights

# Via GitHub CLI
gh secret set DOCKER_REGISTRY -b "ghcr.io/aarav500/f1-race-insights"
```

---

### 3. Application Configuration

You have **TWO OPTIONS** for providing environment variables:

#### **Option A: Individual Secrets (Recommended)**

Set each environment variable as a separate GitHub Secret:

##### `NEXT_PUBLIC_API_BASE_URL`
**Description**: Public URL for the API (accessible from browser)

**Example**: `https://api.your-domain.com` or `http://your-ec2-ip/api`

```bash
gh secret set NEXT_PUBLIC_API_BASE_URL -b "https://api.your-domain.com"
```

##### `DATABASE_URL`
**Description**: PostgreSQL connection string

**Format**: `postgresql://username:password@host:port/database`

**Example**: `postgresql://f1user:SecurePass123@your-rds.us-east-1.rds.amazonaws.com:5432/f1db`

```bash
gh secret set DATABASE_URL -b "postgresql://user:pass@host:5432/db"
```

##### `S3_BUCKET`
**Description**: S3 bucket name for model artifacts and reports

**Example**: `f1-race-insights-prod`

```bash
gh secret set S3_BUCKET -b "f1-race-insights-prod"
```

##### `AWS_REGION`
**Description**: AWS region for S3 and other services

**Example**: `us-east-1`

```bash
gh secret set AWS_REGION -b "us-east-1"
```

##### `DOMAIN` (Optional)
**Description**: Domain name for SSL/nginx configuration

**Example**: `your-domain.com`

```bash
gh secret set DOMAIN -b "your-domain.com"
```

##### `LETSENCRYPT_EMAIL` (Optional)
**Description**: Email for Let's Encrypt SSL certificate notifications

**Example**: `admin@your-domain.com`

```bash
gh secret set LETSENCRYPT_EMAIL -b "admin@your-domain.com"
```

---

#### **Option B: Base64 Encoded .env.prod (Alternative)**

If you prefer to manage all environment variables in a single file:

##### `PROD_ENV_FILE_B64`
**Description**: Base64-encoded version of your entire `.env.prod` file

**How to create**:
```bash
# 1. Create/edit your .env.prod file with all variables
cat > deploy/.env.prod << EOF
DOCKER_REGISTRY=ghcr.io/aarav500/f1-race-insights
API_IMAGE_TAG=latest
WEB_IMAGE_TAG=latest
ENV=production
API_HOST=0.0.0.0
API_PORT=8000
LOG_LEVEL=info
NEXT_PUBLIC_API_BASE_URL=https://api.your-domain.com
DATABASE_URL=postgresql://user:pass@host:5432/db
S3_BUCKET=f1-race-insights-prod
AWS_REGION=us-east-1
DATA_DIR=/app/data
CACHE_DIR=/app/data/cache
MODEL_DIR=/app/models
REPORTS_DIR=/app/reports
FASTF1_CACHE_DIR=/app/data/fastf1_cache
RANDOM_SEED=42
N_JOBS=-1
DOMAIN=your-domain.com
LETSENCRYPT_EMAIL=admin@your-domain.com
EOF

# 2. Base64 encode it
cat deploy/.env.prod | base64 -w 0 > /tmp/env_b64.txt
# On macOS: cat deploy/.env.prod | base64 > /tmp/env_b64.txt

# 3. Set the secret
gh secret set PROD_ENV_FILE_B64 < /tmp/env_b64.txt

# 4. Clean up
rm /tmp/env_b64.txt
```

**Note**: If using this option, you'll need to modify the workflow to decode and use this secret instead of individual variables.

---

### 4. GitHub Container Registry Access

#### `GITHUB_TOKEN` (Automatic - No Setup Required)
**Description**: GitHub automatically provides this token for workflows

**Permissions**: Used to authenticate to GitHub Container Registry (GHCR)

**Setup**: None required - automatically available in all workflows

**Important**: Ensure your repository workflow permissions are set correctly:
1. Go to **Settings** → **Actions** → **General**
2. Scroll to **Workflow permissions**
3. Select **"Read and write permissions"**
4. Save

---

#### `GHCR_PAT` (Optional - Only if GITHUB_TOKEN doesn't work)
**Description**: Personal Access Token for GHCR (only needed if you encounter permission issues)

**When to use**: 
- If pulling images fails with `GITHUB_TOKEN`
- If you need cross-repository image access
- If you encounter "permission denied" errors

**How to create**:
1. Go to GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Click "Generate new token (classic)"
3. Select scopes:
   - `read:packages` - Download packages
   - `write:packages` - Upload packages (if pushing)
   - `delete:packages` - Delete packages (if needed)
4. Generate and copy the token

**How to set**:
```bash
gh secret set GHCR_PAT -b "ghp_your_token_here"
```

**Note**: Most users won't need this - `GITHUB_TOKEN` with proper permissions is sufficient.

---

## Quick Setup Checklist

Use this checklist to ensure all secrets are configured:

### Minimal Required (EC2 Deployment)
- [ ] `EC2_HOST` - EC2 public IP or hostname
- [ ] `EC2_USER` - SSH username (e.g., `ec2-user`)
- [ ] `EC2_SSH_KEY` - Private SSH key (PEM format)
- [ ] `DOCKER_REGISTRY` - GHCR URL (e.g., `ghcr.io/aarav500/f1-race-insights`)
- [ ] `NEXT_PUBLIC_API_BASE_URL` - Public API URL
- [ ] `DATABASE_URL` - PostgreSQL connection string
- [ ] `S3_BUCKET` - S3 bucket name
- [ ] `AWS_REGION` - AWS region

### Optional
- [ ] `DOMAIN` - Domain name for SSL
- [ ] `LETSENCRYPT_EMAIL` - Email for SSL notifications
- [ ] `GHCR_PAT` - Personal Access Token (only if needed)
- [ ] `PROD_ENV_FILE_B64` - Base64 .env.prod (if using Option B)

### Automatically Available
- [x] `GITHUB_TOKEN` - Automatically provided by GitHub

---

## Setting All Secrets at Once

Here's a complete script to set all required secrets via GitHub CLI:

```bash
#!/bin/bash
# Set all GitHub Secrets for F1 Race Insights EC2 Deployment

# EC2 Access
gh secret set EC2_HOST -b "YOUR_EC2_IP_HERE"
gh secret set EC2_USER -b "ec2-user"
gh secret set EC2_SSH_KEY < ~/.ssh/your-ec2-key.pem

# Docker Registry
gh secret set DOCKER_REGISTRY -b "ghcr.io/YOUR_USERNAME/f1-race-insights"

# Application Configuration
gh secret set NEXT_PUBLIC_API_BASE_URL -b "https://api.your-domain.com"
gh secret set DATABASE_URL -b "postgresql://user:pass@host:5432/db"
gh secret set S3_BUCKET -b "f1-race-insights-prod"
gh secret set AWS_REGION -b "us-east-1"

# Optional
gh secret set DOMAIN -b "your-domain.com"
gh secret set LETSENCRYPT_EMAIL -b "admin@your-domain.com"

echo "All secrets set successfully!"
```

**Save this as `scripts/set-github-secrets.sh` and update with your values**

---

## Verifying Secrets

After setting secrets, verify they're configured:

### Via GitHub UI
1. Go to **Settings** → **Secrets and variables** → **Actions**
2. You should see all secrets listed (values are hidden)
3. Updated timestamp shows when last modified

### Via GitHub CLI
```bash
# List all secrets
gh secret list

# Expected output:
# EC2_HOST               Updated 2024-01-15
# EC2_USER               Updated 2024-01-15
# EC2_SSH_KEY            Updated 2024-01-15
# DATABASE_URL           Updated 2024-01-15
# ...
```

### Test Deployment
1. Go to **Actions** → **Deploy to EC2**
2. Click **Run workflow**
3. Select branch `main`
4. Click **Run workflow**
5. Monitor for any authentication errors

---

## Troubleshooting

### SSH Connection Fails
**Error**: `Permission denied (publickey)`

**Solutions**:
1. Verify `EC2_SSH_KEY` contains the complete private key including headers
2. Check `EC2_USER` matches the EC2 AMI default user
3. Ensure the public key is in EC2's `~/.ssh/authorized_keys`
4. Check EC2 Security Group allows SSH (port 22) from GitHub Actions IPs

### GHCR Login Fails
**Error**: `denied: permission_denied`

**Solutions**:
1. Verify workflow permissions: Settings → Actions → General → "Read and write permissions"
2. Try using `GHCR_PAT` instead of `GITHUB_TOKEN`
3. Check repository visibility matches package visibility

### Deployment Script Fails
**Error**: Various application errors

**Solutions**:
1. Check all application secrets are set (`DATABASE_URL`, `S3_BUCKET`, etc.)
2. Verify secret values are correct (no typos, quotes, or extra spaces)
3. Review deployment logs in GitHub Actions
4. SSH into EC2 and check: `cat /opt/f1-race-insights/deploy/.env.prod`

---

## Security Best Practices

### ✅ Do
- **Rotate secrets regularly** (every 90 days minimum)
- **Use strong, unique passwords** for DATABASE_URL
- **Limit SSH key permissions** to deployment only
- **Use AWS IAM roles** on EC2 instead of hardcoded credentials
- **Enable AWS CloudTrail** for audit logging
- **Review Security Groups** regularly

### ❌ Don't
- **Never commit secrets** to git (even in .env.example)
- **Don't share secrets** via Slack, email, or other channels
- **Don't reuse SSH keys** across environments
- **Don't use default passwords** for databases
- **Don't log secrets** in application code or workflows

---

## Related Documentation

- [EC2 Deployment Workflow](../.github/workflows/deploy-ec2.yml)
- [EC2 Deploy Script](./ec2_deploy.sh)
- [EC2 Bootstrap Script](./ec2_bootstrap.sh)
- [GHCR Setup Guide](../docs/GHCR_SETUP.md)
- [GitHub Secrets Documentation](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
