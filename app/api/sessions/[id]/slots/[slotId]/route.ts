import { z } from 'zod'

import { requireAdmin } from '@/lib/server/auth'
import { compact, toApi } from '@/lib/server/data'
import { assertId, handle, json, noContent, notFound, parseBody, type Params } from '@/lib/server/http'
import { slotsCol } from '@/lib/server/services/sessions'

type Ctx = Params<{ id: string; slotId: string }>

const patchSchema = z.object({ is_blocked: z.coerce.boolean().optional() })

/** Admin: block / unblock a slot. */
export const PATCH = handle<Ctx>(async (req, { params }) => {
  await requireAdmin(req)
  const { id, slotId } = await params
  const ref = slotsCol(assertId(id)).doc(assertId(slotId))
  if (!(await ref.get()).exists) throw notFound()
  const patch = compact(await parseBody(req, patchSchema))
  if (Object.keys(patch).length) await ref.update(patch)
  return json(toApi(await ref.get()))
})

export const DELETE = handle<Ctx>(async (req, { params }) => {
  await requireAdmin(req)
  const { id, slotId } = await params
  const ref = slotsCol(assertId(id)).doc(assertId(slotId))
  if (!(await ref.get()).exists) throw notFound()
  await ref.delete()
  return noContent()
})
