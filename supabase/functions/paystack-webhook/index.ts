// Paystack webhook. Verifies the HMAC SHA-512 signature over the raw body, then confirms the payment.
// Idempotent: confirm_payment() does nothing for a reference that is already marked paid.
// Deploy with verify_jwt = false (Paystack doesn't send a Supabase JWT); the signature is the authentication.
import { admin, paystackKey } from '../_shared/common.ts'

const enc = new TextEncoder()

async function hmacSha512Hex(secret: string, body: string) {
  const key = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-512' }, false, ['sign'])
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(body))
  return Array.from(new Uint8Array(sig), (b) => b.toString(16).padStart(2, '0')).join('')
}

function timingSafeEqual(a: string, b: string) {
  if (a.length !== b.length) return false
  let r = 0
  for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return r === 0
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 })

  const raw = await req.text()
  const signature = (req.headers.get('x-paystack-signature') ?? '').toLowerCase()
  const expected = await hmacSha512Hex(paystackKey(), raw)
  if (!signature || !timingSafeEqual(signature, expected)) {
    return new Response('Invalid signature', { status: 401 })
  }

  let event: { event?: string; data?: Record<string, unknown> }
  try {
    event = JSON.parse(raw)
  } catch {
    return new Response('Bad payload', { status: 400 })
  }

  const data = event.data ?? {}
  const reference = typeof data.reference === 'string' ? data.reference : ''
  if (!reference) return new Response('ok', { status: 200 })

  // Keep only what's useful for audit; drop card/authorization details.
  const slim = {
    event: event.event,
    id: data.id,
    status: data.status,
    reference,
    amount: data.amount,
    currency: data.currency,
    channel: data.channel,
    paid_at: data.paid_at ?? data.paidAt,
    gateway_response: data.gateway_response,
    customer_email: (data.customer as Record<string, unknown> | undefined)?.email,
  }

  const db = admin()
  if (event.event === 'charge.success' && data.status === 'success') {
    const { data: result, error } = await db.rpc('confirm_payment', {
      p_reference: reference,
      p_amount_kobo: Number(data.amount),
      p_currency: String(data.currency ?? 'NGN'),
      p_event: slim,
    })
    if (error) {
      console.error('confirm_payment failed', error)
      return new Response('Retry', { status: 500 }) // Paystack will retry
    }
    console.log('webhook', reference, result)
  } else if (event.event === 'charge.failed') {
    await db.rpc('fail_payment', { p_reference: reference, p_status: 'failed', p_event: slim })
  }

  return new Response('ok', { status: 200 })
})
