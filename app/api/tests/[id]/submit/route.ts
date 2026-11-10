import { z } from 'zod'

import { requireUser } from '@/lib/server/auth'
import { COLLECTIONS, getOr404, newId, now, toApi } from '@/lib/server/data'
import { db } from '@/lib/server/firebase'
import { assertId, created, handle, notFound, parseBody, type Params } from '@/lib/server/http'

const schema = z.object({
  /** question id -> chosen option index */
  answers: z.record(z.string(), z.coerce.number().int().min(0)),
})

interface TestDoc {
  published: boolean
  title: string
  questions: { id: string; order: number }[]
  combination_results: Record<string, string>
  course_outcomes: Record<string, string>
}

/** Member: submit answers; the recommendation comes from the admin's answer-combination table. */
export const POST = handle<Params<{ id: string }>>(async (req, { params }) => {
  const user = await requireUser(req)
  const id = assertId((await params).id)
  const { data: test } = await getOr404<TestDoc>(COLLECTIONS.tests, id)
  if (!test.published) throw notFound()
  const { answers } = await parseBody(req, schema)

  const questions = [...(test.questions ?? [])].sort((a, b) => a.order - b.order)
  const comboKey = questions.map((q) => (answers[String(q.id)] ?? 0).toString()).join(',')
  const recommendedCourse = test.combination_results?.[comboKey] ?? ''
  const recommendationWhy = recommendedCourse ? (test.course_outcomes?.[recommendedCourse] ?? '') : ''

  const ref = db().collection(COLLECTIONS.testResults).doc(newId())
  await ref.set({
    user: user.id,
    user_email: user.email,
    test: id,
    test_title: test.title,
    answers,
    score: 0,
    recommended_course: recommendedCourse,
    recommendation_why: recommendationWhy,
    completed_at: now(),
  })
  return created(toApi(await ref.get()))
})
