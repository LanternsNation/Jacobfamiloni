// Starts a Paystack transaction. Amounts are always computed here, never taken from the browser.
// kind = 'commitment' (₦2,000 student fee) or 'sponsorship' (seats or a gift to an initiative).
import {
  admin, corsHeaders, fail, isEmail, json, MAX_GIFT_KOBO, MIN_GIFT_KOBO, newReference, paystack, readJson,
  SEAT_BUNDLES, SEAT_PRICE_KOBO, siteBase, str,
} from '../_shared/common.ts'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders(req) })
  if (req.method !== 'POST') return fail(req, 'Method not allowed', 405)

  const b = await readJson(req)
  if (!b) return fail(req, 'Invalid request.')
  if (str(b.website)) return fail(req, 'Invalid request.')

  const db = admin()
  const base = siteBase(req)
  if (!base) return fail(req, 'Site URL is not configured.', 500)

  let reference: string
  let amount_kobo: number
  let email: string
  let callback_url: string
  let metadata: Record<string, unknown>

  if (b.kind === 'commitment') {
    const applicant_id = str(b.applicant_id, 40)
    email = str(b.email, 254).toLowerCase()
    const { data: a } = await db
      .from('applicants')
      .select('id,email,status,cohort_id,full_name')
      .eq('id', applicant_id)
      .maybeSingle()
    if (!a || a.email !== email) return fail(req, 'Application not found.', 404)
    if (!['pending', 'waitlisted'].includes(a.status)) return fail(req, 'This seat is already secured.', 409)

    // Capacity: count secured seats in this cohort
    const [{ data: cohort }, { count }] = await Promise.all([
      db.from('cohorts').select('capacity,is_open').eq('id', a.cohort_id).single(),
      db.from('applicants').select('id', { count: 'exact', head: true }).eq('cohort_id', a.cohort_id).not('seat_source', 'is', null),
    ])
    if (!cohort?.is_open) return fail(req, 'Applications for this cohort are closed.')
    if ((count ?? 0) >= cohort.capacity) {
      return fail(req, 'This cohort is full. Please request a sponsored seat to join the waitlist for the next one.', 409)
    }

    reference = newReference('JFC')
    amount_kobo = SEAT_PRICE_KOBO
    callback_url = `${base}/apply/done`
    metadata = {
      kind: 'commitment',
      purpose: 'AI School commitment fee (Nigerian initiative)',
      custom_fields: [{ display_name: 'Purpose', variable_name: 'purpose', value: 'Familoni AI School seat' }],
    }
    const { error } = await db.from('payments').insert({ reference, kind: 'commitment', amount_kobo, payer_email: email, applicant_id: a.id })
    if (error) return fail(req, 'Could not start payment. Please try again.', 500)
  } else if (b.kind === 'sponsorship') {
    email = str(b.email, 254).toLowerCase()
    const name = str(b.name, 120)
    const country = str(b.country_of_residence, 60)
    if (!name) return fail(req, 'Please enter your name.')
    if (!isEmail(email)) return fail(req, 'Please enter a valid email address.')
    if (!country) return fail(req, 'Please choose your country of residence.')

    const slug = b.initiative_slug ? str(b.initiative_slug, 60) : null
    let initiative: { id: string; slug: string; title: string } | null = null
    if (slug) {
      const { data } = await db.from('initiatives').select('id,slug,title').eq('slug', slug).maybeSingle()
      if (!data) return fail(req, 'Please choose an initiative.')
      initiative = data
    }

    let seats = 0
    const bundle = typeof b.seats === 'number' ? b.seats : null
    const naira = typeof b.amount_naira === 'number' && Number.isFinite(b.amount_naira) ? Math.floor(b.amount_naira) : 0

    if (initiative?.slug === 'ai-school') {
      if (bundle !== null) {
        if (!SEAT_BUNDLES.includes(bundle)) return fail(req, 'Please choose a seat bundle.')
        seats = bundle
        amount_kobo = seats * SEAT_PRICE_KOBO
      } else {
        amount_kobo = naira * 100
        seats = Math.floor(amount_kobo / SEAT_PRICE_KOBO)
        if (seats < 1) return fail(req, 'A seat is ₦2,000.')
      }
    } else {
      amount_kobo = naira * 100
    }
    if (amount_kobo < MIN_GIFT_KOBO) return fail(req, 'The minimum gift is ₦1,000.')
    if (amount_kobo > MAX_GIFT_KOBO) return fail(req, 'For gifts above ₦50 million, please contact us directly.')

    reference = newReference('JFS')
    callback_url = `${base}/thank-you`
    metadata = {
      kind: 'sponsorship',
      initiative: initiative?.slug ?? 'where-most-needed',
      seats,
      custom_fields: [
        { display_name: 'Supporting', variable_name: 'initiative', value: initiative?.title ?? 'Where most needed' },
        ...(seats ? [{ display_name: 'Seats', variable_name: 'seats', value: String(seats) }] : []),
      ],
    }

    const { data: pay, error: pErr } = await db
      .from('payments')
      .insert({ reference, kind: 'sponsorship', amount_kobo, payer_email: email })
      .select('id')
      .single()
    if (pErr || !pay) return fail(req, 'Could not start payment. Please try again.', 500)
    const { error: sErr } = await db.from('sponsorships').insert({
      name, email, country_of_residence: country, initiative_id: initiative?.id ?? null, seats, amount_kobo,
      payment_id: pay.id, show_name_publicly: b.show_name_publicly === true,
    })
    if (sErr) return fail(req, 'Could not start payment. Please try again.', 500)
  } else {
    return fail(req, 'Invalid payment type.')
  }

  const ps = await paystack<{ authorization_url: string; reference: string }>('/transaction/initialize', {
    method: 'POST',
    body: JSON.stringify({ email, amount: amount_kobo, currency: 'NGN', reference, callback_url, metadata }),
  })
  if (!ps.status || !ps.data?.authorization_url) {
    console.error('paystack init failed', ps.message)
    await db.from('payments').update({ status: 'failed' }).eq('reference', reference)
    return fail(req, 'The payment service is unavailable right now. Please try again shortly.', 502)
  }
  return json(req, { authorization_url: ps.data.authorization_url, reference })
})
