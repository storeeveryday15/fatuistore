import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Mail, MessageCircle, Clock, MapPin } from "lucide-react";
import { WHATSAPP_LINK } from "@/lib/products";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Fatui Market" },
      { name: "description", content: "Get in touch with Fatui Market support via WhatsApp, email or our contact form." },
      { property: "og:title", content: "Contact — Fatui Market" },
      { property: "og:description", content: "We're here 24/7 to help with your top-up." },
    ],
  }),
  component: Contact,
});

function Contact() {
  const [sent, setSent] = useState(false);
  return (
    <div className="container mx-auto max-w-6xl px-4 py-16">
      <div className="max-w-2xl">
        <span className="text-xs font-semibold uppercase tracking-wider text-[var(--neon)]">Support</span>
        <h1 className="mt-2 text-4xl font-bold md:text-5xl">Talk to us, <span className="gradient-text">anytime</span>.</h1>
        <p className="mt-3 text-muted-foreground">
          Order issue? Payment question? Our support team replies within minutes on WhatsApp.
        </p>
      </div>

      <div className="mt-12 grid gap-8 lg:grid-cols-[1.2fr_1fr]">
        <form
          onSubmit={(e) => { e.preventDefault(); setSent(true); }}
          className="surface-card space-y-4 p-6"
        >
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Name" required><input required className="input" placeholder="Your name" /></Field>
            <Field label="Email" required><input required type="email" className="input" placeholder="you@email.com" /></Field>
          </div>
          <Field label="Order ID (optional)"><input className="input" placeholder="#FM-12345" /></Field>
          <Field label="Message" required>
            <textarea required rows={5} className="input resize-none" placeholder="How can we help?" />
          </Field>
          <button className="rounded-xl bg-[image:var(--gradient-primary)] px-6 py-3 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-glow)]">
            {sent ? "Message sent ✓" : "Send message"}
          </button>
          {sent && <p className="text-xs text-success">Thanks! We'll reply within 1 hour.</p>}
        </form>

        <div className="space-y-4">
          <a href={WHATSAPP_LINK} target="_blank" rel="noreferrer" className="surface-card flex items-start gap-4 p-5 transition-colors hover:bg-secondary/40">
            <span className="grid h-12 w-12 place-items-center rounded-xl bg-success/15 text-success"><MessageCircle className="h-6 w-6" /></span>
            <div>
              <div className="font-semibold">WhatsApp Support</div>
              <div className="text-sm text-muted-foreground">Fastest reply — under 5 minutes</div>
              <div className="mt-1 text-sm font-medium text-foreground">Chat now →</div>
            </div>
          </a>
          <div className="surface-card flex items-start gap-4 p-5">
            <span className="grid h-12 w-12 place-items-center rounded-xl bg-secondary text-foreground"><Mail className="h-6 w-6" /></span>
            <div>
              <div className="font-semibold">Email</div>
              <div className="text-sm text-muted-foreground">support@fatuimarket.com</div>
            </div>
          </div>
          <div className="surface-card flex items-start gap-4 p-5">
            <span className="grid h-12 w-12 place-items-center rounded-xl bg-secondary text-foreground"><Clock className="h-6 w-6" /></span>
            <div>
              <div className="font-semibold">Hours</div>
              <div className="text-sm text-muted-foreground">24 / 7 — including weekends</div>
            </div>
          </div>
          <div className="surface-card flex items-start gap-4 p-5">
            <span className="grid h-12 w-12 place-items-center rounded-xl bg-secondary text-foreground"><MapPin className="h-6 w-6" /></span>
            <div>
              <div className="font-semibold">HQ</div>
              <div className="text-sm text-muted-foreground">Dhaka, Bangladesh</div>
            </div>
          </div>
        </div>
      </div>

      <style>{`.input{width:100%;border-radius:.6rem;border:1px solid var(--color-input);background:var(--color-background);padding:.65rem .8rem;font-size:.875rem;color:var(--color-foreground);outline:none}.input:focus{box-shadow:0 0 0 2px var(--color-ring)}`}</style>
    </div>
  );
}

function Field({ label, children, required }: { label: string; children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-muted-foreground">{label}{required && " *"}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}
