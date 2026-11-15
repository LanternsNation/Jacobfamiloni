import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import { Reveal } from '../components/Reveal'
import { CohortBanner, CountUp, GalleryCard, ImpactCounter, YouTubeLite } from '../components/ui'
import { achievements, heroMedia, photos, site } from '../lib/content'
import { useGallery, useInitiatives, useSettings } from '../lib/data'
import type { Initiative } from '../lib/types'

const ease = [0.22, 1, 0.36, 1] as const

/* ---------------------------------------------------------------- Hero */
function Hero() {
  const { hero } = useSettings()
  const reduce = useReducedMotion()
  const video = hero.video_url || heroMedia.videoSrc
  const poster = hero.poster_url || heroMedia.posterSrc
  const [allowVideo, setAllowVideo] = useState(false)
  useEffect(() => {
    const c = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection
    const slow = c?.saveData || (c?.effectiveType && /(^|-)2g|3g/.test(c.effectiveType))
    setAllowVideo(Boolean(video) && !slow && !reduce)
  }, [video, reduce])

  const statement = hero.headline || site.legacyStatement
  const anim = (delay: number, y = 24) =>
    reduce ? {} : { initial: { opacity: 0, y }, animate: { opacity: 1, y: 0 }, transition: { duration: 1.1, delay, ease } }

  return (
    <section className="grain relative min-h-[100svh] overflow-hidden bg-ink">
      {/* Portrait: full-bleed on phones, right-hand frame on desktop */}
      <div className="absolute inset-0 md:left-auto md:w-[55%] lg:w-[52%] overflow-hidden">
        <motion.div className="absolute inset-0" initial={reduce ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.6, delay: 0.2 }}>
          <img
            src={poster}
            srcSet={!hero.poster_url ? heroMedia.posterSrcSet : undefined}
            sizes="(min-width: 768px) 52vw, 100vw"
            alt="Dr. Jacob Familoni"
            fetchPriority="high"
            decoding="async"
            className={`absolute inset-0 h-full w-full object-cover object-[50%_18%] ${reduce ? '' : 'kenburns'}`}
          />
          {allowVideo && <video className="absolute inset-0 h-full w-full object-cover" src={video} poster={poster} autoPlay muted loop playsInline preload="none" aria-hidden />}
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/30 to-ink/25 md:from-ink/90 md:via-transparent md:to-transparent" />
        <div className="hidden md:block absolute inset-y-0 left-0 w-2/5 bg-gradient-to-r from-ink to-transparent" />
        <div className="absolute inset-0 mix-blend-multiply bg-[#2a1d0c]/10" />
      </div>
      <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-ink/85 to-transparent" aria-hidden />

      {/* Letterbox bars open on load */}
      {!reduce && (
        <>
          <motion.div className="absolute inset-x-0 top-0 z-[3] h-[12vh] bg-ink" initial={{ y: 0 }} animate={{ y: '-100%' }} transition={{ duration: 1.3, delay: 0.35, ease }} />
          <motion.div className="absolute inset-x-0 bottom-0 z-[3] h-[12vh] bg-ink" initial={{ y: 0 }} animate={{ y: '100%' }} transition={{ duration: 1.3, delay: 0.35, ease }} />
        </>
      )}

      <div className="container-x relative z-[2] flex min-h-[100svh] flex-col justify-end pb-14 md:justify-center md:pb-0 pt-28">
        <div className="md:max-w-[52%]">
          <motion.p className="eyebrow" {...anim(0.9, 0)}>{statement}</motion.p>
          <h1 className="mt-6 md:mt-8 leading-[0.86]">
            <motion.span className="block font-display italic font-light text-gold text-3xl md:text-5xl" {...anim(1.0)}>Dr.</motion.span>
            <motion.span className="block text-[19vw] md:text-[9.5vw] lg:text-[8.6rem] tracking-[-0.04em]" {...anim(1.1)}>Jacob</motion.span>
            <motion.span className="block text-[19vw] md:text-[9.5vw] lg:text-[8.6rem] tracking-[-0.04em]" {...anim(1.22)}>Familoni</motion.span>
          </h1>
          <motion.div className="mt-8 h-px w-24 bg-gold origin-left" initial={reduce ? false : { scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 1.2, delay: 1.5, ease }} />
          {hero.subhead && <motion.p className="mt-6 text-lg md:text-xl text-ivory-2 max-w-md leading-relaxed" {...anim(1.6, 10)}>{hero.subhead}</motion.p>}
          <motion.div className="mt-9 flex flex-wrap gap-3" {...anim(1.75, 10)}>
            <Link to="/story" className="btn-gold">His story</Link>
            <Link to="/initiatives" className="btn-ghost">The work at home</Link>
          </motion.div>
        </div>
      </div>

      <div className="hidden md:flex absolute bottom-8 left-1/2 -translate-x-1/2 z-[2] flex-col items-center gap-3 text-[0.65rem] tracking-[0.3em] uppercase text-muted">
        <span>Scroll</span>
        <span className="block h-12 w-px bg-gold/70 scroll-cue" />
      </div>
    </section>
  )
}

