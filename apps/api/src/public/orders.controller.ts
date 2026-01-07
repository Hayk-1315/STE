// apps/api/src/public/orders.controller.ts
import { BadRequestException, Body, Controller, Post } from '@nestjs/common';
import { OrderBookService, Side } from '../matching/orderbook.service';
import { PersistenceRepository } from '../matching/persistence.repository';
import { ZeroExSigningService } from '../zeroex/signing.service';
import type { LimitOrder, Signature } from '../zeroex/limit-order.types';
import { SignatureType } from '../zeroex/limit-order.types';
import {
  hashMessage,
  getBytes,
  recoverAddress,
  keccak256,
  toUtf8Bytes,
} from 'ethers';
import { ZeroExTxBuildersService } from '../zeroex/tx-builders.service';

type PostOrderDTO = {
  order: LimitOrder;
  signature: Signature;
};

type CancelDTO = {
  marketId: string; // symbol or DB id; resolved internally
  orderHash: string;
  maker: string;
  signature: string; // raw eth_sign hex string
};

// helper: parse 65-byte hex signature into tuple; normalize v to 27/28
function parseSigHexToTuple(
  sigHex: string,
  signatureType: SignatureType = SignatureType.EIP712,
): Signature {
  const hex = sigHex.startsWith('0x') ? sigHex.slice(2) : sigHex;
  if (hex.length !== 130) {
    throw new BadRequestException('invalid_signature_hex');
  }

  // Ensure template-literal type is preserved
  const r: `0x${string}` = `0x${hex.slice(0, 64)}`;
  const s: `0x${string}` = `0x${hex.slice(64, 128)}`;

  let v = parseInt(hex.slice(128, 130), 16);
  if (v === 0 || v === 1) v += 27;

  // Cast the whole object to Signature to satisfy strict typing
  return { signatureType, v, r, s } as Signature;
}

// normaliza firma hex de 65 bytes → `0x${string}` o undefined
function toHexSig65(v: unknown): `0x${string}` | undefined {
  if (typeof v !== 'string') return undefined;
  const hex = v.startsWith('0x') ? v.slice(2) : v;
  return /^[0-9a-fA-F]{130}$/.test(hex) ? `0x${hex}` : undefined;
}

const pow10 = (n: number) => {
  let r = 1n;
  for (let i = 0; i < n; i++) r *= 10n;
  return r;
};

const toLower = (s: string) => s.trim().toLowerCase();

const getChainIdFromEnv = (): number => {
  // Try CHAIN_ID, then ZEROEX_CHAIN_ID, fallback to 84532 in dev
  const raw = process.env.CHAIN_ID ?? process.env.ZEROEX_CHAIN_ID ?? '84532';
  const parsed = Number.parseInt(raw, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    // In dev mode we default to Base Sepolia; do not crash the handler
    return 84532;
  }
  return parsed;
};

function hasRawOrder(x: unknown): x is { order: LimitOrder } {
  return typeof x === 'object' && x !== null && 'order' in x;
}

type OrderBookWithGetRaw = {
  getRaw: (marketId: string, orderHash: string) => Promise<unknown>;
};

function hasGetRaw(x: unknown): x is OrderBookWithGetRaw {
  return (
    typeof x === 'object' &&
    x !== null &&
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    typeof (x as any).getRaw === 'function'
  );
}
@Controller()
export class OrdersController {
  constructor(
    private readonly ob: OrderBookService,
    private readonly repo: PersistenceRepository,
    private readonly signing: ZeroExSigningService,
    private readonly txBuilders: ZeroExTxBuildersService,
  ) {}

