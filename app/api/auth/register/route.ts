import { z } from 'zod'

import { register, setAuthCookies } from '@/lib/server/auth'
import { created, handle, parseBody } from '@/lib/server/http'
import { email } from '@/lib/server/validation'

const schema = z.object({
  name: z.string().trim().min(1, 'Name is required.').max(120),
  email,
  password: z.string().min(6, 'Password must be at least 6 characters.').max(200),
})

export const POST = handle(async (req) => {
  const body = await parseBody(req, schema)
  const session = await register(body.name, body.email, body.password)
  await setAuthCookies(session)
  return created({ user: session.user, access: session.access })
})
