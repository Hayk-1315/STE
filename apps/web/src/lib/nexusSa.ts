// apps/web/src/lib/nexusSa.ts
// Browser-side Nexus Smart Account helpers for delegated CMR (Phase 3b). viem +
// @biconomy/abstractjs are DYNAMICALLY imported inside each function so they
// never load during SSR/build and never run on the server (proven safe in the
// Milestone 2 bundling smoke test). Milestone 3B wires the SA SETUP actions
// (deploy/fund/approve/install/withdraw). NONE of these touch grant prepare/
// finalize, delegated-intent creation, or CMR execution — that is Milestone 3C.
// No private key is ever handled — the owner signs every tx/userOp in their
// wallet; these helpers only read chain state, send owner-signed ops, or build
// descriptors. The backend never receives a user key.
import { rpcUrl } from "./env";

/** Minimal EIP-1193 shape (matches both injected and Web3Auth providers). */
export type RawProvider = {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
};

/** A prepared, UNSENT operation descriptor (call target + calldata/value). */
export type PreparedCall = {
  kind: "deploy" | "fundEth" | "fundToken" | "approve" | "withdraw";
  /** Whether the OWNER sends this as a normal wallet tx, or it is an SA userOp. */
  via: "ownerTx" | "saUserOp";
  to: `0x${string}`;
  data: `0x${string}`;
  value: string; // wei, decimal string
  note: string;
};

const ERC20_ABI = [
  "function balanceOf(address) view returns (uint256)",
  "function allowance(address,address) view returns (uint256)",
  "function approve(address,uint256) returns (bool)",
  "function transfer(address,uint256) returns (bool)",
] as const;

async function chain() {
  const { sepolia } = await import("viem/chains");
  return sepolia; // delegated CMR is Sepolia-only (base-mainnet is inert/read-only)
}

async function publicClient() {
  const { createPublicClient, http } = await import("viem");
  return createPublicClient({ chain: await chain(), transport: http(rpcUrl()) });
}

/** Wrap the connected wallet as a viem walletClient (owner signs userOps here). */
export async function walletClientFromProvider(provider: RawProvider, owner: `0x${string}`) {
  const { createWalletClient, custom } = await import("viem");
  return createWalletClient({
    account: owner,
    chain: await chain(),
    transport: custom(provider),
  });
}

/**
 * Compute the counterfactual Nexus SA address for an owner (client-side, no key).
 * Uses the connected wallet only to derive the address; no signing occurs.
 */
export async function computeNexusSaAddress(
  provider: RawProvider,
  owner: `0x${string}`,
): Promise<`0x${string}`> {
  const { toNexusAccount, getMEEVersion, DEFAULT_MEE_VERSION } = await import(
    "@biconomy/abstractjs"
  );
  const { http } = await import("viem");
  const wallet = await walletClientFromProvider(provider, owner);
  const sa = await toNexusAccount({
    signer: wallet,
    chainConfiguration: {
      chain: await chain(),
      transport: http(rpcUrl()),
      version: getMEEVersion(DEFAULT_MEE_VERSION),
    },
  });
  return sa.address as `0x${string}`;
}

export type SaBalances = {
  ethWei: string;
  tokenBalanceQ: string;
  allowanceQ: string;
};

/** Read the SA's ETH + taker-token balance + allowance to the spender (read-only). */
export async function readSaBalances(
  saAddress: `0x${string}`,
  tokenAddress: `0x${string}`,
  spender: `0x${string}`,
): Promise<SaBalances> {
  const { getContract, parseAbi } = await import("viem");
  const pub = await publicClient();
  const eth = await pub.getBalance({ address: saAddress });
  // NOTE: getContract needs a PARSED Abi — passing the human-readable ERC20_ABI
  // strings leaves erc.read undefined (→ "reading 'balanceOf'"). parseAbi fixes it.
  const erc = getContract({
    address: tokenAddress,
    abi: parseAbi(ERC20_ABI),
    client: pub,
  });
  const bal = (await erc.read.balanceOf([saAddress])) as bigint;
  const allow = (await erc.read.allowance([saAddress, spender])) as bigint;
  return {
    ethWei: eth.toString(),
    tokenBalanceQ: bal.toString(),
    allowanceQ: allow.toString(),
  };
}

