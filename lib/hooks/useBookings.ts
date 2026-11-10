'use client'

import useSWR, { mutate } from 'swr'

import { apiFetch } from '@/lib/api'

export interface BookingSession {
  id: string
  booking: string
  time_slot: string | null
  session_number: number
  date: string | null
  time: string | null
  format: 'online' | 'offline'
  meet_link: string
  status: 'scheduled' | 'completed' | 'missed' | 'cancelled'
  created_at: string
}

export interface Booking {
  id: string
  user: string
  user_name: string
  user_email: string
  session: string
  session_title: string
  session_type: 'group' | 'individual'
  num_sessions: number
  sessions_used: number
  date: string
  time: string
  format: 'online' | 'offline'
  /** Language the client asked for. Missing on bookings made before this field existed. */
  session_language?: 'ka' | 'en'
  is_package: boolean
  package_duration_months: number | null
  total: number
  discount_amount: number
  voucher_code: string
  meet_link: string
  status: 'Confirmed' | 'Pending' | 'Cancelled' | 'Expired'
  is_expired: boolean
  purchased_at: string
  expires_at: string | null
  created_at: string
  booking_sessions: BookingSession[]
}

export interface CreateBookingPayload {
  session_id: string
  /** Chosen availability slot; the server marks it as taken. */
  time_slot_id?: string
  date?: string
  time?: string
  format: 'online' | 'offline'
  session_language?: 'ka' | 'en'
  num_sessions: number
  is_package?: boolean
  package_duration_months?: number
  voucher_code?: string
  discount_amount?: number
}

export interface ScheduleNextPayload {
  time_slot_id?: string
  date?: string
  time?: string
  format: 'online' | 'offline'
}

const fetcher = () => apiFetch<Booking[]>('/api/bookings/')

export function useBookings() {
  const { data, error, isLoading } = useSWR('/api/bookings/', fetcher)
  return { bookings: data ?? [], isLoading, error }
}

export function useBookingDetail(id: string) {
  const key = id ? `/api/bookings/${id}/` : null
  const fetcher = () => apiFetch<Booking>(key!)
  const { data, error, isLoading } = useSWR(key, fetcher)
  return { booking: data, isLoading, error }
}

export async function createBooking(payload: CreateBookingPayload) {
  const res = await apiFetch<Booking>('/api/bookings/', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
  await mutate('/api/bookings/')
  return res
}

export async function updateBookingStatus(
  id: string,
  status: 'Confirmed' | 'Pending' | 'Cancelled' | 'Expired',
) {
  const res = await apiFetch<Booking>(`/api/bookings/${id}/status/`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  })
  await mutate('/api/bookings/')
  return res
}

export async function scheduleNextSession(bookingId: string, payload: ScheduleNextPayload) {
  const res = await apiFetch<BookingSession>(`/api/bookings/${bookingId}/schedule-next/`, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
  await mutate('/api/bookings/')
  await mutate(`/api/bookings/${bookingId}/`)
  return res
}

export async function getBookingSessions(bookingId: string) {
  return apiFetch<BookingSession[]>(`/api/bookings/${bookingId}/sessions/`)
}
