import type { DocumentReference } from 'firebase-admin/firestore'
import { z } from 'zod'

import { requireAdmin } from '@/lib/server/auth'
import { toApi } from '@/lib/server/data'
import { db } from '@/lib/server/firebase'
import { assertId, badRequest, created, handle, parseBody, type Params } from '@/lib/server/http'
import { getSessionOr404, slotId, slotSchema, slotsCol } from '@/lib/server/services/sessions'

const schema = z.object({ slots: z.array(slotSchema).min(1).max(500) })

/** Admin: create many slots at once. Slots that already exist are skipped, not duplicated. */
export const POST = handle<Params<{ id: string }>>(async (req, { params }) => {
  await requireAdmin(req)
  const id = assertId((await params).id)
  await getSessionOr404(id)
  const { slots } = await parseBody(req, schema)
  for (const s of slots) if (s.end_time <= s.start_time) throw badRequest(`End time must be after the start time (${s.date} ${s.start_time}).`)

  const col = slotsCol(id)
  const refs = slots.map((s) => col.doc(slotId(s.date, s.start_time)))
  const existing = new Set((await db().getAll(...refs)).filter((d) => d.exists).map((d) => d.id))
  const batch = db().batch()
  const createdRefs: DocumentReference[] = []
  slots.forEach((s, i) => {
    if (existing.has(refs[i].id)) return
    batch.set(refs[i], { ...s, session: id, is_booked: false, booked_by: null, booked_by_name: null })
    createdRefs.push(refs[i])
  })
  if (createdRefs.length) await batch.commit()
  const made = createdRefs.length ? await db().getAll(...createdRefs) : []
  return created(made.map((d) => toApi(d)))
})
