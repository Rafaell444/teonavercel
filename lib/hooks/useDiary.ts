'use client'

import useSWR, { mutate } from 'swr'

import { apiFetch } from '@/lib/api'

export interface DiaryEntry {
  id: number
  user: string
  date: string
  title: string
  excerpt: string
  mood: string
  created_at: string
}

export interface CreateDiaryEntryPayload {
  date: string
  title: string
  excerpt: string
  mood: string
}

const fetcher = () => apiFetch<DiaryEntry[]>('/api/diary/')

export function useDiary() {
  const { data, error, isLoading } = useSWR('/api/diary/', fetcher)
  return { diary: data ?? [], isLoading, error }
}

export async function addDiaryEntry(payload: CreateDiaryEntryPayload) {
  const res = await apiFetch<DiaryEntry>('/api/diary/', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
  await mutate('/api/diary/')
  return res
}
