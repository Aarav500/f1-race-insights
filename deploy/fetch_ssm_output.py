import json
import subprocess
import sys

# Read command ID
with open('deploy/ui-check-cmd-id.json') as f:
    cmd_id = json.load(f)['CommandId']

print(f"Fetching output for command: {cmd_id}")

# Run AWS CLI command
result = subprocess.run([
    'aws', 'ssm', 'get-command-invocation',
    '--command-id', cmd_id,
    '--instance-id', 'i-00245e14610ccfa77',
    '--output', 'json'
], capture_output=True, text=True)

if result.returncode != 0:
    print(f"Error: {result.stderr}")
    sys.exit(1)

# Parse and save output
data = json.loads(result.stdout)

with open('deploy/ui-check-stdout.txt', 'w', encoding='utf-8') as f:
    f.write(data.get('StandardOutputContent', ''))

with open('deploy/ui-check-stderr.txt', 'w', encoding='utf-8') as f:
    f.write(data.get('StandardErrorContent', ''))

print("✓ Output saved to deploy/ui-check-stdout.txt and deploy/ui-check-stderr.txt")
