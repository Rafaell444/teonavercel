import { z } from 'zod'

import { login, setAuthCookies } from '@/lib/server/auth'
import { handle, json, parseBody } from '@/lib/server/http'

const schema = z.object({
  email: z.string().trim().min(1, 'Email is required.'),
  password: z.string().min(1, 'Password is required.'),
})

export const POST = handle(async (req) => {
  const { email, password } = await parseBody(req, schema)
  const session = await login(email, password)
  await setAuthCookies(session)
  return json({ user: session.user, access: session.access })
})
