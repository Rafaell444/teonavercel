import { requireAdmin } from '@/lib/server/auth'
import { COLLECTIONS, compact, getOr404 } from '@/lib/server/data'
import { assertId, handle, json, noContent, parseBody, type Params } from '@/lib/server/http'
import { invalidate, TAGS } from '@/lib/server/public-content'
import { packageSchema, presentPackages } from '@/lib/server/services/sessions'

type Ctx = Params<{ id: string }>

export const PATCH = handle<Ctx>(async (req, { params }) => {
  await requireAdmin(req)
  const id = assertId((await params).id)
  const { ref } = await getOr404(COLLECTIONS.packages, id)
  const patch = compact(await parseBody(req, packageSchema.partial()))
  if (Object.keys(patch).length) await ref.update(patch)
  invalidate(TAGS.packages)
  const [item] = await presentPackages([(await getOr404(COLLECTIONS.packages, id)).data])
  return json(item)
})

export const DELETE = handle<Ctx>(async (req, { params }) => {
  await requireAdmin(req)
  const { ref } = await getOr404(COLLECTIONS.packages, assertId((await params).id))
  await ref.delete()
  invalidate(TAGS.packages)
  return noContent()
})
