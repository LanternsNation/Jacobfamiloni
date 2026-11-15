import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { site } from '../lib/content'
import { useSettings } from '../lib/data'
import { YouTubeLite } from './ui'

/**
 * AI School call-to-action (Home, after His Journey).
 * Light canvas with a faint diagonal grid and line-art watermarks; headline with a 3D pencil cup;
 * cut-out of Dr. Familoni on a navy blob with floating track tiles and a rotating course card;
 * curved connector arrows. Stock models and third-party logos deliberately not used.
 */

const EASE = [0.22, 1, 0.36, 1] as const

/* ---------- small drawn objects (no image requests) ---------- */
function PencilCup({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 80" className={className} aria-hidden>
      <defs>
        <linearGradient id="cupBody" x1="0" x2="1">
          <stop offset="0" stopColor="#F2B53C" />
          <stop offset="0.45" stopColor="#FFD56B" />
          <stop offset="1" stopColor="#D9951E" />
        </linearGradient>
        <linearGradient id="pencilA" x1="0" x2="1">
          <stop offset="0" stopColor="#E0484F" />
          <stop offset="1" stopColor="#A81E2C" />
        </linearGradient>
        <linearGradient id="pencilB" x1="0" x2="1">
          <stop offset="0" stopColor="#FF8A3D" />
          <stop offset="1" stopColor="#D85A12" />
        </linearGradient>
      </defs>
      <g transform="rotate(-12 26 30)">
        <rect x="20" y="6" width="8" height="38" rx="1.5" fill="url(#pencilA)" />
        <path d="M20 6 L24 -4 L28 6 Z" fill="#F3D9B1" />
        <path d="M22.6 -0.5 L24 -4 L25.4 -0.5 Z" fill="#2B2B2B" />
      </g>
      <g transform="rotate(10 40 30)">
        <rect x="36" y="8" width="8" height="36" rx="1.5" fill="url(#pencilB)" />
        <path d="M36 8 L40 -2 L44 8 Z" fill="#F3D9B1" />
        <path d="M38.6 1.5 L40 -2 L41.4 1.5 Z" fill="#2B2B2B" />
      </g>
      <ellipse cx="32" cy="74" rx="22" ry="4" fill="rgba(11,15,26,0.12)" />
      <path d="M12 34 h40 v34 a20 6 0 0 1 -40 0 z" fill="url(#cupBody)" />
      <ellipse cx="32" cy="34" rx="20" ry="6" fill="#FFE59A" />
      <ellipse cx="32" cy="34" rx="16" ry="4.2" fill="#C98A16" />
    </svg>
  )
}

function Plant({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 78" className={className} aria-hidden>
      <defs>
        <linearGradient id="leaf" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor="#7BC86C" />
          <stop offset="1" stopColor="#2E8B4A" />
        </linearGradient>
        <linearGradient id="pot" x1="0" x2="1">
          <stop offset="0" stopColor="#E9E4DA" />
          <stop offset="0.5" stopColor="#FFFFFF" />
          <stop offset="1" stopColor="#D6CFC2" />
        </linearGradient>
      </defs>
      <path d="M32 46 C 18 40, 8 26, 10 8 C 24 14, 32 28, 32 46 Z" fill="url(#leaf)" />
      <path d="M32 46 C 46 40, 58 22, 54 4 C 40 12, 32 28, 32 46 Z" fill="url(#leaf)" />
      <path d="M32 46 C 30 32, 30 22, 34 12 C 38 24, 36 36, 32 46 Z" fill="#59B35E" />
      <ellipse cx="32" cy="74" rx="18" ry="3.5" fill="rgba(11,15,26,0.12)" />
      <path d="M16 46 h32 l-4 24 a12 4 0 0 1 -24 0 z" fill="url(#pot)" />
      <ellipse cx="32" cy="46" rx="16" ry="4" fill="#F7F4EE" />
      <ellipse cx="32" cy="46.5" rx="12" ry="2.6" fill="#7A5A3A" />
    </svg>
  )
}

