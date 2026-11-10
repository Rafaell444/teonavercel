import { z } from 'zod'

import { getProfile, requireAdmin, updateProfile } from '@/lib/server/auth'
import { assertId, handle, json, notFound, parseBody, type Params } from '@/lib/server/http'

const schema = z.object({ amount: z.coerce.number().int('amount must be an integer.') })

/** Admin: add (or subtract) XP; the tier follows automatically. */
export const POST = handle<Params<{ id: string }>>(async (req, { params }) => {
  await requireAdmin(req)
  const id = assertId((await params).id)
  const { amount } = await parseBody(req, schema)
  const user = await getProfile(id)
  if (!user) throw notFound()
  const updated = await updateProfile(id, { xp: Math.max(0, user.xp + amount) })
  return json(updated)
})
