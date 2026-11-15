import { supabase } from './supabase'

/** Calls an Edge Function and returns its JSON, throwing a readable error message on failure. */
export async function callFn<T>(name: string, body: Record<string, unknown>): Promise<T> {
  const { data, error } = await supabase.functions.invoke(name, { body })
  if (error) {
    let message = 'Something went wrong. Please try again.'
    try {
      const ctx = (error as { context?: Response }).context
      if (ctx && typeof ctx.json === 'function') {
        const j = await ctx.json()
        if (j?.error) message = j.error
      }
    } catch {
      /* ignore */
    }
    if (!navigator.onLine) message = 'You are offline. Please reconnect and try again.'
    throw new Error(message)
  }
  return data as T
}

export interface ApplicationResult {
  applicant_id: string
  referral_code: string
  status: string
}

export interface InitResult {
  authorization_url: string
  reference: string
}

export interface PaymentStatusResult {
  status: 'pending' | 'success' | 'failed' | 'abandoned' | 'unknown'
  kind?: 'commitment' | 'sponsorship'
  referral_code?: string
  seats?: number
  initiative_title?: string | null
  amount_naira?: number
}

const PENDING_KEY = 'jf_last_application'

export function rememberApplication(r: { referral_code: string; status: string; first_name: string }) {
  try {
    sessionStorage.setItem(PENDING_KEY, JSON.stringify(r))
  } catch {
    /* ignore */
  }
}

export function recallApplication(): { referral_code: string; status: string; first_name: string } | null {
  try {
    const raw = sessionStorage.getItem(PENDING_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}
