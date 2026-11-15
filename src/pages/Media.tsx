import { PlaceholderMedia } from '../components/Placeholder'
import { PageHeader, SectionHeading, YouTubeLite } from '../components/ui'
import { useSettings } from '../lib/data'

const LABELS: Record<string, string> = { youtube: 'YouTube', facebook: 'Facebook', instagram: 'Instagram', x: 'X', tiktok: 'TikTok' }

export default function Media() {
  const { videos, social } = useSettings()
  const links = (['youtube', 'facebook', 'instagram', 'x', 'tiktok'] as const).map((k) => ({ key: k, label: LABELS[k], url: social[k] }))

  return (
    <>
      <PageHeader eyebrow="Media" title="Watch and follow." intro="Videos from his visits and work, and where to follow along." />
      <section className="container-x py-16 md:py-20">
        <div className="grid md:grid-cols-2 gap-8">
          {videos.youtube_ids.length
            ? videos.youtube_ids.map((id) => <YouTubeLite key={id} id={id} title="Dr. Jacob Familoni" />)
            : [0, 1, 2, 3].map((i) => <PlaceholderMedia key={i} label="YouTube video — add IDs in admin › Site settings" className="aspect-video w-full" />)}
        </div>
      </section>
      <section className="container-x pb-12">
        <SectionHeading eyebrow="Follow" title="On social" />
        <div className="mt-10 grid grid-cols-2 md:grid-cols-5 gap-4">
          {links.map((l) =>
            l.url ? (
              <a key={l.key} href={l.url} target="_blank" rel="noopener noreferrer" className="border border-gold/30 hover:border-gold rounded-sm p-5 font-display text-2xl transition">
                {l.label} <span className="text-gold">↗</span>
              </a>
            ) : (
              <div key={l.key} className="placeholder-box rounded-sm p-5 text-sm">
                {l.label}
                <span className="block text-xs mt-1 opacity-80">[PLACEHOLDER link]</span>
              </div>
            ),
          )}
        </div>
      </section>
    </>
  )
}
