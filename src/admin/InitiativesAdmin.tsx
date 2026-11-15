import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { invalidate } from '../lib/data'
import type { GivingExample, Initiative } from '../lib/types'
import { AdminCard, btn, btnGhost, inputCls, Msg, uploadImage, useQuery } from './shared'

export default function InitiativesAdmin() {
  const rows = useQuery<Initiative[]>(() => supabase.from('initiatives').select('*').order('sort_order'))
  const [open, setOpen] = useState<string | null>(null)
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted">Edit each initiative&rsquo;s page. Mark it Active when the work has started; Coming soon otherwise.</p>
      <Msg text={rows.error} tone="error" />
      {(rows.data ?? []).map((i) => (
        <AdminCard
          key={i.id}
          title={i.title}
          actions={
            <div className="flex items-center gap-3">
              <span className={`text-xs ${i.status === 'active' ? 'text-gold' : 'text-muted'}`}>{i.status === 'active' ? 'Active' : 'Coming soon'}</span>
              <button className={btnGhost} onClick={() => setOpen(open === i.id ? null : i.id)}>{open === i.id ? 'Close' : 'Edit'}</button>
            </div>
          }
        >
          {open === i.id ? <Editor i={i} onSaved={() => { invalidate('initiatives'); rows.reload() }} /> : <p className="text-sm text-ivory-2">{i.summary}</p>}
        </AdminCard>
      ))}
    </div>
  )
}

function Editor({ i, onSaved }: { i: Initiative; onSaved: () => void }) {
  const [v, setV] = useState({ ...i, giving_examples: i.giving_examples ?? [] })
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)
  const [err, setErr] = useState<string | null>(null)
  const set = (k: keyof Initiative) => (e: { target: { value: string } }) => setV({ ...v, [k]: e.target.value })

  function setEx(idx: number, patch: Partial<GivingExample>) {
    const next = [...v.giving_examples]
    next[idx] = { ...next[idx], ...patch }
    setV({ ...v, giving_examples: next })
  }

  async function save() {
    setBusy(true)
    setErr(null)
    setMsg(null)
    const { error } = await supabase
      .from('initiatives')
      .update({
        title: v.title, summary: v.summary, body: v.body, partner: v.partner || null, impact_label: v.impact_label || null,
        impact_value: v.impact_value || null, status: v.status, sort_order: Number(v.sort_order) || 0, hero_image: v.hero_image || null,
        giving_examples: v.giving_examples.filter((g) => g.provides.trim()),
      })
      .eq('id', i.id)
    setBusy(false)
    if (error) return setErr(error.message)
    setMsg('Saved.')
    onSaved()
  }

  async function onImage(file?: File) {
    if (!file) return
    setBusy(true)
    setErr(null)
    try {
      const url = await uploadImage(file, `initiatives/${i.slug}`)
      setV((x) => ({ ...x, hero_image: url }))
      setMsg('Image uploaded. Click Save to publish it.')
    } catch (e) {
      setErr((e as Error).message)
    }
    setBusy(false)
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <label className="text-sm md:col-span-2"><span className="label">Title</span><input className={inputCls} value={v.title} onChange={set('title')} /></label>
      <label className="text-sm md:col-span-2"><span className="label">Summary (one or two sentences)</span><textarea className={inputCls + ' min-h-20'} value={v.summary} onChange={set('summary')} /></label>
      <label className="text-sm md:col-span-2"><span className="label">Purpose and activities (page body)</span><textarea className={inputCls + ' min-h-40'} value={v.body} onChange={set('body')} /></label>
      <label className="text-sm"><span className="label">Status</span>
        <select className={inputCls} value={v.status} onChange={set('status')}><option value="active">Active</option><option value="coming_soon">Coming soon</option></select>
      </label>
      <label className="text-sm"><span className="label">Partner organisation (optional)</span><input className={inputCls} value={v.partner ?? ''} onChange={set('partner')} /></label>
      <label className="text-sm"><span className="label">Impact label</span><input className={inputCls} value={v.impact_label ?? ''} onChange={set('impact_label')} placeholder="e.g. Widows supported" /></label>
      <label className="text-sm"><span className="label">Impact value</span><input className={inputCls} value={v.impact_value ?? ''} onChange={set('impact_value')} placeholder="e.g. 120 (verified figures only)" /></label>
      <label className="text-sm"><span className="label">Order</span><input type="number" className={inputCls} value={v.sort_order} onChange={set('sort_order')} /></label>
      <div className="text-sm">
        <span className="label">Hero photo</span>
        <div className="flex items-center gap-3">
          {v.hero_image && <img src={v.hero_image} alt="" className="h-14 w-20 object-cover rounded" />}
          <input type="file" accept="image/*" onChange={(e) => onImage(e.target.files?.[0])} className="text-xs" />
        </div>
      </div>
      <div className="md:col-span-2">
        <span className="label">What support provides (shown on the page)</span>
        <div className="space-y-2">
          {v.giving_examples.map((g, idx) => (
            <div key={idx} className="flex gap-2">
              <input className={inputCls + ' !w-36'} type="number" placeholder="₦ amount" value={g.amount_naira ?? ''} onChange={(e) => setEx(idx, { amount_naira: e.target.value ? Number(e.target.value) : null })} />
              <input className={inputCls} placeholder="What it provides" value={g.provides} onChange={(e) => setEx(idx, { provides: e.target.value })} />
              <button className={btnGhost} onClick={() => setV({ ...v, giving_examples: v.giving_examples.filter((_, k) => k !== idx) })}>Remove</button>
            </div>
          ))}
          <button className={btnGhost} onClick={() => setV({ ...v, giving_examples: [...v.giving_examples, { amount_naira: null, provides: '' }] })}>Add example</button>
        </div>
      </div>
      <div className="md:col-span-2 flex items-center gap-4">
        <button className={btn} disabled={busy} onClick={save}>{busy ? 'Saving…' : 'Save'}</button>
        <Msg text={msg} /><Msg text={err} tone="error" />
      </div>
    </div>
  )
}
