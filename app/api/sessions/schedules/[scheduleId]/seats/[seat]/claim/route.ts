import { paymentsEnabled } from '@/lib/config'
import { requireUser } from '@/lib/server/auth'
import { COLLECTIONS, displayDate, generateMeetLink, initialsOf, now, plain, toApi } from '@/lib/server/data'
import { db } from '@/lib/server/firebase'
import { assertId, badRequest, conflict, created, handle, notFound, type Params } from '@/lib/server/http'
import { notifyBookingCreated } from '@/lib/server/notifications'
import { bookingForNotify, buildBooking, presentBooking, type SessionDoc } from '@/lib/server/services/bookings'
import { schedulesCol, seatsCol, type ScheduleDoc } from '@/lib/server/services/sessions'

type Ctx = Params<{ scheduleId: string; seat: string }>

/**
 * Member: take a seat at a group date. One transaction checks the seat is
 * still free and that the member has no other seat at this date, then
 * reserves it and creates the confirmed booking.
 */
export const POST = handle<Ctx>(async (req, { params }) => {
  const user = await requireUser(req)
  const { scheduleId, seat } = await params
  const seatNumber = Number(seat)
  if (!Number.isInteger(seatNumber) || seatNumber < 1) throw notFound('Seat not found.')
  const firestore = db()
  const scheduleRef = schedulesCol().doc(assertId(scheduleId))
  const seatRef = seatsCol(scheduleId).doc(String(seatNumber))

  const result = await firestore.runTransaction(async (tx) => {
    const [scheduleSnap, seatSnap, mine] = await Promise.all([
      tx.get(scheduleRef),
      tx.get(seatRef),
      tx.get(seatsCol(scheduleId).where('user', '==', user.id).limit(1)),
    ])
    const schedule = toApi<Omit<ScheduleDoc, 'id'>>(scheduleSnap) as ScheduleDoc | null
    if (!schedule) throw notFound('Schedule not found.')
    if (!seatSnap.exists) throw notFound('Seat not found.')
    if (seatSnap.get('user')) throw conflict('Seat already taken.')
    if (!mine.empty) throw conflict('You already have a seat for this session.')

    const session = toApi<Omit<SessionDoc, 'id'>>(await tx.get(firestore.collection(COLLECTIONS.sessions).doc(schedule.session))) as SessionDoc | null
    if (!session || !session.is_active) throw badRequest('This session is not available.')

    const time = String(schedule.start_time).slice(0, 5)
    const meetLink = schedule.format === 'online' ? generateMeetLink() : ''
    const built = buildBooking({
      user,
      session,
      numSessions: 1,
      format: schedule.format,
      sessionLanguage: session.language === 'en' ? 'en' : 'ka',
      date: displayDate(schedule.date),
      time,
      isPackage: false,
      packageDurationMonths: null,
      total: session.price,
      discountAmount: 0,
      voucherCode: '',
      // Without online payment the seat is held and the coach confirms the booking
      status: paymentsEnabled ? 'Confirmed' : 'Pending',
      firstSession: { timeSlot: null, date: schedule.date, time, meetLink },
    })

    const seatData = {
      schedule: scheduleId,
      seat_number: seatNumber,
      user: user.id,
      user_name: user.name || user.email,
      user_initials: initialsOf(user.name, user.email),
      reserved_at: now(),
    }
    tx.set(built.ref, built.doc)
    tx.set(seatRef, seatData)
    tx.update(scheduleRef, { seats_taken: (schedule.seats_taken ?? 0) + 1 })
    return { seat: { id: seatRef.id, ...plain(seatData) }, booking: presentBooking(built.api) }
  })

  await notifyBookingCreated(bookingForNotify(result.booking))
  return created(result)
})
