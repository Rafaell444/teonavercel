import { requireAdmin } from '@/lib/server/auth'
import { COLLECTIONS, getOr404 } from '@/lib/server/data'
import { assertId, handle, noContent, type Params } from '@/lib/server/http'

export const DELETE = handle<Params<{ id: string }>>(async (req, { params }) => {
  await requireAdmin(req)
  const { ref } = await getOr404(COLLECTIONS.consultationSlots, assertId((await params).id))
  await ref.delete()
  return noContent()
})
