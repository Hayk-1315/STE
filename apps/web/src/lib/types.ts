// apps/web/src/lib/types.ts
export type Side = "BUY" | "SELL";
export type Tif = "IOC" | "FOK"; // (GTC lo dejamos fuera por ahora)

export type QuoteRequest = {
  marketId: string; // admite symbol p.ej. "WETH-USDC"
  side: Side;
  sizeBase: string; // en unidades base raw (string)
  tif?: Tif; // opcional: 'IOC' | 'FOK'
};

export type QuoteResponse = {
  marketId: string;
  symbol: string;
  side: Side;
  requestedBase: string;
  remainingBase: string;
  takerToken: `0x${string}`;
  takerAmount: string;
  takerFeeAmount: string;
  takerTotalAmount: string;
  fills: Array<{
    makerOrderHash: string;
    maker: string;
    priceTicks: string;
    sizeBase: string;
  }>;
  // si el backend devuelve razón de rechazo (p.ej. FOK)
  reason?: string;
};
