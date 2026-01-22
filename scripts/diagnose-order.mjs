// scripts/diagnose-order.mjs
import { JsonRpcProvider, Interface, getAddress } from "ethers";

// === ENV ===
// RPC del fork
const RPC  = process.env.RPC  || "http://127.0.0.1:8545";
// EP (Exchange Proxy) de 0x
const EP   = process.env.EP   || "0xDef1C0ded9bec7F1a1670819833240f027b25EfF";
// Calldata completo de fillLimitOrder(...)
const DATA = (process.env.DATA || "").trim();
// (Opcional) FROM = taker (EOA que firma y envía la tx)
const FROM = (process.env.FROM || "").trim();

if (!DATA || !DATA.startsWith("0x")) {
  console.error("Set DATA with the full calldata of fillLimitOrder(...)");
  process.exit(1);
}

const EP_ABI = [
  // Para decodificar la orden desde DATA
  "function fillLimitOrder((address makerToken,address takerToken,uint128 makerAmount,uint128 takerAmount,uint128 takerTokenFeeAmount,address maker,address taker,address sender,address feeRecipient,bytes32 pool,uint64 expiry,uint256 salt) order,(uint8 signatureType,uint8 v,bytes32 r,bytes32 s) signature,uint128 takerTokenFillAmount)",
  // Para consultar estado real
  "function getLimitOrderInfo((address makerToken,address takerToken,uint128 makerAmount,uint128 takerAmount,uint128 takerTokenFeeAmount,address maker,address taker,address sender,address feeRecipient,bytes32 pool,uint64 expiry,uint256 salt) order) view returns (uint8 orderStatus, bytes32 orderHash, uint128 takerTokenFilledAmount)",
];

const iface = new Interface(EP_ABI);
const provider = new JsonRpcProvider(RPC);

function statusLabel(n) {
  // Mapa típico en 0x v4 para órdenes limit (puede variar según build, pero sirve)
  const M = {
    0: "INVALID",
    1: "FILLABLE",
    2: "EXPIRED",
    3: "FULLY_FILLED",
    4: "CANCELLED", // incluye cancel individual y cancelPair
    5: "SIGNATURE_INVALID_OR_UNSUPPORTED", // algunas builds lo exponen así
  };
  return M[n] ?? "?";
}

function printAddr(label, a) {
  try { console.log(`  ${label} =`, getAddress(a)); }
  catch { console.log(`  ${label} =`, a); }
}

function parseSalt128(saltBig) {
  // Convención: salt = 2^128 + (ts<<96) + rand96
  const TWO128 = 1n << 128n;
  if (saltBig < TWO128) return null;
  const v = saltBig - TWO128;
  const ts = Number(v >> 96n); // ts en segundos
  const rand96 = v & ((1n << 96n) - 1n);
  return { ts, rand96 };
}

