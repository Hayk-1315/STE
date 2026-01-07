// apps/api/src/onchain/fill-watcher.service.ts
import {
  Injectable,
  Inject,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { JsonRpcProvider, Interface } from 'ethers';
import { ZeroExAddressesService } from '../zeroex/addresses.service';
import { ZeroExSigningService } from '../zeroex/signing.service';
import { OrderBookService } from '../matching/orderbook.service';
import { PersistenceRepository } from '../matching/persistence.repository';
import type { ZeroExConfig } from '../zeroex/zeroex.config';

// --- FS helpers para “catch-up” de bloques ---
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve as pathResolve } from 'node:path';

function loadCursor(file: string): number | null {
  try {
    if (!existsSync(file)) return null;
    const raw = readFileSync(file, 'utf8');
    const parsed = JSON.parse(raw) as { lastScanned?: string };
    const n = Number.parseInt(String(parsed.lastScanned ?? ''), 10);
    return Number.isFinite(n) && n > 0 ? n : null;
  } catch {
    return null;
  }
}
function saveCursor(file: string, height: number): void {
  try {
    const dir = dirname(file);
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    writeFileSync(
      file,
      JSON.stringify({ lastScanned: String(height) }),
      'utf8',
    );
  } catch {
    /* ignore */
  }
}

// --------- ABI mínimo: fillLimitOrder((...), (sig...), uint128 takerFill) ----------
const EP_MIN_ABI = [
  'function fillLimitOrder((address makerToken,address takerToken,uint128 makerAmount,uint128 takerAmount,uint128 takerTokenFeeAmount,address maker,address taker,address sender,address feeRecipient,bytes32 pool,uint64 expiry,uint256 salt) order,(uint8 signatureType,uint8 v,bytes32 r,bytes32 s) signature,uint128 takerTokenFillAmount)',
] as const;

type DecodedOrder = {
  makerToken: `0x${string}`;
  takerToken: `0x${string}`;
  makerAmount: bigint;
  takerAmount: bigint;
  takerTokenFeeAmount: bigint;
  maker: `0x${string}`;
  taker: `0x${string}`;
  sender: `0x${string}`;
  feeRecipient: `0x${string}`;
  pool: `0x${string}`;
  expiry: bigint;
  salt: bigint;
};

// ---- helpers/guards estrictos ----
function isBig(v: unknown): v is bigint {
  return typeof v === 'bigint';
}
function isHexAddr(v: unknown): v is `0x${string}` {
  return typeof v === 'string' && /^0x[a-fA-F0-9]{40}$/.test(v);
}
function isHex32(v: unknown): v is `0x${string}` {
  return typeof v === 'string' && /^0x([a-fA-F0-9]{64})$/.test(v);
}
function isDecodedOrderLike(v: unknown): v is DecodedOrder {
  if (!v || typeof v !== 'object') return false;
  const o = v as Record<string, unknown>;
  return (
    isHexAddr(o.makerToken) &&
    isHexAddr(o.takerToken) &&
    isBig(o.makerAmount) &&
    isBig(o.takerAmount) &&
    isBig(o.takerTokenFeeAmount) &&
    isHexAddr(o.maker) &&
    isHexAddr(o.taker) &&
    isHexAddr(o.sender) &&
    isHexAddr(o.feeRecipient) &&
    isHex32(o.pool) &&
    isBig(o.expiry) &&
    isBig(o.salt)
  );
}

const ZERO_ADDR = '0x0000000000000000000000000000000000000000' as const;
const pow10 = (n: number) => {
  let r = 1n;
  for (let i = 0; i < n; i++) r *= 10n;
  return r;
};

@Injectable()
export class FillWatcherService implements OnModuleInit, OnModuleDestroy {
  private readonly log = new Logger('FillWatcher');
  private readonly iface = new Interface(EP_MIN_ABI);
  private readonly provider: JsonRpcProvider;
  private readonly fillSelector: `0x${string}`;
  private readonly enabled: boolean;
  private readonly debug: boolean;
  private readonly chainId: number;
  private lastScanned = 0;
  private timer?: ReturnType<typeof setInterval>;
  private running = false; // anti-solape
  private readonly seen = new Set<string>(); // de-dup por (txHash, orderHash, execBase)

