-- Dr. Jacob Familoni Legacy Platform — initial schema
-- Row Level Security is enabled on every table. The public can read only published
-- content and aggregate counts. All writes of personal data go through Edge Functions
-- (service role), never directly from the browser.

-- ---------------------------------------------------------------------------
-- Types
-- ---------------------------------------------------------------------------
create type public.initiative_status as enum ('active', 'coming_soon');
create type public.applicant_status  as enum ('pending', 'paid', 'sponsored', 'waitlisted', 'enrolled');
create type public.seat_source       as enum ('self', 'sponsored');
create type public.payment_kind      as enum ('commitment', 'sponsorship');
create type public.payment_status    as enum ('pending', 'success', 'failed', 'abandoned');
create type public.involvement_kind  as enum ('volunteer', 'partner', 'recommend_widow', 'recommend_home', 'contact');
create type public.request_status    as enum ('new', 'in_review', 'done');

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.updated_at := now();
  return new;
end $$;

-- ---------------------------------------------------------------------------
-- Admins
-- ---------------------------------------------------------------------------
create table public.admin_users (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  role       text not null default 'admin' check (role in ('admin', 'owner')),
  created_at timestamptz not null default now()
);

-- Emails allowed to become admins. When an auth user with a listed email exists
-- (or is created later), they are added to admin_users automatically.
-- Rows are added by SQL from the Supabase dashboard, never from the app.
create table public.admin_invites (
  email      text primary key check (email = lower(email)),
  role       text not null default 'admin' check (role in ('admin', 'owner')),
  created_at timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.admin_users a where a.user_id = (select auth.uid()));
$$;

create or replace function public.promote_invited_admin()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if tg_table_name = 'users' then
    insert into public.admin_users (user_id, role)
    select new.id, i.role from public.admin_invites i where i.email = lower(new.email)
    on conflict (user_id) do nothing;
  else -- admin_invites
    insert into public.admin_users (user_id, role)
    select u.id, new.role from auth.users u where lower(u.email) = new.email
    on conflict (user_id) do nothing;
  end if;
  return new;
end $$;

create trigger on_auth_user_created_promote
  after insert on auth.users
  for each row execute function public.promote_invited_admin();

create trigger on_admin_invite_promote
  after insert on public.admin_invites
  for each row execute function public.promote_invited_admin();

