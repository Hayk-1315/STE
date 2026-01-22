// apps/api/src/onchain/cancel-watcher.service.ts
import {
  Injectable,
  Inject,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ZeroExAddressesService } from '../zeroex/addresses.service';
import { ZeroExSigningService } from '../zeroex/signing.service';
import { OrderBookService } from '../matching/orderbook.service';
import { PersistenceRepository } from '../matching/persistence.repository';
import type { LimitOrder as ZxLimitOrder } from '../zeroex/limit-order.types';
import { JsonRpcProvider, Interface } from 'ethers';
import type { ZeroExConfig } from '../zeroex/zeroex.config';
import { MetricsService } from '../observability/metrics.service';

// --- type guards/helpers estrictos ---
const SELECTOR_CANCEL = '0x7d49ec1a' as const; // cancelLimitOrder(...)
const SELECTOR_CANCEL_PAIR = '0xd0a55fb0' as const; // cancelPairLimitOrders(address,address,uint256)

function isHexAddr(v: unknown): v is `0x${string}` {
  return typeof v === 'string' && /^0x[a-fA-F0-9]{40}$/.test(v);
}
function isHex32(v: unknown): v is `0x${string}` {
  if (typeof v !== 'string') return false;
  const hex = v.startsWith('0x') ? v.slice(2) : v;
  return /^[a-fA-F0-9]{64}$/.test(hex);
}
function isBig(v: unknown): v is bigint {
  return typeof v === 'bigint';
}

// estructura deconstruida del input (tal y como la devuelve ethers al decodificar)
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
  expiry: bigint; // uint64 → ethers v6 decodifica como bigint
  salt: bigint;
};

/** Guard estricto para el objeto de orden decodificado desde calldata */
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

// ABI mínimo: cancelLimitOrder((...))
const EP_MIN_ABI = [
  'function cancelLimitOrder((address makerToken,address takerToken,uint128 makerAmount,uint128 takerAmount,uint128 takerTokenFeeAmount,address maker,address taker,address sender,address feeRecipient,bytes32 pool,uint64 expiry,uint256 salt) order)',
] as const;

// ABI mínimo: cancelPairLimitOrders(address,address,uint256)
const EP_CANCEL_PAIR_ABI = [
  'function cancelPairLimitOrders(address makerToken,address takerToken,uint256 minValidSalt)',
] as const;

type RpcTxLite = {
  to: string | null;
  input?: string; // algunos nodos devuelven `input` para calldata
  data?: string; // otros devuelven `data`
  from?: string | null;
  hash?: string | null;
};
type RpcBlockWithTxs = { transactions: ReadonlyArray<RpcTxLite> };

function isRpcBlockWithTxs(v: unknown): v is RpcBlockWithTxs {
  return (
    !!v &&
    typeof v === 'object' &&
    Array.isArray((v as { transactions?: unknown }).transactions)
  );
}

@Injectable()
export class CancelWatcherService implements OnModuleInit, OnModuleDestroy {
  private readonly log = new Logger('CancelWatcher');
  private readonly iface = new Interface(EP_MIN_ABI);
  private readonly cancelPairIface = new Interface(EP_CANCEL_PAIR_ABI);
  private readonly provider: JsonRpcProvider;
  private readonly rpcUrl: string;
  private lastScanned = 0;
  private timer?: ReturnType<typeof setInterval>;
  private readonly enabled: boolean;
  private readonly chainId: number;

  constructor(
    private readonly addr: ZeroExAddressesService,
    private readonly signing: ZeroExSigningService,
    private readonly ob: OrderBookService,
    private readonly repo: PersistenceRepository,
    private readonly metrics: MetricsService,
    @Inject('ZEROEX_CONFIG') cfg: ZeroExConfig,
  ) {
    // Sólo activa si DEV_ONCHAIN_WATCHER=1 (para no afectar producción)
    this.enabled = (process.env.DEV_ONCHAIN_WATCHER ?? '') === '1';

    // Valida y guarda el RPC como string estricto
    const rpc: string =
      typeof cfg.rpcUrl === 'string' ? cfg.rpcUrl : String(cfg.rpcUrl ?? '');

    if (!rpc) {
      throw new Error(
        'CancelWatcherService requiere RPC_URL_READONLY (rpcUrl) en ZEROEX_CONFIG',
      );
    }

    this.rpcUrl = rpc;
    this.provider = new JsonRpcProvider(this.rpcUrl);

    // Chain (por defecto Base mainnet si no hay CHAIN_ID)
    const cid = Number(process.env.CHAIN_ID ?? 8453);
    this.chainId = Number.isFinite(cid) && cid > 0 ? cid : 8453;
  }

