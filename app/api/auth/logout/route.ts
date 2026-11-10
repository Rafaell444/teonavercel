import { clearAuthCookies, getCurrentUser, revokeAllSessions } from '@/lib/server/auth'
import { handle, json } from '@/lib/server/http'

export const POST = handle(async (req) => {
  const user = await getCurrentUser(req)
  if (user) {
    // Invalidates the refresh token on every device; the current ID token
    // expires by itself within the hour.
    await revokeAllSessions(user.id).catch(() => {})
  }
  await clearAuthCookies()
  return json({ ok: true })
})
