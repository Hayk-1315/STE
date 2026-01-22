// scripts/check-order-status.mjs
import { JsonRpcProvider, Interface, getAddress } from "ethers";
import fs from "node:fs";

const RPC = process.env.RPC || "http://127.0.0.1:8545";
const EP  = process.env.EP  || "0xDef1C0ded9bec7F1a1670819833240f027b25EfF";
const ORDER_PATH = process.env.ORDER || "order.json";

const ABI = [
  "function getLimitOrderInfo((address makerToken,address takerToken,uint128 makerAmount,uint128 takerAmount,uint128 takerTokenFeeAmount,address maker,address taker,address sender,address feeRecipient,bytes32 pool,uint64 expiry,uint256 salt)) view returns (uint8 orderStatus, bytes32 orderHash, uint128 takerTokenFilledAmount)",
  "function getLimitOrderHash((address makerToken,address takerToken,uint128 makerAmount,uint128 takerAmount,uint128 takerTokenFeeAmount,address maker,address taker,address sender,address feeRecipient,bytes32 pool,uint64 expiry,uint256 salt)) view returns (bytes32)",
  "function getPairOrderMinimumValidSalt(address maker, address makerToken, address takerToken) view returns (uint256)",
  // ERC20 (para checks opcionales de balance/allowance)
  "function balanceOf(address) view returns (uint256)",
  "function allowance(address,address) view returns (uint256)"
];

const iface = new Interface(ABI);
const provider = new JsonRpcProvider(RPC);

function statusLabel(n) {
  const M = {
    0: "INVALID",
    1: "FILLABLE",
    2: "EXPIRED",
    3: "FULLY_FILLED",
    4: "CANCELLED",
    5: "SIGNATURE_INVALID_OR_UNSUPPORTED"
  };
  return M[n] ?? `?(${n})`;
}

function parseSalt128(saltBig) {
  const TWO128 = 1n << 128n;
  if (saltBig < TWO128) return null;
  const v = saltBig - TWO128;
  const ts = Number(v >> 96n);
  const rand96 = v & ((1n << 96n) - 1n);
  return { ts, rand96 };
}

function addr(a) {
  try { return getAddress(a); } catch { return a; }
}

async function main() {
  const raw = fs.readFileSync(ORDER_PATH, "utf8");
  const order = JSON.parse(raw);

  // Normaliza tipos BigInt donde toca
  const ord = {
    makerToken: addr(order.makerToken),
    takerToken: addr(order.takerToken),
    makerAmount: BigInt(order.makerAmount),
    takerAmount: BigInt(order.takerAmount),
    takerTokenFeeAmount: BigInt(order.takerTokenFeeAmount || 0),
    maker: addr(order.maker),
    taker: addr(order.taker),
    sender: addr(order.sender),
    feeRecipient: addr(order.feeRecipient),
    pool: order.pool,
    expiry: BigInt(order.expiry),
    salt: BigInt(order.salt)
  };

  const [latest] = await Promise.all([provider.getBlock("latest")]);
  const nowTs = Number(latest?.timestamp ?? 0);

  const infoRaw = await provider.call({
    to: EP,
    data: iface.encodeFunctionData("getLimitOrderInfo", [ord]),
  });
  const [statusRaw, orderHashFromInfo, takerFilled] =
    iface.decodeFunctionResult("getLimitOrderInfo", infoRaw);
  const status = Number(statusRaw);

  const retHash = await provider.call({
    to: EP,
    data: iface.encodeFunctionData("getLimitOrderHash", [ord]),
  });
  const orderHash = iface.decodeFunctionResult("getLimitOrderHash", retHash)[0];

  let minValidSalt = null;
  try {
    const ret = await provider.call({
      to: EP,
      data: iface.encodeFunctionData("getPairOrderMinimumValidSalt", [
        ord.maker, ord.makerToken, ord.takerToken
      ]),
    });
    minValidSalt = iface.decodeFunctionResult("getPairOrderMinimumValidSalt", ret)[0];
  } catch {
    // EP viejo → ignora
  }

  console.log("=== EP status ===");
  console.log("orderHash         =", orderHash);
  console.log("status            =", status, "→", statusLabel(status));
  console.log("takerFilled       =", takerFilled.toString());
  console.log("takerAmount       =", ord.takerAmount.toString());
  console.log("");

  console.log("=== Order fields ===");
  console.log("maker             =", ord.maker);
  console.log("makerToken        =", ord.makerToken);
  console.log("takerToken        =", ord.takerToken);
  console.log("makerAmount       =", ord.makerAmount.toString());
  console.log("takerTokenFeeAmt  =", ord.takerTokenFeeAmount.toString());
  console.log("expiry            =", Number(ord.expiry), "(now:", nowTs, ")");
  console.log("salt              =", ord.salt.toString());
  const s128 = parseSalt128(ord.salt);
  if (s128) {
    console.log("salt.ts(sec)      =", s128.ts, "(now:", nowTs, ")");
  }

  if (minValidSalt != null) {
    console.log("");
    console.log("=== Pair minValidSalt ===");
    console.log("minValidSalt      =", minValidSalt.toString());
    console.log("salt < minValid ? =", ord.salt < minValidSalt ? "YES (cancelled by pair)" : "NO");
  }

  // Conclusión rápida:
  console.log("\n=== Conclusion ===");
  if (minValidSalt != null && ord.salt < minValidSalt) {
    console.log("UNFILLABLE → cancelPair: salt por debajo del umbral.");
    return;
  }
  if (Number(ord.expiry) <= nowTs) {
    console.log("UNFILLABLE → expirado.");
    return;
  }
  const remaining = ord.takerAmount > takerFilled ? (ord.takerAmount - takerFilled) : 0n;
  if (remaining === 0n) {
    console.log("UNFILLABLE → fully-filled (o EP cree que ya está agotado).");
    return;
  }
  if (status !== 1) {
    console.log(`No está FILLABLE (status=${statusLabel(status)}). Revisa restricciones de taker/sender o dominio.`);
    return;
  }
  console.log("FILLABLE según EP. Si aún revierte, será por allowances/balances/transfer.");
}

main().catch((e) => {
  console.error(e?.message || String(e));
  process.exit(1);
});
