import { requireAdmin } from '@/lib/server/auth'
import { COLLECTIONS, getOr404 } from '@/lib/server/data'
import { assertId, handle, json, noContent, type Params } from '@/lib/server/http'

type Ctx = Params<{ id: string }>

/** Admin: mark a message as read. */
export const PATCH = handle<Ctx>(async (req, { params }) => {
  await requireAdmin(req)
  const id = assertId((await params).id)
  const { ref } = await getOr404(COLLECTIONS.messages, id)
  await ref.update({ read: true })
  return json((await getOr404(COLLECTIONS.messages, id)).data)
})

export const DELETE = handle<Ctx>(async (req, { params }) => {
  await requireAdmin(req)
  const { ref } = await getOr404(COLLECTIONS.messages, assertId((await params).id))
  await ref.delete()
  return noContent()
})
