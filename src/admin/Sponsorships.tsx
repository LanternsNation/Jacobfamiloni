import { useMemo } from 'react'
import { supabase } from '../lib/supabase'
import type { Initiative } from '../lib/types'
import { AdminCard, btnGhost, downloadCsv, dt, fetchAll, Msg, ngn, useQuery } from './shared'

interface Sp {
  id: string
  name: string
  email: string
  country_of_residence: string
  initiative_id: string | null
  seats: number
  amount_kobo: number
  show_name_publicly: boolean
  paid_at: string | null
  created_at: string
}

export default function Sponsorships() {
  const rows = useQuery<Sp[]>(() => fetchAll<Sp>((a, b) => supabase.from('sponsorships').select('*').not('paid_at', 'is', null).order('paid_at', { ascending: false }).range(a, b)))
  const inits = useQuery<Initiative[]>(() => supabase.from('initiatives').select('*').order('sort_order'))
  const title = useMemo(() => Object.fromEntries((inits.data ?? []).map((i) => [i.id, i.title])), [inits.data])

  const groups = useMemo(() => {
    const m = new Map<string, { label: string; count: number; seats: number; kobo: number }>()
    for (const s of rows.data ?? []) {
      const k = s.initiative_id ?? 'most-needed'
      const g = m.get(k) ?? { label: s.initiative_id ? title[s.initiative_id] ?? '—' : 'Where most needed', count: 0, seats: 0, kobo: 0 }
      g.count++
      g.seats += s.seats
      g.kobo += s.amount_kobo
      m.set(k, g)
    }
    return [...m.values()].sort((a, b) => b.kobo - a.kobo)
  }, [rows.data, title])

  const diaspora = (rows.data ?? []).filter((s) => s.country_of_residence !== 'Nigeria').length

  return (
    <div className="space-y-6">
      <AdminCard title="By initiative (paid)">
        <Msg text={rows.error} tone="error" />
        <table className="w-full text-sm">
          <thead className="text-left text-muted text-xs"><tr><th className="py-2">Initiative</th><th className="text-right">Gifts</th><th className="text-right">Seats</th><th className="text-right">Amount</th></tr></thead>
          <tbody>
            {groups.map((g) => (
              <tr key={g.label} className="border-t border-white/5">
                <td className="py-2">{g.label}</td><td className="text-right">{g.count}</td><td className="text-right">{g.seats || '—'}</td><td className="text-right">{ngn(g.kobo)}</td>
              </tr>
            ))}
            {!groups.length && <tr><td colSpan={4} className="py-3 text-muted">No paid sponsorships yet.</td></tr>}
          </tbody>
        </table>
        <p className="mt-3 text-xs text-muted">{rows.data?.length ?? 0} paid gifts · {diaspora} from outside Nigeria</p>
      </AdminCard>

      <AdminCard
        title="All paid sponsorships"
        actions={
          <button className={btnGhost} disabled={!rows.data?.length} onClick={() => downloadCsv(`sponsorships-${new Date().toISOString().slice(0, 10)}.csv`, (rows.data ?? []).map((s) => ({
            paid_at: s.paid_at, name: s.name, email: s.email, country: s.country_of_residence, initiative: s.initiative_id ? title[s.initiative_id] : 'Where most needed',
            seats: s.seats, amount_naira: s.amount_kobo / 100, show_name_publicly: s.show_name_publicly,
          })))}>Export CSV</button>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[720px]">
            <thead className="text-left text-muted text-xs"><tr><th className="py-2">Paid</th><th>Name</th><th>Country</th><th>Initiative</th><th className="text-right">Seats</th><th className="text-right">Amount</th><th>Public</th></tr></thead>
            <tbody>
              {(rows.data ?? []).slice(0, 500).map((s) => (
                <tr key={s.id} className="border-t border-white/5">
                  <td className="py-2 text-xs text-muted whitespace-nowrap">{dt(s.paid_at)}</td>
                  <td>{s.name}<span className="block text-xs text-muted">{s.email}</span></td>
                  <td className="text-xs">{s.country_of_residence}</td>
                  <td className="text-xs">{s.initiative_id ? title[s.initiative_id] : 'Where most needed'}</td>
                  <td className="text-right">{s.seats || '—'}</td>
                  <td className="text-right">{ngn(s.amount_kobo)}</td>
                  <td className="text-xs">{s.show_name_publicly ? 'Yes' : 'No'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </AdminCard>
    </div>
  )
}
