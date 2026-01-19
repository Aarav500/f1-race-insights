import time

import boto3

# Create SSM client
ssm = boto3.client('ssm', region_name='us-east-1')

# Deploy command
deploy_commands = [
    'set -euo pipefail',
    'cd /opt/f1-race-insights',
    '',
    'echo "=== Pulling latest code ==="',
    'git fetch origin',
    'git reset --hard origin/main',
    'git log -1 --oneline',
    '',
    'echo "=== Pulling latest images ==="',
    'docker compose pull',
    '',
    'echo "=== Restarting services ==="',
    'docker compose up -d --remove-orphans',
    '',
    'echo "=== Waiting for services to be healthy ==="',
    'sleep 20',
    '',
    'echo "=== Service status ==="',
    'docker compose ps',
    '',
    'echo "=== Web container logs (last 30 lines) ==="',
    'docker logs --tail 30 f1-race-insights-web',
    '',
    'echo "=== Quick health checks ==="',
    'curl -sS -I http://127.0.0.1:3000/ | head -n 5',
    'curl -sS http://127.0.0.1:3000/api/health || echo "Health check failed"'
]

# Send command
print("Deploying to EC2...")
response = ssm.send_command(
    InstanceIds=['i-00245e14610ccfa77'],
    DocumentName='AWS-RunShellScript',
    Parameters={'commands': deploy_commands}
)

command_id = response['Command']['CommandId']
print(f"Deploy command ID: {command_id}")

# Wait for command to complete
print("Waiting for deployment to complete...")
time.sleep(45)

# Get result
invocation = ssm.get_command_invocation(
    CommandId=command_id,
    InstanceId='i-00245e14610ccfa77'
)

print(f"\nStatus: {invocation['Status']}")
print(f"Response Code: {invocation['ResponseCode']}")
print("\n" + "="*80)
print("STDOUT:")
print("="*80)
print(invocation['StandardOutputContent'])

if invocation['StandardErrorContent']:
    print("\n" + "="*80)
    print("STDERR:")
    print("="*80)
    print(invocation['StandardErrorContent'])

# Save to file
with open('deploy/deploy-result.txt', 'w', encoding='utf-8', errors='replace') as f:
    f.write(f"Status: {invocation['Status']}\n")
    f.write(f"Response Code: {invocation['ResponseCode']}\n\n")
    f.write("="*80 + "\n")
    f.write("STDOUT:\n")
    f.write("="*80 + "\n")
    f.write(invocation['StandardOutputContent'])
    if invocation['StandardErrorContent']:
        f.write("\n\n" + "="*80 + "\n")
        f.write("STDERR:\n")
        f.write("="*80 + "\n")
        f.write(invocation['StandardErrorContent'])

print("\n✓ Deploy result saved to deploy/deploy-result.txt")
