import { z } from 'zod'

import { TIERS, getProfile, requireAdmin, updateProfile } from '@/lib/server/auth'
import { COLLECTIONS } from '@/lib/server/data'
import { auth, db } from '@/lib/server/firebase'
import { assertId, badRequest, handle, json, noContent, notFound, parseBody, type Params } from '@/lib/server/http'

type Ctx = Params<{ id: string }>

export const GET = handle<Ctx>(async (req, { params }) => {
  await requireAdmin(req)
  const user = await getProfile(assertId((await params).id))
  if (!user) throw notFound()
  return json(user)
})

const patchSchema = z.object({
  tier: z.enum(TIERS).optional(),
  xp: z.coerce.number().int().min(0).optional(),
  vouchers: z.coerce.number().int().min(0).optional(),
  role: z.enum(['admin', 'member']).optional(),
})

export const PATCH = handle<Ctx>(async (req, { params }) => {
  const admin = await requireAdmin(req)
  const id = assertId((await params).id)
  const body = await parseBody(req, patchSchema)
  if (id === admin.id && body.role === 'member') throw badRequest('You cannot remove your own admin role.')
  const updated = await updateProfile(id, body)
  if (!updated) throw notFound()
  return json(updated)
})

export const DELETE = handle<Ctx>(async (req, { params }) => {
  const admin = await requireAdmin(req)
  const id = assertId((await params).id)
  if (id === admin.id) throw badRequest('You cannot delete your own account.')
  const ref = db().collection(COLLECTIONS.users).doc(id)
  if (!(await ref.get()).exists) throw notFound()
  await Promise.all([
    ref.delete(),
    auth().deleteUser(id).catch((err: { code?: string }) => {
      if (err.code !== 'auth/user-not-found') throw err
    }),
  ])
  return noContent()
})