(async () => {
  // 1) Decodifica DATA; valida que sea fillLimitOrder
  const sel = DATA.slice(0, 10);
  const fn  = iface.getFunction("fillLimitOrder");
  if (!fn || fn.selector !== sel) {
    console.error("DATA is not fillLimitOrder(...) calldata");
    process.exit(1);
  }
  const decoded = iface.decodeFunctionData("fillLimitOrder", DATA);
  const order   = decoded[0];
  const takerFillReq = decoded[2]; // uint128 takerTokenFillAmount solicitado

  // 2) Estado real en EP
  const ret = await provider.call({
    to: EP,
    data: iface.encodeFunctionData("getLimitOrderInfo", [order]),
  });
  const [statusRaw, epHash, takerFilled] = iface.decodeFunctionResult(
    "getLimitOrderInfo",
    ret
  );

  // 3) Info de tiempo para "expiry"
  const latest = await provider.getBlock("latest");
  const nowTs  = Number(latest?.timestamp ?? 0);

  // 4) Imprime diagnóstico detallado
  console.log("=== getLimitOrderInfo ===");
  console.log("  orderHash          =", epHash);
  console.log("  orderStatus (raw)  =", Number(statusRaw));
  console.log("  orderStatus (label)=", statusLabel(Number(statusRaw)));
  console.log("  takerFilled        =", takerFilled.toString());
  console.log("  takerFillRequested =", takerFillReq.toString());
  console.log("");

  console.log("=== Order struct (key fields) ===");
  printAddr("maker", order.maker);
  printAddr("taker", order.taker);
  printAddr("sender", order.sender);
  printAddr("makerToken", order.makerToken);
  printAddr("takerToken", order.takerToken);
  console.log("  makerAmount         =", order.makerAmount.toString());
  console.log("  takerAmount         =", order.takerAmount.toString());
  console.log("  takerTokenFeeAmount =", order.takerTokenFeeAmount.toString());
  console.log("  expiry              =", Number(order.expiry), "(now:", nowTs, ")");
  console.log("  salt                =", order.salt.toString());

  // Heurística útil: extraer ts embebido en el salt si sigues la convención 128-bit
  const saltInfo = parseSalt128(order.salt);
  if (saltInfo) {
    console.log("");
    console.log("=== Salt (128-bit scheme) ===");
    console.log("  embedded ts (sec) =", saltInfo.ts, "(now:", nowTs, ")");
    console.log("  rand96            =", "0x" + saltInfo.rand96.toString(16));
    if (saltInfo.ts <= nowTs) {
      console.log("  note: salt ts <= now (OK; orden firmada en el pasado)");
    }
  }

  // 5) Checks que explican *por qué* no es fillable
  console.log("");
  console.log("=== Reasoning ===");

  const s = Number(statusRaw);

  // a) Expiry
  if (Number(order.expiry) <= nowTs) {
    console.log("· EXPIRED: expiry <= block.timestamp");
  }

  // b) Fully filled / insufficient remaining
  const takerAmt = BigInt(order.takerAmount.toString());
  const remainingTaker = takerAmt > takerFilled ? (takerAmt - takerFilled) : 0n;
  console.log("· Remaining taker amount =", remainingTaker.toString());
  if (remainingTaker === 0n) {
    console.log("· FULLY_FILLED or no remaining (will be UNFILLABLE).");
  } else if (remainingTaker < BigInt(takerFillReq.toString())) {
    console.log("· Requested taker fill > remaining → would revert.");
  }

  // c) Taker/sender restrictions (si no son cero)
  const ZERO = "0x0000000000000000000000000000000000000000".toLowerCase();
  const takerReq = (order.taker || "").toLowerCase();
  const senderReq = (order.sender || "").toLowerCase();
  if (takerReq !== ZERO) {
    console.log("· Order has taker restriction =", takerReq);
    if (FROM) {
      const fromLower = FROM.toLowerCase();
      if (fromLower !== takerReq) {
        console.log("  → FROM != taker (esto haría la orden no-rellenable para ese FROM).");
      } else {
        console.log("  → FROM coincide con taker requerido (OK).");
      }
    } else {
      console.log("  (Set FROM in env to validate taker restriction against your sender)");
    }
  }
  if (senderReq !== ZERO) {
    console.log("· Order has sender restriction =", senderReq);
    if (FROM) {
      const fromLower = FROM.toLowerCase();
      if (fromLower !== senderReq) {
        console.log("  → FROM != sender (EP requerirá msg.sender == sender).");
      } else {
        console.log("  → FROM coincide con sender requerido (OK).");
      }
    } else {
      console.log("  (Set FROM in env to validate sender restriction against your sender)");
    }
  }

  // d) Estado sintetizado
  console.log("");
  console.log("=== Conclusion ===");
  switch (s) {
    case 1:
      console.log("FILLABLE (si revierte, no es por estado sino por otra causa en runtime).");
      break;
    case 2:
      console.log("UNFILLABLE: EXPIRED según EP (o equivalente).");
      break;
    case 3:
      console.log("UNFILLABLE: FULLY_FILLED según EP.");
      break;
    case 4:
      console.log("UNFILLABLE: CANCELLED según EP (incluye cancelPair/cancel individual).");
      break;
    case 5:
      console.log("UNFILLABLE: SIGNATURE_INVALID/UNSUPPORTED según EP.");
      break;
    default:
      console.log("UNFILLABLE: estado =", s, "(ver etiquetas arriba).");
  }
})();
