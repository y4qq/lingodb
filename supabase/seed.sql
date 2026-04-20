-- Test users for local dev. Runs after migrations on every `yarn db:reset`.
-- Password for both accounts: password123
--
-- We insert straight into auth.users + auth.identities (the canonical SQL-seed
-- path, since the admin API isn't available from seed.sql). The
-- on_auth_user_created trigger populates public.users with role='user'; we
-- flip admin1 to 'admin' at the end.

do $$
declare
  admin_id uuid := '11111111-1111-1111-1111-111111111111';
  user_id  uuid := '22222222-2222-2222-2222-222222222222';
  pw       text := extensions.crypt('Password123', extensions.gen_salt('bf'));
begin
  insert into auth.users (
    instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
    created_at, updated_at,
    confirmation_token, email_change, email_change_token_new, recovery_token
  ) values
    ('00000000-0000-0000-0000-000000000000', admin_id,
     'authenticated', 'authenticated', 'admin1@test.com', pw, now(),
     '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb,
     now(), now(), '', '', '', ''),
    ('00000000-0000-0000-0000-000000000000', user_id,
     'authenticated', 'authenticated', 'user1@test.com', pw, now(),
     '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb,
     now(), now(), '', '', '', '');

  insert into auth.identities (
    id, user_id, identity_data, provider, provider_id,
    last_sign_in_at, created_at, updated_at
  ) values
    (gen_random_uuid(), admin_id,
     jsonb_build_object('sub', admin_id::text, 'email', 'admin1@test.com'),
     'email', admin_id::text, now(), now(), now()),
    (gen_random_uuid(), user_id,
     jsonb_build_object('sub', user_id::text, 'email', 'user1@test.com'),
     'email', user_id::text, now(), now(), now());

  update public.users set role = 'admin' where id = admin_id;
end $$;
