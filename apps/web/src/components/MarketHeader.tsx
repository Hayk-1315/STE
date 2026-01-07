"use client";

import React from "react";
import type { Market } from "@/lib/api";
import TokenLogo from "./TokenLogo";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { getZeroExDomainFallback } from "@/lib/zeroex";
import { addrUrl } from "@/lib/explorer";
import { Copy, ArrowUpRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function MarketHeader({ market }: { market: Market | null }) {
  const [ep, setEp] = React.useState<`0x${string}` | null>(null);

  React.useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const d = await getZeroExDomainFallback();
        if (alive) setEp(d.verifyingContract);
      } catch {
        if (alive) setEp(null);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  if (!market) return null;

  const copy = async (text: string, label: string) => {
    await navigator.clipboard.writeText(text);
    toast.success(`${label} copied`);
  };
  const short = (a: `0x${string}`) => `${a.slice(0, 6)}…${a.slice(-4)}`;

  return (
    <Card className="inline-block">
      <CardContent className="p-3">
        {/* fila compacta, sin título de símbolo */}
        <div className="flex flex-wrap items-center gap-2 text-xs leading-tight">
          {/* Base */}
          <div className="flex items-center gap-1 min-w-0">
            <div className="flex -space-x-2"></div>
            <TokenLogo symbol={market.base.symbol} size={16} />
            <span className="text-gray-500">Base</span>
            <span className="font-mono truncate max-w-[100px]" title={market.base.address}>
              {short(market.base.address as `0x${string}`)}
            </span>
            <a
              className="inline-flex items-center gap-1 underline"
              href={addrUrl(market.base.address as `0x${string}`)}
              target="_blank"
              rel="noreferrer"
              title="View on BaseScan"
            >
              <ArrowUpRight className="h-3 w-3" />
              View
            </a>
            <Button
              size="icon"
              variant="ghost"
              className="h-6 w-6 p-0"
              title="Copy"
              onClick={() => copy(market.base.address, "Base address")}
            >
              <Copy className="h-3 w-3" />
            </Button>
          </div>

          {/* Quote */}
          <div className="flex items-center gap-2 min-w-0">
            <div className="flex -space-x-2">
              <TokenLogo symbol={market.quote.symbol} size={16} />
            </div>
            <span className="text-gray-500">Quote</span>
            <span className="font-mono truncate max-w-[140px]" title={market.quote.address}>
              {short(market.quote.address as `0x${string}`)}
            </span>
            <a
              className="inline-flex items-center gap-1 underline"
              href={addrUrl(market.quote.address as `0x${string}`)}
              target="_blank"
              rel="noreferrer"
              title="View on BaseScan"
            >
              <ArrowUpRight className="h-3 w-3" />
              View
            </a>
            <Button
              size="icon"
              variant="ghost"
              className="h-6 w-6 p-0"
              title="Copy"
              onClick={() => copy(market.quote.address, "Quote address")}
            >
              <Copy className="h-3 w-3" />
            </Button>
          </div>

          {/* 0x EP */}
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-gray-500">0x EP</span>
            <span className="font-mono truncate max-w-40" title={ep ?? undefined}>
              {ep ? short(ep) : "—"}
            </span>
            {ep && (
              <>
                <a
                  className="inline-flex items-center gap-1 underline"
                  href={addrUrl(ep)}
                  target="_blank"
                  rel="noreferrer"
                  title="View on BaseScan"
                >
                  <ArrowUpRight className="h-3 w-3" />
                  View
                </a>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-6 w-6 p-0"
                  title="Copy"
                  onClick={() => copy(ep, "EP address")}
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
