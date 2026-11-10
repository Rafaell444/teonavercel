import { requireAdmin } from '@/lib/server/auth'
import { COLLECTIONS, byString, listApi } from '@/lib/server/data'
import { db } from '@/lib/server/firebase'
import { handle, json } from '@/lib/server/http'

/** Admin: every consultation booking. */
export const GET = handle(async (req) => {
  await requireAdmin(req)
  const items = await listApi(db().collection(COLLECTIONS.consultationBookings))
  items.sort(byString('created_at', 'desc'))
  return json(items)
})
