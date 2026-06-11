# scripts/clear-sepolia-smart-intents.ps1
#
# Clears Smart Intent (CL / CMR) test data from the deployed Sepolia Postgres.
#
# DESTRUCTIVE — deletes IntentEvent and Intent rows. Irreversible.
# For Sepolia / development environments ONLY. Never run against mainnet.
#
# Does NOT touch: Order, Trade, OrderEvent, BookSnapshot, Market, Token,
# CancelPairFloor. On-chain fills and Order state changes are not reverted.
#
# Usage:
#   .\scripts\clear-sepolia-smart-intents.ps1 -DB "postgres://user:pass@host/db?schema=sepolia"
# Or set the env var first:
#   $env:STE_SEPOLIA_DB_URL = "postgres://..."
#   .\scripts\clear-sepolia-smart-intents.ps1
#
# Requires: pnpm + Prisma CLI (already installed as dev dependency).
# Run from the repo root.

param(
    [string]$DB = $env:STE_SEPOLIA_DB_URL
)

$ErrorActionPreference = "Stop"

# Guard: refuse if no DB URL is supplied.
if (-not $DB) {
    Write-Error "DB URL is required. Pass -DB or set `$env:STE_SEPOLIA_DB_URL."
    exit 1
}

# Guard: refuse if the URL does not explicitly target the Sepolia schema.
# This script is for deployed Sepolia test data only; a missing schema=sepolia
# clause is a strong signal the wrong DB was supplied.
if ($DB -notmatch 'schema=sepolia') {
    Write-Error "Refusing to run: DB URL must include schema=sepolia."
    exit 1
}

# Ensure pnpm --filter resolves correctly (script may be called from any directory).
Set-Location (Resolve-Path "$PSScriptRoot\..")

# Mask password in display output. Never print the real credential.
$masked = $DB -replace '(?<=://[^:]+:)[^@]+(?=@)', '***'

Write-Host ""
Write-Host "=============================================" -ForegroundColor Yellow
Write-Host "  DESTRUCTIVE: Smart Intents cleanup"        -ForegroundColor Yellow
Write-Host "  Sepolia / development environments ONLY"   -ForegroundColor Yellow
Write-Host "=============================================" -ForegroundColor Yellow
Write-Host "  Target : $masked"
Write-Host "  Deletes: IntentEvent, Intent"
Write-Host "  Skips  : Order, Trade, OrderEvent, BookSnapshot, CancelPairFloor"
Write-Host ""

# --- Before: current row counts ---
Write-Host "[Before]"
'SELECT COUNT(*) AS intent_event_rows FROM "IntentEvent";' |
    pnpm --filter ./apps/api exec prisma db execute --url $DB --stdin
'SELECT COUNT(*) AS intent_rows FROM "Intent";' |
    pnpm --filter ./apps/api exec prisma db execute --url $DB --stdin

# --- Delete in a single transaction: child rows first, then parent rows.
# IntentEvent.intentId → Intent.id has no ON DELETE CASCADE, so events
# must be deleted before intents within the same transaction.
Write-Host ""
Write-Host "[Deleting in transaction: IntentEvent (child) then Intent (parent)]"
@'
BEGIN;
DELETE FROM "IntentEvent";
DELETE FROM "Intent";
COMMIT;
'@ | pnpm --filter ./apps/api exec prisma db execute --url $DB --stdin

# --- After: verify zero rows ---
Write-Host ""
Write-Host "[After -- expected: 0 rows each]"
'SELECT COUNT(*) AS intent_event_rows FROM "IntentEvent";' |
    pnpm --filter ./apps/api exec prisma db execute --url $DB --stdin
'SELECT COUNT(*) AS intent_rows FROM "Intent";' |
    pnpm --filter ./apps/api exec prisma db execute --url $DB --stdin

Write-Host ""
Write-Host "Done. Verify counts above are 0." -ForegroundColor Green
Write-Host "A Render service restart is NOT needed for intents-only cleanup." -ForegroundColor Cyan
