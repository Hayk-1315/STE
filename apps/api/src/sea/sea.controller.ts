// apps/api/src/sea/sea.controller.ts
// SEA v1 Phase 1: thin REST surface for intent CRUD/list/cancel.
// Phase 5 adds GET /sea/intents/:id/fresh-quote — a READ-ONLY state-validation
// endpoint used by the frontend to gate the wallet popup on READY CMR intents.
// It does NOT build txData/txList (the FE then calls the existing POST
// /match/quote with limitPriceTicks=triggerPriceTicks). No mutation here.
import {
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
  Get,
  Logger,
  NotFoundException,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { IntentService } from './intent.service';
import {
  cancelIntentBodySchema,
  createIntentBodySchema,
  executingBodySchema,
  walletLockBodySchema,
} from './dto/intent.dto';
import { IntentRepository } from './intent.repository';
import { OrderBookService } from '../matching/orderbook.service';
import { PersistenceRepository } from '../matching/persistence.repository';
import { computeQuoteNotionalQ } from './notional.util';
import {
  IntentStatus,
  IntentType,
  ReferencePriceKind,
  TriggerType,
} from '@prisma/client';
import { issueLockNonce, readSecret } from './execution-token.util';

@Controller('sea')
export class SeaController {
  private readonly logger = new Logger(SeaController.name);

  constructor(
    private readonly svc: IntentService,
    private readonly repo: IntentRepository,
    private readonly ob: OrderBookService,
    private readonly persistence: PersistenceRepository,
  ) {}

  @Post('intents')
  async create(@Body() body: unknown) {
    if (process.env.READ_ONLY === 'true') {
      throw new ForbiddenException('read-only');
    }
    const parsed = createIntentBodySchema.safeParse(body);
    if (!parsed.success) {
      this.logger.warn(
        `sea/intents invalid_payload: ${JSON.stringify(parsed.error.issues)}`,
      );
      throw new BadRequestException({
        message: 'invalid_payload',
        issues: parsed.error.issues,
      });
    }
    return this.svc.create(parsed.data);
  }

  @Get('intents')
  async list(
    @Query('address') address: string | undefined,
    @Query('status') status: string | undefined,
    @Query('limit') limitStr: string | undefined,
  ) {
    if (!address) {
      throw new BadRequestException('address required');
    }
    const limit = limitStr
      ? Math.max(1, Math.min(parseInt(limitStr, 10) || 50, 200))
      : 50;
    return this.svc.listByOwner(address, status, limit);
  }

  @Get('intents/:id')
  async get(@Param('id') id: string) {
    const intent = await this.svc.findById(id);
    if (!intent) throw new NotFoundException('intent_not_found');
    return intent;
  }

  @Post('intents/:id/cancel')
  async cancel(@Param('id') id: string, @Body() body: unknown) {
    if (process.env.READ_ONLY === 'true') {
      throw new ForbiddenException('read-only');
    }
    const parsed = cancelIntentBodySchema.safeParse(body);
    if (!parsed.success) {
      throw new BadRequestException({
        message: 'invalid_payload',
        issues: parsed.error.issues,
      });
    }
    return this.svc.cancel(id, parsed.data.signature);
  }

  /**
   * Phase 5: read-only readiness re-validation for a CMR READY intent.
   *
   * Used by the frontend immediately before opening the user's wallet to
   * execute a market order against the intent. The check is:
   *   1. intent exists
   *   2. status === READY  (CMR only — CL never reaches READY)
   *   3. now < intent.expiresAt
   *   4. now < preparedQuoteAt + preparedQuote.ttlSec  (TTL freshness)
   *   5. trigger still satisfied against current top-of-book
   *   6. guarded liquidity preview (limitPriceTicks = triggerPriceTicks)
   *      returns remainingBase === 0n
   *
   * On all checks pass, returns { ok: true, intent: <serialized> } and the
   * frontend then calls POST /match/quote with limitPriceTicks =
   * intent.triggerPriceTicks to obtain the actual txData/txList. The FE
   * MUST re-verify remainingBase === "0" on that response before opening
   * the wallet (race window between this call and /match/quote is bounded
   * by the shared price guard).
   *
   * Failure responses are 200 with { ok: false, reason: '<code>' } so the
   * frontend can branch on a structured code without parsing HTTP errors.
   *
   * No mutation. No txData. No tx-builder code. State transitions remain
   * the monitor's responsibility (TTL expiry → re-arm runs on its next
   * tick).
   */
  @Get('intents/:id/fresh-quote')
  async freshQuote(@Param('id') id: string) {
    const intent = await this.repo.findById(id);
    if (!intent) {
      return { ok: false as const, reason: 'intent_not_found' as const };
    }

    if (intent.status !== IntentStatus.READY) {
      return {
        ok: false as const,
        reason: `intent_not_ready:${intent.status}` as const,
      };
    }
    if (intent.type !== IntentType.CONDITIONAL_MARKET_READY) {
      // Defensive: only CMR ever reaches READY in the current state machine.
      return {
        ok: false as const,
        reason: `intent_not_ready:${intent.status}` as const,
      };
    }

    const now = Date.now();
    const expiresAtMs = new Date(intent.expiresAt).getTime();
    if (now > expiresAtMs) {
      return { ok: false as const, reason: 'intent_expired' as const };
    }

    // Read ttlSec from the persisted snapshot so the answer is independent of
    // any env change since the READY transition. Clamp defensively.
    const ttlSec = readTtlSecFromSnapshot(intent.preparedQuote);
    const preparedAtMs = intent.preparedQuoteAt
      ? new Date(intent.preparedQuoteAt).getTime()
      : 0;
    if (preparedAtMs === 0 || now > preparedAtMs + ttlSec * 1000) {
      // Do NOT mutate here. Monitor's tickCMRReady owns the READY→ACTIVE
      // re-arm and will do it on its next tick.
      return { ok: false as const, reason: 'ready_ttl_expired' as const };
    }

    // Resolve market symbol from the persistence ctx (the IntentDto carries
    // marketId only). getTradingContext accepts id or symbol.
    const ctx = await this.persistence.getTradingContext(intent.marketId);
    const symbol = ctx.symbol;

    // Re-evaluate the trigger against the current top-of-book.
    const triggerPriceTicks = BigInt(intent.triggerPriceTicks);
    const refTicks = readReferenceTicks(
      this.ob,
      symbol,
      intent.triggerReference,
    );
    if (refTicks === null) {
      return {
        ok: false as const,
        reason: 'trigger_no_longer_satisfied' as const,
      };
    }
    if (!triggerSatisfied(intent.triggerType, refTicks, triggerPriceTicks)) {
      return {
        ok: false as const,
        reason: 'trigger_no_longer_satisfied' as const,
      };
    }

    // Guarded liquidity preview. Pure read; never mutates LOB or DB.
    let quote: Awaited<ReturnType<OrderBookService['quote']>>;
    try {
      quote = await this.ob.quote({
        marketIdOrSymbol: symbol,
        side: intent.side as 'BUY' | 'SELL',
        sizeBase: BigInt(intent.sizeBase),
        limitPriceTicks: triggerPriceTicks,
      });
    } catch (e) {
      this.logger.warn(
        `fresh-quote: ob.quote failed id=${id} symbol=${symbol}: ${
          e instanceof Error ? e.message : String(e)
        }`,
      );
      return {
        ok: false as const,
        reason: 'insufficient_liquidity' as const,
      };
    }
    if (BigInt(quote.remainingBase) > 0n) {
      return {
        ok: false as const,
        reason: 'insufficient_liquidity' as const,
      };
    }

    // Phase 5 Part B.3: consistency with POST /match/quote's min-notional gate.
    // CMR readiness uses OrderBookService.quote directly, not /match/quote, so
    // we re-apply the same exact bigint check here using the canonical helper.
    // Without this, a fully-fillable but tiny-notional quote could pass
    // fresh-quote and then fail at execute time.
    const notionalQ = computeQuoteNotionalQ(
      quote.fills,
      ctx.priceTickQ,
      ctx.baseDecimals,
    );
    if (notionalQ < ctx.minNotionalQ) {
      return {
        ok: false as const,
        reason: 'notional_below_min_notional' as const,
      };
    }

    // Phase 4.x-b additive fields: issue a stateless lockNonce + propose a
    // server-side walletLockUntilAt so the FE can sign the wallet-lock
    // canonical message immediately. Pure reads — no DB mutation here.
    const chainId = getChainIdFromEnv();
    const lockNonceSecret = readSecret('SEA_LOCK_NONCE_SECRET');
    const proposalUntilMs = Math.min(
      Date.now() + getWalletLockSecs() * 1000,
      new Date(intent.expiresAt).getTime(),
    );
    const lockNonce =
      intent.preparedQuoteAt && lockNonceSecret
        ? issueLockNonce(lockNonceSecret, {
            intentId: intent.id,
            owner: intent.owner,
            preparedQuoteAt: new Date(intent.preparedQuoteAt),
            chainId,
          })
        : null;

    return {
      ok: true as const,
      intent,
      // Echo the guarded preview totals so the FE can show a confidence
      // estimate before calling /match/quote. NOT an execution plan — no
      // txData, no fills' rawOrder/rawSig.
      preview: {
        marketId: quote.marketId,
        symbol: quote.symbol,
        side: quote.side,
        requestedBase: quote.requestedBase,
        remainingBase: quote.remainingBase,
        takerToken: quote.takerToken,
        takerAmount: quote.takerAmount,
        takerFeeAmount: quote.takerFeeAmount,
        takerTotalAmount: quote.takerTotalAmount,
        levelCount: quote.fills.length,
        triggerPriceTicks: triggerPriceTicks.toString(),
      },
      // Phase 4.x-b additive: present only when we could derive the nonce.
      ...(lockNonce
        ? {
            lockNonce,
            walletLockProposal: {
              walletLockUntilAt: new Date(proposalUntilMs).toISOString(),
            },
          }
        : {}),
    };
  }

  /**
   * Phase 4.x-b: POST /sea/intents/:id/wallet-lock.
   *
   * Stamps `Intent.walletLockUntilAt` and returns a bearer `executionToken`
   * for the subsequent /executing call. One EIP-191 popup pre-tx; no
   * signature is required on /executing.
   */
  @Post('intents/:id/wallet-lock')
  async walletLock(@Param('id') id: string, @Body() body: unknown) {
    if (process.env.READ_ONLY === 'true') {
      throw new ForbiddenException('read-only');
    }
    const parsed = walletLockBodySchema.safeParse(body);
    if (!parsed.success) {
      throw new BadRequestException({
        message: 'invalid_payload',
        issues: parsed.error.issues,
      });
    }
    return this.svc.lockWallet(id, parsed.data);
  }

  /**
   * Phase 4.x-b: POST /sea/intents/:id/executing.
   *
   * Bearer-token only. Body schema is `.strict()` — any extra field
   * (`signature`, `ownerAuth`, ...) is rejected with 400 invalid_payload.
   */
  @Post('intents/:id/executing')
  async markExecuting(@Param('id') id: string, @Body() body: unknown) {
    if (process.env.READ_ONLY === 'true') {
      throw new ForbiddenException('read-only');
    }
    const parsed = executingBodySchema.safeParse(body);
    if (!parsed.success) {
      throw new BadRequestException({
        message: 'invalid_payload',
        issues: parsed.error.issues,
      });
    }
    return this.svc.markExecuting(id, parsed.data);
  }
}

function readReferenceTicks(
  ob: OrderBookService,
  symbol: string,
  reference: ReferencePriceKind,
): bigint | null {
  const snap = ob.snapshot(symbol, 1);
  if (reference === ReferencePriceKind.BEST_ASK) {
    const ask = snap.asks[0]?.priceTicks;
    return ask ? BigInt(ask) : null;
  }
  if (reference === ReferencePriceKind.BEST_BID) {
    const bid = snap.bids[0]?.priceTicks;
    return bid ? BigInt(bid) : null;
  }
  return null;
}

function triggerSatisfied(
  type: TriggerType,
  refTicks: bigint,
  threshold: bigint,
): boolean {
  if (type === TriggerType.PRICE_BELOW) return refTicks <= threshold;
  if (type === TriggerType.PRICE_ABOVE) return refTicks >= threshold;
  return false;
}

function getChainIdFromEnv(): number {
  const raw = process.env.CHAIN_ID ?? process.env.ZEROEX_CHAIN_ID ?? '84532';
  const parsed = Number.parseInt(raw, 10);
  return !Number.isFinite(parsed) || parsed <= 0 ? 84532 : parsed;
}

function getWalletLockSecs(): number {
  const raw = Number(process.env.SEA_WALLET_LOCK_SEC ?? '');
  if (!Number.isFinite(raw) || raw < 30) return 300;
  return Math.min(Math.floor(raw), 3600);
}

function readTtlSecFromSnapshot(snapshot: unknown): number {
  if (!snapshot || typeof snapshot !== 'object') return 60;
  const raw = (snapshot as { ttlSec?: unknown }).ttlSec;
  if (typeof raw === 'number' && Number.isFinite(raw) && raw > 0) {
    return Math.min(300, Math.max(5, Math.floor(raw)));
  }
  return 60;
}
