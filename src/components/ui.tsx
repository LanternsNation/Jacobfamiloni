import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { useInView, useReducedMotion } from 'framer-motion'
import { Reveal } from './Reveal'
import { PlaceholderMedia } from './Placeholder'
import type { GalleryItem, Initiative } from '../lib/types'
import { CATEGORY_LABEL } from '../lib/types'
import { formatDate, useImpact, useSettings } from '../lib/data'

/** Large number that rolls up once when it scrolls into view. */
export function CountUp({ value, className = '' }: { value: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: '-10% 0px' })
  const reduce = useReducedMotion()
  const [shown, setShown] = useState(0)
  useEffect(() => {
    if (!inView) return
    if (reduce) {
      setShown(value)
      return
    }
    let raf = 0
    const start = performance.now()
    const from = 0
    const dur = 1400
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / dur)
      const eased = 1 - Math.pow(1 - p, 3)
      setShown(Math.round(from + (value - from) * eased))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [inView, value, reduce])
  return (
    <span ref={ref} className={`tabular-nums ${className}`}>
      {shown.toLocaleString('en-NG')}
    </span>
  )
}

export function SectionHeading({ eyebrow, title, intro, className = '' }: { eyebrow?: string; title: ReactNode; intro?: ReactNode; className?: string }) {
  return (
    <Reveal className={`max-w-3xl ${className}`}>
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <h2 className="text-4xl md:text-6xl mt-4 text-balance">{title}</h2>
      {intro && <p className="mt-5 text-lg text-ivory-2 leading-relaxed max-w-2xl">{intro}</p>}
    </Reveal>
  )
}

/** Simple editorial page header used by inner pages. */
export function PageHeader({ eyebrow, title, intro }: { eyebrow: string; title: ReactNode; intro?: ReactNode }) {
  return (
    <header className="grain bg-ink pt-32 md:pt-40 pb-14 md:pb-20 border-b border-white/5">
      <div className="container-x relative z-[2]">
        <Reveal>
          <p className="eyebrow">{eyebrow}</p>
          <h1 className="text-5xl md:text-8xl mt-5 max-w-5xl text-balance">{title}</h1>
          {intro && <p className="mt-6 text-lg md:text-xl text-ivory-2 max-w-2xl leading-relaxed">{intro}</p>}
        </Reveal>
      </div>
    </header>
  )
}

export function GoldRule({ className = '' }: { className?: string }) {
  return <div className={`rule-gold ${className}`} aria-hidden />
}

export function StatusPill({ status }: { status: Initiative['status'] }) {
  return status === 'active' ? (
    <span className="inline-flex items-center gap-1.5 text-[0.7rem] uppercase tracking-[0.2em] text-gold">
      <span className="h-1.5 w-1.5 rounded-full bg-gold" /> Active
    </span>
  ) : (
    <span className="text-[0.7rem] uppercase tracking-[0.2em] text-muted">Coming soon</span>
  )
}

export function InitiativeCard({ i, index }: { i: Initiative; index: number }) {
  return (
    <Reveal delay={index * 0.05}>
      <Link
        to={`/initiatives/${i.slug}`}
        className="group block h-full border-t border-gold/40 pt-6 pb-8 hover:border-gold transition-colors"
      >
        <div className="flex items-center justify-between">
          <span className="font-display text-gold/80 text-xl tabular-nums">{String(index + 1).padStart(2, '0')}</span>
          <StatusPill status={i.status} />
        </div>
        <h3 className="mt-6 text-3xl md:text-[2.1rem] group-hover:text-gold-soft transition-colors">{i.title}</h3>
        <p className="mt-4 text-ivory-2 leading-relaxed">{i.summary}</p>
        {i.partner && !i.summary.includes(i.partner) && <p className="mt-3 text-sm text-muted">In partnership with {i.partner}</p>}
        <span className="mt-6 inline-block text-sm text-gold group-hover:translate-x-1 transition-transform">Learn more →</span>
      </Link>
    </Reveal>
  )
}

export function MediaImage({ src, alt, className = '', label }: { src: string | null; alt: string; className?: string; label?: string }) {
  if (!src) return <PlaceholderMedia label={label ?? 'Photo'} className={className} />
  return <img src={src} alt={alt} loading="lazy" decoding="async" className={`object-cover ${className}`} />
}

