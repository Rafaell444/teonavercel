import { z } from 'zod'

import { requireAdmin } from '@/lib/server/auth'
import { COLLECTIONS, byString, getOr404, listApi, newId, now } from '@/lib/server/data'
import { db } from '@/lib/server/firebase'
import { created, handle, json, parseBody, query } from '@/lib/server/http'
import { notifyAdminNewMessage } from '@/lib/server/notifications'
import { email, required } from '@/lib/server/validation'

const col = () => db().collection(COLLECTIONS.messages)

/** Admin: inbox, optionally filtered with ?read=true|false. */
export const GET = handle(async (req) => {
  await requireAdmin(req)
  const read = query(req).get('read')
  let items = await listApi(col())
  if (read !== null) {
    const wanted = read === 'true' || read === '1'
    items = items.filter((m) => Boolean(m.read) === wanted)
  }
  items.sort(byString('created_at', 'desc'))
  return json(items)
})

const createSchema = z.object({
  name: required(120),
  email,
  subject: required(200),
  message: required(5000),
})

/** Public: the contact form. */
export const POST = handle(async (req) => {
  const body = await parseBody(req, createSchema)
  const id = newId()
  await col().doc(id).set({ ...body, read: false, created_at: now() })
  await notifyAdminNewMessage(body)
  return created((await getOr404(COLLECTIONS.messages, id)).data)
})
