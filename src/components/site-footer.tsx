import { Link } from "@tanstack/react-router";
import { Gamepad2, MessageCircle, Mail, Shield } from "lucide-react";
import { WHATSAPP_LINK } from "@/lib/products";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border bg-card/40">
      <div className="container mx-auto grid max-w-7xl gap-10 px-4 py-14 md:grid-cols-4">
        <div className="space-y-3">
          <div className="flex items-center gap-2 font-display text-lg font-bold">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-[image:var(--gradient-primary)] text-primary-foreground">
              <Gamepad2 className="h-5 w-5" />
            </span>
            Fatui Market
          </div>
          <p className="text-sm text-muted-foreground">
            Instant game top-ups & digital codes. Trusted by gamers worldwide.
          </p>
        </div>

        <div>
          <h4 className="mb-3 text-sm font-semibold">Products</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/products/$slug" params={{ slug: "mobile-legends" }} className="hover:text-foreground">Mobile Legends</Link></li>
            <li><Link to="/products/$slug" params={{ slug: "free-fire" }} className="hover:text-foreground">Free Fire</Link></li>
            <li><Link to="/products/$slug" params={{ slug: "pubg-mobile" }} className="hover:text-foreground">PUBG Mobile</Link></li>
            <li><Link to="/products/$slug" params={{ slug: "valorant" }} className="hover:text-foreground">Valorant</Link></li>
            <li><Link to="/products/$slug" params={{ slug: "steam-wallet" }} className="hover:text-foreground">Steam Wallet</Link></li>
            <li><Link to="/products/$slug" params={{ slug: "google-play" }} className="hover:text-foreground">Google Play</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="mb-3 text-sm font-semibold">Legal</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/terms" className="hover:text-foreground">Terms & Conditions</Link></li>
            <li><Link to="/privacy" className="hover:text-foreground">Privacy Policy</Link></li>
            <li><Link to="/refund" className="hover:text-foreground">Refund Policy</Link></li>
            <li><Link to="/contact" className="hover:text-foreground">Contact</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="mb-3 text-sm font-semibold">Customer Support</h4>
          <ul className="space-y-3 text-sm text-muted-foreground">
            <li>
              <a href={WHATSAPP_LINK} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 hover:text-foreground">
                <MessageCircle className="h-4 w-4 text-success" /> WhatsApp 24/7
              </a>
            </li>
            <li className="inline-flex items-center gap-2">
              <Mail className="h-4 w-4" /> support@fatuimarket.com
            </li>
            <li className="inline-flex items-center gap-2">
              <Shield className="h-4 w-4" /> Secure payments
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border py-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Fatui Market. All trademarks belong to their respective owners.
      </div>
    </footer>
  );
}
