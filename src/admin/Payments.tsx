import { useMemo, useState } from 'react'
import { supabase } from '../lib/supabase'
import { AdminCard, btnGhost, downloadCsv, dt, fetchAll, inputCls, Msg, ngn, Stat, useQuery } from './shared'

interface Pay {
  id: string
  reference: string
  kind: 'commitment' | 'sponsorship'
  amount_kobo: number
  currency: string
  status: string
  payer_email: string
  paid_at: string | null
  created_at: string
  raw_event: { channel?: string; gateway_response?: string } | null
}

export default function Payments() {
  const rows = useQuery<Pay[]>(() => fetchAll<Pay>((a, b) => supabase.from('payments').select('*').order('created_at', { ascending: false }).range(a, b)))
  const [kind, setKind] = useState('')
  const [status, setStatus] = useState('success')

  const list = useMemo(() => (rows.data ?? []).filter((p) => (!kind || p.kind === kind) && (!status || p.status === status)), [rows.data, kind, status])
  const ok = (rows.data ?? []).filter((p) => p.status === 'success')
  const sum = (k?: string) => ok.filter((p) => !k || p.kind === k).reduce((a, p) => a + p.amount_kobo, 0)

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Stat label="Total received" value={ngn(sum())} />
        <Stat label="Commitment fees" value={ngn(sum('commitment'))} />
        <Stat label="Sponsorships & gifts" value={ngn(sum('sponsorship'))} />
        <Stat label="Successful payments" value={ok.length} />
      </div>
      <AdminCard
        title={`Payments (${list.length})`}
        actions={
          <button
            className={btnGhost}
            disabled={!list.length}
            onClick={() =>
              downloadCsv(`payments-${new Date().toISOString().slice(0, 10)}.csv`, list.map((p) => ({
                created_at: p.created_at, paid_at: p.paid_at ?? '', reference: p.reference, kind: p.kind,
                amount_naira: p.amount_kobo / 100, currency: p.currency, status: p.status, payer_email: p.payer_email, channel: p.raw_event?.channel ?? '',
              })))
            }
          >
            Export CSV
          </button>
        }
      >
        <div className="flex flex-wrap gap-2 mb-4">
          <select className={inputCls + ' !w-auto'} value={kind} onChange={(e) => setKind(e.target.value)}>
            <option value="">All types</option><option value="commitment">Commitment fee</option><option value="sponsorship">Sponsorship / gift</option>
          </select>
          <select className={inputCls + ' !w-auto'} value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">All statuses</option><option value="success">Success</option><option value="pending">Pending</option><option value="failed">Failed</option><option value="abandoned">Abandoned</option>
          </select>
        </div>
        <Msg text={rows.error} tone="error" />
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[720px]">
            <thead className="text-left text-muted text-xs"><tr><th className="py-2">Date</th><th>Reference</th><th>Type</th><th>Payer</th><th className="text-right">Amount</th><th>Status</th></tr></thead>
            <tbody>
              {list.slice(0, 500).map((p) => (
                <tr key={p.id} className="border-t border-white/5">
                  <td className="py-2 text-xs text-muted whitespace-nowrap">{dt(p.paid_at ?? p.created_at)}</td>
                  <td className="font-mono text-xs">{p.reference}</td>
                  <td className="text-xs">{p.kind === 'commitment' ? 'Commitment fee' : 'Sponsorship'}</td>
                  <td className="text-xs">{p.payer_email}</td>
                  <td className="text-right">{ngn(p.amount_kobo)}</td>
                  <td className={`text-xs ${p.status === 'success' ? 'text-emerald-300' : p.status === 'pending' ? 'text-gold' : 'text-red-300'}`}>{p.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </AdminCard>
    </div>
  )
}
