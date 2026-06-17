
-- 1) profiles columns
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS username text,
  ADD COLUMN IF NOT EXISTS email text;
CREATE UNIQUE INDEX IF NOT EXISTS profiles_username_unique ON public.profiles (lower(username)) WHERE username IS NOT NULL;

-- 2) orders columns
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS server_id text,
  ADD COLUMN IF NOT EXISTS player_name text,
  ADD COLUMN IF NOT EXISTS screenshot_url text,
  ADD COLUMN IF NOT EXISTS admin_notes text,
  ADD COLUMN IF NOT EXISTS completed_at timestamptz,
  ADD COLUMN IF NOT EXISTS rejected_at timestamptz,
  ADD COLUMN IF NOT EXISTS processing_at timestamptz;

-- 3) app_config table (admin email stored here so the trigger can read it)
CREATE TABLE IF NOT EXISTS public.app_config (
  key text PRIMARY KEY,
  value text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.app_config TO authenticated;
GRANT ALL ON public.app_config TO service_role;
ALTER TABLE public.app_config ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "app_config admin read" ON public.app_config;
CREATE POLICY "app_config admin read" ON public.app_config FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- seed admin email placeholder; updated via insert tool later
INSERT INTO public.app_config (key, value) VALUES ('admin_email', '')
ON CONFLICT (key) DO NOTHING;

-- 4) handle_new_user upgraded: store email/username and auto-grant admin if email matches app_config.admin_email
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_admin_email text;
BEGIN
  INSERT INTO public.profiles (id, display_name, username, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.raw_user_meta_data->>'username', split_part(NEW.email,'@',1)),
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email,'@',1)),
    NEW.email
  )
  ON CONFLICT (id) DO UPDATE
    SET email = EXCLUDED.email,
        username = COALESCE(public.profiles.username, EXCLUDED.username),
        display_name = COALESCE(public.profiles.display_name, EXCLUDED.display_name);

  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'customer')
  ON CONFLICT DO NOTHING;

  SELECT value INTO v_admin_email FROM public.app_config WHERE key = 'admin_email';
  IF v_admin_email IS NOT NULL AND v_admin_email <> '' AND lower(NEW.email) = lower(v_admin_email) THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin')
    ON CONFLICT DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$;

-- ensure trigger exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 5) storage policies for payment-screenshots bucket (bucket created via tool separately)
DROP POLICY IF EXISTS "payment screenshots customer upload" ON storage.objects;
CREATE POLICY "payment screenshots customer upload" ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'payment-screenshots'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

DROP POLICY IF EXISTS "payment screenshots owner read" ON storage.objects;
CREATE POLICY "payment screenshots owner read" ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'payment-screenshots'
  AND ((storage.foldername(name))[1] = auth.uid()::text OR public.has_role(auth.uid(), 'admin'))
);

DROP POLICY IF EXISTS "payment screenshots owner delete" ON storage.objects;
CREATE POLICY "payment screenshots owner delete" ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'payment-screenshots'
  AND ((storage.foldername(name))[1] = auth.uid()::text OR public.has_role(auth.uid(), 'admin'))
);
