'use client'

import useSWR, { mutate } from 'swr'

import { apiFetch } from '@/lib/api'

export interface EventItem {
  id: string
  title: string
  type: string
  date: string
  location: string
  seats: string
  image: string | null
}

const fetcher = () => apiFetch<EventItem[]>('/api/events/')

export function useEvents() {
  const { data, error, isLoading } = useSWR('/api/events/', fetcher)
  return { events: data ?? [], isLoading, error }
}

export async function createEvent(formData: FormData) {
  const res = await apiFetch<EventItem>('/api/events/', { method: 'POST', body: formData })
  await mutate('/api/events/')
  return res
}

export async function updateEvent(id: string, formData: FormData) {
  const res = await apiFetch<EventItem>(`/api/events/${id}/`, { method: 'PATCH', body: formData })
  await mutate('/api/events/')
  return res
}

export async function deleteEvent(id: string) {
  await apiFetch(`/api/events/${id}/`, { method: 'DELETE' })
  await mutate('/api/events/')
}
