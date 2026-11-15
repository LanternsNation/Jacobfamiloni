import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { DEFAULT_SETTINGS, invalidate } from '../lib/data'
import type { Cohort, SiteSettings, Track } from '../lib/types'
import { AdminCard, btn, btnGhost, inputCls, Msg, useQuery } from './shared'

type Key = keyof SiteSettings

export default function SettingsAdmin() {
  const rows = useQuery<{ key: string; value: Record<string, unknown> }[]>(() => supabase.from('site_settings').select('key,value'))
  const [s, setS] = useState<SiteSettings>(structuredClone(DEFAULT_SETTINGS))
  const [msg, setMsg] = useState<string | null>(null)
  const [err, setErr] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!rows.data) return
    const merged = structuredClone(DEFAULT_SETTINGS) as unknown as Record<string, Record<string, unknown>>
    for (const r of rows.data) merged[r.key] = { ...(merged[r.key] ?? {}), ...r.value }
    setS(merged as unknown as SiteSettings)
  }, [rows.data])

  function upd<K extends Key>(k: K, patch: Partial<SiteSettings[K]>) {
    setS((x) => ({ ...x, [k]: { ...x[k], ...patch } }))
  }

  async function save() {
    setBusy(true)
    setErr(null)
    setMsg(null)
    const payload = (Object.keys(s) as Key[]).map((key) => ({ key, value: s[key] }))
    const { error } = await supabase.from('site_settings').upsert(payload)
    setBusy(false)
    if (error) return setErr(error.message)
    invalidate('settings')
    setMsg('Saved. The live site updates on next page load.')
  }

  const ytText = s.videos.youtube_ids.join('\n')

  return (
    <div className="space-y-6">
      <AdminCard title="Home page">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="text-sm md:col-span-2"><span className="label">Hero headline</span><input className={inputCls} value={s.hero.headline} onChange={(e) => upd('hero', { headline: e.target.value })} /></label>
          <label className="text-sm md:col-span-2"><span className="label">Hero line under headline</span><input className={inputCls} value={s.hero.subhead} onChange={(e) => upd('hero', { subhead: e.target.value })} /></label>
          <label className="text-sm"><span className="label">Hero video URL (MP4, under 3 MB, muted loop)</span><input className={inputCls} value={s.hero.video_url} onChange={(e) => upd('hero', { video_url: e.target.value })} /></label>
          <label className="text-sm"><span className="label">Hero poster image URL (leave empty to use the built-in photo)</span><input className={inputCls} value={s.hero.poster_url} onChange={(e) => upd('hero', { poster_url: e.target.value })} /></label>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" className="h-4 w-4 accent-[#C9A24A]" checked={s.cohort_banner.show} onChange={(e) => upd('cohort_banner', { show: e.target.checked })} /> Show cohort banner</label>
          <label className="text-sm"><span className="label">Cohort banner text</span><input className={inputCls} value={s.cohort_banner.text} onChange={(e) => upd('cohort_banner', { text: e.target.value })} /></label>
        </div>
      </AdminCard>

      <AdminCard title="Live counter">
        <p className="text-xs text-muted mb-3">Choose which numbers show. Numbers always come from real records; they cannot be edited by hand.</p>
        <div className="grid sm:grid-cols-2 gap-2 text-sm">
          {([
            ['show_applicants', 'Applicants'],
            ['show_seats_sponsored', 'Seats sponsored'],
            ['show_students_placed', 'Students placed'],
            ['show_states', 'States represented'],
          ] as const).map(([k, l]) => (
            <label key={k} className="flex items-center gap-2"><input type="checkbox" className="h-4 w-4 accent-[#C9A24A]" checked={s.counters[k]} onChange={(e) => upd('counters', { [k]: e.target.checked })} /> {l}</label>
          ))}
        </div>
      </AdminCard>

      <AdminCard title="Social, media and contact">
        <div className="grid gap-4 md:grid-cols-2">
          {(['facebook', 'youtube', 'instagram', 'x', 'tiktok'] as const).map((k) => (
            <label key={k} className="text-sm"><span className="label capitalize">{k === 'x' ? 'X' : k} link</span><input className={inputCls} value={s.social[k]} onChange={(e) => upd('social', { [k]: e.target.value })} placeholder="https://" /></label>
          ))}
          <label className="text-sm"><span className="label">WhatsApp number (e.g. 2348012345678)</span><input className={inputCls} value={s.social.whatsapp} onChange={(e) => upd('social', { whatsapp: e.target.value })} /></label>
          <label className="text-sm md:col-span-2"><span className="label">Student WhatsApp community link (shown after a seat is secured)</span><input className={inputCls} value={s.community.whatsapp_link} onChange={(e) => upd('community', { whatsapp_link: e.target.value })} placeholder="https://chat.whatsapp.com/…" /></label>
          <label className="text-sm md:col-span-2">
            <span className="label">YouTube videos (one link or ID per line; newest first)</span>
            <textarea
              className={inputCls + ' min-h-28 font-mono'}
              value={ytText}
              onChange={(e) => upd('videos', { youtube_ids: e.target.value.split('\n').map(ytId).filter(Boolean) as string[] })}
            />
          </label>
        </div>
      </AdminCard>

      <AdminCard title="Receiving entity (shown near payments)">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="text-sm"><span className="label">Registered name</span><input className={inputCls} value={s.entity.name} onChange={(e) => upd('entity', { name: e.target.value })} /></label>
          <label className="text-sm"><span className="label">CAC RC number</span><input className={inputCls} value={s.entity.rc_number} onChange={(e) => upd('entity', { rc_number: e.target.value })} /></label>
        </div>
      </AdminCard>

      <div className="sticky bottom-3 flex items-center gap-4 rounded-xl border border-white/10 bg-ink-2/95 backdrop-blur p-3">
        <button className={btn} disabled={busy} onClick={save}>{busy ? 'Saving…' : 'Save settings'}</button>
        <Msg text={msg} /><Msg text={err || rows.error} tone="error" />
      </div>

      <CohortsAdmin />
      <TracksAdmin />
    </div>
  )
}

