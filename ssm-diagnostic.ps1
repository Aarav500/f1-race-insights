# Run diagnostic script on EC2 instance via SSM
# Usage: .\ssm-diagnostic.ps1

$scriptContent = Get-Content ".\diagnostic-ec2.sh" -Raw
$commands = @($scriptContent)
$paramsJson = @{commands = $commands } | ConvertTo-Json -Compress

# Write to a temp file to avoid parameter parsing issues
$paramsJson | Out-File -FilePath "diagnostic-params.json" -Encoding UTF8 -NoNewline

Write-Host "=== Sending diagnostic command to EC2 instance ===" -ForegroundColor Cyan
Write-Host ""

$cmdId = aws ssm send-command `
    --instance-ids i-00245e14610ccfa77 `
    --region us-east-1 `
    --document-name "AWS-RunShellScript" `
    --comment "EC2 Diagnostics for deployment troubleshooting" `
    --cli-input-json (Get-Content "diagnostic-params.json" | ForEach-Object { "{`"Parameters`":$_}" }) `
    --output text `
    --query "Command.CommandId"

Write-Host "Command ID: $cmdId" -ForegroundColor Green
Write-Host "Waiting for command to complete..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

Write-Host ""
Write-Host "=== Fetching diagnostic output ===" -ForegroundColor Cyan

aws ssm get-command-invocation `
    --command-id $cmdId `
    --instance-id i-00245e14610ccfa77 `
    --region us-east-1 `
    --query "StandardOutputContent" `
    --output text | Out-File -FilePath "diagnostic-output.txt" -Encoding UTF8

Write-Host ""
Write-Host "Output saved to: diagnostic-output.txt" -ForegroundColor Green
Write-Host ""
Write-Host "=== Diagnostic Output ===" -ForegroundColor Cyan
Get-Content "diagnostic-output.txt"

# Clean up temp file
Remove-Item "diagnostic-params.json" -ErrorAction SilentlyContinue