  async onModuleInit(): Promise<void> {
    if (!this.enabled) {
      this.log.log('disabled (DEV_ONCHAIN_WATCHER!=1)');
      return;
    }
    // escanear también el siguiente bloque nuevo
    this.lastScanned = (await this.provider.getBlockNumber()) - 1;

    this.timer = setInterval(() => {
      void this.tick().catch((e: unknown) =>
        this.log.error(e instanceof Error ? e.message : String(e)),
      );
    }, 2000);

    this.log.log(`started at block ${this.lastScanned}`);
  }

  onModuleDestroy(): void {
    if (this.timer) clearInterval(this.timer);
  }

  private toLimitOrder(o: DecodedOrder): ZxLimitOrder {
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
      expiry: Number(o.expiry), // tu servicio normaliza number
      salt: o.salt,
    };
  }

  private async tick(): Promise<void> {
    const ep = this.addr.resolve().exchangeProxy.toLowerCase();
    const latest = await this.provider.getBlockNumber();
    if (latest <= this.lastScanned) return;

    for (let b = this.lastScanned + 1; b <= latest; b++) {
      // ethers v6: usar JSON-RPC directo para obtener el bloque con transacciones
      const hexBlock = '0x' + b.toString(16);
      const blockUnknown: unknown = await this.provider.send(
        'eth_getBlockByNumber',
        [hexBlock, true], // include full tx objects
      );

      if (!isRpcBlockWithTxs(blockUnknown)) continue;

      const txs = blockUnknown.transactions;
      for (const tx of txs) {
        const to = (tx.to ?? '').toLowerCase();
        if (to !== ep) continue;

        // algunos nodos devuelven `input`, otros `data`
        const raw =
          (typeof tx.input === 'string' && tx.input) ||
          (typeof tx.data === 'string' && tx.data) ||
          '0x';
        const dataHex = raw.startsWith('0x')
          ? (raw as `0x${string}`)
          : ('0x' as const);

        const debug = (process.env.DEBUG_WATCHER ?? '') === '1';
        if (debug) {
          this.log.debug(`tx.to=${String(tx.to)} ep=${ep}`);
          this.log.debug(`data[:10]=${dataHex.slice(0, 10)}`);
        }

        // --- Rama 1: cancelPairLimitOrders(address,address,uint256)
        if (dataHex.startsWith(SELECTOR_CANCEL_PAIR)) {
          try {
            const [makerToken, takerToken, minValidSalt] =
              this.cancelPairIface.decodeFunctionData(
                'cancelPairLimitOrders',
                dataHex,
              ) as unknown as [string, string, bigint];

            const makerLower = (tx.from ?? '').toLowerCase();
            const mk = makerToken.toLowerCase();
            const tk = takerToken.toLowerCase();

            // Resolver mercado por tokens (en cualquier orientación)
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
                `[CancelWatcher] cancelPair: market not found for ${makerToken}/${takerToken}`,
              );
              continue;
            }

            // Candidatos: órdenes PLACED del símbolo
            const placed = await this.repo.listPlacedBySymbol(m.symbol);

            const toCancel: string[] = [];
            for (const o of placed) {
              if ((o.maker || '').toLowerCase() !== makerLower) continue;

              // Buscar raw para leer salt (memoria → BD)
              const row = await this.repo.findRawOrderByHash(o.orderHash);
              const saltStr = row?.zeroExOrder?.salt as string | undefined;
              if (!saltStr) continue;

              let salt: bigint;
              try {
                salt = BigInt(saltStr);
              } catch {
                continue;
              }

              if (salt < minValidSalt) {
                toCancel.push(o.orderHash);
              }
            }

            // Aplica cancelación en LOB + BD
            for (const hsh of toCancel) {
              try {
                const res = await this.ob.cancel(m.symbol, hsh);
                if (res.status !== 'cancelled') {
                  // DB-only fallback; si no existe en BD, ignora (idempotente)
                  try {
                    await this.repo.cancelOrder(m.id, hsh);
                  } catch {
                    /* ignore not-found to keep watcher resilient */
                  }
                }
              } catch (e) {
                this.log.warn(
                  `[CancelWatcher] cancelPair: failed cancel ${hsh} → ${
                    e instanceof Error ? e.message : String(e)
                  }`,
                );
              }
            }
            // ⬇️ AÑADE (cuenta cuántas órdenes se han cancelado en el lote):
            if (toCancel.length > 0) {
              this.metrics.ordersCancelled.inc(
                { kind: 'pair', result: 'cancelled' },
                toCancel.length,
              );
            }

            this.log.log(
              `[CancelWatcher] cancelPair: ${toCancel.length} order(s) cancelled for ${m.symbol} maker=${makerLower} salt<${minValidSalt.toString()}`,
            );
          } catch (e) {
            this.log.warn(
              `cancelPair decode/handle error: ${
                e instanceof Error ? e.message : String(e)
              }`,
            );
          }
          continue; // esta tx ya tratada
        }

        // --- Rama 2: cancelLimitOrder((...)) (ya existente)
        if (!dataHex.startsWith(SELECTOR_CANCEL)) continue;

        try {
          // decodeFunctionData devuelve Result (unknown[]). Lo tratamos como unknown y validamos.
          const decodedUnknown: unknown = this.iface.decodeFunctionData(
            'cancelLimitOrder',
            dataHex,
          );

          // Esperamos un array con el primer elemento = tupla del order
          if (!Array.isArray(decodedUnknown) || decodedUnknown.length === 0) {
            this.log.warn('decode returned unexpected shape');
            continue;
          }

          const first: unknown = decodedUnknown[0];

          // Ethers devuelve un objeto con props nombradas; aplicamos el guard
          if (!isDecodedOrderLike(first)) {
            this.log.warn('decoded order failed type guard');
            continue;
          }

          // ahora `first` es DecodedOrder estrictamente tipado
          const order: DecodedOrder = first;

          // Recalcular orderHash con tu mismo dominio
          const zxOrder = this.toLimitOrder(order);
          const orderHash = this.signing.getOrderHash(this.chainId, zxOrder);

          // Resolver mercado por tokens
          const mk2 = zxOrder.makerToken.toLowerCase();
          const tk2 = zxOrder.takerToken.toLowerCase();
          const markets2 = await this.repo.listMarketsBasic();
          const m2 = markets2.find((x) => {
            const base = x.baseAddress.toLowerCase();
            const quote = x.quoteAddress.toLowerCase();
            return (
              (base === mk2 && quote === tk2) || (base === tk2 && quote === mk2)
            );
          });
          if (!m2) {
            this.log.warn(
              `market_not_found_for_tokens makerToken=${mk2} takerToken=${tk2}`,
            );
            continue;
          }

          // Reconciliar cancel local por symbol (key del LOB)
          const res = await this.ob.cancel(m2.symbol, orderHash);
          if (res.status === 'cancelled') {
            this.log.log(`on-chain cancel reconciled → cancelled ${orderHash}`);
            this.metrics.ordersCancelled.inc({
              kind: 'single',
              result: 'cancelled',
            });
          } else {
            // LOB vacío tras restart: persiste cancel en BD igualmente (idempotente)
            try {
              await this.repo.cancelOrder(m2.id, orderHash);
              this.log.log(
                `on-chain cancel reconciled (DB only) → cancelled ${orderHash}`,
              );
              this.metrics.ordersCancelled.inc({
                kind: 'single',
                result: 'cancelled',
              });
            } catch {
              // evita crash si no existe el registro; ya está cancelada / no existe
              this.log.warn(
                `on-chain cancel DB-only: record not found for ${orderHash} (ignored)`,
              );
            }
          }
        } catch (e: unknown) {
          this.log.warn(
            `decode/handle error: ${e instanceof Error ? e.message : String(e)}`,
          );
        }
      }
    }

    this.lastScanned = latest;
  }
}
