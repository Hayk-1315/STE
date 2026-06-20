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

// Phase 4.x-c CMR reconciler: only used to mark a SEA CMR intent
// EXECUTED / FAILED when the on-chain fill / revert hits an EXECUTING row
// with `linkedTxHash + marketId + owner` all matching.
import { IntentRepository } from '../sea/intent.repository';
import { IntentEventRepository } from '../sea/intent-event.repository';
import { IntentEventType } from '@prisma/client';

// --- FS helpers para “catch-up” de bloques ---
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve as pathResolve } from 'node:path';
import { MetricsService } from '../observability/metrics.service';
import {
  Backoff,
  isTransientRpcError,
  resolveWatcherEnabled,
} from './rpc-transient.util';

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

// Stale-cursor warning threshold. Tuned so a quick dev restart stays silent while
// a long downtime (overnight, weekend) emits a clear, actionable warning.
// 500 blocks ≈ 17 min on a 2 s chain (Base) and ≈ 100 min on a 12 s chain (Sepolia).
const STALE_CURSOR_BLOCK_THRESHOLD = 500;

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
  private readonly chainId: number;
  private lastScanned = 0;
  private timer?: ReturnType<typeof setInterval>;
  private running = false; // anti-solape
  private readonly seen = new Set<string>(); // de-dup por (txHash, orderHash, execBase)

  // Phase RPC-1: catch-up cap (mirrors CancelWatcher), poll interval knob, and
  // transient-error cooldown so a throttled RPC does not get hammered every tick.
  private readonly maxBlocksPerTick: number;
  private readonly intervalMs: number;
  private readonly backoff: Backoff;
  private cooldownUntil = 0;
  // Set when a transient RPC error at boot deferred cursor initialization to the
  // first successful tick (so the persisted cursor is never reset while RPC is down).
  private needsCursorInit = false;

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
    private readonly metrics: MetricsService,
    @Inject('ZEROEX_CONFIG') cfg: ZeroExConfig,
    // Phase 4.x-c: SEA CMR execution reconciler dependencies.
    private readonly intentRepo: IntentRepository,
    private readonly intentEvents: IntentEventRepository,
  ) {
    // Independent gate (DEV_FILL_WATCHER) with backward-compatible fallback to
    // the shared DEV_ONCHAIN_WATCHER. Default behavior is unchanged.
    this.enabled = resolveWatcherEnabled(
      process.env.DEV_FILL_WATCHER,
      process.env.DEV_ONCHAIN_WATCHER,
    );

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

    // Catch-up batch size. Invalid / missing values fall back to default 100.
    // Mirrors CancelWatcher's bounded catch-up so a long downtime does not fire
    // thousands of eth_getBlockByNumber calls in a single tick.
    const rawMax = Number(process.env.FILL_WATCHER_MAX_BLOCKS_PER_TICK ?? 100);
    const parsedMax =
      Number.isFinite(rawMax) && rawMax > 0 ? Math.floor(rawMax) : 100;
    this.maxBlocksPerTick = Math.min(500, Math.max(1, parsedMax));

    // Poll cadence (ms). Default 2000, floored at 500. Unset = unchanged.
    const rawInt = Number(process.env.FILL_WATCHER_INTERVAL_MS ?? 2000);
    this.intervalMs =
      Number.isFinite(rawInt) && rawInt > 0
        ? Math.max(500, Math.floor(rawInt))
        : 2000;

    // Exponential backoff used only when a transient RPC error is detected.
    this.backoff = new Backoff(
      Number(process.env.WATCHER_RPC_BACKOFF_BASE_MS ?? 15000),
      Number(process.env.WATCHER_RPC_BACKOFF_MAX_MS ?? 120000),
    );

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

    let latest: number | null = null;
    try {
      latest = await this.provider.getBlockNumber();
    } catch (e) {
      if (isTransientRpcError(e)) {
        // Self-heal: a throttled/unavailable RPC at boot must not leave the
        // watcher permanently dead. Defer cursor initialization to the first
        // successful tick (so the persisted cursor is never reset while RPC is
        // down), start the timer in cooldown, and recover automatically.
        this.needsCursorInit = true;
        const ms = this.backoff.nextDelay();
        this.cooldownUntil = Date.now() + ms;
        this.log.warn(
          `boot_degraded reason="${e instanceof Error ? e.message : String(e)}" — RPC quota/rate limit; deferring cursor init; will retry; cooldown=${ms}ms`,
        );
      } else {
        // Diagnostic: previously this throw silently crashed the lifecycle hook
        // and the timer never started, leaving the system without on-chain
        // reconciliation but with no visible error. Make the failure observable
        // and bail out cleanly without scheduling the tick loop.
        this.log.error(
          `boot_failed reason="${e instanceof Error ? e.message : String(e)}" — fill reconciliation will NOT run`,
        );
        return;
      }
    }

    // Normal boot: initialize the cursor now. Degraded boot: skip — the first
    // successful tick will call initCursorFrom().
    if (latest !== null) {
      this.initCursorFrom(latest);
    }

    this.log.log(
      `boot: ep=${this.addr.resolve().exchangeProxy.toLowerCase()} selector=${this.fillSelector}`,
    );

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
    }, this.intervalMs);
  }

  onModuleDestroy(): void {
    if (this.timer) clearInterval(this.timer);
  }

  // Resolve the starting cursor (persisted vs fresh-near-head) and emit the
  // existing started / cursor_stale logs. Shared by normal boot and the
  // deferred first-successful-tick path so log format is preserved verbatim.
  private initCursorFrom(latest: number): void {
    const persisted = loadCursor(this.cursorFile);

    if (persisted && persisted <= latest) {
      // Reanuda exactamente donde lo dejaste la última vez
      this.lastScanned = persisted;
    } else {
      // Sin cursor previo → arranca muy cerca de head (evita duplicados masivos)
      this.lastScanned = Math.max(0, latest - 1);
      saveCursor(this.cursorFile, this.lastScanned);
    }

    this.log.log(
      `started cursor=${this.lastScanned} latest=${latest} cursor_source=${persisted && persisted <= latest ? 'persisted' : 'fresh'}`,
    );

    // Stale-cursor guard: if the persisted cursor is far behind head, the watcher
    // will spend many ticks catching up before it can reconcile new fills in real
    // time. Combined with any RPC flakiness on the catch-up window, fills can be
    // missed silently — exactly the bug we just diagnosed. We do not auto-reset
    // (that would mask legitimate downtime catch-up); we surface the condition
    // with concrete guidance so a developer can decide.
    const lag = latest - this.lastScanned;
    if (lag > STALE_CURSOR_BLOCK_THRESHOLD) {
      this.log.warn(
        `cursor_stale lag=${lag} blocks behind latest=${latest}. ` +
          `Catch-up will delay on-chain reconciliation and may miss fills if RPC drops blocks. ` +
          `Delete ${this.cursorFile} and restart to resume fresh near head.`,
      );
    }
  }

  // Pause the watcher after a transient RPC error: log once, set the cooldown,
  // and never advance the cursor. Subsequent ticks return early until cooldown
  // elapses, so a throttled provider is not hammered every interval.
  private enterCooldown(e: unknown, block?: number): void {
    const ms = this.backoff.nextDelay();
    this.cooldownUntil = Date.now() + ms;
    const where = block !== undefined ? `block=${block} ` : '';
    this.log.warn(
      `rpc_degraded ${where}reason="${e instanceof Error ? e.message : String(e)}" — RPC quota/rate limit exceeded; watcher paused; cursor not advanced; cooldown=${ms}ms`,
    );
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
    // Cooldown gate: while paused after a transient RPC error, make no RPC calls
    // and emit no logs (avoids hammering / log spam during throttling).
    if (Date.now() < this.cooldownUntil) return;

    const ep = this.addr.resolve().exchangeProxy.toLowerCase();

    let latest: number;
    try {
      latest = await this.provider.getBlockNumber();
    } catch (e) {
      if (isTransientRpcError(e)) {
        this.enterCooldown(e);
        return;
      }
      throw e; // non-transient: surface via the timer's .catch as before
    }

    // Deferred boot init (RPC was throttled at startup) — initialize the cursor
    // on the first successful tick without ever resetting a persisted cursor.
    if (this.needsCursorInit) {
      this.initCursorFrom(latest);
      this.needsCursorInit = false;
    }

    // First clean tick after any degradation resets the backoff.
    this.backoff.reset();

    // Cap the per-tick batch so a long downtime catch-up does not pin the event
    // loop or hammer the RPC. Cursor is persisted to `target` (not `latest`) so
    // the remaining range is picked up on subsequent ticks.
    const target = Math.min(latest, this.lastScanned + this.maxBlocksPerTick);

    for (let b = this.lastScanned + 1; b <= target; b++) {
      // Trae el bloque con transacciones completas (v6-safe)
      let raw: unknown;
      try {
        raw = await this.provider.send('eth_getBlockByNumber', [
          '0x' + b.toString(16),
          true, // include full transactions
        ]);
      } catch (e) {
        if (isTransientRpcError(e)) {
          // Symmetric with CancelWatcher: pause and retry the SAME block after
          // cooldown. Cursor is not advanced because we return before the
          // end-of-tick assignment.
          this.enterCooldown(e, b);
          return;
        }
        throw e; // non-transient: surface via the timer's .catch as before
      }

      if (
        !raw ||
        typeof raw !== 'object' ||
        !Array.isArray((raw as { transactions?: unknown }).transactions)
      ) {
        // Diagnostic: previously this silently `continue`d. If RPC is rate-limiting
        // or returning non-standard payloads, we now see which block was skipped.
        this.log.warn(
          `block_skipped block=${b} reason=missing_or_invalid_transactions`,
        );
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

        const rawData =
          typeof tx.input === 'string'
            ? tx.input
            : typeof (tx as Record<string, unknown>).data === 'string'
              ? (tx as Record<string, unknown>).data
              : '0x';
        const dataHex: `0x${string}` =
          typeof rawData === 'string' && rawData.startsWith('0x')
            ? (rawData as `0x${string}`)
            : ('0x' as const);

        if (!dataHex.startsWith(this.fillSelector)) continue;

        // Diagnostic: a candidate is a tx to the EP whose calldata starts with
        // the fillLimitOrder selector. This is the single most important log
        // line for proving "did the watcher see the user's tx?" — log BEFORE
        // any decode/lookup work so even a downstream failure leaves a trace.
        this.log.log(
          `fill_candidate block=${b} tx=${hash || 'nohash'} from=${(typeof tx.from === 'string' ? tx.from : 'unknown').toLowerCase()}`,
        );

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
          const baseLower = m.baseAddress.toLowerCase();

          const isSellBase = mk === baseLower;
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
          if (this.seen.has(dkey)) continue;

          // --- calcula priceTicks para Recent trades ---
          const ctx = await this.repo.getTradingContext(m.id);
          const makerAmt = zxOrder.makerAmount;
          const takerAmt = zxOrder.takerAmount;

          const priceTicks: bigint =
            mk === baseLower
              ? (takerAmt * pow10(ctx.baseDecimals)) /
                (makerAmt * ctx.priceTickQ)
              : (makerAmt * pow10(ctx.baseDecimals)) /
                (takerAmt * ctx.priceTickQ);

          // --- taker = tx.from (si existe); si no, ZERO_ADDR ---
          const takerAddr: `0x${string}` =
            typeof tx.from === 'string' && /^0x[0-9a-fA-F]{40}$/.test(tx.from)
              ? (tx.from as `0x${string}`)
              : ZERO_ADDR;

          // 0) Phase 4.x-c safety (Option A — global revert guard).
          //    Before any maker-side mutation, check the on-chain receipt
          //    status for this candidate. Pre-Phase-4.x the watcher would
          //    blindly create a Trade row and apply the fill based on the
          //    calldata selector alone; that is wrong when the tx actually
          //    reverted. RPC failures / null receipts fall through to the
          //    existing path (fail-open) so a degraded provider does not
          //    stall reconciliation. One extra getTransactionReceipt per
          //    fillLimitOrder candidate — bounded, no architecture change.
          let revertedReceipt = false;
          if (hash) {
            try {
              const r = await this.provider.getTransactionReceipt(hash);
              if (r && (r as { status?: number | null }).status === 0) {
                revertedReceipt = true;
              }
            } catch {
              // unknown — proceed with normal path
            }
          }

          if (revertedReceipt) {
            this.log.warn(
              `reverted_fill skipped maker-side reconciliation block=${b} tx=${hash}`,
            );
            // SEA reconciler: ONLY transition a matching EXECUTING CMR
            // intent. The (txHash, marketId, owner) match guarantees we
            // never touch unrelated intents (Blocker 4). Trade is NOT
            // written; LOB / Order.remainingBase are NOT mutated.
            if (hash) {
              try {
                const hit = await this.intentRepo.findExecutingByTxHashForOwner(
                  {
                    txHash: hash.toLowerCase(),
                    marketId: m.id,
                    owner: takerAddr.toLowerCase(),
                  },
                );
                if (hit) {
                  const ok = await this.intentRepo.markFailedFromExecuting(
                    hit.id,
                    hash.toLowerCase(),
                    'tx_reverted',
                  );
                  if (ok) {
                    await this.intentEvents.append(
                      hit.id,
                      IntentEventType.FAILED,
                      {
                        reason: 'tx_reverted',
                        txHash: hash.toLowerCase(),
                      },
                    );
                    this.log.warn(
                      `sea/cmr reconciled FAILED(tx_reverted) intent=${hit.id} tx=${hash}`,
                    );
                  }
                }
              } catch (e) {
                // Reconciler errors must NEVER bubble out of the tick.
                this.log.warn(
                  `sea/cmr reconciler error tx=${hash}: ${
                    e instanceof Error ? e.message : String(e)
                  }`,
                );
              }
            }
            this.seen.add(dkey);
            continue; // do NOT call addTrade / applyExternalFill
          }

          // 1) registra trade (para Recent trades)
          // Phase 4.x-a: forward the source tx hash into Trade.txHash so SEA's
          // CMR reconciliation (Phase 4.x-c) can link a Trade back to the
          // intent by linkedTxHash in O(1). `hash` is the empty string only
          // when the RPC payload was malformed (logged above); addTrade
          // collapses any non-conformant input to NULL.
          await this.repo.addTrade(
            ctx.id,
            orderHash,
            takerAddr.toLowerCase(),
            priceTicks,
            execBase,
            hash || undefined,
          );

          // 2) reconcilia remaining en LOB + BD
          const res = await this.ob.applyExternalFill(
            m.symbol,
            orderHash,
            execBase,
          );
          this.metrics.fillsTotal.inc({ status: res.status });

          this.log.log(
            `on-chain fill reconciled → ${res.status} ${orderHash} sizeBase=${execBase.toString()}`,
          );

          // 3) Phase 4.x-c: SEA CMR reconciler — successful fill path. The
          //    reverted path is handled upstream by the receipt pre-check;
          //    if we reach here the tx succeeded on-chain.
          if (hash) {
            try {
              const hit = await this.intentRepo.findExecutingByTxHashForOwner({
                txHash: hash.toLowerCase(),
                marketId: m.id,
                owner: takerAddr.toLowerCase(),
              });
              if (hit) {
                const ok = await this.intentRepo.markExecuted(
                  hit.id,
                  hash.toLowerCase(),
                );
                if (ok) {
                  await this.intentEvents.append(
                    hit.id,
                    IntentEventType.EXECUTED,
                    {
                      txHash: hash.toLowerCase(),
                      orderHash,
                      sizeBase: execBase.toString(),
                    },
                  );
                  this.log.log(
                    `sea/cmr reconciled EXECUTED intent=${hit.id} tx=${hash}`,
                  );
                }
              }
            } catch (e) {
              this.log.warn(
                `sea/cmr reconciler error tx=${hash}: ${
                  e instanceof Error ? e.message : String(e)
                }`,
              );
            }
          }

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

    this.lastScanned = target;
    saveCursor(this.cursorFile, target);

    // Low-noise progress indicator while catching up. Only fires when the batch
    // cap actually limited this tick — steady-state ticks (target === latest)
    // stay silent. Mirrors CancelWatcher's catch_up line.
    if (target < latest) {
      const remaining = latest - target;
      this.log.log(
        `catch_up cursor=${target} latest=${latest} remaining=${remaining}`,
      );
    }
  }
}
