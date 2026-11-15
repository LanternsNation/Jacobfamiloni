import { useCallback, useEffect, useState, type ReactNode } from 'react'
import { supabase } from '../lib/supabase'

export function useQuery<T>(fn: () => PromiseLike<{ data: T | null; error: { message: string } | null }>, deps: unknown[] = []) {
  const [data, setData] = useState<T | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const run = useCallback(async () => {
    setLoading(true)
    const { data, error } = await fn()
    setData(data)
    setError(error?.message ?? null)
    setLoading(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
  useEffect(() => {
    run()
  }, [run])
  return { data, error, loading, reload: run }
}

export function AdminCard({ title, children, actions }: { title?: string; children: ReactNode; actions?: ReactNode }) {
  return (
    <section className="rounded-xl border border-white/10 bg-ink-2 p-4 md:p-6">
      {(title || actions) && (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          {title && <h2 className="font-display text-2xl">{title}</h2>}
          {actions}
        </div>
      )}
      {children}
    </section>
  )
}

export function Stat({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="rounded-lg border border-white/10 p-4">
      <p className="text-xs text-muted">{label}</p>
      <p className="mt-1 font-display text-3xl">{value}</p>
    </div>
  )
}

export function Msg({ text, tone = 'info' }: { text: string | null; tone?: 'info' | 'error' }) {
  if (!text) return null
  return <p className={`text-sm ${tone === 'error' ? 'text-red-300' : 'text-emerald-300'}`}>{text}</p>
}

export const ngn = (kobo: number) => '₦' + Math.round(kobo / 100).toLocaleString('en-NG')
export const dt = (s: string | null) => (s ? new Date(s).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' }) : '—')

/** Download rows as CSV (Excel-friendly, UTF-8 BOM). */
export function downloadCsv(filename: string, rows: Record<string, unknown>[]) {
  if (!rows.length) return
  const cols = Object.keys(rows[0])
  const esc = (v: unknown) => {
    const s = v === null || v === undefined ? '' : String(v)
    // neutralise spreadsheet formula injection
    const safe = /^[=+\-@]/.test(s) ? `'${s}` : s
    return /[",\n]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe
  }
  const csv = '﻿' + [cols.join(','), ...rows.map((r) => cols.map((c) => esc(r[c])).join(','))].join('\n')
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }))
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

/** Resize + convert an image to WebP in the browser before upload (keeps the site light on 4G). */
export async function toWebp(file: File, maxW = 1600, quality = 0.78): Promise<Blob> {
  const bmp = await createImageBitmap(file)
  const scale = Math.min(1, maxW / bmp.width)
  const w = Math.round(bmp.width * scale)
  const h = Math.round(bmp.height * scale)
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  c.getContext('2d')!.drawImage(bmp, 0, 0, w, h)
  return new Promise((res, rej) => c.toBlob((b) => (b ? res(b) : rej(new Error('Could not convert image'))), 'image/webp', quality))
}

export async function uploadImage(file: File, folder: string): Promise<string> {
  const blob = await toWebp(file)
  const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.webp`
  const { error } = await supabase.storage.from('gallery').upload(path, blob, { contentType: 'image/webp', cacheControl: '31536000' })
  if (error) throw new Error(error.message)
  return supabase.storage.from('gallery').getPublicUrl(path).data.publicUrl
}

export const inputCls = 'field !min-h-10 !py-2 text-sm'
export const btn = 'rounded-lg bg-gold px-4 py-2 text-sm font-medium text-ink hover:bg-gold-soft disabled:opacity-50'
export const btnGhost = 'rounded-lg border border-white/15 px-4 py-2 text-sm hover:border-gold/60 disabled:opacity-50'

/** Fetch every row past Supabase's 1,000-row page limit. */
export async function fetchAll<T>(
  page: (from: number, to: number) => PromiseLike<{ data: T[] | null; error: { message: string } | null }>,
): Promise<{ data: T[] | null; error: { message: string } | null }> {
  const size = 1000
  const out: T[] = []
  for (let from = 0; from < 100_000; from += size) {
    const { data, error } = await page(from, from + size - 1)
    if (error) return { data: null, error }
    out.push(...(data ?? []))
    if (!data || data.length < size) break
  }
  return { data: out, error: null }
}
