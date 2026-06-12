'use client'

import useSWR, { mutate } from 'swr'

import { apiFetch } from '@/lib/api'

export interface Course {
  id: string
  name: string
  price: number
}

const fetcher = () => apiFetch<Course[]>('/api/courses/')

export function useCourses() {
  const { data, error, isLoading } = useSWR('/api/courses/', fetcher)
  return { courses: data ?? [], isLoading, error }
}

export async function createCourse(body: Omit<Course, 'id'>) {
  const res = await apiFetch<Course>('/api/courses/', { method: 'POST', body: JSON.stringify(body) })
  await mutate('/api/courses/')
  return res
}

export async function updateCourse(id: string, body: Partial<Course>) {
  const res = await apiFetch<Course>(`/api/courses/${id}/`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  })
  await mutate('/api/courses/')
  return res
}

export async function deleteCourse(id: string) {
  await apiFetch(`/api/courses/${id}/`, { method: 'DELETE' })
  await mutate('/api/courses/')
}
