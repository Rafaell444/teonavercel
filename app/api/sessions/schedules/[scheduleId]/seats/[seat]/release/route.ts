import { requireUser } from '@/lib/server/auth'
import { COLLECTIONS, displayDate, toApi } from '@/lib/server/data'
import { db } from '@/lib/server/firebase'
import { assertId, forbidden, handle, json, notFound, type Params } from '@/lib/server/http'
import { schedulesCol, seatsCol, type ScheduleDoc } from '@/lib/server/services/sessions'

type Ctx = Params<{ scheduleId: string; seat: string }>

/** Member: give a seat back. The matching booking is cancelled. */
export const POST = handle<Ctx>(async (req, { params }) => {
  const user = await requireUser(req)
  const { scheduleId, seat } = await params
  const firestore = db()
  const scheduleRef = schedulesCol().doc(assertId(scheduleId))
  const seatRef = seatsCol(scheduleId).doc(assertId(seat))

  const released = await firestore.runTransaction(async (tx) => {
    const [scheduleSnap, seatSnap] = await Promise.all([tx.get(scheduleRef), tx.get(seatRef)])
    const schedule = toApi<Omit<ScheduleDoc, 'id'>>(scheduleSnap) as ScheduleDoc | null
    if (!schedule || !seatSnap.exists) throw notFound('Seat not found.')
    if (seatSnap.get('user') !== user.id) throw forbidden('Not your seat.')

    const time = String(schedule.start_time).slice(0, 5)
    const bookings = await tx.get(
      firestore
        .collection(COLLECTIONS.bookings)
        .where('user', '==', user.id)
        .where('session', '==', schedule.session)
        .where('date', '==', displayDate(schedule.date))
        .where('time', '==', time),
    )
    for (const doc of bookings.docs) {
      if (!['Confirmed', 'Pending'].includes(doc.get('status'))) continue
      const sessions = (doc.get('booking_sessions') as Record<string, unknown>[]) ?? []
      tx.update(doc.ref, { status: 'Cancelled', booking_sessions: sessions.map((s) => ({ ...s, status: 'cancelled' })) })
    }
    const cleared = { schedule: scheduleId, seat_number: Number(seat), user: null, user_name: null, user_initials: null, reserved_at: null }
    tx.set(seatRef, cleared)
    tx.update(scheduleRef, { seats_taken: Math.max(0, (schedule.seats_taken ?? 0) - 1) })
    return { id: seatRef.id, ...cleared }
  })

  return json(released)
})
