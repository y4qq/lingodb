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
  admin_id uuid := '11111111-1111-4111-8111-111111111111';
  user_id  uuid := '22222222-2222-4222-8222-222222222222';
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
  lang_en          uuid := '33333333-3333-4333-8333-333333333301';
  lang_th          uuid := '33333333-3333-4333-8333-333333333302';
  lang_es          uuid := '33333333-3333-4333-8333-333333333303';
  lang_fr          uuid := '33333333-3333-4333-8333-333333333304';
  lang_ja          uuid := '33333333-3333-4333-8333-333333333305';
  lang_de          uuid := '33333333-3333-4333-8333-333333333306';
  lang_it          uuid := '33333333-3333-4333-8333-333333333307';
  lang_pt          uuid := '33333333-3333-4333-8333-333333333308';
  course_id        uuid := '44444444-4444-4444-8444-444444444401';
  unit_id          uuid := '55555555-5555-4555-8555-555555555501';
  lesson_id        uuid := '66666666-6666-4666-8666-666666666601';
  audio_version_id uuid := '77777777-7777-4777-8777-777777777701';
begin
  insert into public.languages (id, code, name) values
    (lang_en, 'en', 'English'),
    (lang_th, 'th', 'Thai'),
    (lang_es, 'es', 'Spanish'),
    (lang_fr, 'fr', 'French'),
    (lang_ja, 'ja', 'Japanese'),
    (lang_de, 'de', 'German'),
    (lang_it, 'it', 'Italian'),
    (lang_pt, 'pt', 'Portuguese');

  insert into public.courses
    (id, base_language_id, target_language_id, slug, title, description,
     is_published)
  values
    -- Original Thai course kept so downstream seed rows (unit, lesson,
    -- audio) still reference it.
    (course_id, lang_en, lang_th, 'thai-for-english-speakers',
     'Thai for English Speakers',
     'Everyday spoken Thai for English speakers, from first hellos to confident conversations.',
     true),
    -- Courses for English speakers.
    ('44444444-4444-4444-8444-444444444402', lang_en, lang_es,
     'spanish-for-english-speakers',  'Spanish for English Speakers',  null, true),
    ('44444444-4444-4444-8444-444444444403', lang_en, lang_fr,
     'french-for-english-speakers',   'French for English Speakers',   null, true),
    ('44444444-4444-4444-8444-444444444404', lang_en, lang_ja,
     'japanese-for-english-speakers', 'Japanese for English Speakers', null, true),
    ('44444444-4444-4444-8444-444444444405', lang_en, lang_de,
     'german-for-english-speakers',   'German for English Speakers',   null, true),
    -- Courses for Spanish speakers.
    ('44444444-4444-4444-8444-444444444406', lang_es, lang_en,
     'english-for-spanish-speakers',    'English for Spanish Speakers',    null, true),
    ('44444444-4444-4444-8444-444444444407', lang_es, lang_it,
     'italian-for-spanish-speakers',    'Italian for Spanish Speakers',    null, true),
    ('44444444-4444-4444-8444-444444444408', lang_es, lang_pt,
     'portuguese-for-spanish-speakers', 'Portuguese for Spanish Speakers', null, true),
    ('44444444-4444-4444-8444-444444444409', lang_es, lang_fr,
     'french-for-spanish-speakers',     'French for Spanish Speakers',     null, true);

  insert into public.units
    (id, course_id, slug, title, description, position, is_published)
  values
    (unit_id, course_id, 'unit-1',
     'Greetings & Introductions',
     'Polite greetings, introductions, and everyday courtesies.',
     1, true),
    ('55555555-5555-4555-8555-555555555502', course_id, 'unit-2',
     'Numbers, Time & Dates',
     'Count, tell time, and talk about days and dates.',
     2, true),
    ('55555555-5555-4555-8555-555555555503', course_id, 'unit-3',
     'Everyday Conversations',
     'Foundational sentences for day-to-day casual chats.',
     3, true),
    ('55555555-5555-4555-8555-555555555504', course_id, 'unit-4',
     'Food & Ordering',
     'Read menus, order dishes, and describe tastes.',
     4, true),
    ('55555555-5555-4555-8555-555555555505', course_id, 'unit-5',
     'Getting Around',
     'Ask for directions and handle taxis and public transport.',
     5, true),
    ('55555555-5555-4555-8555-555555555506', course_id, 'unit-6',
     'Shopping & Bargaining',
     'Browse markets, talk prices, and negotiate politely.',
     6, true),
    ('55555555-5555-4555-8555-555555555507', course_id, 'unit-7',
     'Travel & Accommodation',
     'Check into hotels, book tickets, and handle travel basics.',
     7, true),
    ('55555555-5555-4555-8555-555555555508', course_id, 'unit-8',
     'Feelings & Small Talk',
     'Share opinions, feelings, and make easy small talk.',
     8, true);

  insert into public.lessons
    (id, unit_id, slug, title, description, position, is_published)
  values
    -- Unit 1: Greetings & Introductions
    (lesson_id, unit_id, 'lesson-1',
     'Hello, Thank You & Goodbye',
     'Essential polite phrases you''ll use every day.',
     1, true),
    ('66666666-6666-4666-8666-666666666602', unit_id, 'lesson-2',
     'Introducing Yourself',
     'Share your name, where you''re from, and how you''re doing.',
     2, true),
    ('66666666-6666-4666-8666-666666666603', unit_id, 'lesson-3',
     'Pronouns & Formality',
     'Know when to use formal and casual pronouns.',
     3, true),
    ('66666666-6666-4666-8666-666666666604', unit_id, 'lesson-4',
     'Asking Simple Questions',
     'Ask short questions to keep a conversation going.',
     4, true),
    -- Unit 2: Numbers, Time & Dates
    ('66666666-6666-4666-8666-666666666605',
     '55555555-5555-4555-8555-555555555502', 'lesson-1',
     'Numbers 1 to 100',
     'Count confidently from one to one hundred.',
     1, true),
    ('66666666-6666-4666-8666-666666666606',
     '55555555-5555-4555-8555-555555555502', 'lesson-2',
     'Telling the Time',
     'Ask and answer what time it is.',
     2, true),
    ('66666666-6666-4666-8666-666666666607',
     '55555555-5555-4555-8555-555555555502', 'lesson-3',
     'Days & Months',
     'Name the days, months, and plan ahead.',
     3, true),
    ('66666666-6666-4666-8666-666666666608',
     '55555555-5555-4555-8555-555555555502', 'lesson-4',
     'Prices & Quantities',
     'Understand prices and talk about how many.',
     4, true),
    -- Unit 3: Everyday Conversations
    ('66666666-6666-4666-8666-666666666609',
     '55555555-5555-4555-8555-555555555503', 'lesson-1',
     'At the Coffee Shop',
     'Order drinks and make small talk with the barista.',
     1, true),
    ('66666666-6666-4666-8666-666666666610',
     '55555555-5555-4555-8555-555555555503', 'lesson-2',
     'Making Plans',
     'Agree on a time and place to meet a friend.',
     2, true),
    ('66666666-6666-4666-8666-666666666611',
     '55555555-5555-4555-8555-555555555503', 'lesson-3',
     'Talking About Work',
     'Describe your job and ask about someone else''s.',
     3, true),
    ('66666666-6666-4666-8666-666666666612',
     '55555555-5555-4555-8555-555555555503', 'lesson-4',
     'Weather & Seasons',
     'Chat about weather, heat, and the Thai seasons.',
     4, true),
    -- Unit 4: Food & Ordering
    ('66666666-6666-4666-8666-666666666613',
     '55555555-5555-4555-8555-555555555504', 'lesson-1',
     'Reading a Thai Menu',
     'Recognize common Thai dishes and ingredients.',
     1, true),
    ('66666666-6666-4666-8666-666666666614',
     '55555555-5555-4555-8555-555555555504', 'lesson-2',
     'Ordering at a Restaurant',
     'Order, make changes, and pay the bill.',
     2, true),
    ('66666666-6666-4666-8666-666666666615',
     '55555555-5555-4555-8555-555555555504', 'lesson-3',
     'Spice & Flavor',
     'Describe spicy, sweet, salty, and sour preferences.',
     3, true),
    ('66666666-6666-4666-8666-666666666616',
     '55555555-5555-4555-8555-555555555504', 'lesson-4',
     'Street Food Classics',
     'Talk about popular street food with confidence.',
     4, true),
    -- Unit 5: Getting Around
    ('66666666-6666-4666-8666-666666666617',
     '55555555-5555-4555-8555-555555555505', 'lesson-1',
     'Asking for Directions',
     'Understand left, right, straight, and landmarks.',
     1, true),
    ('66666666-6666-4666-8666-666666666618',
     '55555555-5555-4555-8555-555555555505', 'lesson-2',
     'Taxis & Ride-Hailing',
     'Hail a taxi and confirm the destination and fare.',
     2, true),
    ('66666666-6666-4666-8666-666666666619',
     '55555555-5555-4555-8555-555555555505', 'lesson-3',
     'Public Transport',
     'Use the BTS, MRT, and buses like a local.',
     3, true),
    ('66666666-6666-4666-8666-666666666620',
     '55555555-5555-4555-8555-555555555505', 'lesson-4',
     'Common Travel Problems',
     'Handle delays, lost items, and quick help.',
     4, true),
    -- Unit 6: Shopping & Bargaining
    ('66666666-6666-4666-8666-666666666621',
     '55555555-5555-4555-8555-555555555506', 'lesson-1',
     'Sizes, Colors & Styles',
     'Describe what you''re looking for when shopping.',
     1, true),
    ('66666666-6666-4666-8666-666666666622',
     '55555555-5555-4555-8555-555555555506', 'lesson-2',
     'Negotiating Prices',
     'Ask for discounts politely at markets and stalls.',
     2, true),
    ('66666666-6666-4666-8666-666666666623',
     '55555555-5555-4555-8555-555555555506', 'lesson-3',
     'Paying & Change',
     'Handle cash, coins, and card payments smoothly.',
     3, true),
    ('66666666-6666-4666-8666-666666666624',
     '55555555-5555-4555-8555-555555555506', 'lesson-4',
     'Returns & Complaints',
     'Explain a problem and ask for a refund or swap.',
     4, true),
    -- Unit 7: Travel & Accommodation
    ('66666666-6666-4666-8666-666666666625',
     '55555555-5555-4555-8555-555555555507', 'lesson-1',
     'Checking Into a Hotel',
     'Confirm bookings and ask for room essentials.',
     1, true),
    ('66666666-6666-4666-8666-666666666626',
     '55555555-5555-4555-8555-555555555507', 'lesson-2',
     'Booking Tickets',
     'Reserve trains, buses, or flights in Thai.',
     2, true),
    ('66666666-6666-4666-8666-666666666627',
     '55555555-5555-4555-8555-555555555507', 'lesson-3',
     'Emergencies & Health',
     'Ask for a doctor, pharmacy, or hospital.',
     3, true),
    ('66666666-6666-4666-8666-666666666628',
     '55555555-5555-4555-8555-555555555507', 'lesson-4',
     'Visiting Temples',
     'Use polite language at temples and sacred sites.',
     4, true),
    -- Unit 8: Feelings & Small Talk
    ('66666666-6666-4666-8666-666666666629',
     '55555555-5555-4555-8555-555555555508', 'lesson-1',
     'Describing How You Feel',
     'Share feelings and reactions in simple sentences.',
     1, true),
    ('66666666-6666-4666-8666-666666666630',
     '55555555-5555-4555-8555-555555555508', 'lesson-2',
     'Likes & Dislikes',
     'Talk about food, music, and hobbies you enjoy.',
     2, true),
    ('66666666-6666-4666-8666-666666666631',
     '55555555-5555-4555-8555-555555555508', 'lesson-3',
     'Family & Friends',
     'Introduce family members and close friends.',
     3, true),
    ('66666666-6666-4666-8666-666666666632',
     '55555555-5555-4555-8555-555555555508', 'lesson-4',
     'Saying Goodbye & Staying in Touch',
     'Wrap up and plan to meet again.',
     4, true);

  insert into public.lesson_audio_versions
    (id, lesson_id, label, audio_path, is_current)
  values
    (audio_version_id, lesson_id, 'v1', 'lessons/seed/v1.mp3', true);
end $$;
