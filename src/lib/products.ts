import mlbb from "@/assets/game-mlbb.jpg";
import ff from "@/assets/game-ff.jpg";
import pubg from "@/assets/game-pubg.jpg";
import valorant from "@/assets/game-valorant.jpg";
import steam from "@/assets/game-steam.jpg";
import gplay from "@/assets/game-gplay.jpg";

export type Denomination = {
  id: string;
  label: string;
  price: number; // USD
  priceINR?: number; // explicit INR; otherwise computed
  bonus?: string;
};

export const USD_TO_INR = 83;
export const getINR = (d: Denomination) =>
  d.priceINR ?? Math.round(d.price * USD_TO_INR);

export type Product = {
  slug: string;
  name: string;
  publisher: string;
  currency: string;
  tagline: string;
  image: string;
  accent: string;
  needsPlayerId: boolean;
  idLabel?: string;
  idPlaceholder?: string;
  denominations: Denomination[];
};

export const PRODUCTS: Product[] = [
  {
    slug: "mobile-legends",
    name: "Mobile Legends",
    publisher: "Moonton",
    currency: "Diamonds",
    tagline: "Top up MLBB diamonds instantly to your account.",
    image: mlbb,
    accent: "from-fuchsia-500 to-violet-600",
    needsPlayerId: true,
    idLabel: "User ID (Zone ID)",
    idPlaceholder: "123456789 (1234)",
    denominations: [
      { id: "m1", label: "86 Diamonds", price: 1.5 },
      { id: "m2", label: "172 Diamonds", price: 3 },
      { id: "m3", label: "257 Diamonds", price: 4.5 },
      { id: "m4", label: "344 Diamonds", price: 6 },
      { id: "m5", label: "706 Diamonds", price: 12, bonus: "+5%" },
      { id: "m6", label: "1412 Diamonds", price: 24, bonus: "+10%" },
      { id: "m7", label: "2195 Diamonds", price: 38, bonus: "+15%" },
      { id: "m8", label: "Weekly Lite Pass", price: 0.55, priceINR: 45 },
      { id: "m9", label: "Weekly Diamond Pass", price: 1.2, priceINR: 99 },
      { id: "m10", label: "Membership", price: 4.8, priceINR: 399 },
  },
  {
    slug: "free-fire",
    name: "Free Fire",
    publisher: "Garena",
    currency: "Diamonds",
    tagline: "Power up your loadout with Free Fire diamonds.",
    image: ff,
    accent: "from-orange-500 to-rose-600",
    needsPlayerId: true,
    idLabel: "Player ID",
    idPlaceholder: "Enter your Free Fire ID",
    denominations: [
      { id: "f1", label: "100 Diamonds", price: 1 },
      { id: "f2", label: "310 Diamonds", price: 3 },
      { id: "f3", label: "520 Diamonds", price: 5 },
      { id: "f4", label: "1060 Diamonds", price: 10 },
      { id: "f5", label: "2180 Diamonds", price: 20, bonus: "+8%" },
      { id: "f6", label: "5600 Diamonds", price: 50, bonus: "+12%" },
      { id: "f7", label: "Weekly Membership", price: 2 },
      { id: "f8", label: "Monthly Membership", price: 8 },
    ],
  },
  {
    slug: "pubg-mobile",
    name: "PUBG Mobile",
    publisher: "Tencent",
    currency: "UC",
    tagline: "Stock up on UC for skins, crates and the Royale Pass.",
    image: pubg,
    accent: "from-amber-500 to-orange-700",
    needsPlayerId: true,
    idLabel: "Character ID",
    idPlaceholder: "Enter your PUBG Mobile ID",
    denominations: [
      { id: "p1", label: "60 UC", price: 1 },
      { id: "p2", label: "325 UC", price: 5 },
      { id: "p3", label: "660 UC", price: 10 },
      { id: "p4", label: "1800 UC", price: 25 },
      { id: "p5", label: "3850 UC", price: 50, bonus: "+5%" },
      { id: "p6", label: "8100 UC", price: 100, bonus: "+10%" },
    ],
  },
  {
    slug: "valorant",
    name: "Valorant",
    publisher: "Riot Games",
    currency: "VP",
    tagline: "Unlock skins, agents and battle pass with Valorant Points.",
    image: valorant,
    accent: "from-rose-500 to-red-700",
    needsPlayerId: true,
    idLabel: "Riot ID #Tag",
    idPlaceholder: "Username#TAG",
    denominations: [
      { id: "v1", label: "475 VP", price: 5 },
      { id: "v2", label: "1000 VP", price: 10 },
      { id: "v3", label: "2050 VP", price: 20 },
      { id: "v4", label: "3650 VP", price: 35 },
      { id: "v5", label: "5350 VP", price: 50 },
      { id: "v6", label: "11000 VP", price: 100 },
    ],
  },
  {
    slug: "steam-wallet",
    name: "Steam Wallet",
    publisher: "Valve",
    currency: "USD Code",
    tagline: "Digital Steam wallet codes delivered to your email.",
    image: steam,
    accent: "from-sky-500 to-indigo-700",
    needsPlayerId: false,
    denominations: [
      { id: "s1", label: "$5 Steam Code", price: 5.5 },
      { id: "s2", label: "$10 Steam Code", price: 10.8 },
      { id: "s3", label: "$20 Steam Code", price: 21.5 },
      { id: "s4", label: "$50 Steam Code", price: 52 },
      { id: "s5", label: "$100 Steam Code", price: 103 },
    ],
  },
  {
    slug: "google-play",
    name: "Google Play",
    publisher: "Google",
    currency: "Gift Code",
    tagline: "Google Play gift codes for apps, games and subscriptions.",
    image: gplay,
    accent: "from-emerald-500 to-teal-600",
    needsPlayerId: false,
    denominations: [
      { id: "g1", label: "$10 Gift Code", price: 10.5 },
      { id: "g2", label: "$25 Gift Code", price: 25.8 },
      { id: "g3", label: "$50 Gift Code", price: 51 },
      { id: "g4", label: "$100 Gift Code", price: 101 },
    ],
  },
];

export const getProduct = (slug: string) =>
  PRODUCTS.find((p) => p.slug === slug);

export const WHATSAPP_NUMBER = "917679393645";
export const WHATSAPP_LINK = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
  "Hi Fatui Market, I need help with my order."
)}`;
export const CONTACT_PHONE = "+91 76793 93645";
export const CONTACT_EMAIL = "fatuimarket@gmail.com";
export const FACEBOOK_LINK = "https://www.facebook.com/share/192oekurGU/";
export const INSTAGRAM_LINK = "https://www.instagram.com/everyday_store_official?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==";
export const TELEGRAM_LINK = "https://t.me/fatuimarket";
