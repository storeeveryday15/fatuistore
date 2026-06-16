This is a big set of features. Here's how I'll ship it in one go. A few items need your input before I start — see "Decisions needed" at the end.

## 1. Enable Lovable Cloud (backend)
Required for orders, auth, admin panel, customer dashboard, notifications, and live chat history. I'll enable it as the first step.

## 2. New logo
Save the uploaded image as the site logo and use it in the header, footer, and favicon. Update page title metadata to match the brand.

## 3. Updated MLBB pricing
Replace the MLBB product with your new tiers (all INR):
- Diamonds: 5 / 10+1 / 20+2 / 51+5 / 102+10 / 203+20 / 303+33 / 504+66 / 1007+156 / 2015+383 / 5035+1007
- First Top-Up: 50+5 / 150+15 / 250+25 / 500+65
- Weekly Diamond Pass: ₹150.55
Each tier shows its exact ₹ amount and generates a UPI QR with that amount pre-filled (UPI ID `7679393645@kotakbank`, name Lakpa Tamang).

## 4. Checkout + payment verification (no WhatsApp required)
New checkout flow:
1. Customer picks a product + tier, enters game ID / contact.
2. System creates an `order` row with a short Order ID (e.g. `FM-7K3QX9`) and status `pending_payment`.
3. Indian users see the UPI QR + "Pay with UPI" button. International users see PayPal / Card placeholder buttons (non-functional placeholders until you connect a real provider).
4. After paying, customer enters the UPI transaction reference (UTR) on the order page. Status moves to `awaiting_verification`.
5. Admin verifies in admin panel → status becomes `paid` → then `delivered`.
WhatsApp button stays as optional support, not as the payment path.

## 5. Customer accounts + dashboard
- Email/password sign-up & login (Lovable Cloud auth, auto-confirm enabled so no email setup needed).
- `/dashboard` route: lists the signed-in user's orders with Order ID, product, amount, status, date, and a detail page to re-show QR / submit UTR / view delivery info.

## 6. Admin panel
- `/admin` route protected by an `admin` role (separate `user_roles` table + `has_role` function, per security best practice).
- Tabs: Orders (all), Payments (verify UTR, mark paid/refunded), Users.
- I'll seed your account as admin once you tell me which email to use.

## 7. Live orders ticker (blurred)
Under the "Fatui Market" hero word, a horizontally scrolling ticker of recent orders: "FM-7K3QX9 • MLBB 102+10 • ₹176.97 • 2m ago" — names blurred with CSS `filter: blur` + low opacity for social proof.

## 8. Live chat bot
Floating chat widget bottom-right. Rule-based bot (instant replies for common questions: pricing, delivery time, payment help, refund). Escalate-to-human option that creates a `support_message` row visible in admin panel. No AI cost unless you want me to wire Lovable AI Gateway for free-form answers — say the word and I'll add it.

## 9. Order notifications (Telegram + Email)
A Cloud edge function fires on new orders:
- **Telegram**: sends to your bot. You'll need to create a bot via @BotFather and give me the bot token + your chat ID (DM the bot, I'll show you how to grab the chat ID).
- **Email**: sends to `fatuimarket@gmail.com` via Resend (free tier). You'll need a Resend API key — free signup at resend.com.
I'll store both as secrets. If you'd rather skip one, tell me which.

## Technical notes
- DB tables: `profiles`, `user_roles` (enum: `admin`,`customer`), `orders`, `order_items`, `payments`, `support_messages`, `chat_messages`. All with RLS — customers see only their own rows; admins see all via `has_role`.
- Edge function: `notify-order` (Telegram + Resend) triggered from client after insert (or via DB webhook).
- Live ticker uses Cloud Realtime subscription on `orders` table.
- Payment placeholders for PayPal/Card render UI only; clicking shows "Coming soon — contact support" until you connect Stripe/Paddle. I can wire Stripe later in one step if you want real card payments.

## Decisions needed before I build
1. **Admin email** — which email should I grant admin role to? (Your account on the site.)
2. **Telegram bot token + chat ID** — do you have a bot yet, or want me to give you a 30-second setup guide first?
3. **Resend API key for email notifications** — okay to use Resend? (Free, no credit card.)
4. **PayPal / Card** — keep as "Coming soon" placeholders for now, or do you want me to enable real Stripe payments in this same change?

Reply with answers (or "go ahead with placeholders / I'll send keys after") and I'll start building.