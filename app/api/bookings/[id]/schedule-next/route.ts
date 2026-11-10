import { z } from 'zod'

import { requireUser } from '@/lib/server/auth'
import { COLLECTIONS, generateMeetLink, newId, parseDateString, plain, toApi } from '@/lib/server/data'
import { Timestamp, db } from '@/lib/server/firebase'
import { assertId, badRequest, conflict, created, forbidden, handle, notFound, parseBody, type Params } from '@/lib/server/http'
import { notifySessionScheduled } from '@/lib/server/notifications'
import { bookingForNotify, type BookingDoc, type BookingSessionDoc } from '@/lib/server/services/bookings'
import { slotsCol } from '@/lib/server/services/sessions'
import { clockTime, isoDate, uuidLike } from '@/lib/server/validation'

const schema = z.object({
  time_slot_id: uuidLike.optional().nullable(),
  date: isoDate.optional(),
  time: clockTime.optional(),
  format: z.enum(['online', 'offline']),
})

/** Member: schedule the next session of a multi-session booking. */
export const POST = handle<Params<{ id: string }>>(async (req, { params }) => {
  const user = await requireUser(req)
  const id = assertId((await params).id)
  const body = await parseBody(req, schema)
  const firestore = db()
  const bookingRef = firestore.collection(COLLECTIONS.bookings).doc(id)

  const { booking, session } = await firestore.runTransaction(async (tx) => {
    const booking = toApi<Omit<BookingDoc, 'id'>>(await tx.get(bookingRef)) as BookingDoc | null
    if (!booking) throw notFound()
    if (booking.user !== user.id) throw forbidden()
    if (booking.expires_at && new Date(booking.expires_at).getTime() < Date.now()) throw forbidden('This booking has expired.')
    const existing = booking.booking_sessions ?? []
    if (existing.length >= booking.num_sessions) throw badRequest('All sessions have been scheduled.')

    let date = body.date ?? null
    let time = body.time ? body.time.slice(0, 5) : null
    let slotRef = null
    if (body.time_slot_id) {
      slotRef = slotsCol(booking.session).doc(body.time_slot_id)
      const slot = (await tx.get(slotRef)).data()
      if (!slot || slot.is_blocked || slot.is_booked) throw conflict('Time slot not available.')
      date = slot.date
      time = String(slot.start_time).slice(0, 5)
    }
    if (!date || !time) throw badRequest('Choose a date and time.')

    const createdAt = new Date()
    const session: BookingSessionDoc = {
      id: newId(),
      booking: id,
      time_slot: body.time_slot_id ?? null,
      session_number: existing.length + 1,
      date: parseDateString(date),
      time,
      format: body.format,
      meet_link: body.format === 'online' ? generateMeetLink() : '',
      status: 'scheduled',
      created_at: createdAt.toISOString(),
    }
    const stored = (await tx.get(bookingRef)).get('booking_sessions') ?? []
    tx.update(bookingRef, { booking_sessions: [...stored, { ...session, created_at: Timestamp.fromDate(createdAt) }] })
    if (slotRef) tx.update(slotRef, { is_booked: true, booked_by: user.id, booked_by_name: user.name })
    return { booking, session }
  })

  const sessionDoc = (await firestore.collection(COLLECTIONS.sessions).doc(booking.session).get()).data()
  await notifySessionScheduled(bookingForNotify(booking), session, sessionDoc ? { name: sessionDoc.location, maps: sessionDoc.location_maps_url } : undefined)
  return created(plain(session))
})
