'use client'

import useSWR, { mutate } from 'swr'

import { apiFetch } from '@/lib/api'

export interface Seat {
  seat_number: number
  user: string | null
  user_name: string | null
  user_initials: string | null
  reserved_at: string | null
}

const fetcher = () => apiFetch<Seat[]>('/api/roundtable/seats/')

export function useSeats() {
  const { data, error, isLoading } = useSWR('/api/roundtable/seats/', fetcher)
  return { seats: data ?? [], isLoading, error }
}

export async function claimSeat(seatNumber: number) {
  const res = await apiFetch<Seat>(`/api/roundtable/seats/${seatNumber}/claim/`, {
    method: 'POST',
  })
  await mutate('/api/roundtable/seats/')
  return res
}

export async function releaseSeat(seatNumber: number) {
  await apiFetch(`/api/roundtable/seats/${seatNumber}/claim/`, { method: 'DELETE' })
  await mutate('/api/roundtable/seats/')
}
