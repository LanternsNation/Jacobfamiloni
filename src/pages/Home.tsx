import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Reveal } from '../components/Reveal'
import { FlagStripes } from '../components/FlagStripes'
import { CohortBanner, CountUp, GalleryCard, ImpactCounter, YouTubeLite } from '../components/ui'
import { about, achievements, credentials, heroMedia, photos } from '../lib/content'
import { useGallery, useInitiatives, useSettings } from '../lib/data'
import type { Initiative } from '../lib/types'

const ease = [0.22, 1, 0.36, 1] as const

/* -------------------------------------------------------------- HeroName
 * Phones: "JACOB" types itself letter by letter, holds 5 s, erases, repeats (with a red caret).
 * Desktop: letters close in from wide spacing once. Width never changes, so nothing jumps.
 */
const FIRST = 'JACOB'
function useIsPhone() {
  const [phone, setPhone] = useState(() => typeof window !== 'undefined' && window.matchMedia('(max-width: 767px)').matches)
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)')
    const on = () => setPhone(mq.matches)
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [])
  return phone
}

function HeroName() {
  const reduce = useReducedMotion()
  const phone = useIsPhone()
  const typing = phone && !reduce
  const [shown, setShown] = useState(typing ? 0 : FIRST.length)

  useEffect(() => {
    if (!typing) {
      setShown(FIRST.length)
      return
    }
    let n = 0
    let dir: 1 | -1 = 1
    let t = 0
    const step = () => {
      n += dir
      setShown(n)
      let wait = dir === 1 ? 230 : 110
      if (dir === 1 && n === FIRST.length) {
        dir = -1
        wait = 5000 // hold the full name for 5 s before erasing and retyping
      } else if (dir === -1 && n === 0) {
        dir = 1
        wait = 650
      }
      t = window.setTimeout(step, wait)
    }
    t = window.setTimeout(step, 1100) // start after the letterbox opens
    return () => window.clearTimeout(t)
  }, [typing])

  const letters = FIRST.split('')
  const word = (
    <span className="relative font-display font-light uppercase leading-none text-ivory/95 text-[35vw] md:text-[24vw] whitespace-nowrap">
      {letters.map((ch, i) => (
        <span key={i} className="relative inline-block" style={{ opacity: i < shown ? 1 : 0, transition: typing ? 'opacity 120ms linear' : undefined }}>
          {ch}
          {typing && i === shown - 1 && <span className="hero-caret absolute -right-[0.04em] top-[0.12em] bottom-[0.1em] w-[3px] bg-gold" />}
        </span>
      ))}
      {typing && shown === 0 && <span className="hero-caret absolute left-[0.02em] top-[0.12em] bottom-[0.1em] w-[3px] bg-gold" />}
    </span>
  )

  return (
    <motion.div
      aria-hidden
      className="absolute inset-x-0 top-[31%] md:top-[30%] z-[1] flex justify-center pointer-events-none select-none"
      initial={reduce || phone ? false : { opacity: 0, letterSpacing: '0.35em' }}
      animate={reduce || phone ? undefined : { opacity: 1, letterSpacing: '0.04em' }}
      transition={{ duration: 2.2, delay: 0.5, ease }}
    >
      {word}
    </motion.div>
  )
}

/* ------------------------------------------------------- MobileCredentials
 * A story-style reel: in the space above the name on phones, top-right (mirroring the caption) on desktop. Four segment bars fill in turn;
 * each line slides up with a small label. Copy supplied by the team (see content.ts → credentials).
 */
