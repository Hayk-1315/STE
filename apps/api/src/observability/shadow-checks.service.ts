// apps/api/src/observability/shadow-checks.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { JsonRpcProvider, Interface } from 'ethers';
import { ZeroExAddressesService } from '../zeroex/addresses.service';

// ABI ERC20 mínimo
const ERC20_ABI = [
  'function balanceOf(address) view returns (uint256)',
  'function allowance(address,address) view returns (uint256)',
] as const;

type LimitOrderLike = {
  makerToken: `0x${string}`;
  makerAmount: string | number | bigint;
  maker: `0x${string}`;
};

export type ShadowCheckResult = {
  ok: boolean;
  warnings: string[];
  details?: { balance: bigint; allowance: bigint; need: bigint };
};

@Injectable()
export class ShadowChecksService {
  private readonly log = new Logger('ShadowChecks');
  private readonly provider: JsonRpcProvider;
  private readonly i20 = new Interface(ERC20_ABI);
  private readonly enabled = (process.env.DEV_SHADOW_CHECKS ?? '1') !== '0'; // on por defecto
  private readonly blockOnFail = (process.env.DEV_SHADOW_BLOCK ?? '0') === '1'; // off por defecto

  constructor(private readonly addr: ZeroExAddressesService) {
    const rpc = process.env.RPC_URL_READONLY || '';
    if (!rpc) throw new Error('ShadowChecks requiere RPC_URL_READONLY');
    this.provider = new JsonRpcProvider(rpc);
  }

  get isEnabled() {
    return this.enabled;
  }
  get isBlocking() {
    return this.blockOnFail;
  }

  async checkMakerFunds(order: LimitOrderLike): Promise<ShadowCheckResult> {
    if (!this.enabled) return { ok: true, warnings: [] };

    try {
      const maker = order.maker.toLowerCase();
      const token = order.makerToken;
      const makerAmount = order.makerAmount;
      const need =
        typeof makerAmount === 'bigint' ? makerAmount : BigInt(makerAmount);
      const spender = this.addr.resolve().allowanceSpender as `0x${string}`;

      // balanceOf
      const balData = this.i20.encodeFunctionData('balanceOf', [maker]);
      const balRet = await this.provider.call({ to: token, data: balData });
      const [balance] = this.i20.decodeFunctionResult(
        'balanceOf',
        balRet,
      ) as unknown as [bigint];

      // allowance
      const allowData = this.i20.encodeFunctionData('allowance', [
        maker,
        spender,
      ]);
      const allowRet = await this.provider.call({ to: token, data: allowData });
      const [allowance] = this.i20.decodeFunctionResult(
        'allowance',
        allowRet,
      ) as unknown as [bigint];

      const warnings: string[] = [];
      if (balance < need)
        warnings.push(`maker balance < need (${balance} < ${need})`);
      if (allowance < need)
        warnings.push(`maker allowance < need (${allowance} < ${need})`);

      const ok = warnings.length === 0;
      if (!ok)
        this.log.warn(`order shadow-check failed: ${warnings.join(' | ')}`);

      return { ok, warnings, details: { balance, allowance, need } };
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      this.log.warn(`shadow-check error: ${msg}`);
      // No bloqueamos por errores transitorios de RPC
      return { ok: true, warnings: [`shadow check error: ${msg}`] };
    }
  }
}
