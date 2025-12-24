# GitHub Secrets for EC2 Deployment

This document lists all GitHub Secrets required for the EC2 deployment workflow (`.github/workflows/deploy-ec2.yml`).

## Required Secrets

### SSH Access Secrets

#### `EC2_SSH_KEY`
**Description**: Private SSH key for accessing the EC2 instance

**How to get**:
```bash
# If you already have an EC2 key pair
cat ~/.ssh/your-ec2-key.pem

# Or generate a new key pair
ssh-keygen -t rsa -b 4096 -C "github-actions" -f ~/.ssh/f1-deploy-key
# Add the public key to EC2: ~/.ssh/authorized_keys
```

**Value**: The entire private key including header and footer
```
-----BEGIN RSA PRIVATE KEY-----
MIIEpAIBAAKCAQEA...
...
-----END RSA PRIVATE KEY-----
```

#### `EC2_HOST`
**Description**: EC2 instance public IP or hostname

**Example**: `54.123.45.67` or `ec2-54-123-45-67.compute-1.amazonaws.com`

#### `EC2_USER`
**Description**: SSH username for EC2 instance

**Common values**:
- Amazon Linux 2: `ec2-user`
- Ubuntu: `ubuntu`
- Debian: `admin`

### Docker Registry Secrets

#### `DOCKER_REGISTRY`
**Description**: Docker registry URL for pulling images

**Value**: `ghcr.io/aarav500/f1-race-insights`

**Note**: This should match your GHCR organization/username and repository name.

### Application Configuration Secrets

#### `NEXT_PUBLIC_API_BASE_URL`
**Description**: Public URL for the API endpoint (accessible from browser)

**Example**: `https://api.your-domain.com` or `http://your-ec2-ip/api`

#### `DATABASE_URL`
**Description**: PostgreSQL database connection string

**Example**: `postgresql://f1user:STRONG_PASSWORD@your-rds-endpoint.us-east-1.rds.amazonaws.com:5432/f1db`

**For local EC2 PostgreSQL**: `postgresql://f1user:STRONG_PASSWORD@db:5432/f1db`

#### `S3_BUCKET`
**Description**: S3 bucket name for storing model artifacts and reports

**Example**: `f1-race-insights-prod`

#### `AWS_REGION`
**Description**: AWS region for S3 and other AWS services

**Example**: `us-east-1`

### Optional Secrets

#### `DOMAIN`
**Description**: Domain name for the application (for SSL/nginx configuration)

**Example**: `your-domain.com`

#### `LETSENCRYPT_EMAIL`
**Description**: Email for Let's Encrypt SSL certificate notifications

**Example**: `admin@your-domain.com`

## How to Add Secrets to GitHub

### Via GitHub UI

1. Go to your repository on GitHub
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Enter the **Name** (e.g., `EC2_SSH_KEY`)
5. Enter the **Secret** value
6. Click **Add secret**
7. Repeat for all secrets listed above

### Via GitHub CLI

```bash
# Install GitHub CLI if not already installed
# https://cli.github.com/

# Authenticate
gh auth login

# Add secrets
gh secret set EC2_SSH_KEY < ~/.ssh/your-ec2-key.pem
gh secret set EC2_HOST -b "54.123.45.67"
gh secret set EC2_USER -b "ec2-user"
gh secret set DOCKER_REGISTRY -b "ghcr.io/aarav500/f1-race-insights"
gh secret set NEXT_PUBLIC_API_BASE_URL -b "https://api.your-domain.com"
gh secret set DATABASE_URL -b "postgresql://user:pass@host:5432/db"
gh secret set S3_BUCKET -b "f1-race-insights-prod"
gh secret set AWS_REGION -b "us-east-1"
gh secret set DOMAIN -b "your-domain.com"
gh secret set LETSENCRYPT_EMAIL -b "admin@your-domain.com"
```

## Secrets Summary Table

