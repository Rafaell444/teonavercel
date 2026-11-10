import { requireAdmin } from '@/lib/server/auth'
import { compact, toApi } from '@/lib/server/data'
import { db } from '@/lib/server/firebase'
import { assertId, handle, json, noContent, notFound, parseBody, type Params } from '@/lib/server/http'
import { scheduleSchema, schedulesCol } from '@/lib/server/services/sessions'

type Ctx = Params<{ id: string; scheduleId: string }>

async function ownedRef(params: Ctx['params']) {
  const { id, scheduleId } = await params
  const ref = schedulesCol().doc(assertId(scheduleId))
  const snap = await ref.get()
  if (!snap.exists || snap.get('session') !== assertId(id)) throw notFound('Schedule not found.')
  return ref
}

export const PATCH = handle<Ctx>(async (req, { params }) => {
  await requireAdmin(req)
  const ref = await ownedRef(params)
  const patch = compact(await parseBody(req, scheduleSchema.partial()))
  if (Object.keys(patch).length) await ref.update(patch)
  return json(toApi(await ref.get()))
})

/** Deletes the date and all of its seats. */
export const DELETE = handle<Ctx>(async (req, { params }) => {
  await requireAdmin(req)
  const ref = await ownedRef(params)
  await db().recursiveDelete(ref)
  return noContent()
})
