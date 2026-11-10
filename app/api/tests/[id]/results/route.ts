import { requireAdmin } from '@/lib/server/auth'
import { COLLECTIONS, byString, getOr404, listApi } from '@/lib/server/data'
import { db } from '@/lib/server/firebase'
import { assertId, handle, json, type Params } from '@/lib/server/http'

/** Admin: everyone's results for one test. */
export const GET = handle<Params<{ id: string }>>(async (req, { params }) => {
  await requireAdmin(req)
  const id = assertId((await params).id)
  await getOr404(COLLECTIONS.tests, id)
  const items = await listApi(db().collection(COLLECTIONS.testResults).where('test', '==', id))
  items.sort(byString('completed_at', 'desc'))
  return json(items)
})
