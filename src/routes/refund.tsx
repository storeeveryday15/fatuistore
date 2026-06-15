import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/legal-page";
import { CONTACT_EMAIL } from "@/lib/products";

export const Route = createFileRoute("/refund")({
  head: () => ({
    meta: [
      { title: "Refund Policy — Fatui Market" },
      { name: "description", content: "When and how Fatui Market issues refunds for game top-ups and digital codes." },
      { property: "og:title", content: "Refund Policy — Fatui Market" },
      { property: "og:description", content: "Clear, fair refund rules for digital top-ups." },
    ],
  }),
  component: () => (
    <LegalPage
      title="Refund Policy"
      updated="June 14, 2026"
      sections={[
        { h: "1. Digital goods nature", p: "Game top-ups and digital codes are non-tangible and instantly delivered. Once delivered to your account or email, they cannot generally be returned." },
        { h: "2. When refunds apply", p: "You are eligible for a full refund if: (a) the top-up was not delivered within 24 hours, (b) you were charged twice for the same order, or (c) you provided the correct player ID and the credit did not reach your account due to our error." },
        { h: "3. When refunds do not apply", p: "Refunds are not provided when: (a) you entered the wrong player ID or email, (b) your account was banned or restricted by the game publisher, (c) you changed your mind after delivery, or (d) a digital code has been redeemed." },
        { h: "4. How to request a refund", p: "Email support@fatuimarket.com or message us on WhatsApp within 7 days of the order, with your order ID and a brief description. Refunds are processed within 5 to 10 business days to the original payment method." },
        { h: "5. Chargebacks", p: "Please contact us before filing a chargeback — most issues can be resolved within minutes. Unjustified chargebacks may result in account suspension." },
        { h: "6. Partial refunds", p: "If a portion of a multi-item order is delivered and the rest is not, we will refund only the undelivered portion." },
      ]}
    />
  ),
});
