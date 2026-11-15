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

// "The Man." section (Home, chapter I). Copy supplied by the team, 15 Nov 2026.
export const about = {
  name: 'Jacob Familoni',
  honorific: 'Dr.',
  postNominals: ['MBA', 'RFSS', 'FFSS', 'CAIS'],
  kicker: 'Independent U.S. Presidential Candidate, 2016.',
  paragraphs: [
    'Jacob Familoni is a professional Innovator and Entrepreneur, a hardworking and dedicated individual, a good Christian, a husband, and a father of four.',
    'An ambassador and a catalyst for positive social and economic change, Jacob embodies the qualities of a natural-born leader, a much-needed leader of our time. He exudes the principles of self-aware and self-directing, with a bold vision for positive change that bridges social, economic and political divides and brings people together.',
    'Above all, Jacob is a model of diligence, a caring friend, colleague, and a down-to-earth individual.',
  ],
  // Typeset signature (placeholder). Replace with a scan of his real signature when available.
  signature: 'Jacob Familoni',
}

// Who he is, in the team's words (shown as the reel in the mobile hero, and as values on His Story).
export const credentials: { label: string; line: string }[] = [
  { label: 'Professional', line: 'Innovator & Entrepreneur' },
  { label: 'Character', line: 'Hardworking & Dedicated' },
  { label: 'Faith', line: 'Good Christian' },
  { label: 'Family', line: 'Husband & Father of Four' },
]
// The 2016 candidacy moved off the hero (15 Nov 2026) pending the election-lawyer review and eligibility check;
// it now appears only in the His Story timeline. Source: FEC candidate ID P60019361.

// Four pillars, adapted from his previous website (familoni.com). Shown on His Story.
export const pillars: { title: string; body: string }[] = [
  { title: 'Professional Innovator', body: 'Dr., MBA, RFSS, FFSS, CAIS: combining academic excellence with practical innovation and leadership.' },
  { title: 'Community Catalyst', body: 'An ambassador for positive social and economic change, bridging gaps across every part of society.' },
  { title: 'Faith & Family', body: 'A devoted Christian, a loving husband and a father of four, grounded in strong moral values.' },
  { title: 'Natural-Born Leader', body: 'Self-aware and self-directing, with a bold vision for positive change that brings people together.' },
]

// Values and education convictions, adapted from his previous site with all US-policy content removed.
export const beliefs: { title: string; body: string }[] = [
  { title: 'Transparency', body: 'Leading with honesty and open communication.' },
  { title: 'Accountability', body: 'Holding himself, and every leader, to the highest ethical standards.' },
  { title: 'Service', body: 'Putting people above personal gain.' },
  { title: 'Dignity', body: 'Upholding the worth of every individual.' },
]

export const educationConvictions: { title: string; body: string }[] = [
  { title: 'Modern education', body: 'Learning that matches real-world skills and the jobs that exist today.' },
  { title: 'Practical, vocational skills', body: 'Hands-on training that leads directly to work and income.' },
  { title: 'Lifelong learning', body: 'Reskilling for every age, because the world of work keeps changing.' },
  { title: 'Community partnerships', body: 'Schools, employers and communities working together for young people.' },
]

// Career (LinkedIn: "President / Director of Global Strategy (DGS) - PUNDITSOFT"). Dates and description to be confirmed.
export const career = {
  role: 'President and Director of Global Strategy',
  company: 'PUNDITSOFT',
  detail: '[PLACEHOLDER — what PUNDITSOFT does, since when, and key achievements, confirmed by Dr. Familoni.]',
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
  { year: '2016', title: 'Independent candidate for U.S. President', body: 'Filed a statement of candidacy with the U.S. Federal Election Commission as an independent candidate for President (FEC candidate ID P60019361).' },
  { year: '[Year]', title: '[PLACEHOLDER] Investing at home', body: '[PLACEHOLDER — the decision to build initiatives in Nigeria.]' },
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
  // Studio cut-out (real photo, background removed, black-and-white). Replace with a dedicated shoot when available.
  figureSrc: '/media/familoni-studio-1080.webp',
  figureSrcSet: '/media/familoni-studio-640.webp 640w, /media/familoni-studio-1080.webp 1080w, /media/familoni-studio-1400.webp 1400w',
  figureRatio: 1460 / 2120,
}

// Photos supplied by the team. Place/date captions are PLACEHOLDERS until confirmed.
export const photos = {
  candid: { src: '/media/familoni-candid-720.webp', w: 720, h: 900, alt: 'Dr. Jacob Familoni, smiling', caption: '[PLACEHOLDER — place, year]' },
  speaking: { src: '/media/familoni-speaking-479.webp', w: 479, h: 720, alt: 'Dr. Jacob Familoni speaking at a lectern', caption: '[PLACEHOLDER — occasion, place, year]' },
  archive: { src: '/media/familoni-archive-us-531.webp', w: 531, h: 800, alt: 'Dr. Jacob Familoni, portrait', caption: '[PLACEHOLDER — place, year]' },
  about: { src: '/media/familoni-about-960.webp', srcSet: '/media/familoni-about-600.webp 600w, /media/familoni-about-960.webp 960w', w: 871, h: 1627, alt: 'Dr. Jacob Familoni, standing, hands in pockets' },
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
