$ErrorActionPreference = "Stop"

# Asegura que corremos desde la raíz del repo
Set-Location (Resolve-Path "$PSScriptRoot\..")

# 1) Copiar markets de Base (mainnet)
Copy-Item apps/api/config/markets.mainnet.json apps/api/config/markets.json -Force

# 2) DB push + wipe + seed (todo dentro de apps/api)
Push-Location apps/api

pnpm exec dotenv -e .\.env -- pnpm exec prisma db push --schema .\prisma\schema.prisma

$SQL = @'
TRUNCATE TABLE "Trade","Order","BookSnapshot","Market" RESTART IDENTITY CASCADE;
'@

$TMP = Join-Path $env:TEMP "ste_wipe.sql"
$enc = New-Object System.Text.UTF8Encoding($false)   # UTF-8 SIN BOM
[System.IO.File]::WriteAllText($TMP, $SQL, $enc)

pnpm exec prisma db execute --schema .\prisma\schema.prisma --file $TMP
Remove-Item $TMP -Force

pnpm exec dotenv -e .\.env -- pnpm exec ts-node -r tsconfig-paths/register src/dev/seed.markets.ts

Pop-Location

# 3) Arrancar API + Web (desde la raíz, importante por rutas .env)
pnpm exec concurrently -k -n "api,web" "pnpm dev:api:mainnet" "pnpm dev:web:mainnet"
