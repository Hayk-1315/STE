// scripts/dry-run-fill.mjs
import { JsonRpcProvider } from "ethers";

const RPC   = process.env.RPC || "http://127.0.0.1:8545";
const TO    = process.env.TO;
const DATA  = process.env.DATA;
const VALUE = process.env.VALUE || "0";
const FROM  = process.env.FROM; // MUY IMPORTANTE: taker real

if (!TO || !DATA) {
  console.error("Set TO, DATA (and optionally FROM, VALUE) in env");
  process.exit(1);
}

const p = new JsonRpcProvider(RPC);

(async () => {
  try {
    const ret = await p.call({
      to: TO,
      data: DATA,
      value: BigInt(VALUE || "0"),
      from: FROM, // ponlo si lo tienes (está en tu UI)
    });
    console.log("[OK] callStatic returned:", ret);
  } catch (e) {
    // ethers v6: el revert data suele estar en e.data || e.error?.data
    const raw = (e && (e.data || e.error?.data)) || null;
    console.error("[REVERT] raw:", raw);
    if (!raw) {
      console.error("No revert data visible (node no lo devuelve).");
    }
  }
})();
