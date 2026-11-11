import { requireAdmin } from '@/lib/server/auth'
import { COLLECTIONS, getOr404, newId, now } from '@/lib/server/data'
import { created, handle, json, parseBody, query } from '@/lib/server/http'
import { getActiveSessions, invalidate, sessionsOfType, TAGS } from '@/lib/server/public-content'
import { sessionSchema, sessionsCol } from '@/lib/server/services/sessions'

/** Public: active sessions, optionally ?type=group|individual (cached). */
export const GET = handle(async (req) => json(sessionsOfType(await getActiveSessions(), query(req).get('type'))))

export const POST = handle(async (req) => {
  await requireAdmin(req)
  const body = await parseBody(req, sessionSchema)
  const id = newId()
  await sessionsCol().doc(id).set({ ...body, created_at: now() })
  invalidate(TAGS.sessions)
  return created((await getOr404(COLLECTIONS.sessions, id)).data)
})
