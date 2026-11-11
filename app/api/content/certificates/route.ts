import { z } from 'zod'

import { requireAdmin } from '@/lib/server/auth'
import { COLLECTIONS, getOr404, newId, now } from '@/lib/server/data'
import { db } from '@/lib/server/firebase'
import { created, handle, json, parseBody } from '@/lib/server/http'
import { getCertificates, invalidate, TAGS } from '@/lib/server/public-content'
import { uploadFile } from '@/lib/server/storage'
import { fileField, intField, required } from '@/lib/server/validation'

const col = () => db().collection(COLLECTIONS.certificates)

/** Public: certificates in display order (cached; see lib/server/public-content). */
export const GET = handle(async () => json(await getCertificates()))

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
  invalidate(TAGS.certificates)
  return created((await getOr404(COLLECTIONS.certificates, id)).data)
})
