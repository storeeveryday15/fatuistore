import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/legal-page";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — Fatui Market" },
      { name: "description", content: "How Fatui Market collects, uses and protects your personal data." },
      { property: "og:title", content: "Privacy Policy — Fatui Market" },
      { property: "og:description", content: "Our commitment to your privacy and data security." },
    ],
  }),
  component: () => (
    <LegalPage
      title="Privacy Policy"
      updated="June 14, 2026"
      sections={[
        { h: "1. Information we collect", p: "We collect the data you provide when placing an order — name, email, player/game ID, and payment details. Payment information is processed by our PCI-compliant gateways and is never stored on our servers." },
        { h: "2. How we use your data", p: "Your data is used to deliver top-ups, send order confirmations, prevent fraud, and provide customer support. We never sell your personal data." },
        { h: "3. Cookies & analytics", p: "We use essential cookies to keep you signed in and remember your theme preference. Anonymous analytics help us improve the site." },
        { h: "4. Third-party services", p: "We share data only with the providers needed to fulfill your order — game publishers (for ID validation), payment gateways, and email providers." },
        { h: "5. Data retention", p: "Order records are kept for 24 months for accounting and dispute resolution. You may request deletion of your account at any time." },
        { h: "6. Your rights", p: "You may request access, correction, or deletion of your personal data by emailing support@fatuimarket.com. We respond within 7 business days." },
        { h: "7. Children's privacy", p: "Our service is not directed at children under 13. We do not knowingly collect data from minors." },
        { h: "8. Updates to this policy", p: "We may update this policy from time to time. The 'Last updated' date at the top reflects the latest revision." },
      ]}
    />
  ),
});
