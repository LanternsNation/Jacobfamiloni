// Saves a Get Involved / Contact request.
import { admin, corsHeaders, fail, isEmail, json, normalisePhone, readJson, str } from '../_shared/common.ts'

const KINDS = ['volunteer', 'partner', 'recommend_widow', 'recommend_home', 'contact']

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders(req) })
  if (req.method !== 'POST') return fail(req, 'Method not allowed', 405)

  const b = await readJson(req)
  if (!b) return fail(req, 'Invalid request.')
  if (str(b.website)) return json(req, { ok: true }) // honeypot: pretend success

  const kind = str(b.kind, 30)
  const name = str(b.name, 120)
  const phone = b.phone ? normalisePhone(b.phone) : null
  const email = b.email ? str(b.email, 254).toLowerCase() : null
  const state = str(b.state, 60) || null
  const details = str(b.details, 3000)

  if (!KINDS.includes(kind)) return fail(req, 'Please choose how you would like to help.')
  if (!name) return fail(req, 'Please enter your name.')
  if (b.phone && !phone) return fail(req, 'Please enter a valid phone number.')
  if (email && !isEmail(email)) return fail(req, 'Please enter a valid email address.')
  if (!phone && !email) return fail(req, 'Please give a phone number or an email.')
  if (details.length < 5) return fail(req, 'Please add a few details.')
  if (b.consent !== true) return fail(req, 'Consent is required.')

  const { error } = await admin()
    .from('involvement_requests')
    .insert({ kind, name, phone, email, state, details, consent_at: new Date().toISOString() })
  if (error) {
    console.error('submit-involvement failed', error)
    return fail(req, 'We could not send your message. Please try again.', 500)
  }
  return json(req, { ok: true })
})
