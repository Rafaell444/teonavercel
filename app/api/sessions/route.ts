import { requireAdmin } from '@/lib/server/auth'
import { COLLECTIONS, byString, getOr404, listApi, newId, now } from '@/lib/server/data'
import { created, handle, json, parseBody, query } from '@/lib/server/http'
import { sessionSchema, sessionsCol } from '@/lib/server/services/sessions'

/** Public: active sessions, optionally ?type=group|individual. */
export const GET = handle(async (req) => {
  const type = query(req).get('type')
  let items = await listApi(sessionsCol().where('is_active', '==', true))
  if (type === 'group' || type === 'individual') items = items.filter((s) => s.session_type === type)
  items.sort(byString('created_at', 'desc'))
  return json(items)
})

export const POST = handle(async (req) => {
  await requireAdmin(req)
  const body = await parseBody(req, sessionSchema)
  const id = newId()
  await sessionsCol().doc(id).set({ ...body, created_at: now() })
  return created((await getOr404(COLLECTIONS.sessions, id)).data)
})
