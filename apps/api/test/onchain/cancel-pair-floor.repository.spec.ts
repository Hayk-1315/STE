// apps/api/test/onchain/cancel-pair-floor.repository.spec.ts
// DB-free coverage of the Phase 3.x-b CancelPairFloorRepository.
// Asserts the SQL is shaped correctly and lowercases inputs at the
// boundary. Monotonicity itself is enforced in Postgres via
// GREATEST(...)+ON CONFLICT, which is exercised in integration; this
// spec verifies the call shape and getFloor return contract.
import { CancelPairFloorRepository } from '../../src/onchain/cancel-pair-floor.repository';

type PrismaStub = {
  $executeRaw: jest.Mock;
  cancelPairFloor: { findUnique: jest.Mock };
};

function buildRepo(opts?: {
  findUniqueResult?: { minValidSalt: { toString: () => string } } | null;
}) {
  const prisma: PrismaStub = {
    $executeRaw: jest.fn().mockResolvedValue(1),
    cancelPairFloor: {
      findUnique: jest.fn().mockResolvedValue(opts?.findUniqueResult ?? null),
    },
  };
  const repo = new CancelPairFloorRepository();
  // Override the default-instantiated PrismaClient with our stub.
  (repo as unknown as { prisma: PrismaStub }).prisma = prisma;
  return { repo, prisma };
}

const MAKER = '0xAaAaAaAaAaAaAaAaAaAaAaAaAaAaAaAaAaAaAaAa';
const MAKER_TOKEN = '0x1111111111111111111111111111111111111111';
const TAKER_TOKEN = '0x2222222222222222222222222222222222222222';
const TX = '0x' + 'c'.repeat(64);

describe('CancelPairFloorRepository.upsertFloor', () => {
  it('issues a single $executeRaw call with lowercased addresses and the salt as numeric', async () => {
    const { repo, prisma } = buildRepo();
    await repo.upsertFloor({
      maker: MAKER,
      makerToken: MAKER_TOKEN.toUpperCase(),
      takerToken: TAKER_TOKEN,
      minValidSalt: 12345n,
      fromTxHash: TX,
    });
    expect(prisma.$executeRaw).toHaveBeenCalledTimes(1);

    // Prisma tagged-template form: first arg is the strings array, then values.
    const callArgs = prisma.$executeRaw.mock.calls[0] as unknown[];
    const values = callArgs.slice(1);
    // Order matches the template: maker, makerToken, takerToken, salt, txHash.
    expect(values[0]).toBe(MAKER.toLowerCase());
    expect(values[1]).toBe(MAKER_TOKEN.toLowerCase());
    expect(values[2]).toBe(TAKER_TOKEN.toLowerCase());
    expect(values[3]).toBe('12345');
    expect(values[4]).toBe(TX);

    // The SQL itself must use GREATEST(...) so monotonicity is enforced
    // at the database level regardless of caller order.
    const stringsArr = callArgs[0] as TemplateStringsArray;
    const sql = stringsArr.join(' ');
    expect(sql).toMatch(/GREATEST/);
    expect(sql).toMatch(/ON CONFLICT/);
  });

  it('passes null fromTxHash when not provided', async () => {
    const { repo, prisma } = buildRepo();
    await repo.upsertFloor({
      maker: MAKER,
      makerToken: MAKER_TOKEN,
      takerToken: TAKER_TOKEN,
      minValidSalt: 1n,
    });
    const values = (prisma.$executeRaw.mock.calls[0] as unknown[]).slice(1);
    expect(values[4]).toBeNull();
  });
});