function MobileCredentials() {
  const reduce = useReducedMotion()
  const [i, setI] = useState(0)
  const DURATION = 3200
  useEffect(() => {
    if (reduce) return
    const t = window.setTimeout(() => setI((n) => (n + 1) % credentials.length), i === 0 ? DURATION + 1400 : DURATION)
    return () => window.clearTimeout(t)
  }, [i, reduce])
  const c = credentials[i]

  return (
    <motion.div
      className="absolute inset-x-5 top-[10.4rem] md:inset-x-auto md:right-[max(2rem,calc((100vw-72rem)/2+2rem))] md:top-[13%] xl:top-[18%] md:w-[14.5rem] xl:w-[20rem] z-[5]"
      initial={reduce ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.9, delay: 1.3 }}
    >
      {/* segment bars */}
      <div className="flex gap-1.5" aria-hidden>
        {credentials.map((_, k) => (
          <div key={k} className="h-[2px] flex-1 overflow-hidden rounded-full bg-ivory/15">
            <div
              key={k === i ? `on-${i}` : `off-${k}`}
              className={`h-full bg-gold ${k === i && !reduce ? 'cred-fill' : ''}`}
              style={{
                width: reduce ? (k === i ? '100%' : '0%') : k < i ? '100%' : k === i ? undefined : '0%',
                animationDuration: `${i === 0 ? DURATION + 1400 : DURATION}ms`,
              }}
            />
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-start gap-4">
        <span className="font-display italic text-gold text-sm tabular-nums pt-1 w-9 shrink-0">
          {String(i + 1).padStart(2, '0')}
          <span className="text-ivory/40">/{String(credentials.length).padStart(2, '0')}</span>
        </span>
        <div className="relative h-[5.2rem] flex-1 overflow-hidden" aria-live="polite">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={i}
              initial={reduce ? false : { y: '105%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={reduce ? undefined : { y: '-60%', opacity: 0 }}
              transition={{ duration: 0.65, ease }}
              className="absolute inset-0"
            >
              <p className="text-[0.6rem] tracking-[0.32em] uppercase text-ivory-2">{c.label}</p>
              <p className={`mt-1.5 font-display italic font-light text-ivory leading-[1.05] ${c.line.length > 30 ? 'text-[1.42rem] md:text-[1.2rem] xl:text-[1.42rem]' : 'text-[1.8rem] md:text-[1.45rem] xl:text-[1.8rem]'}`}>{c.line}</p>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
      {/* full list for screen readers */}
      <ul className="sr-only">
        {credentials.map((x) => <li key={x.line}>{x.label}: {x.line}</li>)}
      </ul>
    </motion.div>
  )
}

/* ---------------------------------------------------------------- Hero
 * Editorial portrait poster: name set huge BEHIND the figure, surname in gold italic IN FRONT,
 * a fine diagonal rule, small spaced captions. Real photo (cut out, black-and-white).
 */
function Hero() {
  const { hero } = useSettings()
  const reduce = useReducedMotion()
  const video = hero.video_url || heroMedia.videoSrc
  const [allowVideo, setAllowVideo] = useState(false)
  useEffect(() => {
    const c = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection
    const slow = c?.saveData || (c?.effectiveType && /(^|-)2g|3g/.test(c.effectiveType))
    setAllowVideo(Boolean(video) && !slow && !reduce)
  }, [video, reduce])

  const figure = hero.poster_url || heroMedia.figureSrc
  const fade = (delay: number, y = 18) =>
    reduce ? {} : { initial: { opacity: 0, y }, animate: { opacity: 1, y: 0 }, transition: { duration: 1.2, delay, ease } }

  return (
    <section className="grain relative h-[100svh] min-h-[640px] overflow-hidden bg-ink">
      {/* Studio backdrop: soft key light from upper right */}
      <div className="absolute inset-0 bg-[radial-gradient(70%_55%_at_62%_32%,#2b2c31_0%,#17181d_45%,#0b0f1a_85%)]" />
      <FlagStripes />
      {allowVideo && (
        <video className="absolute inset-0 h-full w-full object-cover opacity-25 mix-blend-luminosity" src={video} autoPlay muted loop playsInline preload="none" aria-hidden />
      )}

      {/* 1 · First name, set huge, BEHIND the figure (types itself in a loop on phones) */}
      <HeroName />

      {/* 2 · The figure */}
      <motion.img
        src={figure}
        srcSet={!hero.poster_url ? heroMedia.figureSrcSet : undefined}
        sizes="(min-width: 768px) 46vw, 96vw"
        alt="Dr. Jacob Familoni"
        fetchPriority="high"
        decoding="async"
        className="absolute bottom-0 left-1/2 z-[2] h-[67svh] md:h-[74svh] xl:h-[86svh] w-auto max-w-none -translate-x-[50%] md:-translate-x-[38%] object-contain object-bottom"
        style={{ aspectRatio: String(heroMedia.figureRatio) }}
        initial={reduce ? false : { opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.6, delay: 0.25, ease }}
      />
      {/* ground the figure */}
      <div className="absolute inset-x-0 bottom-0 z-[3] h-[46%] bg-gradient-to-t from-ink via-ink/75 to-transparent" />

      {/* 3 · Fine diagonal rule */}
      <motion.svg
        aria-hidden
        className="absolute inset-0 z-[4] h-full w-full pointer-events-none"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        initial={reduce ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5, delay: 1.4 }}
      >
        <line x1="4" y1="96" x2="98" y2="14" stroke="#F5F1E8" strokeOpacity="0.4" strokeWidth="0.12" vectorEffect="non-scaling-stroke" />
      </motion.svg>

      {/* 4 · Caption block, top left */}
      <motion.div className="absolute left-5 md:left-[max(2rem,calc((100vw-72rem)/2+2rem))] top-[4.6rem] md:top-[18%] z-[5] max-w-[13rem]" {...fade(1.1, 0)}>
        <span className="hidden md:block h-px w-6 bg-gold/80 rotate-[-40deg] origin-left mb-4" />
        <p className="text-[0.62rem] leading-[1.9] tracking-[0.32em] uppercase text-ivory-2">
          A Nigerian
          <br />
          based in the
          <br />
          <span className="text-ivory">United States</span>
        </p>
        <p className="hidden md:block mt-4 font-display italic text-gold text-sm">A legacy of excellence, starting at home.</p>
      </motion.div>

      {/* Credential reel: above the name on phones, top-right on desktop */}
      <MobileCredentials />

      {/* 5 · Surname in gold italic, IN FRONT of the figure */}
      <div className="absolute inset-x-0 bottom-0 z-[5]">
        <div className="container-x pb-10 md:pb-14">
          <motion.p className="font-display italic font-light text-gold text-2xl md:text-4xl leading-none" {...fade(1.25)}>Dr.</motion.p>
          <motion.h1
            className="font-display italic font-light text-gold leading-[0.82] tracking-[-0.035em] text-[22vw] md:text-[12vw] lg:text-[11rem]"
            {...fade(1.35, 30)}
          >
            Familoni
            <span className="sr-only"> — Dr. Jacob Familoni</span>
          </motion.h1>
          <motion.div className="mt-6 md:mt-8 flex flex-col md:flex-row md:items-end md:justify-between gap-6" {...fade(1.7, 10)}>
            <p className="max-w-sm text-ivory-2 text-[0.95rem] md:text-base leading-relaxed">
              {hero.subhead && !hero.subhead.includes('PLACEHOLDER') ? hero.subhead : 'His story, his work, and what he is building at home in Nigeria.'}
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/story" className="btn-gold">His story</Link>
              <Link to="/initiatives" className="btn-ghost">The work at home</Link>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Letterbox bars open on load */}
      {!reduce && (
        <>
          <motion.div className="absolute inset-x-0 top-0 z-[8] h-[12vh] bg-ink" initial={{ y: 0 }} animate={{ y: '-100%' }} transition={{ duration: 1.3, delay: 0.2, ease }} />
          <motion.div className="absolute inset-x-0 bottom-0 z-[8] h-[12vh] bg-ink" initial={{ y: 0 }} animate={{ y: '100%' }} transition={{ duration: 1.3, delay: 0.2, ease }} />
        </>
      )}
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

/* ------------------------------------------------------- I · The man
 * Editorial "about" spread on ivory: full-length B&W portrait left, vertical chapter label,
 * big serif heading with a red full stop, credentials, copy and signature right.
 */
function TheMan() {
  return (
    <>
      <TheManMobile />
      <TheManDesktop />
    </>
  )
}

/** Phones: centred heading, then the portrait in a vertical frame side by side with the copy.
 * The frame stretches to the exact height of the text column. */
function TheManMobile() {
  return (
    <section className="md:hidden relative overflow-hidden bg-[#EFECE6] text-ink">
      <div className="px-5 pt-12 pb-12">
        {/* heading block, centred over everything */}
        <Reveal className="text-center">
          <p className="text-[0.6rem] tracking-[0.3em] uppercase text-ink/60">Chapter I</p>
          <h2 className="mt-3 text-[3.4rem] leading-[0.85] tracking-[-0.04em] font-[350] text-ink">
            The Man<span className="text-[#B22234]">.</span>
          </h2>
          <p className="mt-4 font-display text-[1.15rem] leading-tight text-ink">
            <span className="italic text-[#B22234]">{about.honorific}</span> {about.name}
          </p>
          <p className="mt-1.5 text-[0.56rem] tracking-[0.24em] uppercase text-ink/65">{about.postNominals.join(' · ')}</p>
          <p className="mt-3 font-display italic text-[0.9rem] leading-snug text-ink/90">{about.kicker}</p>
          <span className="mt-5 mb-7 mx-auto block h-px w-10 bg-ink/40" />
        </Reveal>

        {/* portrait frame + copy, side by side; the frame stretches to the text's height */}
        <div className="flex items-stretch gap-4">
          <Reveal className="w-[42%] shrink-0">
            <div className="relative h-full min-h-[16rem] border border-ink/25 bg-[#E5E1D8] p-1.5">
              <div className="relative h-full w-full overflow-hidden">
                <img
                  src={photos.about.src}
                  srcSet={photos.about.srcSet}
                  sizes="40vw"
                  alt={photos.about.alt}
                  loading="lazy"
                  decoding="async"
                  className="absolute inset-0 h-full w-full object-cover object-top"
                />
              </div>
            </div>
          </Reveal>
          <Reveal delay={0.08} className="flex-1 min-w-0">
            <div className="space-y-3.5 text-[0.82rem] leading-[1.62] text-ink/85">
              {about.paragraphs.map((p) => <p key={p}>{p}</p>)}
            </div>
            <p className="mt-6 font-signature text-[2.2rem] text-ink leading-none -rotate-3 origin-left">{about.signature}</p>
            <span className="mt-4 block h-px w-8 bg-ink/50" />
            <Link to="/story" className="mt-3 inline-flex items-center gap-2 text-[0.82rem] text-ink">
              Read his full story <span>→</span>
            </Link>
          </Reveal>
        </div>
      </div>
    </section>
  )
}

/** Tablet and desktop: editorial spread with the full-length portrait standing on the bottom edge. */
function TheManDesktop() {
  return (
    <section className="hidden md:block relative overflow-hidden bg-[#EFECE6] text-ink">
      <div className="container-x relative grid md:grid-cols-12 gap-10 md:gap-8 pt-20 md:pt-28">
        {/* vertical label */}
        <div className="hidden md:flex md:col-span-1 flex-col items-center pt-2">
          <span className="text-[0.7rem] tracking-[0.28em] uppercase text-ink/70 [writing-mode:vertical-rl] rotate-180">Chapter I · The Man</span>
          <span className="mt-6 h-24 w-px bg-ink/40" />
        </div>

        {/* portrait */}
        <Reveal className="md:col-span-5 relative order-2 md:order-none self-end">
          <img
            src={photos.about.src}
            srcSet={photos.about.srcSet}
            sizes="(min-width: 768px) 40vw, 92vw"
            width={photos.about.w}
            height={photos.about.h}
            alt={photos.about.alt}
            loading="lazy"
            decoding="async"
            className="relative z-[1] mx-auto block w-[86%] md:w-full max-w-[30rem] h-auto drop-shadow-[0_30px_40px_rgba(11,15,26,0.18)]"
          />
        </Reveal>

        {/* copy */}
        <div className="md:col-span-6 md:pl-6 lg:pl-10 md:pt-6 pb-4 md:pb-28 order-1 md:order-none">
          <Reveal>
            <p className="md:hidden text-[0.65rem] tracking-[0.28em] uppercase text-ink/60 mb-6">Chapter I</p>
            <h2 className="text-[22vw] md:text-[7.5rem] lg:text-[8.6rem] leading-[0.82] tracking-[-0.045em] font-[350] text-ink">
              The Man<span className="text-[#B22234]">.</span>
            </h2>
          </Reveal>
          <Reveal delay={0.08}>
            <p className="mt-8 font-display text-2xl md:text-[1.7rem] leading-tight text-ink">
              <span className="italic text-[#B22234]">{about.honorific}</span> {about.name}
            </p>
            <p className="mt-2 text-[0.7rem] tracking-[0.28em] uppercase text-ink/60">{about.postNominals.join(' · ')}</p>
            <p className="mt-6 font-display italic text-lg md:text-xl text-ink/85">{about.kicker}</p>
          </Reveal>
          <Reveal delay={0.14}>
            <div className="mt-6 space-y-5 text-[0.98rem] leading-[1.75] text-ink/80 max-w-[34rem]">
              {about.paragraphs.map((p) => <p key={p}>{p}</p>)}
            </div>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="mt-10 font-signature text-5xl md:text-6xl text-ink leading-none -rotate-3 origin-left">{about.signature}</p>
            <span className="mt-6 block h-px w-10 bg-ink/50" />
            <Link to="/story" className="group mt-6 inline-flex items-center gap-3 text-sm text-ink">
              Read his full story <span className="transition-transform group-hover:translate-x-1">→</span>
            </Link>
          </Reveal>
        </div>
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
      <div className="absolute inset-0 bg-[radial-gradient(80%_60%_at_50%_0%,rgba(178,34,52,0.14),transparent_70%)]" />
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
