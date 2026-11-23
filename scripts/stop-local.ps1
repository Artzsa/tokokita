$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
$runDir = Join-Path $root ".local"

$port = Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue
if ($port) {
  taskkill /PID $port.OwningProcess /T /F | Out-Null
  "Dev dihentikan (PID $($port.OwningProcess))."
} else {
  "Dev tidak sedang jalan."
}

$bots = Get-CimInstance Win32_Process -Filter "Name = 'node.exe'" |
  Where-Object { $_.CommandLine -like "*bot/index.ts*" }

if ($bots) {
  foreach ($bot in $bots) {
    taskkill /PID $bot.ProcessId /T /F | Out-Null
    "Bot dihentikan (PID $($bot.ProcessId))."
  }
} else {
  "Bot tidak sedang jalan."
}

if (Test-Path $runDir) {
  Remove-Item (Join-Path $runDir "dev.pid") -ErrorAction SilentlyContinue
  Remove-Item (Join-Path $runDir "bot.pid") -ErrorAction SilentlyContinue
}
