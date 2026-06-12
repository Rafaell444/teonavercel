'use client'

import useSWR, { mutate } from 'swr'

import { apiFetch } from '@/lib/api'

export interface Testimonial {
  id: string
  quote: string
  name: string
  role: string
  order: number
}

const fetcher = () => apiFetch<Testimonial[]>('/api/testimonials/')

export function useTestimonials() {
  const { data, error, isLoading } = useSWR('/api/testimonials/', fetcher)
  return { testimonials: data ?? [], isLoading, error }
}

export async function createTestimonial(body: Omit<Testimonial, 'id'>) {
  const res = await apiFetch<Testimonial>('/api/testimonials/', {
    method: 'POST',
    body: JSON.stringify(body),
  })
  await mutate('/api/testimonials/')
  return res
}

export async function updateTestimonial(id: string, body: Partial<Testimonial>) {
  const res = await apiFetch<Testimonial>(`/api/testimonials/${id}/`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  })
  await mutate('/api/testimonials/')
  return res
}

export async function deleteTestimonial(id: string) {
  await apiFetch(`/api/testimonials/${id}/`, { method: 'DELETE' })
  await mutate('/api/testimonials/')
}
