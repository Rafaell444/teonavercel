'use client'

import useSWR, { mutate } from 'swr'

import { apiFetch } from '@/lib/api'

export interface Pillar {
  id: string
  title: string
  title_ka: string
  blurb: string
  blurb_ka: string
  points: string[]
  points_ka: string[]
  order: number
  long_description: string
  long_description_ka: string
  history: string
  history_ka: string
}

export interface SiteSettings {
  brandName: string
  heroBadge: string
  heroBadgeKa: string
  heroTitle: string
  heroTitleKa: string
  heroHighlight: string
  heroHighlightKa: string
  heroSubtitle: string
  heroSubtitleKa: string
  footerTagline: string
  footerTaglineKa: string
  contactEmail: string
  contactPhone: string
  contactLocation: string
  statHours: string
  statLives: string
  statReturn: string
  heroImage: string | null
}

export function usePillars() {
  const { data, error, isLoading } = useSWR('/api/content/pillars/', () =>
    apiFetch<Pillar[]>('/api/content/pillars/')
  )
  return { pillars: data ?? [], isLoading, error }
}

export function useSiteSettings() {
  const { data, error, isLoading } = useSWR('/api/content/settings/', () =>
    apiFetch<SiteSettings>('/api/content/settings/')
  )
  return { settings: data ?? null, isLoading, error }
}

export async function updateSiteSettings(patch: Partial<SiteSettings>) {
  const { heroImage, ...rest } = patch
  void heroImage
  const res = await apiFetch<SiteSettings>('/api/content/settings/', {
    method: 'PATCH',
    body: JSON.stringify(rest),
  })
  await mutate('/api/content/settings/')
  return res
}

export async function updateSiteSettingsWithImage(formData: FormData) {
  const res = await apiFetch<SiteSettings>('/api/content/settings/', {
    method: 'PATCH',
    body: formData,
  })
  await mutate('/api/content/settings/')
  return res
}

export async function createPillar(body: Omit<Pillar, 'id'>) {
  const res = await apiFetch<Pillar>('/api/content/pillars/', {
    method: 'POST',
    body: JSON.stringify(body),
  })
  await mutate('/api/content/pillars/')
  return res
}

export async function updatePillar(id: string, body: Partial<Pillar>) {
  const res = await apiFetch<Pillar>(`/api/content/pillars/${id}/`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  })
  await mutate('/api/content/pillars/')
  return res
}

export async function deletePillar(id: string) {
  await apiFetch(`/api/content/pillars/${id}/`, { method: 'DELETE' })
  await mutate('/api/content/pillars/')
}

// ─── Certificates ───────────────────────────────────────────────────────────

export interface Certificate {
  id: string
  title: string
  image: string
  order: number
}

export function useCertificates() {
  const { data, error, isLoading } = useSWR('/api/content/certificates/', () =>
    apiFetch<Certificate[]>('/api/content/certificates/')
  )
  return { certificates: data ?? [], isLoading, error }
}

export async function uploadCertificate(formData: FormData) {
  const res = await apiFetch<Certificate>('/api/content/certificates/', {
    method: 'POST',
    body: formData,
  })
  await mutate('/api/content/certificates/')
  return res
}

export async function deleteCertificate(id: string) {
  await apiFetch(`/api/content/certificates/${id}/`, { method: 'DELETE' })
  await mutate('/api/content/certificates/')
}
