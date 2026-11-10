import { requireUser } from '@/lib/server/auth'
import { assertId, forbidden, handle, json, type Params } from '@/lib/server/http'
import { getBookingOr404 } from '@/lib/server/services/bookings'

/** The individual sessions inside a booking. */
export const GET = handle<Params<{ id: string }>>(async (req, { params }) => {
  const user = await requireUser(req)
  const booking = await getBookingOr404(assertId((await params).id))
  if (booking.user !== user.id && user.role !== 'admin') throw forbidden()
  return json(booking.booking_sessions ?? [])
})