  /**
   * POST /orders
   * Verifies a 0x LimitOrder signature (EIP-712 or EthSign via SignatureType),
   * derives side/priceTicks/sizeBase, and places the order into the in-memory
   * order book. OrderBookService enforces trading rules and persists state.
   */
  @Post('orders')
  async place(@Body() body: PostOrderDTO) {
    const { order, signature } = body;
    if (typeof order.expiry === 'string')
      (order as unknown as { expiry: number }).expiry = Number(order.expiry);
    if (!order || !signature) {
      throw new BadRequestException('order and signature are required');
    }

    const makerExpected = toLower(order.maker);
    const devSkipSigs = process.env.DEV_SKIP_SIGS === '1';

    let orderHash: string;

    if (devSkipSigs) {
      // Dev mode: do not use 0x TypedData (addresses like "0xbase..." are not valid).
      // Use a simple hash over the JSON payload instead.
      orderHash = keccak256(toUtf8Bytes(JSON.stringify(order)));
    } else {
      const chainId = getChainIdFromEnv();

      // NEW: accept hex or tuple, and normalize v
      const sigUnion: Signature =
        typeof (signature as unknown) === 'string'
          ? parseSigHexToTuple(
              signature as unknown as string,
              SignatureType.EIP712,
            )
          : (() => {
              const s = signature;
              const vv = s.v === 0 || s.v === 1 ? s.v + 27 : s.v;
              return { ...s, v: vv };
            })();
      const { exchangeProxy } = this.signing['addr'].resolve?.() ?? {
        exchangeProxy: 'unknown',
      };

      console.log('[orders] verify domain', { chainId, exchangeProxy });

      orderHash = this.signing.getOrderHash(chainId, order);

      const { valid, recovered } = this.signing.verifySignature(
        chainId,
        order,
        sigUnion,
      );

      if (!valid || !recovered || toLower(recovered) !== makerExpected) {
        // Minimal diagnostic: compare recovered vs maker, chainId, hash and expiry typing
        // (Remove after debugging)

        const alt = this.signing.verifySignature(chainId, order, {
          ...sigUnion,
          signatureType: SignatureType.ETHSIGN,
        });
        console.warn('[orders] invalid_signature (EIP712)', {
          recovered,
          altRecovered: alt.recovered,
          altValid: alt.valid,
        });

        console.warn('[orders] invalid_signature', {
          chainId,
          makerExpected,
          recovered,
          orderHash,
          orderExpiry: order.expiry,
          expiryType: typeof order.expiry,
          sigIsHex: typeof (signature as unknown) === 'string',
          sigLen:
            typeof (signature as unknown) === 'string'
              ? (signature as unknown as string).length
              : 'tuple',
        });
        throw new BadRequestException('invalid_signature');
      }
    }

    // 2) Resolve market by token pair (makerToken/takerToken)
    const makerToken = toLower(order.makerToken);
    const takerToken = toLower(order.takerToken);

    const markets = await this.repo.listMarketsBasic(); // { id, symbol, baseAddress, quoteAddress }
    const market = markets.find((m) => {
      const base = toLower(m.baseAddress);
      const quote = toLower(m.quoteAddress);
      return (
        (base === makerToken && quote === takerToken) ||
        (base === takerToken && quote === makerToken)
      );
    });

    if (!market) {
      throw new BadRequestException('market_not_found_for_tokens');
    }

    const ctx = await this.repo.getTradingContext(market.id);

    // 3) Derive side, sizeBase, priceTicks from maker/taker amounts
    const makerAmt = BigInt(order.makerAmount);
    const takerAmt = BigInt(order.takerAmount);

    let side: Side;
    let sizeBase: bigint;
    let priceTicks: bigint;

    const baseAddr = ctx.baseAddress;
    const quoteAddr = ctx.quoteAddress;

    const isMakerBase = baseAddr === makerToken && quoteAddr === takerToken;

    if (isMakerBase) {
      // SELL base: maker pays base, receives quote
      side = 'SELL';
      sizeBase = makerAmt;

      // price per 1 base = quote/base = takerAmt / makerAmt
      // priceTicks = (price * 10^quoteDecimals) / priceTickQ
      //            = (takerAmt * 10^quoteDecimals) / (makerAmt * priceTickQ)
      // priceTicks * priceTickQ = (takerAmt * 10^baseDecimals) / makerAmt
      const num = takerAmt * pow10(ctx.baseDecimals);
      const den = makerAmt * ctx.priceTickQ;
      priceTicks = num / den;
      if (num % den !== 0n) {
        throw new BadRequestException('price_tick_violation');
      }
    } else {
      // BUY base: maker pays quote, receives base
      side = 'BUY';
      sizeBase = takerAmt;

      // price per 1 base = quote/base = makerAmt / takerAmt
      // priceTicks * priceTickQ = (makerAmt * 10^baseDecimals) / takerAmt
      const num = makerAmt * pow10(ctx.baseDecimals);
      const den = takerAmt * ctx.priceTickQ;
      priceTicks = num / den;
      if (num % den !== 0n) {
        throw new BadRequestException('price_tick_violation');
      }
    }

    // 4) Place into in-memory book keyed by symbol; persistence is handled inside OrderBookService
    const res = await this.ob.place({
      marketId: market.symbol,
      orderHash,
      maker: makerExpected,
      side,
      priceTicks,
      sizeBase,
    });
    await this.ob.attachRaw(market.symbol, orderHash, { order, signature });

    try {
      const sigHex = toHexSig65(signature);
      await this.repo.attachRawToOrder({
        orderHash,
        order,
        signature: sigHex, // <- sin any, tipado estricto
      });
    } catch (e) {
      console.warn(
        '[orders] attachRawToOrder failed:',
        e instanceof Error ? e.message : String(e),
      );
    }

    return { ok: true, orderHash, status: res.status };
  }

