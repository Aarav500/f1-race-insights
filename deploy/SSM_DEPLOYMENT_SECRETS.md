# AWS SSM Deployment - GitHub Secrets Configuration

This document describes the required GitHub Secrets for deploying to EC2 via AWS Systems Manager (SSM).

## Required GitHub Secrets

Configure these secrets in your GitHub repository at `Settings > Secrets and variables > Actions`:

### AWS Authentication

| Secret Name | Description | Example Value |
|-------------|-------------|---------------|
| `AWS_ACCESS_KEY_ID` | IAM user access key ID | `AKIAIOSFODNN7EXAMPLE` |
| `AWS_SECRET_ACCESS_KEY` | IAM user secret access key | `wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY` |
| `AWS_REGION` | AWS region where EC2 instance is located | `us-east-1` |
| `EC2_INSTANCE_ID` | EC2 instance ID to deploy to | `i-0123456789abcdef0` |

## IAM Permissions

### IAM User Policy (for GitHub Actions)

The IAM user whose credentials are stored in GitHub Secrets must have the following permissions:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "ssm:DescribeInstanceInformation",
        "ssm:SendCommand",
        "ssm:ListCommandInvocations",
        "ssm:GetCommandInvocation"
      ],
      "Resource": "*"
    }
  ]
}
```

**Note**: You can restrict `Resource` to specific instance ARNs for tighter security:
```json
"Resource": "arn:aws:ec2:us-east-1:123456789012:instance/i-0123456789abcdef0"
```

### EC2 Instance IAM Role

The EC2 instance must have an IAM instance profile attached with the `AmazonSSMManagedInstanceCore` AWS managed policy.

To attach this policy:

1. **Create IAM Role** (if not exists):
   - Go to IAM Console > Roles > Create role
   - Select "AWS service" > "EC2"
   - Attach policy: `AmazonSSMManagedInstanceCore`
   - Name: `EC2-SSM-Role` (or your preferred name)

2. **Attach Role to EC2 Instance**:
   - Go to EC2 Console > Instances
   - Select your instance > Actions > Security > Modify IAM role
   - Select the role created above

## EC2 Instance Prerequisites

### 1. SSM Agent Installation

SSM Agent is pre-installed on:
- Amazon Linux 2 / Amazon Linux 2023
- Ubuntu 16.04+ (via snap)
- Windows Server 2016+

**Verify SSM Agent is running:**
```bash
sudo systemctl status amazon-ssm-agent
```

**If not running, start it:**
```bash
sudo systemctl start amazon-ssm-agent
sudo systemctl enable amazon-ssm-agent
```

### 2. Network Connectivity

**Public Subnet (with Internet Gateway):**
- No additional configuration needed
- Instance can reach SSM endpoints via public internet

**Private Subnet (without Internet Gateway):**
- Create VPC endpoints for SSM:
  - `com.amazonaws.<region>.ssm`
  - `com.amazonaws.<region>.ec2messages`
  - `com.amazonaws.<region>.ssmmessages`
- Security group for endpoints must allow inbound HTTPS (443) from instance subnet

### 3. Repository Setup

The deployment assumes the repository is cloned to `/opt/f1-race-insights` on the EC2 instance.

**Initial setup on EC2:**
```bash
sudo mkdir -p /opt/f1-race-insights
sudo chown -R ubuntu:ubuntu /opt/f1-race-insights  # Replace 'ubuntu' with your user
cd /opt/f1-race-insights
git clone https://github.com/Aarav500/f1-race-insights.git .
```

## Verification

### 1. Verify EC2 Instance is SSM-Managed

From your local machine with AWS CLI configured:
```bash
aws ssm describe-instance-information \
  --filters "Key=InstanceIds,Values=<your-instance-id>" \
  --region <your-region>
```

**Expected output:**
```json
{
  "InstanceInformationList": [
    {
      "InstanceId": "i-0123456789abcdef0",
      "PingStatus": "Online",
      "PlatformType": "Linux",
      ...
    }
  ]
}
```

**`PingStatus` must be `Online`** for SSM commands to work.

### 2. Test SSM Command Execution

```bash
aws ssm send-command \
  --instance-ids <your-instance-id> \
  --document-name "AWS-RunShellScript" \
  --parameters 'commands=["echo Hello from SSM"]' \
  --region <your-region>
```

Check command status:
```bash
aws ssm list-command-invocations \
  --command-id <command-id-from-above> \
  --details
```

## Troubleshooting

### Instance not showing in SSM

**Check:**
1. IAM instance profile is attached with `AmazonSSMManagedInstanceCore` policy
2. SSM Agent is running: `sudo systemctl status amazon-ssm-agent`
3. Instance has network connectivity to SSM endpoints
4. Security groups allow outbound HTTPS (443)

**Wait time:** It can take 5-10 minutes for a newly configured instance to register with SSM.

### PingStatus is "ConnectionLost"

**Causes:**
- SSM Agent crashed or stopped
- Network connectivity issues
- Instance is stopped/stopping

**Fix:**
```bash
sudo systemctl restart amazon-ssm-agent
```

### Commands time out

**Causes:**
- Git operations taking too long (large repository)
- Docker pulls taking too long (large images)
- Insufficient instance resources (CPU/memory)

**Fix:**
- Increase timeout in workflow (modify `aws ssm wait` timeout)
- Use larger instance type
- Pre-pull Docker images on instance

## Security Best Practices

1. **Use IAM roles instead of access keys when possible** - If running GitHub Actions on a self-hosted runner in AWS, use instance profile instead of access keys
2. **Rotate access keys regularly** - Update `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` every 90 days
3. **Restrict IAM policies** - Limit SSM permissions to specific instances/resources
4. **Use VPC endpoints for private subnets** - Avoid exposing traffic to public internet
5. **Monitor SSM command executions** - Enable CloudTrail logging for SSM API calls

## Migrating from SSH Deployment

The following secrets are **no longer needed** and can be deleted:
- ~~`EC2_HOST`~~ - Not needed with SSM
- ~~`EC2_SSH_KEY`~~ - SSH key not used
- ~~`EC2_USER`~~ - User not specified, SSM runs as ssm-user by default
- ~~`EC2_PORT`~~ - Port not needed

**Other secrets to keep:**
- `PROD_ENV_FILE_B64` - Still used if deployment scripts rely on it
- `GITHUB_TOKEN` - Still used for Docker registry authentication

## Additional Resources

- [AWS Systems Manager Documentation](https://docs.aws.amazon.com/systems-manager/)
- [SSM Agent Installation Guide](https://docs.aws.amazon.com/systems-manager/latest/userguide/ssm-agent.html)
- [VPC Endpoints for Systems Manager](https://docs.aws.amazon.com/systems-manager/latest/userguide/setup-create-vpc.html)
