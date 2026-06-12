'use client'

import useSWR, { mutate } from 'swr'

import { apiFetch } from '@/lib/api'

export interface Session {
  id: string
  title: string
  description: string
  price: number
  session_type: 'group' | 'individual'
  format: 'online' | 'offline' | 'hybrid'
  location: string
  location_maps_url: string
  max_seats: number
  is_active: boolean
  created_at: string
}

export interface SessionTimeSlot {
  id: string
  session: string
  date: string
  start_time: string
  end_time: string
  is_blocked: boolean
  is_booked: boolean
  booked_by: string | null
  booked_by_name: string | null
}

export interface GroupSessionSchedule {
  id: string
  session: string
  date: string
  start_time: string
  format: 'online' | 'offline'
  location: string
  location_maps_url: string
  seats_total: number
  seats_taken: number
}

export interface GroupSessionSeat {
  id: string
  schedule: string
  seat_number: number
  user: string | null
  user_name: string | null
  user_initials: string | null
  reserved_at: string | null
}

export interface Package {
  id: string
  title: string
  description: string
  price: number
  duration_months: number
  is_active: boolean
  created_at: string
  session_ids: string[]
  sessions_detail: Session[]
}

// ─── Sessions ───────────────────────────────────────────────────────────────

const sessionsFetcher = () => apiFetch<Session[]>('/api/sessions/')

export function useSessions(type?: 'group' | 'individual') {
  const key = type ? `/api/sessions/?type=${type}` : '/api/sessions/'
  const fetcher = () => apiFetch<Session[]>(key)
  const { data, error, isLoading } = useSWR(key, fetcher)
  return { sessions: data ?? [], isLoading, error }
}

export async function createSession(body: Partial<Session>) {
  const res = await apiFetch<Session>('/api/sessions/', {
    method: 'POST',
    body: JSON.stringify(body),
  })
  await mutate((key: string) => typeof key === 'string' && key.startsWith('/api/sessions'), undefined, { revalidate: true })
  return res
}

export async function updateSession(id: string, body: Partial<Session>) {
  const res = await apiFetch<Session>(`/api/sessions/${id}/`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  })
  await mutate((key: string) => typeof key === 'string' && key.startsWith('/api/sessions'), undefined, { revalidate: true })
  return res
}

export async function deleteSession(id: string) {
  await apiFetch(`/api/sessions/${id}/`, { method: 'DELETE' })
  await mutate((key: string) => typeof key === 'string' && key.startsWith('/api/sessions'), undefined, { revalidate: true })
}

// ─── Time Slots ─────────────────────────────────────────────────────────────

export function useTimeSlots(sessionId: string, showAll = false) {
  const key = sessionId ? `/api/sessions/${sessionId}/slots/?all=${showAll}` : null
  const fetcher = () => apiFetch<SessionTimeSlot[]>(key!)
  const { data, error, isLoading } = useSWR(key, fetcher)
  return { slots: data ?? [], isLoading, error }
}

export async function createTimeSlot(sessionId: string, body: Partial<SessionTimeSlot>) {
  const res = await apiFetch<SessionTimeSlot>(`/api/sessions/${sessionId}/slots/`, {
    method: 'POST',
    body: JSON.stringify(body),
  })
  await mutate((key: string) => typeof key === 'string' && key.includes(`/api/sessions/${sessionId}/slots`), undefined, { revalidate: true })
  return res
}

export async function createTimeSlotssBulk(sessionId: string, slots: Partial<SessionTimeSlot>[]) {
  const res = await apiFetch<SessionTimeSlot[]>(`/api/sessions/${sessionId}/slots/bulk/`, {
    method: 'POST',
    body: JSON.stringify({ slots }),
  })
  await mutate((key: string) => typeof key === 'string' && key.includes(`/api/sessions/${sessionId}/slots`), undefined, { revalidate: true })
  return res
}

export async function updateTimeSlot(sessionId: string, slotId: string, body: Partial<SessionTimeSlot>) {
  const res = await apiFetch<SessionTimeSlot>(`/api/sessions/${sessionId}/slots/${slotId}/`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  })
  await mutate((key: string) => typeof key === 'string' && key.includes(`/api/sessions/${sessionId}/slots`), undefined, { revalidate: true })
  return res
}

