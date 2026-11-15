// Creates an AI School application. Writes with the service role (the browser can't insert directly).
import { admin, corsHeaders, fail, isEmail, json, normalisePhone, readJson, str } from '../_shared/common.ts'

const AGE_RANGES = ['18–21', '22–25', '26–30', '31–35']

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders(req) })
  if (req.method !== 'POST') return fail(req, 'Method not allowed', 405)

  const b = await readJson(req)
  if (!b) return fail(req, 'Invalid request.')
  if (str(b.website)) return fail(req, 'Invalid request.') // honeypot

  const full_name = str(b.full_name, 120)
  const phone = normalisePhone(b.phone)
  const email = str(b.email, 254).toLowerCase()
  const state = str(b.state, 60)
  const lga = str(b.lga, 80)
  const age_range = str(b.age_range, 10)
  const track_id = str(b.track_id, 40)
  const cohort_id = str(b.cohort_id, 40)
  const motivation = str(b.motivation, 1000)
  const wantsSponsored = b.request_sponsored_seat === true
  const ref = str(b.referred_by, 12).toUpperCase()

  if (full_name.length < 2) return fail(req, 'Please enter your full name.')
  if (!phone) return fail(req, 'Please enter a valid phone number.')
  if (!isEmail(email)) return fail(req, 'Please enter a valid email address.')
  if (!state || !lga) return fail(req, 'Please enter your state and LGA.')
  if (!AGE_RANGES.includes(age_range)) return fail(req, 'The AI School is open to people aged 18 to 35.')
  if (b.consent !== true) return fail(req, 'Consent is required.')

  const db = admin()

  const [{ data: cohort }, { data: track }] = await Promise.all([
    db.from('cohorts').select('id,is_open').eq('id', cohort_id).maybeSingle(),
    db.from('tracks').select('id,is_active').eq('id', track_id).maybeSingle(),
  ])
  if (!cohort?.is_open) return fail(req, 'Applications for this cohort are closed.')
  if (!track?.is_active) return fail(req, 'Please choose a track.')

  let referred_by: string | null = null
  if (/^[A-Z0-9]{4,12}$/.test(ref)) {
    const { data: r } = await db.from('applicants').select('referral_code').eq('referral_code', ref).maybeSingle()
    referred_by = r?.referral_code ?? null
  }

  const status = wantsSponsored ? 'waitlisted' : 'pending'
  const { data, error } = await db
    .from('applicants')
    .insert({
      full_name, phone, email, state, lga, age_range, track_id, cohort_id, motivation,
      referred_by, status, consent_at: new Date().toISOString(),
    })
    .select('id,referral_code,status')
    .single()

  if (!error && data) return json(req, { applicant_id: data.id, referral_code: data.referral_code, status: data.status })

  // Same email already applied to this cohort: let them continue (e.g. retry payment), without changing their details.
  if (error?.code === '23505') {
    const { data: existing } = await db
      .from('applicants')
      .select('id,referral_code,status')
      .eq('email', email)
      .eq('cohort_id', cohort_id)
      .maybeSingle()
    if (!existing) return fail(req, 'Something went wrong. Please try again.', 500)
    if (!['pending', 'waitlisted'].includes(existing.status)) {
      return fail(req, 'This email already has a seat in this cohort. Check your email or WhatsApp for details.', 409)
    }
    if (wantsSponsored && existing.status === 'pending') {
      await db.from('applicants').update({ status: 'waitlisted' }).eq('id', existing.id)
      existing.status = 'waitlisted'
    }
    return json(req, { applicant_id: existing.id, referral_code: existing.referral_code, status: existing.status })
  }

  console.error('submit-application insert failed', error)
  return fail(req, 'We could not save your application. Please try again.', 500)
})
