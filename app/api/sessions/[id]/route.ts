import { requireAdmin } from '@/lib/server/auth'
import { COLLECTIONS, compact, getOr404 } from '@/lib/server/data'
import { db } from '@/lib/server/firebase'
import { assertId, handle, json, noContent, parseBody, type Params } from '@/lib/server/http'
import { schedulesCol, sessionSchema, slotsCol } from '@/lib/server/services/sessions'

type Ctx = Params<{ id: string }>

export const GET = handle<Ctx>(async (req, { params }) => {
  await requireAdmin(req)
  return json((await getOr404(COLLECTIONS.sessions, assertId((await params).id))).data)
})

export const PATCH = handle<Ctx>(async (req, { params }) => {
  await requireAdmin(req)
  const id = assertId((await params).id)
  const { ref } = await getOr404(COLLECTIONS.sessions, id)
  const patch = compact(await parseBody(req, sessionSchema.partial()))
  if (Object.keys(patch).length) await ref.update(patch)
  return json((await getOr404(COLLECTIONS.sessions, id)).data)
})

/** Deletes the session with its time slots and group schedules (seats included). */
export const DELETE = handle<Ctx>(async (req, { params }) => {
  await requireAdmin(req)
  const id = assertId((await params).id)
  const { ref } = await getOr404(COLLECTIONS.sessions, id)
  const firestore = db()
  const schedules = await schedulesCol().where('session', '==', id).get()
  await Promise.all([
    firestore.recursiveDelete(slotsCol(id)),
    ...schedules.docs.map((d) => firestore.recursiveDelete(d.ref)),
  ])
  await ref.delete()
  return noContent()
})
