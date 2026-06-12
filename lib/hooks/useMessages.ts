'use client'

import useSWR, { mutate } from 'swr'

import { apiFetch } from '@/lib/api'

export interface ContactMessage {
  id: string
  name: string
  email: string
  subject: string
  message: string
  read: boolean
  created_at: string
}

export interface SendMessagePayload {
  name: string
  email: string
  subject: string
  message: string
}

export function useMessages(readFilter?: boolean) {
  const key = readFilter !== undefined
    ? `/api/messages/?read=${readFilter}`
    : '/api/messages/'
  const { data, error, isLoading } = useSWR(key, () =>
    apiFetch<ContactMessage[]>(key)
  )
  return { messages: data ?? [], isLoading, error }
}

export async function sendMessage(payload: SendMessagePayload) {
  return apiFetch<ContactMessage>('/api/messages/', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function markMessageRead(id: string) {
  const res = await apiFetch<ContactMessage>(`/api/messages/${id}/`, { method: 'PATCH' })
  await mutate('/api/messages/')
  return res
}

export async function deleteMessage(id: string) {
  await apiFetch(`/api/messages/${id}/`, { method: 'DELETE' })
  await mutate('/api/messages/')
}
