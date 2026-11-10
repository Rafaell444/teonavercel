import { requireAdmin } from '@/lib/server/auth'
import { COLLECTIONS, byString, getOr404, listApi, newId, now } from '@/lib/server/data'
import { created, handle, json, parseBody } from '@/lib/server/http'
import { packageSchema, packagesCol, presentPackages } from '@/lib/server/services/sessions'

/** Public: active packages with their sessions. */
export const GET = handle(async () => {
  const items = await listApi(packagesCol().where('is_active', '==', true))
  items.sort(byString('created_at', 'desc'))
  return json(await presentPackages(items))
})

export const POST = handle(async (req) => {
  await requireAdmin(req)
  const body = await parseBody(req, packageSchema)
  const id = newId()
  await packagesCol().doc(id).set({ ...body, created_at: now() })
  const [item] = await presentPackages([(await getOr404(COLLECTIONS.packages, id)).data])
  return created(item)
})
