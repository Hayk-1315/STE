// apps/api/src/sea/delegated/biconomy-delegation.provider.ts
//
// Real Biconomy Smart Sessions + Nexus provider, faithful to the Phase 0 spike.
// ONLY instantiated when `SEA_DELEGATED_PROVIDER=biconomy` AND the feature is
// enabled on a writable profile; otherwise the mock provider is used. All
// `@biconomy/abstractjs` / `viem` imports are DYNAMIC (inside methods), so the
// SDK never loads on the default path and never runs in normal CI. Live paths
// are exercised only by the RUN_DELEGATED_LIVE=1 gated harness.
//
// Session policy (spike-proven): single target (0x EP) + selector
// (fillLimitOrder) + usageLimit=1 + TimeFrame(validUntil) + UniversalAction
// param-rule (takerTokenFillAmount <= maxTakerFillAmountQ, calldata word 16).
// NOTE: no on-chain ERC-20 SpendingLimitsPolicy — it cannot parse a 0x
// fillLimitOrder call (built for approve/transfer calldata) and reverts the
// userOp (PolicyViolation/AA23). The actual taker fee is proportional and not a
// single calldata word, so it is bounded STE-side (fresh-quote validator) and
// re-checked here against the receipt's LimitOrderFilled fee. Non-custodial: the
// user signs the enable digest; the backend session key only signs the EXECUTION
// userOp hash (raw ECDSA). Bundler flow, account-funded gas (no paymaster).
// execute() self-confirms via the 0x LimitOrderFilled event and NEVER fakes it.
//
// The `@biconomy/abstractjs` surface is treated as an untyped boundary (`any`),
// validated live via the gated harness rather than the type system.
/* eslint-disable @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return */
import { Inject, Injectable, Logger } from '@nestjs/common';
import type { DelegationConfig } from './delegation.config';
import { SessionSignerProvider } from './session-signer.provider';
import {
  DELEGATION_CONFIG,
  type DelegationProvider,
  type DelegationContext,
  type DelegationCapabilities,
  type PrepareGrantRequest,
  type PrepareGrantResult,
  type FinalizeGrantRequest,
  type FinalizeGrantResult,
  type ExecuteRequest,
  type ExecuteResult,
  type RevokePrepareRequest,
  type RevokePrepareResult,
  type SaStatusRequest,
  type SaStatusResult,
} from './delegation-provider.interface';
import type {
  CmrDelegationPolicy,
  DelegationProviderKind,
} from './delegated.types';

const ENTRYPOINT07 = '0x0000000071727De22E5E9d8BAf0edAc6f37da032';

// 0x v4 LimitOrderFilled (flat, non-indexed) — used for receipt confirmation.
const LIMIT_ORDER_FILLED_ABI = {
  type: 'event',
  name: 'LimitOrderFilled',
  inputs: [
    { name: 'orderHash', type: 'bytes32' },
    { name: 'maker', type: 'address' },
    { name: 'taker', type: 'address' },
    { name: 'feeRecipient', type: 'address' },
    { name: 'makerToken', type: 'address' },
    { name: 'takerToken', type: 'address' },
    { name: 'takerTokenFilledAmount', type: 'uint128' },
    { name: 'makerTokenFilledAmount', type: 'uint128' },
    { name: 'takerTokenFeeFilledAmount', type: 'uint128' },
    { name: 'protocolFeePaid', type: 'uint256' },
    { name: 'pool', type: 'bytes32' },
  ],
} as const;

