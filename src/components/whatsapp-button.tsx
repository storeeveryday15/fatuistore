import { MessageCircle } from "lucide-react";
import { WHATSAPP_LINK } from "@/lib/products";

export function WhatsappFloat() {
  return (
    <a
      href={WHATSAPP_LINK}
      target="_blank"
      rel="noreferrer"
      aria-label="Chat on WhatsApp"
      className="fixed bottom-5 right-5 z-40 grid h-14 w-14 place-items-center rounded-full bg-success text-success-foreground shadow-[0_10px_30px_-5px_color-mix(in_oklab,var(--success)_60%,transparent)] transition-transform hover:scale-105"
    >
      <MessageCircle className="h-6 w-6" />
    </a>
  );
}
