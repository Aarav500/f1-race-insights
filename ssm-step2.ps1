$scriptContent = Get-Content ".\step2.sh" -Raw
$commands = @($scriptContent)
$paramsJson = @{commands = $commands } | ConvertTo-Json -Compress

# Write to a temp file to avoid parameter parsing issues
$paramsJson | Out-File -FilePath "params.json" -Encoding UTF8 -NoNewline

$cmdId = aws ssm send-command `
    --instance-ids i-00245e14610ccfa77 `
    --region us-east-1 `
    --document-name "AWS-RunShellScript" `
    --cli-input-json (Get-Content "params.json" | ForEach-Object { "{`"Parameters`":$_}" }) `
    --output text `
    --query "Command.CommandId"

Write-Host "Command ID: $cmdId"
Start-Sleep -Seconds 5

aws ssm get-command-invocation `
    --command-id $cmdId `
    --instance-id i-00245e14610ccfa77 `
    --region us-east-1 `
    --query "StandardOutputContent" `
    --output text | Out-File -FilePath "step2-output.txt" -Encoding UTF8

Write-Host "Output saved to step2-output.txt"