function ytId(line: string): string | null {
  const t = line.trim()
  if (!t) return null
  const m = t.match(/(?:v=|youtu\.be\/|embed\/|shorts\/)([A-Za-z0-9_-]{11})/)
  if (m) return m[1]
  return /^[A-Za-z0-9_-]{11}$/.test(t) ? t : null
}

function CohortsAdmin() {
  const rows = useQuery<Cohort[]>(() => supabase.from('cohorts').select('*').order('created_at'))
  const [err, setErr] = useState<string | null>(null)

  async function update(c: Cohort, patch: Partial<Cohort>) {
    setErr(null)
    const { error } = await supabase.from('cohorts').update(patch).eq('id', c.id)
    if (error) setErr(error.message)
    else {
      invalidate('cohort')
      rows.reload()
    }
  }
  async function add() {
    const n = (rows.data?.length ?? 0) + 1
    const { error } = await supabase.from('cohorts').insert({ name: `Cohort ${n}`, capacity: 500, is_open: false })
    if (error) setErr(error.message)
    else rows.reload()
  }

  return (
    <AdminCard title="Cohorts and dates" actions={<button className={btnGhost} onClick={add}>Add cohort</button>}>
      <p className="text-xs text-muted mb-3">The site shows the open cohort. Keep only one open at a time.</p>
      <Msg text={err} tone="error" />
      <div className="space-y-3">
        {(rows.data ?? []).map((c) => (
          <div key={c.id} className="grid grid-cols-2 md:grid-cols-5 gap-3 items-end rounded-lg border border-white/10 p-3">
            <label className="text-sm"><span className="label">Name</span><input className={inputCls} defaultValue={c.name} onBlur={(e) => e.target.value !== c.name && update(c, { name: e.target.value })} /></label>
            <label className="text-sm"><span className="label">Start date</span><input type="date" className={inputCls} defaultValue={c.starts_on ?? ''} onBlur={(e) => update(c, { starts_on: e.target.value || null })} /></label>
            <label className="text-sm"><span className="label">Capacity</span><input type="number" min={1} className={inputCls} defaultValue={c.capacity} onBlur={(e) => Number(e.target.value) !== c.capacity && update(c, { capacity: Number(e.target.value) })} /></label>
            <label className="flex items-center gap-2 text-sm pb-2"><input type="checkbox" className="h-4 w-4 accent-[#C9A24A]" checked={c.is_open} onChange={(e) => update(c, { is_open: e.target.checked })} /> Open for applications</label>
          </div>
        ))}
      </div>
    </AdminCard>
  )
}

function TracksAdmin() {
  const rows = useQuery<Track[]>(() => supabase.from('tracks').select('*').order('sort_order'))
  const [err, setErr] = useState<string | null>(null)
  async function update(t: Track, patch: Partial<Track>) {
    const { error } = await supabase.from('tracks').update(patch).eq('id', t.id)
    if (error) setErr(error.message)
    else {
      invalidate('tracks')
      rows.reload()
    }
  }
  return (
    <AdminCard title="AI School tracks">
      <Msg text={err} tone="error" />
      <div className="space-y-3">
        {(rows.data ?? []).map((t) => (
          <div key={t.id} className="grid md:grid-cols-[1fr_2fr_auto] gap-3 items-end rounded-lg border border-white/10 p-3">
            <label className="text-sm"><span className="label">Title</span><input className={inputCls} defaultValue={t.title} onBlur={(e) => e.target.value !== t.title && update(t, { title: e.target.value })} /></label>
            <label className="text-sm"><span className="label">Summary</span><input className={inputCls} defaultValue={t.summary} onBlur={(e) => e.target.value !== t.summary && update(t, { summary: e.target.value })} /></label>
            <label className="flex items-center gap-2 text-sm pb-2"><input type="checkbox" className="h-4 w-4 accent-[#C9A24A]" checked={t.is_active} onChange={(e) => update(t, { is_active: e.target.checked })} /> Active</label>
          </div>
        ))}
      </div>
    </AdminCard>
  )
}
