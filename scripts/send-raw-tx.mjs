import { JsonRpcProvider, Wallet } from "ethers";

const RPC = process.env.RPC_URL || "http://127.0.0.1:8545";
const PK  = process.env.PRIVATE_KEY; // EOA que ES el maker de las órdenes

if (!PK) {
  console.error("Set PRIVATE_KEY in env");
  process.exit(1);
}

const to    = process.env.TO;
const data  = process.env.DATA;
const value = process.env.VALUE || "0";

if (!to || !data) {
  console.error("Set TO, DATA (and optional VALUE) in env");
  process.exit(1);
}

const provider = new JsonRpcProvider(RPC);
const wallet = new Wallet(PK, provider);

const main = async () => {
  console.log("[rpc]", RPC);
  console.log("[from]", await wallet.getAddress());
  console.log("[to]", to);
  const tx = await wallet.sendTransaction({ to, data, value: BigInt(value) });
  console.log("sent:", tx.hash);
  const rec = await tx.wait();
  console.log("confirmed:", rec?.hash || tx.hash);
};

main().catch((e) => {
  console.error(e?.shortMessage || e?.message || String(e));
  process.exit(1);
});