  // ⬇️ propiedad de clase, NO parámetro DI
  private readonly cursorFile: string = pathResolve(
    process.cwd(),
    '.cache/fill-watcher.cursor.json',
  );

  constructor(
    private readonly addr: ZeroExAddressesService,
    private readonly signing: ZeroExSigningService,
    private readonly ob: OrderBookService,
    private readonly repo: PersistenceRepository,
    @Inject('ZEROEX_CONFIG') cfg: ZeroExConfig,
  ) {
    // flags
    this.enabled = (process.env.DEV_ONCHAIN_WATCHER ?? '') === '1';
    this.debug = (process.env.DEBUG_WATCHER ?? '') === '1';

    // provider
    const rpc: string =
      typeof cfg.rpcUrl === 'string' ? cfg.rpcUrl : String(cfg.rpcUrl ?? '');
    if (!rpc) {
      throw new Error(
        'FillWatcher requiere RPC_URL_READONLY (rpcUrl) en ZEROEX_CONFIG',
      );
    }
    this.provider = new JsonRpcProvider(rpc);

    // chain id
    const cid = Number(process.env.CHAIN_ID ?? 8453);
    this.chainId = Number.isFinite(cid) && cid > 0 ? cid : 8453;

    // selector calculado de forma segura
    const fn = this.iface.getFunction('fillLimitOrder');
    if (!fn) {
      throw new Error('fillLimitOrder function not found in ABI');
    }
    this.fillSelector = fn.selector as `0x${string}`;
  }

  async onModuleInit(): Promise<void> {
    if (!this.enabled) {
      this.log.log('disabled (DEV_ONCHAIN_WATCHER!=1)');
      return;
    }
    const latest = await this.provider.getBlockNumber();
    const persisted = loadCursor(this.cursorFile);
    const back = Math.max(0, latest - 50); // reescanea ~50 bloques
    this.lastScanned = persisted && persisted <= latest ? persisted : back;

    // callback sin `async` → no retorna Promise
    this.timer = setInterval((): void => {
      if (!this.enabled) return;
      if (this.running) return;
      this.running = true;
      this.tick()
        .catch((e: unknown) =>
          this.log.error(e instanceof Error ? e.message : String(e)),
        )
        .finally(() => {
          this.running = false;
        });
    }, 2000);

    this.log.log(`started at block ${this.lastScanned}`);
  }

  onModuleDestroy(): void {
    if (this.timer) clearInterval(this.timer);
  }

  private toZx(o: DecodedOrder) {
    // estructura compatible con tu ZeroExSigningService
    return {
      makerToken: o.makerToken,
      takerToken: o.takerToken,
      makerAmount: o.makerAmount,
      takerAmount: o.takerAmount,
      takerTokenFeeAmount: o.takerTokenFeeAmount,
      maker: o.maker,
      taker: o.taker,
      sender: o.sender,
      feeRecipient: o.feeRecipient,
      pool: o.pool,
      expiry: Number(o.expiry),
      salt: o.salt,
    };
  }

