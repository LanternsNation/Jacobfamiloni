import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { invalidate } from '../lib/data'
import { CATEGORY_LABEL, type GalleryCategory, type GalleryItem, type Initiative } from '../lib/types'
import { AdminCard, btn, btnGhost, inputCls, Msg, uploadImage, useQuery } from './shared'

const EMPTY: Omit<GalleryItem, 'id'> = {
  title: '', caption: '', place: '', date_taken: null, image_url: null, video_url: null, initiative_id: null,
  category: 'visit', is_published: false, sort_order: 0,
}

export default function GalleryAdmin() {
  const rows = useQuery<GalleryItem[]>(() => supabase.from('gallery_items').select('*').order('sort_order').order('created_at', { ascending: false }))
  const inits = useQuery<Initiative[]>(() => supabase.from('initiatives').select('*').order('sort_order'))
  const [editing, setEditing] = useState<GalleryItem | (Omit<GalleryItem, 'id'> & { id?: undefined }) | null>(null)

  const refresh = () => {
    invalidate('gallery')
    rows.reload()
  }

  return (
    <div className="space-y-6">
      <AdminCard title="Gallery and videos" actions={<button className={btn} onClick={() => setEditing({ ...EMPTY })}>Add item</button>}>
        <p className="text-sm text-muted mb-4">
          Label prominent people only as a <strong>visit</strong> or <strong>meeting</strong>, never as an endorsement. In the title, give elders and leaders their title (e.g. <em>Baba Obasanjo</em>, <em>Papa Adeboye</em>, <em>His Excellency</em>), never the surname alone; the title becomes the headline in His Journey. Show widows and children with dignity, and only with consent.
        </p>
        <Msg text={rows.error} tone="error" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {(rows.data ?? []).map((g) => (
            <button key={g.id} className="text-left group" onClick={() => setEditing(g)}>
              <div className="aspect-[4/5] rounded overflow-hidden bg-ink-3 grid place-items-center">
                {g.image_url ? <img src={g.image_url} alt="" className="h-full w-full object-cover" loading="lazy" /> : <span className="text-xs text-muted">No image</span>}
              </div>
              <p className="mt-2 text-xs text-gold">{CATEGORY_LABEL[g.category]} {g.is_published ? '' : '· Hidden'}</p>
              <p className="text-sm line-clamp-2 group-hover:text-gold">{g.caption || g.title}</p>
            </button>
          ))}
        </div>
      </AdminCard>
      {editing && <Editor item={editing} initiatives={inits.data ?? []} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); refresh() }} />}
    </div>
  )
}

function Editor({ item, initiatives, onClose, onSaved }: {
  item: GalleryItem | (Omit<GalleryItem, 'id'> & { id?: undefined })
  initiatives: Initiative[]
  onClose: () => void
  onSaved: () => void
}) {
  const [v, setV] = useState(item)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const set = (k: keyof GalleryItem) => (e: { target: { value: string } }) => setV({ ...v, [k]: e.target.value })

  async function onImage(file?: File) {
    if (!file) return
    setBusy(true)
    setErr(null)
    try {
      const url = await uploadImage(file, 'gallery')
      setV((x) => ({ ...x, image_url: url }))
    } catch (e) {
      setErr((e as Error).message)
    }
    setBusy(false)
  }

  async function save() {
    if (!v.title.trim()) return setErr('Please add a title.')
    if (v.is_published && (!v.place || !v.date_taken) && v.category !== 'initiative') {
      if (!confirm('This item has no place or date. Publish anyway?')) return
    }
    setBusy(true)
    setErr(null)
    const payload = {
      title: v.title.trim(), caption: v.caption, place: v.place || null, date_taken: v.date_taken || null, image_url: v.image_url,
      video_url: v.video_url || null, initiative_id: v.initiative_id || null, category: v.category, is_published: v.is_published, sort_order: Number(v.sort_order) || 0,
    }
    const { error } = v.id ? await supabase.from('gallery_items').update(payload).eq('id', v.id) : await supabase.from('gallery_items').insert(payload)
    setBusy(false)
    if (error) return setErr(error.message)
    onSaved()
  }

  async function remove() {
    if (!v.id || !confirm('Delete this item? This cannot be undone.')) return
    const { error } = await supabase.from('gallery_items').delete().eq('id', v.id)
    if (error) return setErr(error.message)
    onSaved()
  }

  return (
    <AdminCard title={v.id ? 'Edit item' : 'New item'} actions={<button className={btnGhost} onClick={onClose}>Close</button>}>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="md:row-span-4">
          <div className="aspect-[4/5] rounded overflow-hidden bg-ink-3 grid place-items-center">
            {v.image_url ? <img src={v.image_url} alt="" className="h-full w-full object-cover" /> : <span className="text-xs text-muted">No image</span>}
          </div>
          <input type="file" accept="image/*" className="mt-2 text-xs" onChange={(e) => onImage(e.target.files?.[0])} />
          <p className="text-xs text-muted mt-1">Converted to WebP and resized automatically before upload.</p>
        </div>
        <label className="text-sm"><span className="label">Title (internal)</span><input className={inputCls} value={v.title} onChange={set('title')} /></label>
        <label className="text-sm"><span className="label">Caption (shown)</span><textarea className={inputCls + ' min-h-20'} value={v.caption} onChange={set('caption')} placeholder="e.g. Courtesy visit to …" /></label>
        <div className="grid grid-cols-2 gap-3">
          <label className="text-sm"><span className="label">Place</span><input className={inputCls} value={v.place ?? ''} onChange={set('place')} /></label>
          <label className="text-sm"><span className="label">Date</span><input type="date" className={inputCls} value={v.date_taken ?? ''} onChange={set('date_taken')} /></label>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <label className="text-sm"><span className="label">Category</span>
            <select className={inputCls} value={v.category} onChange={(e) => setV({ ...v, category: e.target.value as GalleryCategory })}>
              {Object.entries(CATEGORY_LABEL).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
            </select>
          </label>
          <label className="text-sm"><span className="label">Initiative</span>
            <select className={inputCls} value={v.initiative_id ?? ''} onChange={set('initiative_id')}>
              <option value="">None</option>
              {initiatives.map((i) => <option key={i.id} value={i.id}>{i.title}</option>)}
            </select>
          </label>
        </div>
        <label className="text-sm"><span className="label">Video link (optional, YouTube)</span><input className={inputCls} value={v.video_url ?? ''} onChange={set('video_url')} /></label>
        <div className="grid grid-cols-2 gap-3 items-end">
          <label className="text-sm"><span className="label">Order</span><input type="number" className={inputCls} value={v.sort_order} onChange={set('sort_order')} /></label>
          <label className="flex items-center gap-2 text-sm pb-2">
            <input type="checkbox" className="h-4 w-4 accent-[#E04A5C]" checked={v.is_published} onChange={(e) => setV({ ...v, is_published: e.target.checked })} />
            Published
          </label>
        </div>
        <div className="md:col-span-2 flex flex-wrap items-center gap-3">
          <button className={btn} disabled={busy} onClick={save}>{busy ? 'Saving…' : 'Save'}</button>
          {v.id && <button className={btnGhost} onClick={remove}>Delete</button>}
          <Msg text={err} tone="error" />
        </div>
      </div>
    </AdminCard>
  )
}
