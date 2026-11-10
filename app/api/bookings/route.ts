import { z } from 'zod'

import { requireUser } from '@/lib/server/auth'
import { COLLECTIONS, byString, listApi } from '@/lib/server/data'
import { db } from '@/lib/server/firebase'
import { created, handle, json, parseBody } from '@/lib/server/http'
import { createIndividualBooking, presentBooking, type BookingDoc } from '@/lib/server/services/bookings'
import { text, uuidLike } from '@/lib/server/validation'

/** Members see their bookings; admins see everyone's. */
export const GET = handle(async (req) => {
  const user = await requireUser(req)
  const col = db().collection(COLLECTIONS.bookings)
  const items = (await listApi<Omit<BookingDoc, 'id'>>(user.role === 'admin' ? col : col.where('user', '==', user.id))) as BookingDoc[]
  items.sort(byString('created_at', 'desc'))
  return json(items.map(presentBooking))
})

const createSchema = z.object({
  session_id: uuidLike,
  date: text(50).optional(),
  time: text(20).optional(),
  time_slot_id: uuidLike.optional(),
  format: z.enum(['online', 'offline']).default('online'),
  session_language: z.enum(['ka', 'en']).default('ka'),
  num_sessions: z.coerce.number().int().min(1).max(50).default(3),
  is_package: z.coerce.boolean().default(false),
  package_duration_months: z.coerce.number().int().min(1).max(36).optional().nullable(),
  voucher_code: text(50).optional(),
  // sent by older clients; the discount is always recomputed on the server
  discount_amount: z.unknown().optional(),
})

export const POST = handle(async (req) => {
  const user = await requireUser(req)
  const body = await parseBody(req, createSchema)
  const booking = await createIndividualBooking({
    user,
    sessionId: body.session_id,
    numSessions: body.num_sessions,
    format: body.format,
    sessionLanguage: body.session_language,
    date: body.date,
    time: body.time,
    timeSlotId: body.time_slot_id,
    isPackage: body.is_package,
    packageDurationMonths: body.package_duration_months ?? null,
    voucherCode: body.voucher_code,
  })
  return created(presentBooking(booking))
})
