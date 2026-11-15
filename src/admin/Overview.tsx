import { useState } from 'react'
import { supabase } from '../lib/supabase'
import type { Cohort, Impact } from '../lib/types'
import { AdminCard, btn, Msg, Stat, useQuery } from './shared'

export default function Overview() {
  const impact = useQuery<Impact>(() => supabase.rpc('public_impact'))
  const refs = useQuery<{ referral_code: string; full_name: string; referrals: number }[]>(() => supabase.rpc('admin_referral_counts'))
  const cohorts = useQuery<Cohort[]>(() => supabase.from('cohorts').select('*').order('created_at', { ascending: false }))
  const [cohort, setCohort] = useState('')
  const [n, setN] = useState(10)
  const [msg, setMsg] = useState<string | null>(null)
  const [err, setErr] = useState<string | null>(null)

  const i = impact.data
  const available = i ? Math.max(0, i.seats_sponsored - i.students_placed) : 0

  async function place() {
    setMsg(null)
    setErr(null)
    const target = cohort || cohorts.data?.find((c) => c.is_open)?.id || cohorts.data?.[0]?.id
    if (!target) return setErr('No cohort found.')
    const { data, error } = await supabase.rpc('admin_place_sponsored', { p_cohort: target, p_limit: n })
    if (error) return setErr(error.message)
    setMsg(`${data} applicant(s) moved from the waitlist into sponsored seats.`)
    impact.reload()
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <Stat label="Applicants" value={i?.applicants ?? '—'} />
        <Stat label="Seats secured" value={i?.seats_secured ?? '—'} />
        <Stat label="Seats sponsored (paid)" value={i?.seats_sponsored ?? '—'} />
        <Stat label="Students placed" value={i?.students_placed ?? '—'} />
        <Stat label="States represented" value={i ? `${i.states_represented} / 37` : '—'} />
        <Stat label="Sponsors" value={i?.sponsors ?? '—'} />
      </div>

      <AdminCard title="Place sponsored seats">
        <p className="text-sm text-ivory-2">
          Funded seats not yet given out: <strong className="text-gold">{available}</strong>. Seats go to waitlisted applicants in the order they applied.
        </p>
        <div className="mt-4 flex flex-wrap items-end gap-3">
          <label className="text-sm">
            <span className="block text-xs text-muted mb-1">Cohort</span>
            <select className="field !min-h-10 !py-2 text-sm" value={cohort} onChange={(e) => setCohort(e.target.value)}>
              <option value="">Open cohort</option>
              {(cohorts.data ?? []).map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            <span className="block text-xs text-muted mb-1">How many</span>
            <input type="number" min={1} max={available || 1} className="field !min-h-10 !py-2 text-sm w-28" value={n} onChange={(e) => setN(Number(e.target.value))} />
          </label>
          <button className={btn} disabled={available <= 0} onClick={place}>Place next {Math.min(n, available)}</button>
        </div>
        <div className="mt-3"><Msg text={msg} /><Msg text={err} tone="error" /></div>
      </AdminCard>

      <AdminCard title="Top referrers">
        {refs.error && <Msg text={refs.error} tone="error" />}
        {!refs.data?.length ? (
          <p className="text-sm text-muted">No referrals yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="text-left text-muted"><tr><th className="py-2">Name</th><th>Code</th><th className="text-right">Referrals</th></tr></thead>
            <tbody>
              {refs.data.slice(0, 20).map((r) => (
                <tr key={r.referral_code} className="border-t border-white/5">
                  <td className="py-2">{r.full_name}</td>
                  <td className="font-mono text-xs">{r.referral_code}</td>
                  <td className="text-right">{r.referrals}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </AdminCard>
    </div>
  )
}
