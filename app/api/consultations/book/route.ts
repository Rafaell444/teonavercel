import { z } from 'zod'

import { requireUser } from '@/lib/server/auth'
import { COLLECTIONS, generateMeetLink, newId, now, plain } from '@/lib/server/data'
import { db } from '@/lib/server/firebase'
import { badRequest, created, handle, parseBody } from '@/lib/server/http'
import { uuidLike } from '@/lib/server/validation'

const schema = z.object({ slot_id: uuidLike })

/** Member: book a free consultation slot. A transaction makes sure it is booked once. */
export const POST = handle(async (req) => {
  const user = await requireUser(req)
  const { slot_id } = await parseBody(req, schema)
  const firestore = db()
  const slotRef = firestore.collection(COLLECTIONS.consultationSlots).doc(slot_id)
  const bookingRef = firestore.collection(COLLECTIONS.consultationBookings).doc(newId())

  const booking = await firestore.runTransaction(async (tx) => {
    const slot = (await tx.get(slotRef)).data()
    if (!slot || slot.is_booked) throw badRequest('Slot is not available.')
    const meetLink = generateMeetLink()
    const record = {
      user: user.id,
      user_name: user.name,
      user_email: user.email,
      slot: slot_id,
      date: slot.date,
      start_time: slot.start_time,
      end_time: slot.end_time,
      meet_link: meetLink,
      status: 'confirmed',
      created_at: now(),
    }
    tx.update(slotRef, { is_booked: true, booked_by: user.id, booked_by_name: user.name })
    tx.set(bookingRef, record)
    return { id: bookingRef.id, ...record }
  })

  return created(plain(booking))
})
