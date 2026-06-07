// apps/api/scripts/clear-sea-intents-dev.ts
//
// Local-dev hard-delete of Smart Intents (Intent + IntentEvent only).
// Does NOT touch Order, Trade, OrderEvent, BookSnapshot, Market, Token,
// or CancelPairFloor.
//
// Run (Sepolia QA local DB):
//   CONFIRM_CLEAR_SEA_INTENTS=1 \
//     pnpm exec dotenv -e apps/api/.env.sepolia -- \
//     pnpm -C apps/api exec ts-node -r tsconfig-paths/register \
//     scripts/clear-sea-intents-dev.ts
//
// Safety guards (any one of these refuses execution):
//   - CONFIRM_CLEAR_SEA_INTENTS must equal "1"
//   - READ_ONLY=true                  → refuse
//   - PROFILE=mainnet                 → refuse
//   - DATABASE_URL host not local/dev → refuse
//
// Intent.linkedOrderHash and Intent.linkedTxHash are plain String? columns
// with no Prisma @relation (verified against schema.prisma); deleting Intent
// rows cannot corrupt Order or Trade rows.

import { PrismaClient } from '@prisma/client';

function refuse(code: number, message: string): never {
  console.error(`✖ ${message}`);
  process.exit(code);
}

function isLocalDatabaseUrl(url: string | undefined): boolean {
  if (!url) return false;
  let host: string;
  try {
    // Strip any double quotes a shell might leave behind.
    const cleaned = url.replace(/^"+|"+$/g, '');
    const u = new URL(cleaned);
    host = (u.hostname || '').toLowerCase();
  } catch {
    return false;
  }
  const allowed = new Set([
    'localhost',
    '127.0.0.1',
    '::1',
    // Common docker-compose service names already used in this repo.
    'postgres',
    'db',
  ]);
  return allowed.has(host);
}

async function main(): Promise<void> {
  // 1) Explicit confirmation env.
  if (process.env.CONFIRM_CLEAR_SEA_INTENTS !== '1') {
    refuse(
      2,
      'Refusing to delete: set CONFIRM_CLEAR_SEA_INTENTS=1 to proceed.',
    );
  }
  // 2) Profile / read-only hard-disables.
  if (process.env.READ_ONLY === 'true') {
    refuse(3, 'Refusing to delete on READ_ONLY=true profile.');
  }
  if (process.env.PROFILE === 'mainnet') {
    refuse(3, 'Refusing to delete on PROFILE=mainnet profile.');
  }
  // 3) DB safety guard — must point at a local/dev host.
  if (!isLocalDatabaseUrl(process.env.DATABASE_URL)) {
    refuse(
      4,
      'Refusing to delete: DATABASE_URL host is not local/dev (allowed: localhost, 127.0.0.1, ::1, postgres, db).',
    );
  }

  const prisma = new PrismaClient();
  try {
    // IntentEvent.intentId references Intent.id without ON DELETE CASCADE,
    // so events MUST be deleted first to avoid a FK error.
    const events = await prisma.intentEvent.deleteMany({});
    const intents = await prisma.intent.deleteMany({});

    console.log(
      `✔ clear-sea-intents-dev: deleted IntentEvent=${events.count} Intent=${intents.count}`,
    );
    console.log(
      '  Order / Trade / OrderEvent / BookSnapshot / Market / Token / CancelPairFloor untouched.',
    );
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e: unknown) => {
  console.error(
    '✖ clear-sea-intents-dev failed:',
    e instanceof Error ? e.message : String(e),
  );
  process.exit(1);
});
