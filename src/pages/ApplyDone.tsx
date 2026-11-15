import { Link, useSearchParams } from 'react-router-dom'
import { Reveal } from '../components/Reveal'
import { ShareLink } from '../components/ShareLink'
import { Notice } from '../components/ui'
import { formatDate, useOpenCohort, usePaymentStatus, useSettings } from '../lib/data'
import { recallApplication } from '../lib/api'
import { referralLink } from '../lib/referral'
import { useInstall } from '../pwa/PwaUi'

export default function ApplyDone() {
  const [params] = useSearchParams()
  const reference = params.get('reference') || params.get('trxref')
  const pay = usePaymentStatus(reference)
  const saved = recallApplication()
  const cohort = useOpenCohort()
  const { community } = useSettings()
  const install = useInstall()

  const code = (pay.data?.referral_code as string | undefined) ?? saved?.referral_code
  const paid = pay.status === 'success'
  const waiting = pay.status === 'checking' || pay.status === 'pending'
  const waitlisted = !reference && saved?.status === 'waitlisted'
  const failed = pay.status === 'failed' || pay.status === 'abandoned'
  const c = cohort.data

  return (
    <section className="grain min-h-[100svh] pt-32 pb-20">
      <div className="container-x max-w-3xl relative z-[2]">
        {waiting && (
          <Reveal>
            <p className="eyebrow">Confirming your payment</p>
            <h1 className="mt-5 text-5xl md:text-7xl">One moment…</h1>
            <p className="mt-5 text-ivory-2">We&rsquo;re confirming your payment with Paystack. This usually takes a few seconds.</p>
          </Reveal>
        )}

        {pay.status === 'timeout' && (
          <Notice>
            Your payment is still being confirmed. If you were charged, your seat will be secured automatically; you&rsquo;ll receive an email. You can safely close this page.
          </Notice>
        )}

        {failed && (
          <Reveal>
            <p className="eyebrow">Payment not completed</p>
            <h1 className="mt-5 text-5xl md:text-7xl">Your seat isn&rsquo;t secured yet.</h1>
            <p className="mt-5 text-ivory-2">The payment didn&rsquo;t go through. Your application is saved, so you can apply again with the same details, or request a sponsored seat.</p>
            <Link to="/apply" className="btn-gold mt-8">Try again</Link>
          </Reveal>
        )}

        {(paid || waitlisted) && (
          <Reveal>
            <p className="eyebrow">{paid ? 'Seat secured' : 'Application received'}</p>
            <h1 className="mt-5 text-5xl md:text-7xl text-balance">
              {saved?.first_name ? `Welcome, ${saved.first_name}.` : 'Welcome.'}
            </h1>
            <p className="mt-6 text-lg text-ivory-2 leading-relaxed">
              {paid
                ? `Your ₦2,000 commitment fee is confirmed and your seat in ${c?.name ?? 'the cohort'} is secured.`
                : 'You’re on the sponsored-seat waitlist. Seats are given out in the order people applied, as sponsors fund them. We’ll contact you by phone and email.'}
            </p>

            <div className="mt-10 grid sm:grid-cols-2 gap-6">
              <div className="border-t border-gold/30 pt-5">
                <p className="eyebrow">Cohort starts</p>
                <p className="mt-2 font-display text-3xl">{c?.starts_on ? formatDate(c.starts_on) : 'Date to be announced'}</p>
              </div>
              {paid && (
                <div className="border-t border-gold/30 pt-5">
                  <p className="eyebrow">Student community</p>
                  {community.whatsapp_link ? (
                    <a href={community.whatsapp_link} target="_blank" rel="noopener noreferrer" className="btn-gold mt-3">Join the WhatsApp group</a>
                  ) : (
                    <p className="mt-2 text-ivory-2">The WhatsApp link will be sent to you before the cohort starts.</p>
                  )}
                </div>
              )}
            </div>
          </Reveal>
        )}

        {code && !failed && !waiting && (
          <Reveal className="mt-16">
            <p className="eyebrow">Bring a friend</p>
            <h2 className="mt-4 text-3xl md:text-4xl">Your personal invite link</h2>
            <p className="mt-3 text-ivory-2">Share it with friends who should be in the room. We&rsquo;ll know they came through you.</p>
            <div className="mt-6">
              <ShareLink url={referralLink(code)} message="I just applied to the Familoni AI School. Apply for a seat here:" />
            </div>
          </Reveal>
        )}

        {!install.installed && !waiting && !failed && (install.canPrompt || install.iosHint) && (
          <Reveal className="mt-16 border border-gold/30 rounded-xl p-6 flex flex-col sm:flex-row sm:items-center gap-5">
            <img src="/icons/icon-192.png" alt="" width={56} height={56} className="rounded-xl" />
            <div className="flex-1">
              <p className="font-display text-2xl">Install the app</p>
              <p className="text-sm text-ivory-2 mt-1">
                {install.canPrompt ? 'Get cohort updates in one tap, even on weak data.' : 'On iPhone: tap Share, then “Add to Home Screen”.'}
              </p>
            </div>
            {install.canPrompt && <button className="btn-gold" onClick={() => install.install()}>Install</button>}
          </Reveal>
        )}

        {!reference && saved && !waitlisted && (
          <Reveal>
            <p className="eyebrow">Payment not completed</p>
            <h1 className="mt-5 text-5xl md:text-7xl">Your seat isn&rsquo;t secured yet.</h1>
            <p className="mt-5 text-ivory-2">Your application is saved. To secure your seat, apply again with the same email and complete the ₦2,000 payment, or choose a sponsored seat.</p>
            <Link to="/apply" className="btn-gold mt-8">Back to application</Link>
          </Reveal>
        )}

        {!reference && !saved && (
          <Reveal>
            <h1 className="text-5xl">Nothing to show yet.</h1>
            <Link to="/apply" className="btn-gold mt-8">Apply to the AI School</Link>
          </Reveal>
        )}
      </div>
    </section>
  )
}
