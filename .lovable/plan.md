# Fatui Market — Complete Admin & Order System

## 1. Secrets (you'll re-enter via secure form, don't paste in chat again)
I'll request these via the secret tool — your earlier values were sent in plain chat, so for safety I'll prompt for fresh entries:
- `TELEGRAM_BOT_TOKEN`
- `TELEGRAM_CHAT_ID`
- `RESEND_API_KEY`
- `ADMIN_EMAIL` (the email your admin account uses)

**Recommendation:** rotate the bot token at @BotFather and the Resend key, since the originals were shared in plain text.

## 2. Auth Gate
- `/auth` page (sign up + login, email/password + Google).
- Profile fields: email, username, registration date (already in `profiles`; add `username`).
- **Gate the entire store**: move `/`, `/products/$slug`, `/orders/$code`, `/dashboard` under `_authenticated/`. Unauthenticated visitors land on `/auth`.
- Auto-grant `admin` role to the configured `ADMIN_EMAIL` via a DB trigger on `auth.users` insert + a one-time backfill.

## 3. Checkout Flow (two-step)
- **Step 1 — Details form** on product page: Username, Game UID, Server ID (optional), Email (prefilled), Package tier. QR is hidden.
- On "Continue to Payment" → create `order` row (status `pending_payment`) → navigate to `/orders/$code`.
- **Step 2 — Payment page**: dynamic UPI QR + amount + merchant name + "Upload payment screenshot" → status becomes `pending_verification`.

## 4. Database changes (new migration)
- `profiles`: add `username text unique`, `email text`.
- `orders`: add `server_id text`, `screenshot_url text`, `admin_notes text`, `completed_at timestamptz`, `rejected_at timestamptz`. Replace status vocabulary with: `pending_payment`, `pending_verification`, `processing`, `completed`, `rejected`.
- New storage bucket `payment-screenshots` (private). RLS: customer can insert/read own; admin can read all.
- Trigger `auto_grant_admin()` on `auth.users` insert: if `NEW.email = current_setting('app.admin_email', true)` grant admin role. Set GUC via migration using the env value; since GUCs don't read env, instead the trigger compares against a row in a `app_config(key,value)` table seeded with the admin email.
- Realtime: keep only safe ticker view; remove broad anon read (already locked down last turn).

## 5. Admin Panel `/admin` (admin role only)
- **Dashboard**: total orders, pending, completed, registered users, revenue today (sum `amount_inr` where status=completed today).
- **Users tab**: list profiles, search by username/email, registration date.
- **Orders tab**: table with username, game UID, product, amount, status, screenshot thumbnail. Filters by status, search by order code/email/UID.
- **Order detail drawer**: full info + screenshot preview + admin notes textarea + action buttons: Mark Pending / Processing / Completed / Rejected. Status change writes `completed_at`/`rejected_at`, fires notification.

## 6. Customer Dashboard `/dashboard`
- List of own orders with live status. Detail page shows status timeline, screenshot, admin notes when rejected.

## 7. Notifications
TanStack server function `notifyOrderEvent({ orderId, event })` called from admin status-change and order-create handlers. Sends:
- **Telegram** via Bot API `sendMessage` to `TELEGRAM_CHAT_ID` with order code, username, UID, package, ₹ amount, event type.
- **Email** via Resend to customer email — templates: order received, payment received, completed, rejected. Also CC `fatuimarket@gmail.com` for new orders.

## 8. Security
- All admin routes under `_authenticated/_admin/` layout with `has_role(uid,'admin')` check (server-fn gate + client UI hiding).
- Storage bucket private; signed URLs only for admin + owning customer.
- `user_roles` stays write-locked (existing).
- Validate all inputs with zod on both client and server fn.

## Files

**New**
- `src/routes/_authenticated/route.tsx` (integration-managed gate — confirm exists, else create)
- `src/routes/_authenticated/index.tsx` (move current home)
- `src/routes/_authenticated/products.$slug.tsx` (move)
- `src/routes/_authenticated/orders.$code.tsx` (move; adds screenshot upload)
- `src/routes/_authenticated/dashboard.tsx` (move)
- `src/routes/_authenticated/_admin/route.tsx` (admin gate)
- `src/routes/_authenticated/_admin/admin.tsx` (dashboard + tabs)
- `src/lib/orders.functions.ts` (createOrder, submitScreenshot, listMyOrders, adminListOrders, adminUpdateStatus)
- `src/lib/notify.server.ts` (telegram + resend senders)
- `src/lib/notify.functions.ts` (calls notify.server)
- `supabase/migrations/<ts>_admin_system.sql`

**Edited**
- `src/components/site-header.tsx` (auth state, hide admin link from non-admins, sign out)
- `src/routes/auth.tsx` (username field on signup)
- `src/routes/__root.tsx` (auth state listener if missing)

## Open questions
1. **Telegram credentials**: OK to set the secrets via secure form (recommend rotating first)? Reply "yes" or "use what I sent".
2. **Admin email**: which exact email should auto-receive admin role? (e.g. `fatuimarket@gmail.com`?)
3. **Resend "from" address**: I'll use `Fatui Market <onboarding@resend.dev>` until you verify a domain — OK?
4. **Existing orders** in DB: keep, or wipe and start fresh with the new status vocabulary?

Once you answer, I'll build it end-to-end.