/* faint line-art watermarks for the corners */
const Watermarks = () => (
  <>
    <svg viewBox="0 0 200 120" className="absolute left-4 bottom-4 w-56 md:w-72 opacity-[0.07] text-ink pointer-events-none" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      {/* trophy */}
      <path d="M30 20 h40 v20 a20 20 0 0 1 -40 0 z M30 26 h-10 a10 10 0 0 0 10 14 M70 26 h10 a10 10 0 0 1 -10 14 M50 60 v16 M36 90 h28 v-10 h-28 z" />
      {/* flask */}
      <path d="M120 18 v30 l-22 44 a8 8 0 0 0 7 12 h50 a8 8 0 0 0 7 -12 l-22 -44 v-30 M114 18 h32 M108 80 h44" />
    </svg>
    <svg viewBox="0 0 200 120" className="absolute right-4 bottom-4 w-56 md:w-72 opacity-[0.07] text-ink pointer-events-none" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      {/* compass */}
      <path d="M50 14 a6 6 0 1 1 0.1 0 M50 26 l-24 76 M50 26 l24 76 M34 74 h32" />
      {/* clock */}
      <circle cx="140" cy="64" r="32" />
      <path d="M140 44 v20 l14 10 M118 30 l-8 -8 M162 30 l8 -8" />
    </svg>
  </>
)

/* track tiles: drawn icons, no third-party logos */
function Tile({ children, className, delay = 0, tilt = 0 }: { children: React.ReactNode; className: string; delay?: number; tilt?: number }) {
  const reduce = useReducedMotion()
  return (
    <motion.div
      className={`absolute z-[4] grid place-items-center rounded-2xl bg-white shadow-[0_14px_30px_rgba(11,15,26,0.16)] ring-1 ring-black/5 ${className}`}
      style={{ rotate: tilt }}
      initial={reduce ? false : { opacity: 0, scale: 0.85 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.7, delay: 0.3 + delay, ease: EASE }}
    >
      <div className={reduce ? '' : 'float-y'} style={{ animationDelay: `${delay * 2}s` }}>
        {children}
      </div>
    </motion.div>
  )
}

