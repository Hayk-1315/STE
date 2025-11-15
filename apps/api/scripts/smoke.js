// apps/api/scripts/smoke.js
const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

(async () => {
  await p.$connect();
  const tokens = await p.token.count();
  const markets = await p.market.findMany({ select: { symbol: true } });
  console.log({ tokens, markets: markets.map((m) => m.symbol) });
})()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => p.$disconnect());
