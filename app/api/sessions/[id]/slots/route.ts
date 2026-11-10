import { requireAdmin } from '@/lib/server/auth'
import { toApi } from '@/lib/server/data'
import { assertId, badRequest, conflict, created, handle, json, parseBody, query, type Params } from '@/lib/server/http'
import { getSessionOr404, listSlots, slotId, slotSchema, slotsCol } from '@/lib/server/services/sessions'

type Ctx = Params<{ id: string }>

/** Public: free upcoming slots; admins pass ?all=true for every slot. */
export const GET = handle<Ctx>(async (req, { params }) => {
  const id = assertId((await params).id)
  await getSessionOr404(id)
  return json(await listSlots(id, { all: query(req).get('all') === 'true' }))
})

export const POST = handle<Ctx>(async (req, { params }) => {
  await requireAdmin(req)
  const id = assertId((await params).id)
  await getSessionOr404(id)
  const body = await parseBody(req, slotSchema)
  if (body.end_time <= body.start_time) throw badRequest('End time must be after the start time.')
  const ref = slotsCol(id).doc(slotId(body.date, body.start_time))
  if ((await ref.get()).exists) throw conflict('A slot already exists at that date and time.')
  await ref.set({ ...body, session: id, is_booked: false, booked_by: null, booked_by_name: null })
  return created(toApi(await ref.get()))
})
