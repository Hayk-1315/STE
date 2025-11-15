// Seed markets from config/markets.json into Postgres via Prisma.
// Converts human-friendly rules to smallest units using token decimals.
import { PrismaClient, Prisma } from '@prisma/client';
import { existsSync, readFileSync } from 'fs';
import path from 'path';
import Decimal from 'decimal.js';

type MarketCfg = {
  symbol: string;
  baseToken: { address: string; symbol: string; decimals: number };
  quoteToken: { address: string; symbol: string; decimals: number };
  tradingRules: { minNotional: string; minSize: string; priceTick: string };
};
type Cfg = { chain: string; markets: MarketCfg[] };

const prisma = new PrismaClient();

function toUnits(val: string, decimals: number): Prisma.Decimal {
  const x = new Decimal(val).mul(new Decimal(10).pow(decimals));
  if (!x.isInteger()) throw new Error(`Non-integer after scaling: ${val}`);
  return new Prisma.Decimal(x.toFixed(0));
}

async function upsertToken(addr: string, symbol: string, decimals: number) {
  return prisma.token.upsert({
    where: { address: addr.toLowerCase() },
    create: { address: addr.toLowerCase(), symbol, decimals },
    update: { symbol, decimals },
  });
}

async function main() {
  const cfgPath = path.resolve(__dirname, '../../config/markets.json');
  if (!existsSync(cfgPath)) {
    throw new Error(`markets.json not found at ${cfgPath}`);
  }
  const raw = readFileSync(cfgPath, 'utf8');
  const cfg = JSON.parse(raw) as Cfg;

  for (const m of cfg.markets) {
    const base = await upsertToken(
      m.baseToken.address,
      m.baseToken.symbol,
      m.baseToken.decimals,
    );
    const quote = await upsertToken(
      m.quoteToken.address,
      m.quoteToken.symbol,
      m.quoteToken.decimals,
    );

    const minNotionalQ = toUnits(m.tradingRules.minNotional, quote.decimals);
    const minSizeB = toUnits(m.tradingRules.minSize, base.decimals);
    const priceTickQ = toUnits(m.tradingRules.priceTick, quote.decimals);

    await prisma.market.upsert({
      where: { symbol: m.symbol },
      create: {
        symbol: m.symbol,
        // relaciones por connect → evita usar baseTokenId/quoteTokenId directos
        baseToken: { connect: { id: base.id } },
        quoteToken: { connect: { id: quote.id } },
        minNotionalQ,
        minSizeB,
        priceTickQ,
      },
      update: {
        baseToken: { connect: { id: base.id } },
        quoteToken: { connect: { id: quote.id } },
        minNotionalQ,
        minSizeB,
        priceTickQ,
      },
    });
  }

  console.log('Markets seeded.');
}

void main().finally(() => prisma.$disconnect());