// ---- Milestone 3B: read setup state + owner-signed setup actions ----
// The owner signs every tx/userOp in their wallet. No private key is handled
// here and the backend never receives a key. Delegated CMR is Sepolia-only.

const SMART_SESSIONS_TYPE_VALIDATOR = BigInt(1); // ERC-7579 module type id

export type SaSetupState = {
  saAddress: `0x${string}`;
  deployed: boolean;
  moduleInstalled: boolean;
  ethWei: string;
  /** Spend-token (taker) balance: quote for a BUY, base for a SELL. */
  tokenBalanceQ: string;
  /** 0x EP allowance for the spend token. */
  allowanceQ: string;
  /**
   * Counter-token balance: the OTHER market token — the asset RECEIVED by a
   * delegated fill (base for a BUY, quote for a SELL). "0" when no counter token
   * was requested. Lets the balances panel show received assets, not only the
   * spend token, and lets the escape hatch withdraw them.
   */
  counterBalanceQ: string;
};

/** Read the full SA setup state for a token/spender (client-side; no key, no tx). */
export async function readSaSetupState(
  provider: RawProvider,
  owner: `0x${string}`,
  tokenAddress: `0x${string}`,
  spender: `0x${string}`,
  /** Optional counter token (received asset) to also read the SA balance of. */
  counterToken?: `0x${string}`,
): Promise<SaSetupState> {
  const aj = await import("@biconomy/abstractjs");
  const { getContract, parseAbi } = await import("viem");
  const pub = await publicClient();
  const saAddress = await computeNexusSaAddress(provider, owner);
  const code = await pub.getCode({ address: saAddress });
  const deployed = !!code && code !== "0x";
  const eth = await pub.getBalance({ address: saAddress });
  // parseAbi is REQUIRED: getContract with the raw human-readable ERC20_ABI
  // strings does not build erc.read.* (→ "reading 'balanceOf'" on undefined).
  const parsedErc20 = parseAbi(ERC20_ABI);
  const erc = getContract({
    address: tokenAddress,
    abi: parsedErc20,
    client: pub,
  });
  const bal = (await erc.read.balanceOf([saAddress])) as bigint;
  const allow = (await erc.read.allowance([saAddress, spender])) as bigint;
  // Counter (received) token balance — only when it differs from the spend token.
  let counterBal = BigInt(0);
  if (counterToken && counterToken.toLowerCase() !== tokenAddress.toLowerCase()) {
    try {
      const ercC = getContract({ address: counterToken, abi: parsedErc20, client: pub });
      counterBal = (await ercC.read.balanceOf([saAddress])) as bigint;
    } catch {
      counterBal = BigInt(0);
    }
  }
  let moduleInstalled = false;
  if (deployed) {
    try {
      moduleInstalled = (await pub.readContract({
        address: saAddress,
        abi: [
          {
            type: "function",
            name: "isModuleInstalled",
            stateMutability: "view",
            inputs: [{ type: "uint256" }, { type: "address" }, { type: "bytes" }],
            outputs: [{ type: "bool" }],
          },
        ],
        functionName: "isModuleInstalled",
        args: [SMART_SESSIONS_TYPE_VALIDATOR, aj.SMART_SESSIONS_ADDRESS, "0x"],
      })) as boolean;
    } catch {
      moduleInstalled = false;
    }
  }
  return {
    saAddress,
    deployed,
    moduleInstalled,
    ethWei: eth.toString(),
    tokenBalanceQ: bal.toString(),
    allowanceQ: allow.toString(),
    counterBalanceQ: counterBal.toString(),
  };
}

