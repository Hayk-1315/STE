// apps/api/src/onchain/cancel-pair-floor.repository.ts
//
// Phase 3.x-b: persistence layer for the highest observed
// `minValidSalt` per (maker, makerToken, takerToken) triple.
//
// Provided globally via CancelPairFloorModule so both
// CancelWatcherService (writer) and IntentValidatorService (reader)
// can inject it without a forwardRef chain. Keeps the project's
// "per-repo PrismaClient" convention.
import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

export type UpsertFloorInput = {
  maker: string;
  makerToken: string;
  takerToken: string;
  minValidSalt: bigint;
  fromTxHash?: string | null;
};

@Injectable()
export class CancelPairFloorRepository {
  private prisma = new PrismaClient();

  /**
   * Atomic monotonic upsert: on conflict, the stored value moves to
   * `GREATEST(existing, new)`. Re-processing the same on-chain event
   * (e.g. after a chain re-org) is therefore a no-op. `fromTxHash` is
   * only updated when the salt actually moves up — older history is
   * preserved when an out-of-order older event lands later.
   *
   * All address inputs are lowercased at the SQL boundary so keys are
   * normalized regardless of caller casing.
   */
  async upsertFloor(input: UpsertFloorInput): Promise<void> {
    const maker = input.maker.toLowerCase();
    const makerToken = input.makerToken.toLowerCase();
    const takerToken = input.takerToken.toLowerCase();
    const saltStr = input.minValidSalt.toString();
    const txHash = input.fromTxHash ?? null;

    await this.prisma.$executeRaw`
      INSERT INTO "CancelPairFloor"
        (maker, "makerToken", "takerToken", "minValidSalt", "observedAt", "updatedAt", "fromTxHash")
      VALUES
        (${maker}, ${makerToken}, ${takerToken}, ${saltStr}::numeric, NOW(), NOW(), ${txHash})
      ON CONFLICT (maker, "makerToken", "takerToken") DO UPDATE
        SET "minValidSalt" = GREATEST("CancelPairFloor"."minValidSalt", EXCLUDED."minValidSalt"),
            "updatedAt"    = NOW(),
            "fromTxHash"   = CASE
                               WHEN EXCLUDED."minValidSalt" > "CancelPairFloor"."minValidSalt"
                               THEN EXCLUDED."fromTxHash"
                               ELSE "CancelPairFloor"."fromTxHash"
                             END
    `;
  }

  /**
   * Read the current floor. Returns null when no row exists for the
   * triple. Lookups are O(1) by composite primary key.
   */
  async getFloor(
    maker: string,
    makerToken: string,
    takerToken: string,
  ): Promise<bigint | null> {
    const row = await this.prisma.cancelPairFloor.findUnique({
      where: {
        maker_makerToken_takerToken: {
          maker: maker.toLowerCase(),
          makerToken: makerToken.toLowerCase(),
          takerToken: takerToken.toLowerCase(),
        },
      },
      select: { minValidSalt: true },
    });
    return row
      ? CancelPairFloorRepository.decimalToBigInt(row.minValidSalt)
      : null;
  }

  /**
   * Safely convert a Prisma `Decimal(78,0)` (or compatible) to `bigint`.
   *
   * The column type is `Decimal(78,0)`, but at the JS boundary Prisma
   * returns a `decimal.js`-backed object whose `toString()` may emit
   * exponent notation for large values (e.g. `"4.8125e+38"`). `BigInt()`
   * only accepts plain integer strings, so the naive
   * `BigInt(value.toString())` form crashes with `SyntaxError` at the
   * call site — surfacing as a 500 from `IntentValidatorService` when
   * the floor row contains a real-world salt of the shape
   * `(uint256 ts) << 96`.
   *
   * Decimal.js's `toFixed(0)` always produces a plain integer string
   * with no exponent, so it is the canonical safe stringifier here.
   * However `toFixed(0)` ALSO rounds half-away-from-zero, which would
   * silently mask a `1.5` floor value as `2`. We therefore reject
   * non-integer Decimal values BEFORE calling `toFixed(0)`, using
   * whichever predicate the input exposes (`isInteger`, `isInt`, or
   * `decimalPlaces() === 0`). Same defensive validation runs for raw
   * strings: fractional or scientific-notation inputs are rejected.
   *
   * Accepted shapes:
   *   - `bigint`
   *   - safe integer `number`
   *   - plain integer `string` (no `.`, no `e`/`E`)
   *   - decimal.js / Prisma.Decimal instance (uses `toFixed(0)` after
   *     integer pre-check)
   *   - any object exposing only `toString()` (test stubs / raw SQL
   *     results) — output must be a plain integer string
   *
   * Throws on anything else with `cancel_pair_floor: ...` so the
   * caller's BadRequestException wrapping produces a clear log line
   * instead of an opaque SyntaxError.
   */
  private static decimalToBigInt(v: unknown): bigint {
    if (typeof v === 'bigint') return v;

    if (typeof v === 'number') {
      if (!Number.isFinite(v) || !Number.isInteger(v)) {
        throw new Error(
          `cancel_pair_floor: minValidSalt is not a plain integer (got number ${v})`,
        );
      }
      return BigInt(v);
    }

    if (typeof v === 'string') {
      return CancelPairFloorRepository.parseIntegerString(v);
    }

    if (v && typeof v === 'object') {
      const o = v as {
        isInteger?: () => boolean;
        isInt?: () => boolean;
        decimalPlaces?: () => number;
        toFixed?: (n: number) => string;
        toString: () => string;
      };

      // Reject non-integers BEFORE toFixed(0) — toFixed rounds.
      if (typeof o.isInteger === 'function' && !o.isInteger()) {
        throw new Error(
          'cancel_pair_floor: minValidSalt is not an integer (Decimal.isInteger() = false)',
        );
      }
      if (typeof o.isInt === 'function' && !o.isInt()) {
        throw new Error(
          'cancel_pair_floor: minValidSalt is not an integer (Decimal.isInt() = false)',
        );
      }
      if (typeof o.decimalPlaces === 'function' && o.decimalPlaces() !== 0) {
        throw new Error(
          'cancel_pair_floor: minValidSalt is not an integer (decimalPlaces > 0)',
        );
      }

      // Prefer toFixed(0): decimal.js never emits exponent notation here.
      if (typeof o.toFixed === 'function') {
        return CancelPairFloorRepository.parseIntegerString(o.toFixed(0));
      }

      // Last resort (tests / raw SQL): toString must be a plain integer.
      return CancelPairFloorRepository.parseIntegerString(o.toString());
    }

    throw new Error(
      `cancel_pair_floor: minValidSalt has unsupported type ${typeof v}`,
    );
  }

  private static parseIntegerString(s: string): bigint {
    const trimmed = s.trim();
    // Reject empty, fractional, scientific (1e+20), hex, etc. Only plain
    // signed integer strings pass.
    if (!/^-?\d+$/.test(trimmed)) {
      throw new Error(
        `cancel_pair_floor: minValidSalt is not a plain integer string (got ${JSON.stringify(
          s,
        )})`,
      );
    }
    return BigInt(trimmed);
  }
}
