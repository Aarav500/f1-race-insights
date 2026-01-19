import time

import boto3

# Create SSM client
ssm = boto3.client('ssm', region_name='us-east-1')

# Send command
response = ssm.send_command(
    InstanceIds=['i-00245e14610ccfa77'],
    DocumentName='AWS-RunShellScript',
    Parameters={
        'commands': [
            'set -euo pipefail',
            'cd /opt/f1-race-insights',
            '',
            'echo "=== docker status ==="',
            'docker ps --format "table {{.Names}}\t{{.Image}}\t{{.Status}}"',
            '',
            'echo "=== web curl ==="',
            'curl -sS -I http://127.0.0.1:3000/ 2>&1 | head -n 5 || echo "web unreachable"',
            '',
            'echo "=== api curl ==="',
            'curl -sS -I http://127.0.0.1:8000/docs 2>&1 | head -n 5 || echo "api unreachable"',
            '',
            'echo "=== web logs (last 50 lines) ==="',
            'docker logs --tail 50 f1-race-insights-web 2>&1 || echo "no web logs"',
            '',
            'echo "=== api logs (last 50 lines) ==="',
            'docker logs --tail 50 f1-race-insights-api 2>&1 || echo "no api logs"'
        ]
    }
)

command_id = response['Command']['CommandId']
print(f"Command ID: {command_id}")

# Wait for command to complete
print("Waiting for command to complete...")
time.sleep(15)

# Get command invocation
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
print("\n" + "="*80)
print("STDERR:")
print("="*80)
print(invocation['StandardErrorContent'])

# Save to file
with open('deploy/diagnostic-result.txt', 'w', encoding='utf-8', errors='replace') as f:
    f.write(f"Status: {invocation['Status']}\n")
    f.write(f"Response Code: {invocation['ResponseCode']}\n\n")
    f.write("="*80 + "\n")
    f.write("STDOUT:\n")
    f.write("="*80 + "\n")
    f.write(invocation['StandardOutputContent'])
    f.write("\n\n" + "="*80 + "\n")
    f.write("STDERR:\n")
    f.write("="*80 + "\n")
    f.write(invocation['StandardErrorContent'])

print("\n✓ Results saved to deploy/diagnostic-result.txt")
