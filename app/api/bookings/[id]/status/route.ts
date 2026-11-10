import { z } from 'zod'

import { requireAdmin } from '@/lib/server/auth'
import { COLLECTIONS } from '@/lib/server/data'
import { db } from '@/lib/server/firebase'
import { assertId, handle, json, parseBody, type Params } from '@/lib/server/http'
import { getBookingOr404, presentBooking } from '@/lib/server/services/bookings'

const schema = z.object({ status: z.enum(['Confirmed', 'Pending', 'Cancelled', 'Expired']) })

/** Admin: change a booking's status. */
export const PATCH = handle<Params<{ id: string }>>(async (req, { params }) => {
  await requireAdmin(req)
  const id = assertId((await params).id)
  await getBookingOr404(id)
  const { status } = await parseBody(req, schema)
  await db().collection(COLLECTIONS.bookings).doc(id).update({ status })
  return json(presentBooking(await getBookingOr404(id)))
})
