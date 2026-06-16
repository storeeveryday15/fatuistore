import { useEffect, useRef, useState } from "react";
import { MessageCircle, X, Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { WHATSAPP_LINK } from "@/lib/products";

type Msg = { role: "bot" | "user"; text: string };

const QUICK = [
  "How long does delivery take?",
  "How do I pay with UPI?",
  "I paid but no top-up",
  "Refund policy",
  "Talk to a human",
];

function reply(q: string): string {
  const t = q.toLowerCase();
  if (t.includes("how long") || t.includes("delivery") || t.includes("take")) {
    return "⚡ Most orders are delivered in under 60 seconds after we verify your payment. Diamonds top-ups go straight to your game ID; gift codes are emailed.";
  }
  if (t.includes("upi") || t.includes("pay")) {
    return "📱 Pick a product, choose your pack, and scan the UPI QR or tap 'Pay with UPI'. The exact amount is pre-filled. After paying, paste your 12-digit UTR on the order page so we can verify instantly.";
  }
  if (t.includes("paid") && (t.includes("no") || t.includes("not") || t.includes("didn"))) {
    return "I'm sorry! Please share your Order ID (starts with FM-) and a screenshot of payment. Tap 'Talk to a human' below and we'll fix it within minutes.";
  }
  if (t.includes("refund")) {
    return "💸 Full refund within 30 minutes if delivery hasn't started. After delivery, refunds depend on the publisher. See /refund for full policy.";
  }
  if (t.includes("human") || t.includes("agent") || t.includes("support") || t.includes("whatsapp")) {
    return `👤 Connecting you to a human. Tap here: ${WHATSAPP_LINK}`;
  }
  if (t.includes("price") || t.includes("cost")) {
    return "All prices are listed on the product page. India: INR (UPI). International: USD (Card/PayPal). No hidden fees.";
  }
  if (t.includes("hi") || t.includes("hello") || t.includes("hey")) {
    return "Hey! 👋 Welcome to Fatui Market. How can I help?";
  }
  return "I'll escalate that to our team. Tap 'Talk to a human' below for WhatsApp support, or share your question and we'll get back fast.";
}

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([
    { role: "bot", text: "Hi! I'm Fatui Bot 🤖. Ask about pricing, delivery, payments, or refunds." },
  ]);
  const [input, setInput] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs, open]);

  const send = async (text: string) => {
    if (!text.trim()) return;
    const next: Msg[] = [...msgs, { role: "user", text }];
    setMsgs(next);
    setInput("");
    setTimeout(() => setMsgs((m) => [...m, { role: "bot", text: reply(text) }]), 350);
    // Log escalations / general questions for admin
    if (/human|agent|support|paid|refund|issue|problem/i.test(text)) {
      const { data: u } = await supabase.auth.getUser();
      await supabase.from("support_messages").insert({
        user_id: u.user?.id ?? null,
        name: u.user?.email ?? "Guest",
        contact: u.user?.email ?? null,
        message: text,
      });
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-5 left-5 z-40 grid h-14 w-14 place-items-center rounded-full bg-[image:var(--gradient-primary)] text-primary-foreground shadow-[var(--shadow-glow)] transition-transform hover:scale-105"
        aria-label="Open chat"
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>
      {open && (
        <div className="fixed bottom-24 left-5 z-40 flex h-[min(540px,80vh)] w-[min(360px,92vw)] flex-col rounded-2xl border border-border bg-card shadow-2xl">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <div>
              <div className="text-sm font-semibold">Fatui Support</div>
              <div className="text-[11px] text-success">● online</div>
            </div>
            <button onClick={() => setOpen(false)} aria-label="Close" className="text-muted-foreground hover:text-foreground">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="flex-1 space-y-2 overflow-y-auto px-3 py-3">
            {msgs.map((m, i) => (
              <div key={i} className={m.role === "user" ? "flex justify-end" : "flex justify-start"}>
                <div className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${m.role === "user" ? "bg-[image:var(--gradient-primary)] text-primary-foreground" : "bg-secondary text-foreground"}`}>
                  {m.text.split(/(\bhttps?:\/\/\S+)/g).map((part, j) =>
                    part.startsWith("http") ? (
                      <a key={j} href={part} target="_blank" rel="noreferrer" className="underline">{part}</a>
                    ) : (
                      <span key={j}>{part}</span>
                    )
                  )}
                </div>
              </div>
            ))}
            <div ref={endRef} />
          </div>
          <div className="border-t border-border px-3 py-2">
            <div className="mb-2 flex flex-wrap gap-1.5">
              {QUICK.map((q) => (
                <button key={q} onClick={() => send(q)} className="rounded-full border border-border bg-background/60 px-2.5 py-1 text-[11px] text-muted-foreground hover:border-foreground/30 hover:text-foreground">
                  {q}
                </button>
              ))}
            </div>
            <form onSubmit={(e) => { e.preventDefault(); send(input); }} className="flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type a message…"
                className="flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
              />
              <button type="submit" className="grid h-9 w-9 place-items-center rounded-lg bg-[image:var(--gradient-primary)] text-primary-foreground">
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
