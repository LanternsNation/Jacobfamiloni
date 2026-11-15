import { useMemo, useState } from 'react'
import { supabase } from '../lib/supabase'
import { AdminCard, btnGhost, downloadCsv, dt, fetchAll, inputCls, Msg, useQuery } from './shared'

interface Req {
  id: string
  kind: string
  name: string
  phone: string | null
  email: string | null
  state: string | null
  details: string
  status: 'new' | 'in_review' | 'done'
  created_at: string
}

const KIND_LABEL: Record<string, string> = {
  volunteer: 'Volunteer',
  partner: 'Partner',
  recommend_widow: 'Recommend a widow',
  recommend_home: 'Recommend a home',
  contact: 'General enquiry',
}

export default function Requests() {
  const rows = useQuery<Req[]>(() => fetchAll<Req>((a, b) => supabase.from('involvement_requests').select('*').order('created_at', { ascending: false }).range(a, b)))
  const [kind, setKind] = useState('')
  const [status, setStatus] = useState('')
  const [err, setErr] = useState<string | null>(null)
  const list = useMemo(() => (rows.data ?? []).filter((r) => (!kind || r.kind === kind) && (!status || r.status === status)), [rows.data, kind, status])

  async function update(r: Req, s: string) {
    const { error } = await supabase.from('involvement_requests').update({ status: s }).eq('id', r.id)
    if (error) setErr(error.message)
    else rows.reload()
  }

  return (
    <AdminCard
      title={`Get Involved requests (${list.length})`}
      actions={<button className={btnGhost} disabled={!list.length} onClick={() => downloadCsv('get-involved.csv', list.map(({ id: _id, ...r }) => ({ ...r, kind: KIND_LABEL[r.kind] })))}>Export CSV</button>}
    >
      <div className="flex flex-wrap gap-2 mb-4">
        <select className={inputCls + ' !w-auto'} value={kind} onChange={(e) => setKind(e.target.value)}>
          <option value="">All types</option>
          {Object.entries(KIND_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <select className={inputCls + ' !w-auto'} value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All</option><option value="new">New</option><option value="in_review">In review</option><option value="done">Done</option>
        </select>
      </div>
      <Msg text={rows.error || err} tone="error" />
      <div className="space-y-3">
        {list.map((r) => (
          <article key={r.id} className="rounded-lg border border-white/10 p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs text-gold">{KIND_LABEL[r.kind]} · <span className="text-muted">{dt(r.created_at)}</span></p>
                <p className="mt-1 font-medium">{r.name}{r.state && <span className="text-muted text-sm"> · {r.state}</span>}</p>
                <p className="text-xs text-ivory-2 mt-1">
                  {r.phone && <a className="hover:text-gold mr-3" href={`tel:${r.phone}`}>{r.phone}</a>}
                  {r.email && <a className="hover:text-gold" href={`mailto:${r.email}`}>{r.email}</a>}
                </p>
              </div>
              <select className="bg-ink-3 rounded px-2 py-1 text-xs" value={r.status} onChange={(e) => update(r, e.target.value)}>
                <option value="new">New</option><option value="in_review">In review</option><option value="done">Done</option>
              </select>
            </div>
            <p className="mt-3 text-sm text-ivory-2 whitespace-pre-line">{r.details}</p>
          </article>
        ))}
        {!rows.loading && !list.length && <p className="text-sm text-muted">Nothing here yet.</p>}
      </div>
    </AdminCard>
  )
}
