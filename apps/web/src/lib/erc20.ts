// apps/web/src/lib/erc20.ts
import { ethers, Contract, type Signer } from "ethers";

const ERC20_ABI = [
  "function allowance(address owner, address spender) view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function balanceOf(address) view returns (uint256)",
] as const;

export async function revokeAllowance(
  signer: ethers.Signer,
  token: `0x${string}`,
  spender: `0x${string}`,
): Promise<string> {
  // approve(spender, 0) es la forma estándar de revocar
  const erc20 = new ethers.Contract(
    token,
    ["function approve(address spender, uint256 amount) returns (bool)"],
    signer,
  );
  const tx = await erc20.approve(spender, 0);
  // Si quieres, puedes NO esperar aquí y devolver el hash directamente;
  // yo mantengo wait para que el UI refresque con certeza.
  await tx.wait();
  return tx.hash as string;
}

export async function erc20Balance(
  provider: ethers.Provider,
  token: `0x${string}`,
  owner: `0x${string}`,
): Promise<bigint> {
  try {
    if (!(await isContract(provider, token))) return BigInt(0);
    const c = new ethers.Contract(token, ERC20_ABI, provider);
    const bal: bigint = await c.balanceOf(owner);
    return bal ?? BigInt(0);
  } catch (e) {
    console.warn("[erc20Balance] non-ERC20 or bad token?", token, e);
    return BigInt(0);
  }
}

export async function erc20Allowance(
  provider: ethers.Provider,
  token: `0x${string}`,
  owner: `0x${string}`,
  spender: `0x${string}`,
): Promise<bigint> {
  try {
    if (!(await isContract(provider, token))) return BigInt(0);
    const c = new ethers.Contract(token, ERC20_ABI, provider);
    const alw: bigint = await c.allowance(owner, spender);
    return alw ?? BigInt(0);
  } catch (e) {
    console.warn("[erc20Allowance] non-ERC20 or bad token?", token, e);
    return BigInt(0);
  }
}

export async function getAllowance(
  signerOrProvider: ethers.Signer | ethers.Provider,
  token: `0x${string}`,
  owner: `0x${string}`,
  spender: `0x${string}`,
): Promise<bigint> {
  const c = new ethers.Contract(token, ERC20_ABI, signerOrProvider);
  const v: bigint = await c.allowance(owner, spender);
  return v;
}

export async function approveIfNeeded(
  signer: Signer,
  token: `0x${string}`,
  spender: `0x${string}`,
  needed: bigint,
): Promise<string | null> {
  const owner = (await signer.getAddress()) as `0x${string}`;
  const current = await getAllowance(signer.provider!, token, owner, spender);
  if (current >= needed) return null;

  const erc20 = new Contract(token, ERC20_ABI, signer);
  const tx = await erc20.approve(spender, needed);
  const rec = await tx.wait();
  return rec?.hash ?? tx.hash;
}

export async function isContract(provider: ethers.Provider, addr: `0x${string}`): Promise<boolean> {
  try {
    const code = await provider.getCode(addr);
    return code !== "0x";
  } catch {
    return false;
  }
}
