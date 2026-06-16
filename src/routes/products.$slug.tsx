import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import QRCode from "qrcode";
import {
  PRODUCTS,
  getProduct,
  getINR,
  buildUpiLink,
  generateOrderCode,
  UPI_ID,
  UPI_MERCHANT,
  type Denomination,
} from "@/lib/products";
import {
  ArrowLeft,
  CreditCard,
  Wallet,
  Check,
  Lock,
  Smartphone,
  Copy,
  Globe,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/products/$slug")({
  loader: ({ params }) => {
    const product = getProduct(params.slug);
    if (!product) throw notFound();
    return { product: product! };
  },
  head: ({ params }) => {
    const p = getProduct(params.slug);
    if (!p) return { meta: [{ title: "Not found" }] };
    return {
      meta: [
        { title: `${p.name} Top-Up — Fatui Market` },
        { name: "description", content: `Buy ${p.name} ${p.currency.toLowerCase()} instantly. ${p.tagline}` },
        { property: "og:title", content: `${p.name} Top-Up — Fatui Market` },
        { property: "og:description", content: p.tagline },
        { property: "og:image", content: p.image },
      ],
    };
  },
  notFoundComponent: () => (
    <div className="container mx-auto max-w-3xl px-4 py-24 text-center">
      <h1 className="text-3xl font-bold">Product not found</h1>
      <Link to="/" className="mt-4 inline-block text-sm text-[var(--neon)] hover:underline">
        Back to home
      </Link>
    </div>
  ),
  errorComponent: ({ error, reset }) => (
    <div className="container mx-auto max-w-3xl px-4 py-24 text-center">
      <h1 className="text-2xl font-bold">Something went wrong</h1>
      <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
      <button onClick={() => reset()} className="mt-4 rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground">Try again</button>
    </div>
  ),
  component: ProductPage,
});

type Region = "IN" | "INT";

function useDetectedRegion(): [Region, (r: Region) => void] {
  const [region, setRegion] = useState<Region>("INT");
  useEffect(() => {
    const stored = typeof window !== "undefined" ? localStorage.getItem("fm_region") : null;
    if (stored === "IN" || stored === "INT") {
      setRegion(stored);
      return;
    }
    // Detect via free IP geolocation
    fetch("https://ipwho.is/?fields=country_code")
      .then((r) => r.json())
      .then((d: { country_code?: string }) => {
        const r: Region = d?.country_code === "IN" ? "IN" : "INT";
        setRegion(r);
      })
      .catch(() => {
        // Fallback: locale
        const loc = typeof navigator !== "undefined" ? navigator.language : "";
        setRegion(loc?.toLowerCase().includes("in") ? "IN" : "INT");
      });
  }, []);
  const update = (r: Region) => {
    setRegion(r);
    try { localStorage.setItem("fm_region", r); } catch {}
  };
  return [region, update];
}