export function SchoolCta() {
  const reduce = useReducedMotion()
  const { videos } = useSettings()
  const [playing, setPlaying] = useState(false)
  const videoId = videos.youtube_ids[0]


  const up = (d: number) => (reduce ? {} : { initial: { opacity: 0, y: 24 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, margin: '-10% 0px' }, transition: { duration: 0.8, delay: d, ease: EASE } })

  return (
    <section className="relative overflow-hidden bg-[#F4F1EA] text-ink">
      {/* diagonal grid */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            'repeating-linear-gradient(45deg, rgba(15,23,42,0.045) 0 1px, transparent 1px 64px), repeating-linear-gradient(-45deg, rgba(15,23,42,0.045) 0 1px, transparent 1px 64px)',
        }}
        aria-hidden
      />
      <Watermarks />

      <div className="container-x relative grid md:grid-cols-12 gap-10 md:gap-6 items-center py-20 md:py-28">
        {/* LEFT */}
        <div className="md:col-span-6 relative z-[3]">
          <motion.p {...up(0)} className="text-[0.78rem] font-bold tracking-[0.18em] uppercase text-[#B22234]">
            {site.schoolName} · Cohort 1
          </motion.p>
          <motion.h2 {...up(0.08)} className="mt-3 font-sans font-extrabold text-ink text-[2.9rem] sm:text-[3.4rem] lg:text-[4rem] leading-[1.06] tracking-[-0.02em]">
            <span className="inline-flex items-end gap-3">
              Your Future
              <PencilCup className="w-11 h-14 sm:w-12 sm:h-[3.75rem] -mb-1 shrink-0" />
            </span>
            <br />
            Starts <span className="relative inline-block">
              Here.
              <svg viewBox="0 0 200 20" className="absolute left-0 -bottom-2 w-full h-3 text-[#B22234]" preserveAspectRatio="none" aria-hidden>
                <path d="M2 14 C 50 4, 120 4, 198 12" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
              </svg>
            </span>
          </motion.h2>
          <motion.p {...up(0.16)} className="mt-6 max-w-[24rem] text-[0.98rem] leading-[1.65] text-ink/60">
            Practical AI skills for young Nigerians aged 18 to 35. ₦2,000 secures your seat, or apply for a sponsored one.
          </motion.p>

          <motion.div {...up(0.24)} className="mt-9 flex flex-wrap items-center gap-6">
            <Link
              to="/apply"
              className="group inline-flex items-center gap-3 rounded-full bg-[#1B2A5C] px-8 py-4 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(27,42,92,0.28)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_32px_rgba(27,42,92,0.35)]"
            >
              Apply Now <span className="transition-transform group-hover:translate-x-1">→</span>
            </Link>
            {videoId ? (
              <button onClick={() => setPlaying(true)} className="group inline-flex items-center gap-3">
                <span className="relative grid h-12 w-12 place-items-center rounded-full bg-[radial-gradient(circle_at_30%_30%,#F0727D,#B22234)] shadow-[0_10px_24px_rgba(178,34,52,0.35)]">
                  <span className="absolute inset-0 rounded-full ring-4 ring-[#B22234]/25 group-hover:animate-ping" />
                  <svg viewBox="0 0 24 24" className="h-4 w-4 fill-white ml-0.5"><path d="M8 5v14l11-7z" /></svg>
                </span>
                <span className="text-sm font-bold text-ink underline underline-offset-4 decoration-ink/30">Play Video</span>
              </button>
            ) : (
              <Link to="/support" className="group inline-flex items-center gap-3">
                <span className="relative grid h-12 w-12 place-items-center rounded-full bg-[radial-gradient(circle_at_30%_30%,#F0727D,#B22234)] shadow-[0_10px_24px_rgba(178,34,52,0.35)]">
                  <span className="absolute inset-0 rounded-full ring-4 ring-[#B22234]/25 group-hover:animate-ping" />
                  <svg viewBox="0 0 24 24" className="h-5 w-5 fill-white"><path d="M12 21s-7.5-4.6-9.6-9.3C.9 8.2 3 4.5 6.6 4.5c2 0 3.6 1.1 4.4 2.6.8-1.5 2.4-2.6 4.4-2.6 3.6 0 5.7 3.7 4.2 7.2C19.5 16.4 12 21 12 21z" /></svg>
                </span>
                <span className="text-sm font-bold text-ink underline underline-offset-4 decoration-ink/30">Sponsor a seat</span>
              </Link>
            )}
            <Plant className="hidden sm:block w-12 h-14 md:w-14 md:h-[4.25rem]" />
          </motion.div>
        </div>

        {/* connector arrows (desktop) */}
        <svg viewBox="0 0 220 120" className="hidden md:block absolute left-[38%] top-[13%] w-[15rem] text-[#E9A23B] pointer-events-none z-[2]" fill="none" aria-hidden>
          <motion.path
            d="M6 70 C 60 10, 150 6, 204 54"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            initial={reduce ? false : { pathLength: 0 }}
            whileInView={{ pathLength: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, delay: 0.5, ease: EASE }}
          />
          <path d="M192 40 L206 56 L186 60" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <svg viewBox="0 0 220 120" className="hidden md:block absolute left-[40%] bottom-[9%] w-[13rem] text-[#B22234] pointer-events-none z-[2]" fill="none" aria-hidden>
          <motion.path
            d="M214 20 C 190 100, 70 118, 16 66"
            stroke="currentColor"
            strokeWidth="3.5"
            strokeLinecap="round"
            initial={reduce ? false : { pathLength: 0 }}
            whileInView={{ pathLength: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, delay: 0.8, ease: EASE }}
          />
          <path d="M30 56 L14 66 L34 78" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>

        {/* RIGHT: subject on blob with floating tiles */}
        <motion.div
          className="md:col-span-6 relative mx-auto w-full max-w-[26rem] md:max-w-[30rem] aspect-[5/5.4]"
          initial={reduce ? false : { opacity: 0, scale: 0.92 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: '-10% 0px' }}
          transition={{ duration: 0.9, ease: EASE }}
        >
          {/* organic blob + lighter curve */}
          <svg viewBox="0 0 400 420" className="absolute left-[6%] bottom-[4%] w-[94%] h-[88%]" aria-hidden>
            <path d="M58 140 C 40 70, 120 30, 200 46 C 300 64, 372 110, 360 220 C 350 320, 300 400, 196 404 C 96 408, 30 352, 34 270 C 36 220, 70 190, 58 140 Z" fill="#1B2A5C" />
            <path d="M58 140 C 40 70, 120 30, 200 46 C 140 60, 92 100, 98 170 C 102 220, 70 250, 34 270 C 36 220, 70 190, 58 140 Z" fill="#3C4F8C" opacity="0.55" />
            {/* tiny flag-star sprinkle */}
            {[[300, 120], [320, 160], [280, 150], [330, 210]].map(([x, y]) => (
              <circle key={`${x}${y}`} cx={x} cy={y} r="2.4" fill="#F5F1E8" opacity="0.5" />
            ))}
          </svg>
          <img
            src="/media/familoni-school-820.webp"
            srcSet="/media/familoni-school-520.webp 520w, /media/familoni-school-820.webp 820w"
            sizes="(min-width: 768px) 30rem, 90vw"
            alt="Dr. Jacob Familoni"
            loading="lazy"
            decoding="async"
            className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[98%] w-auto max-w-none z-[3] drop-shadow-[0_24px_30px_rgba(11,15,26,0.25)] [mask-image:linear-gradient(to_bottom,#000_80%,transparent)]"
          />

          {/* tiles: AI · code · design · business */}
          <Tile className="left-[2%] top-[22%] h-14 w-14 md:h-16 md:w-16" tilt={-10} delay={0}>
            <svg viewBox="0 0 24 24" className="h-7 w-7"><path d="M12 2l1.8 5.2L19 9l-5.2 1.8L12 16l-1.8-5.2L5 9l5.2-1.8z" fill="#B22234" /><path d="M19 14l.9 2.1L22 17l-2.1.9L19 20l-.9-2.1L16 17l2.1-.9z" fill="#E9A23B" /></svg>
          </Tile>
          <Tile className="right-[4%] top-[6%] h-12 w-12 md:h-14 md:w-14" tilt={12} delay={0.15}>
            <svg viewBox="0 0 24 24" className="h-6 w-6 fill-none stroke-[#1B2A5C]" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M8 7l-5 5 5 5M16 7l5 5-5 5M13.5 4l-3 16" /></svg>
          </Tile>
          <Tile className="right-[0%] bottom-[16%] h-14 w-14 md:h-[4.25rem] md:w-[4.25rem]" tilt={-8} delay={0.3}>
            <svg viewBox="0 0 24 24" className="h-7 w-7"><rect x="3" y="12" width="4" height="9" rx="1" fill="#1B2A5C" /><rect x="10" y="7" width="4" height="14" rx="1" fill="#B22234" /><rect x="17" y="3" width="4" height="18" rx="1" fill="#E9A23B" /></svg>
          </Tile>

          {/* rotating course card */}
          <motion.div
            className="absolute z-[5] left-[-2%] md:left-[-10%] bottom-[18%] md:bottom-[20%]"
            initial={reduce ? false : { opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.55, ease: EASE }}
          >
            <div className={`${reduce ? '' : 'float-y'} flex items-center gap-3 rounded-2xl bg-[linear-gradient(135deg,#FBBF24,#E9A23B)] px-4 py-3.5 shadow-[0_16px_32px_rgba(233,162,59,0.32)]`} style={{ animationDelay: '0.6s' }}>
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[10px] bg-white">
                <svg viewBox="0 0 24 24" className="h-6 w-6">
                  <path d="M12 12V3a9 9 0 0 1 9 9z" fill="#B22234" />
                  <path d="M12 12h9a9 9 0 0 1-9 9z" fill="#1B2A5C" />
                  <path d="M12 12v9a9 9 0 0 1-9-9z" fill="#E9A23B" />
                  <path d="M12 12H3a9 9 0 0 1 9-9z" fill="#3C9A5A" />
                </svg>
              </span>
              <div className="pr-1">
                <p className="text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-white/85">Familoni</p>
                <p className="text-[0.9rem] font-extrabold uppercase leading-[1.2] tracking-[0.04em] text-white">AI Digital School</p>
              </div>
            </div>
          </motion.div>

          {/* mobile-only: small curved arrow from card to CTA area */}
          <svg viewBox="0 0 120 80" className="md:hidden absolute -top-10 left-2 w-24 text-[#E9A23B] z-[2]" fill="none" aria-hidden>
            <path d="M110 70 C 90 20, 40 6, 10 30" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
            <path d="M20 18 L8 32 L26 36" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </motion.div>
      </div>

      {/* video modal */}
      <AnimatePresence>
        {playing && videoId && (
          <motion.div
            className="fixed inset-0 z-[70] grid place-items-center bg-ink/85 p-4 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setPlaying(false)}
          >
            <div className="w-full max-w-3xl" onClick={(e) => e.stopPropagation()}>
              <YouTubeLite id={videoId} title={site.schoolName} />
              <button className="mt-4 text-sm text-ivory underline" onClick={() => setPlaying(false)}>Close</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
