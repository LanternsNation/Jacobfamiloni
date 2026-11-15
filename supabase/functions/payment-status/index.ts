// Returns the status of a payment after the visitor comes back from Paystack.
// If the webhook hasn't arrived yet, it asks Paystack directly (server-side) and confirms through the same
// idempotent confirm_payment() function. Never trusts anything the browser says about the payment.
import { admin, corsHeaders, fail, json, paystack, readJson, str } from '../_shared/common.ts'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders(req) })
  if (req.method !== 'POST') return fail(req, 'Method not allowed', 405)

  const b = await readJson(req)
  const reference = str(b?.reference, 64)
  if (!/^JF[CS]-[a-f0-9]{24}$/.test(reference)) return json(req, { status: 'unknown' })

  const db = admin()
  const load = () =>
    db.from('payments').select('id,kind,status,amount_kobo,applicant_id,created_at').eq('reference', reference).maybeSingle()

  let { data: pay } = await load()
  if (!pay) return json(req, { status: 'unknown' })

  if (pay.status === 'pending') {
    const v = await paystack<{ status: string; amount: number; currency: string; gateway_response?: string; channel?: string }>(
      `/transaction/verify/${encodeURIComponent(reference)}`,
    )
    if (v.status && v.data) {
      const slim = { event: 'verify', status: v.data.status, amount: v.data.amount, currency: v.data.currency, channel: v.data.channel, gateway_response: v.data.gateway_response }
      if (v.data.status === 'success') {
        await db.rpc('confirm_payment', { p_reference: reference, p_amount_kobo: v.data.amount, p_currency: v.data.currency, p_event: slim })
      } else if (v.data.status === 'failed') {
        await db.rpc('fail_payment', { p_reference: reference, p_status: 'failed', p_event: slim })
      }
      ;({ data: pay } = await load())
      if (!pay) return json(req, { status: 'unknown' })
    }
  }

  const out: Record<string, unknown> = { status: pay.status, kind: pay.kind, amount_naira: Math.round(pay.amount_kobo / 100) }

  if (pay.status === 'success') {
    if (pay.kind === 'commitment' && pay.applicant_id) {
      const { data: a } = await db.from('applicants').select('referral_code').eq('id', pay.applicant_id).maybeSingle()
      out.referral_code = a?.referral_code
    } else if (pay.kind === 'sponsorship') {
      const { data: s } = await db.from('sponsorships').select('seats, initiatives(title)').eq('payment_id', pay.id).maybeSingle()
      out.seats = s?.seats ?? 0
      out.initiative_title = (s?.initiatives as { title?: string } | null)?.title ?? null
    }
  }
  return json(req, out)
})
