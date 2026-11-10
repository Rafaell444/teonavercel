import { requireAdmin } from '@/lib/server/auth'
import { byDateTime, listApi, newId, toApi } from '@/lib/server/data'
import { db } from '@/lib/server/firebase'
import { assertId, created, handle, json, parseBody, type Params } from '@/lib/server/http'
import { getSessionOr404, scheduleSchema, schedulesCol, seatsCol } from '@/lib/server/services/sessions'

type Ctx = Params<{ id: string }>

/** Public: dates for a group session. */
export const GET = handle<Ctx>(async (req, { params }) => {
  const id = assertId((await params).id)
  const items = await listApi(schedulesCol().where('session', '==', id))
  items.sort(byDateTime)
  return json(items)
})

/** Admin: add a date; one seat document per place is created with it. */
export const POST = handle<Ctx>(async (req, { params }) => {
  await requireAdmin(req)
  const id = assertId((await params).id)
  const session = await getSessionOr404(id)
  const body = await parseBody(req, scheduleSchema)
  const scheduleId = newId()
  const ref = schedulesCol().doc(scheduleId)
  const batch = db().batch()
  batch.set(ref, { ...body, session: id, seats_total: session.max_seats, seats_taken: 0 })
  for (let n = 1; n <= session.max_seats; n++) {
    batch.set(seatsCol(scheduleId).doc(String(n)), {
      schedule: scheduleId,
      seat_number: n,
      user: null,
      user_name: null,
      user_initials: null,
      reserved_at: null,
    })
  }
  await batch.commit()
  return created(toApi(await ref.get()))
})