-- ---------------------------------------------------------------------------
-- Content
-- ---------------------------------------------------------------------------
create table public.initiatives (
  id              uuid primary key default gen_random_uuid(),
  title           text not null,
  slug            text not null unique check (slug ~ '^[a-z0-9-]+$'),
  summary         text not null default '',
  body            text not null default '',
  hero_image      text,
  partner         text,                                  -- e.g. partner organisation for a programme
  impact_label    text,
  impact_value    text,
  giving_examples jsonb not null default '[]'::jsonb,    -- [{ "amount_naira": 2000, "provides": "..." }]
  status          public.initiative_status not null default 'coming_soon',
  sort_order      int not null default 0,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create trigger initiatives_updated_at before update on public.initiatives for each row execute function public.set_updated_at();

create table public.tracks (
  id         uuid primary key default gen_random_uuid(),
  title      text not null,
  slug       text not null unique check (slug ~ '^[a-z0-9-]+$'),
  summary    text not null default '',
  is_active  boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table public.cohorts (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  starts_on  date,                     -- null = to be confirmed
  capacity   int not null default 500 check (capacity > 0),
  is_open    boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.gallery_items (
  id            uuid primary key default gen_random_uuid(),
  title         text not null,
  caption       text not null default '',
  place         text,
  date_taken    date,
  image_url     text,
  video_url     text,
  initiative_id uuid references public.initiatives(id) on delete set null,
  -- Prominent people appear only as 'visit' or 'meeting', never as endorsements.
  category      text not null default 'visit' check (category in ('visit', 'meeting', 'event', 'initiative')),
  is_published  boolean not null default false,
  sort_order    int not null default 0,
  created_at    timestamptz not null default now()
);

create table public.site_settings (
  key        text primary key,
  value      jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
create trigger site_settings_updated_at before update on public.site_settings for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- People and money (personal data — admin-only reads, Edge Function writes)
-- ---------------------------------------------------------------------------
create table public.applicants (
  id            uuid primary key default gen_random_uuid(),
  full_name     text not null check (char_length(full_name) between 2 and 120),
  phone         text not null check (phone ~ '^\+?[0-9]{10,15}$'),
  email         text not null check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  state         text not null,
  lga           text not null,
  age_range     text not null check (age_range in ('18–21', '22–25', '26–30', '31–35')), -- 18+ only
  track_id      uuid not null references public.tracks(id),
  cohort_id     uuid not null references public.cohorts(id),
  motivation    text not null default '' check (char_length(motivation) <= 1000),
  referral_code text not null unique,
  referred_by   text references public.applicants(referral_code) on delete set null on update cascade,
  status        public.applicant_status not null default 'pending',
  seat_source   public.seat_source,      -- set when a seat is secured: paid by self, or sponsored
  consent_at    timestamptz not null,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  unique (email, cohort_id)
);
create trigger applicants_updated_at before update on public.applicants for each row execute function public.set_updated_at();
create index applicants_status_idx      on public.applicants (status, created_at);
create index applicants_track_idx       on public.applicants (track_id);
create index applicants_cohort_idx      on public.applicants (cohort_id);
create index applicants_state_idx       on public.applicants (state);
create index applicants_referred_by_idx on public.applicants (referred_by);

-- Short, unambiguous referral codes (no 0/O/1/I).
create or replace function public.gen_referral_code()
returns text language plpgsql volatile set search_path = '' as $$
declare
  alphabet constant text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  code text;
begin
  loop
    code := '';
    for i in 1..7 loop
      code := code || substr(alphabet, 1 + floor(random() * length(alphabet))::int, 1);
    end loop;
    exit when not exists (select 1 from public.applicants where referral_code = code);
  end loop;
  return code;
end $$;

alter table public.applicants alter column referral_code set default public.gen_referral_code();

create table public.payments (
  id           uuid primary key default gen_random_uuid(),
  reference    text not null unique,
  kind         public.payment_kind not null,
  amount_kobo  bigint not null check (amount_kobo > 0),
  currency     text not null default 'NGN',
  status       public.payment_status not null default 'pending',
  payer_email  text not null,
  applicant_id uuid references public.applicants(id) on delete set null,
  raw_event    jsonb,
  paid_at      timestamptz,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create trigger payments_updated_at before update on public.payments for each row execute function public.set_updated_at();
create index payments_applicant_idx on public.payments (applicant_id);
create index payments_status_idx    on public.payments (status, created_at);

create table public.sponsorships (
  id                   uuid primary key default gen_random_uuid(),
  name                 text not null check (char_length(name) between 1 and 120),
  email                text not null,
  country_of_residence text not null,
  initiative_id        uuid references public.initiatives(id) on delete set null, -- null = where most needed
  seats                int not null default 0 check (seats >= 0),
  amount_kobo          bigint not null check (amount_kobo > 0),
  payment_id           uuid not null unique references public.payments(id) on delete restrict,
  show_name_publicly   boolean not null default false,
  paid_at              timestamptz,
  created_at           timestamptz not null default now()
);
create index sponsorships_initiative_idx on public.sponsorships (initiative_id);

create table public.involvement_requests (
  id         uuid primary key default gen_random_uuid(),
  kind       public.involvement_kind not null,
  name       text not null check (char_length(name) between 1 and 120),
  phone      text,
  email      text,
  state      text,
  details    text not null default '' check (char_length(details) <= 3000),
  consent_at timestamptz not null,
  status     public.request_status not null default 'new',
  created_at timestamptz not null default now(),
  check (phone is not null or email is not null)
);
create index involvement_status_idx on public.involvement_requests (status, created_at);

-- ---------------------------------------------------------------------------
-- Payment confirmation (called only by the webhook Edge Function, service role)
-- Idempotent on reference: a second call for the same reference does nothing.
-- ---------------------------------------------------------------------------
create or replace function public.confirm_payment(p_reference text, p_amount_kobo bigint, p_currency text, p_event jsonb)
returns text language plpgsql security definer set search_path = '' as $$
declare
  pay public.payments;
begin
  select * into pay from public.payments where reference = p_reference for update;
  if not found then
    return 'unknown_reference';
  end if;
  if pay.status = 'success' then
    return 'already_processed';
  end if;
  if pay.amount_kobo <> p_amount_kobo or upper(pay.currency) <> upper(p_currency) then
    update public.payments set status = 'failed', raw_event = p_event where id = pay.id;
    return 'amount_mismatch';
  end if;

  update public.payments set status = 'success', raw_event = p_event, paid_at = now() where id = pay.id;

  if pay.kind = 'commitment' and pay.applicant_id is not null then
    update public.applicants
       set status = 'paid', seat_source = 'self'
     where id = pay.applicant_id and status in ('pending', 'waitlisted');
  elsif pay.kind = 'sponsorship' then
    update public.sponsorships set paid_at = now() where payment_id = pay.id;
  end if;

  return 'ok';
end $$;

create or replace function public.fail_payment(p_reference text, p_status public.payment_status, p_event jsonb)
returns void language sql security definer set search_path = '' as $$
  update public.payments set status = p_status, raw_event = p_event
   where reference = p_reference and status = 'pending';
$$;

revoke all on function public.confirm_payment(text, bigint, text, jsonb) from public, anon, authenticated;
revoke all on function public.fail_payment(text, public.payment_status, jsonb) from public, anon, authenticated;
revoke all on function public.promote_invited_admin() from public, anon, authenticated;

-- ---------------------------------------------------------------------------
-- Live impact counter — counts only, never personal data
-- ---------------------------------------------------------------------------
create or replace function public.public_impact()
returns jsonb language sql stable security definer set search_path = '' as $$
  select jsonb_build_object(
    'applicants',          (select count(*) from public.applicants),
    'states_represented',  (select count(distinct state) from public.applicants),
    'seats_sponsored',     (select coalesce(sum(s.seats), 0) from public.sponsorships s where s.paid_at is not null),
    'students_placed',     (select count(*) from public.applicants where seat_source = 'sponsored'),
    'seats_secured',       (select count(*) from public.applicants where seat_source is not null),
    'sponsors',            (select count(*) from public.sponsorships where paid_at is not null),
    'by_initiative',       (
      select coalesce(jsonb_object_agg(i.slug, coalesce(x.n, 0)), '{}'::jsonb)
        from public.initiatives i
        left join (select initiative_id, count(*) n from public.sponsorships where paid_at is not null group by initiative_id) x
          on x.initiative_id = i.id
    ),
    'updated_at',          now()
  );
$$;
grant execute on function public.public_impact() to anon, authenticated;

-- Public list of sponsors who opted in to show their name (name + country only).
create or replace function public.public_sponsors(p_limit int default 24)
returns table (name text, country text, seats int, initiative_slug text, created_at timestamptz)
language sql stable security definer set search_path = '' as $$
  select s.name, s.country_of_residence, s.seats, i.slug, s.paid_at
    from public.sponsorships s
    left join public.initiatives i on i.id = s.initiative_id
   where s.paid_at is not null and s.show_name_publicly
   order by s.paid_at desc
   limit least(greatest(p_limit, 1), 100);
$$;
grant execute on function public.public_sponsors(int) to anon, authenticated;

-- Admin: referral counts (who referred whom is visible in applicants.referred_by)
create or replace function public.admin_referral_counts()
returns table (referral_code text, full_name text, referrals bigint)
language sql stable security definer set search_path = '' as $$
  select a.referral_code, a.full_name, count(r.id)
    from public.applicants a
    join public.applicants r on r.referred_by = a.referral_code
   where public.is_admin()
   group by a.referral_code, a.full_name
   order by count(r.id) desc;
$$;
grant execute on function public.admin_referral_counts() to authenticated;

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table public.admin_users          enable row level security;
alter table public.admin_invites        enable row level security;
alter table public.initiatives          enable row level security;
alter table public.tracks               enable row level security;
alter table public.cohorts              enable row level security;
alter table public.gallery_items        enable row level security;
alter table public.site_settings        enable row level security;
alter table public.applicants           enable row level security;
alter table public.payments             enable row level security;
alter table public.sponsorships         enable row level security;
alter table public.involvement_requests enable row level security;

-- Public reads (published content only)
create policy "public read initiatives"   on public.initiatives   for select to anon, authenticated using (true);
create policy "public read active tracks" on public.tracks        for select to anon, authenticated using (is_active or (select public.is_admin()));
create policy "public read cohorts"       on public.cohorts       for select to anon, authenticated using (true);
create policy "public read gallery"       on public.gallery_items for select to anon, authenticated using (is_published or (select public.is_admin()));
create policy "public read settings"      on public.site_settings for select to anon, authenticated using (true);

-- Admin writes on content
create policy "admin write initiatives" on public.initiatives   for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "admin write tracks"      on public.tracks        for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "admin write cohorts"     on public.cohorts       for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "admin write gallery"     on public.gallery_items for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "admin write settings"    on public.site_settings for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));

-- Personal data: admins read and update; nobody inserts from the browser (Edge Functions use the service role).
create policy "admin read applicants"   on public.applicants           for select to authenticated using ((select public.is_admin()));
create policy "admin update applicants" on public.applicants           for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "admin read payments"     on public.payments             for select to authenticated using ((select public.is_admin()));
create policy "admin read sponsorships" on public.sponsorships         for select to authenticated using ((select public.is_admin()));
create policy "admin read requests"     on public.involvement_requests for select to authenticated using ((select public.is_admin()));
create policy "admin update requests"   on public.involvement_requests for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));

-- Admin table: an admin can see the admin list; changes only via SQL / invites.
create policy "admin read admins"  on public.admin_users   for select to authenticated using ((select public.is_admin()));
create policy "admin read invites" on public.admin_invites for select to authenticated using ((select public.is_admin()));

-- ---------------------------------------------------------------------------
-- Storage: public gallery bucket, admin-only uploads
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('gallery', 'gallery', true, 2097152, array['image/webp', 'image/jpeg', 'image/png'])
on conflict (id) do nothing;

create policy "admin upload gallery" on storage.objects for insert to authenticated
  with check (bucket_id = 'gallery' and (select public.is_admin()));
create policy "admin update gallery" on storage.objects for update to authenticated
  using (bucket_id = 'gallery' and (select public.is_admin()));
create policy "admin delete gallery" on storage.objects for delete to authenticated
  using (bucket_id = 'gallery' and (select public.is_admin()));
