import { requireAdmin } from '@/lib/server/auth'
import { COLLECTIONS, getOr404 } from '@/lib/server/data'
import { assertId, handle, noContent, type Params } from '@/lib/server/http'
import { deleteFile } from '@/lib/server/storage'

export const DELETE = handle<Params<{ id: string }>>(async (req, { params }) => {
  await requireAdmin(req)
  const { ref, data } = await getOr404(COLLECTIONS.vault, assertId((await params).id))
  await ref.delete()
  await deleteFile(data.file_url as string | null)
  return noContent()
})
