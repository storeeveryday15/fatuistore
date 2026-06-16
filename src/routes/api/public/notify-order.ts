import { createFileRoute } from "@tanstack/react-router";

// Public endpoint: notify owner about a new order via Telegram and/or Email.
// Called fire-and-forget from the client right after the order row is inserted.
// Security: only public order metadata (already visible to the customer) is forwarded;
// notifications only fire when TELEGRAM_BOT_TOKEN/CHAT_ID or RESEND_API_KEY are set.

export const Route = createFileRoute("/api/public/notify-order")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let body: { order_code?: string } = {};
        try { body = await request.json(); } catch { /* ignore */ }
        const code = body.order_code;
        if (!code || typeof code !== "string") {
          return new Response(JSON.stringify({ ok: false, error: "missing order_code" }), { status: 400 });
        }

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data: order } = await supabaseAdmin
          .from("orders")
          .select("order_code, product_name, tier_label, amount_inr, amount_usd, currency, region, customer_email, game_id, status, created_at")
          .eq("order_code", code)
          .maybeSingle();
        if (!order) {
          return new Response(JSON.stringify({ ok: false, error: "not found" }), { status: 404 });
        }

        const amount = order.currency === "INR" ? `₹${order.amount_inr}` : `$${order.amount_usd}`;
        const text =
          `🛒 New Fatui Market order\n` +
          `Order: ${order.order_code}\n` +
          `Product: ${order.product_name} — ${order.tier_label}\n` +
          `Amount: ${amount} (${order.currency})\n` +
          `Region: ${order.region}\n` +
          (order.game_id ? `Game ID: ${order.game_id}\n` : "") +
          (order.customer_email ? `Email: ${order.customer_email}\n` : "") +
          `Status: ${order.status}`;

        const results: Record<string, unknown> = {};

        // Telegram
        const tgToken = process.env.TELEGRAM_BOT_TOKEN;
        const tgChat = process.env.TELEGRAM_CHAT_ID;
        if (tgToken && tgChat) {
          try {
            const r = await fetch(`https://api.telegram.org/bot${tgToken}/sendMessage`, {
              method: "POST",
              headers: { "content-type": "application/json" },
              body: JSON.stringify({ chat_id: tgChat, text }),
            });
            results.telegram = r.ok ? "sent" : `failed:${r.status}`;
          } catch (e) {
            results.telegram = `error:${(e as Error).message}`;
          }
        } else {
          results.telegram = "skipped: TELEGRAM_BOT_TOKEN/CHAT_ID not set";
        }

        // Email via Resend
        const resendKey = process.env.RESEND_API_KEY;
        const notifyEmail = process.env.NOTIFY_EMAIL || "fatuimarket@gmail.com";
        if (resendKey) {
          try {
            const r = await fetch("https://api.resend.com/emails", {
              method: "POST",
              headers: { "content-type": "application/json", authorization: `Bearer ${resendKey}` },
              body: JSON.stringify({
                from: "Fatui Market <onboarding@resend.dev>",
                to: [notifyEmail],
                subject: `New order ${order.order_code} — ${amount}`,
                text,
              }),
            });
            results.email = r.ok ? "sent" : `failed:${r.status}`;
          } catch (e) {
            results.email = `error:${(e as Error).message}`;
          }
        } else {
          results.email = "skipped: RESEND_API_KEY not set";
        }

        return new Response(JSON.stringify({ ok: true, results }), {
          headers: { "content-type": "application/json" },
        });
      },
    },
  },
});
