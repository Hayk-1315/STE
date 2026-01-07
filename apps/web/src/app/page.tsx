// apps/web/src/app/page.tsx
import { redirect } from "next/navigation";
import { env } from "@/lib/env";

export default async function Home() {
  // Fetch de mercados en el server (sin cache para dev)
  try {
    const res = await fetch(`${env().NEXT_PUBLIC_API_BASE_URL}/markets`, { cache: "no-store" });
    if (res.ok) {
      const mkts: Array<{ symbol: string }> = await res.json();
      const first = mkts[0]?.symbol ?? "WETH-USDC";
      const [base, quote] = first.split("-");
      redirect(`/market/${base}/${quote}`);
    }
  } catch {
    // caemos al fallback abajo
  }
  // Fallback si API no responde: WETH-USDC
  redirect("/market/WETH/USDC");
}
