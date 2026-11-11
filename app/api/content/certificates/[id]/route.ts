import { requireAdmin } from '@/lib/server/auth'
import { COLLECTIONS, getOr404 } from '@/lib/server/data'
import { assertId, handle, noContent, type Params } from '@/lib/server/http'
import { invalidate, TAGS } from '@/lib/server/public-content'
import { deleteFile } from '@/lib/server/storage'

export const DELETE = handle<Params<{ id: string }>>(async (req, { params }) => {
  await requireAdmin(req)
  const { ref, data } = await getOr404(COLLECTIONS.certificates, assertId((await params).id))
  await ref.delete()
  invalidate(TAGS.certificates)
  await deleteFile(data.image as string)
  return noContent()
})
