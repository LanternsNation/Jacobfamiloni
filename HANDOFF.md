# Handoff — Dr. Jacob Familoni Legacy Platform

_Last updated: Sun 15 Nov 2026. Public launch: Sat 21 Nov 2026._

No secrets are stored in this repo. Secret **names** are listed below; values live only in Vercel and Supabase.

## What's done

| Area | Status |
| --- | --- |
| App | React + Vite + TypeScript + Tailwind + Framer Motion + React Router, mobile first. Editorial design: midnight ink, warm gold, ivory, Fraunces + Inter. |
| PWA | `vite-plugin-pwa` with `registerType: 'autoUpdate'`, manifest, placeholder icons (192, 512, maskable, Apple), core pages offline, offline banner + page, "Install app" prompt (Android) and Add-to-Home-Screen hint (iPhone), "New version available, refreshing…" toast. Photos are cached when viewed, not downloaded at install. |
| Database | 11 tables, Row Level Security on all of them. Migrations in `supabase/migrations/` (all applied to project `lhofntsamdqlfzyirmpk`). |
| Seed | 4 initiatives (AI School and Character Development & Leadership Programme with Arrowhead Education Leadership Foundation **active**; Widows' Empowerment and Orphanage Home Support **coming soon**), 4 tracks, Cohort 1 (open, 500 seats, start date TBC), 6 placeholder gallery items, site settings. |
| Pages | Home, His Story, Initiatives + one page each (AI School page has tracks, cohort, format, FAQ), Apply, Apply confirmation (referral link + install prompt + WhatsApp community link), Support / Sponsor a Seat, Thank-you with shareable image card, Impact & Gallery (filters), Media, Get Involved / Contact, Privacy Policy (draft), 404. |
| Payments | Paystack in **test mode**. `paystack-init` starts transactions (amounts set server-side only). `paystack-webhook` verifies HMAC SHA-512, is idempotent on reference, updates payments / applicants / sponsorships. `payment-status` confirms on return if the webhook is late. |
| Counter | `public_impact()` returns counts only (applicants, states, seats sponsored, students placed, sponsors, per initiative). `public_sponsors()` returns opted-in names + country only. |
| Referrals | 7-character code per applicant; `?ref=CODE` on any page is remembered and attached on application; admin sees who referred whom and a top-referrers table. |
| Admin `/admin` | Supabase Auth (email + password). Overview + sponsored-seat placement, applicants (search, filters, status, CSV), payments (CSV), sponsorships by initiative (CSV), Get Involved inbox, initiatives manager, gallery manager (uploads auto-converted to WebP), site settings, counter toggles, cohorts and dates, tracks. |
| Photos | Hero: studio portrait (dark suit). Home: candid portrait in warm monochrome (chapter I) and the Nigeria photo as the full-bleed "Starting at home" interlude. His Story: archive portrait + lectern photo. |
| Design | Hero is an editorial portrait poster: "JACOB" set huge behind a real cut-out B&W portrait, "Familoni" in italic in front, animated red-and-white flag stripes and navy star field behind, caption "A Nigerian based in the United States". Home is told in four chapters (I The man, II The work, III The people, IV Join) with a letterbox hero reveal, slow push-in on the portrait, outlined marquee of initiative names. Sections with no real content (achievements, visits strip, videos) stay hidden until filled. Fonts self-hosted (Fraunces with optical sizing, Inter). |

Tested against the live database: anonymous users can't read applicants/payments; payment confirmation returns `ok` then `already_processed`; wrong amounts are rejected; application, referral and duplicate-email handling work through the deployed Edge Functions.

## Decisions log

- **15 Nov — Positioning and theme (owner decision):** Dr. Familoni is presented from the first screen as *a Nigerian based in the United States*. The site uses a USA colour theme (red accents, navy, white) with animated flag stripes behind the hero portrait. This replaces the PRD's gold accents. The guardrails still apply: no election, office, party or campaign wording; payments fund Nigerian initiatives only.

- **15 Nov — Identity reel (owner decision):** the mobile hero reel and His Story "Who he is" show: Professional · Innovator & Entrepreneur; Character · Hardworking & Dedicated; Faith · Good Christian; Family · Husband & Father of Four; Political Career · Independent U.S. Presidential Candidate, 2016. Edit in `src/lib/content.ts` → `credentials`.
- **15 Nov — 2016 candidacy shown (owner decision; overrides PRD guardrail 1):** source is the FEC candidate record P60019361 ("FAMILONI, TAIWO JACOB", Independent, President; the FEC shows no reported financial activity for 2015–2016). Keep the wording exactly as the FEC records it — "candidate", not "presidential nominee" or "ran for President" with vote claims. **Before launch, have the US election lawyer review this line together with the payment pages**: the reel sits on the same screen as "Sponsor a Seat", and payments come mostly from Nigerians (foreign nationals under US law). Keep all payment pages free of any political wording.

- **15 Nov — "The Man." section (owner copy):** Home chapter I is now an editorial "about" spread (ivory page, B&W full-length portrait, credentials MBA · RFSS · FFSS · CAIS, owner's bio, typeset signature). Owner chose to soften one sentence on the payment-bearing Home page: "lead and take America on a revolutionary journey" became "a bold vision for positive change that bridges social, economic and political divides and brings people together." Copy lives in `src/lib/content.ts` → `about`. The signature is typeset (placeholder) — replace with a scan of his real signature.

- **15 Nov — "His Heart For The People" section:** letter-card layout on a deep navy USA backdrop; card subtitle "Charity begins at home." The circle photo shows Dr. Familoni with a group of young people in the US. **Owner confirmed consent for publishing the young people's faces (15 Nov).** Keep the written consent on file; remove the photo promptly if any parent or young person asks.

- **15 Nov — Previous site (familoni.com) review:** reused the four pillars (His Story "Who he is") and the PUNDITSOFT role (from LinkedIn; details to confirm). **Not reused:** the Gingrich and Romney "endorsement" quotes (unverified, and they would break guardrail 4), the "Community Leaders" quote, and the campaign contact details and buttons. The Pastor Chuck Smith quote can be added once its source is supplied. The 2016 candidacy line was **moved off the hero** into the His Story timeline, pending (1) the US election-lawyer review — the old site runs an active 2028 campaign with a Donate button, and a 2022 FEC committee lists him as Republican — and (2) confirming eligibility (natural-born citizen requirement). **Do not link familoni.com from this site or share its phone/email.**

- **15 Nov — Previous site "Issues" page:** only character values (Transparency, Accountability, Service, Dignity → His Story "What he believes") and education convictions (→ AI School page "The conviction behind it", reframed for Nigeria) were reused. The US policy platform (economy, global leadership, "A Presidency Focused on Results", "running for President") is deliberately **not** on this site.

- **15 Nov — "His Journey" slider (Home, after "His Heart For The People"):** full-bleed carousel of visits and meetings with a card queue, stepper and synchronized 600ms transitions (`src/components/JourneySlider.tsx`). It reads published Gallery items with category Visit/Meeting **and a photo**; until at least three exist it shows four placeholder slides (Obasanjo, Adeboye, Governors, Communities — names from the PRD). Captions must stay "visit"/"meeting" — never endorsement. It replaces the old "Visits and meetings" strip.

- **15 Nov — AI School CTA (Home, after His Journey):** `src/components/SchoolCta.tsx`. Light grid canvas, 3D pencil cup and plant, curved arrows, floating track tiles (drawn icons — no Google/YouTube logos), rotating "Track" card, Apply Now + Play Video (plays the first YouTube ID in Settings; shows "Sponsor a seat" until one is set). Image: Dr. Familoni (grey-suit cutout); the gold card reads "Familoni · AI Digital School". Do not use the navy-suit headshot with lapel pins — they are Republican Party elephant pins.

- **15 Nov — Home order:** Hero → The Man. → His Heart For The People → His Journey → AI School CTA → footer. The Work (four initiatives), The People (live impact counter), Achievements, Latest videos and the closing "₦2,000" Join section are **parked** (still in `src/pages/Home.tsx`, exported, not rendered) while the owner reworks them. The impact counter still shows on the Support and Impact pages.

## Configuration

**Vercel → Project → Settings → Environment Variables** (Production + Preview), then redeploy:

| Name | Value |
| --- | --- |
| `VITE_SUPABASE_URL` | `https://lhofntsamdqlfzyirmpk.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | the project's **publishable** key (Supabase → Project Settings → API Keys) |

Build settings (auto-detected): Framework **Vite**, build `npm run build`, output `dist`. `vercel.json` handles SPA routes and caching.

**Supabase → Edge Functions → Secrets:**

| Name | Value |
| --- | --- |
| `PAYSTACK_SECRET_KEY` | Paystack secret key — `sk_test_…` now, `sk_live_…` on Thu 19 Nov |
| `SITE_URL` | the live site address, e.g. `https://<project>.vercel.app` (later the real domain) |
| `ALLOWED_ORIGINS` | comma-separated site addresses allowed to call the functions |

**Paystack → Settings → API Keys & Webhooks:** Webhook URL (test and later live) =
`https://lhofntsamdqlfzyirmpk.supabase.co/functions/v1/paystack-webhook`

**Admin login:** the owner email is on the admin invite list (set in the database, not in this repo). Create the user in Supabase → Authentication → Users → Add user (email + password, auto-confirm). They become admin automatically. To add another admin, run in the SQL editor:
`insert into public.admin_invites (email) values ('person@example.com');`

## What's left

- [ ] Add the three Edge Function secrets and the Paystack webhook URL (blocks all payments).
- [ ] Create the admin user; then **turn off public sign-ups** (Authentication → Sign In / Providers → Email → disable "Allow new users to sign up").
- [ ] Achievements in numbers: fill at least three verified figures in `src/lib/content.ts` to make the section appear.
- [ ] Real copy for everything marked `[PLACEHOLDER]` (search the repo and the admin): story in brief, career record, values, timeline, achievements in numbers, initiative bodies, hero subhead, AI School format and teachers, privacy policy controller details.
- [ ] Logo (replace `Wordmark` in `src/components/Placeholder.tsx` and the icons in `public/icons/`).
- [ ] **Before launch: replace the TEMPORARY press portraits** in His Journey (`public/media/journey-obasanjo.webp`, `journey-adeboye.webp`; third-party photos, not ours) with photos of Dr. Familoni **with** each person. The section background video is hotlinked from the owner's Cloudinary (`JOURNEY_VIDEO` in `JourneySlider.tsx`).
- [ ] Upload at least three real Visit/Meeting photos (title = person's name, e.g. "Obasanjo"; caption e.g. "Courtesy visit to former President Olusegun Obasanjo"; place + date) so His Journey switches from placeholders to real photos. Delete the 6 placeholder gallery items and upload real, captioned photos (place + date). Visits/meetings only — never "endorsed by".
- [ ] Social links, WhatsApp number, student WhatsApp community link, YouTube links (admin › Settings).
- [ ] Receiving entity name + CAC RC number (admin › Settings) once the entity and its Paystack account exist.
- [ ] Hero video loop (< 3 MB MP4) if available (admin › Settings › Hero video URL).
- [ ] Domain (Wed 18 Nov) **before launch** — installed PWAs are tied to the address. Then update `SITE_URL`, `ALLOWED_ORIGINS`, Paystack callback/webhook stays the same.
- [ ] **URGENT, before launch — US election lawyer:** review this site against the active 2028 campaign (familoni.com) and the naira payment flow. Also confirm eligibility for the office.
- [ ] Lawyer review of the privacy policy (Nigeria Data Protection Act 2023) and US election-lawyer review of the donation setup (PRD open items).

## Next 3 steps

1. **Today:** add the Vercel env vars and the 3 Supabase secrets, set the Paystack test webhook, create the admin user, disable sign-ups. Then run one test application with Paystack's test card and one test sponsorship; confirm both appear in `/admin` and the counter moves.
2. **Mon–Tue:** load real copy, logo, photos and links through the admin; replace the remaining `[PLACEHOLDER]` text in `src/lib/content.ts` and `src/pages/Story.tsx`.
3. **Thu:** switch to live keys (`PAYSTACK_SECRET_KEY` = `sk_live_…`, live webhook URL in Paystack), enable international cards on the Paystack account, make two real ₦2,000 payments, and test install on an Android phone and an iPhone.

## Known issues and risks

- **Spam:** forms are protected by a honeypot and server validation only. Before heavy promotion, add a CAPTCHA (e.g. Cloudflare Turnstile) to `submit-application`, `submit-involvement` and `paystack-init`.
- **Duplicate-email path:** someone who knows an applicant's email can resubmit and see that applicant's referral code (they can't see or change other details). Acceptable for launch; tighten with an email/WhatsApp one-time code later.
- **Cohort capacity** is checked when payment starts, not locked; under a rush a cohort could overfill by a handful of seats.
- **No outbound messages yet:** the platform doesn't send email/SMS/WhatsApp. Paystack emails payment receipts; cohort details and the WhatsApp link are shown on screen and must otherwise be sent by the team (bulk messaging is in the post-launch list).
- **Performance:** first load ships ~130 KB gzipped JS (React + router) plus Framer Motion (~51 KB gzipped) and ~200 KB of fonts. Fine on 4G; could be trimmed with `LazyMotion`.
- **Photos:** the lectern and sweater portraits are ~500 px wide; get higher-resolution originals. Keep US-flag photos off the home page and initiative pages.
- **Candid portrait (Le Méridien):** cropped above his lapel pin, which is a Republican Party elephant pin, and toned so the hotel signage is not legible. Never publish the uncropped original anywhere on his channels.
- **Excluded photo:** the "2003 Businessman of the Year" certificate is from the NRCC Business Advisory Council (a US party committee programme reported as a fundraising solicitation). Keep it off the site and out of any achievements list.
- **Edge Function deploys:** functions were deployed from these exact files. Future changes: `supabase functions deploy <name>` (the webhook must keep `verify_jwt = false`, set in `supabase/config.toml`).
- `pg_net` is enabled (used for testing functions from SQL); harmless, can stay.
- Visual QA was done with mock data in a headless browser; do a full pass on a real mid-range Android phone on 4G.
