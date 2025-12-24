# GitHub Container Registry (GHCR) Setup

This document explains how to set up and use GitHub Container Registry (GHCR) for the F1 Race Insights project.

## Overview

The `publish-images.yml` workflow automatically builds and publishes Docker images to GHCR when code is pushed to the `main` branch.

## Published Images

The workflow publishes two images:

1. **API Image**: `ghcr.io/aarav500/f1-race-insights/api`
2. **Web Image**: `ghcr.io/aarav500/f1-race-insights/web`

## Image Tags

Each image is tagged with:
- **`latest`** - Always points to the most recent build from `main`
- **`main-{short-sha}`** - Branch name + short commit SHA (e.g., `main-abc1234`)

Example:
```
ghcr.io/aarav500/f1-race-insights/api:latest
ghcr.io/aarav500/f1-race-insights/api:main-abc1234
ghcr.io/aarav500/f1-race-insights/web:latest
ghcr.io/aarav500/f1-race-insights/web:main-def5678
```

## Required GitHub Permissions

### Workflow Permissions

The workflow requires the following permissions (already configured in the workflow file):

```yaml
permissions:
  contents: read    # Read repository contents
  packages: write   # Write to GitHub Packages (GHCR)
```

These permissions are automatically granted when the workflow runs with `GITHUB_TOKEN`.

### Repository Settings

**Enable Package Creation** (if not already enabled):

1. Go to your repository on GitHub
2. Navigate to **Settings** → **Actions** → **General**
3. Scroll to **Workflow permissions**
4. Ensure **"Read and write permissions"** is selected
5. Check **"Allow GitHub Actions to create and approve pull requests"** (optional)
6. Click **Save**

### Package Visibility

After the first image is published, you may want to configure visibility:

1. Go to your GitHub profile → **Packages**
2. Find `f1-race-insights/api` and `f1-race-insights/web`
3. Click on each package
4. Go to **Package settings**
5. Choose visibility:
   - **Private** - Only accessible to repository collaborators
   - **Public** - Publicly accessible (recommended for open source)

## Using Published Images

### Pull Images

```bash
# Pull latest API image
docker pull ghcr.io/aarav500/f1-race-insights/api:latest

# Pull latest Web image
docker pull ghcr.io/aarav500/f1-race-insights/web:latest

# Pull specific version by SHA
docker pull ghcr.io/aarav500/f1-race-insights/api:main-abc1234
```

### Authenticate to GHCR

For **public** images, authentication is not required.

For **private** images:

```bash
# Create a Personal Access Token (classic) with `read:packages` scope
# Or use GITHUB_TOKEN in GitHub Actions

# Login to GHCR
echo $GITHUB_TOKEN | docker login ghcr.io -u USERNAME --password-stdin

# Pull private image
docker pull ghcr.io/aarav500/f1-race-insights/api:latest
```

### Update Production Deployment

Update your `deploy/.env.prod` to use GHCR images:

```bash
# .env.prod
DOCKER_REGISTRY=ghcr.io/aarav500/f1-race-insights
API_IMAGE_TAG=latest
WEB_IMAGE_TAG=latest
```

Your `docker-compose.prod.yml` will automatically use these images:

```yaml
services:
  api:
    image: ${DOCKER_REGISTRY}/api:${API_IMAGE_TAG}
  web:
    image: ${DOCKER_REGISTRY}/web:${WEB_IMAGE_TAG}
```

## Manual Trigger

You can manually trigger the workflow:

1. Go to **Actions** → **Publish Docker Images**
2. Click **Run workflow**
3. Select branch (usually `main`)
4. Click **Run workflow**

## Workflow Details

### Build Cache

The workflow uses GitHub Actions cache to speed up builds:
- Cache layers from previous builds
- Significantly reduces build time on subsequent runs
- Automatically managed by GitHub

### Build Context

- **API**: Uses root directory (`.`) as context
- **Web**: Uses root directory (`.`) as context with `docker/Dockerfile.web`

### Build Arguments

The Web image includes a build argument:
```yaml
NEXT_PUBLIC_API_BASE_URL=https://api.example.com
```

**Important**: Update this in the workflow file for your production API URL.

## Troubleshooting

### Permission Denied

**Error**: `denied: permission_denied: write_package`

**Solution**:
1. Check repository **Settings** → **Actions** → **General** → **Workflow permissions**
2. Ensure **"Read and write permissions"** is enabled
3. Re-run the workflow

### Image Not Found

**Error**: `Error response from daemon: pull access denied`

**Solution**:
1. Check package visibility (public vs private)
2. If private, authenticate: `docker login ghcr.io`
3. Use correct image name: `ghcr.io/aarav500/f1-race-insights/api:latest`

### Build Failed

**Error**: Various build errors

**Solution**:
1. Check workflow logs in **Actions** tab
2. Verify `Dockerfile.api` and `Dockerfile.web` are correct
3. Test build locally: `docker build -f docker/Dockerfile.api .`

## Viewing Published Images

### Via GitHub UI

1. Go to repository main page
2. Look for **Packages** in the right sidebar
3. Click on `api` or `web` package
4. View tags, download stats, and settings

### Via Docker CLI

```bash
# List all tags for API image
curl -s https://ghcr.io/v2/aarav500/f1-race-insights/api/tags/list | jq

# Note: This requires the package to be public
```

## Security Best Practices

1. **Use specific tags in production**: Don't rely on `latest` for production deployments
2. **Scan images**: Consider adding vulnerability scanning (Trivy, Snyk)
3. **Minimal base images**: Use Alpine or distroless images when possible
4. **Multi-stage builds**: Already implemented in Dockerfiles
5. **No secrets in images**: Never include credentials in Docker images

## Cost

GitHub Container Registry is **free** for public repositories:
- Unlimited storage for public packages
- Unlimited bandwidth for public packages

For private repositories:
- Free tier: 500MB storage, 1GB bandwidth/month
- Storage: $0.25/GB/month (beyond free tier)
- Bandwidth: $0.50/GB (beyond free tier)

## Alternative Registries

If you prefer AWS ECR:
- Update `REGISTRY` in workflow to ECR URL
- Use `aws-actions/configure-aws-credentials` action
- Configure AWS credentials in repository secrets

See `docker-build.yml` for ECR examples (commented out).

## Related Documentation

- [GitHub Actions Docker Build](./.github/workflows/docker-build.yml)
- [GitHub Actions CI](./.github/workflows/ci.yml)
- [Docker Deployment Guide](./deploy/DOCKER_DEPLOYMENT.md)
- [GitHub Packages Documentation](https://docs.github.com/en/packages)
