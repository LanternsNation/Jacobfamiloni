import { PageHeader } from '../components/ui'
import { useSettings } from '../lib/data'
import { site } from '../lib/content'

// DRAFT: written to the Nigeria Data Protection Act 2023. Must be reviewed by a Nigerian lawyer before launch.
export default function Privacy() {
  const { entity } = useSettings()
  const updated = '15 November 2026'
  return (
    <>
      <PageHeader eyebrow="Privacy policy" title="How we look after your information." intro={`Last updated ${updated}.`} />
      <article className="container-x py-14 max-w-3xl space-y-10 text-ivory-2 leading-relaxed [&_h2]:font-display [&_h2]:text-3xl [&_h2]:text-ivory [&_h2]:mb-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1.5">
        <p className="placeholder-box rounded p-3 text-xs">[DRAFT — to be reviewed by a lawyer before launch. Controller name, address and contact are placeholders.]</p>

        <section>
          <h2>Who we are</h2>
          <p>
            This platform presents the story and Nigerian initiatives of Dr. Jacob Familoni. The data controller is {entity.name}
            {entity.rc_number ? `, RC ${entity.rc_number}` : ''}, [PLACEHOLDER — registered address]. Contact: {site.contactEmail || '[PLACEHOLDER — privacy contact email]'}.
          </p>
        </section>

        <section>
          <h2>What we collect, and why</h2>
          <ul>
            <li><strong className="text-ivory">AI School applications:</strong> name, phone, email, state, LGA, age range, chosen track, your reason for joining, and who referred you. Used to assess and place applicants, run the cohort and contact you about it.</li>
            <li><strong className="text-ivory">Payments and gifts:</strong> name, email, country of residence, amount, chosen initiative and payment reference. Card details are handled by Paystack and never reach us.</li>
            <li><strong className="text-ivory">Get Involved and contact:</strong> name, phone and/or email, state and your message. Used only to respond to you.</li>
            <li><strong className="text-ivory">Basic technical data:</strong> pages are cached on your device so the app works offline. We do not use advertising trackers.</li>
          </ul>
        </section>

        <section>
          <h2>Our lawful basis</h2>
          <p>We process your data with your consent, which you give on each form, and where needed to deliver what you asked for (your seat, your receipt, a reply). You may withdraw consent at any time; this does not affect processing already carried out.</p>
        </section>

        <section>
          <h2>Who we share it with</h2>
          <ul>
            <li>Paystack, to process payments.</li>
            <li>Supabase (database hosting, servers in the United Kingdom) and Vercel (website hosting).</li>
            <li>Partner organisations running a programme you join, only as needed to deliver it (for example, Arrowhead Education Leadership Foundation for the Character Development and Leadership Programme).</li>
          </ul>
          <p className="mt-3">Some of these providers store data outside Nigeria. We rely on their contractual safeguards for these transfers, as the Act requires. We never sell your data.</p>
        </section>

        <section>
          <h2>How long we keep it</h2>
          <p>Application data is kept for the life of the cohort and up to [PLACEHOLDER — e.g. 24] months after, then deleted or anonymised. Payment records are kept as long as the law requires for financial records.</p>
        </section>

        <section>
          <h2>Your rights</h2>
          <p>Under the Nigeria Data Protection Act 2023 you can ask to access, correct or delete your data, object to or restrict its use, receive a copy in a portable format, and withdraw consent. Write to us at the contact above. You may also complain to the Nigeria Data Protection Commission.</p>
        </section>

        <section>
          <h2>Security</h2>
          <p>Access to personal data is limited to a small, named admin team. Data is encrypted in transit, and payments are confirmed directly with Paystack on our servers.</p>
        </section>

        <section>
          <h2>Who can apply</h2>
          <p>The AI School is for people aged 18 and over. We do not knowingly collect data from anyone under 18.</p>
        </section>
      </article>
    </>
  )
}
