// apps/api/src/dev/prune.markets.ts
// Purpose: remove markets not present in apps/api/config/markets.json
// Usage: pnpm --filter ./apps/api exec ts-node -r tsconfig-paths/register src/dev/prune.markets.ts

import { PrismaClient } from '@prisma/client';
import * as fs from 'node:fs';
import * as path from 'node:path';

const prisma = new PrismaClient();

type MarketCfg = {
  symbol: string;
  baseToken: { address: string; symbol: string; decimals: number };
  quoteToken: { address: string; symbol: string; decimals: number };
};

type MarketsFile = { chain: string; markets: MarketCfg[] };

async function main() {
  // Resolve config file robustly (works when running with -F api)
  const candidates = [
    path.resolve(process.cwd(), 'apps', 'api', 'config', 'markets.json'),
    path.resolve(process.cwd(), 'config', 'markets.json'),
  ];
  const cfgPath = candidates.find((p) => fs.existsSync(p));
  if (!cfgPath) {
    throw new Error(
      'markets.json not found (looked in apps/api/config/ and config/)',
    );
  }

  const raw = fs.readFileSync(cfgPath, 'utf8');
  const parsed = JSON.parse(raw) as MarketsFile;

  // Build the exact-allowed set from markets.json (use '-' as the only separator)
  const allowExact = new Set<string>(
    parsed.markets.map((m) => m.symbol.replace('/', '-').toUpperCase()),
  );

  const all = await prisma.market.findMany({
    select: { id: true, symbol: true },
  });

  // NEW: keep ONLY exact matches; slash-variants are now toDelete
  const toDelete = all.filter((m) => !allowExact.has(m.symbol.toUpperCase()));

  if (toDelete.length === 0) {
    console.log('No markets to prune. All good.');
    return;
  }

  console.log(
    `Pruning ${toDelete.length} market(s):`,
    toDelete.map((m) => m.symbol),
  );

  // NEW: delete dependencies first, then markets — all in a single transaction
  const ids = toDelete.map((m) => m.id);

  try {
    await prisma.$transaction([
      // Order matters: remove dependents before Market
      prisma.bookSnapshot.deleteMany({ where: { marketId: { in: ids } } }),
      prisma.orderEvent.deleteMany({ where: { marketId: { in: ids } } }),
      prisma.trade.deleteMany({ where: { marketId: { in: ids } } }),
      prisma.order.deleteMany({ where: { marketId: { in: ids } } }),
      prisma.market.deleteMany({ where: { id: { in: ids } } }),
    ]);
    console.log('Prune successful.');
  } catch (err) {
    console.error('Prune failed:', err);
    process.exit(1);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
