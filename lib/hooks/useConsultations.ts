'use client'

import useSWR, { mutate } from 'swr'
import { apiFetch } from '@/lib/api'

export interface ConsultationSlot {
  id: string
  date: string
  start_time: string
  end_time: string
  is_booked: boolean
  booked_by?: string | null
  booked_by_name?: string | null
}

export interface ConsultationBooking {
  id: string
  user_name: string
  user_email: string
  date: string
  start_time: string
  end_time: string
  meet_link: string
  status: string
  created_at: string
}

export function useConsultationSlots() {
  const { data, error, isLoading } = useSWR('/api/consultations/slots/', () =>
    apiFetch<ConsultationSlot[]>('/api/consultations/slots/')
  )
  return { slots: data ?? [], isLoading, error }
}

export function useConsultationBookings() {
  const { data, error, isLoading } = useSWR('/api/consultations/', () =>
    apiFetch<ConsultationBooking[]>('/api/consultations/')
  )
  return { bookings: data ?? [], isLoading, error }
}

export async function createConsultationSlot(body: { date: string; start_time: string; end_time: string }) {
  const res = await apiFetch<ConsultationSlot>('/api/consultations/slots/', {
    method: 'POST',
    body: JSON.stringify(body),
  })
  await mutate('/api/consultations/slots/')
  return res
}

export async function deleteConsultationSlot(id: string) {
  await apiFetch(`/api/consultations/slots/${id}/`, { method: 'DELETE' })
  await mutate('/api/consultations/slots/')
}

export async function bookConsultation(slotId: string) {
  const res = await apiFetch<ConsultationBooking>('/api/consultations/book/', {
    method: 'POST',
    body: JSON.stringify({ slot_id: slotId }),
  })
  await mutate('/api/consultations/slots/')
  await mutate('/api/consultations/')
  return res
}
