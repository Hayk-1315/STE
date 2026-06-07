// apps/api/src/public/match.controller.ts
import {
  Body,
  Controller,
  Post,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { OrderBookService, Side } from '../matching/orderbook.service';
import { ZeroExTxBuildersService } from '../zeroex/tx-builders.service';
import type { TxData } from '../zeroex/tx-builders.service';
import { PersistenceRepository } from '../matching/persistence.repository';
import type { LimitOrder } from '../zeroex/limit-order.types';
import type { ZeroExSig } from '../zeroex/tx-builders.service';
import { MetricsService } from '../observability/metrics.service';

type TIF = 'GTC' | 'IOC' | 'FOK';

type QuoteReq = {
  marketId: string; // id o symbol (usamos como "marketIdOrSymbol")
  side: Side; // "BUY" | "SELL" (taker perspective on BASE)
  sizeBase: string | number; // raw base units
  tif?: TIF; // default GTC
  // Optional taker price cap (in ticks). Used by marketable-limit routing
  // so the matcher only includes fills at-or-better than the caller's limit.
  // Omitted → today's behavior (full sweep).
  limitPriceTicks?: string | number;
};

const ZERO_ADDR = '0x0000000000000000000000000000000000000000' as const;
const ZERO_POOL =
  '0x0000000000000000000000000000000000000000000000000000000000000000' as const;
// zero bytes32 literal for dev-only dummy signatures
const ZERO32 =
  '0x0000000000000000000000000000000000000000000000000000000000000000' as `0x${string}`;

type PlanTop = { takerToken?: string; takerAmount?: string };

function hasTopTakerFields(x: unknown): x is PlanTop {
  if (typeof x !== 'object' || x === null) return false;
  const r = x as Record<string, unknown>;
  const tt = r['takerToken'];
  const ta = r['takerAmount'];
  const okTT = tt === undefined || typeof tt === 'string';
  const okTA = ta === undefined || typeof ta === 'string';
  return okTT && okTA;
}

// ---- helpers de saneo sin romper tipos ----
function toBig(v: unknown): bigint {
  if (typeof v === 'bigint') return v;
  if (typeof v === 'number') return BigInt(v);
  if (typeof v === 'string') return BigInt(v); // decimal string
  return 0n; // apps/api/src/public/match.controller.ts
}
function toNum(v: unknown): number {
  if (typeof v === 'number') return v;
  if (typeof v === 'bigint') return Number(v);
  if (typeof v === 'string') {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  }
  return 0;
}
function toAddr(v: unknown): `0x${string}` {
  return typeof v === 'string' && v.startsWith('0x') && v.length === 42
    ? (v as `0x${string}`)
    : ZERO_ADDR;
}
function toBytes32(v: unknown): `0x${string}` {
  return typeof v === 'string' && v.startsWith('0x') && v.length === 66
    ? (v as `0x${string}`)
    : ZERO_POOL;
}
/** Acepta cualquier forma y devuelve un LimitOrder tipado correctamente (bigint en uints). */
function sanitizeOrder(raw: unknown): LimitOrder {
  const r = raw as Record<string, unknown>;
  return {
    makerToken: toAddr(r?.makerToken),
    takerToken: toAddr(r?.takerToken),
    makerAmount: toBig(r?.makerAmount), // uint128 -> bigint
    takerAmount: toBig(r?.takerAmount), // uint128 -> bigint
    takerTokenFeeAmount: toBig(r?.takerTokenFeeAmount),
    maker: toAddr(r?.maker),
    taker: toAddr(r?.taker),
    sender: toAddr(r?.sender),
    feeRecipient: toAddr(r?.feeRecipient),
    pool: toBytes32(r?.pool),
    expiry: toNum(r?.expiry), // uint64 -> number
    salt: toBig(r?.salt), // uint256 -> bigint
  };
}

@Controller()
export class MatchController {
  private readonly logger = new Logger(MatchController.name);

  constructor(
    private readonly ob: OrderBookService,
    private readonly txb: ZeroExTxBuildersService,
    private readonly persistence: PersistenceRepository,
    private readonly metrics: MetricsService,
  ) {}

  @Post('match/quote')
  async quote(@Body() b: QuoteReq) {
    const t0 = Date.now();
    if (
      !b?.marketId ||
      !b?.side ||
      b.sizeBase === undefined ||
      b.sizeBase === null
    ) {
      throw new BadRequestException('marketId, side, sizeBase are required');
    }

    const side = String(b.side).toUpperCase() === 'SELL' ? 'SELL' : 'BUY';
    const sizeBase = BigInt(
      typeof b.sizeBase === 'string' ? b.sizeBase : String(b.sizeBase),
    );

    // ⇩⇩ NUEVO: TIF con default GTC
    const tif: TIF = (b.tif as TIF) ?? 'GTC';

    // Optional marketable-limit cap. Validated as a positive bigint; anything
    // else is silently ignored to keep this strictly additive vs. legacy callers.
    let limitPriceTicks: bigint | undefined;
    if (b.limitPriceTicks !== undefined && b.limitPriceTicks !== null) {
      try {
        const raw =
          typeof b.limitPriceTicks === 'string'
            ? b.limitPriceTicks
            : String(b.limitPriceTicks);
        const v = BigInt(raw);
        if (v > 0n) limitPriceTicks = v;
      } catch {
        throw new BadRequestException(
          'limitPriceTicks must be a positive integer',
        );
      }
    }

    // Contexto del mercado (para saber base/quote y reglas).
    // Se resuelve antes que el quote para poder rechazar tamaños inválidos
    // sin gastar trabajo del matcher. Phase 5 Part B.1: gate sizes below
    // market.rules.minSizeB con un código estable consumible por cualquier
    // caller (web, CLI, futuras integraciones SEA). Cumple simetría con la
    // ruta de Limit, que ya valida `minSizeB` en frontend
    // (`validateLimitInput`) y backend (placement service / validator).
    const ctx = await this.persistence.getTradingContext(b.marketId);
    if (sizeBase < ctx.minSizeB) {
      throw new BadRequestException({
        message: 'size_below_min_size',
        requested: sizeBase.toString(),
        minSizeB: ctx.minSizeB.toString(),
      });
    }

    const plan = await this.ob.quote({
      marketIdOrSymbol: b.marketId,
      side: side as Side,
      sizeBase,
      ...(limitPriceTicks !== undefined ? { limitPriceTicks } : {}),
    });

    let noTxReason: string | undefined;

    // --- chequear liquidez disponible vs lo solicitado ---
    const requestedBase = sizeBase;
    const availableBase = Array.isArray(plan.fills)
      ? plan.fills.reduce((acc, f) => acc + BigInt(f.sizeBase), 0n)
      : 0n;
    const shortfallBase =
      requestedBase > availableBase ? requestedBase - availableBase : 0n;

    // ⇩⇩ NUEVO: semántica FOK → si falta liquidez, rechazamos
    if (tif === 'FOK' && shortfallBase > 0n) {
      this.metrics.quotesTotal.inc();
      this.metrics.quoteLatency.observe(Date.now() - t0);
      throw new BadRequestException('fok_insufficient_liquidity');
    }
    // Para IOC / GTC: seguimos adelante; el builder usará plan.fills tal cual.

    // Phase 5 Part B.2: reject executed quotes whose quote-denominated notional
    // falls below market.rules.minNotionalQ. Mirrors the existing Limit-mode
    // rule (`validateLimitInput`) so Market and Limit are judged against the
    // same `minNotionalQ` at the same effective price. Only applied when there
    // is actual execution (`fills.length > 0`); empty-book responses continue
    // to flow through the existing `noTxReason: 'no_fills'` path so callers
    // can render a "no liquidity" message instead of an error.
    if (Array.isArray(plan.fills) && plan.fills.length > 0) {
      // Recompute from fills using the canonical formula
      //   notionalQ = Σ priceTicks * priceTickQ * sizeBase / 10^baseDecimals
      // This is identical to the matcher's internal `takerTotalQ`
      // (also exposed as `plan.takerAmount` server-side); recomputing here
      // makes the gate independent of any future shape change to that field.
      const denomBase = 10n ** BigInt(ctx.baseDecimals);
      let notionalQ = 0n;
      for (const f of plan.fills) {
        try {
          const px = BigInt(f.priceTicks);
          const sz = BigInt(f.sizeBase);
          notionalQ += (px * ctx.priceTickQ * sz) / denomBase;
        } catch {
          // skip malformed fill rather than throw
        }
      }
      if (notionalQ < ctx.minNotionalQ) {
        this.metrics.quotesTotal.inc();
        this.metrics.quoteLatency.observe(Date.now() - t0);
        throw new BadRequestException({
          message: 'notional_below_min_notional',
          notionalQ: notionalQ.toString(),
          minNotionalQ: ctx.minNotionalQ.toString(),
        });
      }
    }

    let txData: TxData | undefined;
    let txList: TxData[] | undefined; // ⬅️ lista secuencial de txs

    // Valores calculados para hidratar respuesta (front approve)
    let computedTakerFillAmount: bigint | undefined;
    const computedTakerToken: `0x${string}` =
      plan.side === 'BUY'
        ? (ctx.quoteAddress as `0x${string}`)
        : (ctx.baseAddress as `0x${string}`);

    // Single-fill path (único soportado con txData en F4)
    if (!noTxReason) {
      if (Array.isArray(plan.fills) && plan.fills.length === 1) {
        const f = plan.fills[0];

        // 1) Hidrata raw si falta
        if (!f.rawOrder || !f.rawSig) {
          try {
            const row = await this.persistence.findRawOrderByHash(
              f.makerOrderHash,
            );
            if (row.zeroExOrder && row.signature) {
              f.rawOrder = row.zeroExOrder;
              f.rawSig = row.signature;
            }
          } catch (e) {
            this.logger.warn(
              `match/quote: raw hydration failed for ${f.makerOrderHash} → ${(e as Error).message}`,
            );
          }
        }

        if (!f.rawOrder || !f.rawSig) {
          noTxReason = 'missing_raw';
        } else {
          // 2) Sanitiza order para ABI
          const orderForAbi: LimitOrder = sanitizeOrder(f.rawOrder);

          // 3) Calcula takerTokenFillAmount proporcional al propio order
          const makerAmt = orderForAbi.makerAmount;
          const takerAmt = orderForAbi.takerAmount;
          const fillBase = BigInt(f.sizeBase);

          const takerFillAmount =
            plan.side === 'BUY'
              ? (fillBase * takerAmt) / (makerAmt === 0n ? 1n : makerAmt) // taker paga QUOTE
              : fillBase; // taker paga BASE

          computedTakerFillAmount = takerFillAmount;

          try {
            txData = this.txb.buildFillLimitOrder(
              orderForAbi,
              f.rawSig,
              takerFillAmount,
            );
          } catch (e) {
            noTxReason = `builder_fail: ${(e as Error).message}`;
            this.logger.warn(
              `match/quote: txData build failed → ${(e as Error).message}`,
            );
            txData = undefined;
          }
        }
      } else {
        // Single-fill path duplicado previo (respetado), pero tratamos multi-fill aquí
        if (Array.isArray(plan.fills) && plan.fills.length === 1) {
          const f = plan.fills[0];
          if (!f) {
            throw new BadRequestException(
              'match/quote: empty fill after length check',
            );
          }
          // (Sin cambios: dejamos tu bloque previo tal cual)
        } else if (Array.isArray(plan.fills) && plan.fills.length > 1) {
          // === MULTI-FILL ===
          // 1) Hydrate raw
          await Promise.all(
            plan.fills.map(async (f) => {
              if (!f.rawOrder || !f.rawSig) {
                try {
                  const row = await this.persistence.findRawOrderByHash(
                    f.makerOrderHash,
                  );
                  if (row.zeroExOrder && row.signature) {
                    f.rawOrder = row.zeroExOrder;
                    f.rawSig = row.signature;
                  }
                } catch (e) {
                  this.logger.warn(
                    `match/quote: raw hydration failed for ${f.makerOrderHash} → ${(e as Error).message}`,
                  );
                }
              }
            }),
          );

          // 2) Ensure all fills have raw data
          const missing = plan.fills.filter((f) => !f.rawOrder || !f.rawSig);
          if (missing.length > 0) {
            noTxReason = 'missing_raw';
          } else {
            // 3) Sanitize orders
            const ordersForAbi: LimitOrder[] = plan.fills.map((f) =>
              sanitizeOrder(f.rawOrder),
            );

            // 4) Compute takerTokenFillAmounts per fill
            const takerTokenFillAmounts: bigint[] = plan.fills.map((f, i) => {
              const order = ordersForAbi[i];
              const fillBase = BigInt(f.sizeBase);
              if (plan.side === 'BUY') {
                const makerAmt = order.makerAmount;
                const takerAmt = order.takerAmount;
                return (
                  (fillBase * takerAmt) / (makerAmt === 0n ? 1n : makerAmt)
                );
              }
              return fillBase;
            });

            // 5) Suma total para approve top-level
            const sum = takerTokenFillAmounts.reduce((acc, x) => acc + x, 0n);
            computedTakerFillAmount = sum;

            try {
              // 6) Intento batch original (respetando tu lógica)
              const tx = this.txb.buildBatchFillLimitOrders({
                orders: ordersForAbi,
                signatures: plan.fills.map((f): `0x${string}` | ZeroExSig => {
                  const s = f.rawSig as unknown;
                  if (typeof s === 'string' && /^0x[0-9a-fA-F]{130}$/.test(s)) {
                    return s as `0x${string}`;
                  }
                  if (
                    typeof s === 'object' &&
                    s !== null &&
                    'r' in (s as any) &&
                    's' in (s as any) &&
                    'v' in (s as any)
                  ) {
                    return s as ZeroExSig;
                  }
                  return {
                    signatureType: 2,
                    v: 27,
                    r: ZERO32,
                    s: ZERO32,
                  } satisfies ZeroExSig;
                }),
                takerTokenFillAmounts,
                revertIfIncomplete: false,
              });

              // Si por algún motivo se pudo construir batch, lo devolvemos
              txData = tx;
            } catch (e) {
              const msg = (e as Error).message;
              this.logger.warn(
                `match/quote: batch txData build failed → ${msg}`,
              );

              // Fallback secuencial → construimos una tx por fill
              try {
                const list: TxData[] = [];
                for (let i = 0; i < ordersForAbi.length; i++) {
                  const t = this.txb.buildFillLimitOrder(
                    ordersForAbi[i],
                    plan.fills[i].rawSig as unknown as
                      | `0x${string}`
                      | ZeroExSig,
                    takerTokenFillAmounts[i],
                  );
                  list.push(t);
                }
                txList = list;
                // No establecemos noTxReason: hay plan ejecutable (secuencial)
              } catch (e2) {
                // Sólo si el fallback también falla, reportamos
                noTxReason = `builder_fail: ${(e2 as Error).message}`;
                txList = undefined;
              }
            }
          }
        } else {
          noTxReason = 'no_fills';
        }
      }
    }

    this.logger.log(
      `match/quote → fills=${plan.fills.length} txData=${txData ? 'yes' : 'no'}${
        txList?.length ? ` txList=${txList.length}` : ''
      } reason=${noTxReason ?? '-'}`,
    );

    // Si el plan ya trae top-level, respétalo (type-safe)
    let topToken: `0x${string}` | undefined;
    let topAmount: string | undefined;

    if (hasTopTakerFields(plan)) {
      if (
        typeof plan.takerToken === 'string' &&
        plan.takerToken.startsWith('0x') &&
        plan.takerToken.length === 42
      ) {
        topToken = plan.takerToken as `0x${string}`;
      }
      if (typeof plan.takerAmount === 'string') {
        topAmount = plan.takerAmount;
      }
    }

    const finalToken: `0x${string}` = topToken ?? computedTakerToken;
    const finalAmount: string | undefined =
      topAmount ??
      (computedTakerFillAmount
        ? computedTakerFillAmount.toString()
        : undefined);

    // --- METRICS ---
    this.metrics.quotesTotal.inc();
    this.metrics.quoteLatency.observe(Date.now() - t0);

    return {
      ...plan,
      tif,
      takerToken: finalToken,
      ...(finalAmount ? { takerAmount: finalAmount } : {}),
      txData,
      ...(txList && txList.length > 0 ? { txList } : {}),
      availableBase: availableBase.toString(),
      shortfallBase: shortfallBase.toString(),
      ...(noTxReason ? { noTxReason } : {}),
    };
  }
  @Post('match/apply')
  async apply(
    @Body()
    b: {
      marketId: string;
      fills: Array<{ orderHash: string; execBase: string }>;
    },
  ) {
    if (!b?.marketId || !Array.isArray(b?.fills)) {
      throw new BadRequestException('marketId and fills[] are required');
    }

    // Flag: ¿tenemos watcher on-chain activo?
    const watcherEnabled = (process.env.DEV_ONCHAIN_WATCHER ?? '') === '1';

    for (const f of b.fills) {
      const orderHash = String(f.orderHash ?? '').toLowerCase();
      const execBase = BigInt(String(f.execBase ?? '0'));
      if (!orderHash || execBase <= 0n) continue;

      if (!watcherEnabled) {
        // MODO SIN WATCHER → aplica aquí
        await this.ob.applyExternalFill(b.marketId, orderHash, execBase);
        this.logger.log(
          `match/apply: market=${b.marketId} fills=${b.fills.length}`,
        );
      } else {
        // MODO CON WATCHER → que lo haga FillWatcher
        this.logger.log(
          `match/apply (noop, watcher enabled): market=${b.marketId} fills=${b.fills.length}`,
        );
      }
    }

    // métricas opcionales: solo sumamos aquí si no hay watcher,
    // porque el watcher también incrementa fillsTotal
    if (!watcherEnabled) {
      try {
        this.metrics.fillsTotal?.inc?.();
      } catch {
        /* empty */
      }
    }

    return { ok: true, applied: b.fills.length };
  }
}
