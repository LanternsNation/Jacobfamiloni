/**
 * Site-wide copy and placeholders.
 *
 * Everything marked PLACEHOLDER must be replaced with real, approved content
 * before launch. Do not invent facts about Dr. Familoni — leave the placeholder
 * in place until the team supplies the real text.
 */

export const PLACEHOLDER = '[PLACEHOLDER]'

export const site = {
  name: 'Dr. Jacob Familoni',
  legacyStatement: 'A legacy of excellence, starting at home.',
  // PLACEHOLDER: one-paragraph story in brief, supplied by the team
  storyInBrief:
    '[PLACEHOLDER — Story in brief. Two or three sentences on his journey from Nigeria to the United States, the work he has built, and why he is now investing at home. To be supplied and approved by the team.]',
  schoolName: 'Familoni AI School', // placeholder name until final
  whatsappNumber: '', // PLACEHOLDER: international format, digits only, e.g. 2348000000000
  contactEmail: '', // PLACEHOLDER
}

// Achievements in numbers — PLACEHOLDER values. Replace with verified figures.
export const achievements: { value: string; label: string }[] = [
  { value: '[00]', label: '[PLACEHOLDER] Years of professional work' },
  { value: '[00]', label: '[PLACEHOLDER] Businesses built or led' },
  { value: '[00]', label: '[PLACEHOLDER] Communities visited in Nigeria' },
  { value: '5', label: 'Initiatives at home' },
]

// His Story timeline — PLACEHOLDER milestones only.
export const timeline: { year: string; title: string; body: string }[] = [
  { year: '[Year]', title: '[PLACEHOLDER] Early life in Nigeria', body: '[PLACEHOLDER — where he grew up, family, schooling.]' },
  { year: '[Year]', title: '[PLACEHOLDER] Journey to the United States', body: '[PLACEHOLDER — when and why he moved, early years.]' },
  { year: '[Year]', title: '[PLACEHOLDER] Career and business', body: '[PLACEHOLDER — career record and businesses.]' },
  { year: '[Year]', title: '[PLACEHOLDER] Recognition', body: '[PLACEHOLDER — verified honours and achievements only.]' },
  { year: '[Year]', title: '[PLACEHOLDER] Investing at home', body: '[PLACEHOLDER — the decision to build initiatives in Nigeria.]' },
]

export const values: { title: string; body: string }[] = [
  { title: '[PLACEHOLDER] Value one', body: '[PLACEHOLDER — a value he lives by, in his words.]' },
  { title: '[PLACEHOLDER] Value two', body: '[PLACEHOLDER]' },
  { title: '[PLACEHOLDER] Value three', body: '[PLACEHOLDER]' },
]

// Social links — PLACEHOLDER. Fill in once confirmed (open item in PRD).
// These are defaults; admins can override them in Site settings.
export const socialDefaults = {
  facebook: '',
  youtube: '',
  instagram: '',
  x: '',
  tiktok: '',
}

// Hero media. Replace with a muted loop (< 3 MB, H.264 MP4) and a compressed poster.
export const heroMedia = {
  videoSrc: '', // PLACEHOLDER: e.g. /media/hero-loop.mp4
  posterSrc: '', // PLACEHOLDER: e.g. /media/hero-poster.webp
}

export const NIGERIAN_STATES = [
  'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 'Borno', 'Cross River', 'Delta',
  'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'FCT (Abuja)', 'Gombe', 'Imo', 'Jigawa', 'Kaduna', 'Kano', 'Katsina',
  'Kebbi', 'Kogi', 'Kwara', 'Lagos', 'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau', 'Rivers',
  'Sokoto', 'Taraba', 'Yobe', 'Zamfara',
]

// 18+ only (responsibility age in Nigeria).
export const AGE_RANGES = ['18–21', '22–25', '26–30', '31–35']
