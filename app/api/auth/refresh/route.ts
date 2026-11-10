import { cookies } from 'next/headers'

import { REFRESH_COOKIE, clearAuthCookies, refreshSession, setAuthCookies } from '@/lib/server/auth'
import { handle, json } from '@/lib/server/http'

export const POST = handle(async () => {
  const token = (await cookies()).get(REFRESH_COOKIE)?.value
  if (!token) return json({ detail: 'No refresh token' }, 401)
  const tokens = await refreshSession(token)
  if (!tokens) {
    await clearAuthCookies()
    return json({ detail: 'Session expired. Please log in again.' }, 401)
  }
  await setAuthCookies(tokens)
  return json({ access: tokens.access })
})