  private async tick(): Promise<void> {
    const ep = this.addr.resolve().exchangeProxy.toLowerCase();
    const latest = await this.provider.getBlockNumber();

    for (let b = this.lastScanned + 1; b <= latest; b++) {
      // Trae el bloque con transacciones completas (v6-safe)
      const raw = (await this.provider.send('eth_getBlockByNumber', [
        '0x' + b.toString(16),
        true, // include full transactions
      ])) as unknown;

      if (
        !raw ||
        typeof raw !== 'object' ||
        !Array.isArray((raw as { transactions?: unknown }).transactions)
      ) {
        continue;
      }

      type RawTx = {
        to?: string | null;
        input?: unknown;
        from?: string | null;
        hash?: string | null;
      };
      const txs: RawTx[] = (raw as { transactions: RawTx[] }).transactions;

      for (const tx of txs) {
        const to = (typeof tx.to === 'string' ? tx.to : '').toLowerCase();
        if (to !== ep) continue;

        const hash =
          typeof tx.hash === 'string' && /^0x[0-9a-fA-F]{64}$/.test(tx.hash)
            ? (tx.hash as `0x${string}`)
            : ('' as const);

        const dataHex: `0x${string}` =
          typeof tx.input === 'string' && tx.input.startsWith('0x')
            ? (tx.input as `0x${string}`)
            : ('0x' as const);

        if (this.debug) {
          this.log.debug(
            `tx.to=${to} ep=${ep} data[:10]=${dataHex.slice(0, 10)}`,
          );
        }

        if (!dataHex.startsWith(this.fillSelector)) continue;

        try {
          const decodedUnknown: unknown = this.iface.decodeFunctionData(
            'fillLimitOrder',
            dataHex,
          );

          if (!Array.isArray(decodedUnknown) || decodedUnknown.length < 3) {
            this.log.warn('decode returned unexpected shape for fill');
            continue;
          }

          const ord: unknown = decodedUnknown[0];
          const takerFill: unknown = decodedUnknown[2];

          if (!isDecodedOrderLike(ord) || typeof takerFill !== 'bigint') {
            this.log.warn('fill decoded args failed type guard');
            continue;
          }

          const zxOrder = this.toZx(ord);
          const orderHash = this.signing.getOrderHash(this.chainId, zxOrder);

          const mk = zxOrder.makerToken.toLowerCase();
          const tk = zxOrder.takerToken.toLowerCase();
          const markets = await this.repo.listMarketsBasic();
          const m = markets.find((x) => {
            const base = x.baseAddress.toLowerCase();
            const quote = x.quoteAddress.toLowerCase();
            return (
              (base === mk && quote === tk) || (base === tk && quote === mk)
            );
          });
          if (!m) {
            this.log.warn(
              `market_not_found_for_tokens makerToken=${mk} takerToken=${tk}`,
            );
            continue;
          }

          const isSellBase = mk === m.baseAddress;
          const execBase: bigint = isSellBase
            ? (takerFill * zxOrder.makerAmount) / zxOrder.takerAmount
            : takerFill;

          if (execBase <= 0n) continue;

          // --- de-dup por (txHash, orderHash, execBase) ---
          const dkey =
            (hash ? `${hash.toLowerCase()}` : 'nohash') +
            ':' +
            orderHash.toLowerCase() +
            ':' +
            execBase.toString();
          if (this.seen.has(dkey)) {
            if (this.debug) this.log.debug(`dedup skip ${dkey}`);
            continue;
          }

          // --- calcula priceTicks para Recent trades ---
          const ctx = await this.repo.getTradingContext(m.symbol);
          const makerAmt = zxOrder.makerAmount;
          const takerAmt = zxOrder.takerAmount;

          const priceTicks: bigint =
            mk === m.baseAddress
              ? (takerAmt * pow10(ctx.baseDecimals)) /
                (makerAmt * ctx.priceTickQ)
              : (makerAmt * pow10(ctx.baseDecimals)) /
                (takerAmt * ctx.priceTickQ);

          // --- taker = tx.from (si existe); si no, ZERO_ADDR ---
          const takerAddr: `0x${string}` =
            typeof tx.from === 'string' && /^0x[0-9a-fA-F]{40}$/.test(tx.from)
              ? (tx.from as `0x${string}`)
              : ZERO_ADDR;

          // 1) registra trade (para Recent trades)
          await this.repo.addTrade(
            ctx.id,
            orderHash,
            takerAddr.toLowerCase(),
            priceTicks,
            execBase,
          );

          // 2) reconcilia remaining en LOB + BD
          const res = await this.ob.applyExternalFill(
            m.symbol,
            orderHash,
            execBase,
          );
          this.log.log(
            `on-chain fill reconciled → ${res.status} ${orderHash} sizeBase=${execBase.toString()}`,
          );

          // marca dedup SOLO tras éxito
          this.seen.add(dkey);
          if (this.seen.size > 10_000) {
            const it = this.seen.values();
            const first = it.next().value;
            if (first) this.seen.delete(first);
          }
        } catch (e: unknown) {
          this.log.warn(
            `fill decode/handle error: ${
              e instanceof Error ? e.message : String(e)
            }`,
          );
        }
      }
    }

    this.lastScanned = latest;
    saveCursor(this.cursorFile, latest);
  }
}
