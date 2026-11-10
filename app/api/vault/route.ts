import { z } from 'zod'

import { getProfile, requireAdmin, requireUser } from '@/lib/server/auth'
import { COLLECTIONS, byString, getOr404, listApi, newId, now } from '@/lib/server/data'
import { db } from '@/lib/server/firebase'
import { badRequest, created, handle, json, parseBody } from '@/lib/server/http'
import { uploadFile } from '@/lib/server/storage'
import { fileField, required, text, uuidLike } from '@/lib/server/validation'

const col = () => db().collection(COLLECTIONS.vault)

/** Members see shared items plus the ones assigned to them; admins see all. */
export const GET = handle(async (req) => {
  const user = await requireUser(req)
  let items
  if (user.role === 'admin') {
    items = await listApi(col())
  } else {
    const [shared, mine] = await Promise.all([
      listApi(col().where('assigned_to_id', '==', null)),
      listApi(col().where('assigned_to_id', '==', user.id)),
    ])
    items = [...mine, ...shared]
  }
  items.sort(byString('created_at', 'desc'))
  return json(items)
})

const createSchema = z.object({
  title: required(200),
  kind: text(100).default(''),
  category: z.enum(['Test', 'Book', 'Resource']),
  locked: z.preprocess((v) => v === 'true' || v === true, z.boolean()).default(false),
  assigned_to: uuidLike.optional(),
  file: fileField.optional(),
})

/** Admin: upload a resource (multipart form), optionally to one member's private vault. */
export const POST = handle(async (req) => {
  const admin = await requireAdmin(req)
  const body = await parseBody(req, createSchema)
  let assignedName: string | null = null
  if (body.assigned_to) {
    const member = await getProfile(body.assigned_to)
    if (!member) throw badRequest('The selected member does not exist.')
    assignedName = member.name || member.email
  }
  const id = newId()
  await col().doc(id).set({
    title: body.title,
    kind: body.kind,
    category: body.category,
    locked: body.locked,
    file_url: body.file ? await uploadFile(body.file, 'vault') : null,
    added_by_id: admin.id,
    added_by_name: admin.name,
    assigned_to_id: body.assigned_to ?? null,
    assigned_to_name: assignedName,
    created_at: now(),
  })
  return created((await getOr404(COLLECTIONS.vault, id)).data)
})
