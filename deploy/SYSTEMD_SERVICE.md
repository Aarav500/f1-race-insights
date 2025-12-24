# F1 Race Insights - Systemd Service

This systemd service unit enables the F1 Race Insights application to automatically start on system boot and manage the Docker Compose stack.

## Overview

The `f1.service` systemd unit manages the Docker Compose deployment of F1 Race Insights, ensuring:
- Automatic startup on system boot
- Graceful shutdown on system reboot/shutdown
- Auto-restart on failure
- Proper dependency management (waits for Docker and network)
- Centralized logging via systemd journal

## Installation

### Prerequisites

1. Docker and Docker Compose must be installed
2. Application files must be in `/opt/f1-race-insights/`
3. Configuration file `.env.prod` must exist in `/opt/f1-race-insights/deploy/`

### Install Steps

```bash
# 1. Copy the service file to systemd directory
sudo cp /opt/f1-race-insights/deploy/f1.service /etc/systemd/system/

# 2. Reload systemd to recognize the new service
sudo systemctl daemon-reload

# 3. Enable the service to start on boot
sudo systemctl enable f1.service

# 4. Start the service immediately
sudo systemctl start f1.service

# 5. Verify the service is running
sudo systemctl status f1.service
```

## Service Management

### Basic Commands

```bash
# Start the service
sudo systemctl start f1.service

# Stop the service
sudo systemctl stop f1.service

# Restart the service
sudo systemctl restart f1.service

# Reload (pull latest images and restart containers)
sudo systemctl reload f1.service

# Check status
sudo systemctl status f1.service

# Enable auto-start on boot
sudo systemctl enable f1.service

# Disable auto-start on boot
sudo systemctl disable f1.service
```

### Viewing Logs

```bash
# Follow logs in real-time
sudo journalctl -u f1.service -f

# View last 100 log entries
sudo journalctl -u f1.service -n 100

# View logs with timestamps
sudo journalctl -u f1.service -o short-precise

# View logs since boot
sudo journalctl -u f1.service -b

# View logs for a specific time range
sudo journalctl -u f1.service --since "2024-01-01 00:00:00" --until "2024-01-02 00:00:00"
```

## How It Works

### Service Configuration

The service unit file (`f1.service`) contains the following key configurations:

**Dependencies:**
- `After=docker.service network-online.target` - Starts after Docker and network are ready
- `Requires=docker.service` - Requires Docker to be running

**Execution:**
- `ExecStart` - Runs `docker compose up -d` to start all services
- `ExecStop` - Runs `docker compose down` to gracefully stop services
- `ExecReload` - Pulls latest images and restarts services

**Restart Policy:**
- `Restart=on-failure` - Automatically restarts if the service fails
- `RestartSec=10s` - Waits 10 seconds before restarting

**Timeouts:**
- `TimeoutStartSec=300` - Allows up to 5 minutes for startup
- `TimeoutStopSec=120` - Allows up to 2 minutes for graceful shutdown

## Verify Auto-Start on Boot

To verify the service automatically starts after a reboot:

```bash
# Reboot the system
sudo reboot

# After reboot, SSH back in and check service status
sudo systemctl status f1.service

# Check Docker containers are running
docker compose -f /opt/f1-race-insights/deploy/docker-compose.prod.yml ps

# Expected output: All services (nginx, api, web) should be running
```

## Troubleshooting

### Service fails to start

```bash
# Check service status
sudo systemctl status f1.service

# View detailed logs
sudo journalctl -u f1.service -n 50

# Common issues:
# 1. Docker not running
sudo systemctl status docker

# 2. .env.prod file missing
ls -la /opt/f1-race-insights/deploy/.env.prod

# 3. docker-compose.prod.yml file missing
ls -la /opt/f1-race-insights/deploy/docker-compose.prod.yml

# 4. Permissions issue
sudo chown -R root:root /opt/f1-race-insights
```

### Service starts but containers fail

```bash
# Check Docker Compose logs
sudo docker compose -f /opt/f1-race-insights/deploy/docker-compose.prod.yml logs

# Check individual container logs
sudo docker logs f1-api-prod
sudo docker logs f1-web-prod
sudo docker logs f1-nginx

# Check Docker daemon status
sudo systemctl status docker
```

### Service not starting on boot

```bash
# Verify service is enabled
sudo systemctl is-enabled f1.service
# Expected output: enabled

# Re-enable if needed
sudo systemctl enable f1.service

# Check for dependency issues
sudo systemctl list-dependencies f1.service
```

## Advanced Configuration

### Modify Service Settings

To customize the service behavior:

```bash
# Edit the service file
sudo nano /etc/systemd/system/f1.service

# After making changes, reload systemd
sudo systemctl daemon-reload

# Restart the service with new settings
sudo systemctl restart f1.service
```

### Resource Limits

You can add resource limits to the service unit:

```ini
[Service]
# Limit CPU usage to 80%
CPUQuota=80%

# Limit memory usage to 4GB
MemoryLimit=4G

# Limit number of tasks
TasksMax=256
```

### Email Notifications on Failure

Configure systemd to send email notifications when the service fails:

```ini
[Service]
OnFailure=status-email@%n.service
```

## Uninstalling

To remove the systemd service:

```bash
# Stop the service
sudo systemctl stop f1.service

# Disable auto-start
sudo systemctl disable f1.service

# Remove the service file
sudo rm /etc/systemd/system/f1.service

# Reload systemd
sudo systemctl daemon-reload
```

## Integration with CI/CD

The systemd service can be used in CI/CD pipelines:

```bash
# After deploying new images
sudo systemctl reload f1.service

# Or restart completely
sudo systemctl restart f1.service
```

## Related Documentation

- [Docker Deployment Guide](./DOCKER_DEPLOYMENT.md)
- [General Deployment Guide](./README_DEPLOY.md)
- [Bootstrap Script](./ec2_bootstrap.sh)
- [Deploy Script](./ec2_deploy.sh)

## Support

For issues with the systemd service:
1. Check service status: `sudo systemctl status f1.service`
2. View logs: `sudo journalctl -u f1.service -n 100`
3. Verify Docker is running: `sudo systemctl status docker`
4. Check Docker Compose: `docker compose -f /opt/f1-race-insights/deploy/docker-compose.prod.yml ps`