export function GalleryCard({ g }: { g: GalleryItem }) {
  const date = formatDate(g.date_taken)
  return (
    <figure className="group">
      <div className="overflow-hidden rounded-sm">
        <MediaImage
          src={g.image_url}
          alt={g.caption || g.title}
          label={`${CATEGORY_LABEL[g.category]} photo`}
          className="aspect-[4/5] w-full group-hover:scale-[1.03] transition-transform duration-700"
        />
      </div>
      <figcaption className="mt-3">
        <p className="text-[0.68rem] uppercase tracking-[0.2em] text-gold">{CATEGORY_LABEL[g.category]}</p>
        <p className="mt-1 text-ivory">{g.caption || g.title}</p>
        <p className="text-xs text-muted mt-1">{[g.place, date].filter(Boolean).join(' · ')}</p>
      </figcaption>
    </figure>
  )
}

/** Lightweight YouTube embed: shows the thumbnail, loads the player only on tap (saves data). */
export function YouTubeLite({ id, title }: { id: string; title: string }) {
  const [play, setPlay] = useState(false)
  return (
    <div className="relative aspect-video bg-ink-2 overflow-hidden rounded-sm">
      {play ? (
        <iframe
          className="absolute inset-0 h-full w-full"
          src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`}
          title={title}
          allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      ) : (
        <button className="group absolute inset-0 w-full" onClick={() => setPlay(true)} aria-label={`Play video: ${title}`}>
          <img src={`https://i.ytimg.com/vi/${id}/hqdefault.jpg`} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover opacity-80 group-hover:opacity-100 transition" />
          <span className="absolute inset-0 grid place-items-center">
            <span className="grid h-16 w-16 place-items-center rounded-full bg-ink/70 border border-gold/60 text-gold text-xl">▶</span>
          </span>
        </button>
      )}
    </div>
  )
}

/** Live impact counter (counts only). */
export function ImpactCounter({ compact = false }: { compact?: boolean }) {
  const impact = useImpact()
  const { counters } = useSettings()
  const items = [
    counters.show_applicants && { label: 'Young Nigerians applied', value: impact?.applicants ?? 0 },
    counters.show_seats_sponsored && { label: 'Seats sponsored', value: impact?.seats_sponsored ?? 0 },
    counters.show_students_placed && { label: 'Students placed in sponsored seats', value: impact?.students_placed ?? 0 },
    counters.show_states && { label: 'States represented', value: impact?.states_represented ?? 0, suffix: ' / 37' },
  ].filter(Boolean) as { label: string; value: number; suffix?: string }[]

  return (
    <div className={`grid grid-cols-2 ${items.length > 3 ? 'md:grid-cols-4' : 'md:grid-cols-3'} gap-x-6 gap-y-10`}>
      {items.map((it) => (
        <div key={it.label} className="border-t border-gold/30 pt-5">
          <p className={`font-display ${compact ? 'text-5xl' : 'text-6xl md:text-7xl'} text-ivory leading-none`}>
            <CountUp value={it.value} />
            {it.suffix && <span className="text-2xl text-muted">{it.suffix}</span>}
          </p>
          <p className="mt-3 text-sm text-ivory-2">{it.label}</p>
        </div>
      ))}
    </div>
  )
}

export function CohortBanner() {
  const { cohort_banner } = useSettings()
  if (!cohort_banner.show || !cohort_banner.text) return null
  return (
    <Link to="/apply" className="block bg-gold text-ink text-center text-sm py-2.5 px-4 font-medium hover:bg-gold-soft transition-colors">
      {cohort_banner.text} <span className="underline underline-offset-4">Apply now</span>
    </Link>
  )
}

export function Notice({ tone = 'info', children }: { tone?: 'info' | 'error' | 'success'; children: ReactNode }) {
  const styles = {
    info: 'border-gold/30 text-ivory-2',
    error: 'border-red-400/50 text-red-200',
    success: 'border-emerald-400/40 text-emerald-100',
  }[tone]
  return <div className={`border rounded-lg px-4 py-3 text-sm ${styles}`}>{children}</div>
}