/* ------------------------------------------------------- Chapter heading */
function Chapter({ n, title, children, className = '' }: { n: string; title: string; children?: React.ReactNode; className?: string }) {
  return (
    <Reveal className={className}>
      <div className="flex items-center gap-4">
        <span className="chapter">{n}</span>
        <span className="h-px w-10 bg-gold/50" />
        <span className="eyebrow">{title}</span>
      </div>
      {children}
    </Reveal>
  )
}

/* ------------------------------------------------------- I · The man */
function TheMan() {
  return (
    <section className="container-x py-28 md:py-44 grid md:grid-cols-12 gap-14 items-center">
      <Reveal className="md:col-span-5">
        <div className="relative">
          <div className="absolute -bottom-5 -right-5 hidden md:block h-full w-full border border-gold/30" aria-hidden />
          <img src={photos.candid.src} width={photos.candid.w} height={photos.candid.h} alt={photos.candid.alt} loading="lazy" decoding="async" className="relative w-full aspect-[4/5] object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-ink/60 via-transparent to-transparent" />
        </div>
      </Reveal>
      <div className="md:col-span-6 md:col-start-7">
        <Chapter n="I" title="The man" />
        <Reveal delay={0.1}>
          <p className="mt-10 font-display text-[1.9rem] md:text-[2.8rem] leading-[1.12] text-ivory font-light">{site.storyInBrief}</p>
          <Link to="/story" className="group mt-12 inline-flex items-center gap-4 text-gold">
            <span className="h-px w-12 bg-gold transition-all duration-500 group-hover:w-20" />
            Read his story
          </Link>
        </Reveal>
      </div>
    </section>
  )
}

/* ------------------------------------------- Interlude: starting at home */
function HomeInterlude() {
  return (
    <section className="grain relative h-[92svh] min-h-[560px] overflow-hidden">
      <img src={photos.home.src} srcSet={photos.home.srcSet} sizes="100vw" alt={photos.home.alt} loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover object-[50%_25%] md:object-[70%_25%]" />
      <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-ink/20" />
      <div className="absolute inset-0 bg-gradient-to-r from-ink/80 via-ink/20 to-transparent" />
      <div className="container-x relative z-[2] flex h-full flex-col justify-end pb-16 md:pb-24">
        <Reveal>
          <p className="eyebrow">Nigeria</p>
          <h2 className="mt-6 text-[17vw] md:text-[10rem] leading-[0.85] tracking-[-0.04em]">
            Starting
            <br />
            <em className="italic font-light text-gold">at home.</em>
          </h2>
          <p className="mt-8 max-w-md text-ivory-2 text-lg">From Nigeria, to the world, and home again: building what lasts, where it matters most.</p>
          <p className="mt-4 text-xs text-muted">{photos.home.caption}</p>
        </Reveal>
      </div>
    </section>
  )
}

