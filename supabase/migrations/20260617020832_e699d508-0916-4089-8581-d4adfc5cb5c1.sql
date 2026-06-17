-- Drop the overly permissive ticker policy that exposed PII (email, contact, UTR, game_id)
DROP POLICY IF EXISTS "orders public ticker read" ON public.orders;

-- Create a safe public view exposing only non-sensitive columns for the live ticker
CREATE OR REPLACE VIEW public.public_orders_feed
WITH (security_invoker = true) AS
SELECT
  order_code,
  product_name,
  tier_label,
  amount_inr,
  currency,
  created_at
FROM public.orders
WHERE status IN ('paid','delivered','awaiting_verification')
ORDER BY created_at DESC
LIMIT 50;

-- The view is security_invoker, so it respects the caller's RLS on orders.
-- Add a narrow anon SELECT policy on orders that ONLY works through the view's
-- column projection (anon still cannot select * because no broad policy exists;
-- but the view needs a base-table SELECT permission to function).
CREATE POLICY "orders ticker view base read"
ON public.orders
FOR SELECT
TO anon
USING (status IN ('paid','delivered','awaiting_verification'));

-- Note: even though anon can SELECT base rows matching the above, we use column
-- grants to ensure anon can only read non-sensitive columns directly.
REVOKE SELECT ON public.orders FROM anon;
GRANT SELECT (order_code, product_name, tier_label, amount_inr, currency, created_at, status)
  ON public.orders TO anon;

GRANT SELECT ON public.public_orders_feed TO anon, authenticated;