  /**
   * POST /cancel
   * Verifies an eth_sign (personal_sign) signature over the orderHash and
   * cancels the order in the in-memory book plus persistence.
   */
  @Post('cancel')
  async cancel(@Body() body: CancelDTO) {
    const { marketId, orderHash, maker, signature } = body;

    if (!marketId || !orderHash || !maker || !signature) {
      throw new BadRequestException(
        'marketId, orderHash, maker, signature are required',
      );
    }

    const devSkipSigs = process.env.DEV_SKIP_SIGS === '1';

    if (!devSkipSigs) {
      let recovered: string;
      try {
        const digest = hashMessage(getBytes(orderHash));
        recovered = recoverAddress(digest, signature);
        console.warn(
          '[cancel] recovered=',
          recovered,
          'maker=',
          maker,
          'orderHash=',
          orderHash,
        );
      } catch {
        throw new BadRequestException('invalid_signature');
      }

      if (toLower(recovered) !== toLower(maker)) {
        throw new BadRequestException('invalid_signature');
      }
    }

    const out = await this.ob.cancel(marketId, orderHash);
    if (out.status === 'not_found') {
      const ctx2 = await this.repo.getTradingContext(marketId);
      await this.repo.cancelOrder(ctx2.id, orderHash);
      return { orderHash, status: 'cancelled' as const };
    }
    return out;
  }
  @Post('tx/cancel')
  async buildCancelTx(@Body() body: { marketId: string; orderHash: string }) {
    const { marketId, orderHash } = body || ({} as any);
    if (!marketId || !orderHash) {
      throw new BadRequestException('marketId and orderHash are required');
    }

    // Asegura que ob expone getRaw antes de llamarlo (evita no-unsafe-call)
    const obUnknown: unknown = this.ob;
    if (!hasGetRaw(obUnknown)) {
      throw new BadRequestException('getRaw_unavailable');
    }

    const inMemUnknown = await this.ob.getRaw(marketId, orderHash);
    let rawOrder: LimitOrder | undefined;
    if (hasRawOrder(inMemUnknown)) {
      rawOrder = inMemUnknown.order;
    }

    if (!rawOrder) {
      const fromDb = await this.repo.findRawOrderByHash(orderHash);
      rawOrder = fromDb.zeroExOrder ?? undefined;
    }

    if (!rawOrder) {
      throw new BadRequestException('raw_order_not_found');
    }

    const txData = this.txBuilders.buildCancelLimitOrder(rawOrder);
    return { ok: true, txData };
  }
}
