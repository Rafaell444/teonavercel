import { z } from 'zod'

import { requireUser, updateProfile } from '@/lib/server/auth'
import { HttpError, handle, json, parseBody } from '@/lib/server/http'
import { email } from '@/lib/server/validation'

export const GET = handle(async (req) => {
  const user = await requireUser(req)
  return json(user)
})

const patchSchema = z.object({
  name: z.string().trim().min(1).max(120).optional(),
  email: email.optional(),
})

export const PATCH = handle(async (req) => {
  const user = await requireUser(req)
  const body = await parseBody(req, patchSchema)
  try {
    const updated = await updateProfile(user.id, body)
    return json(updated)
  } catch (err) {
    if ((err as { code?: string }).code === 'auth/email-already-exists') {
      throw new HttpError(400, { email: ['A user with this email already exists.'] })
    }
    throw err
  }
})
