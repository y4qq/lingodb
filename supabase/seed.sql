-- Test users for local dev. Runs after migrations on every `yarn db:reset`.
-- Password for both accounts: password123
--
-- We insert straight into auth.users + auth.identities (the canonical SQL-seed
-- path, since the admin API isn't available from seed.sql), then explicitly
-- create matching public.users rows (profile provisioning is done in the app
-- layer now, so there's no trigger to do it for us). Finally we flip admin1
-- to 'admin'.

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

  insert into public.users (id, email) values
    (admin_id, 'admin1@test.com'),
    (user_id,  'user1@test.com');

  update public.users set role = 'admin' where id = admin_id;
end $$;

-- Minimal content so the new tables aren't empty after reset. All rows are
-- unpublished; anon users see nothing until is_published is flipped up the
-- chain. Runs as postgres, bypassing RLS.
do $$
declare
  lang_en          uuid := '33333333-3333-3333-3333-333333333301';
  lang_th          uuid := '33333333-3333-3333-3333-333333333302';
  course_id        uuid := '44444444-4444-4444-4444-444444444401';
  pack_id          uuid := '55555555-5555-5555-5555-555555555501';
  lesson_id        uuid := '66666666-6666-6666-6666-666666666601';
  audio_version_id uuid := '77777777-7777-7777-7777-777777777701';
begin
  insert into public.languages (id, code, name) values
    (lang_en, 'en', 'English'),
    (lang_th, 'th', 'Thai');

  insert into public.courses
    (id, base_language_id, target_language_id, slug, title, description)
  values
    (course_id, lang_en, lang_th, 'thai-for-english-speakers',
     'Thai for English Speakers', 'Seed course. Unpublished by default.');

  insert into public.packs (id, course_id, slug, title, description, position)
  values (pack_id, course_id, 'pack-1', 'Pack 1', 'Seed pack.', 1);

  insert into public.lessons (id, pack_id, slug, title, description, position)
  values (lesson_id, pack_id, 'lesson-1', 'Lesson 1', 'Seed lesson.', 1);

  insert into public.lesson_audio_versions
    (id, lesson_id, label, audio_path, is_current)
  values
    (audio_version_id, lesson_id, 'v1', 'lessons/seed/v1.mp3', true);
end $$;
