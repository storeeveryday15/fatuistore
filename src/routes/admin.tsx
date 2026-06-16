import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ShieldCheck, MessageSquare } from "lucide-react";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin — Fatui Market" }] }),
  component: AdminPage,
});

type Order = {
  id: string;
  order_code: string;
  user_id: string | null;
  customer_email: string | null;
  customer_contact: string | null;
  game_id: string | null;
  product_name: string;
  tier_label: string;
  amount_inr: number | null;
  amount_usd: number | null;
  currency: string;
  payment_method: string | null;
  utr: string | null;
  status: string;
  created_at: string;
  notes: string | null;
};

type Support = {
  id: string;
  name: string | null;
  contact: string | null;
  message: string;
  status: string;
  created_at: string;
};

const STATUSES = ["pending_payment", "awaiting_verification", "paid", "delivered", "refunded", "cancelled"];

function AdminPage() {
  const [ready, setReady] = useState(false);
  const [tab, setTab] = useState<"orders" | "support">("orders");
  const [orders, setOrders] = useState<Order[]>([]);
  const [support, setSupport] = useState<Support[]>([]);
  const [filter, setFilter] = useState<string>("all");
  const navigate = useNavigate();

  const load = async () => {
    const { data: o } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
    setOrders((o ?? []) as Order[]);
    const { data: s } = await supabase.from("support_messages").select("*").order("created_at", { ascending: false });
    setSupport((s ?? []) as Support[]);
  };

  useEffect(() => {
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) { navigate({ to: "/auth" }); return; }
      const { data: role } = await supabase.from("user_roles").select("role").eq("user_id", u.user.id).eq("role", "admin").maybeSingle();
      if (!role) { toast.error("Admin access required"); navigate({ to: "/" }); return; }
      setReady(true);
      await load();
    })();
  }, [navigate]);

  const updateOrder = async (id: string, patch: Partial<Order>) => {
    const { error } = await supabase.from("orders").update(patch).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Order updated");
    load();
  };

  if (!ready) return <div className="container mx-auto max-w-5xl px-4 py-16 text-center text-sm text-muted-foreground">Loading admin…</div>;

  const filtered = filter === "all" ? orders : orders.filter((o) => o.status === filter);
  const totalRevenue = orders
    .filter((o) => o.status === "paid" || o.status === "delivered")
    .reduce((sum, o) => sum + (Number(o.amount_inr) || 0), 0);

  return (
    <div className="container mx-auto max-w-7xl px-4 py-10">
      <div className="flex items-center gap-2">
        <ShieldCheck className="h-6 w-6 text-[var(--neon)]" />
        <h1 className="text-3xl font-bold">Admin panel</h1>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-4">
        <Stat label="Total orders" value={orders.length.toString()} />
        <Stat label="Pending verify" value={orders.filter((o) => o.status === "awaiting_verification").length.toString()} highlight />
        <Stat label="Delivered" value={orders.filter((o) => o.status === "delivered").length.toString()} />
        <Stat label="Revenue (paid)" value={`₹${totalRevenue.toFixed(0)}`} />
      </div>

      <div className="mt-8 flex gap-2 border-b border-border">
        <TabBtn active={tab === "orders"} onClick={() => setTab("orders")}>Orders</TabBtn>
        <TabBtn active={tab === "support"} onClick={() => setTab("support")}>
          <MessageSquare className="mr-1.5 inline h-4 w-4" /> Support ({support.filter(s => s.status === "open").length})
        </TabBtn>
      </div>

      {tab === "orders" && (
        <>
          <div className="mt-4 flex flex-wrap gap-2">
            {["all", ...STATUSES].map((s) => (
              <button key={s} onClick={() => setFilter(s)} className={`rounded-full border px-3 py-1 text-xs ${filter === s ? "border-[var(--neon)] text-foreground" : "border-border text-muted-foreground hover:border-foreground/30"}`}>
                {s.replace(/_/g, " ")}
              </button>
            ))}
          </div>
          <div className="mt-4 overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-sm">
              <thead className="bg-secondary/50 text-left text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-3 py-3">Order</th>
                  <th className="px-3 py-3">Product / Tier</th>
                  <th className="px-3 py-3">Customer</th>
                  <th className="px-3 py-3">Amount</th>
                  <th className="px-3 py-3">UTR</th>
                  <th className="px-3 py-3">Status</th>
                  <th className="px-3 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((o) => (
                  <tr key={o.id} className="border-t border-border align-top">
                    <td className="px-3 py-3">
                      <div className="font-mono text-[var(--neon)]">{o.order_code}</div>
                      <div className="text-[11px] text-muted-foreground">{new Date(o.created_at).toLocaleString()}</div>
                    </td>
                    <td className="px-3 py-3">
                      <div className="font-semibold">{o.product_name}</div>
                      <div className="text-xs text-muted-foreground">{o.tier_label}</div>
                      {o.game_id && <div className="mt-1 text-xs">🎮 {o.game_id}</div>}
                    </td>
                    <td className="px-3 py-3">
                      <div>{o.customer_email ?? "—"}</div>
                      <div className="text-xs text-muted-foreground">{o.customer_contact ?? ""}</div>
                    </td>
                    <td className="px-3 py-3 font-semibold">
                      {o.currency === "INR" ? `₹${o.amount_inr}` : `$${o.amount_usd}`}
                      <div className="text-[11px] text-muted-foreground">{o.payment_method ?? ""}</div>
                    </td>
                    <td className="px-3 py-3 font-mono text-xs">{o.utr ?? "—"}</td>
                    <td className="px-3 py-3">
                      <select value={o.status} onChange={(e) => updateOrder(o.id, { status: e.target.value })} className="rounded-md border border-border bg-background px-2 py-1 text-xs">
                        {STATUSES.map((s) => <option key={s} value={s}>{s.replace(/_/g, " ")}</option>)}
                      </select>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex flex-col gap-1">
                        <button onClick={() => updateOrder(o.id, { status: "paid" })} className="rounded-md bg-success/15 px-2 py-1 text-[11px] font-semibold text-success hover:bg-success/25">Mark paid</button>
                        <button onClick={() => updateOrder(o.id, { status: "delivered" })} className="rounded-md bg-[var(--neon)]/15 px-2 py-1 text-[11px] font-semibold text-[var(--neon)] hover:bg-[var(--neon)]/25">Mark delivered</button>
                        <button onClick={() => updateOrder(o.id, { status: "refunded" })} className="rounded-md bg-muted px-2 py-1 text-[11px] font-semibold text-muted-foreground">Refund</button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && <tr><td colSpan={7} className="px-3 py-10 text-center text-sm text-muted-foreground">No orders.</td></tr>}
              </tbody>
            </table>
          </div>
        </>
      )}

      {tab === "support" && (
        <div className="mt-4 grid gap-3">
          {support.map((s) => (
            <div key={s.id} className="surface-card p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <div className="text-sm font-semibold">{s.name || "Guest"}</div>
                  <div className="text-xs text-muted-foreground">{s.contact ?? ""} · {new Date(s.created_at).toLocaleString()}</div>
                </div>
                <select
                  value={s.status}
                  onChange={async (e) => {
                    await supabase.from("support_messages").update({ status: e.target.value }).eq("id", s.id);
                    load();
                  }}
                  className="rounded-md border border-border bg-background px-2 py-1 text-xs"
                >
                  <option value="open">open</option>
                  <option value="replied">replied</option>
                  <option value="closed">closed</option>
                </select>
              </div>
              <p className="mt-2 text-sm">{s.message}</p>
            </div>
          ))}
          {support.length === 0 && <div className="surface-card p-10 text-center text-sm text-muted-foreground">No messages yet.</div>}
        </div>
      )}
    </div>
  );
}

function Stat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`surface-card p-4 ${highlight ? "ring-1 ring-[var(--neon)]/40" : ""}`}>
      <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-1 text-2xl font-bold">{value}</div>
    </div>
  );
}

function TabBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} className={`relative px-4 py-2.5 text-sm font-semibold transition-colors ${active ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
      {children}
      {active && <span className="absolute inset-x-0 -bottom-px h-0.5 bg-[var(--neon)]" />}
    </button>
  );
}
