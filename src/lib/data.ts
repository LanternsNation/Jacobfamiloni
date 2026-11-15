import { useEffect, useState } from 'react'
import { supabase, supabaseConfigured } from './supabase'
import type { Cohort, GalleryItem, Impact, Initiative, SiteSettings, Track } from './types'
import { site, socialDefaults } from './content'

/** Tiny in-memory cache so moving between pages doesn't refetch the same public content. */
const cache = new Map<string, unknown>()
const inflight = new Map<string, Promise<unknown>>()

function load<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
  if (cache.has(key)) return Promise.resolve(cache.get(key) as T)
  if (inflight.has(key)) return inflight.get(key) as Promise<T>
  const p = fetcher()
    .then((v) => {
      cache.set(key, v)
      inflight.delete(key)
      return v
    })
    .catch((e) => {
      inflight.delete(key)
      throw e
    })
  inflight.set(key, p)
  return p
}

export function invalidate(prefix?: string) {
  for (const k of [...cache.keys()]) if (!prefix || k.startsWith(prefix)) cache.delete(k)
}

export interface Loadable<T> {
  data: T | undefined
  loading: boolean
  error: string | null
}

function useLoad<T>(key: string, fetcher: () => Promise<T>): Loadable<T> {
  const [state, setState] = useState<Loadable<T>>(() => ({
    data: cache.get(key) as T | undefined,
    loading: !cache.has(key),
    error: null,
  }))
  useEffect(() => {
    let alive = true
    if (!supabaseConfigured) {
      setState({ data: undefined, loading: false, error: 'not-configured' })
      return
    }
    load(key, fetcher)
      .then((data) => alive && setState({ data, loading: false, error: null }))
      .catch((e: Error) => alive && setState({ data: undefined, loading: false, error: e.message || 'Failed to load' }))
    return () => {
      alive = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])
  return state
}

async function unwrap<T>(q: PromiseLike<{ data: T | null; error: { message: string } | null }>): Promise<T> {
  const { data, error } = await q
  if (error) throw new Error(error.message)
  return data as T
}

export const useInitiatives = () =>
  useLoad<Initiative[]>('initiatives', () => unwrap(supabase.from('initiatives').select('*').order('sort_order')))

export const useTracks = () =>
  useLoad<Track[]>('tracks', () => unwrap(supabase.from('tracks').select('*').eq('is_active', true).order('sort_order')))

export const useOpenCohort = () =>
  useLoad<Cohort | null>('cohort:open', () =>
    unwrap(supabase.from('cohorts').select('*').eq('is_open', true).order('starts_on', { ascending: true, nullsFirst: false }).limit(1).maybeSingle()),
  )

export const useGallery = () =>
  useLoad<GalleryItem[]>('gallery', () =>
    unwrap(supabase.from('gallery_items').select('*').eq('is_published', true).order('sort_order').order('date_taken', { ascending: false })),
  )

export const DEFAULT_SETTINGS: SiteSettings = {
  hero: { headline: site.legacyStatement, subhead: '', video_url: '', poster_url: '' },
  cohort_banner: { show: false, text: '' },
  social: { ...socialDefaults, whatsapp: site.whatsappNumber },
  videos: { youtube_ids: [] },
  counters: { show_applicants: true, show_states: true, show_seats_sponsored: true, show_students_placed: true },
  entity: { name: '[PLACEHOLDER — registered entity name]', rc_number: '[PLACEHOLDER — CAC RC number]' },
  community: { whatsapp_link: '' },
}

export function useSettings(): SiteSettings {
  const { data } = useLoad<SiteSettings>('settings', async () => {
    const rows = await unwrap<{ key: string; value: unknown }[]>(supabase.from('site_settings').select('key,value'))
    const merged = structuredClone(DEFAULT_SETTINGS) as unknown as Record<string, Record<string, unknown>>
    for (const r of rows ?? []) {
      merged[r.key] = { ...(merged[r.key] ?? {}), ...(r.value as Record<string, unknown>) }
    }
    return merged as unknown as SiteSettings
  })
  return data ?? DEFAULT_SETTINGS
}

/** Live counter. Refreshes every 60 s while the page is open. */
export function useImpact(): Impact | undefined {
  const [impact, setImpact] = useState<Impact | undefined>(cache.get('impact') as Impact | undefined)
  useEffect(() => {
    if (!supabaseConfigured) return
    let alive = true
    const fetchIt = async () => {
      const { data, error } = await supabase.rpc('public_impact')
      if (!error && data && alive) {
        cache.set('impact', data)
        setImpact(data as Impact)
      }
    }
    fetchIt()
    const t = window.setInterval(fetchIt, 60_000)
    return () => {
      alive = false
      window.clearInterval(t)
    }
  }, [])
  return impact
}

export interface PublicSponsor {
  name: string
  country: string
  seats: number
  initiative_slug: string | null
  created_at: string
}

export const usePublicSponsors = () =>
  useLoad<PublicSponsor[]>('sponsors', () => unwrap(supabase.rpc('public_sponsors', { p_limit: 12 })))

export const naira = (n: number) => '₦' + n.toLocaleString('en-NG', { maximumFractionDigits: 0 })

export function formatDate(d: string | null) {
  if (!d) return null
  return new Date(d + (d.length === 10 ? 'T00:00:00' : '')).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
}

/** Polls payment status after returning from Paystack (webhook may land a few seconds later). */
export function usePaymentStatus(reference: string | null) {
  const [state, setState] = useState<{ status: string; data?: Record<string, unknown> }>({ status: reference ? 'checking' : 'none' })
  useEffect(() => {
    if (!reference) return
    let alive = true
    let tries = 0
    const tick = async () => {
      tries++
      try {
        const { data, error } = await supabase.functions.invoke('payment-status', { body: { reference } })
        if (!alive) return
        if (!error && data) {
          if (data.status === 'success' || data.status === 'failed' || data.status === 'abandoned') {
            setState({ status: data.status, data })
            return
          }
          setState({ status: 'pending', data })
        }
      } catch {
        /* retry */
      }
      if (alive && tries < 12) window.setTimeout(tick, tries < 4 ? 2000 : 5000)
      else if (alive) setState((s) => ({ ...s, status: 'timeout' }))
    }
    tick()
    return () => {
      alive = false
    }
  }, [reference])
  return state
}