/** Build the owner's Nexus account + smart-account client (owner signs userOps). */
async function ownerNexus(provider: RawProvider, owner: `0x${string}`) {
  const aj = await import("@biconomy/abstractjs");
  const { http } = await import("viem");
  const wallet = await walletClientFromProvider(provider, owner);
  const c = await chain();
  const account = await aj.toNexusAccount({
    signer: wallet,
    chainConfiguration: {
      chain: c,
      transport: http(rpcUrl()),
      version: aj.getMEEVersion(aj.DEFAULT_MEE_VERSION),
    },
  });
  const pub = await publicClient();
  const estimateFeesPerGas = async () => {
    const block = await pub.getBlock({ blockTag: "latest" });
    let prio = BigInt(1000000000);
    try {
      const r = (await (
        pub as unknown as {
          request: (a: { method: string; params: unknown[] }) => Promise<unknown>;
        }
      ).request({ method: "rundler_maxPriorityFeePerGas", params: [] })) as string;
      prio = BigInt(r);
    } catch {
      /* keep floor */
    }
    if (prio < BigInt(1000000000)) prio = BigInt(1000000000);
    const base = block.baseFeePerGas ?? BigInt(1000000000);
    return { maxFeePerGas: base * BigInt(2) + prio, maxPriorityFeePerGas: prio };
  };
  const client = aj.createSmartAccountClient({
    account,
    chain: c,
    transport: http(rpcUrl()),
    userOperation: { estimateFeesPerGas },
  });
  return { aj, wallet, client, account };
}

/** Owner tx: deploy the SA via the permissionless factory call. Returns tx hash. */
export async function sendDeploy(
  provider: RawProvider,
  owner: `0x${string}`,
): Promise<`0x${string}`> {
  const call = await buildDeployCall(provider, owner);
  const wallet = await walletClientFromProvider(provider, owner);
  return wallet.sendTransaction({ to: call.to, data: call.data });
}

/** Owner tx: fund the SA with ETH for its userOps. Returns tx hash. */
export async function sendFundEth(
  provider: RawProvider,
  owner: `0x${string}`,
  sa: `0x${string}`,
  amountWei: string,
): Promise<`0x${string}`> {
  const wallet = await walletClientFromProvider(provider, owner);
  return wallet.sendTransaction({ to: sa, value: BigInt(amountWei) });
}

/** Owner tx: transfer the taker token from the owner into the SA. Returns tx hash. */
export async function sendFundToken(
  provider: RawProvider,
  owner: `0x${string}`,
  token: `0x${string}`,
  sa: `0x${string}`,
  amountQ: string,
): Promise<`0x${string}`> {
  const { encodeFunctionData, parseAbi } = await import("viem");
  const wallet = await walletClientFromProvider(provider, owner);
  const data = encodeFunctionData({
    abi: parseAbi(["function transfer(address,uint256) returns (bool)"]),
    functionName: "transfer",
    args: [sa, BigInt(amountQ)],
  });
  return wallet.sendTransaction({ to: token, data });
}

/** Owner userOp: bounded approve of the 0x EP from the SA. Returns userOp tx hash. */
export async function sendApprove(
  provider: RawProvider,
  owner: `0x${string}`,
  token: `0x${string}`,
  spender: `0x${string}`,
  amountQ: string,
): Promise<`0x${string}`> {
  const call = await buildApproveCall(token, spender, amountQ);
  const { client } = await ownerNexus(provider, owner);
  const hash = await client.sendUserOperation({
    calls: [{ to: call.to, data: call.data, value: BigInt(0) }],
  });
  const rcpt = await client.waitForUserOperationReceipt({ hash });
  return rcpt.receipt.transactionHash;
}

/** Owner userOp: install the SmartSessions validator module. Returns userOp tx hash. */
export async function sendInstallModule(
  provider: RawProvider,
  owner: `0x${string}`,
): Promise<`0x${string}`> {
  const { aj, client } = await ownerNexus(provider, owner);
  const mod = aj.getSmartSessionsValidator({});
  const hash = await client.installModule({
    module: { ...mod, address: mod.address as `0x${string}` },
  });
  const rcpt = await client.waitForUserOperationReceipt({ hash });
  return rcpt.receipt.transactionHash;
}

