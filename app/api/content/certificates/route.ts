import { z } from 'zod'

import { requireAdmin } from '@/lib/server/auth'
import { COLLECTIONS, byNumber, getOr404, listApi, newId, now } from '@/lib/server/data'
import { db } from '@/lib/server/firebase'
import { created, handle, json, parseBody } from '@/lib/server/http'
import { uploadFile } from '@/lib/server/storage'
import { fileField, intField, required } from '@/lib/server/validation'

const col = () => db().collection(COLLECTIONS.certificates)

export const GET = handle(async () => {
  const items = await listApi(col())
  items.sort(byNumber('order'))
  return json(items)
})

const createSchema = z.object({
  title: required(200),
  image: fileField,
  order: intField.min(0).default(0),
})

/** Admin: upload a certificate image (multipart form). */
export const POST = handle(async (req) => {
  await requireAdmin(req)
  const body = await parseBody(req, createSchema)
  const image = await uploadFile(body.image, 'certificates', { imagesOnly: true })
  const id = newId()
  await col().doc(id).set({ title: body.title, image, order: body.order, created_at: now() })
  return created((await getOr404(COLLECTIONS.certificates, id)).data)
})
