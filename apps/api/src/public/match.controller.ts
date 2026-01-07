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

type QuoteReq = {
  marketId: string; // id o symbol (usamos como "marketIdOrSymbol")
  side: Side; // "BUY" | "SELL" (taker perspective on BASE)
  sizeBase: string | number; // raw base units
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
  return 0n;
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
  ) {}

  @Post('match/quote')
  async quote(@Body() b: QuoteReq) {
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

    const plan = await this.ob.quote({
      marketIdOrSymbol: b.marketId,
      side: side as Side,
      sizeBase,
    });

    // Contexto del mercado (para saber base/quote)
    const ctx = await this.persistence.getTradingContext(b.marketId);

    let noTxReason: string | undefined;

    // --- NUEVO: chequear liquidez disponible vs lo solicitado ---
    // requestedBase ya lo tienes como BigInt(sizeBase)
    const requestedBase = sizeBase;
    const availableBase = Array.isArray(plan.fills)
      ? plan.fills.reduce((acc, f) => acc + BigInt(f.sizeBase), 0n)
      : 0n;
    const shortfallBase =
      requestedBase > availableBase ? requestedBase - availableBase : 0n;

    // si falta liquidez, NO construimos txData (ni single ni batch),
    // devolvemos el plan con motivo y métricas para el front
    if (shortfallBase > 0n) {
      noTxReason = 'insufficient_liquidity';
    }

    let txData: TxData | undefined;

    // Valores calculados para hidratar respuesta (front approve)
    let computedTakerFillAmount: bigint | undefined;
    // Por defecto, según el lado del taker: BUY paga QUOTE, SELL paga BASE
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
          // computedTakerToken ya está definido por lado; mantenemos

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
            txData = undefined; // devolvemos 200 OK sin txData
          }
        }
      } else {
        // Single-fill path (único soportado con txData en F4)
        if (Array.isArray(plan.fills) && plan.fills.length === 1) {
          const f = plan.fills[0];
          // sanity-use to satisfy strict no-unused-vars (length checked above)
          if (!f) {
            throw new BadRequestException(
              'match/quote: empty fill after length check',
            );
          }

          // ... (tu bloque single-fill existente SIN cambios)
        } else if (Array.isArray(plan.fills) && plan.fills.length > 1) {
          // === NEW: multi-fill batch path ===
          // 1) Hydrate raw order + sig for each fill (same logic you use in single-fill)
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
            // 3) Sanitize orders for ABI
            const ordersForAbi: LimitOrder[] = plan.fills.map((f) =>
              sanitizeOrder(f.rawOrder),
            );

            // 4) Compute takerTokenFillAmounts per fill
            const takerTokenFillAmounts: bigint[] = plan.fills.map((f, i) => {
              const order = ordersForAbi[i];
              const fillBase = BigInt(f.sizeBase);
              if (plan.side === 'BUY') {
                // taker pays QUOTE
                const makerAmt = order.makerAmount;
                const takerAmt = order.takerAmount;
                return (
                  (fillBase * takerAmt) / (makerAmt === 0n ? 1n : makerAmt)
                );
              }
              // SELL: taker pays BASE
              return fillBase;
            });

            // 5) Provide top-level takerAmount for front (sum of all)
            const sum = takerTokenFillAmounts.reduce((acc, x) => acc + x, 0n);
            computedTakerFillAmount = sum;

            try {
              // 6) Build single calldata for all fills
              const tx = this.txb.buildBatchFillLimitOrders({
                orders: ordersForAbi,
                signatures: plan.fills.map((f): `0x${string}` | ZeroExSig => {
                  const s = f.rawSig as unknown;
                  // if it's a full 65-byte hex signature, pass hex (builder will parse)
                  if (typeof s === 'string' && /^0x[0-9a-fA-F]{130}$/.test(s)) {
                    return s as `0x${string}`;
                  }
                  // if it's already a tuple, pass it through
                  if (
                    typeof s === 'object' &&
                    s !== null &&
                    'r' in (s as any) &&
                    's' in (s as any) &&
                    'v' in (s as any)
                  ) {
                    return s as ZeroExSig;
                  }
                  // dev fallback: dummy tuple (EIP-712 type, r/s zero, v=27)
                  return {
                    signatureType: 2,
                    v: 27,
                    r: ZERO32,
                    s: ZERO32,
                  } satisfies ZeroExSig;
                }),

                takerTokenFillAmounts,
                // Prefer false: tolerate that a level might be taken between quote & execute
                revertIfIncomplete: false,
              });
              txData = tx;
            } catch (e) {
              const msg = (e as Error).message;
              this.logger.warn(
                `match/quote: batch txData build failed → ${msg}`,
              );

              // 🔴 Caso Base: EP sin batchFillLimitOrders → mandamos 400 con mensaje humano
              if (msg.includes('batchFillLimitOrders no está implementado')) {
                throw new BadRequestException(
                  'In Base (chainId 8453), the 0x Exchange Proxy doesn’t support multi-fill (batchFillLimitOrders). ' +
                    'Reduce the size or wait for a version with a custom router.',
                );
              }

              // Resto de errores: seguimos como antes
              noTxReason = `builder_fail: ${msg}`;
              txData = undefined;
            }
          }
        } else {
          noTxReason = 'no_fills';
        }
      }
    }

    this.logger.log(
      `match/quote → fills=${plan.fills.length} txData=${txData ? 'yes' : 'no'} reason=${noTxReason ?? '-'}`,
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

    return {
      ...plan,
      takerToken: finalToken,
      ...(finalAmount ? { takerAmount: finalAmount } : {}),
      txData,
      availableBase: availableBase.toString(),
      shortfallBase: shortfallBase.toString(),
      ...(noTxReason ? { noTxReason } : {}),
    };
  }
}
