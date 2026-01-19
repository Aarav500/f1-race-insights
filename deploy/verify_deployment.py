import time

import boto3

# Create SSM client
ssm = boto3.client('ssm', region_name='us-east-1')

# Verification command
verify_commands = [
    'set -euo pipefail',
    'cd /opt/f1-race-insights',
    '',
    'echo "=== Git status ==="',
    'git log -1 --oneline',
    '',
    'echo "=== Docker containers ==="',
    'docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"',
    '',
    'echo "=== Web logs (last 50 lines, checking for errors) ==="',
    'docker logs --tail 50 f1-race-insights-web 2>&1 | grep -i "error\\|exception\\|use()" || echo "No critical errors found in web logs"',
    '',
    'echo "=== Test homepage ==="',
    'curl -sS http://127.0.0.1:3000/ | head -c 500',
    '',
    'echo "=== Test API proxy health ==="',
    'curl -sS http://127.0.0.1:3000/api/health',
    '',
    'echo "=== Test direct API ==="',
    'curl -sS http://127.0.0.1:8000/health'
]

# Send command
print("Running verification checks on EC2...")
response = ssm.send_command(
    InstanceIds=['i-00245e14610ccfa77'],
    DocumentName='AWS-RunShellScript',
    Parameters={'commands': verify_commands}
)

command_id = response['Command']['CommandId']
print(f"Verification command ID: {command_id}")

# Wait for command to complete
print("Waiting for verification to complete...")
time.sleep(15)

# Get result
invocation = ssm.get_command_invocation(
    CommandId=command_id,
    InstanceId='i-00245e14610ccfa77'
)

print(f"\nStatus: {invocation['Status']}")
print(f"Response Code: {invocation['ResponseCode']}")
print("\n" + "="*80)
print("VERIFICATION RESULTS:")
print("="*80)
print(invocation['StandardOutputContent'])

# Save to file
with open('deploy/verification-result.txt', 'w', encoding='utf-8', errors='replace') as f:
    f.write(f"Status: {invocation['Status']}\n")
    f.write(f"Response Code: {invocation['ResponseCode']}\n\n")
    f.write("="*80 + "\n")
    f.write("VERIFICATION RESULTS:\n")
    f.write("="*80 + "\n")
    f.write(invocation['StandardOutputContent'])
    if invocation['StandardErrorContent']:
        f.write("\n\n" + "="*80 + "\n")
        f.write("STDERR:\n")
        f.write("="*80 + "\n")
        f.write(invocation['StandardErrorContent'])

print("\n✓ Verification result saved to deploy/verification-result.txt")
