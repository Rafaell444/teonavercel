import { requireAdmin } from '@/lib/server/auth'
import { COLLECTIONS, compact, getOr404 } from '@/lib/server/data'
import { assertId, handle, json, noContent, parseBody, type Params } from '@/lib/server/http'
import { invalidate, TAGS } from '@/lib/server/public-content'
import { deleteFile, uploadFile } from '@/lib/server/storage'

import { eventSchema } from '../route'

type Ctx = Params<{ id: string }>

export const PATCH = handle<Ctx>(async (req, { params }) => {
  await requireAdmin(req)
  const id = assertId((await params).id)
  const { ref, data } = await getOr404(COLLECTIONS.events, id)
  const { image, ...fields } = await parseBody(req, eventSchema.partial())
  const patch: Record<string, unknown> = compact(fields)
  if (image) {
    patch.image = await uploadFile(image, 'events', { imagesOnly: true })
    await deleteFile(data.image as string | null)
  }
  if (Object.keys(patch).length) await ref.update(patch)
  invalidate(TAGS.events)
  return json((await getOr404(COLLECTIONS.events, id)).data)
})

export const DELETE = handle<Ctx>(async (req, { params }) => {
  await requireAdmin(req)
  const { ref, data } = await getOr404(COLLECTIONS.events, assertId((await params).id))
  await ref.delete()
  invalidate(TAGS.events)
  await deleteFile(data.image as string | null)
  return noContent()
})
