// apps/api/test/matching/persistence.repository.spec.ts
//
// Phase 5 P0 fix: targeted coverage for attachRawToOrder + findRawOrderByHash
// after the signature-tuple persistence rewrite. PrismaClient is stubbed —
// we only assert the shape of the data the repo hands to Prisma.

import { PersistenceRepository } from '../../src/matching/persistence.repository';

type PrismaStub = {
  order: {
    update: jest.Mock;
    findUnique: jest.Mock;
  };
  trade?: {
    create: jest.Mock;
  };
};

function buildRepo(opts?: { findUniqueResult?: unknown }) {
  const prisma: PrismaStub = {
    order: {
      update: jest.fn().mockResolvedValue(undefined),
      findUnique: jest.fn().mockResolvedValue(opts?.findUniqueResult ?? null),
    },
  };
  const repo = new PersistenceRepository(
    // Phase 4.x-a: spec covers addTrade now, so wire a minimal ws emitter stub.
    { emitTrade: jest.fn() } as unknown as ConstructorParameters<
      typeof PersistenceRepository
    >[0],
  );
  // Override the default PrismaClient instance with our stub.
  (repo as unknown as { prisma: PrismaStub }).prisma = prisma;
  return { repo, prisma };
}

function buildRepoWithTrade(): {
  repo: PersistenceRepository;
  prisma: PrismaStub & { trade: { create: jest.Mock } };
  emitTrade: jest.Mock;
} {
  const emitTrade = jest.fn();
  const prisma = {
    order: {
      update: jest.fn(),
      findUnique: jest.fn(),
    },
    trade: {
      create: jest.fn().mockResolvedValue({ market: { symbol: 'WETH-USDC' } }),
    },
  };
  const repo = new PersistenceRepository({
    emitTrade,
  } as unknown as ConstructorParameters<typeof PersistenceRepository>[0]);
  (repo as unknown as { prisma: typeof prisma }).prisma = prisma;
  return { repo, prisma, emitTrade };
}

const R = ('0x' + 'a'.repeat(64)) as `0x${string}`;
const S = ('0x' + 'b'.repeat(64)) as `0x${string}`;
const ORDER_HASH = '0x' + 'c'.repeat(64);

const ORDER_BIG = {
  makerToken: '0xMakerToken0000000000000000000000000000aa',
  takerToken: '0xTakerToken0000000000000000000000000000bb',
  makerAmount: 1_000_000_000_000_000_000n,
  takerAmount: 300_000_000_000n,
  takerTokenFeeAmount: 0n,
  maker: '0xMaker0000000000000000000000000000000000cc',
  taker: '0x0000000000000000000000000000000000000000',
  sender: '0x0000000000000000000000000000000000000000',
  feeRecipient: '0x0000000000000000000000000000000000000000',
  pool: ('0x' + '0'.repeat(64)) as `0x${string}`,
  expiry: 1_700_000_000,
  salt: (1n << 130n) + 42n,
};

describe('PersistenceRepository.attachRawToOrder (Phase 5 P0 fix)', () => {
  it('packs ETHSIGN tuple + bigint-laden order; zeroExOrder is JSON-safe', async () => {
    const { repo, prisma } = buildRepo();
    await repo.attachRawToOrder({
      orderHash: ORDER_HASH,
      order: ORDER_BIG,
      signature: { signatureType: 3, v: 28, r: R, s: S },
    });
    expect(prisma.order.update).toHaveBeenCalledTimes(1);
    const arg = prisma.order.update.mock.calls[0][0] as {
      data: {
        zeroExOrder: Record<string, unknown>;
        signature: Uint8Array;
        expiry: bigint;
        salt: string;
      };
    };
    // JSON-safe: no `$type:"BigInt"` artefacts anywhere.
    expect(() => JSON.stringify(arg.data.zeroExOrder)).not.toThrow();
    expect(arg.data.zeroExOrder.makerAmount).toBe('1000000000000000000');
    // 66-byte packed signature with leading signatureType byte = 3 (ETHSIGN).
    expect(arg.data.signature.length).toBe(66);
    expect(arg.data.signature[0]).toBe(3);
    expect(arg.data.signature[65]).toBe(28);
    expect(arg.data.expiry).toBe(1_700_000_000n);
    expect(arg.data.salt).toBe(((1n << 130n) + 42n).toString());
  });

  it('packs 65-byte hex signature with default EIP-712 signatureType', async () => {
    const { repo, prisma } = buildRepo();
    const hex = `0x${'a'.repeat(64)}${'b'.repeat(64)}1c`;
    await repo.attachRawToOrder({
      orderHash: ORDER_HASH,
      order: { ...ORDER_BIG, makerAmount: '1', takerAmount: '1', salt: '1' },
      signature: hex,
    });
    const arg = prisma.order.update.mock.calls[0][0] as {
      data: { signature: Uint8Array };
    };
    expect(arg.data.signature[0]).toBe(2); // EIP-712 default
    expect(arg.data.signature[65]).toBe(28); // v=0x1c
  });

  it('throws on invalid signature; Prisma never called (rollback contract)', async () => {
    const { repo, prisma } = buildRepo();
    await expect(
      repo.attachRawToOrder({
        orderHash: ORDER_HASH,
        order: ORDER_BIG,
        signature: '',
      }),
    ).rejects.toThrow(/signature must be/i);
    expect(prisma.order.update).not.toHaveBeenCalled();
  });
});

