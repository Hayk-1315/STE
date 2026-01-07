// apps/api/scripts/clear-dev.ts
import path from 'node:path';
import { config as loadEnv } from 'dotenv';
loadEnv({ path: path.resolve(__dirname, '../../.env') }); // <-- carga .env de la RAÍZ

import { PrismaClient } from '@prisma/client';

async function main() {
  const prisma = new PrismaClient();
  try {
    // En el orden correcto para evitar FK:
    await prisma.trade.deleteMany({});
    try {
      await prisma.orderEvent.deleteMany({});
      // eslint-disable-next-line no-empty
    } catch {}
    await prisma.order.deleteMany({});
    await prisma.bookSnapshot.deleteMany({});

    console.log(
      '✔ Limpieza completa: trades, orderEvents, orders y bookSnapshots.',
    );
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error('✖ Error limpiando BD:', e);
  process.exit(1);
});
