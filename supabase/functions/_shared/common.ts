// Shared helpers for Edge Functions.
import { createClient } from 'npm:@supabase/supabase-js@2'

export const SEAT_PRICE_KOBO = 200_000 // ₦2,000
export const MIN_GIFT_KOBO = 100_000 // ₦1,000
export const MAX_GIFT_KOBO = 5_000_000_000 // ₦50,000,000
export const SEAT_BUNDLES = [1, 5, 50]

const allowed = (Deno.env.get('ALLOWED_ORIGINS') ?? '')
  .split(',')
  .map((s) => s.trim().replace(/\/$/, ''))
  .filter(Boolean)

export function corsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get('origin') ?? ''
  const ok = allowed.length === 0 || allowed.includes(origin) || /^http:\/\/localhost:\d+$/.test(origin)
  return {
    'Access-Control-Allow-Origin': ok && origin ? origin : allowed[0] ?? '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    Vary: 'Origin',
  }
}

export function json(req: Request, body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders(req) },
  })
}

export const fail = (req: Request, message: string, status = 400) => json(req, { error: message }, status)

/** Service-role client: bypasses RLS. Only ever used server-side. */
export function admin() {
  return createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, {
    auth: { persistSession: false },
  })
}

/** Base URL for Paystack redirects: the caller's origin if allow-listed, otherwise SITE_URL. */
export function siteBase(req: Request) {
  const origin = (req.headers.get('origin') ?? '').replace(/\/$/, '')
  if (origin && (allowed.includes(origin) || /^http:\/\/localhost:\d+$/.test(origin))) return origin
  const site = (Deno.env.get('SITE_URL') ?? '').replace(/\/$/, '')
  if (site) return site
  return origin // last resort (before ALLOWED_ORIGINS / SITE_URL are configured)
}

export const isEmail = (s: unknown): s is string => typeof s === 'string' && s.length <= 254 && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(s)
export const str = (v: unknown, max = 200) => (typeof v === 'string' ? v.trim().slice(0, max) : '')

export function normalisePhone(raw: unknown): string | null {
  if (typeof raw !== 'string') return null
  const s = raw.replace(/[\s\-()]/g, '')
  if (/^0[789][01]\d{8}$/.test(s)) return '+234' + s.slice(1)
  if (/^234[789][01]\d{8}$/.test(s)) return '+' + s
  if (/^\+\d{10,15}$/.test(s)) return s
  return null
}

export function newReference(prefix: string) {
  const bytes = crypto.getRandomValues(new Uint8Array(12))
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')
  return `${prefix}-${hex}`
}

export function paystackKey() {
  const k = Deno.env.get('PAYSTACK_SECRET_KEY')
  if (!k) throw new Error('PAYSTACK_SECRET_KEY is not set')
  return k
}

export async function paystack<T = Record<string, unknown>>(path: string, init?: RequestInit): Promise<{ status: boolean; message: string; data: T }> {
  const res = await fetch(`https://api.paystack.co${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${paystackKey()}`, 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
  })
  const body = await res.json().catch(() => ({ status: false, message: `HTTP ${res.status}` }))
  return body
}

export async function readJson(req: Request): Promise<Record<string, unknown> | null> {
  try {
    const b = await req.json()
    return b && typeof b === 'object' ? (b as Record<string, unknown>) : null
  } catch {
    return null
  }
}
