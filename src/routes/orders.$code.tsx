import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import QRCode from "qrcode";
import { supabase } from "@/integrations/supabase/client";
import { buildUpiLink, UPI_ID, UPI_MERCHANT, WHATSAPP_LINK } from "@/lib/products";
import { CheckCircle2, Clock, AlertCircle, Smartphone, Copy } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/orders/$code")({
  head: ({ params }) => ({ meta: [{ title: `Order ${params.code} — Fatui Market` }] }),
  component: OrderPage,
});

type Order = {
  id: string;
  order_code: string;
  product_name: string;
  tier_label: string;
  amount_inr: number | null;
  amount_usd: number | null;
  currency: string;
  region: string;
  payment_method: string | null;
  utr: string | null;
  status: string;
  game_id: string | null;
  customer_email: string | null;
  customer_contact: string | null;
  created_at: string;
};

function statusInfo(s: string) {
  switch (s) {
    case "pending_payment": return { icon: Clock, color: "text-warning", label: "Awaiting your payment" };
    case "awaiting_verification": return { icon: Clock, color: "text-blue-500", label: "We're verifying your payment" };
    case "paid": return { icon: CheckCircle2, color: "text-success", label: "Payment received — processing" };
    case "delivered": return { icon: CheckCircle2, color: "text-success", label: "Delivered" };
    case "refunded": return { icon: AlertCircle, color: "text-muted-foreground", label: "Refunded" };
    case "cancelled": return { icon: AlertCircle, color: "text-destructive", label: "Cancelled" };
    default: return { icon: Clock, color: "text-muted-foreground", label: s };
  }
}

