import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { formatDate, useGallery } from '../lib/data'
import { CATEGORY_LABEL } from '../lib/types'

/**
 * HIS JOURNEY — full-bleed slider of visits and meetings.
 * Choreography (600ms, cubic-bezier(0.22,1,0.36,1)):
 *  - card in slot 1 dissolves in place (0–350ms) while the full-bleed background cross-fades in (100–600ms)
 *  - the card track shifts left; slot 2 grows into slot 1; a new card slides in from the right (150–600ms)
 *  - headline + caption roll up inside masks (200–600ms); the CTA never moves
 *  - the stepper dot glides to the next node
 * Captions describe visits and meetings only — never endorsements (PRD guardrail 4).
 */

interface Slide {
  id: string
  headline: string
  caption: string
  meta: string
  label: string
  image: string | null
  tone: string // fallback backdrop while no photo exists
}

// Shown until at least three real visit/meeting photos are published in admin › Gallery.
// Names come from the PRD (footage exists); captions, places and dates are placeholders to confirm.
const PLACEHOLDER_SLIDES: Slide[] = [
  { id: 'p1', headline: 'Obasanjo', caption: 'Courtesy visit to former President Olusegun Obasanjo.', meta: '[PLACEHOLDER — place, date]', label: 'Visit', image: null, tone: 'radial-gradient(80% 70% at 70% 30%,#3b4a3a 0%,#18221b 55%,#0b0f1a 100%)' },
  { id: 'p2', headline: 'Adeboye', caption: 'Visit with Pastor E. A. Adeboye.', meta: '[PLACEHOLDER — place, date]', label: 'Visit', image: null, tone: 'radial-gradient(80% 70% at 70% 30%,#4a3b2a 0%,#221a12 55%,#0b0f1a 100%)' },
  { id: 'p3', headline: 'Governors', caption: 'Meetings with state governors across Nigeria.', meta: '[PLACEHOLDER — states, dates]', label: 'Meeting', image: null, tone: 'radial-gradient(80% 70% at 70% 30%,#2a3b5a 0%,#141d33 55%,#0b0f1a 100%)' },
  { id: 'p4', headline: 'Communities', caption: 'Visits to communities, schools and families at home.', meta: '[PLACEHOLDER — places, dates]', label: 'Visit', image: null, tone: 'radial-gradient(80% 70% at 70% 30%,#5a2a33 0%,#2a121a 55%,#0b0f1a 100%)' },
]

const EASE = [0.22, 1, 0.36, 1] as const
const HOLD_MS = 5200

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

