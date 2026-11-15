import { Link, useSearchParams } from 'react-router-dom'
import { Reveal } from '../components/Reveal'
import { ShareCard } from '../components/ShareCard'
import { Notice } from '../components/ui'
import { naira, usePaymentStatus } from '../lib/data'

export default function ThankYou() {
  const [params] = useSearchParams()
  const reference = params.get('reference') || params.get('trxref')
  const { status, data } = usePaymentStatus(reference)
  const seats = Number(data?.seats ?? 0)
  const amount = Number(data?.amount_naira ?? 0)
  const initiative = (data?.initiative_title as string | null | undefined) ?? null

  const headline =
    seats > 0
      ? `I just sponsored ${seats} young Nigerian${seats === 1 ? '' : 's'} to learn AI.`
      : `I just supported ${initiative ?? 'Dr. Familoni’s work at home'}.`
  const shareText = seats > 0 ? `${headline} Sponsor a seat for ₦2,000:` : `${headline} Join me:`

  return (
    <section className="grain min-h-[100svh] pt-32 pb-20">
      <div className="container-x max-w-4xl relative z-[2]">
        {(status === 'checking' || status === 'pending') && (
          <Reveal>
            <p className="eyebrow">Confirming your gift</p>
            <h1 className="mt-5 text-5xl md:text-7xl">One moment…</h1>
          </Reveal>
        )}
        {status === 'timeout' && <Notice>Your gift is still being confirmed. If you were charged, it will be recorded automatically and you&rsquo;ll receive a receipt by email.</Notice>}
        {(status === 'failed' || status === 'abandoned') && (
          <Reveal>
            <p className="eyebrow">Payment not completed</p>
            <h1 className="mt-5 text-5xl md:text-7xl">The payment didn&rsquo;t go through.</h1>
            <Link to="/support" className="btn-gold mt-8">Try again</Link>
          </Reveal>
        )}
        {status === 'none' && (
          <Reveal>
            <h1 className="text-5xl">Thank you.</h1>
            <Link to="/support" className="btn-gold mt-8">Support the work</Link>
          </Reveal>
        )}
        {status === 'success' && (
          <>
            <Reveal>
              <p className="eyebrow">Thank you</p>
              <h1 className="mt-5 text-5xl md:text-8xl text-balance">
                {seats > 0 ? (
                  <>
                    {seats} seat{seats === 1 ? '' : 's'}, <em className="italic font-light text-gold">funded.</em>
                  </>
                ) : (
                  <>Your gift is <em className="italic font-light text-gold">at work.</em></>
                )}
              </h1>
              <p className="mt-6 text-lg text-ivory-2 max-w-2xl">
                {naira(amount)} received{initiative ? ` for ${initiative}` : ''}. A receipt is on its way to your email.
                {seats > 0 && ' Each seat goes to the next young Nigerian on the sponsored waitlist.'}
              </p>
            </Reveal>
            <Reveal className="mt-16">
              <p className="eyebrow mb-6">Tell people why you gave</p>
              <ShareCard headline={headline} sub="A legacy of excellence, starting at home." shareText={shareText} />
            </Reveal>
          </>
        )}
      </div>
    </section>
  )
}
