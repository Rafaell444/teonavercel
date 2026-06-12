'use client'

import useSWR, { mutate } from 'swr'

import { apiFetch } from '@/lib/api'

export interface Pillar {
  id: string
  title: string
  blurb: string
  points: string[]
  order: number
}

export interface SiteSettings {
  brandName: string
  heroBadge: string
  heroTitle: string
  heroHighlight: string
  heroSubtitle: string
  footerTagline: string
  contactEmail: string
  contactPhone: string
  contactLocation: string
  statHours: string
  statLives: string
  statReturn: string
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
  const res = await apiFetch<SiteSettings>('/api/content/settings/', {
    method: 'PATCH',
    body: JSON.stringify(patch),
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
