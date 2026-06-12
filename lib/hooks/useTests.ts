'use client'

import useSWR, { mutate } from 'swr'

import { apiFetch } from '@/lib/api'

export const COURSE_OPTIONS = [
  'Executive Coaching',
  'RTT Therapy',
  'NLP Mastery',
  'Generative Coaching',
] as const

export type CourseName = (typeof COURSE_OPTIONS)[number]

export interface TestQuestion {
  id: string
  order: number
  question: string
  options: string[]
}

export interface Test {
  id: string
  title: string
  description: string
  category: string
  published: boolean
  /** Maps course name → "why this course fits you" text */
  course_outcomes: Record<string, string>
  /** Maps answer combination key → course name. Key format: "0,2,1" (answer indices per question in order) */
  combination_results: Record<string, string>
  created_at: string
  updated_at: string
  questions: TestQuestion[]
}

export interface TestResult {
  id: string
  user: string
  test: string
  test_title: string
  answers: Record<string, number>
  score: number
  recommended_course: string
  recommendation_why: string
  completed_at: string
}

export interface TestRecommendation {
  recommended_course: string
  recommendation_why: string
}

export function useTests() {
  const { data, error, isLoading } = useSWR('/api/tests/', () =>
    apiFetch<Test[]>('/api/tests/')
  )
  return { tests: data ?? [], isLoading, error }
}

export function useTest(id: string) {
  const { data, error, isLoading } = useSWR(id ? `/api/tests/${id}/` : null, () =>
    apiFetch<Test>(`/api/tests/${id}/`)
  )
  return { test: data ?? null, isLoading, error }
}

export async function submitTest(id: string, answers: Record<string, number>) {
  return apiFetch<TestResult>(`/api/tests/${id}/submit/`, {
    method: 'POST',
    body: JSON.stringify({ answers }),
  })
}

function stripQuestionIds(body: Partial<Test>) {
  if (!body.questions) return body
  return {
    ...body,
    questions: body.questions.map(({ id: _id, order: _order, ...q }) => q),
  }
}

export async function createTest(body: Omit<Test, 'id' | 'created_at' | 'updated_at'>) {
  const res = await apiFetch<Test>('/api/tests/', { method: 'POST', body: JSON.stringify(stripQuestionIds(body)) })
  await mutate('/api/tests/')
  return res
}

export async function updateTest(id: string, body: Partial<Test>) {
  const res = await apiFetch<Test>(`/api/tests/${id}/`, {
    method: 'PATCH',
    body: JSON.stringify(stripQuestionIds(body)),
  })
  await mutate('/api/tests/')
  await mutate(`/api/tests/${id}/`)
  return res
}

export async function deleteTest(id: string) {
  await apiFetch(`/api/tests/${id}/`, { method: 'DELETE' })
  await mutate('/api/tests/')
}
