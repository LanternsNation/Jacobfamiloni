import { Link } from 'react-router-dom'
import { InitiativeCard, PageHeader, Notice } from '../components/ui'
import { useInitiatives } from '../lib/data'

export default function Initiatives() {
  const { data, loading, error } = useInitiatives()
  return (
    <>
      <PageHeader
        eyebrow="Initiatives"
        title="The work at home."
        intro="Four initiatives, each built to last and to be measured: skills for the young, dignity for widows, care for children, and character for the next generation of leaders."
      />
      <section className="container-x py-16 md:py-24">
        {loading && <p className="text-muted">Loading…</p>}
        {error && <Notice tone="error">We couldn&rsquo;t load the initiatives right now. Please try again shortly.</Notice>}
        <div className="grid md:grid-cols-2 gap-x-12">
          {(data ?? []).map((i, idx) => (
            <InitiativeCard key={i.id} i={i} index={idx} />
          ))}
        </div>
        <div className="mt-16 flex flex-wrap gap-3">
          <Link to="/support" className="btn-gold">Support the work</Link>
          <Link to="/get-involved" className="btn-ghost">Partner or volunteer</Link>
        </div>
      </section>
    </>
  )
}
