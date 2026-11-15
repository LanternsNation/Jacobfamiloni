import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Notice, PageHeader } from '../components/ui'
import { NIGERIAN_STATES } from '../lib/content'
import { useSettings } from '../lib/data'
import { callFn } from '../lib/api'
import { isEmail, normalisePhone } from '../lib/validate'

const KINDS = [
  { value: 'volunteer', title: 'Volunteer', body: 'Give your time or skills to an initiative.' },
  { value: 'partner', title: 'Partner organisation', body: 'Schools, churches, companies and foundations.' },
  { value: 'recommend_widow', title: 'Recommend a widow', body: 'Tell us about a widow who would benefit.' },
  { value: 'recommend_home', title: 'Recommend an orphanage home', body: 'Introduce us to a home that needs support.' },
  { value: 'contact', title: 'General enquiry', body: 'Press, questions, anything else.' },
] as const

type Kind = (typeof KINDS)[number]['value']

export default function GetInvolved() {
  const { social } = useSettings()
  const [kind, setKind] = useState<Kind>('volunteer')
  const [form, setForm] = useState({ name: '', phone: '', email: '', state: '', details: '', consent: false, website: '' })
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  const placeholders: Record<Kind, string> = {
    volunteer: 'What would you like to help with? Any relevant skills?',
    partner: 'Your organisation, what you do, and how you’d like to work together.',
    recommend_widow: 'Her first name, community, and her situation. Please only share what she has agreed to share.',
    recommend_home: 'Name and location of the home, and a contact person.',
    contact: 'Your message.',
  }

  async function submit(e: FormEvent) {
    e.preventDefault()
    setErr(null)
    const phone = form.phone ? normalisePhone(form.phone) : null
    if (!form.name.trim()) return setErr('Please enter your name.')
    if (form.phone && !phone) return setErr('Please enter a valid phone number.')
    if (form.email && !isEmail(form.email)) return setErr('Please enter a valid email address.')
    if (!phone && !form.email) return setErr('Please give a phone number or an email so we can reply.')
    if (form.details.trim().length < 5) return setErr('Please add a few details.')
    if (!form.consent) return setErr('Please confirm you agree to the privacy policy.')
    setBusy(true)
    try {
      await callFn('submit-involvement', {
        kind,
        name: form.name.trim(),
        phone,
        email: form.email ? form.email.trim().toLowerCase() : null,
        state: form.state || null,
        details: form.details.trim(),
        consent: true,
        website: form.website,
      })
      setDone(true)
    } catch (e2) {
      setErr((e2 as Error).message)
    } finally {
      setBusy(false)
    }
  }

  const wa = social.whatsapp?.replace(/[^\d]/g, '')

  return (
    <>
      <PageHeader eyebrow="Get Involved / Contact" title="Lend a hand at home." intro="Volunteer, partner with us, or point us to someone who needs support." />
      <section className="container-x py-14 md:py-20 grid lg:grid-cols-12 gap-14">
        <div className="lg:col-span-7">
          {done ? (
            <div className="space-y-6">
              <p className="font-display text-4xl">Thank you. We&rsquo;ve received it.</p>
              <p className="text-ivory-2">The team reads every message and will reply by phone or email.</p>
              <button className="btn-ghost" onClick={() => { setDone(false); setForm({ ...form, details: '' }) }}>Send another</button>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-8" noValidate>
              <fieldset>
                <legend className="label">How would you like to help?</legend>
                <div className="grid sm:grid-cols-2 gap-3">
                  {KINDS.map((k) => (
                    <button
                      key={k.value}
                      type="button"
                      aria-pressed={kind === k.value}
                      onClick={() => setKind(k.value)}
                      className={`text-left rounded-lg border p-4 transition ${kind === k.value ? 'border-gold bg-gold/5' : 'border-ink-3 hover:border-gold/50'}`}
                    >
                      <span className="block font-medium">{k.title}</span>
                      <span className="block text-sm text-muted mt-1">{k.body}</span>
                    </button>
                  ))}
                </div>
              </fieldset>
              <div className="grid md:grid-cols-2 gap-5">
                <label className="block">
                  <span className="label">Your name</span>
                  <input className="field" autoComplete="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} maxLength={120} />
                </label>
                <label className="block">
                  <span className="label">State (optional)</span>
                  <select className="field" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })}>
                    <option value="">—</option>
                    {NIGERIAN_STATES.map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                    <option>Outside Nigeria</option>
                  </select>
                </label>
                <label className="block">
                  <span className="label">Phone</span>
                  <input className="field" type="tel" inputMode="tel" autoComplete="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                </label>
                <label className="block">
                  <span className="label">Email</span>
                  <input className="field" type="email" inputMode="email" autoComplete="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                </label>
              </div>
              <label className="block">
                <span className="label">Details</span>
                <textarea className="field min-h-36" maxLength={3000} placeholder={placeholders[kind]} value={form.details} onChange={(e) => setForm({ ...form, details: e.target.value })} />
              </label>
              <div aria-hidden className="absolute -left-[9999px] h-0 overflow-hidden">
                <input tabIndex={-1} autoComplete="off" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} />
              </div>
              <label className="flex items-start gap-3 text-sm text-ivory-2">
                <input type="checkbox" className="mt-1 h-5 w-5 accent-[#E04A5C]" checked={form.consent} onChange={(e) => setForm({ ...form, consent: e.target.checked })} />
                <span>
                  I agree my details will be used to respond to this request, as described in the{' '}
                  <Link to="/privacy" className="text-gold underline underline-offset-4">privacy policy</Link>.
                  {(kind === 'recommend_widow' || kind === 'recommend_home') && ' I have permission to share the details of the person or home I am recommending.'}
                </span>
              </label>
              {err && <Notice tone="error">{err}</Notice>}
              <button type="submit" disabled={busy} className="btn-gold w-full sm:w-auto">{busy ? 'Sending…' : 'Send'}</button>
            </form>
          )}
        </div>
        <aside className="lg:col-span-4 lg:col-start-9 space-y-6">
          <p className="font-display text-3xl">Prefer to talk?</p>
          {wa ? (
            <a className="btn-gold w-full" href={`https://wa.me/${wa}`} target="_blank" rel="noopener noreferrer">Chat on WhatsApp</a>
          ) : (
            <div className="placeholder-box rounded-lg p-4 text-sm">[PLACEHOLDER] WhatsApp number — add it in admin › Site settings</div>
          )}
        </aside>
      </section>
    </>
  )
}
