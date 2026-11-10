import { requireAdmin, toProfile } from '@/lib/server/auth'
import { COLLECTIONS } from '@/lib/server/data'
import { db } from '@/lib/server/firebase'
import { handle, json, query } from '@/lib/server/http'

/** Admin: list members. Supports ?role= ?tier= ?search= like the old API. */
export const GET = handle(async (req) => {
  await requireAdmin(req)
  const q = query(req)
  const role = q.get('role')
  const tier = q.get('tier')
  const search = q.get('search')?.toLowerCase().trim()

  const snap = await db().collection(COLLECTIONS.users).get()
  let users = snap.docs
    .map((d) => toProfile(d.id, d.data() as Parameters<typeof toProfile>[1]))
    .filter((u) => u.is_active)
  if (role) users = users.filter((u) => u.role === role)
  if (tier) users = users.filter((u) => u.tier === tier)
  if (search) users = users.filter((u) => u.name.toLowerCase().includes(search) || u.email.toLowerCase().includes(search))
  users.sort((a, b) => a.name.localeCompare(b.name))
  return json(users)
})
