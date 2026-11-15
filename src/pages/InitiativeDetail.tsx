import { Link, useParams } from 'react-router-dom'
import { Reveal } from '../components/Reveal'
import { CountUp, GalleryCard, MediaImage, Notice, SectionHeading, StatusPill } from '../components/ui'
import { educationConvictions } from '../lib/content'
import { formatDate, naira, useGallery, useImpact, useInitiatives, useOpenCohort, useTracks } from '../lib/data'
import type { Initiative } from '../lib/types'
import NotFound from './NotFound'

export default function InitiativeDetail() {
  const { slug } = useParams()
  const { data, loading } = useInitiatives()
  const gallery = useGallery()
  const impact = useImpact()

  if (loading) return <div className="min-h-[70vh] grid place-items-center text-muted">Loading…</div>
  const i = data?.find((x) => x.slug === slug)
  if (!i) return <NotFound />

  const photos = (gallery.data ?? []).filter((g) => g.initiative_id === i.id)
  const liveValue = i.slug === 'ai-school' ? impact?.seats_secured : undefined
  const sponsorsHere = impact?.by_initiative?.[i.slug]

  return (
    <>
      <header className="grain relative min-h-[78svh] flex items-end overflow-hidden">
        <div className="absolute inset-0">
          {i.hero_image ? (
            <MediaImage src={i.hero_image} alt="" className="h-full w-full opacity-60" />
          ) : (
            // No hero photo yet (add one in admin › Initiatives): warm cinematic field instead of a placeholder box
            <div className="h-full w-full bg-[radial-gradient(120%_80%_at_75%_15%,#2a2416_0%,#121828_50%,#0b0f1a_80%)]" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/70 to-ink/20" />
        </div>
        <div className="container-x relative z-[2] pb-14 md:pb-20 pt-32">
          <Link to="/initiatives" className="text-sm text-ivory-2 hover:text-gold">← All initiatives</Link>
          <div className="mt-6"><StatusPill status={i.status} /></div>
          <h1 className="mt-4 text-5xl md:text-8xl max-w-5xl text-balance">{i.title}</h1>
          <p className="mt-6 text-lg md:text-xl text-ivory-2 max-w-2xl">{i.summary}</p>
          {i.partner && <p className="mt-4 text-sm text-gold-soft">In partnership with {i.partner}</p>}
        </div>
      </header>

      <section className="container-x py-20 md:py-28 grid md:grid-cols-12 gap-12">
        <div className="md:col-span-7">
          <Reveal>
            <p className="eyebrow">Purpose and activities</p>
            <div className="mt-6 text-lg leading-relaxed text-ivory-2 whitespace-pre-line">{i.body}</div>
          </Reveal>
        </div>
        <aside className="md:col-span-4 md:col-start-9 space-y-10">
          <Reveal className="border-t border-gold/30 pt-6">
            <p className="font-display text-6xl leading-none">
              {liveValue !== undefined ? <CountUp value={liveValue} /> : i.impact_value ? i.impact_value : <span className="text-gold/60 text-4xl">—</span>}
            </p>
            <p className="mt-3 text-sm text-ivory-2">{i.impact_label || 'Impact'}</p>
            {sponsorsHere ? <p className="mt-2 text-xs text-muted">{sponsorsHere} supporters so far</p> : null}
          </Reveal>
          {i.status === 'active' ? (
            <Link to={`/support?initiative=${i.slug}`} className="btn-gold w-full">Support this initiative</Link>
          ) : (
            <div className="space-y-3">
              <Notice>This initiative is coming soon. You can already support it or tell us how you&rsquo;d like to help.</Notice>
              <Link to={`/support?initiative=${i.slug}`} className="btn-gold w-full">Support this initiative</Link>
              <Link to="/get-involved" className="btn-ghost w-full">Get involved</Link>
            </div>
          )}
        </aside>
      </section>

      {i.slug === 'ai-school' && <AiSchoolDetails />}

      <GivingExamples i={i} />

      <section className="container-x py-20">
        <SectionHeading eyebrow="In pictures" title="The work, as it happens" />
        <div className="mt-12 grid grid-cols-2 md:grid-cols-3 gap-5">
          {photos.length ? (
            photos.map((g) => <GalleryCard key={g.id} g={g} />)
          ) : (
            <p className="col-span-full text-muted">Photos will appear here as the work begins.</p>
          )}
        </div>
      </section>
    </>
  )
}

function GivingExamples({ i }: { i: Initiative }) {
  const ex = (i.giving_examples ?? []).filter((g) => g.provides)
  if (!ex.length) return null
  return (
    <section className="grain bg-ink-2 py-20 md:py-28">
      <div className="container-x relative z-[2]">
        <SectionHeading eyebrow="What your support provides" title="Gifts, made tangible" />
        <div className="mt-12 grid md:grid-cols-3 gap-8">
          {ex.map((g, k) => (
            <Reveal key={k} delay={k * 0.05} className="border-t border-gold/30 pt-6">
              <p className="font-display text-5xl text-gold">{g.amount_naira ? naira(g.amount_naira) : '₦ —'}</p>
              <p className="mt-3 text-ivory-2">{g.provides}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

const FAQ = [
  { q: 'Who can apply?', a: 'Young Nigerians aged 18 to 35, anywhere in the country. You need a phone and an email address.' },
  { q: 'What does it cost?', a: 'A ₦2,000 commitment fee secures your seat. It helps make sure everyone who signs up shows up.' },
  { q: 'What if I can’t pay the fee?', a: 'Choose “Request a sponsored seat” on the application. Sponsored seats are given to waitlisted applicants in the order they applied.' },
  { q: 'How are classes delivered?', a: '[PLACEHOLDER — format to be confirmed: live online, recorded, or learning hubs.]' },
  { q: 'Who teaches?', a: '[PLACEHOLDER — instructors to be confirmed.]' },
  { q: 'When does the cohort start?', a: 'The start date is shown above. Everyone who secures a seat receives the date and the WhatsApp community link.' },
]

function AiSchoolDetails() {
  const tracks = useTracks()
  const cohort = useOpenCohort()
  const c = cohort.data
  return (
    <section className="container-x pb-20 md:pb-28 space-y-24">
      <div>
        <SectionHeading eyebrow="The conviction behind it" title={<>Skills that lead <em className="italic font-light text-gold">to work.</em></>} intro="Dr. Familoni believes a young person's future depends on how well they are prepared for it. The AI School is built on four convictions." />
        <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {educationConvictions.map((c, k) => (
            <Reveal key={c.title} delay={k * 0.05} className="border-t border-gold/30 pt-6">
              <p className="font-display italic text-gold">{String(k + 1).padStart(2, '0')}</p>
              <h3 className="mt-3 text-2xl">{c.title}</h3>
              <p className="mt-3 text-ivory-2 leading-relaxed">{c.body}</p>
            </Reveal>
          ))}
        </div>
      </div>

      <div>
        <SectionHeading eyebrow="Choose your track" title="Four tracks" />
        <div className="mt-12 grid md:grid-cols-2 gap-x-12">
          {(tracks.data ?? []).map((t, k) => (
            <Reveal key={t.id} delay={k * 0.05} className="border-t border-gold/30 py-6">
              <h3 className="text-3xl">{t.title}</h3>
              <p className="mt-3 text-ivory-2">{t.summary}</p>
            </Reveal>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <Reveal className="border-t border-gold/30 pt-6">
          <p className="eyebrow">Cohort</p>
          <p className="mt-3 font-display text-3xl">{c?.name ?? '—'}</p>
        </Reveal>
        <Reveal className="border-t border-gold/30 pt-6">
          <p className="eyebrow">Starts</p>
          <p className="mt-3 font-display text-3xl">{c?.starts_on ? formatDate(c.starts_on) : 'Date to be announced'}</p>
        </Reveal>
        <Reveal className="border-t border-gold/30 pt-6">
          <p className="eyebrow">Format</p>
          <p className="mt-3 font-display text-3xl">[PLACEHOLDER]</p>
          <p className="text-xs text-muted mt-2">Live online, recorded or hubs — to be confirmed</p>
        </Reveal>
      </div>

      <div className="text-center">
        <Link to="/apply" className="btn-gold">Apply to the AI School</Link>
      </div>

      <div>
        <SectionHeading eyebrow="Questions" title="FAQ" />
        <div className="mt-10 divide-y divide-white/10 border-y border-white/10">
          {FAQ.map((f) => (
            <details key={f.q} className="group py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 text-lg">
                {f.q}
                <span className="text-gold transition-transform group-open:rotate-45 text-2xl leading-none">+</span>
              </summary>
              <p className="mt-3 text-ivory-2 leading-relaxed max-w-3xl">{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}
