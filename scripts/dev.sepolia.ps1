$ErrorActionPreference = "Stop"

Set-Location (Resolve-Path "$PSScriptRoot\..")

# 1) Copiar markets de Sepolia
Copy-Item apps/api/config/markets.sepolia-eth.json apps/api/config/markets.json -Force

# 2) DB push + wipe + seed (todo dentro de apps/api)
Push-Location apps/api

pnpm exec dotenv -e .\.env.sepolia -- pnpm exec prisma db push --schema .\prisma\schema.prisma

$SQL = @'
TRUNCATE TABLE "Trade","Order","BookSnapshot","Market" RESTART IDENTITY CASCADE;
'@

$TMP = Join-Path $env:TEMP "ste_wipe.sql"
$enc = New-Object System.Text.UTF8Encoding($false)   # UTF-8 SIN BOM
[System.IO.File]::WriteAllText($TMP, $SQL, $enc)

pnpm exec prisma db execute --schema .\prisma\schema.prisma --file $TMP
Remove-Item $TMP -Force

pnpm exec dotenv -e .\.env.sepolia -- pnpm exec ts-node -r tsconfig-paths/register src/dev/seed.markets.ts

Pop-Location

# 3) Arrancar API + Web
pnpm exec concurrently -k -n "api,web" "pnpm dev:api:sepolia" "pnpm dev:web:sepolia"
