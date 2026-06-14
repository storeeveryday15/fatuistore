import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PRODUCTS, getProduct, type Denomination } from "@/lib/products";
import { ArrowLeft, CreditCard, Wallet, Smartphone, Bitcoin, Check, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

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

const GATEWAYS = [
  { id: "card", label: "Card", desc: "Visa / Mastercard", icon: CreditCard },
  { id: "wallet", label: "Mobile Wallet", desc: "bKash / Nagad / Rocket", icon: Smartphone },
  { id: "paypal", label: "PayPal", desc: "Pay with PayPal", icon: Wallet },
  { id: "crypto", label: "Crypto", desc: "USDT / BTC", icon: Bitcoin },
];

function ProductPage() {
  const { product } = Route.useLoaderData();
  const [selected, setSelected] = useState<Denomination>(product.denominations[0]);
  const [playerId, setPlayerId] = useState("");
  const [zone, setZone] = useState("");
  const [email, setEmail] = useState("");
  const [gateway, setGateway] = useState("card");
  const [submitted, setSubmitted] = useState(false);

  const total = useMemo(() => selected.price.toFixed(2), [selected]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Payment gateway integration placeholder
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 5000);
  };

  return (
    <div className="container mx-auto max-w-7xl px-4 py-10">
      <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to all products
      </Link>

      <div className="mt-6 grid gap-8 lg:grid-cols-[1.2fr_1fr]">
        {/* Left: Form */}
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

          <form onSubmit={onSubmit} className="space-y-6">
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
                        active
                          ? "border-[var(--neon)] glow-ring"
                          : "border-border hover:border-foreground/30"
                      )}
                    >
                      {d.bonus && (
                        <span className="absolute right-2 top-2 rounded-full bg-success/15 px-2 py-0.5 text-[10px] font-semibold text-success">
                          {d.bonus}
                        </span>
                      )}
                      <div className="text-sm font-semibold">{d.label}</div>
                      <div className="mt-1 text-xs text-muted-foreground">${d.price.toFixed(2)} USD</div>
                      {active && (
                        <Check className="absolute bottom-3 right-3 h-4 w-4 text-[var(--neon)]" />
                      )}
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Payment */}
            <section className="surface-card p-5">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">3 · Payment method</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {GATEWAYS.map((g) => {
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
                <Lock className="h-3.5 w-3.5" /> Payment gateway integration placeholder — connect Stripe / SSLCommerz on checkout.
              </p>
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
              <Row label="Payment" value={GATEWAYS.find((g) => g.id === gateway)?.label ?? "—"} />
              <div className="my-2 h-px bg-border" />
              <div className="flex items-end justify-between">
                <span className="text-xs uppercase tracking-wider text-muted-foreground">Total</span>
                <span className="text-3xl font-bold gradient-text">${total}</span>
              </div>
            </div>

            <button
              onClick={onSubmit}
              className="mt-6 w-full rounded-xl bg-[image:var(--gradient-primary)] px-5 py-3.5 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-glow)] transition-transform hover:scale-[1.01]"
            >
              {submitted ? "Redirecting to gateway…" : `Pay $${total} now`}
            </button>

            {submitted && (
              <div className="mt-3 rounded-lg border border-success/30 bg-success/10 p-3 text-xs text-success">
                Demo only — connect your live payment gateway in <code className="font-mono">/products/$slug</code>.
              </div>
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
