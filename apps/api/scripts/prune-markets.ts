// apps/api/scripts/prune-markets.ts
import path from 'node:path';
import { config as loadEnv } from 'dotenv';
loadEnv({ path: path.resolve(__dirname, '../../.env') }); // <-- carga .env de la RAÍZ

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Ajusta la lista de símbolos a purgar
  const SYMBOLS = ['SKY-USDC', 'TBD-USDC'];

  const toDelete = await prisma.market.findMany({
    where: { symbol: { in: SYMBOLS } },
    select: { id: true, symbol: true },
  });

  if (toDelete.length === 0) {
    console.log('No markets to delete');
    return;
  }

  const ids = toDelete.map((m) => m.id);

  // Borra primero tablas hijas, luego Market
  await prisma.$transaction([
    prisma.orderEvent.deleteMany({ where: { marketId: { in: ids } } }),
    prisma.trade.deleteMany({ where: { marketId: { in: ids } } }),
    prisma.bookSnapshot.deleteMany({ where: { marketId: { in: ids } } }),
    prisma.order.deleteMany({ where: { marketId: { in: ids } } }),
    prisma.market.deleteMany({ where: { id: { in: ids } } }),
  ]);

  console.log('Deleted markets:', toDelete.map((m) => m.symbol).join(', '));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
