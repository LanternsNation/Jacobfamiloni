import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Reveal } from '../components/Reveal'
import { JourneySlider } from '../components/JourneySlider'
import { SchoolCta } from '../components/SchoolCta'
import { FlagStripes } from '../components/FlagStripes'
import { CohortBanner, CountUp, ImpactCounter, YouTubeLite } from '../components/ui'
import { about, achievements, credentials, heroMedia, photos } from '../lib/content'
import { useInitiatives, useSettings } from '../lib/data'
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

/* ------------------------------------- Interlude: His Heart For The People
 * Letter-card layout: big serif title, arched ivory card with a round portrait breaking its top edge,
 * name + "Charity begins at home.", copy, and a pen resting on the card. Deep navy USA backdrop.
 */
function HomeInterlude() {
  return (
    <section className="relative overflow-hidden bg-[#0A1024] py-20 md:py-28">
      {/* backdrop: deep navy, faded flag stripes, stars, soft red and blue light */}
      <div className="absolute inset-0 bg-[radial-gradient(90%_60%_at_80%_10%,#1B2A5C_0%,transparent_60%),radial-gradient(70%_50%_at_10%_90%,#3A0F1E_0%,transparent_65%)]" aria-hidden />
      <div className="absolute inset-0 opacity-[0.07] [background:repeating-linear-gradient(180deg,#B22234_0_44px,transparent_44px_88px)] [mask-image:linear-gradient(115deg,transparent_25%,#000_55%,transparent_90%)]" aria-hidden />
      <div
        className="absolute left-0 top-0 h-1/2 w-2/3 opacity-30 [mask-image:radial-gradient(70%_70%_at_0%_0%,#000,transparent)]"
        style={{ background: 'radial-gradient(circle, rgba(245,241,232,0.7) 0 1.3px, transparent 1.7px) 0 0 / 30px 26px, radial-gradient(circle, rgba(245,241,232,0.7) 0 1.3px, transparent 1.7px) 15px 13px / 30px 26px' }}
        aria-hidden
      />
      <div className="absolute -right-24 bottom-10 h-72 w-72 rounded-full bg-[#B22234]/20 blur-3xl" aria-hidden />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-ink" aria-hidden />
      <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-t from-transparent to-ink/60" aria-hidden />
      <div className="absolute -left-20 top-1/3 h-64 w-64 rounded-full bg-[#3C3B6E]/40 blur-3xl" aria-hidden />

      <div className="relative z-[2] mx-auto w-full max-w-[34rem] md:max-w-6xl px-6 md:px-8 md:grid md:grid-cols-12 md:gap-10 md:items-center">
        <div className="md:col-span-5">
        {/* badge */}
        <Reveal>
          <div className="-ml-6 mb-12 inline-flex h-16 w-24 items-center justify-end rounded-r-2xl bg-ivory/95 pr-5 shadow-xl md:-ml-8 md:mb-10 md:h-14 md:w-20" aria-hidden>
            <svg viewBox="0 0 24 24" className="h-7 w-7 fill-[#B22234]"><path d="M12 21s-7.5-4.6-9.6-9.3C.9 8.2 3 4.5 6.6 4.5c2 0 3.6 1.1 4.4 2.6.8-1.5 2.4-2.6 4.4-2.6 3.6 0 5.7 3.7 4.2 7.2C19.5 16.4 12 21 12 21z"/></svg>
          </div>
        </Reveal>

        {/* title */}
        <Reveal>
          <h2 className="font-display font-light text-ivory text-[3.1rem] md:text-[5.2rem] lg:text-[6rem] leading-[0.88] tracking-[-0.02em]">
            His Heart
            <br />
            For The People
          </h2>
          <span className="mt-4 grid h-9 w-9 place-items-center rounded-full bg-ivory/85 text-[#B22234]" aria-hidden>
            <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current"><path d="M12 21s-7.5-4.6-9.6-9.3C.9 8.2 3 4.5 6.6 4.5c2 0 3.6 1.1 4.4 2.6.8-1.5 2.4-2.6 4.4-2.6 3.6 0 5.7 3.7 4.2 7.2C19.5 16.4 12 21 12 21z"/></svg>
          </span>
        </Reveal>

          <p className="hidden md:block mt-8 max-w-sm text-ivory-2 leading-relaxed">A Nigerian based in the United States, with his heart still at home.</p>
        </div>

        {/* arched card with portrait breaking its top edge */}
        <Reveal delay={0.08} className="md:col-span-6 md:col-start-7 md:max-w-[32rem] md:pt-24">
          <div className="relative mt-6 md:mt-0">
            <div className="absolute -top-16 right-[-0.25rem] z-[3] h-40 w-40 md:h-56 md:w-56 md:-top-28 overflow-hidden rounded-full border-[6px] border-[#0A1024] shadow-2xl">
              <img src="/media/familoni-youth-480.webp" width={480} height={480} alt="Dr. Jacob Familoni with a group of young people in the United States" loading="lazy" decoding="async" className="h-full w-full object-cover object-[45%_30%]" />
            </div>
            <div className="relative rounded-t-sm rounded-b-[12rem] md:rounded-b-[16rem] bg-ivory px-7 md:px-10 pt-28 md:pt-36 pb-28 shadow-[0_40px_80px_rgba(0,0,0,0.45)]">
              <p className="font-display text-[1.75rem] md:text-[2rem] font-medium leading-tight text-ink">
                <span className="italic text-[#B22234] font-light">Dr.</span> Jacob Familoni
              </p>
              <p className="mt-1 font-display italic text-ink/70 text-lg">Charity begins at home.</p>
              <div className="mt-6 space-y-4 font-display text-[1.02rem] md:text-[1.08rem] leading-[1.65] text-ink/85 text-justify [hyphens:auto]">
                <p>Wherever life has taken him, his heart has stayed with people: the young who need a chance, the widow who needs a hand, the child who needs care.</p>
                <p>So he is bringing what he has built back to Nigeria. Skills for the young, dignity for widows, care for children, and character for the next generation.</p>
              </div>
              <Link to="/initiatives" className="group mt-7 inline-flex items-center gap-3 text-sm text-[#B22234]">
                <span className="h-px w-8 bg-[#B22234] transition-all duration-500 group-hover:w-14" />
                See the work at home
              </Link>
              {/* pen resting on the card */}
              <svg viewBox="0 0 260 40" className="absolute bottom-16 right-2 w-44 md:w-52 -rotate-[24deg] drop-shadow-[0_8px_8px_rgba(0,0,0,0.35)]" aria-hidden>
                <defs>
                  <linearGradient id="penbody" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#3a3d47" /><stop offset="0.5" stopColor="#0b0f1a" /><stop offset="1" stopColor="#1d212b" /></linearGradient>
                  <linearGradient id="pentrim" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#f3e3b5" /><stop offset="1" stopColor="#9c7a36" /></linearGradient>
                </defs>
                <path d="M6 20 L40 13 L40 27 Z" fill="url(#pentrim)" />
                <rect x="40" y="12" width="150" height="16" rx="3" fill="url(#penbody)" />
                <rect x="112" y="12" width="6" height="16" fill="url(#pentrim)" />
                <rect x="190" y="11" width="62" height="18" rx="8" fill="url(#penbody)" />
                <rect x="196" y="7" width="48" height="4" rx="2" fill="url(#pentrim)" />
              </svg>
            </div>
          </div>
        </Reveal>

        <p className="mt-12 text-center md:col-span-12 text-[0.7rem] tracking-[0.32em] uppercase text-ivory/70">Starting at home · Nigeria</p>
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
      <JourneySlider />
      <SchoolCta />
      <Achievements />
      <TheWork />
      <ThePeople />
      <LatestVideos />
      <Join />
    </>
  )
}
