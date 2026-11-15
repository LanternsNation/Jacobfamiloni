import { Link } from 'react-router-dom'
import { Reveal } from '../components/Reveal'
import { PageHeader, SectionHeading } from '../components/ui'
import { photos, site, timeline, values } from '../lib/content'

export default function Story() {
  return (
    <>
      <PageHeader eyebrow="His Story" title={<>From Nigeria, to the world, <em className="italic font-light text-gold">and home again.</em></>} />

      <section className="container-x py-20 md:py-28 grid md:grid-cols-12 gap-12">
        <Reveal className="md:col-span-5 md:sticky md:top-24 self-start">
          <img src={photos.archive.src} width={photos.archive.w} height={photos.archive.h} alt={photos.archive.alt} loading="lazy" decoding="async" className="aspect-[4/5] w-full object-cover object-top" />
          <p className="mt-3 text-xs text-muted">{photos.archive.caption}</p>
        </Reveal>
        <div className="md:col-span-6 md:col-start-7 space-y-16">
          <Reveal>
            <p className="eyebrow">The journey</p>
            <p className="mt-5 font-display text-3xl leading-snug">{site.storyInBrief}</p>
          </Reveal>
          <Reveal>
            <p className="eyebrow">Career and business record</p>
            <p className="mt-5 text-lg text-ivory-2 leading-relaxed">
              [PLACEHOLDER — His career and business record, in verified, approved detail: roles, companies built or led, and what they achieved. Facts only; nothing to be added here without confirmation from the team.]
            </p>
          </Reveal>
          <Reveal>
            <img src={photos.speaking.src} width={photos.speaking.w} height={photos.speaking.h} alt={photos.speaking.alt} loading="lazy" decoding="async" className="mb-8 aspect-[4/3] w-full object-cover object-[50%_25%]" />
            <p className="eyebrow">Why he is investing at home</p>
            <blockquote className="mt-5 border-l border-gold pl-6 font-display text-2xl md:text-3xl italic font-light leading-snug">
              &ldquo;[PLACEHOLDER — In his own words: why he is building in Nigeria now.]&rdquo;
            </blockquote>
          </Reveal>
        </div>
      </section>

      <section className="grain bg-ink-2 py-24 md:py-32">
        <div className="container-x relative z-[2]">
          <SectionHeading eyebrow="What he stands for" title="Values" />
          <div className="mt-14 grid md:grid-cols-3 gap-10">
            {values.map((v, i) => (
              <Reveal key={i} delay={i * 0.06} className="border-t border-gold/30 pt-6">
                <h3 className="text-3xl">{v.title}</h3>
                <p className="mt-4 text-ivory-2 leading-relaxed">{v.body}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="container-x py-24 md:py-32">
        <SectionHeading eyebrow="Milestones" title="A timeline" />
        <ol className="mt-16 relative border-l border-gold/30 ml-2 md:ml-0">
          {timeline.map((t, i) => (
            <li key={i} className="pl-8 md:pl-12 pb-14 last:pb-0 relative">
              <span className="absolute -left-[5px] top-2 h-2.5 w-2.5 rounded-full bg-gold" aria-hidden />
              <Reveal>
                <p className="font-display text-gold text-2xl">{t.year}</p>
                <h3 className="mt-2 text-3xl md:text-4xl">{t.title}</h3>
                <p className="mt-3 text-ivory-2 max-w-2xl leading-relaxed">{t.body}</p>
              </Reveal>
            </li>
          ))}
        </ol>
      </section>

      <section className="container-x pb-12 text-center">
        <Reveal>
          <p className="font-display text-4xl md:text-6xl max-w-3xl mx-auto text-balance">The story continues at home.</p>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <Link to="/initiatives" className="btn-gold">See the initiatives</Link>
            <Link to="/impact" className="btn-ghost">Visits and gallery</Link>
          </div>
        </Reveal>
      </section>
    </>
  )
}