export async function deleteTimeSlot(sessionId: string, slotId: string) {
  await apiFetch(`/api/sessions/${sessionId}/slots/${slotId}/`, { method: 'DELETE' })
  await mutate((key: string) => typeof key === 'string' && key.includes(`/api/sessions/${sessionId}/slots`), undefined, { revalidate: true })
}

// ─── Group Schedules ────────────────────────────────────────────────────────

export function useGroupSchedules(sessionId: string) {
  const key = sessionId ? `/api/sessions/${sessionId}/schedules/` : null
  const fetcher = () => apiFetch<GroupSessionSchedule[]>(key!)
  const { data, error, isLoading } = useSWR(key, fetcher)
  return { schedules: data ?? [], isLoading, error }
}

export async function createGroupSchedule(sessionId: string, body: Partial<GroupSessionSchedule>) {
  const res = await apiFetch<GroupSessionSchedule>(`/api/sessions/${sessionId}/schedules/`, {
    method: 'POST',
    body: JSON.stringify(body),
  })
  await mutate((key: string) => typeof key === 'string' && key.includes('/schedules/'), undefined, { revalidate: true })
  return res
}

export async function deleteGroupSchedule(sessionId: string, scheduleId: string) {
  await apiFetch(`/api/sessions/${sessionId}/schedules/${scheduleId}/`, { method: 'DELETE' })
  await mutate((key: string) => typeof key === 'string' && key.includes('/schedules/'), undefined, { revalidate: true })
}

// ─── Group Seats ────────────────────────────────────────────────────────────

export function useGroupSeats(scheduleId: string) {
  const key = scheduleId ? `/api/sessions/schedules/${scheduleId}/seats/` : null
  const fetcher = () => apiFetch<GroupSessionSeat[]>(key!)
  const { data, error, isLoading } = useSWR(key, fetcher)
  return { seats: data ?? [], isLoading, error }
}

export interface GroupSeatPurchaseResult {
  seat: GroupSessionSeat
  booking: {
    id: string
    meet_link: string
    total: number
    status: string
    session_title: string
  }
}

export async function claimGroupSeat(scheduleId: string, seatNumber: number) {
  const res = await apiFetch<GroupSeatPurchaseResult>(
    `/api/sessions/schedules/${scheduleId}/seats/${seatNumber}/claim/`,
    { method: 'POST' }
  )
  await mutate((key: string) => typeof key === 'string' && key.includes(`/seats/`), undefined, { revalidate: true })
  await mutate('/api/bookings/')
  return res
}

export async function releaseGroupSeat(scheduleId: string, seatNumber: number) {
  const res = await apiFetch<GroupSessionSeat>(
    `/api/sessions/schedules/${scheduleId}/seats/${seatNumber}/release/`,
    { method: 'POST' }
  )
  await mutate((key: string) => typeof key === 'string' && key.includes(`/seats/`), undefined, { revalidate: true })
  await mutate('/api/bookings/')
  return res
}

// ─── Packages ───────────────────────────────────────────────────────────────

const packagesFetcher = () => apiFetch<Package[]>('/api/sessions/packages/')

export function usePackages() {
  const { data, error, isLoading } = useSWR('/api/sessions/packages/', packagesFetcher)
  return { packages: data ?? [], isLoading, error }
}

export async function createPackage(body: Partial<Package>) {
  const res = await apiFetch<Package>('/api/sessions/packages/', {
    method: 'POST',
    body: JSON.stringify(body),
  })
  await mutate('/api/sessions/packages/')
  return res
}

export async function updatePackage(id: string, body: Partial<Package>) {
  const res = await apiFetch<Package>(`/api/sessions/packages/${id}/`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  })
  await mutate('/api/sessions/packages/')
  return res
}

export async function deletePackage(id: string) {
  await apiFetch(`/api/sessions/packages/${id}/`, { method: 'DELETE' })
  await mutate('/api/sessions/packages/')
}
