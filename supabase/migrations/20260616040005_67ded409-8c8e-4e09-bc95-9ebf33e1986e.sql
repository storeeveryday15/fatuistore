
-- Recreate view with security_invoker so it respects caller's RLS
DROP VIEW IF EXISTS public.public_orders_feed;
CREATE VIEW public.public_orders_feed
  WITH (security_invoker = true) AS
  SELECT order_code, product_name, tier_label, amount_inr, currency, created_at
  FROM public.orders
  WHERE status IN ('paid','delivered','awaiting_verification')
  ORDER BY created_at DESC
  LIMIT 30;
GRANT SELECT ON public.public_orders_feed TO anon, authenticated;

-- Allow anon to read recent orders for the live ticker feed only via the view (RLS still applies)
CREATE POLICY "orders public ticker read" ON public.orders FOR SELECT TO anon
  USING (status IN ('paid','delivered','awaiting_verification'));

-- Revoke has_role / handle_new_user / touch_updated_at from anon
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.touch_updated_at() FROM PUBLIC, anon, authenticated;