/* ------------------------------------------------- Achievements (real only) */
function Achievements() {
  const real = achievements.filter((a) => Number.isFinite(Number(a.value)) && !a.label.includes('PLACEHOLDER'))
  if (real.length < 3) return null // shown once at least three verified figures are filled in (src/lib/content.ts)
  return (
    <section className="container-x py-28 md:py-36">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-14">
        {real.map((a, i) => (
          <Reveal key={a.label} delay={i * 0.06} className="border-t border-gold/30 pt-6">
            <p className="font-display text-7xl md:text-8xl leading-none font-light"><CountUp value={Number(a.value)} /></p>
            <p className="mt-4 text-sm text-ivory-2">{a.label}</p>
          </Reveal>
        ))}
      </div>
    </section>
  )
}

/* ------------------------------------------------------- II · The work */
function Marquee({ items }: { items: string[] }) {
  const reduce = useReducedMotion()
  if (!items.length) return null
  const row = (k: string) =>
    items.map((t, i) => (
      <span key={k + i} className="flex items-center">
        <span className="font-display italic font-light text-outline text-[16vw] md:text-[9rem] leading-none whitespace-nowrap px-8">{t}</span>
        <span className="text-gold/60 text-3xl">✦</span>
      </span>
    ))
  return (
    <div className="overflow-hidden py-6 border-y border-white/5" aria-hidden>
      <div className={reduce ? 'flex' : 'marquee'}>
        {row('a')}
        {row('b')}
      </div>
    </div>
  )
}

function WorkRow({ i, idx }: { i: Initiative; idx: number }) {
  return (
    <Reveal delay={idx * 0.05}>
      <Link to={`/initiatives/${i.slug}`} className="group relative block border-t border-white/10 py-10 md:py-14">
        <span className="absolute left-0 -top-px h-px w-0 bg-gold transition-all duration-700 group-hover:w-full" />
        <div className="grid md:grid-cols-12 gap-4 md:gap-8 items-baseline">
          <span className="md:col-span-1 font-display italic text-gold text-xl">{String(idx + 1).padStart(2, '0')}</span>
          <h3 className="md:col-span-6 text-4xl md:text-6xl leading-[0.98] transition-colors group-hover:text-gold-soft">{i.title}</h3>
          <div className="md:col-span-4">
            <p className="text-ivory-2 leading-relaxed">{i.summary}</p>
            <p className="mt-4 text-[0.68rem] uppercase tracking-[0.22em]">
              {i.status === 'active' ? <span className="text-gold">● Active now</span> : <span className="text-muted">Coming soon</span>}
            </p>
          </div>
          <span className="hidden md:block md:col-span-1 text-right text-gold text-2xl transition-transform duration-500 group-hover:translate-x-2">→</span>
        </div>
      </Link>
    </Reveal>
  )
}

function TheWork() {
  const { data } = useInitiatives()
  const list = data ?? []
  return (
    <section className="pt-28 md:pt-40">
      <div className="container-x">
        <Chapter n="II" title="The work">
          <h2 className="mt-8 text-5xl md:text-8xl max-w-5xl leading-[0.95] text-balance">
            Four initiatives. <em className="italic font-light text-gold">One standard.</em>
          </h2>
        </Chapter>
      </div>
      <div className="mt-16">
        <Marquee items={list.map((i) => i.title.replace('Familoni ', ''))} />
      </div>
      <div className="container-x mt-6">
        {list.map((i, idx) => <WorkRow key={i.id} i={i} idx={idx} />)}
        <div className="border-t border-white/10" />
      </div>
    </section>
  )
}

