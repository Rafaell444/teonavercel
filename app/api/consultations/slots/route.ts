import { z } from 'zod'

import { getCurrentUser, requireAdmin } from '@/lib/server/auth'
import { COLLECTIONS, byDateTime, listApi, now, todayIso } from '@/lib/server/data'
import { db } from '@/lib/server/firebase'
import { badRequest, conflict, created, handle, json, parseBody } from '@/lib/server/http'
import { clockTime, isoDate } from '@/lib/server/validation'

const col = () => db().collection(COLLECTIONS.consultationSlots)

/** Public: free upcoming slots. Admins get every slot, including who booked it. */
export const GET = handle(async (req) => {
  const user = await getCurrentUser(req)
  let items = await listApi<{ date: string; is_booked: boolean; booked_by?: string | null; booked_by_name?: string | null }>(col())
  items.sort(byDateTime)
  if (user?.role === 'admin') return json(items)
  const today = todayIso()
  return json(
    items
      .filter((s) => !s.is_booked && s.date >= today)
      .map(({ booked_by: _b, booked_by_name: _n, ...rest }) => rest),
  )
})

const createSchema = z.object({ date: isoDate, start_time: clockTime, end_time: clockTime })

/** Admin: open a consultation slot. The id encodes date+time, so duplicates are impossible. */
export const POST = handle(async (req) => {
  await requireAdmin(req)
  const body = await parseBody(req, createSchema)
  if (body.end_time <= body.start_time) throw badRequest('End time must be after the start time.')
  const id = `${body.date}_${body.start_time.replace(/:/g, '')}`
  const ref = col().doc(id)
  if ((await ref.get()).exists) throw conflict('A slot already exists at that date and time.')
  await ref.set({ ...body, is_booked: false, booked_by: null, booked_by_name: null, created_at: now() })
  return created({ id, ...body, is_booked: false })
})
