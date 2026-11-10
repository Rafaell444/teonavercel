import { requireAdmin, requireUser } from '@/lib/server/auth'
import { COLLECTIONS, compact, getOr404, now } from '@/lib/server/data'
import { assertId, handle, json, noContent, notFound, parseBody, type Params } from '@/lib/server/http'

import { normalizeQuestions, testSchema } from '../route'

type Ctx = Params<{ id: string }>

export const GET = handle<Ctx>(async (req, { params }) => {
  const user = await requireUser(req)
  const { data } = await getOr404(COLLECTIONS.tests, assertId((await params).id))
  if (!data.published && user.role !== 'admin') throw notFound()
  return json(data)
})

async function update(req: Request, id: string, partial: boolean) {
  await requireAdmin(req)
  const { ref } = await getOr404(COLLECTIONS.tests, id)
  const body = await parseBody(req, partial ? testSchema.partial() : testSchema)
  const patch: Record<string, unknown> = compact({ ...body, updated_at: now() })
  if (body.questions) patch.questions = normalizeQuestions(body.questions)
  await ref.update(patch)
  return json((await getOr404(COLLECTIONS.tests, id)).data)
}

export const PUT = handle<Ctx>(async (req, { params }) => update(req, assertId((await params).id), false))
export const PATCH = handle<Ctx>(async (req, { params }) => update(req, assertId((await params).id), true))

export const DELETE = handle<Ctx>(async (req, { params }) => {
  await requireAdmin(req)
  const { ref } = await getOr404(COLLECTIONS.tests, assertId((await params).id))
  await ref.delete()
  return noContent()
})