function OrderPage() {
  const { code } = Route.useParams();
  const [order, setOrder] = useState<Order | null | "loading">("loading");
  const [utr, setUtr] = useState("");
  const [qr, setQr] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchOrder = async () => {
    const { data } = await supabase.from("orders").select("*").eq("order_code", code).maybeSingle();
    setOrder((data as Order) ?? null);
  };

  useEffect(() => { fetchOrder(); }, [code]);

  // realtime updates for this order
  useEffect(() => {
    const ch = supabase
      .channel(`order-${code}`)
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "orders", filter: `order_code=eq.${code}` }, () => fetchOrder())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [code]);

  const upiLink = useMemo(() => {
    if (!order || order === "loading") return "";
    if (order.region !== "IN" || !order.amount_inr) return "";
    return buildUpiLink(Number(order.amount_inr), `${order.order_code} ${order.product_name}`);
  }, [order]);

  useEffect(() => {
    if (!upiLink) return;
    QRCode.toDataURL(upiLink, { width: 280, margin: 1 }).then(setQr).catch(() => {});
  }, [upiLink]);

  if (order === "loading") return <div className="container mx-auto max-w-3xl px-4 py-16 text-center text-sm text-muted-foreground">Loading order…</div>;
  if (!order) return (
    <div className="container mx-auto max-w-3xl px-4 py-16 text-center">
      <h1 className="text-2xl font-bold">Order not found</h1>
      <p className="mt-2 text-sm text-muted-foreground">Check the link or try again.</p>
      <Link to="/" className="mt-4 inline-block text-sm text-[var(--neon)] hover:underline">Back to home</Link>
    </div>
  );

  const s = statusInfo(order.status);
  const SIcon = s.icon;

  const submitUtr = async (e: React.FormEvent) => {
    e.preventDefault();
    if (utr.trim().length < 6) return toast.error("Enter a valid UTR / transaction ID");
    setSaving(true);
    const { error } = await supabase.from("orders").update({ utr: utr.trim(), status: "awaiting_verification" }).eq("id", order.id);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Thanks! We're verifying your payment.");
    fetchOrder();
  };

  return (
    <div className="container mx-auto max-w-3xl px-4 py-10">
      <div className="surface-card p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground">Order ID</div>
            <div className="font-mono text-xl font-bold text-[var(--neon)]">{order.order_code}</div>
            <div className="mt-1 text-xs text-muted-foreground">{new Date(order.created_at).toLocaleString()}</div>
          </div>
          <div className={`inline-flex items-center gap-2 rounded-full bg-secondary px-3 py-1.5 text-sm font-semibold ${s.color}`}>
            <SIcon className="h-4 w-4" /> {s.label}
          </div>
        </div>

        <div className="mt-5 grid gap-3 rounded-xl bg-background/40 p-4 text-sm">
          <Row k="Product" v={order.product_name} />
          <Row k="Item" v={order.tier_label} />
          {order.game_id && <Row k="Game ID" v={order.game_id} />}
          {order.customer_email && <Row k="Email" v={order.customer_email} />}
          {order.customer_contact && <Row k="Contact" v={order.customer_contact} />}
          <Row k="Amount" v={order.currency === "INR" ? `₹${order.amount_inr}` : `$${order.amount_usd}`} bold />
          <Row k="Payment" v={(order.payment_method ?? (order.region === "IN" ? "UPI" : "Card")).toUpperCase()} />
          {order.utr && <Row k="UTR" v={order.utr} />}
        </div>

        {order.status === "pending_payment" && order.region === "IN" && (
          <div className="mt-6 rounded-xl border border-border bg-background/40 p-5">
            <h2 className="text-sm font-semibold">Pay with UPI</h2>
            <div className="mt-4 grid gap-5 md:grid-cols-[auto_1fr] md:items-center">
              <div className="flex justify-center">
                <div className="rounded-2xl bg-white p-3 shadow-lg">
                  {qr ? <img src={qr} alt="UPI QR" width={220} height={220} /> : <div className="grid h-[220px] w-[220px] place-items-center text-xs text-muted-foreground">Generating…</div>}
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <div className="text-xs uppercase tracking-wider text-muted-foreground">Amount</div>
                  <div className="text-3xl font-bold gradient-text">₹{order.amount_inr}</div>
                </div>
                <div className="rounded-lg border border-border bg-background/40 p-3 text-sm">
                  <div className="text-[11px] uppercase tracking-wider text-muted-foreground">UPI</div>
                  <div className="font-semibold">{UPI_MERCHANT}</div>
                  <div className="mt-1 flex items-center justify-between">
                    <code className="text-xs">{UPI_ID}</code>
                    <button onClick={() => { navigator.clipboard.writeText(UPI_ID); toast.success("UPI copied"); }} className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-[11px]"><Copy className="h-3 w-3" /> Copy</button>
                  </div>
                </div>
                <a href={upiLink} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[image:var(--gradient-primary)] px-5 py-3 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-glow)]">
                  <Smartphone className="h-4 w-4" /> Pay ₹{order.amount_inr} with UPI
                </a>
              </div>
            </div>
          </div>
        )}

        {order.status === "pending_payment" && order.region !== "IN" && (
          <div className="mt-6 rounded-xl border border-border bg-background/40 p-5 text-sm">
            <h2 className="font-semibold">Pay with Card / PayPal</h2>
            <p className="mt-1 text-muted-foreground">Card and PayPal checkout is being connected. For now, please reach support to complete this order.</p>
            <a href={WHATSAPP_LINK} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-2 rounded-xl bg-success/15 px-4 py-2 text-sm font-semibold text-success">Contact support</a>
          </div>
        )}

        {(order.status === "pending_payment" || order.status === "awaiting_verification") && (
          <form onSubmit={submitUtr} className="mt-6 rounded-xl border border-border bg-background/40 p-5">
            <h2 className="text-sm font-semibold">Confirm payment</h2>
            <p className="mt-1 text-xs text-muted-foreground">Paste your UPI 12-digit UTR (or transaction ID) below. We'll verify and deliver instantly.</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <input value={utr} onChange={(e) => setUtr(e.target.value)} placeholder="e.g. 412598734201" className="flex-1 rounded-lg border border-input bg-background px-3 py-2.5 text-sm" />
              <button disabled={saving} className="rounded-xl bg-[image:var(--gradient-primary)] px-5 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-60">
                {saving ? "Sending…" : "Confirm payment"}
              </button>
            </div>
          </form>
        )}

        {order.status === "delivered" && (
          <div className="mt-6 rounded-xl border border-success/30 bg-success/10 p-5 text-sm text-success">
            🎉 Your top-up has been delivered. Enjoy the game!
          </div>
        )}
      </div>
    </div>
  );
}

function Row({ k, v, bold }: { k: string; v: string; bold?: boolean }) {
  return (
    <div className="flex justify-between gap-3">
      <span className="text-muted-foreground">{k}</span>
      <span className={bold ? "font-bold" : "font-medium"}>{v}</span>
    </div>
  );
}
