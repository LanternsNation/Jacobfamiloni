import { useMemo, useState } from 'react'
import { supabase } from '../lib/supabase'
import { NIGERIAN_STATES } from '../lib/content'
import type { Cohort, Track } from '../lib/types'
import { AdminCard, btnGhost, downloadCsv, dt, fetchAll, inputCls, Msg, useQuery } from './shared'

interface Row {
  id: string
  full_name: string
  phone: string
  email: string
  state: string
  lga: string
  age_range: string
  track_id: string
  cohort_id: string
  motivation: string
  referral_code: string
  referred_by: string | null
  status: string
  seat_source: string | null
  created_at: string
  consent_at: string
}

const STATUSES = ['pending', 'paid', 'sponsored', 'waitlisted', 'enrolled']
const PAGE = 50

export default function Applicants() {
  const rows = useQuery<Row[]>(() => fetchAll<Row>((a, b) => supabase.from('applicants').select('*').order('created_at', { ascending: false }).range(a, b)))
  const tracks = useQuery<Track[]>(() => supabase.from('tracks').select('*').order('sort_order'))
  const cohorts = useQuery<Cohort[]>(() => supabase.from('cohorts').select('*'))
  const [f, setF] = useState({ q: '', track: '', state: '', status: '', paid: '', cohort: '' })
  const [page, setPage] = useState(0)
  const [err, setErr] = useState<string | null>(null)

  const trackName = useMemo(() => Object.fromEntries((tracks.data ?? []).map((t) => [t.id, t.title])), [tracks.data])
  const cohortName = useMemo(() => Object.fromEntries((cohorts.data ?? []).map((c) => [c.id, c.name])), [cohorts.data])

  const filtered = useMemo(() => {
    const q = f.q.trim().toLowerCase()
    return (rows.data ?? []).filter(
      (r) =>
        (!f.track || r.track_id === f.track) &&
        (!f.state || r.state === f.state) &&
        (!f.status || r.status === f.status) &&
        (!f.cohort || r.cohort_id === f.cohort) &&
        (!f.paid || (f.paid === 'yes' ? r.seat_source === 'self' : r.seat_source !== 'self')) &&
        (!q || r.full_name.toLowerCase().includes(q) || r.email.includes(q) || r.phone.includes(q) || r.referral_code.toLowerCase() === q),
    )
  }, [rows.data, f])

  const set = (k: keyof typeof f) => (e: { target: { value: string } }) => {
    setF({ ...f, [k]: e.target.value })
    setPage(0)
  }

  async function setStatus(r: Row, status: string) {
    setErr(null)
    const patch: Record<string, unknown> = { status }
    if (status === 'sponsored' && !r.seat_source) patch.seat_source = 'sponsored'
    const { error } = await supabase.from('applicants').update(patch).eq('id', r.id)
    if (error) setErr(error.message)
    else rows.reload()
  }

  function exportCsv() {
    downloadCsv(
      `applicants-${new Date().toISOString().slice(0, 10)}.csv`,
      filtered.map((r) => ({
        applied_at: r.created_at,
        full_name: r.full_name,
        phone: r.phone,
        email: r.email,
        state: r.state,
        lga: r.lga,
        age_range: r.age_range,
        track: trackName[r.track_id] ?? '',
        cohort: cohortName[r.cohort_id] ?? '',
        status: r.status,
        seat: r.seat_source ?? '',
        referral_code: r.referral_code,
        referred_by: r.referred_by ?? '',
        motivation: r.motivation,
      })),
    )
  }

  const pageRows = filtered.slice(page * PAGE, (page + 1) * PAGE)

  return (
    <AdminCard
      title={`Applicants (${filtered.length}${filtered.length !== (rows.data?.length ?? 0) ? ` of ${rows.data?.length ?? 0}` : ''})`}
      actions={<button className={btnGhost} onClick={exportCsv} disabled={!filtered.length}>Export CSV</button>}
    >
      <div className="grid grid-cols-2 md:grid-cols-6 gap-2 mb-4">
        <input className={`${inputCls} col-span-2`} placeholder="Search name, email, phone, code" value={f.q} onChange={set('q')} />
        <select className={inputCls} value={f.track} onChange={set('track')}>
          <option value="">All tracks</option>
          {(tracks.data ?? []).map((t) => <option key={t.id} value={t.id}>{t.title}</option>)}
        </select>
        <select className={inputCls} value={f.state} onChange={set('state')}>
          <option value="">All states</option>
          {NIGERIAN_STATES.map((s) => <option key={s}>{s}</option>)}
        </select>
        <select className={inputCls} value={f.status} onChange={set('status')}>
          <option value="">All statuses</option>
          {STATUSES.map((s) => <option key={s}>{s}</option>)}
        </select>
        <select className={inputCls} value={f.paid} onChange={set('paid')}>
          <option value="">Paid or not</option>
          <option value="yes">Paid fee</option>
          <option value="no">Not paid</option>
        </select>
      </div>
      <Msg text={rows.error || err} tone="error" />
      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[900px]">
          <thead className="text-left text-muted text-xs">
            <tr><th className="py-2">Applied</th><th>Name</th><th>Contact</th><th>State / LGA</th><th>Track</th><th>Referral</th><th>Status</th></tr>
          </thead>
          <tbody>
            {pageRows.map((r) => (
              <tr key={r.id} className="border-t border-white/5 align-top">
                <td className="py-2 text-xs text-muted whitespace-nowrap">{dt(r.created_at)}</td>
                <td>
                  {r.full_name}
                  <span className="block text-xs text-muted">{r.age_range}</span>
                </td>
                <td className="text-xs"><a href={`tel:${r.phone}`} className="hover:text-gold">{r.phone}</a><span className="block text-muted">{r.email}</span></td>
                <td className="text-xs">{r.state}<span className="block text-muted">{r.lga}</span></td>
                <td className="text-xs">{trackName[r.track_id]}</td>
                <td className="text-xs font-mono">{r.referral_code}{r.referred_by && <span className="block text-muted">via {r.referred_by}</span>}</td>
                <td>
                  <select className="bg-ink-3 rounded px-2 py-1 text-xs" value={r.status} onChange={(e) => setStatus(r, e.target.value)}>
                    {STATUSES.map((s) => <option key={s}>{s}</option>)}
                  </select>
                  {r.seat_source && <span className="block text-[0.65rem] text-gold mt-1">{r.seat_source === 'self' ? 'Paid fee' : 'Sponsored seat'}</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {rows.loading && <p className="text-sm text-muted mt-3">Loading…</p>}
      {filtered.length > PAGE && (
        <div className="mt-4 flex items-center gap-3 text-sm">
          <button className={btnGhost} disabled={page === 0} onClick={() => setPage(page - 1)}>Previous</button>
          <span className="text-muted">Page {page + 1} of {Math.ceil(filtered.length / PAGE)}</span>
          <button className={btnGhost} disabled={(page + 1) * PAGE >= filtered.length} onClick={() => setPage(page + 1)}>Next</button>
        </div>
      )}
    </AdminCard>
  )
}
