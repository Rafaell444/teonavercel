import { z } from 'zod'

import { getCurrentUser, requireAdmin } from '@/lib/server/auth'
import { COLLECTIONS, byString, getOr404, listApi, newId, now } from '@/lib/server/data'
import { db } from '@/lib/server/firebase'
import { created, handle, json, parseBody } from '@/lib/server/http'
import { jsonObject, required, text } from '@/lib/server/validation'

export const questionSchema = z.object({
  id: z.string().optional(),
  order: z.coerce.number().int().optional(),
  question: required(2000),
  options: z.array(z.string().trim().max(500)).min(2, 'A question needs at least two options.'),
})

export const testSchema = z.object({
  title: required(200),
  description: text(5000).default(''),
  category: text(100).default('General'),
  published: z.coerce.boolean().default(false),
  course_outcomes: jsonObject.default({}),
  combination_results: jsonObject.default({}),
  questions: z.array(questionSchema).default([]),
})

/** Questions get stable ids and 1-based order; blank options are dropped. */
export function normalizeQuestions(questions: z.infer<typeof questionSchema>[]) {
  return questions.map((q, i) => ({
    id: q.id && !q.id.startsWith('q-') ? q.id : newId(),
    order: i + 1,
    question: q.question,
    options: q.options.map((o) => o.trim()).filter(Boolean),
  }))
}

const col = () => db().collection(COLLECTIONS.tests)

/** Everyone sees published tests; admins see drafts too. */
export const GET = handle(async (req) => {
  const user = await getCurrentUser(req)
  let items = await listApi(col())
  if (user?.role !== 'admin') items = items.filter((t) => t.published)
  items.sort(byString('created_at', 'desc'))
  return json(items)
})

export const POST = handle(async (req) => {
  await requireAdmin(req)
  const body = await parseBody(req, testSchema)
  const id = newId()
  const stamp = now()
  await col().doc(id).set({ ...body, questions: normalizeQuestions(body.questions), created_at: stamp, updated_at: stamp })
  return created((await getOr404(COLLECTIONS.tests, id)).data)
})
