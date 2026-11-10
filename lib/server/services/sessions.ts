import { z } from 'zod'

import { COLLECTIONS, byDateTime, getOr404, listApi, plain, toApi } from '../data'
import { db } from '../firebase'
import { notFound } from '../http'
import { clockTime, isoDate, money, required, text } from '../validation'
import type { SessionDoc } from './bookings'

export const sessionSchema = z.object({
  title: required(200),
  title_ka: text(200).default(''),
  description: text(5000).default(''),
  description_ka: text(5000).default(''),
  price: money,
  session_type: z.enum(['group', 'individual']),
  format: z.enum(['online', 'offline', 'hybrid']).default('online'),
  language: z.enum(['both', 'ka', 'en']).default('both'),
  location: text(300).default(''),
  location_maps_url: text(2000).default(''),
  max_seats: z.coerce.number().int().min(1).max(500).default(12),
  is_active: z.coerce.boolean().default(true),
})

export const slotSchema = z.object({
  date: isoDate,
  start_time: clockTime,
  end_time: clockTime,
  is_blocked: z.coerce.boolean().default(false),
})

export const scheduleSchema = z.object({
  date: isoDate,
  start_time: clockTime,
  format: z.enum(['online', 'offline']).default('offline'),
  location: text(300).default(''),
  location_maps_url: text(2000).default(''),
})

export const packageSchema = z.object({
  title: required(200),
  title_ka: text(200).default(''),
  description: text(5000).default(''),
  description_ka: text(5000).default(''),
  price: money,
  duration_months: z.coerce.number().int().min(1).max(36).default(6),
  is_active: z.coerce.boolean().default(true),
  session_ids: z.array(z.string()).default([]),
})

export const sessionsCol = () => db().collection(COLLECTIONS.sessions)
export const slotsCol = (sessionId: string) => sessionsCol().doc(sessionId).collection('slots')
export const schedulesCol = () => db().collection(COLLECTIONS.schedules)
export const seatsCol = (scheduleId: string) => schedulesCol().doc(scheduleId).collection('seats')
export const packagesCol = () => db().collection(COLLECTIONS.packages)

/** Slot ids encode date and time, which also prevents duplicate slots. */
export const slotId = (date: string, startTime: string) => `${date}_${startTime.replace(/:/g, '')}`

export async function getSessionOr404(id: string): Promise<SessionDoc> {
  const { data } = await getOr404<Omit<SessionDoc, 'id'>>(COLLECTIONS.sessions, id)
  return data as SessionDoc
}

export async function listSlots(sessionId: string, { all = false } = {}) {
  const today = new Date().toISOString().slice(0, 10)
  let slots = await listApi<{ date: string; start_time: string; is_blocked: boolean; is_booked: boolean }>(slotsCol(sessionId))
  if (!all) slots = slots.filter((s) => !s.is_blocked && !s.is_booked && s.date >= today)
  slots.sort(byDateTime)
  return slots
}

export interface ScheduleDoc {
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

export async function getScheduleOr404(id: string): Promise<ScheduleDoc> {
  const snap = await schedulesCol().doc(id).get()
  const data = toApi<Omit<ScheduleDoc, 'id'>>(snap)
  if (!data) throw notFound('Schedule not found.')
  return data as ScheduleDoc
}

/** Package documents with the full session objects the frontend displays. */
export async function presentPackages(docs: Record<string, unknown>[]) {
  const ids = new Set<string>()
  for (const p of docs) for (const id of (p.session_ids as string[]) ?? []) ids.add(id)
  const refs = [...ids].map((id) => sessionsCol().doc(id))
  const snaps = refs.length ? await db().getAll(...refs) : []
  const sessions = new Map(snaps.filter((s) => s.exists).map((s) => [s.id, plain({ id: s.id, ...s.data() })]))
  return docs.map((p) => ({
    ...p,
    sessions_detail: ((p.session_ids as string[]) ?? []).map((id) => sessions.get(id)).filter(Boolean),
  }))
}