function ProductPage() {
  const { product } = Route.useLoaderData();
  const [selected, setSelected] = useState<Denomination>(product.denominations[0]);
  const [playerId, setPlayerId] = useState("");
  const [zone, setZone] = useState("");
  const [email, setEmail] = useState("");
  const [region, setRegion] = useDetectedRegion();
  const [gateway, setGateway] = useState<"upi" | "card" | "paypal">("upi");
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [copied, setCopied] = useState(false);

  // Keep gateway consistent with region
  useEffect(() => {
    setGateway(region === "IN" ? "upi" : "card");
  }, [region]);

  const inrAmount = useMemo(() => getINR(selected), [selected]);
  const usdAmount = useMemo(() => selected.price.toFixed(2), [selected]);

  const upiLink = useMemo(
    () => buildUpiLink(inrAmount, `${product.name} — ${selected.label}`),
    [inrAmount, product.name, selected.label]
  );

  // Generate QR whenever the UPI link changes (only relevant for IN)
  useEffect(() => {
    if (region !== "IN") return;
    let cancelled = false;
    QRCode.toDataURL(upiLink, { width: 320, margin: 1, color: { dark: "#000000", light: "#ffffff" } })
      .then((url) => { if (!cancelled) setQrDataUrl(url); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [upiLink, region]);

  const copyUpi = async () => {
    try {
      await navigator.clipboard.writeText(UPI_ID);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {}
  };

  const navigate = useNavigate();
  const [placing, setPlacing] = useState(false);

  const placeOrder = async () => {
    if (product.needsPlayerId && !playerId.trim()) return toast.error(`Enter your ${product.idLabel ?? "Player ID"}`);
    if (product.slug === "mobile-legends" && !zone.trim()) return toast.error("Enter your Zone ID");
    if (!product.needsPlayerId && !email.trim()) return toast.error("Enter your delivery email");
    setPlacing(true);
    try {
      const { data: u } = await supabase.auth.getUser();
      const code = generateOrderCode();
      const game_id = product.needsPlayerId ? `${playerId}${zone ? ` (${zone})` : ""}` : null;
      const { error } = await supabase.from("orders").insert({
        order_code: code,
        user_id: u.user?.id ?? null,
        customer_email: u.user?.email ?? email ?? null,
        customer_contact: null,
        game_id,
        product_slug: product.slug,
        product_name: product.name,
        tier_label: selected.label,
        amount_inr: region === "IN" ? inrAmount : null,
        amount_usd: region !== "IN" ? Number(usdAmount) : null,
        currency: region === "IN" ? "INR" : "USD",
        region,
        payment_method: region === "IN" ? "upi" : gateway,
        status: "pending_payment",
      });
      if (error) throw error;
      toast.success(`Order ${code} created!`);
      navigate({ to: "/orders/$code", params: { code } });
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Could not create order");
    } finally {
      setPlacing(false);
    }
  };

  return (
    <div className="container mx-auto max-w-7xl px-4 py-10">
      <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to all products
      </Link>

      <div className="mt-6 grid gap-8 lg:grid-cols-[1.2fr_1fr]">
        {/* Left */}
        <div className="space-y-6">
          <div className="surface-card overflow-hidden">
            <div className="relative h-48 md:h-64">
              <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
              <div className={`absolute inset-0 bg-gradient-to-t ${product.accent} opacity-40 mix-blend-overlay`} />
              <div className="absolute inset-0 bg-gradient-to-t from-card via-card/40 to-transparent" />
              <div className="absolute bottom-4 left-5">
                <span className="rounded-full bg-background/70 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground backdrop-blur">
                  {product.publisher}
                </span>
                <h1 className="mt-2 text-3xl font-bold md:text-4xl">{product.name}</h1>
                <p className="text-sm text-muted-foreground">{product.tagline}</p>
              </div>
            </div>
          </div>

          {/* Region toggle */}
          <div className="surface-card flex flex-wrap items-center justify-between gap-3 p-4">
            <div className="flex items-center gap-2 text-sm">
              <Globe className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Paying from</span>
              <span className="font-semibold">{region === "IN" ? "🇮🇳 India (INR)" : "🌍 International (USD)"}</span>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setRegion("IN")}
                className={cn(
                  "rounded-lg border px-3 py-1.5 text-xs font-medium transition-all",
                  region === "IN" ? "border-[var(--neon)] glow-ring" : "border-border hover:border-foreground/30"
                )}
              >
                India / UPI
              </button>
              <button
                type="button"
                onClick={() => setRegion("INT")}
                className={cn(
                  "rounded-lg border px-3 py-1.5 text-xs font-medium transition-all",
                  region === "INT" ? "border-[var(--neon)] glow-ring" : "border-border hover:border-foreground/30"
                )}
              >
                International
              </button>
            </div>
          </div>

          <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
            {/* Account info */}
            <section className="surface-card p-5">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">1 · Account details</h2>
              {product.needsPlayerId ? (
                <div className="mt-3 grid gap-3 md:grid-cols-2">
                  <div className="md:col-span-2">
                    <label className="text-xs font-medium text-muted-foreground">{product.idLabel}</label>
                    <input
                      required
                      value={playerId}
                      onChange={(e) => setPlayerId(e.target.value)}
                      placeholder={product.idPlaceholder}
                      className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                  {product.slug === "mobile-legends" && (
                    <div>
                      <label className="text-xs font-medium text-muted-foreground">Zone ID</label>
                      <input
                        required
                        value={zone}
                        onChange={(e) => setZone(e.target.value)}
                        placeholder="e.g. 2345"
                        className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring"
                      />
                    </div>
                  )}
                </div>
              ) : (
                <div className="mt-3">
                  <label className="text-xs font-medium text-muted-foreground">Delivery email</label>
                  <input
                    required
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@email.com"
                    className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring"
                  />
                  <p className="mt-1 text-xs text-muted-foreground">Your gift code will be emailed within 1 minute.</p>
                </div>
              )}
            </section>

            {/* Denomination */}
            <section className="surface-card p-5">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                2 · Select {product.currency.toLowerCase()}
              </h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {product.denominations.map((d: Denomination) => {
                  const active = selected.id === d.id;
                  return (
                    <button
                      type="button"
                      key={d.id}
                      onClick={() => setSelected(d)}
                      className={cn(
                        "group relative rounded-xl border bg-background/40 p-4 text-left transition-all",
                        active ? "border-[var(--neon)] glow-ring" : "border-border hover:border-foreground/30"
                      )}
                    >
                      {d.bonus && (
                        <span className="absolute right-2 top-2 rounded-full bg-success/15 px-2 py-0.5 text-[10px] font-semibold text-success">
                          {d.bonus}
                        </span>
                      )}
                      <div className="text-sm font-semibold">{d.label}</div>
                      <div className="mt-1 text-xs text-muted-foreground">
                        {region === "IN" ? `₹${getINR(d)}` : `$${d.price.toFixed(2)} USD`}
                      </div>
                      {active && <Check className="absolute bottom-3 right-3 h-4 w-4 text-[var(--neon)]" />}
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Payment */}
            <section className="surface-card p-5">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">3 · Payment method</h2>

              {region === "IN" ? (
                <div className="mt-4 grid gap-5 md:grid-cols-[auto_1fr] md:items-center">
                  <div className="flex justify-center">
                    <div className="rounded-2xl bg-white p-3 shadow-lg">
                      {qrDataUrl ? (
                        <img src={qrDataUrl} alt={`UPI QR for ₹${inrAmount}`} width={220} height={220} />
                      ) : (
                        <div className="grid h-[220px] w-[220px] place-items-center text-xs text-muted-foreground">
                          Generating QR…
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <div className="text-xs uppercase tracking-wider text-muted-foreground">Amount</div>
                      <div className="text-3xl font-bold gradient-text">₹{inrAmount}</div>
                    </div>
                    <div className="rounded-lg border border-border bg-background/40 p-3 text-sm">
                      <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Merchant</div>
                      <div className="font-semibold">{UPI_MERCHANT}</div>
                      <div className="mt-2 flex items-center justify-between gap-2">
                        <code className="truncate text-xs">{UPI_ID}</code>
                        <button
                          type="button"
                          onClick={copyUpi}
                          className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-[11px] hover:border-foreground/30"
                        >
                          <Copy className="h-3 w-3" /> {copied ? "Copied" : "Copy"}
                        </button>
                      </div>
                    </div>
                    <a
                      href={upiLink}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[image:var(--gradient-primary)] px-5 py-3 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-glow)] transition-transform hover:scale-[1.01]"
                    >
                      <Smartphone className="h-4 w-4" /> Pay ₹{inrAmount} with UPI
                    </a>
                    <p className="text-[11px] text-muted-foreground">
                      The QR shows a sample. To get a unique Order ID, save your details, and pay & confirm, click <b>Create order &amp; continue</b> on the right.
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    {([
                      { id: "card", label: "Card", desc: "Visa / Mastercard / Amex", icon: CreditCard },
                      { id: "paypal", label: "PayPal", desc: "Pay with your PayPal", icon: Wallet },
                    ] as const).map((g) => {
                      const active = gateway === g.id;
                      return (
                        <button
                          type="button"
                          key={g.id}
                          onClick={() => setGateway(g.id)}
                          className={cn(
                            "flex items-center gap-3 rounded-xl border p-4 text-left transition-all",
                            active ? "border-[var(--neon)] glow-ring" : "border-border hover:border-foreground/30"
                          )}
                        >
                          <span className="grid h-10 w-10 place-items-center rounded-lg bg-secondary text-foreground">
                            <g.icon className="h-5 w-5" />
                          </span>
                          <div>
                            <div className="text-sm font-semibold">{g.label}</div>
                            <div className="text-xs text-muted-foreground">{g.desc}</div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                  <p className="mt-4 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Lock className="h-3.5 w-3.5" /> Secure checkout — PayPal / Stripe integration placeholder.
                  </p>
                </>
              )}
            </section>
          </form>
        </div>

        {/* Right: Summary */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="surface-card p-6">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Order summary</h3>
            <div className="mt-4 space-y-3 text-sm">
              <Row label="Product" value={product.name} />
              <Row label="Item" value={selected.label} />
              <Row
                label={product.needsPlayerId ? product.idLabel ?? "Player ID" : "Email"}
                value={product.needsPlayerId ? (playerId || "—") : (email || "—")}
              />
              {product.slug === "mobile-legends" && <Row label="Zone" value={zone || "—"} />}
              <Row
                label="Payment"
                value={region === "IN" ? "UPI" : gateway === "paypal" ? "PayPal" : "Card"}
              />
              <div className="my-2 h-px bg-border" />
              <div className="flex items-end justify-between">
                <span className="text-xs uppercase tracking-wider text-muted-foreground">Total</span>
                <span className="text-3xl font-bold gradient-text">
                  {region === "IN" ? `₹${inrAmount}` : `$${usdAmount}`}
                </span>
              </div>
            </div>

            {region === "IN" ? (
              <button
                type="button"
                disabled={placing}
                onClick={placeOrder}
                className="mt-6 w-full rounded-xl bg-[image:var(--gradient-primary)] px-5 py-3.5 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-glow)] transition-transform hover:scale-[1.01] disabled:opacity-60"
              >
                {placing ? "Creating order…" : `Create order & pay ₹${inrAmount}`}
              </button>
            ) : (
              <button
                type="button"
                disabled={placing}
                onClick={placeOrder}
                className="mt-6 w-full rounded-xl bg-[image:var(--gradient-primary)] px-5 py-3.5 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-glow)] transition-transform hover:scale-[1.01] disabled:opacity-60"
              >
                {placing ? "Creating order…" : `Create order — $${usdAmount}`}
              </button>
            )}

            <p className="mt-4 text-center text-[11px] text-muted-foreground">
              By placing this order you agree to our{" "}
              <Link to="/terms" className="underline hover:text-foreground">Terms</Link> and{" "}
              <Link to="/refund" className="underline hover:text-foreground">Refund Policy</Link>.
            </p>
          </div>

          <div className="mt-5 grid grid-cols-3 gap-2 text-center">
            {PRODUCTS.filter((p) => p.slug !== product.slug).slice(0, 3).map((p) => (
              <Link key={p.slug} to="/products/$slug" params={{ slug: p.slug }} className="surface-card overflow-hidden">
                <img src={p.image} alt={p.name} loading="lazy" className="aspect-square w-full object-cover" />
                <div className="p-2 text-[11px] font-medium">{p.name}</div>
              </Link>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-muted-foreground">{label}</span>
      <span className="max-w-[60%] truncate text-right font-medium">{value}</span>
    </div>
  );
}
