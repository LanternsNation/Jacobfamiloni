const KEY = 'jf_ref'
const CODE_RE = /^[A-Z0-9]{4,12}$/

/** Store ?ref=CODE from any landing URL so it survives navigation until the application is submitted. */
export function captureReferral() {
  try {
    const params = new URLSearchParams(window.location.search)
    const raw = params.get('ref')
    if (!raw) return
    const code = raw.trim().toUpperCase()
    if (CODE_RE.test(code)) localStorage.setItem(KEY, code)
  } catch {
    /* storage unavailable — ignore */
  }
}

export function getReferral(): string | null {
  try {
    return localStorage.getItem(KEY)
  } catch {
    return null
  }
}

export function referralLink(code: string) {
  return `${window.location.origin}/?ref=${encodeURIComponent(code)}`
}
