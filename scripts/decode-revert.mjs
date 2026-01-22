// scripts/decode-revert.mjs
import { Interface, dataSlice as hexDataSlice } from "ethers";

// === Lee el REVERT_DATA del entorno ===
const data = (process.env.REVERT_DATA || "").trim();
if (!data || !data.startsWith("0x") || data.length < 10) {
  console.error("Set REVERT_DATA with the revert bytes (0x...)");
  process.exit(1);
}

// --- 0x error ABIs habituales ---
const ZX_ERROR_ABI = [
  // Estados/validaciones de órdenes
  "error OrderNotFillable(bytes32 orderHash, uint8 status)",     // <- el sospechoso
  "error OrderExpired(uint64 expiry, uint64 now)",
  "error InvalidTaker(address taker)",
  "error InvalidSigner(address signer)",
  "error SenderNotAllowed(address sender)",
  "error FeeTransferFailed()",
  "error TransferFailed()",
  // Otras que a veces aparecen en EP
  "error InvalidByteOperation()",
];

const zxErr = new Interface(ZX_ERROR_ABI);

// Intenta decodificar contra la lista
function tryAbiDecode(raw) {
  try {
    // En ethers v6: Interface.getError() + decodeErrorResult
    const selector = hexDataSlice(raw, 0, 4).toLowerCase();
    for (const f of Object.values(zxErr.errors)) {
      if (f.selector.toLowerCase() === selector) {
        const decoded = zxErr.decodeErrorResult(f, raw);
        return { name: f.name, args: decoded };
      }
    }
  } catch {}
  return null;
}

const out = tryAbiDecode(data);
if (out) {
  console.log(`Matched custom error: ${out.name}`);
  // Imprime args con mimo
  const entries = Object.entries(out.args);
  for (let i = 0; i < entries.length; i++) {
    const [k, v] = entries[i];
    // Ethers incluye índices numéricos y nombres; filtra duplicados
    if (!Number.isNaN(Number(k))) continue;
    console.log(`  ${k} = ${typeof v === "bigint" ? v.toString() : v}`);
  }
  process.exit(0);
}

// --- Fallback heurístico: selector + 2 words -> hash + code ---
const sel = data.slice(0, 10).toLowerCase();
const words = (data.length - 10) / 64; // nº de words de 32 bytes
if (words === 2) {
  const hash = "0x" + data.slice(10, 10 + 64);
  const codeHex = "0x" + data.slice(10 + 64, 10 + 128);
  let code = 0n;
  try { code = BigInt(codeHex); } catch {}

  // Mapa orientativo (puede variar por versión EP, úsalo como hint)
  const HINT = {
    0: "INVALID",
    1: "FILLABLE",
    2: "UNFILLABLE / FILLED/CANCELLED/EXHAUSTED (depende de EP)",
    3: "EXPIRED",
    4: "FULLY_FILLED",
    5: "CANCELLED",
  };

  console.log("Unknown custom error (heuristic decode):");
  console.log(`Selector = ${sel}`);
  console.log(`orderHash = ${hash}`);
  console.log(`statusCode = ${code.toString()} (${HINT[Number(code)] ?? "?"})`);
  process.exit(0);
}

console.log("Unknown custom error.");
console.log(`Selector = ${sel}`);
console.log(`Data     = ${data}`);



