import type { DocumentReference, Transaction } from 'firebase-admin/firestore'

import { COLLECTIONS, displayDate, generateMeetLink, newId, now, parseDateString, plain, toApi } from '../data'
import { Timestamp, db } from '../firebase'
import { badRequest, conflict, notFound } from '../http'
import { notifyBookingCreated, type BookingForNotify } from '../notifications'

/** Days a block of sessions stays valid, by number of sessions (same as before). */
const EXPIRATION_DAYS: Record<number, number> = { 3: 45, 4: 60, 5: 90, 6: 90, 7: 150 }

export interface SessionDoc {
  id: string
  title: string
  title_ka: string
  description: string
  description_ka: string
  price: number
  session_type: 'group' | 'individual'
  format: 'online' | 'offline' | 'hybrid'
  language: 'both' | 'ka' | 'en'
  location: string
  location_maps_url: string
  max_seats: number
  is_active: boolean
  created_at: string
}

export interface BookingSessionDoc {
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

export interface BookingDoc {
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
  session_language: 'ka' | 'en'
  is_package: boolean
  package_duration_months: number | null
  total: number
  discount_amount: number
  voucher_code: string
  meet_link: string
  status: 'Confirmed' | 'Pending' | 'Cancelled' | 'Expired'
  purchased_at: string
  expires_at: string | null
  created_at: string
  booking_sessions: BookingSessionDoc[]
}

/** Adds the computed is_expired flag the frontend expects. */
export function presentBooking(b: BookingDoc) {
  return { ...b, is_expired: !!b.expires_at && new Date(b.expires_at).getTime() < Date.now() }
}

export async function loadActiveSession(sessionId: string, tx?: Transaction): Promise<SessionDoc> {
  const ref = db().collection(COLLECTIONS.sessions).doc(sessionId)
  const snap = tx ? await tx.get(ref) : await ref.get()
  const data = toApi<Omit<SessionDoc, 'id'>>(snap)
  if (!data || !data.is_active) throw badRequest('This session is not available.')
  return data as SessionDoc
}

export interface VoucherDoc {
  id: string
  code: string
  discount_type: 'percentage' | 'fixed'
  discount_value: number
  max_uses: number | null
  times_used: number
  valid_from: string
  valid_until: string
  is_active: boolean
  applicable_sessions: string[]
  created_at: string
}

export function voucherIsValid(v: VoucherDoc, at = Date.now()) {
  if (!v.is_active) return false
  if (at < new Date(v.valid_from).getTime() || at > new Date(v.valid_until).getTime()) return false
  if (v.max_uses && v.times_used >= v.max_uses) return false
  return true
}

export function computeDiscount(v: VoucherDoc, basePrice: number) {
  if (v.discount_type === 'percentage') return Math.round(basePrice * v.discount_value) / 100
  return Math.min(v.discount_value, basePrice)
}

/** Validates a voucher inside a transaction and returns the discount; null when no code. */
export async function applyVoucher(tx: Transaction, code: string | undefined, sessionId: string, basePrice: number) {
  const normalized = (code ?? '').trim().toUpperCase()
  if (!normalized) return null
  const ref = db().collection(COLLECTIONS.vouchers).doc(normalized)
  const voucher = toApi<Omit<VoucherDoc, 'id'>>(await tx.get(ref)) as VoucherDoc | null
  if (!voucher) throw badRequest('Invalid voucher code.')
  if (!voucherIsValid(voucher)) throw badRequest('This voucher has expired or reached its usage limit.')
  if (voucher.applicable_sessions?.length && !voucher.applicable_sessions.includes(sessionId)) {
    throw badRequest('This voucher is not applicable to this session.')
  }
  // times_used is returned here because Firestore needs every read to happen before any write
  return { ref, code: normalized, discount: computeDiscount(voucher, basePrice), timesUsed: voucher.times_used }
}

export interface CreateBookingInput {
  user: { id: string; name: string; email: string }
  session: SessionDoc
  numSessions: number
  format: 'online' | 'offline'
  sessionLanguage: 'ka' | 'en'
  /** "Mar 14, 2026" or ISO; may be empty for bookings without a first date */
  date: string
  time: string
  isPackage: boolean
  packageDurationMonths: number | null
  total: number
  discountAmount: number
  voucherCode: string
  status: BookingDoc['status']
  firstSession?: { timeSlot: string | null; date: string | null; time: string | null; meetLink: string }
}

/** Builds the booking document. Must be written by the caller (inside its transaction). */
export function buildBooking(input: CreateBookingInput): { ref: DocumentReference; doc: Record<string, unknown>; api: BookingDoc } {
  const id = newId()
  const purchasedAt = new Date()
  const expiresAt = new Date(purchasedAt)
  if (input.isPackage && input.packageDurationMonths) {
    expiresAt.setDate(expiresAt.getDate() + input.packageDurationMonths * 30)
  } else {
    expiresAt.setDate(expiresAt.getDate() + (EXPIRATION_DAYS[input.numSessions] ?? 90))
  }

  const sessions: BookingSessionDoc[] = []
  if (input.firstSession && (input.firstSession.date || input.firstSession.time)) {
    sessions.push({
      id: newId(),
      booking: id,
      time_slot: input.firstSession.timeSlot,
      session_number: 1,
      date: input.firstSession.date,
      time: input.firstSession.time,
      format: input.format,
      meet_link: input.firstSession.meetLink,
      status: 'scheduled',
      created_at: purchasedAt.toISOString(),
    })
  }

  const api: BookingDoc = {
    id,
    user: input.user.id,
    user_name: input.user.name,
    user_email: input.user.email,
    session: input.session.id,
    session_title: input.session.title,
    session_type: input.session.session_type,
    num_sessions: input.numSessions,
    sessions_used: 0,
    date: input.date,
    time: input.time,
    format: input.format,
    session_language: input.sessionLanguage,
    is_package: input.isPackage,
    package_duration_months: input.packageDurationMonths,
    total: input.total,
    discount_amount: input.discountAmount,
    voucher_code: input.voucherCode,
    meet_link: input.firstSession?.meetLink ?? '',
    status: input.status,
    purchased_at: purchasedAt.toISOString(),
    expires_at: expiresAt.toISOString(),
    created_at: purchasedAt.toISOString(),
    booking_sessions: sessions,
  }

  const { id: _id, ...fields } = api
  const doc = {
    ...fields,
    purchased_at: Timestamp.fromDate(purchasedAt),
    expires_at: Timestamp.fromDate(expiresAt),
    created_at: Timestamp.fromDate(purchasedAt),
    booking_sessions: sessions.map((s) => ({ ...s, created_at: Timestamp.fromDate(purchasedAt) })),
  }
  return { ref: db().collection(COLLECTIONS.bookings).doc(id), doc, api }
}

export function bookingForNotify(b: BookingDoc): BookingForNotify {
  return {
    id: b.id,
    user_name: b.user_name,
    user_email: b.user_email,
    session_title: b.session_title,
    num_sessions: b.num_sessions,
    format: b.format,
    date: b.date,
    time: b.time,
    total: b.total,
    expires_at: b.expires_at,
    meet_link: b.meet_link,
  }
}

/**
 * Creates an individual or package booking: marks the chosen time slot as
 * taken, applies the voucher, computes the total on the server, stores the
 * booking and its first session, then notifies.
 */
export async function createIndividualBooking(args: {
  user: { id: string; name: string; email: string }
  sessionId: string
  numSessions: number
  format: 'online' | 'offline'
  sessionLanguage: 'ka' | 'en'
  date?: string
  time?: string
  timeSlotId?: string
  isPackage: boolean
  packageDurationMonths?: number | null
  voucherCode?: string
}): Promise<BookingDoc> {
  const firestore = db()
  const booking = await firestore.runTransaction(async (tx) => {
    const session = await loadActiveSession(args.sessionId, tx)

    // Time slot (optional): must still be free; it is marked booked here so two
    // people cannot take the same time.
    let slotDate: string | null = parseDateString(args.date)
    let slotTime: string | null = args.time?.slice(0, 5) ?? null
    let slotRef: DocumentReference | null = null
    if (args.timeSlotId) {
      slotRef = firestore.collection(COLLECTIONS.sessions).doc(session.id).collection('slots').doc(args.timeSlotId)
      const slot = (await tx.get(slotRef)).data()
      if (!slot) throw notFound('Time slot not found.')
      if (slot.is_blocked || slot.is_booked) throw conflict('That time has just been taken. Please choose another.')
      slotDate = slot.date
      slotTime = String(slot.start_time).slice(0, 5)
    }

    const basePrice = session.price * args.numSessions
    const voucher = await applyVoucher(tx, args.voucherCode, session.id, basePrice)
    const discount = voucher?.discount ?? 0
    const total = Math.max(basePrice - discount, 0)

    const built = buildBooking({
      user: args.user,
      session,
      numSessions: args.numSessions,
      format: args.format,
      sessionLanguage: args.sessionLanguage,
      date: slotDate ? displayDate(slotDate) : args.date ?? '',
      time: slotTime ?? '',
      isPackage: args.isPackage,
      packageDurationMonths: args.packageDurationMonths ?? null,
      total,
      discountAmount: discount,
      voucherCode: voucher?.code ?? '',
      status: 'Pending',
      firstSession: { timeSlot: args.timeSlotId ?? null, date: slotDate, time: slotTime, meetLink: args.format === 'online' ? generateMeetLink() : '' },
    })

    tx.set(built.ref, built.doc)
    if (slotRef) tx.update(slotRef, { is_booked: true, booked_by: args.user.id, booked_by_name: args.user.name })
    if (voucher) tx.update(voucher.ref, { times_used: voucher.timesUsed + 1 })
    return built.api
  })

  await notifyBookingCreated(bookingForNotify(booking))
  return booking
}

export async function getBookingOr404(id: string): Promise<BookingDoc> {
  const snap = await db().collection(COLLECTIONS.bookings).doc(id).get()
  const data = toApi<Omit<BookingDoc, 'id'>>(snap)
  if (!data) throw notFound()
  return plain<BookingDoc>(data)
}

export { now }
