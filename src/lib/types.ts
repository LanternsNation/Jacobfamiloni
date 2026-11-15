export type InitiativeStatus = 'active' | 'coming_soon'

export interface GivingExample {
  amount_naira: number | null
  provides: string
}

export interface Initiative {
  id: string
  title: string
  slug: string
  summary: string
  body: string
  hero_image: string | null
  partner: string | null
  impact_label: string | null
  impact_value: string | null
  giving_examples: GivingExample[]
  status: InitiativeStatus
  sort_order: number
}

export interface Track {
  id: string
  title: string
  slug: string
  summary: string
  is_active: boolean
  sort_order: number
}

export interface Cohort {
  id: string
  name: string
  starts_on: string | null
  capacity: number
  is_open: boolean
}

export type GalleryCategory = 'visit' | 'meeting' | 'event' | 'initiative'

export interface GalleryItem {
  id: string
  title: string
  caption: string
  place: string | null
  date_taken: string | null
  image_url: string | null
  video_url: string | null
  initiative_id: string | null
  category: GalleryCategory
  is_published: boolean
  sort_order: number
}

export interface Impact {
  applicants: number
  states_represented: number
  seats_sponsored: number
  students_placed: number
  seats_secured: number
  sponsors: number
  by_initiative: Record<string, number>
}

export interface SiteSettings {
  hero: { headline: string; subhead: string; video_url: string; poster_url: string }
  cohort_banner: { show: boolean; text: string }
  social: { facebook: string; youtube: string; instagram: string; x: string; tiktok: string; whatsapp: string }
  videos: { youtube_ids: string[] }
  counters: { show_applicants: boolean; show_states: boolean; show_seats_sponsored: boolean; show_students_placed: boolean }
  entity: { name: string; rc_number: string }
  community: { whatsapp_link: string }
}

export const CATEGORY_LABEL: Record<GalleryCategory, string> = {
  visit: 'Visit',
  meeting: 'Meeting',
  event: 'Event',
  initiative: 'Initiative',
}
