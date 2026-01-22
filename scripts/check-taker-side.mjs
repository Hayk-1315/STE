// scripts/check-taker-side.mjs
import { JsonRpcProvider, Interface, getAddress, formatUnits } from "ethers";

const RPC     = process.env.RPC || "http://127.0.0.1:8545";
const TAKER   = getAddress(process.env.TAKER || "");
const TOKEN   = getAddress(process.env.TOKEN || "");   // USDC
const SPENDER = getAddress(process.env.SPENDER || "0xDef1C0ded9bec7F1a1670819833240f027b25EfF");
const NEED    = BigInt(process.env.NEED || "0");       // takerAmount + fee (en unidades del token)

const erc20 = new Interface([
  "function balanceOf(address) view returns (uint256)",
  "function allowance(address,address) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)"
]);

async function call(provider, to, data) {
  return await provider.call({ to, data }).catch(() => "0x");
}

(async () => {
  if (!TAKER || !TOKEN || NEED === 0n) {
    console.error("Set TAKER, TOKEN, NEED (en unidades del token) y opcional SPENDER");
    process.exit(1);
  }
  const p = new JsonRpcProvider(RPC);

  const [decData, symData] = await Promise.all([
    call(p, TOKEN, erc20.encodeFunctionData("decimals", [])),
    call(p, TOKEN, erc20.encodeFunctionData("symbol", [])),
  ]);
  const decimals = decData !== "0x" ? erc20.decodeFunctionResult("decimals", decData)[0] : 18;
  const symbol   = symData !== "0x" ? erc20.decodeFunctionResult("symbol", symData)[0] : "TOKEN";

  const balData = await call(p, TOKEN, erc20.encodeFunctionData("balanceOf", [TAKER]));
  const alwData = await call(p, TOKEN, erc20.encodeFunctionData("allowance", [TAKER, SPENDER]));
  const bal = balData !== "0x" ? erc20.decodeFunctionResult("balanceOf", balData)[0] : 0n;
  const alw = alwData !== "0x" ? erc20.decodeFunctionResult("allowance", alwData)[0] : 0n;

  console.log("=== Taker side check ===");
  console.log("taker      =", TAKER);
  console.log("token      =", TOKEN, `(${symbol}/${decimals}d)`);
  console.log("spender    =", SPENDER);
  console.log("balance    =", bal.toString(), `(${formatUnits(bal, decimals)} ${symbol})`);
  console.log("allowance  =", alw.toString(), `(${formatUnits(alw, decimals)} ${symbol})`);
  console.log("need       =", NEED.toString(), `(${formatUnits(NEED, decimals)} ${symbol})`);
  console.log("");
  console.log("balance >= need  ?", bal >= NEED ? "YES" : "NO");
  console.log("allowance >= need?", alw >= NEED ? "YES" : "NO");
})();
