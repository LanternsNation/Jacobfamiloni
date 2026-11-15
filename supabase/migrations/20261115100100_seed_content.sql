-- Seed content. Everything marked [PLACEHOLDER] must be replaced with approved content before launch.
-- No facts about Dr. Familoni are invented here.

-- The four initiatives (Leadership is part of the Character Development and Leadership Programme). Active at launch: AI School + Character Development and Leadership Programme.
insert into public.initiatives (title, slug, summary, body, partner, impact_label, impact_value, giving_examples, status, sort_order) values
(
  'Familoni AI School', 'ai-school',
  'Practical AI skills for young Nigerians, taught in cohorts, open to everyone through sponsored seats.',
  '[PLACEHOLDER — Purpose and activities of the AI School, in the team''s approved words: who it is for, how classes run, what students leave with.]',
  null, 'Seats secured', null,
  '[{"amount_naira":2000,"provides":"One seat for a young Nigerian in the next cohort"},
    {"amount_naira":10000,"provides":"Five seats"},
    {"amount_naira":100000,"provides":"A full class of fifty students"}]'::jsonb,
  'active', 1
),
(
  'Character Development and Leadership Programme', 'character-leadership',
  'Building character and leadership in young Nigerians, in partnership with Arrowhead Education Leadership Foundation.',
  '[PLACEHOLDER — Purpose and activities of the programme, how the partnership with Arrowhead Education Leadership Foundation works, and who takes part.]',
  'Arrowhead Education Leadership Foundation', '[PLACEHOLDER] Participants reached', null,
  '[{"amount_naira":null,"provides":"[PLACEHOLDER — what a set amount provides, e.g. one participant''s materials]"}]'::jsonb,
  'active', 2
),
(
  'Widows'' Empowerment', 'widows-empowerment',
  'Helping widows build a dependable income and stand on their own.',
  '[PLACEHOLDER — Purpose and activities. Widows are shown with dignity and only with consent.]',
  null, '[PLACEHOLDER] Widows supported', null,
  '[{"amount_naira":null,"provides":"[PLACEHOLDER amount] — a widow''s starter business pack"}]'::jsonb,
  'coming_soon', 3
),
(
  'Orphanage Home Support', 'orphanage-homes',
  'Steady, practical support for orphanage homes: food, learning and care.',
  '[PLACEHOLDER — Purpose and activities. Children are shown only with consent from the home''s management.]',
  null, '[PLACEHOLDER] Homes supported', null,
  '[{"amount_naira":null,"provides":"[PLACEHOLDER amount] — a month of food for an orphanage home"}]'::jsonb,
  'coming_soon', 4
);

-- The four AI School tracks
insert into public.tracks (title, slug, summary, sort_order) values
('AI for Web Development',            'ai-web-development', 'Build and ship websites and web apps faster with AI tools.', 1),
('AI Content Creation',               'ai-content-creation', 'Write, design and edit content for social media and brands with AI.', 2),
('AI for Business and Productivity',  'ai-business-productivity', 'Use AI to run a small business, a team or your own work more efficiently.', 3),
('AI Design',                         'ai-design', 'Create visual design, graphics and brand assets with AI.', 4);

-- One open cohort; start date to be confirmed (editable in the admin dashboard)
insert into public.cohorts (name, starts_on, capacity, is_open) values ('Cohort 1', null, 500, true);

-- Placeholder gallery items. Delete or replace before launch.
-- Prominent people are captioned as visits or meetings only.
insert into public.gallery_items (title, caption, place, date_taken, category, initiative_id, is_published, sort_order)
select v.title, v.caption, v.place, null, v.category,
       (select id from public.initiatives where slug = v.slug), true, v.sort_order
  from (values
    ('[PLACEHOLDER] Courtesy visit', 'Courtesy visit — [name, title]. [PLACEHOLDER caption: place and date]', '[Place]', 'visit', null, 1),
    ('[PLACEHOLDER] Meeting', 'Meeting with [name, title]. [PLACEHOLDER caption: place and date]', '[Place]', 'meeting', null, 2),
    ('[PLACEHOLDER] Community visit', 'Visit to [community]. [PLACEHOLDER caption]', '[Place]', 'visit', null, 3),
    ('[PLACEHOLDER] AI School session', '[PLACEHOLDER caption]', '[Place]', 'initiative', 'ai-school', 4),
    ('[PLACEHOLDER] Character and leadership session', '[PLACEHOLDER caption]', '[Place]', 'initiative', 'character-leadership', 5),
    ('[PLACEHOLDER] Event', '[PLACEHOLDER caption]', '[Place]', 'event', null, 6)
  ) as v(title, caption, place, category, slug, sort_order);

-- Editable site settings
insert into public.site_settings (key, value) values
('hero', '{"headline":"A legacy of excellence, starting at home.","subhead":"[PLACEHOLDER — one line in his voice on why he is building at home]","video_url":"","poster_url":""}'::jsonb),
('cohort_banner', '{"show":true,"text":"Applications are open for Cohort 1 of the Familoni AI School."}'::jsonb),
('social', '{"facebook":"","youtube":"","instagram":"","x":"","tiktok":"","whatsapp":""}'::jsonb),
('videos', '{"youtube_ids":[]}'::jsonb),
('counters', '{"show_applicants":true,"show_states":true,"show_seats_sponsored":true,"show_students_placed":true}'::jsonb),
('entity', '{"name":"[PLACEHOLDER — registered entity name]","rc_number":"[PLACEHOLDER — CAC RC number]"}'::jsonb);
