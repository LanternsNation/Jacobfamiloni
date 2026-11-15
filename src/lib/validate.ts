/** Normalise a Nigerian or international phone number to +<digits>. Returns null if invalid. */
export function normalisePhone(raw: string): string | null {
  const s = raw.replace(/[\s\-()]/g, '')
  if (/^0[789][01]\d{8}$/.test(s)) return '+234' + s.slice(1)
  if (/^234[789][01]\d{8}$/.test(s)) return '+' + s
  if (/^\+\d{10,15}$/.test(s)) return s
  return null
}

export const isEmail = (s: string) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(s.trim())
