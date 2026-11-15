import { useMemo, useState, type FormEvent } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Notice, PageHeader, ImpactCounter } from '../components/ui'
import { naira, useInitiatives, useSettings } from '../lib/data'
import { callFn, type InitResult } from '../lib/api'
import { isEmail } from '../lib/validate'

export const SEAT_PRICE = 2000
const SEAT_BUNDLES = [
  { seats: 1, label: '1 seat' },
  { seats: 5, label: '5 seats' },
  { seats: 50, label: 'A class (50 seats)' },
]
const GIFT_PRESETS = [5000, 10000, 25000, 50000]
const MIN_GIFT = 1000

const COUNTRIES = ['Nigeria', 'United States', 'United Kingdom', 'Canada', 'Ireland', 'Germany', 'Netherlands', 'South Africa', 'Ghana', 'United Arab Emirates', 'Australia', 'Other']

export default function Support() {
  const [params] = useSearchParams()
  const { data: initiatives } = useInitiatives()
  const { entity } = useSettings()
  const [target, setTarget] = useState<string>(params.get('initiative') ?? 'ai-school') // slug or 'most-needed'
  const [seats, setSeats] = useState<number | null>(1)
  const [amount, setAmount] = useState<number | null>(null)
  const [custom, setCustom] = useState('')
  const [form, setForm] = useState({ name: '', email: '', country: 'Nigeria', show_name_publicly: false, consent: false, website: '' })
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  const isSchool = target === 'ai-school'
  const total = useMemo(() => {
    if (isSchool && seats) return seats * SEAT_PRICE
    if (custom) return Math.floor(Number(custom.replace(/[^\d]/g, '')) || 0)
    return amount ?? 0
  }, [isSchool, seats, custom, amount])
  const seatsFromTotal = isSchool ? Math.floor(total / SEAT_PRICE) : 0
  const targetTitle = target === 'most-needed' ? 'Where most needed' : initiatives?.find((i) => i.slug === target)?.title ?? ''

  function pickTarget(slug: string) {
    setTarget(slug)
    setCustom('')
    setErr(null)
    if (slug === 'ai-school') {
      setSeats(1)
      setAmount(null)
    } else {
      setSeats(null)
      setAmount(10000)
    }
  }

  async function submit(e: FormEvent) {
    e.preventDefault()
    setErr(null)
    if (!form.name.trim()) return setErr('Please enter your name.')
    if (!isEmail(form.email)) return setErr('Please enter a valid email address for your receipt.')
    if (total < MIN_GIFT) return setErr(`The minimum gift is ${naira(MIN_GIFT)}.`)
    if (total > 50_000_000) return setErr('For gifts above ₦50 million, please contact us directly.')
    if (isSchool && seatsFromTotal < 1) return setErr(`A seat is ${naira(SEAT_PRICE)}.`)
    if (!form.consent) return setErr('Please confirm you agree to the privacy policy.')
    setBusy(true)
    try {
      const init = await callFn<InitResult>('paystack-init', {
        kind: 'sponsorship',
        initiative_slug: target === 'most-needed' ? null : target,
        seats: isSchool && seats && !custom ? seats : null,
        amount_naira: total,
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        country_of_residence: form.country,
        show_name_publicly: form.show_name_publicly,
        website: form.website,
      })
      window.location.assign(init.authorization_url)
    } catch (e2) {
      setErr((e2 as Error).message)
      setBusy(false)
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="Support / Sponsor a Seat"
        title={<>Put a young Nigerian <em className="italic font-light text-gold">in the room.</em></>}
        intro="₦2,000 sponsors one seat in the AI School. You can also give to any of his initiatives, or where the need is greatest. Every naira funds the work in Nigeria."
      />

      <section className="container-x py-14 md:py-20 grid lg:grid-cols-12 gap-14">
        <form onSubmit={submit} className="lg:col-span-7 space-y-10" noValidate>
          <fieldset>
            <legend className="eyebrow mb-4">1 · Choose where it goes</legend>
            <div className="grid sm:grid-cols-2 gap-3">
              {(initiatives ?? []).map((i) => (
                <Choice key={i.slug} active={target === i.slug} onClick={() => pickTarget(i.slug)} title={i.title} sub={i.status === 'active' ? 'Active' : 'Coming soon'} />
              ))}
              <Choice active={target === 'most-needed'} onClick={() => pickTarget('most-needed')} title="Where most needed" sub="Across all initiatives" />
            </div>
          </fieldset>

          <fieldset>
            <legend className="eyebrow mb-4">2 · Choose an amount</legend>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {isSchool
                ? SEAT_BUNDLES.map((b) => (
                    <Choice
                      key={b.seats}
                      active={seats === b.seats && !custom}
                      onClick={() => {
                        setSeats(b.seats)
                        setCustom('')
                      }}
                      title={naira(b.seats * SEAT_PRICE)}
                      sub={b.label}
                    />
                  ))
                : GIFT_PRESETS.map((a) => (
                    <Choice
                      key={a}
                      active={amount === a && !custom}
                      onClick={() => {
                        setAmount(a)
                        setCustom('')
                      }}
                      title={naira(a)}
                    />
                  ))}
              <label className={`rounded-lg border p-3 ${custom ? 'border-gold bg-gold/5' : 'border-ink-3'}`}>
                <span className="block text-xs text-muted">Custom (₦)</span>
                <input
                  className="w-full bg-transparent text-lg outline-none"
                  inputMode="numeric"
                  placeholder={isSchool ? '4000' : '1000+'}
                  value={custom}
                  onChange={(e) => {
                    setCustom(e.target.value.replace(/[^\d]/g, ''))
                    setSeats(null)
                    setAmount(null)
                  }}
                />
              </label>
            </div>
            {total > 0 && (
              <p className="mt-4 text-ivory-2">
                {naira(total)} {isSchool ? <>sponsors <span className="text-gold">{seatsFromTotal} seat{seatsFromTotal === 1 ? '' : 's'}</span></> : <>to <span className="text-gold">{targetTitle}</span></>}
              </p>
            )}
          </fieldset>

          <fieldset className="space-y-5">
            <legend className="eyebrow mb-4">3 · Your details</legend>
            <div className="grid md:grid-cols-2 gap-5">
              <label className="block">
                <span className="label">Full name</span>
                <input className="field" autoComplete="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} maxLength={120} />
              </label>
              <label className="block">
                <span className="label">Email (for your receipt)</span>
                <input className="field" type="email" inputMode="email" autoComplete="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </label>
              <label className="block md:col-span-2">
                <span className="label">Country of residence</span>
                <select className="field" value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })}>
                  {COUNTRIES.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </label>
            </div>
            <div aria-hidden className="absolute -left-[9999px] h-0 overflow-hidden">
              <input tabIndex={-1} autoComplete="off" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} />
            </div>
            <label className="flex items-start gap-3 text-sm text-ivory-2">
              <input type="checkbox" className="mt-1 h-5 w-5 accent-[#C9A24A]" checked={form.show_name_publicly} onChange={(e) => setForm({ ...form, show_name_publicly: e.target.checked })} />
              <span>Show my name and country on the supporters wall (optional).</span>
            </label>
            <label className="flex items-start gap-3 text-sm text-ivory-2">
              <input type="checkbox" className="mt-1 h-5 w-5 accent-[#C9A24A]" checked={form.consent} onChange={(e) => setForm({ ...form, consent: e.target.checked })} />
              <span>
                I agree my details will be used to process this gift and send my receipt, as described in the{' '}
                <Link to="/privacy" className="text-gold underline underline-offset-4">privacy policy</Link>.
              </span>
            </label>
          </fieldset>

          {err && <Notice tone="error">{err}</Notice>}

          <div>
            <button type="submit" disabled={busy || total <= 0} className="btn-gold w-full sm:w-auto">
              {busy ? 'Opening secure checkout…' : `Give ${total > 0 ? naira(total) : ''} securely`}
            </button>
            <p className="mt-4 text-xs text-muted leading-relaxed max-w-lg">
              Payments are processed by Paystack and charged in naira. Cards from outside Nigeria are accepted; your bank converts the amount. Gifts are received by {entity.name}
              {entity.rc_number ? ` (RC ${entity.rc_number})` : ''} and fund Dr. Familoni&rsquo;s initiatives in Nigeria only.
            </p>
          </div>
        </form>

        <aside className="lg:col-span-5 space-y-10">
          <div className="grain bg-ink-2 p-6 md:p-8 rounded-sm">
            <div className="relative z-[2]">
              <p className="eyebrow mb-8">So far</p>
              <ImpactCounter compact />
            </div>
          </div>
          <div className="text-sm text-ivory-2 leading-relaxed space-y-3">
            <p className="font-display text-2xl text-ivory">How sponsored seats work</p>
            <p>Young Nigerians who can&rsquo;t pay the ₦2,000 commitment fee join a sponsored waitlist. Each seat you fund goes to the next person on that list, in the order they applied.</p>
            <p>The counter shows both seats sponsored and students placed, so you can see where your gift went.</p>
          </div>
        </aside>
      </section>
    </>
  )
}

function Choice({ active, onClick, title, sub }: { active: boolean; onClick: () => void; title: string; sub?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`text-left rounded-lg border p-3 transition ${active ? 'border-gold bg-gold/5' : 'border-ink-3 hover:border-gold/50'}`}
    >
      <span className="block font-medium leading-snug">{title}</span>
      {sub && <span className="block text-xs text-muted mt-1">{sub}</span>}
    </button>
  )
}
