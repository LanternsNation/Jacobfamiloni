import { useMemo, useState } from 'react'
import { GalleryCard, ImpactCounter, PageHeader, SectionHeading } from '../components/ui'
import { useGallery, useInitiatives, usePublicSponsors } from '../lib/data'
import { CATEGORY_LABEL, type GalleryCategory } from '../lib/types'

export default function Impact() {
  const gallery = useGallery()
  const { data: initiatives } = useInitiatives()
  const sponsors = usePublicSponsors()
  const [initiative, setInitiative] = useState<string>('all')
  const [category, setCategory] = useState<GalleryCategory | 'all'>('all')

  const items = useMemo(
    () =>
      (gallery.data ?? []).filter(
        (g) => (initiative === 'all' || g.initiative_id === initiative) && (category === 'all' || g.category === category),
      ),
    [gallery.data, initiative, category],
  )

  return (
    <>
      <PageHeader
        eyebrow="Impact & Gallery"
        title="The work, in pictures."
        intro="Visits, meetings and the initiatives at work. Each photo is labelled with its place and date."
      />

      <section className="container-x py-16 md:py-20">
        <ImpactCounter />
      </section>

      <section className="container-x pb-20">
        <div className="sticky top-16 z-20 -mx-5 px-5 py-4 bg-ink/90 backdrop-blur border-b border-white/5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex gap-2 overflow-x-auto [scrollbar-width:none]">
            <Chip active={category === 'all'} onClick={() => setCategory('all')}>All</Chip>
            {(Object.keys(CATEGORY_LABEL) as GalleryCategory[]).map((c) => (
              <Chip key={c} active={category === c} onClick={() => setCategory(c)}>
                {CATEGORY_LABEL[c]}s
              </Chip>
            ))}
          </div>
          <select className="field !min-h-10 !py-1.5 md:!w-72 text-sm" value={initiative} onChange={(e) => setInitiative(e.target.value)} aria-label="Filter by initiative">
            <option value="all">All initiatives</option>
            {(initiatives ?? []).map((i) => (
              <option key={i.id} value={i.id}>{i.title}</option>
            ))}
          </select>
        </div>

        <div className="mt-10 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-10">
          {items.map((g) => (
            <GalleryCard key={g.id} g={g} />
          ))}
        </div>
        {!gallery.loading && items.length === 0 && <p className="mt-10 text-muted">Nothing here yet for this filter.</p>}
        <p className="mt-12 text-xs text-muted max-w-2xl">
          Photos of visits and meetings record those occasions only and do not imply endorsement. People appear with their consent; children only with consent from their home&rsquo;s management.
        </p>
      </section>

      {sponsors.data && sponsors.data.length > 0 && (
        <section className="grain bg-ink-2 py-20">
          <div className="container-x relative z-[2]">
            <SectionHeading eyebrow="Supporters" title="With thanks" />
            <ul className="mt-10 grid sm:grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-4">
              {sponsors.data.map((s, k) => (
                <li key={k} className="border-t border-gold/20 pt-3">
                  <span className="text-ivory">{s.name}</span>
                  <span className="text-muted text-sm"> · {s.country}</span>
                  {s.seats > 0 && <span className="block text-xs text-gold mt-0.5">{s.seats} seat{s.seats === 1 ? '' : 's'}</span>}
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </>
  )
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={`whitespace-nowrap rounded-full px-4 py-2 text-sm border transition ${active ? 'bg-gold text-ink border-gold' : 'border-white/15 text-ivory-2 hover:border-gold/60'}`}
    >
      {children}
    </button>
  )
}