describe('PersistenceRepository.findRawOrderByHash (Phase 5 P0 fix)', () => {
  it('returns full ETHSIGN tuple for a stored 66-byte buffer', async () => {
    const buf = Buffer.alloc(66);
    buf[0] = 3;
    Buffer.from(R.slice(2), 'hex').copy(buf, 1);
    Buffer.from(S.slice(2), 'hex').copy(buf, 33);
    buf[65] = 28;
    const { repo } = buildRepo({
      findUniqueResult: {
        zeroExOrder: { makerToken: '0xabc', makerAmount: '1' },
        signature: buf,
      },
    });
    const out = await repo.findRawOrderByHash(ORDER_HASH);
    expect(out.zeroExOrder).toEqual({ makerToken: '0xabc', makerAmount: '1' });
    expect(out.signature).toEqual({ signatureType: 3, v: 28, r: R, s: S });
  });

  it('returns null signature for legacy 65-byte buffer (treated as missing)', async () => {
    const { repo } = buildRepo({
      findUniqueResult: {
        zeroExOrder: { makerToken: '0xabc' },
        signature: Buffer.alloc(65),
      },
    });
    const out = await repo.findRawOrderByHash(ORDER_HASH);
    expect(out.signature).toBeNull();
  });

  it('returns null signature for legacy 0-byte buffer', async () => {
    const { repo } = buildRepo({
      findUniqueResult: {
        zeroExOrder: { makerToken: '0xabc' },
        signature: Buffer.alloc(0),
      },
    });
    const out = await repo.findRawOrderByHash(ORDER_HASH);
    expect(out.signature).toBeNull();
  });

  it('returns nulls when row does not exist', async () => {
    const { repo } = buildRepo({ findUniqueResult: null });
    const out = await repo.findRawOrderByHash(ORDER_HASH);
    expect(out).toEqual({ zeroExOrder: null, signature: null });
  });
});