export function JourneySlider() {
  const reduce = useReducedMotion()
  const phone = useIsPhone()
  const { data } = useGallery()

  const slides: Slide[] = useMemo(() => {
    const real = (data ?? [])
      .filter((g) => (g.category === 'visit' || g.category === 'meeting') && g.image_url)
      .map((g) => ({
        id: g.id,
        headline: g.title.replace(/\[PLACEHOLDER\]\s*/g, ''),
        caption: g.caption,
        meta: [g.place, formatDate(g.date_taken)].filter(Boolean).join(' · '),
        label: CATEGORY_LABEL[g.category],
        image: g.image_url,
        tone: '#0b0f1a',
      }))
    return real.length >= 3 ? real : PLACEHOLDER_SLIDES
  }, [data])

  const N = slides.length
  const [step, setStep] = useState(0) // grows without bound; active = step mod N
  const active = ((step % N) + N) % N
  const [paused, setPaused] = useState(false)
  const [inView, setInView] = useState(false)
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0.35 })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  useEffect(() => {
    if (reduce || paused || !inView) return
    const t = window.setTimeout(() => setStep((s) => s + 1), HOLD_MS)
    return () => window.clearTimeout(t)
  }, [step, paused, inView, reduce])

  const go = useCallback((dir: 1 | -1) => setStep((s) => s + dir), [])
  const goTo = useCallback((i: number) => setStep((s) => s + (((i - (((s % N) + N) % N)) + N) % N)), [N])

  // geometry (phone cards shrink on short screens so the copy and cards never touch)
  const [vh, setVh] = useState(() => (typeof window !== 'undefined' ? window.innerHeight : 800))
  useEffect(() => {
    const on = () => setVh(window.innerHeight)
    window.addEventListener('resize', on)
    return () => window.removeEventListener('resize', on)
  }, [])
  const k = phone ? Math.max(0.72, Math.min(1, (vh - 560) / 280)) : 1
  const big = phone ? { w: Math.round(150 * k), h: Math.round(212 * k) } : { w: 225, h: 320 }
  const small = phone ? { w: Math.round(124 * k), h: Math.round(176 * k) } : { w: 185, h: 260 }
  const gap = phone ? 14 : 22
  const slotX = (slot: number) => {
    if (slot <= 1) return 0
    return big.w + gap + (slot - 2) * (small.w + gap)
  }
  const offRight = slotX(Math.max(4, N)) + 200
  const s = slides[active]

  return (
    <section
      ref={ref}
      className="relative h-[100svh] min-h-[620px] overflow-hidden bg-ink text-ivory select-none"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-roledescription="carousel"
      aria-label="His journey: visits and meetings"
    >
      {/* full-bleed backgrounds (cross-dissolve) */}
      {slides.map((sl, i) => (
        <motion.div
          key={sl.id}
          className="absolute inset-0"
          initial={false}
          animate={{ opacity: i === active ? 1 : 0, scale: i === active ? 1 : 1.03 }}
          transition={{ duration: reduce ? 0 : 0.5, delay: reduce ? 0 : i === active ? 0.1 : 0.2, ease: EASE }}
          style={{ zIndex: i === active ? 1 : 0, background: sl.image ? undefined : sl.tone }}
          aria-hidden
        >
          {sl.image && <img src={sl.image} alt="" className="h-full w-full object-cover" loading={i === 0 ? 'eager' : 'lazy'} decoding="async" />}
        </motion.div>
      ))}
      {/* vignette */}
      <div className="absolute inset-0 z-[2] bg-[linear-gradient(90deg,rgba(10,18,28,0.72)_0%,rgba(10,18,28,0.3)_55%,rgba(10,18,28,0.5)_100%)]" aria-hidden />
      <div className="absolute inset-x-0 top-0 z-[2] h-40 bg-gradient-to-b from-ink to-transparent" aria-hidden />
      <div className="absolute inset-x-0 bottom-0 z-[2] h-48 bg-gradient-to-t from-ink to-transparent" aria-hidden />

      {/* section label */}
      <div className="absolute z-[5] left-5 md:left-[max(2rem,calc((100vw-72rem)/2+2rem))] top-24 md:top-28 flex items-center gap-4">
        <span className="h-px w-10 bg-gold/70" />
        <span className="eyebrow">His Journey</span>
      </div>

      {/* vertical stepper (desktop) */}
      <div className="hidden md:block absolute z-[5] left-[max(1.25rem,calc((100vw-72rem)/2))] top-1/2 -translate-y-1/2 h-[260px] w-[10px]">
        <span className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-white/30" />
        {slides.slice(0, 8).map((sl, i) => {
          const y = N > 1 ? (i / (Math.min(N, 8) - 1)) * 260 : 0
          return (
            <button
              key={sl.id}
              onClick={() => goTo(i)}
              className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 h-5 w-5 grid place-items-center"
              style={{ top: y }}
              aria-label={`Go to ${sl.headline}`}
            >
              <span className="block h-[5px] w-[5px] rounded-full bg-white/45" />
            </button>
          )
        })}
        <motion.span
          className="absolute left-1/2 -ml-[5px] -mt-[5px] h-[10px] w-[10px] rounded-full bg-white shadow-[0_0_0_4px_rgba(255,255,255,0.2)] pointer-events-none"
          initial={false}
          animate={{ top: N > 1 ? (Math.min(active, 7) / (Math.min(N, 8) - 1)) * 260 : 0 }}
          transition={{ duration: reduce ? 0 : 0.6, ease: EASE }}
        />
      </div>

      {/* hero copy (masked roll) */}
      <div className="absolute z-[5] left-5 right-5 md:right-auto md:left-[calc(max(1.25rem,calc((100vw-72rem)/2))+60px)] top-[19%] md:top-1/2 md:-translate-y-1/2 md:max-w-[460px]">
        <p className="text-[0.62rem] tracking-[0.3em] uppercase text-gold mb-3">{s.label}</p>
        <div className="overflow-hidden">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.h2
              key={s.id + '-h'}
              className="font-sans font-extrabold uppercase text-white text-[13vw] md:text-[68px] leading-[1.05] tracking-[0.02em] whitespace-nowrap"
              initial={reduce ? false : { y: '100%', opacity: 0 }}
              animate={{ y: '0%', opacity: 1 }}
              exit={reduce ? undefined : { y: '-100%', opacity: 0 }}
              transition={{ duration: 0.4, delay: 0.2, ease: EASE }}
            >
              {s.headline}
            </motion.h2>
          </AnimatePresence>
        </div>
        <div className="overflow-hidden mt-3.5 min-h-[4.8rem]">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.div
              key={s.id + '-p'}
              initial={reduce ? false : { y: '100%', opacity: 0 }}
              animate={{ y: '0%', opacity: 1 }}
              exit={reduce ? undefined : { y: '-100%', opacity: 0 }}
              transition={{ duration: 0.4, delay: 0.24, ease: EASE }}
            >
              <p className="text-[0.95rem] md:text-[0.9rem] leading-[1.6] text-white/85 max-w-md">{s.caption}</p>
              {s.meta && <p className="mt-1.5 text-xs text-white/55">{s.meta}</p>}
            </motion.div>
          </AnimatePresence>
        </div>
        {/* stationary CTA */}
        <Link to="/impact" className="mt-6 inline-flex items-center gap-3 rounded-md bg-[#B22234] px-6 py-3 text-sm font-semibold text-white hover:bg-[#c8303f] transition-colors">
          View gallery <span aria-hidden>→</span>
        </Link>
      </div>

      {/* card track: next visits in the queue */}
      <div
        className="absolute z-[5] left-5 md:left-[54%] bottom-24 md:bottom-auto md:top-1/2 md:-translate-y-1/2"
        style={{ height: big.h + 48 }}
        aria-hidden
      >
        {slides.map((sl, i) => {
          const slot = (((i - step) % N) + N) % N // 0 = currently the hero
          const gen = Math.floor((step - i - 1 + N * 10000) / N) // changes when a card wraps to the back → remount off-screen
          const isBig = slot === 1
          const size = slot <= 1 ? big : small
          const visible = slot >= 1 && slot <= 3
          return (
            <motion.div
              key={`${sl.id}-${gen}`}
              className="absolute left-0"
              style={{ top: 48 + (big.h - size.h) / 2 - 48 }}
              initial={reduce ? false : { x: offRight, width: small.w, opacity: 1, scale: 1 }}
              animate={{
                x: slot === 0 ? slotX(1) : visible ? slotX(slot) : offRight,
                width: size.w,
                top: (big.h - size.h) / 2,
                opacity: slot === 0 ? 0 : 1,
                scale: slot === 0 ? 0.94 : 1,
              }}
              transition={{
                duration: reduce ? 0 : slot === 0 ? 0.35 : 0.45,
                delay: reduce ? 0 : slot === 0 ? 0 : 0.15,
                ease: EASE,
              }}
            >
              <p className="text-[0.8rem] md:text-[13px] font-semibold text-white truncate">{sl.headline}</p>
              <p className="mt-1 mb-2.5 text-[0.62rem] tracking-[0.2em] uppercase text-white/70">{sl.label}</p>
              <motion.div
                className="relative overflow-hidden rounded-[14px] shadow-[0_20px_40px_rgba(0,0,0,0.45)] ring-1 ring-white/10"
                initial={false}
                animate={{ height: size.h }}
                transition={{ duration: reduce ? 0 : 0.45, delay: reduce ? 0 : 0.15, ease: EASE }}
                style={{ background: sl.image ? '#111' : sl.tone }}
              >
                {sl.image ? (
                  <img src={sl.image} alt="" className="absolute inset-0 h-full w-full object-cover" loading="lazy" decoding="async" />
                ) : (
                  <div className="absolute inset-0 grid place-items-center">
                    <span className="font-display italic text-white/25 text-4xl">JF</span>
                    <span className="absolute bottom-3 left-3 right-3 text-[0.55rem] tracking-[0.2em] uppercase text-white/45">[Photo to come]</span>
                  </div>
                )}
                <motion.span
                  className="absolute top-3.5 right-3.5 grid h-8 w-8 place-items-center rounded-full bg-white text-ink"
                  initial={false}
                  animate={{ opacity: isBig ? 1 : 0, scale: isBig ? 1 : 0.6 }}
                  transition={{ duration: reduce ? 0 : 0.35, delay: reduce ? 0 : isBig ? 0.35 : 0, ease: EASE }}
                >
                  <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-none stroke-current" strokeWidth="2"><path d="M7 17L17 7M9 7h8v8" /></svg>
                </motion.span>
              </motion.div>
            </motion.div>
          )
        })}
      </div>

      {/* arrows */}
      <div className="absolute z-[6] left-5 md:left-[56%] bottom-8 flex gap-3">
        {([-1, 1] as const).map((d) => (
          <button
            key={d}
            onClick={() => go(d)}
            className="grid h-10 w-10 md:h-9 md:w-9 place-items-center rounded-full border border-white/35 bg-white/[0.08] backdrop-blur-[4px] text-white hover:bg-white/20 transition-colors"
            aria-label={d === -1 ? 'Previous visit' : 'Next visit'}
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" strokeWidth="2">
              <path d={d === -1 ? 'M15 6l-6 6 6 6' : 'M9 6l6 6-6 6'} />
            </svg>
          </button>
        ))}
      </div>

      {/* counter */}
      <div className="absolute z-[6] right-5 md:right-[max(2rem,calc((100vw-72rem)/2+2rem))] bottom-10 flex items-center gap-3 text-xs text-white tabular-nums">
        <span>{String(active + 1).padStart(2, '0')}</span>
        <span className="relative h-px w-14 bg-white/25 overflow-hidden">
          <motion.span
            className="absolute inset-y-0 left-0 bg-white"
            initial={false}
            animate={{ width: `${((active + 1) / N) * 100}%` }}
            transition={{ duration: reduce ? 0 : 0.6, ease: EASE }}
          />
        </span>
        <span className="text-white/60">{String(N).padStart(2, '0')}</span>
      </div>

      <p className="sr-only" aria-live="polite">{`${s.label}: ${s.headline}. ${s.caption}`}</p>
    </section>
  )
}