/** Owner userOp: withdraw a token from the SA back to `to` (escape hatch). */
export async function sendWithdrawToken(
  provider: RawProvider,
  owner: `0x${string}`,
  token: `0x${string}`,
  to: `0x${string}`,
  amountQ: string,
): Promise<`0x${string}`> {
  const call = await buildWithdrawTokenCall(token, to, amountQ);
  const { client } = await ownerNexus(provider, owner);
  const hash = await client.sendUserOperation({
    calls: [{ to: call.to, data: call.data, value: BigInt(0) }],
  });
  const rcpt = await client.waitForUserOperationReceipt({ hash });
  return rcpt.receipt.transactionHash;
}

/**
 * Owner userOp: withdraw native ETH from the SA back to `to` (escape hatch).
 * A plain value transfer from the smart account (data = 0x). Lets the user
 * recover gas funds; the owner still confirms it in their wallet.
 */
export async function sendWithdrawEth(
  provider: RawProvider,
  owner: `0x${string}`,
  to: `0x${string}`,
  amountWei: string,
): Promise<`0x${string}`> {
  const { client } = await ownerNexus(provider, owner);
  const hash = await client.sendUserOperation({
    calls: [{ to, data: "0x" as `0x${string}`, value: BigInt(amountWei) }],
  });
  const rcpt = await client.waitForUserOperationReceipt({ hash });
  return rcpt.receipt.transactionHash;
}

// ---- operation "prepare" builders (return UNSENT descriptors; 3B wires them) ----

/** Owner-sent tx that deploys the SA via the permissionless factory call. */
export async function buildDeployCall(
  provider: RawProvider,
  owner: `0x${string}`,
): Promise<PreparedCall> {
  const { toNexusAccount, getMEEVersion, DEFAULT_MEE_VERSION } = await import(
    "@biconomy/abstractjs"
  );
  const { http } = await import("viem");
  const wallet = await walletClientFromProvider(provider, owner);
  const sa = await toNexusAccount({
    signer: wallet,
    chainConfiguration: {
      chain: await chain(),
      transport: http(rpcUrl()),
      version: getMEEVersion(DEFAULT_MEE_VERSION),
    },
  });
  const { factory, factoryData } = await sa.getFactoryArgs();
  return {
    kind: "deploy",
    via: "ownerTx",
    to: factory as `0x${string}`,
    data: factoryData as `0x${string}`,
    value: "0",
    note: "Deploy your Nexus smart account (permissionless factory call).",
  };
}

/** Owner-sent bounded ERC-20 approval FROM the SA (executed as an SA userOp in 3B). */
export async function buildApproveCall(
  token: `0x${string}`,
  spender: `0x${string}`,
  amountQ: string,
): Promise<PreparedCall> {
  const { encodeFunctionData, parseAbi } = await import("viem");
  const data = encodeFunctionData({
    abi: parseAbi(["function approve(address,uint256) returns (bool)"]),
    functionName: "approve",
    args: [spender, BigInt(amountQ)],
  });
  return {
    kind: "approve",
    via: "saUserOp",
    to: token,
    data,
    value: "0",
    note: `Approve the 0x Exchange Proxy for exactly ${amountQ} (bounded, not unlimited).`,
  };
}

/** SA userOp transferring a token OUT of the SA back to the owner (escape hatch). */
export async function buildWithdrawTokenCall(
  token: `0x${string}`,
  to: `0x${string}`,
  amountQ: string,
): Promise<PreparedCall> {
  const { encodeFunctionData, parseAbi } = await import("viem");
  const data = encodeFunctionData({
    abi: parseAbi(["function transfer(address,uint256) returns (bool)"]),
    functionName: "transfer",
    args: [to, BigInt(amountQ)],
  });
  return {
    kind: "withdraw",
    via: "saUserOp",
    to: token,
    data,
    value: "0",
    note: `Withdraw ${amountQ} of the token from your smart account back to ${to}.`,
  };
}