| Secret Name | Required | Description | Example Value |
|-------------|----------|-------------|---------------|
| `EC2_SSH_KEY` | ✅ Yes | Private SSH key | `-----BEGIN RSA PRIVATE KEY-----...` |
| `EC2_HOST` | ✅ Yes | EC2 IP or hostname | `54.123.45.67` |
| `EC2_USER` | ✅ Yes | SSH username | `ec2-user` |
| `DOCKER_REGISTRY` | ✅ Yes | GHCR registry URL | `ghcr.io/aarav500/f1-race-insights` |
| `NEXT_PUBLIC_API_BASE_URL` | ✅ Yes | Public API URL | `https://api.your-domain.com` |
| `DATABASE_URL` | ✅ Yes | Database connection string | `postgresql://user:pass@host/db` |
| `S3_BUCKET` | ✅ Yes | S3 bucket name | `f1-race-insights-prod` |
| `AWS_REGION` | ✅ Yes | AWS region | `us-east-1` |
| `DOMAIN` | ⚪ Optional | Domain name | `your-domain.com` |
| `LETSENCRYPT_EMAIL` | ⚪ Optional | SSL notification email | `admin@your-domain.com` |

## Automatic Secrets (No Setup Required)

The following secrets are automatically available in GitHub Actions:

- **`GITHUB_TOKEN`** - Authentication token for GHCR and GitHub API
- **`github.actor`** - GitHub username of the user who triggered the workflow
- **`github.repository`** - Repository name in the format `owner/repo`

## Security Best Practices

### ✅ Do

- **Rotate secrets regularly** - Especially SSH keys and database passwords
- **Use least privilege** - EC2 user should only have necessary permissions
- **Use strong passwords** - For database and other credentials
- **Enable AWS IAM roles** - For EC2 instance instead of hardcoding AWS credentials
- **Restrict SSH access** - Use Security Groups to limit SSH to GitHub Actions IPs (if possible)
- **Use RDS for production** - Instead of Docker PostgreSQL

### ❌ Don't

- **Never commit secrets to git** - Even in `.env.example` files
- **Don't share SSH keys** - Each deployment method should have its own key
- **Don't use default passwords** - Always change from defaults
- **Don't store secrets in code** - Always use environment variables or secrets management

## Testing Secrets

To test if secrets are configured correctly:

1. Go to **Actions** → **Deploy to EC2**
2. Click **Run workflow**
3. Select branch `main`
4. Click **Run workflow**
5. Monitor the workflow run for any authentication errors

Common errors:
- `Permission denied (publickey)` - Check `EC2_SSH_KEY`, `EC2_USER`, or EC2 instance's authorized_keys
- `Could not resolve hostname` - Check `EC2_HOST`
- `Connection refused` - Check Security Group allows SSH (port 22) from GitHub Actions

## Updating Secrets

When updating secrets (e.g., rotating SSH keys):

1. Generate new credentials
2. Update on the target system (EC2, RDS, etc.)
3. Update the GitHub Secret with the new value
4. Test with a manual workflow run

## Removing Secrets

If you need to remove a secret:

### Via GitHub UI
1. Go to **Settings** → **Secrets and variables** → **Actions**
2. Find the secret
3. Click **Remove**

### Via GitHub CLI
```bash
gh secret remove SECRET_NAME
```

## Environment-Specific Secrets

For multiple environments (staging, production), consider:

1. **Using GitHub Environments**:
   - Create environments: `staging`, `production`
   - Add environment-specific secrets
   - Update workflow to use environments

2. **Using Secret Prefixes**:
   - `PROD_DATABASE_URL` for production
   - `STAGING_DATABASE_URL` for staging

## Troubleshooting

### Secret not updating

- GitHub may cache secrets briefly
- Try re-running the workflow after a few minutes
- Verify the secret name matches exactly (case-sensitive)

### SSH connection fails

```bash
# Test SSH locally first
ssh -i ~/.ssh/your-key.pem ec2-user@your-ec2-ip

# Check EC2 Security Group
# Allow inbound SSH (port 22) from GitHub Actions IPs
# Or allow from 0.0.0.0/0 (less secure)

# Verify public key is in EC2
ssh -i ~/.ssh/your-key.pem ec2-user@your-ec2-ip \
  "cat ~/.ssh/authorized_keys"
```

### Database connection fails

```bash
# Test database connection from EC2
ssh -i ~/.ssh/your-key.pem ec2-user@your-ec2-ip \
  "psql '$DATABASE_URL' -c 'SELECT 1'"
```

## Related Documentation

- [Deploy to EC2 Workflow](../.github/workflows/deploy-ec2.yml)
- [EC2 Deployment Script](./deploy/ec2_deploy.sh)
- [EC2 Bootstrap Script](./deploy/ec2_bootstrap.sh)
- [GitHub Secrets Documentation](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
