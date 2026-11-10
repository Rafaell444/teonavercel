import { z } from 'zod'

import { requireUser } from '@/lib/server/auth'
import { COLLECTIONS, byString, listApi, newId, now, toApi } from '@/lib/server/data'
import { db } from '@/lib/server/firebase'
import { created, handle, json, parseBody } from '@/lib/server/http'
import { isoDate, required, text } from '@/lib/server/validation'

/** Diary entries live under the member's own document: users/{uid}/diary. Only that member can read them. */
const col = (uid: string) => db().collection(COLLECTIONS.users).doc(uid).collection('diary')

export const GET = handle(async (req) => {
  const user = await requireUser(req)
  const items = await listApi(col(user.id))
  items.sort((a, b) => byString<Record<string, unknown>>('date', 'desc')(a, b) || byString<Record<string, unknown>>('created_at', 'desc')(a, b))
  return json(items)
})

const createSchema = z.object({
  date: isoDate,
  title: required(200),
  excerpt: required(5000),
  mood: text(50).default(''),
})

export const POST = handle(async (req) => {
  const user = await requireUser(req)
  const body = await parseBody(req, createSchema)
  const id = newId()
  const ref = col(user.id).doc(id)
  await ref.set({ ...body, user: user.id, created_at: now() })
  return created(toApi(await ref.get()))
})