describe('PersistenceRepository.addTrade — Phase 4.x-a optional txHash', () => {
  const MARKET_ID = 'm1';
  const MAKER_ORDER_HASH = '0x' + 'a'.repeat(64);
  const TAKER = '0xAaAaAaAaAaAaAaAaAaAaAaAaAaAaAaAaAaAaAaAa';
  const TX_HASH = '0x' + 'b'.repeat(64);
  const PRICE_TICKS = 300_000_000_000n;
  const SIZE_BASE = 100_000_000_000_000n;

  it('omits txHash from Prisma input when caller passes nothing (legacy /orderbook + dev/engine path)', async () => {
    const { repo, prisma } = buildRepoWithTrade();
    await repo.addTrade(
      MARKET_ID,
      MAKER_ORDER_HASH,
      TAKER,
      PRICE_TICKS,
      SIZE_BASE,
    );
    expect(prisma.trade.create).toHaveBeenCalledTimes(1);
    const data = (
      prisma.trade.create.mock.calls[0][0] as { data: Record<string, unknown> }
    ).data;
    expect(data.txHash).toBeUndefined();
    // The other columns must remain untouched.
    expect(data.marketId).toBe(MARKET_ID);
    expect(data.makerOrderHash).toBe(MAKER_ORDER_HASH);
    expect(data.taker).toBe(TAKER.toLowerCase());
    expect(data.priceTicks).toBe(PRICE_TICKS);
  });

  it('writes the lowercased 0x-prefixed txHash when caller (FillWatcher) supplies one', async () => {
    const { repo, prisma } = buildRepoWithTrade();
    // Mixed-case input simulates an upstream RPC response that hasn't been
    // canonicalised yet; the repo lowercases at the boundary.
    const mixed = ('0x' + 'B'.repeat(64)) as string;
    await repo.addTrade(
      MARKET_ID,
      MAKER_ORDER_HASH,
      TAKER,
      PRICE_TICKS,
      SIZE_BASE,
      mixed,
    );
    const data = (
      prisma.trade.create.mock.calls[0][0] as { data: Record<string, unknown> }
    ).data;
    expect(data.txHash).toBe(TX_HASH); // lowercased
  });

  it('collapses malformed txHash to undefined (writes NULL)', async () => {
    const { repo, prisma } = buildRepoWithTrade();
    // 63 hex chars after 0x → not 66 chars total → rejected.
    const bad = '0x' + 'a'.repeat(63);
    await repo.addTrade(
      MARKET_ID,
      MAKER_ORDER_HASH,
      TAKER,
      PRICE_TICKS,
      SIZE_BASE,
      bad,
    );
    const data = (
      prisma.trade.create.mock.calls[0][0] as { data: Record<string, unknown> }
    ).data;
    expect(data.txHash).toBeUndefined();
  });

  it('collapses empty-string txHash to undefined (writes NULL)', async () => {
    const { repo, prisma } = buildRepoWithTrade();
    await repo.addTrade(
      MARKET_ID,
      MAKER_ORDER_HASH,
      TAKER,
      PRICE_TICKS,
      SIZE_BASE,
      '',
    );
    const data = (
      prisma.trade.create.mock.calls[0][0] as { data: Record<string, unknown> }
    ).data;
    expect(data.txHash).toBeUndefined();
  });

  it('still emits the trade websocket event (no change for the FE consumers)', async () => {
    const { repo, emitTrade } = buildRepoWithTrade();
    await repo.addTrade(
      MARKET_ID,
      MAKER_ORDER_HASH,
      TAKER,
      PRICE_TICKS,
      SIZE_BASE,
      TX_HASH,
    );
    expect(emitTrade).toHaveBeenCalledTimes(1);
    const [symbol, payload] = emitTrade.mock.calls[0] as [
      string,
      Record<string, unknown>,
    ];
    expect(symbol).toBe('WETH-USDC');
    // We intentionally do NOT push txHash into the ws payload in Phase 4.x-a —
    // existing FE consumers are unaware of it; SEA tracking will read it from
    // the DB via Phase 4.x-c. Asserting the absence here protects against
    // accidental scope creep.
    expect(payload.txHash).toBeUndefined();
  });
});

describe('PersistenceRepository.findTradeByTxHashForIntent — Phase 4.x-b Blocker 4', () => {
  const TX_HASH = '0x' + 'b'.repeat(64);
  const MARKET_ID = 'm1';
  const OWNER = '0xAaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaAaa';

  function buildRepoForTradeLookup(findFirstResult: unknown) {
    const emitTrade = jest.fn();
    const prisma = {
      order: { update: jest.fn(), findUnique: jest.fn() },
      trade: {
        create: jest.fn(),
        findFirst: jest.fn().mockResolvedValue(findFirstResult),
      },
    };
    const repo = new PersistenceRepository({
      emitTrade,
    } as unknown as ConstructorParameters<typeof PersistenceRepository>[0]);
    (repo as unknown as { prisma: typeof prisma }).prisma = prisma;
    return { repo, prisma };
  }

  it('binds all three constraints (txHash + marketId + taker=owner) in ONE WHERE clause', async () => {
    const { repo, prisma } = buildRepoForTradeLookup({
      id: 42n,
      makerOrderHash: '0xmaker',
      sizeBase: '12345',
    });
    const out = await repo.findTradeByTxHashForIntent({
      txHash: TX_HASH.toUpperCase(),
      marketId: MARKET_ID,
      owner: OWNER,
    });
    expect(out).toEqual({
      id: 42n,
      makerOrderHash: '0xmaker',
      sizeBase: '12345',
    });
    const call = prisma.trade.findFirst.mock.calls[0][0] as {
      where: Record<string, unknown>;
    };
    expect(call.where).toEqual({
      txHash: TX_HASH, // lowercased
      marketId: MARKET_ID,
      taker: OWNER.toLowerCase(),
    });
  });

  it('returns null when prisma returns null (foreign-market or wrong-taker stays null)', async () => {
    const { repo } = buildRepoForTradeLookup(null);
    const out = await repo.findTradeByTxHashForIntent({
      txHash: TX_HASH,
      marketId: MARKET_ID,
      owner: OWNER,
    });
    expect(out).toBeNull();
  });
});