// Minimal read ABIs for sa-status (balances/allowance + ERC-7579 module check).
const ERC20_MIN_ABI = [
  {
    type: 'function',
    name: 'balanceOf',
    stateMutability: 'view',
    inputs: [{ name: 'a', type: 'address' }],
    outputs: [{ type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'allowance',
    stateMutability: 'view',
    inputs: [
      { name: 'o', type: 'address' },
      { name: 's', type: 'address' },
    ],
    outputs: [{ type: 'uint256' }],
  },
] as const;
const IS_MODULE_INSTALLED_ABI = [
  {
    type: 'function',
    name: 'isModuleInstalled',
    stateMutability: 'view',
    inputs: [{ type: 'uint256' }, { type: 'address' }, { type: 'bytes' }],
    outputs: [{ type: 'bool' }],
  },
] as const;
// Recommended SA ETH for setup + fill userOps (account-funded gas; no paymaster).
const RECOMMENDED_SA_ETH_WEI = 20000000000000000n; // 0.02 ETH

@Injectable()
export class BiconomyDelegationProvider implements DelegationProvider {
  readonly kind: DelegationProviderKind = 'BICONOMY';
  private readonly log = new Logger('BiconomyDelegationProvider');

  constructor(
    @Inject(DELEGATION_CONFIG) private readonly cfg: DelegationConfig,
    private readonly signer: SessionSignerProvider,
  ) {}

  capabilities(ctx: DelegationContext): Promise<DelegationCapabilities> {
    return Promise.resolve({
      supported: this.cfg.enabled && this.signer.isAvailable(),
      accountModels: ['EIP7702', 'NEXUS_SA'],
      reason: this.signer.isAvailable()
        ? `biconomy (chain ${ctx.chainId})`
        : 'session signer unavailable',
    });
  }

  private async sdk(): Promise<any> {
    const abstractjs: any = await import('@biconomy/abstractjs');
    const viem: any = await import('viem');
    const chains: any = await import('viem/chains');
    const aa: any = await import('viem/account-abstraction');
    return { abstractjs, viem, chains, aa };
  }

  private rpc(): string {
    return (
      this.cfg.bundlerUrl ??
      process.env.RPC_URL ??
      process.env.RPC_URL_READONLY ??
      ''
    );
  }

  private pad32(v: bigint): `0x${string}` {
    return `0x${v.toString(16).padStart(64, '0')}`;
  }

  private buildActionData(abstractjs: any, policy: CmrDelegationPolicy): any {
    const rule = {
      condition: abstractjs.ParamCondition.LESS_THAN_OR_EQUAL,
      offsetIndex: 16, // takerTokenFillAmount word in fillLimitOrder calldata
      isLimited: false,
      ref: this.pad32(policy.maxTakerFillAmountQ),
      usage: { limit: 0n, used: 0n },
    };
    // On-chain notional bound = the UniversalActionPolicy param-rule
    // (takerTokenFillAmount <= maxTakerFillAmountQ, calldata word 16), exactly
    // the config proven in the Phase 0 spike (s4c "C_paramRule"). We deliberately
    // do NOT attach getSpendingLimitsPolicy: that policy is built to parse ERC-20
    // approve/transfer calldata and cannot decode a 0x fillLimitOrder call, so it
    // rejects the userOp with PolicyViolation (AA23). The param-rule caps the fill
    // size, and because the taker fee is a fixed fraction of the immutable signed
    // order, total spend is implicitly bounded to <= amount+fee. policy.spendCapQ
    // remains the authoritative guard on the STE side (fresh-quote validator).
    const policies = [
      abstractjs.getUsageLimitPolicy({ limit: BigInt(policy.usageLimit) }),
      abstractjs.getTimeFramePolicy({
        validUntil: policy.validUntil,
        validAfter: 0,
      }),
      abstractjs.getUniversalActionPolicy(
        abstractjs.toActionConfig(abstractjs.createActionConfig([rule], 0n)),
      ),
    ];
    return abstractjs.createActionData(
      policy.target,
      policy.functionSelector,
      policies,
    );
  }

  /**
   * Non-custodial enable: prepareGrant builds the session + the digest the USER
   * signs; finalizeGrant attaches the user's signature. Live-validated via the
   * RUN_DELEGATED_LIVE harness (not CI).
   */
  async prepareGrant(req: PrepareGrantRequest): Promise<PrepareGrantResult> {
    if (!this.signer.isAvailable()) {
      return { ok: false, reason: 'session_signer_unavailable' };
    }
    try {
      const { abstractjs, viem, chains } = await this.sdk();
      // The 0x taker (session account). EIP7702: the account IS the owner EOA.
      // NEXUS_SA: a counterfactual Nexus SA derived from the owner ADDRESS only
      // (no private key — see computeSaAddress). The enable digest is then bound
      // to the SA and signed by the SA's owner (the user's wallet).
      const accountAddress =
        req.accountModel === 'NEXUS_SA'
          ? await this.computeSaAddress(abstractjs, viem, chains, req.owner)
          : req.owner;
      const account = abstractjs.getAccount({
        address: accountAddress,
        type: 'nexus',
      });
      const publicClient = viem.createPublicClient({
        chain: chains.sepolia,
        transport: viem.http(this.rpc()),
      });
      // Full ERC-7579 Session: redeemer = the backend session key, scoped to the
      // single fillLimitOrder action + policies (see buildActionData).
      const session = {
        // Deployed OwnableValidator == module-sdk GLOBAL_CONSTANTS.
        // OWNABLE_VALIDATOR_ADDRESS, i.e. the exact session validator that
        // abstractjs's own grantPermissionPersonalSign uses on-chain (proven in
        // the Phase 0 spike). WARNING: both abstractjs and module-sdk ALSO export
        // a *stale* top-level OWNABLE_VALIDATOR_ADDRESS (0x2483…Bf06) that is NOT
        // the deployed validator — building the session with it makes session-use
        // validation revert AA23. Pinned as a literal because module-sdk is only a
        // transitive dep (not resolvable from apps/api); this is a canonical CREATE2
        // deterministic-deployment address, identical across chains.
        sessionValidator: '0x000000000013fdB5234E4E3162a810F54d9f7E98',
        sessionValidatorInitData: abstractjs.encodeValidationData({
          threshold: 1,
          owners: [req.sessionKeyAddress],
        }),
        salt: abstractjs.generateSalt(),
        userOpPolicies: [],
        erc7739Policies: { allowedERC7739Content: [], erc1271Policies: [] },
        actions: [this.buildActionData(abstractjs, req.policy)],
        permitERC4337Paymaster: false,
        chainId: BigInt(this.cfg.chainId),
      };
      const details = await abstractjs.getEnableSessionDetails({
        enableMode: abstractjs.SmartSessionMode.UNSAFE_ENABLE,
        sessions: [session],
        clients: [publicClient],
        account,
        // The owner's enable signature is checked against the account's DEFAULT
        // (root) validator — not the session validator — and is a personal_sign
        // (EIP-191) that the user's wallet produces (no 7702 needed to enable).
        enableValidatorAddress: abstractjs.getMEEVersion(
          abstractjs.DEFAULT_MEE_VERSION,
        ).defaultValidatorAddress,
        // Match the proven Phase 0 grantPermissionPersonalSign path, which sets
        // this true. It is baked into the enable digest (hashChainSessions) AND
        // the on-chain EnableSession: with the default (false) the SmartSession
        // enforces ERC-7484 Registry security-attestations on the session
        // validator/policies, which are unattested on Sepolia → enable reverts
        // AA23. true skips attestation enforcement (the session is still fully
        // bounded by target+selector+usage=1+expiry+spend-cap+param-rule).
        ignoreSecurityAttestations: true,
      });
      return {
        ok: true,
        accountAddress,
        // Only the EIP7702 model needs the EOA delegated to Nexus first; the SA
        // model deploys a separate account (no 7702 authorization).
        needsDelegation: req.accountModel === 'EIP7702',
        delegationImplementation: this.cfg.nexusImplementation,
        enableDigest: details.permissionEnableHash,
        sessionBlob: this.serialize(details),
      };
    } catch (e) {
      this.log.warn(`prepareGrant failed: ${this.msg(e)}`);
      return { ok: false, reason: 'prepare_failed' };
    }
  }

  finalizeGrant(req: FinalizeGrantRequest): Promise<FinalizeGrantResult> {
    try {
      const details = this.deserialize(req.sessionBlob);
      // The user's enable signature goes into the enableSession slot; the
      // top-level `signature` is filled with the session-key sig at execute().
      details.enableSessionData.enableSession.permissionEnableSig =
        req.ownerSignature;
      return Promise.resolve({
        ok: true,
        permissionId: details.permissionId,
        enableData: this.serialize(details),
      });
    } catch (e) {
      this.log.warn(`finalizeGrant failed: ${this.msg(e)}`);
      return Promise.resolve({ ok: false, reason: 'finalize_failed' });
    }
  }

  async execute(req: ExecuteRequest): Promise<ExecuteResult> {
    if (req.target.toLowerCase() !== req.policy.target.toLowerCase()) {
      return { ok: false, reason: 'target_mismatch' };
    }
    const sessionAccount = await this.signer.toLocalAccount();
    if (!sessionAccount) {
      return { ok: false, reason: 'session_signer_unavailable' };
    }
    try {
      const { abstractjs, viem, chains, aa } = await this.sdk();
      const pub = viem.createPublicClient({
        chain: chains.sepolia,
        transport: viem.http(this.rpc()),
      });
      const acc = await abstractjs.toNexusAccount({
        signer: sessionAccount,
        chainConfiguration: {
          chain: chains.sepolia,
          transport: viem.http(this.rpc()),
          version: abstractjs.getMEEVersion(abstractjs.DEFAULT_MEE_VERSION),
          accountAddress: req.accountAddress,
        },
      });
      const client = abstractjs.createSmartAccountClient({
        account: acc,
        chain: chains.sepolia,
        transport: viem.http(this.rpc()),
        userOperation: { estimateFeesPerGas: () => this.fees(pub) },
      });

      const sd = {
        ...this.deserialize(req.enableData),
        mode: abstractjs.SmartSessionMode.UNSAFE_ENABLE,
      };
      const nonce = await acc.getNonce({
        moduleAddress: abstractjs.SMART_SESSIONS_ADDRESS,
      });
      const uo = await aa.prepareUserOperation(client, {
        calls: [{ to: req.target, data: req.calldata, value: 0n }],
        signature: abstractjs.encodeSmartSessionSignature(sd),
        nonce,
        verificationGasLimit: 2_000_000n,
        callGasLimit: 900_000n,
        preVerificationGas: 150_000n,
      });
      const h = aa.getUserOperationHash({
        userOperation: uo,
        entryPointAddress: ENTRYPOINT07,
        entryPointVersion: '0.7',
        chainId: this.cfg.chainId,
      });
      sd.signature = await this.signer.signUserOpHash(h);
      uo.signature = abstractjs.encodeSmartSessionSignature(sd);
      const uoHash = await aa.sendUserOperation(client, uo);
      const rcpt = await client.waitForUserOperationReceipt({ hash: uoHash });
      const txHash = rcpt?.receipt?.transactionHash as string | undefined;

      if (!rcpt?.success) {
        return { ok: true, txHash, confirmed: false, reason: 'userop_failed' };
      }
      const confirmed = this.verifyFill(viem, rcpt, req);
      return confirmed
        ? { ok: true, txHash, confirmed: true }
        : { ok: true, txHash, confirmed: false, reason: 'fill_unverified' };
    } catch (e) {
      // Thrown before/at submission (bundler rejection) → nothing landed.
      this.log.warn(`execute failed (pre-submit): ${this.msg(e)}`);
      return { ok: false, reason: 'submit_rejected' };
    }
  }

  async revokePrepare(req: RevokePrepareRequest): Promise<RevokePrepareResult> {
    try {
      const { abstractjs, viem } = await this.sdk();
      // The SmartSession module exposes removeSession(bytes32 permissionId);
      // the user's wallet signs+sends this call to their account.
      const data = viem.encodeFunctionData({
        abi: [
          {
            type: 'function',
            name: 'removeSession',
            stateMutability: 'nonpayable',
            inputs: [{ name: 'permissionId', type: 'bytes32' }],
            outputs: [],
          },
        ],
        functionName: 'removeSession',
        args: [req.permissionId as `0x${string}`],
      });
      return {
        ok: true,
        to: abstractjs.SMART_SESSIONS_ADDRESS as string,
        data: data as string,
      };
    } catch (e) {
      this.log.warn(`revokePrepare failed: ${this.msg(e)}`);
      return { ok: false, reason: 'revoke_prepare_failed' };
    }
  }

  /**
   * Derive the counterfactual Nexus SA address from the owner ADDRESS only — no
   * private key. The SA address is a pure function of owner + factory + default
   * validator init + salt; a viem `toAccount` stub carries the address while its
   * sign methods throw (never called during address derivation). Verified equal
   * to the key-derived SA in the Phase 3b.0 spike.
   */
  private async computeSaAddress(
    abstractjs: any,
    viem: any,
    chains: any,
    owner: string,
  ): Promise<string> {
    const { toAccount } = await import('viem/accounts');
    const stub = toAccount({
      address: owner as `0x${string}`,
      signMessage: () => {
        throw new Error('sa-address stub: signing not available');
      },
      signTransaction: () => {
        throw new Error('sa-address stub: signing not available');
      },
      signTypedData: () => {
        throw new Error('sa-address stub: signing not available');
      },
    });
    const sa = await abstractjs.toNexusAccount({
      signer: stub,
      chainConfiguration: {
        chain: chains.sepolia,
        transport: viem.http(this.rpc()),
        version: abstractjs.getMEEVersion(abstractjs.DEFAULT_MEE_VERSION),
      },
    });
    return sa.address as string;
  }

  // Read-only Nexus SA setup facts (NEXUS_SA only): SA address + on-chain deploy/
  // fund/approve/module state so the FE can drive the setup flow. No tx, no signing.
  async saStatus(req: SaStatusRequest): Promise<SaStatusResult> {
    if (req.accountModel !== 'NEXUS_SA') {
      return { ok: false, reason: 'account_model_not_sa' };
    }
    if (!this.signer.isAvailable()) {
      return { ok: false, reason: 'session_signer_unavailable' };
    }
    try {
      const { abstractjs, viem, chains } = await this.sdk();
      const pub = viem.createPublicClient({
        chain: chains.sepolia,
        transport: viem.http(this.rpc()),
      });
      const sa = await this.computeSaAddress(
        abstractjs,
        viem,
        chains,
        req.owner,
      );
      const code = (await pub.getCode({ address: sa })) as string | undefined;
      const deployed = !!code && code !== '0x';
      const eth = (await pub.getBalance({ address: sa })) as bigint;
      const tokenBalance = (await pub.readContract({
        address: req.spendToken,
        abi: ERC20_MIN_ABI,
        functionName: 'balanceOf',
        args: [sa],
      })) as bigint;
      const allowance = (await pub.readContract({
        address: req.spendToken,
        abi: ERC20_MIN_ABI,
        functionName: 'allowance',
        args: [sa, req.exchangeProxy],
      })) as bigint;
      let moduleInstalled = false;
      if (deployed) {
        try {
          moduleInstalled = (await pub.readContract({
            address: sa,
            abi: IS_MODULE_INSTALLED_ABI,
            functionName: 'isModuleInstalled',
            args: [1n, abstractjs.SMART_SESSIONS_ADDRESS, '0x'],
          })) as boolean;
        } catch {
          moduleInstalled = false;
        }
      }
      return {
        ok: true,
        smartAccountAddress: sa,
        sessionKeyAddress: (await this.signer.getAddress()) ?? undefined,
        factory: this.cfg.nexusFactory,
        needsDeployment: !deployed,
        needsModuleInstall: !moduleInstalled,
        needsFunding:
          eth < RECOMMENDED_SA_ETH_WEI || tokenBalance < req.requiredTokenQ,
        needsApproval: allowance < req.requiredTokenQ,
        ethBalanceWei: eth.toString(),
        requiredEthWei: RECOMMENDED_SA_ETH_WEI.toString(),
        tokenBalanceQ: tokenBalance.toString(),
        requiredTokenQ: req.requiredTokenQ.toString(),
        allowanceQ: allowance.toString(),
      };
    } catch (e) {
      this.log.warn(`saStatus failed: ${this.msg(e)}`);
      return { ok: false, reason: 'sa_status_failed' };
    }
  }

  // The 0x fill must be provable in the receipt logs (never trust status alone).
  private verifyFill(viem: any, rcpt: any, req: ExecuteRequest): boolean {
    const logs: any[] = rcpt?.logs ?? [];
    for (const lg of logs) {
      if (String(lg.address ?? '').toLowerCase() !== req.target.toLowerCase())
        continue;
      try {
        const dec = viem.decodeEventLog({
          abi: [LIMIT_ORDER_FILLED_ABI],
          data: lg.data,
          topics: lg.topics,
        });
        if (dec.eventName !== 'LimitOrderFilled') continue;
        const a = dec.args as Record<string, any>;
        const orderHashOk =
          !req.expected.orderHash ||
          String(a.orderHash ?? '').toLowerCase() ===
            req.expected.orderHash.toLowerCase();
        // The ACTUAL taker fee (proportional, computed by the EP) must not exceed
        // the STE-computed expectation. This is the reliable fee guard: the fee
        // paid is not a single calldata word (it is derived on-chain), so it can
        // only be bounded post-execution here, not by a session param-rule.
        const feeOk =
          req.expected.takerFeeAmount === undefined ||
          BigInt(a.takerTokenFeeFilledAmount ?? 0n) <=
            req.expected.takerFeeAmount;
        if (
          orderHashOk &&
          feeOk &&
          String(a.taker ?? '').toLowerCase() ===
            req.expected.taker.toLowerCase() &&
          String(a.takerToken ?? '').toLowerCase() ===
            req.expected.takerToken.toLowerCase() &&
          BigInt(a.takerTokenFilledAmount ?? 0n) ===
            req.expected.takerFillAmount
        ) {
          return true;
        }
      } catch {
        // not this log
      }
    }
    return false;
  }

  private async fees(pub: any): Promise<any> {
    const block = await pub.getBlock({ blockTag: 'latest' });
    const base = (block.baseFeePerGas as bigint) ?? 1_000_000_000n;
    let prio = 1_000_000_000n;
    try {
      prio = BigInt(
        await pub.request({
          method: 'rundler_maxPriorityFeePerGas',
          params: [],
        }),
      );
    } catch {
      /* keep floor */
    }
    if (prio < 1_000_000_000n) prio = 1_000_000_000n;
    return { maxFeePerGas: base * 2n + prio, maxPriorityFeePerGas: prio };
  }

  private serialize(v: unknown): string {
    return JSON.stringify(v, (_k, val) =>
      typeof val === 'bigint' ? { __bigint__: val.toString() } : val,
    );
  }
  private deserialize(s: string): any {
    return JSON.parse(s, (_k, val) =>
      val && typeof val === 'object' && '__bigint__' in val
        ? BigInt((val as { __bigint__: string }).__bigint__)
        : val,
    );
  }
  private msg(e: unknown): string {
    return e instanceof Error ? e.message : String(e);
  }
}
