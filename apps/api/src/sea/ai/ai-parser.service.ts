// apps/api/src/sea/ai/ai-parser.service.ts
// SEA AI Assist (Phase 1A) orchestrator. Stateless: resolves market rules,
// calls the provider for a restricted extraction, validates that output, and
// hands it to the deterministic validator. Writes nothing. Any provider/parse
// failure degrades to a safe `aiUnavailable` so the manual form is never broken.
import { Inject, Injectable, Logger } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { PersistenceRepository } from '../../matching/persistence.repository';
import { OrderBookService } from '../../matching/orderbook.service';
import {
  AI_INTENT_PROVIDER,
  type AiIntentProvider,
} from './provider/ai-provider.interface';
import {
  rawModelDraftSchema,
  type AiSeaParseRequest,
  type AiSeaParseResponse,
} from './ai-draft.schema';
import {
  validateAiDraft,
  type AiMarketContext,
  type AiTopOfBook,
} from './ai-draft.validator';
import { splitPairSymbol } from './intent-rules.util';

const DEFAULT_MODEL = 'claude-haiku-4-5';

@Injectable()
export class AiParserService {
  private readonly logger = new Logger(AiParserService.name);

  constructor(
    @Inject(AI_INTENT_PROVIDER) private readonly provider: AiIntentProvider,
    private readonly persistence: PersistenceRepository,
    private readonly ob: OrderBookService,
  ) {}

  isEnabled(): boolean {
    return process.env.SEA_AI_ENABLED === '1';
  }

  async parse(req: AiSeaParseRequest): Promise<AiSeaParseResponse> {
    if (!this.isEnabled()) {
      return {
        status: 'aiUnavailable',
        message: 'AI assist is not enabled on this environment.',
      };
    }

    // Canonical market rules. A missing market degrades to a safe response
    // (the FE only ever sends the active market symbol).
    let ctx: Awaited<ReturnType<PersistenceRepository['getTradingContext']>>;
    try {
      ctx = await this.persistence.getTradingContext(req.marketId);
    } catch {
      return {
        status: 'aiUnavailable',
        message: 'Could not load market data. Try again shortly.',
      };
    }

    const { base, quote } = splitPairSymbol(ctx.symbol);

    // Provider call. Any throw (missing key, network, timeout) -> aiUnavailable.
    let raw: unknown;
    try {
      raw = await this.provider.parse({
        subMode: req.subMode,
        text: req.text,
        market: { symbol: ctx.symbol, baseSymbol: base, quoteSymbol: quote },
        ...(req.sideHint ? { sideHint: req.sideHint } : {}),
      });
    } catch {
      this.logger.warn(`sea/ai provider failed (${this.provider.name})`);
      return {
        status: 'aiUnavailable',
        message: 'AI assist is unavailable right now. Use the form below.',
      };
    }

    // Validate the model's restricted output. Malformed -> safe response.
    const parsed = rawModelDraftSchema.safeParse(raw);
    if (!parsed.success) {
      this.logger.warn('sea/ai model output failed schema validation');
      return {
        status: 'aiUnavailable',
        message:
          "Couldn't interpret that. Try rephrasing, or use the form below.",
      };
    }

    const aiCtx: AiMarketContext = {
      symbol: ctx.symbol,
      baseSymbol: base,
      quoteSymbol: quote,
      baseDecimals: ctx.baseDecimals,
      quoteDecimals: ctx.quoteDecimals,
      priceTickQ: ctx.priceTickQ,
      minSizeB: ctx.minSizeB,
      minNotionalQ: ctx.minNotionalQ,
    };

    return validateAiDraft({
      subMode: req.subMode,
      raw: parsed.data,
      ctx: aiCtx,
      topOfBook: this.safeTopOfBook(ctx.symbol),
      provenance: {
        model: process.env.SEA_AI_MODEL?.trim() || DEFAULT_MODEL,
        requestId: randomUUID(),
      },
    });
  }

  /** Best-effort top-of-book; never throws (omitted facts just drop notes). */
  private safeTopOfBook(symbol: string): AiTopOfBook {
    try {
      const snap = this.ob.snapshot(symbol, 1);
      const bid = snap.bids[0]?.priceTicks;
      const ask = snap.asks[0]?.priceTicks;
      return {
        bestBidTicks: bid ? BigInt(bid) : null,
        bestAskTicks: ask ? BigInt(ask) : null,
      };
    } catch {
      return { bestBidTicks: null, bestAskTicks: null };
    }
  }
}
