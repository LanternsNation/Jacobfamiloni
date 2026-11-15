import { useState, type FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Notice, PageHeader } from '../components/ui'
import { AGE_RANGES, NIGERIAN_STATES } from '../lib/content'
import { formatDate, useOpenCohort, useTracks } from '../lib/data'
import { callFn, rememberApplication, type ApplicationResult, type InitResult } from '../lib/api'
import { getReferral } from '../lib/referral'
import { isEmail, normalisePhone } from '../lib/validate'

type SeatChoice = 'pay' | 'sponsored'

export default function Apply() {
  const tracks = useTracks()
  const cohort = useOpenCohort()
  const nav = useNavigate()
  const [params] = useSearchParams()
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const [seat, setSeat] = useState<SeatChoice>('pay')
  const [form, setForm] = useState({
    full_name: '',
    phone: '',
    email: '',
    state: '',
    lga: '',
    age_range: '',
    track_id: params.get('track') ?? '',
    motivation: '',
    consent: false,
    website: '', // honeypot: real people never see or fill this
  })
  const set = (k: keyof typeof form) => (e: { target: { value: string } }) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const c = cohort.data
  const closed = !cohort.loading && !c

  async function submit(e: FormEvent) {
    e.preventDefault()
    setErr(null)
    const phone = normalisePhone(form.phone)
    if (form.full_name.trim().length < 2) return setErr('Please enter your full name.')
    if (!phone) return setErr('Please enter a valid phone number, e.g. 08012345678.')
    if (!isEmail(form.email)) return setErr('Please enter a valid email address.')
    if (!form.state || !form.lga.trim()) return setErr('Please choose your state and enter your LGA.')
    if (!form.age_range) return setErr('Please choose your age range.')
    if (!form.track_id) return setErr('Please choose a track.')
    if (!form.consent) return setErr('Please confirm you agree to how we use your information.')
    if (!c) return setErr('Applications are closed right now.')

    setBusy(true)
    try {
      const res = await callFn<ApplicationResult>('submit-application', {
        full_name: form.full_name.trim(),
        phone,
        email: form.email.trim().toLowerCase(),
        state: form.state,
        lga: form.lga.trim(),
        age_range: form.age_range,
        track_id: form.track_id,
        cohort_id: c.id,
        motivation: form.motivation.trim(),
        request_sponsored_seat: seat === 'sponsored',
        referred_by: getReferral(),
        consent: true,
        website: form.website,
      })
      rememberApplication({ referral_code: res.referral_code, status: res.status, first_name: form.full_name.trim().split(' ')[0] })

      if (seat === 'pay') {
        const init = await callFn<InitResult>('paystack-init', {
          kind: 'commitment',
          applicant_id: res.applicant_id,
          email: form.email.trim().toLowerCase(),
        })
        window.location.assign(init.authorization_url)
        return
      }
      nav('/apply/done')
    } catch (e2) {
      setErr((e2 as Error).message)
      setBusy(false)
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="Familoni AI School"
        title="Apply for a seat."
        intro={
          <>
            {c ? <>{c.name}{c.starts_on ? ` · starts ${formatDate(c.starts_on)}` : ' · start date to be announced'}. </> : null}
            It takes about three minutes. A ₦2,000 commitment fee secures your seat, or you can request a sponsored seat.
          </>
        }
      />
      <section className="container-x py-14 md:py-20 max-w-3xl">
        {closed ? (
          <Notice>Applications are closed right now. Please check back soon.</Notice>
        ) : (
          <form onSubmit={submit} className="space-y-6" noValidate>
            <div className="grid md:grid-cols-2 gap-6">
              <Field label="Full name">
                <input className="field" autoComplete="name" value={form.full_name} onChange={set('full_name')} required maxLength={120} />
              </Field>
              <Field label="Phone (WhatsApp preferred)">
                <input className="field" type="tel" inputMode="tel" autoComplete="tel" placeholder="080…" value={form.phone} onChange={set('phone')} required />
              </Field>
              <Field label="Email">
                <input className="field" type="email" inputMode="email" autoComplete="email" value={form.email} onChange={set('email')} required />
              </Field>
              <Field label="Age range">
                <select className="field" value={form.age_range} onChange={set('age_range')} required>
                  <option value="">Choose…</option>
                  {AGE_RANGES.map((a) => (
                    <option key={a} value={a}>{a}</option>
                  ))}
                </select>
              </Field>
              <Field label="State">
                <select className="field" value={form.state} onChange={set('state')} required>
                  <option value="">Choose…</option>
                  {NIGERIAN_STATES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </Field>
              <Field label="LGA">
                <input className="field" value={form.lga} onChange={set('lga')} required maxLength={80} />
              </Field>
            </div>

            <fieldset>
              <legend className="label">Track</legend>
              <div className="grid sm:grid-cols-2 gap-3">
                {(tracks.data ?? []).map((t) => (
                  <label
                    key={t.id}
                    className={`cursor-pointer rounded-lg border p-4 transition ${form.track_id === t.id ? 'border-gold bg-gold/5' : 'border-ink-3 hover:border-gold/50'}`}
                  >
                    <input type="radio" name="track" className="sr-only" value={t.id} checked={form.track_id === t.id} onChange={set('track_id')} />
                    <span className="block font-medium">{t.title}</span>
                    <span className="block text-sm text-muted mt-1">{t.summary}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            <Field label="Why do you want to join? (optional)">
              <textarea className="field min-h-28" maxLength={1000} value={form.motivation} onChange={set('motivation')} />
            </Field>

            <fieldset>
              <legend className="label">Your seat</legend>
              <div className="grid sm:grid-cols-2 gap-3">
                <SeatOption active={seat === 'pay'} onClick={() => setSeat('pay')} title="Pay ₦2,000 commitment fee" body="Secures your seat now. Paid securely with Paystack." />
                <SeatOption active={seat === 'sponsored'} onClick={() => setSeat('sponsored')} title="Request a sponsored seat" body="Can’t pay? Join the sponsored waitlist. Seats go out in order of application." />
              </div>
            </fieldset>

            {/* honeypot */}
            <div aria-hidden className="absolute -left-[9999px] h-0 overflow-hidden">
              <label>Website<input tabIndex={-1} autoComplete="off" value={form.website} onChange={set('website')} /></label>
            </div>

            <label className="flex items-start gap-3 text-sm text-ivory-2">
              <input
                type="checkbox"
                className="mt-1 h-5 w-5 accent-[#C9A24A]"
                checked={form.consent}
                onChange={(e) => setForm((f) => ({ ...f, consent: e.target.checked }))}
              />
              <span>
                I am 18 or older, and I agree that my details will be used to process my application and contact me about the AI School, as described in the{' '}
                <Link to="/privacy" className="text-gold underline underline-offset-4">privacy policy</Link>.
              </span>
            </label>

            {err && <Notice tone="error">{err}</Notice>}

            <button type="submit" disabled={busy} className="btn-gold w-full md:w-auto">
              {busy ? 'Please wait…' : seat === 'pay' ? 'Continue to payment' : 'Submit application'}
            </button>
          </form>
        )}
      </section>
    </>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="label">{label}</span>
      {children}
    </label>
  )
}

function SeatOption({ active, onClick, title, body }: { active: boolean; onClick: () => void; title: string; body: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`text-left rounded-lg border p-4 transition ${active ? 'border-gold bg-gold/5' : 'border-ink-3 hover:border-gold/50'}`}
    >
      <span className="block font-medium">{title}</span>
      <span className="block text-sm text-muted mt-1">{body}</span>
    </button>
  )
}
