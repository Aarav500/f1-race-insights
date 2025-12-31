$commands = @(
    "cd /opt/f1-race-insights"
    "echo '=== Docker ps ==='"
    "docker ps"
    "echo ''"
    "echo '=== Docker compose ps ==='"
    "docker compose ps"
    "echo ''"
    "echo '=== Listening ports ==='"
    "ss -lntp"
)

$commandsJson = $commands | ConvertTo-Json -Compress

$cmdId = aws ssm send-command `
    --instance-ids i-00245e14610ccfa77 `
    --region us-east-1 `
    --document-name "AWS-RunShellScript" `
    --parameters "commands=$commandsJson" `
    --output text `
    --query "Command.CommandId"

Write-Host "Command ID: $cmdId"
Start-Sleep -Seconds 6

aws ssm get-command-invocation `
    --command-id $cmdId `
    --instance-id i-00245e14610ccfa77 `
    --region us-east-1 `
    --query "StandardOutputContent" `
    --output text | Out-File -FilePath "step1-output.txt" -Encoding UTF8

Write-Host "Output saved to step1-output.txt"
