import { randomUUID } from 'node:crypto'
import type { DocumentSnapshot, Query, Transaction } from 'firebase-admin/firestore'

import { Timestamp, db } from './firebase'
import { notFound } from './http'

/**
 * Firestore conventions used by every collection:
 *  - documents are stored in the same snake_case shape the API returns,
 *    so most endpoints are "read documents, add id, convert timestamps";
 *  - `created_at` (and other *_at fields) are Firestore Timestamps;
 *  - ids are UUIDs we generate (not Firestore auto-ids), so data imported
 *    from the old backend keeps its ids and so links between documents are
 *    stable.
 */

export const COLLECTIONS = {
  users: 'users',
  sessions: 'sessions',
  schedules: 'groupSchedules',
  packages: 'packages',
  bookings: 'bookings',
  vouchers: 'vouchers',
  testimonials: 'testimonials',
  pillars: 'pillars',
  certificates: 'certificates',
  events: 'events',
  vault: 'vaultItems',
  tests: 'tests',
  testResults: 'testResults',
  messages: 'contactMessages',
  consultationSlots: 'consultationSlots',
  consultationBookings: 'consultationBookings',
  notifications: 'notificationLogs',
  settings: 'settings',
} as const

export const newId = () => randomUUID()
export const now = () => Timestamp.now()

type Plain = Record<string, unknown>

/** Converts Firestore Timestamps (at any depth) to ISO strings. */
export function plain<T = Plain>(value: unknown): T {
  if (value instanceof Timestamp) return value.toDate().toISOString() as unknown as T
  if (Array.isArray(value)) return value.map((v) => plain(v)) as unknown as T
  if (value && typeof value === 'object') {
    const out: Plain = {}
    for (const [k, v] of Object.entries(value as Plain)) out[k] = plain(v)
    return out as T
  }
  return value as T
}

/** Snapshot -> API object ({ id, ...fields }) or null. */
export function toApi<T extends object = Plain>(snap: DocumentSnapshot): (T & { id: string }) | null {
  if (!snap.exists) return null
  return { id: snap.id, ...plain<T>(snap.data()) }
}

export async function listApi<T extends object = Plain>(q: Query): Promise<(T & { id: string })[]> {
  const snap = await q.get()
  return snap.docs.map((d) => toApi<T>(d)!)
}

export async function getOr404<T extends object = Plain>(collection: string, id: string, tx?: Transaction) {
  const ref = db().collection(collection).doc(id)
  const snap = tx ? await tx.get(ref) : await ref.get()
  const data = toApi<T>(snap)
  if (!data) throw notFound()
  return { ref, data }
}

/** Sort helpers (Firestore composite indexes are avoided by sorting in memory). */
export const byString = <T>(key: keyof T, dir: 'asc' | 'desc' = 'asc') => (a: T, b: T) => {
  const x = String(a[key] ?? ''), y = String(b[key] ?? '')
  return dir === 'asc' ? x.localeCompare(y) : y.localeCompare(x)
}
export const byNumber = <T>(key: keyof T, dir: 'asc' | 'desc' = 'asc') => (a: T, b: T) => {
  const x = Number(a[key] ?? 0), y = Number(b[key] ?? 0)
  return dir === 'asc' ? x - y : y - x
}
export const byDateTime = (a: Record<string, unknown>, b: Record<string, unknown>) =>
  `${a.date} ${a.start_time}`.localeCompare(`${b.date} ${b.start_time}`)

/** Removes undefined values so partial updates only touch provided fields. */
export function compact<T extends Plain>(obj: T): Partial<T> {
  const out: Plain = {}
  for (const [k, v] of Object.entries(obj)) if (v !== undefined) out[k] = v
  return out as Partial<T>
}

export const initialsOf = (name: string | null | undefined, email = '') => {
  const source = (name && name.trim()) || email
  const parts = source.split(/\s+/).filter(Boolean)
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
  return source.slice(0, 2).toUpperCase()
}

/** "Mar 14, 2026" style, as the booking flow displays dates. */
export const displayDate = (isoDate: string) =>
  new Date(`${isoDate}T00:00:00Z`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' })

/** Parses "Mar 14, 2026" or "2026-03-14" into "2026-03-14"; null if not a date. */
export function parseDateString(value: string | null | undefined): string | null {
  if (!value) return null
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value
  const d = new Date(`${value} UTC`)
  if (Number.isNaN(d.getTime())) return null
  return d.toISOString().slice(0, 10)
}

export const todayIso = () => new Date().toISOString().slice(0, 10)

/** Mock Google Meet link — the previous backend did the same. */
export function generateMeetLink() {
  const short = randomUUID().replace(/-/g, '').slice(0, 12)
  return `https://meet.google.com/mock-${short.slice(0, 3)}-${short.slice(3, 7)}-${short.slice(7)}`
}
