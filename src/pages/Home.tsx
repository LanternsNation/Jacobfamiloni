import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import { Reveal } from '../components/Reveal'
import { PlaceholderMedia } from '../components/Placeholder'
import { CohortBanner, CountUp, GalleryCard, GoldRule, ImpactCounter, InitiativeCard, SectionHeading, YouTubeLite } from '../components/ui'
import { achievements, heroMedia, photos, site } from '../lib/content'
import { useGallery, useInitiatives, useSettings } from '../lib/data'

function Hero() {
  const { hero } = useSettings()
  const reduce = useReducedMotion()
  const videoRef = useRef<HTMLVideoElement>(null)
  const video = hero.video_url || heroMedia.videoSrc
  const poster = hero.poster_url || heroMedia.posterSrc
  // Respect data-saver: no autoplaying video on Save-Data or 2G/3G.
  const [allowVideo, setAllowVideo] = useState(false)
  useEffect(() => {
    const c = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection
    const slow = c?.saveData || (c?.effectiveType && /(^|-)2g|3g/.test(c.effectiveType))
    setAllowVideo(Boolean(video) && !slow && !reduce)
  }, [video, reduce])

  const words = (hero.headline || site.legacyStatement).split(' ')

  return (
    <section className="grain relative min-h-[100svh] flex items-end overflow-hidden bg-ink">
      <div className="absolute inset-0 md:left-[42%]">
        {poster && (
          <img
            src={poster}
            srcSet={!hero.poster_url ? heroMedia.posterSrcSet : undefined}
            sizes="100vw"
            alt="Dr. Jacob Familoni"
            fetchPriority="high"
            decoding="async"
            className="absolute inset-0 h-full w-full object-cover object-[50%_22%] md:object-[50%_30%]"
          />
        )}
        {allowVideo && (
          <video
            ref={videoRef}
            className="absolute inset-0 h-full w-full object-cover"
            src={video}
            poster={poster || undefined}
            autoPlay
            muted
            loop
            playsInline
            preload="none"
            aria-hidden
          />
        )}
        {!poster && !video && (
          // PLACEHOLDER until the hero loop and poster arrive: a warm, cinematic field so the page still feels finished.
          <div className="absolute inset-0 bg-[radial-gradient(120%_80%_at_70%_20%,#2a2416_0%,#121828_45%,#0b0f1a_75%)]">
            <div className="absolute right-[6%] top-[14%] hidden md:block w-[28vw] max-w-sm aspect-[3/4]">
              <PlaceholderMedia label="Hero portrait / footage of Dr. Familoni" className="h-full w-full opacity-70" />
            </div>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/70 to-ink/5 md:via-ink/20" />
        <div className="absolute inset-0 bg-ink/15" />
        <div className="hidden md:block absolute inset-y-0 left-0 w-2/5 bg-gradient-to-r from-ink to-transparent" />
      </div>
      <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-ink/80 to-transparent" aria-hidden />

      <div className="container-x relative z-[2] pb-16 md:pb-24 pt-32">
        <motion.p
          className="eyebrow"
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
        >
          Dr. Jacob Familoni
        </motion.p>
        <h1 className="mt-6 text-[13vw] md:text-[7vw] lg:text-[6.5rem] leading-[0.92] max-w-6xl md:max-w-[55%]">
          {words.map((w, i) => (
            <motion.span
              key={i}
              className="inline-block mr-[0.22em]"
              initial={reduce ? false : { opacity: 0, y: '0.4em' }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.3 + i * 0.07, ease: [0.22, 1, 0.36, 1] }}
            >
              {w === 'home.' || w === 'home' ? <em className="text-gold font-light italic">{w}</em> : w}
            </motion.span>
          ))}
        </h1>
        {hero.subhead && (
          <motion.p
            className="mt-6 text-lg md:text-xl text-ivory-2 max-w-xl"
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1 }}
          >
            {hero.subhead}
          </motion.p>
        )}
        <motion.div
          className="mt-10 flex flex-wrap gap-3"
          initial={reduce ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.15 }}
        >
          <Link to="/story" className="btn-gold">His story</Link>
          <Link to="/initiatives" className="btn-ghost">The work at home</Link>
        </motion.div>
      </div>
    </section>
  )
}

function StoryInBrief() {
  return (
    <section className="container-x py-24 md:py-36 grid md:grid-cols-12 gap-12 items-center">
      <Reveal className="md:col-span-5">
        <img src={photos.speaking.src} width={photos.speaking.w} height={photos.speaking.h} alt={photos.speaking.alt} loading="lazy" decoding="async" className="aspect-[4/5] w-full object-cover object-top" />
      </Reveal>
      <div className="md:col-span-6 md:col-start-7">
        <Reveal>
          <p className="eyebrow">His story, in brief</p>
          <p className="mt-6 font-display text-3xl md:text-[2.6rem] leading-[1.15] text-ivory">{site.storyInBrief}</p>
          <Link to="/story" className="mt-10 inline-block text-gold border-b border-gold/40 pb-1 hover:border-gold">
            Read his full story →
          </Link>
        </Reveal>
      </div>
    </section>
  )
}

