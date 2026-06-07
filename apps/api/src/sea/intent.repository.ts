// apps/api/src/sea/intent.repository.ts
import { Injectable } from '@nestjs/common';
import {
  PrismaClient,
  Prisma,
  IntentStatus,
  IntentType,
  OrderSide,
  TriggerType,
  ReferencePriceKind,
  ExecutionAuthority,
  type Intent,
} from '@prisma/client';
import type { StructuredIntent } from './dto/intent.dto';

export type CreateIntentInput = {
  owner: string;
  marketId: string;
  structuredIntent: StructuredIntent;
  preSignedOrder: unknown;
  preSignedSignatureHex: string | null;
  preSignedOrderHash: string | null;
  rawText: string | null;
  parserMeta: unknown;
  expiresAt: Date;
  // Phase 2: defaults to ACTIVE on successful validation. DRAFT is retained
  // for forward-compat with Phase 6 AI parse-without-activate flows.
  initialStatus?: IntentStatus;
};

export type IntentDto = ReturnType<typeof serializeIntent>;

@Injectable()
export class IntentRepository {
  private prisma = new PrismaClient();

  async resolveMarketId(idOrSymbol: string): Promise<string | null> {
    const m = await this.prisma.market.findFirst({
      where: { OR: [{ id: idOrSymbol }, { symbol: idOrSymbol }] },
      select: { id: true },
    });
    return m?.id ?? null;
  }

  async create(input: CreateIntentInput): Promise<IntentDto> {
    const si = input.structuredIntent;
    const sigBuf =
      input.preSignedSignatureHex &&
      input.preSignedSignatureHex.startsWith('0x')
        ? Buffer.from(input.preSignedSignatureHex.slice(2), 'hex')
        : undefined;

    const data: Prisma.IntentCreateInput = {
      owner: input.owner,
      market: { connect: { id: input.marketId } },
      type: si.type as IntentType,
      status: input.initialStatus ?? IntentStatus.ACTIVE,
      side: si.side as OrderSide,
      sizeBase: new Prisma.Decimal(si.sizeBase),
      limitPriceTicks:
        si.type === 'CONDITIONAL_LIMIT' ? BigInt(si.limitPriceTicks) : null,
      tif: si.type === 'CONDITIONAL_MARKET_READY' ? (si.tif ?? 'IOC') : null,
      triggerType: si.trigger.type as TriggerType,
      triggerReference: si.trigger.reference as ReferencePriceKind,
      triggerPriceTicks: BigInt(si.trigger.priceTicks),
      executionAuthority: si.executionAuthority as ExecutionAuthority,
      preSignedOrderHash: input.preSignedOrderHash
        ? input.preSignedOrderHash.toLowerCase()
        : null,
      ...(input.preSignedOrder !== null && input.preSignedOrder !== undefined
        ? { preSignedOrder: input.preSignedOrder as Prisma.InputJsonValue }
        : {}),
      ...(sigBuf ? { preSignedSignature: sigBuf } : {}),
      rawText: input.rawText,
      parsedJson: si as unknown as Prisma.InputJsonValue,
      ...(input.parserMeta !== null && input.parserMeta !== undefined
        ? { parserMeta: input.parserMeta as Prisma.InputJsonValue }
        : {}),
      expiresAt: input.expiresAt,
    };

    const row = await this.prisma.intent.create({ data });
    return serializeIntent(row);
  }

