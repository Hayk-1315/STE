// scripts/why-unfillable.mjs
import { JsonRpcProvider, Interface, getAddress } from "ethers";

// === ENV ===
const RPC  = process.env.RPC  || "http://127.0.0.1:8545";
const EP   = process.env.EP   || "0xDef1C0ded9bec7F1a1670819833240f027b25EfF";
// Calldata de fillLimitOrder(...) que te falla:
const DATA = (process.env.DATA || "").trim();
// (Opcional) FROM para chequear restricciones
const FROM = (process.env.FROM || "").trim();

if (!DATA || !DATA.startsWith("0x")) {
  console.error("Set DATA with the full calldata of fillLimitOrder(...)");
  process.exit(1);
}

const ABI = [
  // fill (para decodificar la orden desde DATA)
  "function fillLimitOrder((address makerToken,address takerToken,uint128 makerAmount,uint128 takerAmount,uint128 takerTokenFeeAmount,address maker,address taker,address sender,address feeRecipient,bytes32 pool,uint64 expiry,uint256 salt),(uint8 signatureType,uint8 v,bytes32 r,bytes32 s),uint128 takerTokenFillAmount)",
  // Estado on-chain:
  "function getLimitOrderInfo((address makerToken,address takerToken,uint128 makerAmount,uint128 takerAmount,uint128 takerTokenFeeAmount,address maker,address taker,address sender,address feeRecipient,bytes32 pool,uint64 expiry,uint256 salt)) view returns (uint8 orderStatus, bytes32 orderHash, uint128 takerTokenFilledAmount)",
  "function getLimitOrderHash((address makerToken,address takerToken,uint128 makerAmount,uint128 takerAmount,uint128 takerTokenFeeAmount,address maker,address taker,address sender,address feeRecipient,bytes32 pool,uint64 expiry,uint256 salt)) view returns (bytes32)",
  // Umbral de cancelación por par (si tu EP lo expone; en Base sí):
  "function getPairOrderMinimumValidSalt(address maker, address makerToken, address takerToken) view returns (uint256)"
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
  return M[n] ?? "?";
}

function parseSalt128(saltBig) {
  const TWO128 = 1n << 128n;
  if (saltBig < TWO128) return null;
  const v = saltBig - TWO128;
  const ts = Number(v >> 96n);
  const rand96 = v & ((1n << 96n) - 1n);
  return { ts, rand96 };
}

function paddr(label, a) {
  try { console.log(`  ${label} =`, getAddress(a)); }
  catch { console.log(`  ${label} =`, a); }
}

(async () => {
  // 1) Decodificar orden desde tu DATA
  const sel = DATA.slice(0, 10);
  const f = iface.getFunction("fillLimitOrder");
  if (!f || f.selector !== sel) {
    console.error("DATA is not fillLimitOrder(...) calldata");
    process.exit(1);
  }
  const decoded = iface.decodeFunctionData("fillLimitOrder", DATA);
  const order   = decoded[0];
  const takerAsk = decoded[2];

  // Info de bloque
  const latest = await provider.getBlock("latest");
  const nowTs  = Number(latest?.timestamp ?? 0);

  // 2) getLimitOrderInfo
  const infoRaw = await provider.call({
    to: EP,
    data: iface.encodeFunctionData("getLimitOrderInfo", [order]),
  });
  const [statusRaw, epHashFromInfo, takerFilled] =
    iface.decodeFunctionResult("getLimitOrderInfo", infoRaw);
  const status = Number(statusRaw);

  // 3) getLimitOrderHash
  const epHash = await provider.call({
    to: EP,
    data: iface.encodeFunctionData("getLimitOrderHash", [order]),
  }).then(ret => iface.decodeFunctionResult("getLimitOrderHash", ret)[0]);

  // 4) minValidSalt por par
  let minValidSalt = null;
  try {
    const ret = await provider.call({
      to: EP,
      data: iface.encodeFunctionData("getPairOrderMinimumValidSalt", [
        order.maker, order.makerToken, order.takerToken
      ]),
    });
    minValidSalt = iface.decodeFunctionResult("getPairOrderMinimumValidSalt", ret)[0];
  } catch { /* EP muy viejo → ignora */ }

  // 5) Imprimir todo
  console.log("=== EP.getLimitOrderInfo ===");
  console.log("  status(raw)  =", status, "→", statusLabel(status));
  console.log("  orderHash(info) =", epHashFromInfo);
  console.log("  takerFilled  =", takerFilled.toString());
  console.log("  takerAsk     =", takerAsk.toString());
  console.log("");
  console.log("=== EP.getLimitOrderHash ===");
  console.log("  orderHash(ep) =", epHash);
  console.log("");
  console.log("=== Order struct ===");
  paddr("maker", order.maker);
  paddr("taker", order.taker);
  paddr("sender", order.sender);
  paddr("makerToken", order.makerToken);
  paddr("takerToken", order.takerToken);
  console.log("  makerAmount         =", order.makerAmount.toString());
  console.log("  takerAmount         =", order.takerAmount.toString());
  console.log("  takerTokenFeeAmount =", order.takerTokenFeeAmount.toString());
  console.log("  expiry              =", Number(order.expiry), "(now:", nowTs, ")");
  console.log("  salt                =", order.salt.toString());
  const s128 = parseSalt128(order.salt);
  if (s128) {
    console.log("  salt.ts(sec)        =", s128.ts, "(now:", nowTs, ")");
    console.log("  salt.rand96         =", "0x" + s128.rand96.toString(16));
  }
  if (minValidSalt != null) {
    console.log("");
    console.log("=== Pair minValidSalt ===");
    console.log("  minValidSalt =", minValidSalt.toString());
    console.log("  salt < minValidSalt ?", (order.salt < minValidSalt) ? "YES (cancelled)" : "NO");
  }

  // 6) Conclusión práctica
  console.log("");
  console.log("=== Conclusion ===");
  if (minValidSalt != null && order.salt < minValidSalt) {
    console.log("UNFILLABLE por cancelPair: salt por debajo del umbral del par.");
    return;
  }
  if (Number(order.expiry) <= nowTs) {
    console.log("UNFILLABLE por expiración.");
    return;
  }
  const remaining = (BigInt(order.takerAmount) > BigInt(takerFilled))
    ? (BigInt(order.takerAmount) - BigInt(takerFilled))
    : 0n;
  console.log("remaining taker =", remaining.toString());
  if (remaining === 0n) {
    console.log("UNFILLABLE por FULLY_FILLED (o EP cree que ya se llenó ese hash).");
    console.log("→ Cambia el salt (nuevo orderHash) y vuelve a intentar.");
    return;
  }
  if (remaining < BigInt(takerAsk)) {
    console.log("Revertirá porque pides más que el remaining. Pide <= remaining.");
    return;
  }
  if (status !== 1) {
    console.log("EP dice que no está FILLABLE (status =", status, ").");
    console.log("→ Revisa restricción taker/sender o dominio/chainId del EIP-712.");
    return;
  }
  console.log("FILLABLE según EP; si sigue revirtiendo, el fallo será de transferencias.");
})();