function Achievements() {
  return (
    <section className="grain bg-ink-2 py-24 md:py-32">
      <div className="container-x relative z-[2]">
        <SectionHeading eyebrow="A record of excellence" title="In numbers" />
        <div className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-12">
          {achievements.map((a, i) => {
            const n = Number(a.value)
            return (
              <Reveal key={a.label} delay={i * 0.06} className="border-t border-gold/30 pt-6">
                <p className="font-display text-6xl md:text-8xl leading-none text-ivory">
                  {Number.isFinite(n) ? <CountUp value={n} /> : <span className="text-gold/70">{a.value}</span>}
                </p>
                <p className="mt-4 text-sm text-ivory-2">{a.label}</p>
              </Reveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}

function VisitsStrip() {
  const { data } = useGallery()
  const items = (data ?? []).filter((g) => g.category === 'visit' || g.category === 'meeting').slice(0, 8)
  return (
    <section className="py-24 md:py-32">
      <div className="container-x flex items-end justify-between gap-6">
        <SectionHeading eyebrow="Visits and meetings" title="On the ground, at home." />
        <Link to="/impact" className="hidden md:inline text-gold text-sm whitespace-nowrap">View gallery →</Link>
      </div>
      <div className="mt-12 flex gap-5 overflow-x-auto snap-x snap-mandatory pb-4 [scrollbar-width:none]" style={{ paddingInline: 'max(1.25rem, calc((100vw - 72rem) / 2 + 2rem))', scrollPaddingInline: 'max(1.25rem, calc((100vw - 72rem) / 2 + 2rem))' }}>
        {(items.length ? items : Array.from({ length: 4 }, () => null)).map((g, i) => (
          <div key={g?.id ?? i} className="snap-start shrink-0 w-[72vw] sm:w-[42vw] md:w-[22rem]">
            {g ? <GalleryCard g={g} /> : <PlaceholderMedia label="Visit photo" className="aspect-[4/5] w-full" />}
          </div>
        ))}
      </div>
      <div className="container-x mt-6 md:hidden">
        <Link to="/impact" className="text-gold text-sm">View gallery →</Link>
      </div>
    </section>
  )
}

function InitiativesSection() {
  const { data } = useInitiatives()
  return (
    <section className="container-x py-24 md:py-32">
      <SectionHeading
        eyebrow="The work at home"
        title="Four initiatives. One standard of excellence."
        intro="Skills, dignity, character and care, built in Nigeria and measured by the lives they change."
      />
      <div className="mt-16 grid md:grid-cols-2 gap-x-12">
        {(data ?? []).map((i, idx) => (
          <InitiativeCard key={i.id} i={i} index={idx} />
        ))}
      </div>
    </section>
  )
}

function ImpactSection() {
  return (
    <section className="grain bg-ink-2 py-24 md:py-32">
      <div className="container-x relative z-[2]">
        <div className="flex items-end justify-between gap-6 flex-wrap">
          <SectionHeading eyebrow="Live impact" title="Every number is a person." />
          <span className="inline-flex items-center gap-2 text-xs text-muted">
            <span className="h-2 w-2 rounded-full bg-gold animate-pulse" /> Updated live
          </span>
        </div>
        <div className="mt-14">
          <ImpactCounter />
        </div>
      </div>
    </section>
  )
}

function LatestVideos() {
  const { videos } = useSettings()
  const ids = videos.youtube_ids.slice(0, 3)
  return (
    <section className="container-x py-24 md:py-32">
      <div className="flex items-end justify-between gap-6">
        <SectionHeading eyebrow="Watch" title="Latest videos" />
        <Link to="/media" className="text-gold text-sm whitespace-nowrap">All media →</Link>
      </div>
      <div className="mt-12 grid md:grid-cols-3 gap-6">
        {ids.length
          ? ids.map((id) => <YouTubeLite key={id} id={id} title="Dr. Jacob Familoni" />)
          : [0, 1, 2].map((i) => <PlaceholderMedia key={i} label="YouTube video (add IDs in admin)" className="aspect-video w-full" />)}
      </div>
    </section>
  )
}

function SupportCta() {
  return (
    <section className="container-x py-24 md:py-36">
      <Reveal className="relative border border-gold/30 px-6 py-16 md:px-16 md:py-24 text-center overflow-hidden">
        <p className="eyebrow">Be part of it</p>
        <h2 className="mt-5 text-5xl md:text-7xl max-w-4xl mx-auto text-balance">
          ₦2,000 puts a young Nigerian in the room.
        </h2>
        <p className="mt-6 text-ivory-2 max-w-xl mx-auto">
          Sponsor a seat in the AI School, or support an initiative. Every naira goes to the work in Nigeria.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <Link to="/support" className="btn-gold">Sponsor a seat</Link>
          <Link to="/apply" className="btn-ghost">Apply to the AI School</Link>
        </div>
        <GoldRule className="absolute bottom-0 inset-x-0" />
      </Reveal>
    </section>
  )
}

export default function Home() {
  return (
    <>
      <Hero />
      <CohortBanner />
      <StoryInBrief />
      <Achievements />
      <VisitsStrip />
      <InitiativesSection />
      <ImpactSection />
      <LatestVideos />
      <SupportCta />
    </>
  )
}