describe('CancelPairFloorRepository.getFloor', () => {
  it('returns the stored salt as bigint when a row exists', async () => {
    const { repo, prisma } = buildRepo({
      findUniqueResult: { minValidSalt: { toString: () => '987654321' } },
    });
    const out = await repo.getFloor(MAKER, MAKER_TOKEN, TAKER_TOKEN);
    expect(out).toBe(987654321n);
    expect(prisma.cancelPairFloor.findUnique).toHaveBeenCalledTimes(1);
    const args = prisma.cancelPairFloor.findUnique.mock.calls[0][0] as {
      where: { maker_makerToken_takerToken: Record<string, string> };
    };
    expect(args.where.maker_makerToken_takerToken).toEqual({
      maker: MAKER.toLowerCase(),
      makerToken: MAKER_TOKEN.toLowerCase(),
      takerToken: TAKER_TOKEN.toLowerCase(),
    });
  });

  it('returns null when no row exists', async () => {
    const { repo } = buildRepo({ findUniqueResult: null });
    const out = await repo.getFloor(MAKER, MAKER_TOKEN, TAKER_TOKEN);
    expect(out).toBeNull();
  });

  // Regression for the P0 bug where Prisma's Decimal(78,0) stringified
  // very large values in exponent notation (e.g. "4.8125e+38"), which
  // `BigInt(...)` then rejected with SyntaxError. The repo must use a
  // non-exponent stringifier (Decimal.toFixed(0)) and reject non-integer
  // values BEFORE toFixed rounds them.
  it('returns bigint when minValidSalt is a Decimal whose toString() is exponent notation', async () => {
    const PLAIN = '481253173071921173935285369534383390720'; // 39 digits
    const SCI = '4.8125317307192117393528536953438339072e+38';
    const decimalLike = {
      isInteger: () => true,
      toFixed: (_n: number) => PLAIN,
      toString: () => SCI,
    } as unknown as { toString: () => string };
    const { repo } = buildRepo({
      findUniqueResult: { minValidSalt: decimalLike },
    });
    const out = await repo.getFloor(MAKER, MAKER_TOKEN, TAKER_TOKEN);
    expect(out).toBe(BigInt(PLAIN));
  });

  it('rejects non-integer Decimal-like values (isInteger=false) without rounding via toFixed', async () => {
    const decimalLike = {
      // Pretend toFixed(0) would round 1.5 → 2; the helper must NOT rely on it.
      isInteger: () => false,
      toFixed: (_n: number) => '2',
      toString: () => '1.5',
    } as unknown as { toString: () => string };
    const { repo } = buildRepo({
      findUniqueResult: { minValidSalt: decimalLike },
    });
    await expect(
      repo.getFloor(MAKER, MAKER_TOKEN, TAKER_TOKEN),
    ).rejects.toThrow(/not an integer/i);
  });

  it('rejects non-integer Decimal-like values detected via decimalPlaces() > 0', async () => {
    const decimalLike = {
      // Some Decimal libs expose decimalPlaces() instead of isInteger.
      decimalPlaces: () => 2,
      toFixed: (_n: number) => '2',
      toString: () => '1.50',
    } as unknown as { toString: () => string };
    const { repo } = buildRepo({
      findUniqueResult: { minValidSalt: decimalLike },
    });
    await expect(
      repo.getFloor(MAKER, MAKER_TOKEN, TAKER_TOKEN),
    ).rejects.toThrow(/not an integer/i);
  });

  it('rejects fractional string-shaped minValidSalt', async () => {
    const stringy = { toString: () => '1.5' } as unknown as {
      toString: () => string;
    };
    const { repo } = buildRepo({ findUniqueResult: { minValidSalt: stringy } });
    await expect(
      repo.getFloor(MAKER, MAKER_TOKEN, TAKER_TOKEN),
    ).rejects.toThrow(/not a plain integer string/i);
  });

  it('rejects scientific-notation string when no toFixed() is exposed', async () => {
    // Simulates a degraded Decimal stub that lost its toFixed method —
    // toString() returns exponent notation. The legacy code path would
    // have called BigInt('1e+20') and thrown SyntaxError. The new helper
    // must surface a clear `not a plain integer string` error instead.
    const stringy = { toString: () => '1e+20' } as unknown as {
      toString: () => string;
    };
    const { repo } = buildRepo({ findUniqueResult: { minValidSalt: stringy } });
    await expect(
      repo.getFloor(MAKER, MAKER_TOKEN, TAKER_TOKEN),
    ).rejects.toThrow(/not a plain integer string/i);
  });
});
