-- Test users for local dev. Runs after migrations on every `yarn db:reset`.
-- Password for every account: Password123
--
-- We insert straight into auth.users + auth.identities (the canonical SQL-seed
-- path, since the admin API isn't available from seed.sql), then explicitly
-- create matching public.users rows with display names so the app-layer
-- profile provisioning isn't needed here. Finally we flip admin1 to 'admin'.

do $$
declare
  admin_id uuid := '11111111-1111-4111-8111-111111111111';
  user1_id uuid := '22222222-2222-4222-8222-222222222201';
  user2_id uuid := '22222222-2222-4222-8222-222222222202';
  user3_id uuid := '22222222-2222-4222-8222-222222222203';
  user4_id uuid := '22222222-2222-4222-8222-222222222204';
  user5_id uuid := '22222222-2222-4222-8222-222222222205';
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
    ('00000000-0000-0000-0000-000000000000', user1_id,
     'authenticated', 'authenticated', 'user1@test.com', pw, now(),
     '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb,
     now(), now(), '', '', '', ''),
    ('00000000-0000-0000-0000-000000000000', user2_id,
     'authenticated', 'authenticated', 'user2@test.com', pw, now(),
     '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb,
     now(), now(), '', '', '', ''),
    ('00000000-0000-0000-0000-000000000000', user3_id,
     'authenticated', 'authenticated', 'user3@test.com', pw, now(),
     '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb,
     now(), now(), '', '', '', ''),
    ('00000000-0000-0000-0000-000000000000', user4_id,
     'authenticated', 'authenticated', 'user4@test.com', pw, now(),
     '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb,
     now(), now(), '', '', '', ''),
    ('00000000-0000-0000-0000-000000000000', user5_id,
     'authenticated', 'authenticated', 'user5@test.com', pw, now(),
     '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb,
     now(), now(), '', '', '', '');

  insert into auth.identities (
    id, user_id, identity_data, provider, provider_id,
    last_sign_in_at, created_at, updated_at
  ) values
    (gen_random_uuid(), admin_id,
     jsonb_build_object('sub', admin_id::text, 'email', 'admin1@test.com'),
     'email', admin_id::text, now(), now(), now()),
    (gen_random_uuid(), user1_id,
     jsonb_build_object('sub', user1_id::text, 'email', 'user1@test.com'),
     'email', user1_id::text, now(), now(), now()),
    (gen_random_uuid(), user2_id,
     jsonb_build_object('sub', user2_id::text, 'email', 'user2@test.com'),
     'email', user2_id::text, now(), now(), now()),
    (gen_random_uuid(), user3_id,
     jsonb_build_object('sub', user3_id::text, 'email', 'user3@test.com'),
     'email', user3_id::text, now(), now(), now()),
    (gen_random_uuid(), user4_id,
     jsonb_build_object('sub', user4_id::text, 'email', 'user4@test.com'),
     'email', user4_id::text, now(), now(), now()),
    (gen_random_uuid(), user5_id,
     jsonb_build_object('sub', user5_id::text, 'email', 'user5@test.com'),
     'email', user5_id::text, now(), now(), now());

  insert into public.users (id, email, display_name, onboarded_at) values
    (admin_id, 'admin1@test.com', 'Nina Thanakit',    now()),
    (user1_id, 'user1@test.com',  'Alex Parker',      now()),
    (user2_id, 'user2@test.com',  'Ben Nakamura',     now()),
    (user3_id, 'user3@test.com',  'Clara Rodriguez',  now()),
    (user4_id, 'user4@test.com',  'Dara Okafor',      now()),
    (user5_id, 'user5@test.com',  'Eva Lindgren',     now());

  update public.users set role = 'admin' where id = admin_id;
end $$;

-- Minimal content so the new tables aren't empty after reset. All rows are
-- unpublished; anon users see nothing until is_published is flipped up the
-- chain. Runs as postgres, bypassing RLS.
--
-- The Thai-for-English course is organised by situation: each unit is one
-- real-life scenario, each lesson is a ~10-minute chapter of that scenario.
-- Units are ordered to roughly mirror the trajectory of a first visit: arrive,
-- settle in, eat, get around, shop, make friends, go out, then cope when
-- something goes wrong.
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
  first_lesson_id  uuid := '66666666-6666-4666-8666-666666666101';
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
    (course_id, lang_en, lang_th, 'thai-for-english-speakers',
     'Thai for English Speakers',
     'Situational spoken Thai for English speakers — real scenarios from your first taxi to a night out with friends.',
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
     'Arriving in Thailand',
     'Your first few hours: immigration, bags, a taxi, and getting to your hotel.',
     1, true),
    ('55555555-5555-4555-8555-555555555502', course_id, 'unit-2',
     'Settling Into Your Stay',
     'Hotel life — rooms, reception, breakfast, laundry, late checkout.',
     2, true),
    ('55555555-5555-4555-8555-555555555503', course_id, 'unit-3',
     'Eating Out in Bangkok',
     'A full meal from picking a spot to paying the bill.',
     3, true),
    ('55555555-5555-4555-8555-555555555504', course_id, 'unit-4',
     'Getting Around the City',
     'Taxis, ride-hailing apps, the BTS and MRT, and stopping strangers for directions.',
     4, true),
    ('55555555-5555-4555-8555-555555555505', course_id, 'unit-5',
     'A Day at the Market',
     'Browsing, asking prices, bargaining politely, and grabbing street food.',
     5, true),
    ('55555555-5555-4555-8555-555555555506', course_id, 'unit-6',
     'Making Friends',
     'From first hello to swapping Line IDs and planning to meet again.',
     6, true),
    ('55555555-5555-4555-8555-555555555507', course_id, 'unit-7',
     'A Night Out',
     'A whole evening with friends — planning, bar, drinks, toasts, toilets, heading home.',
     7, true),
    ('55555555-5555-4555-8555-555555555508', course_id, 'unit-8',
     'When Things Go Wrong',
     'Lost items, feeling unwell, the pharmacy, the doctor, and tourist police.',
     8, true);

  insert into public.lessons
    (id, unit_id, slug, title, description, icon, position, is_published)
  values
    -- Unit 1: Arriving in Thailand
    (first_lesson_id,
     unit_id, 'immigration',
     'At Immigration',
     'Greet the officer, confirm the reason for your visit, and answer a few basic questions.',
     '🛂', 1, true),
    ('66666666-6666-4666-8666-666666666102', unit_id, 'baggage-claim',
     'Collecting Your Bags',
     'Find your bag, ask staff for help, and file a quick report if one is missing.',
     '🧳', 2, true),
    ('66666666-6666-4666-8666-666666666103', unit_id, 'taxi-rank',
     'Finding the Taxi Rank',
     'Skip the touts, find the official taxi queue, and make sure the meter is on.',
     '🚖', 3, true),
    ('66666666-6666-4666-8666-666666666104', unit_id, 'driver-small-talk',
     'Small Talk with the Driver',
     'Weather, traffic, and "is this your first time in Thailand?" — the classics.',
     '💬', 4, true),
    ('66666666-6666-4666-8666-666666666105', unit_id, 'hotel-check-in',
     'Checking In at the Hotel',
     'Confirm the booking, hand over your passport, and get the Wi-Fi password.',
     '🏨', 5, true),

    -- Unit 2: Settling Into Your Stay
    ('66666666-6666-4666-8666-666666666201',
     '55555555-5555-4555-8555-555555555502', 'room-amenities',
     'Your Room & Amenities',
     'Figure out the A/C, find the kettle, and decode the minibar price list.',
     '🛏️', 1, true),
    ('66666666-6666-4666-8666-666666666202',
     '55555555-5555-4555-8555-555555555502', 'reception-help',
     'Calling Reception for Help',
     'Request extra towels, report a broken light, ask for a local recommendation.',
     '☎️', 2, true),
    ('66666666-6666-4666-8666-666666666203',
     '55555555-5555-4555-8555-555555555502', 'breakfast',
     'Asking About Breakfast',
     'Find out the time, the location, and what''s actually included.',
     '🍳', 3, true),
    ('66666666-6666-4666-8666-666666666204',
     '55555555-5555-4555-8555-555555555502', 'laundry',
     'Getting Laundry Done',
     'Hotel laundry vs the neighbourhood shop — how long, how much, how it works.',
     '🧺', 4, true),
    ('66666666-6666-4666-8666-666666666205',
     '55555555-5555-4555-8555-555555555502', 'late-checkout',
     'Arranging a Late Checkout',
     'Negotiate an extra hour or two at the desk without being That Guest.',
     '🕛', 5, true),

    -- Unit 3: Eating Out in Bangkok
    ('66666666-6666-4666-8666-666666666301',
     '55555555-5555-4555-8555-555555555503', 'finding-a-spot',
     'Finding a Place to Eat',
     'Ask a local what''s good nearby and how long the walk is.',
     '📍', 1, true),
    ('66666666-6666-4666-8666-666666666302',
     '55555555-5555-4555-8555-555555555503', 'getting-seated',
     'Being Seated & Getting a Menu',
     'Table for two, please — and an English menu if they have one.',
     '🪑', 2, true),
    ('66666666-6666-4666-8666-666666666303',
     '55555555-5555-4555-8555-555555555503', 'ordering-drinks',
     'Ordering Drinks',
     'Water, beer, Thai iced tea, fresh juice — every setting you''ll order in.',
     '🥤', 3, true),
    ('66666666-6666-4666-8666-666666666304',
     '55555555-5555-4555-8555-555555555503', 'ordering-food',
     'Ordering Food & Spice Level',
     'Pick a dish and tell them how spicy you actually mean — not "Thai spicy".',
     '🍛', 4, true),
    ('66666666-6666-4666-8666-666666666305',
     '55555555-5555-4555-8555-555555555503', 'recommendations',
     'Asking for Recommendations',
     'Get the server''s honest take on the house special without being pushy.',
     '⭐', 5, true),
    ('66666666-6666-4666-8666-666666666306',
     '55555555-5555-4555-8555-555555555503', 'paying-the-bill',
     'Paying the Bill',
     'Ask for the check, split it, round the tip, say the magic thank-you.',
     '💳', 6, true),

    -- Unit 4: Getting Around the City
    ('66666666-6666-4666-8666-666666666401',
     '55555555-5555-4555-8555-555555555504', 'hailing-a-taxi',
     'Hailing a Taxi',
     'Flag one, confirm the meter, and settle in — all in one clean exchange.',
     '🚕', 1, true),
    ('66666666-6666-4666-8666-666666666402',
     '55555555-5555-4555-8555-555555555504', 'giving-directions',
     'Giving Directions to the Driver',
     'Lead with the landmark, not the street — it''s how Thai drivers think about the city.',
     '🗺️', 2, true),
    ('66666666-6666-4666-8666-666666666403',
     '55555555-5555-4555-8555-555555555504', 'grab-bolt',
     'Using Grab & Bolt',
     'Confirm the pickup spot with the driver in Thai when they call you.',
     '📱', 3, true),
    ('66666666-6666-4666-8666-666666666404',
     '55555555-5555-4555-8555-555555555504', 'bts-mrt',
     'Riding the BTS & MRT',
     'Buy a single-journey ticket and actually parse the station announcements.',
     '🚇', 4, true),
    ('66666666-6666-4666-8666-666666666405',
     '55555555-5555-4555-8555-555555555504', 'asking-strangers',
     'Asking a Stranger for Directions',
     'Politely stop someone, ask for help, and understand the "just over there" answer.',
     '🧭', 5, true),

    -- Unit 5: A Day at the Market
    ('66666666-6666-4666-8666-666666666501',
     '55555555-5555-4555-8555-555555555505', 'arriving-at-market',
     'Arriving at the Market',
     'Greet the stall owners, browse without pressure, and say "just looking".',
     '🏮', 1, true),
    ('66666666-6666-4666-8666-666666666502',
     '55555555-5555-4555-8555-555555555505', 'asking-prices',
     'Asking About Prices',
     'How much is this, how much for two, what''s the total — three different phrasings.',
     '💲', 2, true),
    ('66666666-6666-4666-8666-666666666503',
     '55555555-5555-4555-8555-555555555505', 'bargaining',
     'Bargaining Politely',
     'Offer a lower price with a smile, meet in the middle, know when to walk.',
     '🏷️', 3, true),
    ('66666666-6666-4666-8666-666666666504',
     '55555555-5555-4555-8555-555555555505', 'street-food',
     'Trying Street Food',
     'Order from the cart, say how many, and tell them how you want it.',
     '🍢', 4, true),
    ('66666666-6666-4666-8666-666666666505',
     '55555555-5555-4555-8555-555555555505', 'paying-heading-home',
     'Paying & Heading Home',
     'Hand over cash, count change, carry bags, and say a proper goodbye.',
     '👝', 5, true),

    -- Unit 6: Making Friends
    ('66666666-6666-4666-8666-666666666601',
     '55555555-5555-4555-8555-555555555506', 'starting-a-conversation',
     'Starting a Conversation',
     'Break the ice with a compliment or a question about the place — no awkwardness.',
     '💭', 1, true),
    ('66666666-6666-4666-8666-666666666602',
     '55555555-5555-4555-8555-555555555506', 'introducing-yourself',
     'Introducing Yourself',
     'Name, nickname, where you work, and how long you''ve been around.',
     '🙋', 2, true),
    ('66666666-6666-4666-8666-666666666603',
     '55555555-5555-4555-8555-555555555506', 'where-youre-from',
     'Sharing Where You''re From',
     'Country, city, and what actually brought you to Thailand this time.',
     '🌍', 3, true),
    ('66666666-6666-4666-8666-666666666604',
     '55555555-5555-4555-8555-555555555506', 'swapping-contacts',
     'Swapping Contacts',
     'Exchange Line IDs or phone numbers without the classic "type it in my phone" fumble.',
     '📇', 4, true),
    ('66666666-6666-4666-8666-666666666605',
     '55555555-5555-4555-8555-555555555506', 'making-plans',
     'Making Plans to Meet Again',
     'Agree on a day, time, and place for coffee, dinner, or something on the weekend.',
     '📆', 5, true),

    -- Unit 7: A Night Out
    ('66666666-6666-4666-8666-666666666701',
     '55555555-5555-4555-8555-555555555507', 'planning-the-evening',
     'Planning the Evening',
     'Dinner first? Drinks after? Karaoke? Night market? Lock it in over text.',
     '🗓️', 1, true),
    ('66666666-6666-4666-8666-666666666702',
     '55555555-5555-4555-8555-555555555507', 'meeting-at-the-bar',
     'Meeting at the Bar',
     'Find your friends in a crowd, greet the bartender, grab a table.',
     '🪩', 2, true),
    ('66666666-6666-4666-8666-666666666703',
     '55555555-5555-4555-8555-555555555507', 'ordering-drinks-snacks',
     'Ordering Drinks & Snacks',
     'Buckets, beer towers, bar food — order confidently for the whole table.',
     '🍺', 3, true),
    ('66666666-6666-4666-8666-666666666704',
     '55555555-5555-4555-8555-555555555507', 'toasting-cheering',
     'Toasting & Cheering',
     'Chon gaew, chok dii, mot gaew — the whole toasting playbook.',
     '🥂', 4, true),
    ('66666666-6666-4666-8666-666666666705',
     '55555555-5555-4555-8555-555555555507', 'finding-the-toilets',
     'Finding the Toilets',
     'Ask where they are without hovering around and pointing at doors.',
     '🚻', 5, true),
    ('66666666-6666-4666-8666-666666666706',
     '55555555-5555-4555-8555-555555555507', 'calling-it-a-night',
     'Calling It a Night',
     'Settle up, say proper goodbyes, and grab a safe ride home.',
     '🌙', 6, true),

    -- Unit 8: When Things Go Wrong
    ('66666666-6666-4666-8666-666666666801',
     '55555555-5555-4555-8555-555555555508', 'lost-items',
     'Lost Items',
     'Report a lost phone or wallet at a shop, a taxi, or the BTS lost-and-found.',
     '🔍', 1, true),
    ('66666666-6666-4666-8666-666666666802',
     '55555555-5555-4555-8555-555555555508', 'feeling-unwell',
     'Feeling Unwell',
     'Describe the core symptoms — headache, fever, stomach pain, dizziness.',
     '🤒', 2, true),
    ('66666666-6666-4666-8666-666666666803',
     '55555555-5555-4555-8555-555555555508', 'pharmacy',
     'At the Pharmacy',
     'Explain what''s wrong and let the pharmacist (very competent, btw) recommend a fix.',
     '💊', 3, true),
    ('66666666-6666-4666-8666-666666666804',
     '55555555-5555-4555-8555-555555555508', 'calling-a-doctor',
     'Calling a Doctor',
     'Request a clinic visit or find a nearby international-friendly hospital.',
     '🩺', 4, true),
    ('66666666-6666-4666-8666-666666666805',
     '55555555-5555-4555-8555-555555555508', 'asking-police',
     'Asking for Help from Police',
     'Report a theft, or ask where the nearest tourist police station is.',
     '🚓', 5, true);

  insert into public.lesson_audio_versions
    (id, lesson_id, label, audio_path, is_current)
  values
    (audio_version_id, first_lesson_id, 'v1', 'lessons/seed/v1.mp3', true);
end $$;

-- Comment threads on the Thai for English Speakers course. All seeded as
-- 'approved' so everyone sees them in local dev without running through the
-- moderation queue. UUID scheme: 8888...-8NNN for top-level comments, -9NNN
-- for replies. Authors rotate across all six seeded users so the avatar-color
-- palette shows up well in the chat.
do $$
declare
  admin_id         uuid := '11111111-1111-4111-8111-111111111111';
  user1_id         uuid := '22222222-2222-4222-8222-222222222201'; -- Alex Parker
  user2_id         uuid := '22222222-2222-4222-8222-222222222202'; -- Ben Nakamura
  user3_id         uuid := '22222222-2222-4222-8222-222222222203'; -- Clara Rodriguez
  user4_id         uuid := '22222222-2222-4222-8222-222222222204'; -- Dara Okafor
  user5_id         uuid := '22222222-2222-4222-8222-222222222205'; -- Eva Lindgren
  course_id        uuid := '44444444-4444-4444-8444-444444444401';
  unit_1           uuid := '55555555-5555-4555-8555-555555555501';
  unit_2           uuid := '55555555-5555-4555-8555-555555555502';
  unit_3           uuid := '55555555-5555-4555-8555-555555555503';
  unit_4           uuid := '55555555-5555-4555-8555-555555555504';
  unit_5           uuid := '55555555-5555-4555-8555-555555555505';
  unit_6           uuid := '55555555-5555-4555-8555-555555555506';
  unit_7           uuid := '55555555-5555-4555-8555-555555555507';
  unit_8           uuid := '55555555-5555-4555-8555-555555555508';
  first_lesson_id  uuid := '66666666-6666-4666-8666-666666666101';
  audio_version_id uuid := '77777777-7777-4777-8777-777777777701';
begin
  -- Top-level comments.
  insert into public.comments
    (id, author_id, parent_comment_id,
     course_id, unit_id, lesson_id, audio_version_id, timepoint_seconds,
     body, moderation_status, moderated_at, moderated_by)
  values
    -- Course-level
    ('88888888-8888-4888-8888-888888888001', admin_id, null,
     course_id, null, null, null, null,
     'Welcome! Post your wins and questions here — I''ll be around to answer anything about pronunciation, tones, or the specific phrases in each lesson.',
     'approved', now(), admin_id),
    ('88888888-8888-4888-8888-888888888002', user1_id, null,
     course_id, null, null, null, null,
     'Flying to Bangkok next month — going to try to get through Units 1–3 before I land. Any order you''d suggest beyond that?',
     'approved', now(), admin_id),
    ('88888888-8888-4888-8888-888888888003', user3_id, null,
     course_id, null, null, null, null,
     'Been visiting Thailand for a decade and still get tripped up by tones. What finally clicked for you all?',
     'approved', now(), admin_id),
    ('88888888-8888-4888-8888-888888888004', user4_id, null,
     course_id, null, null, null, null,
     'Is Unit 7 (Night Out) safe to start early, or does it lean on stuff from earlier units?',
     'approved', now(), admin_id),

    -- Unit 1: Arriving in Thailand
    ('88888888-8888-4888-8888-888888888010', user1_id, null,
     null, unit_1, null, null, null,
     'The "At Immigration" lesson is honestly the one I''m most nervous about. Officers always talk so fast.',
     'approved', now(), admin_id),
    -- Unit 2: Settling Into Your Stay
    ('88888888-8888-4888-8888-888888888011', user2_id, null,
     null, unit_2, null, null, null,
     'Hotel staff Thai is way more formal than I expected. Lots of khráp/kâ at the ends of everything.',
     'approved', now(), admin_id),
    -- Unit 3: Eating Out in Bangkok
    ('88888888-8888-4888-8888-888888888012', user5_id, null,
     null, unit_3, null, null, null,
     'Ordering spicy has been a wild ride. I said phet mâak once and cried into my som tam.',
     'approved', now(), admin_id),
    -- Unit 4: Getting Around the City
    ('88888888-8888-4888-8888-888888888013', user4_id, null,
     null, unit_4, null, null, null,
     'BTS vs MRT still trips me up. Different cards, different operators, different systems?',
     'approved', now(), admin_id),
    -- Unit 5: A Day at the Market
    ('88888888-8888-4888-8888-888888888014', admin_id, null,
     null, unit_5, null, null, null,
     'Quick cultural note: polite bargaining is expected at markets and street stalls — it''s not rude. Supermarkets and 7-Elevens have fixed prices.',
     'approved', now(), admin_id),
    -- Unit 6: Making Friends
    ('88888888-8888-4888-8888-888888888015', user5_id, null,
     null, unit_6, null, null, null,
     'Used the Unit 6 phrases at a language exchange last week and actually made two Thai friends. Wild.',
     'approved', now(), admin_id),
    -- Unit 7: A Night Out
    ('88888888-8888-4888-8888-888888888016', user1_id, null,
     null, unit_7, null, null, null,
     'Not gonna lie, this is the unit I''m here for. Lesson 4 better teach me all the toasts.',
     'approved', now(), admin_id),
    -- Unit 8: When Things Go Wrong
    ('88888888-8888-4888-8888-888888888017', user4_id, null,
     null, unit_8, null, null, null,
     'Hope I never need this unit but going through it anyway. Better to have it in the back pocket.',
     'approved', now(), admin_id),

    -- Lesson-level (Unit 1 / Lesson 1: At Immigration)
    ('88888888-8888-4888-8888-888888888020', admin_id, null,
     null, null, first_lesson_id, audio_version_id, null,
     'Listen for the "mái" question particle at the end of the officer''s sentences — that''s your cue they''re asking you something.',
     'approved', now(), admin_id),
    ('88888888-8888-4888-8888-888888888021', user2_id, null,
     null, null, first_lesson_id, audio_version_id, 12,
     'Quick one — what''s the Thai word for "holiday" again? I caught it but couldn''t transcribe it.',
     'approved', now(), admin_id),
    ('88888888-8888-4888-8888-888888888022', user1_id, null,
     null, null, first_lesson_id, audio_version_id, 30,
     'The officer''s pace in the recording is FAST. Is that realistic or dramatised for practice?',
     'approved', now(), admin_id),
    ('88888888-8888-4888-8888-888888888023', user3_id, null,
     null, null, first_lesson_id, audio_version_id, 55,
     'Pro tip from many trips: memorise your hotel name in Thai. They ask every time and a screenshot saves you.',
     'approved', now(), admin_id),
    ('88888888-8888-4888-8888-888888888024', user5_id, null,
     null, null, first_lesson_id, audio_version_id, null,
     'First time I''ve heard "sàk tîi" — what does it actually translate to literally?',
     'approved', now(), admin_id),
    ('88888888-8888-4888-8888-888888888025', user4_id, null,
     null, null, first_lesson_id, audio_version_id, 78,
     'I freeze when officers ask follow-up questions. Any tips for staying composed when you don''t catch the first word?',
     'approved', now(), admin_id);

  -- Replies (parent_comment_id set, all target columns null).
  insert into public.comments
    (id, author_id, parent_comment_id,
     course_id, unit_id, lesson_id, audio_version_id, timepoint_seconds,
     body, moderation_status, moderated_at, moderated_by)
  values
    -- Replies to course-level C1 (welcome)
    ('88888888-8888-4888-8888-888888889001', user1_id, '88888888-8888-4888-8888-888888888001',
     null, null, null, null, null,
     'Great to be here. Goal: hold a real conversation with my partner''s mom by summer.',
     'approved', now(), admin_id),
    ('88888888-8888-4888-8888-888888889002', user5_id, '88888888-8888-4888-8888-888888888001',
     null, null, null, null, null,
     'Joining from Malmö 🇸🇪 — prepping for a 3-week trip to Krabi. Excited.',
     'approved', now(), admin_id),

    -- Replies to C2 (trip prep order)
    ('88888888-8888-4888-8888-888888889003', admin_id, '88888888-8888-4888-8888-888888888002',
     null, null, null, null, null,
     'Units 1–3 before you land is perfect. Then skip ahead to Unit 4 (Getting Around) in the taxi from the airport if you can — it''s the fastest payoff.',
     'approved', now(), admin_id),
    ('88888888-8888-4888-8888-888888889004', user3_id, '88888888-8888-4888-8888-888888888002',
     null, null, null, null, null,
     'Second this. And do Unit 6 (Making Friends) on the flight — you''ll want it by day two.',
     'approved', now(), admin_id),

    -- Replies to C3 (tones)
    ('88888888-8888-4888-8888-888888889005', admin_id, '88888888-8888-4888-8888-888888888003',
     null, null, null, null, null,
     'Honestly? Exposure more than drilling. Shadow short clips, record yourself, compare. Your ear re-tunes faster than you''d think.',
     'approved', now(), admin_id),
    ('88888888-8888-4888-8888-888888889006', user2_id, '88888888-8888-4888-8888-888888888003',
     null, null, null, null, null,
     'What worked for me: pair each tone with a hand gesture while practising. Kinaesthetic cue > rote drills.',
     'approved', now(), admin_id),
    ('88888888-8888-4888-8888-888888889007', user5_id, '88888888-8888-4888-8888-888888888003',
     null, null, null, null, null,
     'Minimal-pair Anki deck for me. Boring but it worked in about 3 weeks.',
     'approved', now(), admin_id),

    -- Replies to C4 (Unit 7 order)
    ('88888888-8888-4888-8888-888888889008', admin_id, '88888888-8888-4888-8888-888888888004',
     null, null, null, null, null,
     'You can jump in early — Unit 7 stands on its own. It reuses the ordering vocab from Unit 3, but most of the phrases are specific to the scenario.',
     'approved', now(), admin_id),
    ('88888888-8888-4888-8888-888888889009', user1_id, '88888888-8888-4888-8888-888888888004',
     null, null, null, null, null,
     'I''ll need that one.',
     'approved', now(), admin_id),

    -- Replies to Unit 1
    ('88888888-8888-4888-8888-888888889010', admin_id, '88888888-8888-4888-8888-888888888010',
     null, null, null, null, null,
     'Have your hotel address ready on your phone — officers often just want the name and postcode, not a conversation.',
     'approved', now(), admin_id),
    ('88888888-8888-4888-8888-888888889011', user3_id, '88888888-8888-4888-8888-888888888010',
     null, null, null, null, null,
     'Also: "sám wan" = 3 days, "nùeng sàpdaa" = 1 week. 90% of what they ask.',
     'approved', now(), admin_id),
    ('88888888-8888-4888-8888-888888889012', user4_id, '88888888-8888-4888-8888-888888888010',
     null, null, null, null, null,
     'This was me last year. Got through it by smiling and saying "thîao" until they stamped me through 😂',
     'approved', now(), admin_id),

    -- Replies to Unit 2
    ('88888888-8888-4888-8888-888888889013', admin_id, '88888888-8888-4888-8888-888888888011',
     null, null, null, null, null,
     'Yes — hospitality Thai leans formal. You''ll notice staff mirror your register, so if you start with khráp/kâ they''ll use it back.',
     'approved', now(), admin_id),
    ('88888888-8888-4888-8888-888888889014', user4_id, '88888888-8888-4888-8888-888888888011',
     null, null, null, null, null,
     'Does it feel weird to drop into English out of nowhere? I never know when to switch.',
     'approved', now(), admin_id),

    -- Replies to Unit 3
    ('88888888-8888-4888-8888-888888889015', user3_id, '88888888-8888-4888-8888-888888888012',
     null, null, null, null, null,
     'Say "phèt nít nòi" (a little spicy) the first time with any new stall. You can always ramp up.',
     'approved', now(), admin_id),
    ('88888888-8888-4888-8888-888888889016', admin_id, '88888888-8888-4888-8888-888888888012',
     null, null, null, null, null,
     'Thai "mild" is often Western "medium". The whole scale slides.',
     'approved', now(), admin_id),
    ('88888888-8888-4888-8888-888888889017', user1_id, '88888888-8888-4888-8888-888888888012',
     null, null, null, null, null,
     'som tam is a special kind of spice though, the chili hits different.',
     'approved', now(), admin_id),

    -- Replies to Unit 4
    ('88888888-8888-4888-8888-888888889018', user2_id, '88888888-8888-4888-8888-888888888013',
     null, null, null, null, null,
     'BTS = skytrain (elevated), MRT = subway (underground). Different companies, different cards, but most routes interchange at Asok / Sukhumvit.',
     'approved', now(), admin_id),
    ('88888888-8888-4888-8888-888888889019', admin_id, '88888888-8888-4888-8888-888888888013',
     null, null, null, null, null,
     'Ben nailed it. Rabbit card for BTS, MRT card for MRT. A single "combined" card is coming but not everywhere yet.',
     'approved', now(), admin_id),

    -- Replies to Unit 5
    ('88888888-8888-4888-8888-888888889020', user1_id, '88888888-8888-4888-8888-888888888014',
     null, null, null, null, null,
     'I always feel bad asking for a lower price. Does it actually come off as polite?',
     'approved', now(), admin_id),
    ('88888888-8888-4888-8888-888888889021', admin_id, '88888888-8888-4888-8888-888888888014',
     null, null, null, null, null,
     'Totally fine if you smile and use "lót nòi dâi mái" (could you lower it a bit?). Walking away is also acceptable and often brings a counter-offer.',
     'approved', now(), admin_id),
    ('88888888-8888-4888-8888-888888889022', user3_id, '88888888-8888-4888-8888-888888888014',
     null, null, null, null, null,
     'The unwritten rule: if it''s a small amount, don''t push hard. Vendors are working long days.',
     'approved', now(), admin_id),

    -- Replies to Unit 6
    ('88888888-8888-4888-8888-888888889023', admin_id, '88888888-8888-4888-8888-888888888015',
     null, null, null, null, null,
     'Best news I''ve heard all week. Language exchanges are massively under-rated — most attendees are happy to be patient.',
     'approved', now(), admin_id),
    ('88888888-8888-4888-8888-888888889024', user1_id, '88888888-8888-4888-8888-888888888015',
     null, null, null, null, null,
     'How long into the course were you? Trying to gauge when I''ll be ready.',
     'approved', now(), admin_id),

    -- Replies to Unit 7
    ('88888888-8888-4888-8888-888888889025', admin_id, '88888888-8888-4888-8888-888888888016',
     null, null, null, null, null,
     'Lesson 4 (toasting) was my favourite to record. "Chon gaew" (clink glasses), "chok dii" (good luck), "mòt gâew" (bottoms up). You''re going to have fun.',
     'approved', now(), admin_id),
    ('88888888-8888-4888-8888-888888889026', user2_id, '88888888-8888-4888-8888-888888888016',
     null, null, null, null, null,
     'chon gaew 🍻',
     'approved', now(), admin_id),

    -- Replies to Unit 8
    ('88888888-8888-4888-8888-888888889027', admin_id, '88888888-8888-4888-8888-888888888017',
     null, null, null, null, null,
     'Good instinct. The pharmacy lesson alone has paid for itself for most students — Thai pharmacists are excellent and save you a clinic visit.',
     'approved', now(), admin_id),
    ('88888888-8888-4888-8888-888888889028', user3_id, '88888888-8888-4888-8888-888888888017',
     null, null, null, null, null,
     'I needed the pharmacy one within a week of my first trip. Pack mosquito repellent.',
     'approved', now(), admin_id),

    -- Replies to lesson-1 threads
    ('88888888-8888-4888-8888-888888889030', user3_id, '88888888-8888-4888-8888-888888888020',
     null, null, null, null, null,
     'Good catch — I was missing that. Made the whole rhythm click.',
     'approved', now(), admin_id),
    ('88888888-8888-4888-8888-888888889031', admin_id, '88888888-8888-4888-8888-888888888021',
     null, null, null, null, null,
     '"wan yùt" — literally "stop day / rest day". You''ll also hear "thîao" (to travel/visit).',
     'approved', now(), admin_id),
    ('88888888-8888-4888-8888-888888889032', admin_id, '88888888-8888-4888-8888-888888888022',
     null, null, null, null, null,
     'That''s genuine officer speed. We debated slowing it for the recording but decided exposure matters more than comfort.',
     'approved', now(), admin_id),
    ('88888888-8888-4888-8888-888888889033', user5_id, '88888888-8888-4888-8888-888888888023',
     null, null, null, null, null,
     'Saving this, thank you.',
     'approved', now(), admin_id),
    ('88888888-8888-4888-8888-888888889034', user2_id, '88888888-8888-4888-8888-888888888023',
     null, null, null, null, null,
     'Or just show them the booking screenshot — works 100% of the time.',
     'approved', now(), admin_id),
    ('88888888-8888-4888-8888-888888889035', admin_id, '88888888-8888-4888-8888-888888888024',
     null, null, null, null, null,
     '"sàk" = a few / about, "tîi" = time. Together: "a couple of times" in a casual register.',
     'approved', now(), admin_id),
    ('88888888-8888-4888-8888-888888889036', admin_id, '88888888-8888-4888-8888-888888888025',
     null, null, null, null, null,
     'Legit strategy: "khǎw thôot, phûut ìik khráng dâi mái khráp/kâ?" ("sorry, could you say that again?"). Buys you time and signals you''re trying.',
     'approved', now(), admin_id),
    ('88888888-8888-4888-8888-888888889037', user1_id, '88888888-8888-4888-8888-888888888025',
     null, null, null, null, null,
     'I smile and nod. Not a strategy but somehow it works?',
     'approved', now(), admin_id);
end $$;
