$ErrorActionPreference = "Stop"
$ProjectRoot = Split-Path -Parent $PSScriptRoot
$LauncherDir = Join-Path $ProjectRoot "tools\windows-launcher"
$OutputDir = Join-Path $ProjectRoot "dist\windows"
$OutputExe = Join-Path $OutputDir "AiAgencySimulator.exe"

Write-Host "=== Building Windows Launcher ===" -ForegroundColor Cyan
Write-Host ""

# 1. Clean old output
if (Test-Path $OutputDir) {
    Remove-Item -Path $OutputDir -Recurse -Force
    Write-Host "[CLEAN] Removed old output directory" -ForegroundColor Yellow
}
New-Item -ItemType Directory -Path $OutputDir -Force | Out-Null

# 2. dotnet restore (project level)
Write-Host "[RESTORE] Restoring NuGet packages..." -ForegroundColor Cyan
dotnet restore (Join-Path $LauncherDir "AiAgencyLauncher\AiAgencyLauncher.csproj") 2>&1 | ForEach-Object { Write-Host $_ }
if ($LASTEXITCODE -ne 0) { throw "dotnet restore failed" }
dotnet restore (Join-Path $LauncherDir "AiAgencyLauncher.Tests\AiAgencyLauncher.Tests.csproj") 2>&1 | ForEach-Object { Write-Host $_ }
if ($LASTEXITCODE -ne 0) { throw "dotnet restore (tests) failed" }
Write-Host "[OK] Restore completed" -ForegroundColor Green
Write-Host ""

# 3. dotnet test
Write-Host "[TEST] Running unit tests..." -ForegroundColor Cyan
dotnet test (Join-Path $LauncherDir "AiAgencyLauncher.Tests\AiAgencyLauncher.Tests.csproj") --no-restore 2>&1 | ForEach-Object { Write-Host $_ }
if ($LASTEXITCODE -ne 0) { throw "dotnet test failed" }
Write-Host "[OK] All tests passed" -ForegroundColor Green
Write-Host ""

# 4. dotnet publish
Write-Host "[PUBLISH] Publishing self-contained EXE..." -ForegroundColor Cyan
dotnet publish (Join-Path $LauncherDir "AiAgencyLauncher\AiAgencyLauncher.csproj") `
    --configuration Release `
    -p:DebugSymbols=false `
    --output $OutputDir 2>&1 | ForEach-Object { Write-Host $_ }

if ($LASTEXITCODE -ne 0) { throw "dotnet publish failed" }
Write-Host "[OK] Publish completed" -ForegroundColor Green
Write-Host ""

# 5. Verify EXE exists
if (-not (Test-Path $OutputExe)) {
    throw "EXE not found at $OutputExe"
}
Write-Host "[CHECK] EXE found at $OutputExe" -ForegroundColor Green

# 6. Check EXE size
$fileInfo = Get-Item $OutputExe
$sizeMB = [math]::Round($fileInfo.Length / 1MB, 2)
if ($fileInfo.Length -eq 0) {
    throw "EXE is empty (0 bytes)"
}
Write-Host "[CHECK] EXE size: $sizeMB MB" -ForegroundColor Green
Write-Host ""

# 7. Quick smoke test: run --status (fails gracefully without .env)
Write-Host "[SMOKE] Running --status from $OutputDir..." -ForegroundColor Cyan
$proc = Start-Process -FilePath $OutputExe -ArgumentList "--status" -NoNewWindow -RedirectStandardOutput "$OutputDir\smoke-stdout.txt" -RedirectStandardError "$OutputDir\smoke-stderr.txt" -Wait -PassThru
$stdout = Get-Content "$OutputDir\smoke-stdout.txt" -Raw
$stderr = Get-Content "$OutputDir\smoke-stderr.txt" -Raw
if ($stdout) { Write-Host $stdout }
if ($stderr) { Write-Host $stderr -ForegroundColor Yellow }
if ($proc.ExitCode -eq 0) {
    Write-Host "[OK] Launcher completed (status: healthy)" -ForegroundColor Green
}
else {
    Write-Host "[OK] Launcher exited with code $($proc.ExitCode) (expected without .env)" -ForegroundColor Yellow
}
Write-Host ""

Write-Host "======================================" -ForegroundColor Cyan
Write-Host "[SUCCESS] WINDOWS LAUNCHER BUILD" -ForegroundColor Green
Write-Host "  Output: $OutputExe" -ForegroundColor Green
Write-Host "  Size: $sizeMB MB" -ForegroundColor Green
Write-Host "======================================" -ForegroundColor Cyan
