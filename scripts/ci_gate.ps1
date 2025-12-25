# F1 Race Insights - CI Gate Script (PowerShell)
#
# This script enforces type checking, linting, and testing before deployment.
# All checks must pass for deployment to proceed.
#
# Usage:
#   .\scripts\ci_gate.ps1
#
# Exit codes:
#   0 - All checks passed
#   1 - One or more checks failed

$ErrorActionPreference = "Stop"

# Print header
Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "       F1 Race Insights - CI Gate" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""

# Print repo root and commit SHA
$RepoRoot = Split-Path -Parent $PSScriptRoot
Write-Host "[INFO] Repository root: $RepoRoot" -ForegroundColor Blue

if (Test-Path "$RepoRoot\.git") {
    try {
        $CommitSHA = git -C $RepoRoot rev-parse HEAD
        $CommitShort = git -C $RepoRoot rev-parse --short HEAD
        $Branch = git -C $RepoRoot rev-parse --abbrev-ref HEAD
        Write-Host "[INFO] Current commit: $CommitSHA" -ForegroundColor Blue
        Write-Host "[INFO] Short commit: $CommitShort" -ForegroundColor Blue
        Write-Host "[INFO] Branch: $Branch" -ForegroundColor Blue
    } catch {
        Write-Host "[INFO] Git available but unable to read commit info" -ForegroundColor Blue
    }
} else {
    Write-Host "[INFO] Not in a git repository or git not available" -ForegroundColor Blue
}

Write-Host ""

# Track overall success
$AllPassed = $true

# Clear caches
Write-Host "[STEP] Clearing caches..." -ForegroundColor Cyan
Set-Location $RepoRoot

$Caches = @(".mypy_cache", ".ruff_cache", ".pytest_cache")
foreach ($cache in $Caches) {
    if (Test-Path $cache) {
        Write-Host "[INFO] Removing $cache" -ForegroundColor Blue
        Remove-Item -Recurse -Force $cache
    } else {
        Write-Host "[INFO] $cache not found (skipping)" -ForegroundColor Blue
    }
}

Write-Host "[SUCCESS] Caches cleared" -ForegroundColor Green
Write-Host ""

# Run type checking
Write-Host "[STEP] Running type checking (mypy)..." -ForegroundColor Cyan
Write-Host ""
try {
    python -m mypy f1/ api/ --ignore-missing-imports
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "[SUCCESS] Type checking passed" -ForegroundColor Green
    } else {
        Write-Host ""
        Write-Host "[ERROR] Type checking failed" -ForegroundColor Red
        $AllPassed = $false
    }
} catch {
    Write-Host ""
    Write-Host "[ERROR] Type checking failed" -ForegroundColor Red
    $AllPassed = $false
}
Write-Host ""

# Run linting
Write-Host "[STEP] Running linting (ruff)..." -ForegroundColor Cyan
Write-Host ""
try {
    python -m ruff check .
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "[SUCCESS] Linting passed" -ForegroundColor Green
    } else {
        Write-Host ""
        Write-Host "[ERROR] Linting failed" -ForegroundColor Red
        $AllPassed = $false
    }
} catch {
    Write-Host ""
    Write-Host "[ERROR] Linting failed" -ForegroundColor Red
    $AllPassed = $false
}
Write-Host ""

# Run tests
Write-Host "[STEP] Running tests (pytest)..." -ForegroundColor Cyan
Write-Host ""
try {
    python -m pytest tests/ -v --cov=f1 --cov=api --cov-report=term-missing --cov-report=html
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "[SUCCESS] Tests passed" -ForegroundColor Green
    } else {
        Write-Host ""
        Write-Host "[ERROR] Tests failed" -ForegroundColor Red
        $AllPassed = $false
    }
} catch {
    Write-Host ""
    Write-Host "[ERROR] Tests failed" -ForegroundColor Red
    $AllPassed = $false
}
Write-Host ""

# Print final result
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
if ($AllPassed) {
    Write-Host "[SUCCESS] ALL CHECKS PASSED" -ForegroundColor Green
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
    Write-Host ""
    exit 0
} else {
    Write-Host "[ERROR] DEPLOY BLOCKED" -ForegroundColor Red
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "[ERROR] One or more checks failed. Deployment is not allowed." -ForegroundColor Red
    Write-Host "[INFO] Fix the issues above and run this script again." -ForegroundColor Blue
    Write-Host ""
    exit 1
}