  async listByOwner(
    owner: string,
    statuses: IntentStatus[] | undefined,
    limit: number,
  ): Promise<IntentDto[]> {
    const rows = await this.prisma.intent.findMany({
      where: {
        owner,
        ...(statuses && statuses.length > 0
          ? { status: { in: statuses } }
          : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
    return rows.map(serializeIntent);
  }

  async findById(id: string): Promise<IntentDto | null> {
    const row = await this.prisma.intent.findUnique({ where: { id } });
    return row ? serializeIntent(row) : null;
  }

  /**
   * Read-only existence check on the Order table for orderHash idempotency
   * during Phase 2 validation. Lives here to keep all SEA Prisma access
   * inside the SEA module (mirrors the project's "per-repo PrismaClient"
   * convention).
   */
  async orderHashExists(orderHash: string): Promise<boolean> {
    const row = await this.prisma.order.findUnique({
      where: { orderHash },
      select: { orderHash: true },
    });
    return !!row;
  }

  /**
   * Phase 4 monitor input: ACTIVE CMR intents whose cooldown (if any) has
   * elapsed and that have not yet hit their hard expiry. Returns only the
   * fields the monitor + prepare service need; no pre-signed payloads
   * because CMR has none.
   */
  async findActiveCMRIntents(limit: number): Promise<
    Array<{
      id: string;
      owner: string;
      marketId: string;
      marketSymbol: string;
      side: OrderSide;
      sizeBase: bigint;
      triggerType: TriggerType;
      triggerReference: ReferencePriceKind;
      triggerPriceTicks: bigint;
      expiresAt: Date;
    }>
  > {
    const now = new Date();
    const rows = await this.prisma.intent.findMany({
      where: {
        type: IntentType.CONDITIONAL_MARKET_READY,
        status: IntentStatus.ACTIVE,
        expiresAt: { gt: now },
        OR: [{ cooldownUntilAt: null }, { cooldownUntilAt: { lte: now } }],
      },
      take: Math.max(1, Math.min(limit, 500)),
      orderBy: { createdAt: 'asc' },
      include: { market: { select: { symbol: true } } },
    });
    return rows.map((r) => ({
      id: r.id,
      owner: r.owner,
      marketId: r.marketId,
      marketSymbol: r.market.symbol,
      side: r.side,
      sizeBase: BigInt(r.sizeBase.toString()),
      triggerType: r.triggerType,
      triggerReference: r.triggerReference,
      triggerPriceTicks: r.triggerPriceTicks,
      expiresAt: r.expiresAt,
    }));
  }

  /**
   * Phase 4 monitor input: READY CMR intents along with `preparedQuoteAt`
   * and the persisted `preparedQuote` JSON (so the monitor can read the
   * `ttlSec` stamped into the snapshot at READY-time without depending on
   * the live env value). Phase 4.x-b adds `walletLockUntilAt` so the
   * monitor can short-circuit re-arm during the wallet-lock window.
   */
  async findReadyCMRIntents(limit: number): Promise<
    Array<{
      id: string;
      owner: string;
      marketId: string;
      preparedQuote: Prisma.JsonValue | null;
      preparedQuoteAt: Date | null;
      walletLockUntilAt: Date | null;
      expiresAt: Date;
    }>
  > {
    const rows = await this.prisma.intent.findMany({
      where: {
        type: IntentType.CONDITIONAL_MARKET_READY,
        status: IntentStatus.READY,
      },
      take: Math.max(1, Math.min(limit, 500)),
      orderBy: { preparedQuoteAt: 'asc' },
    });
    return rows.map((r) => ({
      id: r.id,
      owner: r.owner,
      marketId: r.marketId,
      preparedQuote: r.preparedQuote,
      preparedQuoteAt: r.preparedQuoteAt,
      walletLockUntilAt: r.walletLockUntilAt,
      expiresAt: r.expiresAt,
    }));
  }

  /**
   * Phase 4.x-b: stamp `walletLockUntilAt` on a READY row, keyed on the
   * exact `preparedQuoteAt` the caller observed. Compound-where prevents
   * a concurrent monitor re-arm (which clears `preparedQuoteAt`) from
   * being shadowed by this update. Returns true on success.
   */
  async lockWalletFromReady(
    id: string,
    preparedQuoteAt: Date,
    walletLockUntilAt: Date,
  ): Promise<boolean> {
    const result = await this.prisma.intent.updateMany({
      where: { id, status: IntentStatus.READY, preparedQuoteAt },
      data: { walletLockUntilAt },
    });
    return result.count > 0;
  }

  /**
   * Phase 4.x-b marker fast-path A: `READY → EXECUTED` in a single atomic
   * UPDATE when the supplied txHash has already been reconciled into a
   * Trade row for THIS intent's (marketId, owner). Stamps `linkedTxHash`
   * in the same UPDATE. Used by `IntentService.markExecuting` after
   * `PersistenceRepository.findTradeByTxHashForIntent` returns a hit.
   */
  async markExecutedFromReady(
    id: string,
    linkedTxHash: string,
  ): Promise<boolean> {
    const result = await this.prisma.intent.updateMany({
      where: { id, status: IntentStatus.READY },
      data: {
        status: IntentStatus.EXECUTED,
        linkedTxHash: linkedTxHash.toLowerCase(),
        lastEvaluatedAt: new Date(),
      },
    });
    return result.count > 0;
  }

  /**
   * Phase 4.x-b marker fast-path B: `READY → FAILED` when receipt status
   * for the supplied txHash is 0 (tx reverted) AT marker time. Stamps
   * `linkedTxHash` + `failureReason='tx_reverted_at_marker'`.
   */
  async markFailedFromReady(
    id: string,
    linkedTxHash: string,
    reason: string,
  ): Promise<boolean> {
    const result = await this.prisma.intent.updateMany({
      where: { id, status: IntentStatus.READY },
      data: {
        status: IntentStatus.FAILED,
        linkedTxHash: linkedTxHash.toLowerCase(),
        failureReason: reason,
        lastEvaluatedAt: new Date(),
      },
    });
    return result.count > 0;
  }

  /**
   * Phase 4.x-b marker normal path: `READY → EXECUTING` with `linkedTxHash`.
   */
  async markExecuting(id: string, linkedTxHash: string): Promise<boolean> {
    const result = await this.prisma.intent.updateMany({
      where: { id, status: IntentStatus.READY },
      data: {
        status: IntentStatus.EXECUTING,
        linkedTxHash: linkedTxHash.toLowerCase(),
        lastEvaluatedAt: new Date(),
      },
    });
    return result.count > 0;
  }

  /**
   * Phase 4.x-c FillWatcher reconciler: `EXECUTING → EXECUTED` when an
   * on-chain Trade row matches the intent's `linkedTxHash`. Compound-where
   * on the current status so concurrent ticks cannot double-write.
   */
  async markExecuted(id: string, linkedTxHash: string): Promise<boolean> {
    const result = await this.prisma.intent.updateMany({
      where: {
        id,
        status: IntentStatus.EXECUTING,
        linkedTxHash: linkedTxHash.toLowerCase(),
      },
      data: {
        status: IntentStatus.EXECUTED,
        lastEvaluatedAt: new Date(),
      },
    });
    return result.count > 0;
  }

  /**
   * Phase 4.x-c FillWatcher reconciler: `EXECUTING → FAILED` when the
   * on-chain receipt for the intent's `linkedTxHash` has `status === 0`.
   */
  async markFailedFromExecuting(
    id: string,
    linkedTxHash: string,
    reason: string,
  ): Promise<boolean> {
    const result = await this.prisma.intent.updateMany({
      where: {
        id,
        status: IntentStatus.EXECUTING,
        linkedTxHash: linkedTxHash.toLowerCase(),
      },
      data: {
        status: IntentStatus.FAILED,
        failureReason: reason,
        lastEvaluatedAt: new Date(),
      },
    });
    return result.count > 0;
  }

  /**
   * Phase 4.x-d stale EXECUTING sweeper. Two-step pattern: SELECT
   * candidate ids whose `updatedAt` is older than the threshold, then
   * per-row compound-where UPDATE so we race-safely with the
   * FillWatcher's `markExecuted` / `markFailedFromExecuting` (both
   * compound-where on `status=EXECUTING`). Adding `updatedAt: { lt: cutoff }`
   * to the UPDATE WHERE additionally rejects rows that were freshly
   * re-stamped EXECUTING between SELECT and UPDATE.
   *
   * Returns the ids that actually transitioned (`updateMany.count > 0`).
   * Caller appends `IntentEvent('FAILED', { reason: 'stale_pending' })`
   * for those ids only.
   */
  async sweepStaleExecuting(
    limit: number,
    staleThresholdMs: number,
  ): Promise<string[]> {
    const cutoff = new Date(Date.now() - staleThresholdMs);
    const candidates = await this.prisma.intent.findMany({
      where: {
        status: IntentStatus.EXECUTING,
        updatedAt: { lt: cutoff },
      },
      select: { id: true },
      take: Math.max(1, Math.min(limit, 500)),
      orderBy: { updatedAt: 'asc' },
    });

    const swept: string[] = [];
    for (const c of candidates) {
      const result = await this.prisma.intent.updateMany({
        where: {
          id: c.id,
          status: IntentStatus.EXECUTING,
          updatedAt: { lt: cutoff },
        },
        data: {
          status: IntentStatus.FAILED,
          failureReason: 'stale_pending',
          lastEvaluatedAt: new Date(),
        },
      });
      if (result.count > 0) swept.push(c.id);
    }
    return swept;
  }

  /**
   * Phase 4.x-c ownership-bound lookup. All three constraints in one
   * WHERE clause — a foreign txHash, a cross-market hash, or a wrong-taker
   * hash returns null at the DB layer and CANNOT drive a state transition.
   */
  async findExecutingByTxHashForOwner(p: {
    txHash: string;
    marketId: string;
    owner: string;
  }): Promise<{ id: string } | null> {
    return this.prisma.intent.findFirst({
      where: {
        status: IntentStatus.EXECUTING,
        linkedTxHash: p.txHash.toLowerCase(),
        marketId: p.marketId,
        owner: p.owner.toLowerCase(),
      },
      select: { id: true },
    });
  }

  /**
   * Phase 4 atomic transition `ACTIVE → READY`. Returns true on success, false
   * on lost race (e.g. concurrent cancel or expiry sweeper moved the row).
   */
  async markReady(
    id: string,
    preparedQuote: Prisma.InputJsonValue,
    preparedAt: Date,
  ): Promise<boolean> {
    const result = await this.prisma.intent.updateMany({
      where: { id, status: IntentStatus.ACTIVE },
      data: {
        status: IntentStatus.READY,
        preparedQuote,
        preparedQuoteAt: preparedAt,
        lastEvaluatedAt: preparedAt,
      },
    });
    return result.count > 0;
  }

  /**
   * Phase 4 atomic transition `READY → ACTIVE` (re-arm after TTL expiry).
   * Clears the prepared snapshot and stamps a cooldown so the next tick
   * does not immediately re-prepare.
   */
  async rearmFromReady(id: string, cooldownUntilAt: Date): Promise<boolean> {
    const result = await this.prisma.intent.updateMany({
      where: { id, status: IntentStatus.READY },
      data: {
        status: IntentStatus.ACTIVE,
        preparedQuote: Prisma.JsonNull,
        preparedQuoteAt: null,
        cooldownUntilAt,
        lastEvaluatedAt: new Date(),
      },
    });
    return result.count > 0;
  }

  /**
   * Phase 4 atomic transition `READY → EXPIRED` (when `now > expiresAt`
   * while the intent is sitting in READY waiting for the user to confirm).
   */
  async markExpiredFromReady(id: string, reason: string): Promise<boolean> {
    const result = await this.prisma.intent.updateMany({
      where: { id, status: IntentStatus.READY },
      data: {
        status: IntentStatus.EXPIRED,
        preparedQuote: Prisma.JsonNull,
        preparedQuoteAt: null,
        failureReason: reason,
        lastEvaluatedAt: new Date(),
      },
    });
    return result.count > 0;
  }

  /**
   * Phase 4 helper: bump `cooldownUntilAt` without changing status. Used by
   * the CMR debounced `PROGRESS('insufficient_liquidity')` path so the
   * monitor does not append duplicate progress events on consecutive ticks.
   * Compound-where on `ACTIVE` so we never accidentally bump a READY or
   * terminal row.
   */
  async setActiveCooldown(id: string, cooldownUntilAt: Date): Promise<boolean> {
    const result = await this.prisma.intent.updateMany({
      where: { id, status: IntentStatus.ACTIVE },
      data: { cooldownUntilAt, lastEvaluatedAt: new Date() },
    });
    return result.count > 0;
  }

  /**
   * Phase 3 monitor input: returns active CL intents with their market symbol
   * joined in. Includes `preSignedOrder`/`preSignedSignature`/`preSignedOrderHash`
   * because the fire path needs them to reconstruct the placement payload.
   * Bounded by `limit` to keep monitor ticks cheap; ordered by `createdAt asc`
   * so older intents fire first under contention.
   */
  async findActiveCLIntents(limit: number): Promise<
    Array<{
      id: string;
      owner: string;
      marketId: string;
      marketSymbol: string;
      side: OrderSide;
      sizeBase: bigint;
      limitPriceTicks: bigint;
      triggerType: TriggerType;
      triggerReference: ReferencePriceKind;
      triggerPriceTicks: bigint;
      preSignedOrder: Prisma.JsonValue;
      preSignedSignature: Buffer | null;
      preSignedOrderHash: string | null;
      expiresAt: Date;
    }>
  > {
    const rows = await this.prisma.intent.findMany({
      where: {
        type: IntentType.CONDITIONAL_LIMIT,
        status: IntentStatus.ACTIVE,
        expiresAt: { gt: new Date() },
      },
      take: Math.max(1, Math.min(limit, 500)),
      orderBy: { createdAt: 'asc' },
      include: { market: { select: { symbol: true } } },
    });
    return rows.map((r) => ({
      id: r.id,
      owner: r.owner,
      marketId: r.marketId,
      marketSymbol: r.market.symbol,
      side: r.side,
      sizeBase: BigInt(r.sizeBase.toString()),
      // CL rows always have limitPriceTicks; null is a schema-allowed corner
      // case for non-CL types so we coerce via BigInt(0) defensively.
      limitPriceTicks:
        r.limitPriceTicks !== null && r.limitPriceTicks !== undefined
          ? r.limitPriceTicks
          : 0n,
      triggerType: r.triggerType,
      triggerReference: r.triggerReference,
      triggerPriceTicks: r.triggerPriceTicks,
      preSignedOrder: r.preSignedOrder,
      preSignedSignature: r.preSignedSignature as Buffer | null,
      preSignedOrderHash: r.preSignedOrderHash,
      expiresAt: r.expiresAt,
    }));
  }

  /**
   * Phase 3.x-a expiry sweeper input. Finds intents whose `expiresAt` has
   * passed and that are still in a sweepable state (DRAFT or ACTIVE only —
   * mid-execution and terminal statuses are deliberately excluded), and
   * atomically transitions each to EXPIRED with a documented failureReason.
   * Returns the ids that were actually transitioned (race-safe: a row that
   * left DRAFT/ACTIVE between the candidate fetch and the per-row guard
   * will be skipped, not double-counted).
   */
  async expireDueIntents(limit: number): Promise<string[]> {
    const now = new Date();
    const candidates = await this.prisma.intent.findMany({
      where: {
        status: { in: [IntentStatus.DRAFT, IntentStatus.ACTIVE] },
        expiresAt: { lt: now },
      },
      select: { id: true, status: true },
      take: Math.max(1, Math.min(limit, 500)),
      orderBy: { expiresAt: 'asc' },
    });

    const expiredIds: string[] = [];
    for (const c of candidates) {
      const result = await this.prisma.intent.updateMany({
        where: { id: c.id, status: c.status },
        data: {
          status: IntentStatus.EXPIRED,
          failureReason: 'intent_expired_by_ts',
          lastEvaluatedAt: now,
        },
      });
      if (result.count > 0) expiredIds.push(c.id);
    }
    return expiredIds;
  }

  /**
   * Atomic transition `TRIGGERED → PLACED` with `linkedOrderHash` set in the
   * same UPDATE. Returns true if the row was updated; false on lost race
   * (e.g., a concurrent failure path moved it to FAILED).
   */
  async markPlaced(id: string, linkedOrderHash: string): Promise<boolean> {
    const result = await this.prisma.intent.updateMany({
      where: { id, status: IntentStatus.TRIGGERED },
      data: {
        status: IntentStatus.PLACED,
        linkedOrderHash: linkedOrderHash.toLowerCase(),
        lastEvaluatedAt: new Date(),
      },
    });
    return result.count > 0;
  }

  /**
   * Find a non-terminal Intent that already references the same pre-signed
   * 0x orderHash. Used by the Phase 2 validator to reject duplicate CL
   * submissions of the same underlying signed order while a previous
   * intent is still live. Terminal-state intents (CANCELLED, EXPIRED,
   * FAILED, REJECTED, PLACED, EXECUTED) are intentionally excluded —
   * their underlying hash either reached the Order table (caught
   * separately by `orderHashExists`) or is irrelevant for fresh activation.
   */
  async findActiveByPreSignedHash(
    orderHash: string,
  ): Promise<{ id: string } | null> {
    const row = await this.prisma.intent.findFirst({
      where: {
        preSignedOrderHash: orderHash,
        status: {
          in: [
            IntentStatus.DRAFT,
            IntentStatus.ACTIVE,
            IntentStatus.TRIGGERED,
            IntentStatus.READY,
            IntentStatus.EXECUTING,
          ],
        },
      },
      select: { id: true },
      orderBy: { createdAt: 'asc' },
    });
    return row;
  }

  /**
   * Compound-where status transition. Returns the updated row on success
   * or null if the precondition (current status) was not met. Used for
   * idempotent / fire-once latching in later phases; in Phase 1 only the
   * cancel path uses it.
   */
  async transitionStatus(
    id: string,
    fromStatus: IntentStatus,
    toStatus: IntentStatus,
    patch?: { failureReason?: string },
  ): Promise<IntentDto | null> {
    const result = await this.prisma.intent.updateMany({
      where: { id, status: fromStatus },
      data: {
        status: toStatus,
        ...(patch?.failureReason ? { failureReason: patch.failureReason } : {}),
      },
    });
    if (result.count === 0) return null;
    const row = await this.prisma.intent.findUnique({ where: { id } });
    return row ? serializeIntent(row) : null;
  }
}

function serializeIntent(row: Intent) {
  return {
    id: row.id,
    owner: row.owner,
    marketId: row.marketId,
    type: row.type,
    status: row.status,
    side: row.side,
    sizeBase: row.sizeBase.toString(),
    limitPriceTicks:
      row.limitPriceTicks !== null && row.limitPriceTicks !== undefined
        ? row.limitPriceTicks.toString()
        : null,
    tif: row.tif,
    triggerType: row.triggerType,
    triggerReference: row.triggerReference,
    triggerPriceTicks: row.triggerPriceTicks.toString(),
    executionAuthority: row.executionAuthority,
    preSignedOrderHash: row.preSignedOrderHash,
    linkedOrderHash: row.linkedOrderHash,
    // Phase 4: CMR readiness snapshot fields. Null for CL intents and for
    // CMR intents that have not yet reached READY (or have been re-armed).
    preparedQuote: row.preparedQuote ?? null,
    preparedQuoteAt: row.preparedQuoteAt
      ? row.preparedQuoteAt.toISOString()
      : null,
    cooldownUntilAt: row.cooldownUntilAt
      ? row.cooldownUntilAt.toISOString()
      : null,
    // Phase 4.x-b: CMR execution-lifecycle tracking.
    linkedTxHash: row.linkedTxHash ?? null,
    walletLockUntilAt: row.walletLockUntilAt
      ? row.walletLockUntilAt.toISOString()
      : null,
    expiresAt: row.expiresAt.toISOString(),
    failureReason: row.failureReason,
    rawText: row.rawText,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}