/* ------------------------------------------------------- III · The people */
function ThePeople() {
  return (
    <section className="container-x py-28 md:py-40">
      <div className="flex items-end justify-between gap-6 flex-wrap">
        <Chapter n="III" title="The people">
          <h2 className="mt-8 text-5xl md:text-8xl leading-[0.95]">Every number<br /><em className="italic font-light text-gold">is a person.</em></h2>
        </Chapter>
        <span className="inline-flex items-center gap-2 text-xs text-muted"><span className="h-2 w-2 rounded-full bg-gold animate-pulse" /> Updated live</span>
      </div>
      <div className="mt-16"><ImpactCounter /></div>
    </section>
  )
}

function VisitsStrip() {
  const { data } = useGallery()
  const items = (data ?? []).filter((g) => (g.category === 'visit' || g.category === 'meeting') && g.image_url).slice(0, 8)
  if (!items.length) return null // appears as soon as real visit photos are published in admin › Gallery
  return (
    <section className="pb-28">
      <div className="container-x flex items-end justify-between gap-6">
        <p className="eyebrow">Visits and meetings</p>
        <Link to="/impact" className="text-gold text-sm whitespace-nowrap">View gallery →</Link>
      </div>
      <div
        className="mt-8 flex gap-5 overflow-x-auto snap-x snap-mandatory pb-4 [scrollbar-width:none]"
        style={{ paddingInline: 'max(1.25rem, calc((100vw - 72rem) / 2 + 2rem))', scrollPaddingInline: 'max(1.25rem, calc((100vw - 72rem) / 2 + 2rem))' }}
      >
        {items.map((g) => <div key={g.id} className="snap-start shrink-0 w-[72vw] sm:w-[42vw] md:w-[22rem]"><GalleryCard g={g} /></div>)}
      </div>
    </section>
  )
}

function LatestVideos() {
  const { videos } = useSettings()
  const ids = videos.youtube_ids.slice(0, 3)
  if (!ids.length) return null // appears once YouTube links are added in admin › Settings
  return (
    <section className="container-x pb-28">
      <div className="flex items-end justify-between gap-6">
        <p className="eyebrow">Watch</p>
        <Link to="/media" className="text-gold text-sm whitespace-nowrap">All media →</Link>
      </div>
      <div className="mt-8 grid md:grid-cols-3 gap-6">{ids.map((id) => <YouTubeLite key={id} id={id} title="Dr. Jacob Familoni" />)}</div>
    </section>
  )
}

/* ------------------------------------------------------------- IV · Join */
function Join() {
  return (
    <section className="grain relative overflow-hidden bg-ink-2">
      <div className="absolute inset-0 bg-[radial-gradient(80%_60%_at_50%_0%,rgba(201,162,74,0.14),transparent_70%)]" />
      <div className="container-x relative z-[2] py-28 md:py-44 text-center">
        <Reveal>
          <div className="flex justify-center"><span className="chapter">IV</span></div>
          <p className="eyebrow mt-3">Join the work</p>
          <h2 className="mt-8 text-[22vw] md:text-[10rem] leading-[0.85] tracking-[-0.04em]">₦2,000</h2>
          <p className="mt-4 font-display italic font-light text-gold text-3xl md:text-5xl">puts a young Nigerian in the room.</p>
          <p className="mt-10 text-ivory-2 max-w-lg mx-auto text-lg">Sponsor a seat in the AI School, or support an initiative. Every naira goes to the work in Nigeria.</p>
          <div className="mt-12 flex flex-wrap justify-center gap-3">
            <Link to="/support" className="btn-gold">Sponsor a seat</Link>
            <Link to="/apply" className="btn-ghost">Apply to the AI School</Link>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

export default function Home() {
  return (
    <>
      <Hero />
      <CohortBanner />
      <TheMan />
      <HomeInterlude />
      <Achievements />
      <TheWork />
      <ThePeople />
      <VisitsStrip />
      <LatestVideos />
      <Join />
    </>
  )
}
