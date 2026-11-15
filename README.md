# Dr. Jacob Familoni — Legacy Platform

The legacy home of Dr. Jacob Familoni: his story, his work, and the Nigerian initiatives he is building at home.
Installable web app (PWA).

**Stack:** React · Vite · TypeScript · Tailwind CSS · Framer Motion · React Router · Supabase · Paystack · Vercel

## Run locally

```bash
npm install
cp .env.example .env.local   # fill in the Supabase URL and publishable key
npm run dev
```

## Structure

- `src/pages` — public pages
- `src/admin` — admin dashboard (Supabase Auth, admins only)
- `src/lib/content.ts` — site copy and **placeholders** (search for `[PLACEHOLDER]`)
- `supabase/migrations` — database schema and Row Level Security
- `supabase/functions` — Edge Functions (Paystack checkout + webhook, form intake)

## Deploy (Vercel)

1. Vercel → Add New → Project → import `LanternsNation/Jacobfamiloni` (already connected). Framework: Vite. Build: `npm run build`. Output: `dist`.
2. Environment variables: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` (publishable key).
3. Every push to `main` deploys.

Supabase Edge Function secrets, Paystack webhook and admin setup: see `HANDOFF.md`.
