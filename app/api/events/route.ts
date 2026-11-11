import { z } from 'zod'

import { requireAdmin } from '@/lib/server/auth'
import { COLLECTIONS, getOr404, newId, now } from '@/lib/server/data'
import { db } from '@/lib/server/firebase'
import { created, handle, json, parseBody } from '@/lib/server/http'
import { getEvents, invalidate, TAGS } from '@/lib/server/public-content'
import { uploadFile } from '@/lib/server/storage'
import { fileField, required, text } from '@/lib/server/validation'

const col = () => db().collection(COLLECTIONS.events)

export const eventSchema = z.object({
  title: required(200),
  type: required(100),
  date: text(50).default(''),
  location: text(200).default(''),
  seats: text(100).default(''),
  image: fileField.optional(),
})

/** Public: events, newest first (cached; see lib/server/public-content). */
export const GET = handle(async () => json(await getEvents()))

/** Admin: create an event (multipart form, optional image). */
export const POST = handle(async (req) => {
  await requireAdmin(req)
  const { image, ...fields } = await parseBody(req, eventSchema)
  const id = newId()
  await col().doc(id).set({
    ...fields,
    image: image ? await uploadFile(image, 'events', { imagesOnly: true }) : null,
    created_at: now(),
  })
  invalidate(TAGS.events)
  return created((await getOr404(COLLECTIONS.events, id)).data)
})
