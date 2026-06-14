import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/legal-page";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms & Conditions — Fatui Market" },
      { name: "description", content: "Terms governing the use of Fatui Market's game top-up services." },
      { property: "og:title", content: "Terms & Conditions — Fatui Market" },
      { property: "og:description", content: "Rules for using Fatui Market." },
    ],
  }),
  component: () => (
    <LegalPage
      title="Terms & Conditions"
      updated="June 14, 2026"
      sections={[
        { h: "1. Acceptance of terms", p: "By placing an order on Fatui Market you agree to these Terms & Conditions. If you do not agree, please do not use the service." },
        { h: "2. Eligibility", p: "You must be at least 13 years old (or the age of digital consent in your country) and have permission from the payment account holder to make purchases." },
        { h: "3. Orders & delivery", p: "Top-ups are delivered to the player ID or email you provide. It is your responsibility to provide correct information. Most orders complete within 60 seconds; some may take up to 30 minutes during peak hours." },
        { h: "4. Pricing & payment", p: "All prices are in USD unless stated otherwise. Local payment methods may apply currency conversion. Payment is processed by third-party gateways (Stripe, SSLCommerz, PayPal, crypto)." },
        { h: "5. Account responsibility", p: "We are not responsible for losses caused by sharing your game account credentials with third parties or by violations of the game publisher's terms." },
        { h: "6. Prohibited use", p: "You may not use the service for fraud, money laundering, resale without authorization, or any unlawful purpose." },
        { h: "7. Intellectual property", p: "All game names, logos and trademarks belong to their respective publishers. Fatui Market is an independent reseller and is not affiliated with the publishers listed." },
        { h: "8. Limitation of liability", p: "Our liability is limited to the value of your order. We are not responsible for in-game bans, account suspensions, or losses caused by the game publisher." },
        { h: "9. Changes to these terms", p: "We may update these terms. Continued use after changes constitutes acceptance." },
        { h: "10. Governing law", p: "These terms are governed by the laws of Bangladesh. Disputes are subject to the courts of Dhaka." },
      ]}
    />
  ),
});
