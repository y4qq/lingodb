-- Hand-written companion to 20260420145425_left_bullseye.sql.
-- Contains the bits Drizzle can't express: SECURITY DEFINER helpers,
-- triggers that touch auth.*, and RLS policies.

-- is_admin helper: SECURITY DEFINER so RLS policies can call it without
-- granting direct SELECT on public.users to the caller's role.
CREATE OR REPLACE FUNCTION public.is_admin(uid uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users
    WHERE id = uid AND role = 'admin'
  );
$$;

REVOKE ALL ON FUNCTION public.is_admin(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_admin(uuid) TO authenticated;

-- Generic set_updated_at trigger function, reused by every table with updated_at.
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER users_set_updated_at
BEFORE UPDATE ON public.users
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

-- Mirror new auth.users rows into public.users. SECURITY DEFINER bypasses RLS,
-- which is why no INSERT policy on public.users is required for normal signup.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.users (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();

-- RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_select_own_or_admin"
ON public.users
FOR SELECT
TO authenticated
USING (auth.uid() = id OR public.is_admin(auth.uid()));

CREATE POLICY "users_update_own"
ON public.users
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);
