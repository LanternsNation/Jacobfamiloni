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
  { value: '4', label: 'Initiatives at home' },
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

// Hero media. Add a muted loop (< 3 MB, H.264 MP4) when footage is ready; the photo is the poster.
export const heroMedia = {
  videoSrc: '', // PLACEHOLDER: e.g. /media/hero-loop.mp4
  posterSrc: '/media/familoni-hero-1080.webp',
  posterSrcSet: '/media/familoni-hero-640.webp 640w, /media/familoni-hero-1080.webp 1080w, /media/familoni-hero-1536.webp 1536w',
}

// Photos supplied by the team. Place/date captions are PLACEHOLDERS until confirmed.
export const photos = {
  candid: { src: '/media/familoni-candid-720.webp', w: 720, h: 900, alt: 'Dr. Jacob Familoni, smiling', caption: '[PLACEHOLDER — place, year]' },
  speaking: { src: '/media/familoni-speaking-479.webp', w: 479, h: 720, alt: 'Dr. Jacob Familoni speaking at a lectern', caption: '[PLACEHOLDER — occasion, place, year]' },
  archive: { src: '/media/familoni-archive-us-531.webp', w: 531, h: 800, alt: 'Dr. Jacob Familoni, portrait', caption: '[PLACEHOLDER — place, year]' },
  home: {
    src: '/media/familoni-portrait-home-1080.webp',
    srcSet: '/media/familoni-portrait-home-640.webp 640w, /media/familoni-portrait-home-1080.webp 1080w, /media/familoni-portrait-home-1440.webp 1440w',
    w: 1080, h: 1511, alt: 'Dr. Jacob Familoni smiling outdoors in Nigeria', caption: '[PLACEHOLDER — place, year]',
  },
}

export const NIGERIAN_STATES = [
  'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 'Borno', 'Cross River', 'Delta',
  'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'FCT (Abuja)', 'Gombe', 'Imo', 'Jigawa', 'Kaduna', 'Kano', 'Katsina',
  'Kebbi', 'Kogi', 'Kwara', 'Lagos', 'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau', 'Rivers',
  'Sokoto', 'Taraba', 'Yobe', 'Zamfara',
]

// 18+ only (responsibility age in Nigeria).
export const AGE_RANGES = ['18–21', '22–25', '26–30', '31–35']
