import { JsonRpcProvider, Interface } from "ethers";

const rpc   = process.env.RPC || "http://127.0.0.1:8545";
const EP    = process.env.EP;
const WETH  = process.env.WETH;
const USDC  = process.env.USDC;
const MAKER = process.env.MAKER;
const TAKER = process.env.TAKER;

const i = new Interface([
  "function balanceOf(address) view returns (uint256)",
  "function allowance(address,address) view returns (uint256)"
]);

const erc = (addr) => ({addr, bal: async (who)=> {
  const data = i.encodeFunctionData("balanceOf", [who]);
  const ret  = await p.call({to: addr, data});
  const [b]  = i.decodeFunctionResult("balanceOf", ret);
  return b;
}, alw: async (owner,spender)=>{
  const data = i.encodeFunctionData("allowance", [owner,spender]);
  const ret  = await p.call({to: addr, data});
  const [a]  = i.decodeFunctionResult("allowance", ret);
  return a;
}});

const p = new JsonRpcProvider(rpc);

(async ()=>{
  const weth = erc(WETH), usdc = erc(USDC);
  console.log("== MAKER ==");
  console.log("WETH balance:", (await weth.bal(MAKER)).toString());
  console.log("WETH allowance->EP:", (await weth.alw(MAKER, EP)).toString());
  console.log("== TAKER ==");
  console.log("USDC balance:", (await usdc.bal(TAKER)).toString());
  console.log("USDC allowance->EP:", (await usdc.alw(TAKER, EP)).toString());
})().catch(e=>{ console.error(e.message||String(e)); process.exit(1); });
