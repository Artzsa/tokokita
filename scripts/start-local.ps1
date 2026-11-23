$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

$nodeDir = "C:\Users\Lenovo\AppData\Local\nodejs"
if (Test-Path $nodeDir) {
  $env:Path = "$nodeDir;$env:Path"
}

$runDir = Join-Path $root ".local"
New-Item -ItemType Directory -Force -Path $runDir | Out-Null

function Get-AlivePid($pidFile) {
  if (-not (Test-Path $pidFile)) { return $null }
  $raw = Get-Content $pidFile -ErrorAction SilentlyContinue | Select-Object -First 1
  $parsed = 0
  if (-not [int]::TryParse($raw, [ref]$parsed)) { return $null }
  if (Get-Process -Id $parsed -ErrorAction SilentlyContinue) { return $parsed }
  return $null
}

$devPidFile = Join-Path $runDir "dev.pid"
$port = Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue

if ($port) {
  "Dev sudah jalan di port 3000 (PID $($port.OwningProcess))."
  Set-Content -Path $devPidFile -Value $port.OwningProcess
} elseif (Get-AlivePid $devPidFile) {
  "Dev sudah jalan (PID $(Get-AlivePid $devPidFile))."
} else {
  $dev = Start-Process -FilePath "cmd.exe" `
    -ArgumentList "/c", "npm.cmd run dev" `
    -WorkingDirectory $root `
    -WindowStyle Hidden `
    -RedirectStandardOutput (Join-Path $runDir "dev.out.log") `
    -RedirectStandardError (Join-Path $runDir "dev.err.log") `
    -PassThru
  Set-Content -Path $devPidFile -Value $dev.Id
  "Dev dimulai (PID $($dev.Id))."
}

$existingBot = Get-CimInstance Win32_Process -Filter "Name = 'node.exe'" |
  Where-Object { $_.CommandLine -like "*bot/index.ts*" } |
  Select-Object -First 1

if ($existingBot) {
  "Bot sudah jalan (PID $($existingBot.ProcessId))."
  Set-Content -Path (Join-Path $runDir "bot.pid") -Value $existingBot.ProcessId
} else {
  $tsx = Join-Path $root "node_modules\tsx\dist\cli.mjs"
  $bot = Start-Process -FilePath "node.exe" `
    -ArgumentList "`"$tsx`" bot/index.ts" `
    -WorkingDirectory $root `
    -WindowStyle Hidden `
    -RedirectStandardOutput (Join-Path $runDir "bot.out.log") `
    -RedirectStandardError (Join-Path $runDir "bot.err.log") `
    -PassThru
  Set-Content -Path (Join-Path $runDir "bot.pid") -Value $bot.Id
  "Bot dimulai (PID $($bot.Id))."
}

Start-Sleep -Seconds 2
"Buka http://localhost:3000"
