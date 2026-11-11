import { requireAdmin } from '@/lib/server/auth'
import { COLLECTIONS, getOr404, newId, now } from '@/lib/server/data'
import { created, handle, json, parseBody } from '@/lib/server/http'
import { getActivePackages, invalidate, TAGS } from '@/lib/server/public-content'
import { packageSchema, packagesCol, presentPackages } from '@/lib/server/services/sessions'

/** Public: active packages with their sessions (cached). */
export const GET = handle(async () => json(await getActivePackages()))

export const POST = handle(async (req) => {
  await requireAdmin(req)
  const body = await parseBody(req, packageSchema)
  const id = newId()
  await packagesCol().doc(id).set({ ...body, created_at: now() })
  invalidate(TAGS.packages)
  const [item] = await presentPackages([(await getOr404(COLLECTIONS.packages, id)).data])
  return created(item)
})
