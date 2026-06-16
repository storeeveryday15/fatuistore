import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

type FeedRow = {
  order_code: string;
  product_name: string;
  tier_label: string;
  amount_inr: number | null;
  currency: string;
  created_at: string;
};

const FALLBACK: FeedRow[] = [
  { order_code: "FM-7K3QX9", product_name: "Mobile Legends", tier_label: "💎 102 + 10 Diamonds", amount_inr: 176.97, currency: "INR", created_at: new Date(Date.now() - 1000 * 60 * 2).toISOString() },
  { order_code: "FM-A4M8P2", product_name: "Free Fire", tier_label: "520 Diamonds", amount_inr: 415, currency: "INR", created_at: new Date(Date.now() - 1000 * 60 * 6).toISOString() },
  { order_code: "FM-Q9V2N7", product_name: "Mobile Legends", tier_label: "🎫 Weekly Diamond Pass", amount_inr: 150.55, currency: "INR", created_at: new Date(Date.now() - 1000 * 60 * 11).toISOString() },
  { order_code: "FM-XR5T1H", product_name: "PUBG Mobile", tier_label: "660 UC", amount_inr: 830, currency: "INR", created_at: new Date(Date.now() - 1000 * 60 * 18).toISOString() },
  { order_code: "FM-B2KW8L", product_name: "Mobile Legends", tier_label: "💎 504 + 66 Diamonds", amount_inr: 919.77, currency: "INR", created_at: new Date(Date.now() - 1000 * 60 * 24).toISOString() },
  { order_code: "FM-D3HP6E", product_name: "Steam Wallet", tier_label: "$20 Steam Code", amount_inr: 1785, currency: "INR", created_at: new Date(Date.now() - 1000 * 60 * 33).toISOString() },
];

function timeAgo(iso: string) {
  const d = (Date.now() - new Date(iso).getTime()) / 1000;
  if (d < 60) return `${Math.floor(d)}s ago`;
  if (d < 3600) return `${Math.floor(d / 60)}m ago`;
  if (d < 86400) return `${Math.floor(d / 3600)}h ago`;
  return `${Math.floor(d / 86400)}d ago`;
}

export function LiveOrdersTicker() {
  const [rows, setRows] = useState<FeedRow[]>(FALLBACK);

  useEffect(() => {
    let mounted = true;
    supabase
      .from("public_orders_feed")
      .select("*")
      .limit(15)
      .then(({ data }) => {
        if (mounted && data && data.length) setRows(data as FeedRow[]);
      });

    const ch = supabase
      .channel("ticker-orders")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "orders" }, () => {
        supabase.from("public_orders_feed").select("*").limit(15).then(({ data }) => {
          if (mounted && data) setRows(data as FeedRow[]);
        });
      })
      .subscribe();
    return () => {
      mounted = false;
      supabase.removeChannel(ch);
    };
  }, []);

  const loop = [...rows, ...rows];

  return (
    <div className="relative mt-6 overflow-hidden rounded-2xl border border-border/50 bg-card/30 py-3 backdrop-blur">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-background to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-background to-transparent" />
      <div className="mb-1 flex items-center gap-2 px-4 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
        </span>
        Live orders
      </div>
      <div className="ticker-track flex gap-3 px-4 will-change-transform">
        {loop.map((r, i) => (
          <div
            key={`${r.order_code}-${i}`}
            className="flex shrink-0 items-center gap-3 rounded-full border border-border/50 bg-background/40 px-4 py-2 text-xs"
            style={{ filter: "blur(2.2px)", opacity: 0.85 }}
          >
            <span className="font-mono text-[var(--neon)]">{r.order_code}</span>
            <span className="text-muted-foreground">•</span>
            <span className="font-semibold">{r.product_name}</span>
            <span className="text-muted-foreground">{r.tier_label}</span>
            <span className="text-muted-foreground">•</span>
            <span className="font-semibold">₹{r.amount_inr ?? "—"}</span>
            <span className="text-muted-foreground">• {timeAgo(r.created_at)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
