'use client'

import { AnimatePresence, motion } from 'motion/react'
import { useState } from 'react'
import {
  Check,
  Sparkles,
  RotateCcw,
  ArrowLeft,
  ArrowRight,
  ListChecks,
  Clock,
} from 'lucide-react'
import { UIButton, UICard, Eyebrow, UIBadge } from '@/components/ui-kit'
import { useTests, submitTest, type Test } from '@/lib/hooks/useTests'
import { getErrorMessage } from '@/lib/api'
import { cn } from '@/lib/utils'

/* ----------------------------- Test list ----------------------------- */
function TestList({ onPick }: { onPick: (t: Test) => void }) {
  const { tests } = useTests()
  const published = tests.filter((t) => t.published)

  return (
    <div className="mx-auto min-h-screen max-w-5xl px-6 pb-20 pt-28">
      <div className="text-center">
        <Eyebrow>Self-assessment</Eyebrow>
        <h1 className="mt-3 font-heading text-4xl font-bold tracking-tight text-balance sm:text-5xl">
          Tests &amp; assessments
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-muted-foreground leading-relaxed">
          Choose a test below. Each one is a short series of questions that helps
          map where you are and what path fits you best.
        </p>
      </div>

      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {published.map((test) => (
          <UICard key={test.id} className="flex flex-col p-6">
            <UIBadge className="self-start">{test.category}</UIBadge>
            <h3 className="mt-4 font-heading text-xl font-bold">{test.title}</h3>
            <p className="mt-2 flex-1 text-sm text-muted-foreground leading-relaxed">
              {test.description}
            </p>
            <div className="mt-5 flex items-center gap-4 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <ListChecks className="size-4" /> {test.questions.length} questions
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Clock className="size-4" /> ~{test.questions.length} min
              </span>
            </div>
            <UIButton className="mt-6 w-full" onClick={() => onPick(test)}>
              Start test
              <ArrowRight className="size-4" />
            </UIButton>
          </UICard>
        ))}
        {published.length === 0 && (
          <p className="col-span-full text-center text-muted-foreground">
            No tests are available right now. Check back soon.
          </p>
        )}
      </div>
    </div>
  )
}

/* ----------------------------- Test runner ----------------------------- */
function TestRunner({ test, onExit }: { test: Test; onExit: () => void }) {
  const [current, setCurrent] = useState(0)
  const [answers, setAnswers] = useState<(number | null)[]>(
    Array(test.questions.length).fill(null),
  )
  const [finished, setFinished] = useState(false)
  const [recommendation, setRecommendation] = useState<{ course: string; why: string } | null>(null)
  const [submitError, setSubmitError] = useState('')

  const total = test.questions.length
  const progress = ((finished ? total : current) / total) * 100
  const q = test.questions[current]
  const selected = answers[current]

  const choose = (idx: number) => {
    setAnswers((prev) => {
      const copy = [...prev]
      copy[current] = idx
      return copy
    })
  }

  const next = async () => {
    if (current < total - 1) {
      setCurrent(current + 1)
    } else {
      const answersMap: Record<string, number> = {}
      test.questions.forEach((q, i) => {
        if (answers[i] !== null) answersMap[q.id] = answers[i] as number
      })
      try {
        const result = await submitTest(test.id, answersMap)
        if (result.recommended_course) {
          setRecommendation({ course: result.recommended_course, why: result.recommendation_why })
        }
      } catch (err) {
        setSubmitError(getErrorMessage(err))
      }
      setFinished(true)
    }
  }

  const back = () => setCurrent(Math.max(0, current - 1))

  const restart = () => {
    setCurrent(0)
    setAnswers(Array(total).fill(null))
    setFinished(false)
    setRecommendation(null)
  }

  // Local fallback: look up the combination in combination_results
  const localRecommendation = (() => {
    const comboKey = answers.map((a) => (a !== null ? String(a) : '0')).join(',')
    const course = (test.combination_results ?? {})[comboKey]
    return course
      ? { course, why: (test.course_outcomes ?? {})[course] ?? '' }
      : null
  })()

  const finalRec = recommendation ?? localRecommendation

  return (
    <div className="flex min-h-screen flex-col bg-foreground text-background">
      <div className="h-1.5 w-full bg-background/10">
        <motion.div
          className="h-full bg-primary"
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>

      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center px-6 py-16">
        <button
          onClick={onExit}
          className="mb-8 inline-flex items-center gap-2 self-start text-sm text-background/60 transition-colors hover:text-background"
        >
          <ArrowLeft className="size-4" /> All tests
        </button>

        <AnimatePresence mode="wait">
          {finished ? (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-center"
            >
              <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <Sparkles className="size-8" />
              </div>
              <Eyebrow className="mt-8 text-primary">{test.title}</Eyebrow>
              <h1 className="mt-4 font-heading text-4xl font-bold leading-tight text-balance sm:text-5xl">
                Your results are in
              </h1>
              <p className="mx-auto mt-5 max-w-md text-background/70 leading-relaxed">
                Based on your answers, here is the programme that fits you best right now.
              </p>

              {finalRec ? (
                <div className="mx-auto mt-8 max-w-md rounded-2xl border border-primary/40 bg-primary/10 px-7 py-6 text-left">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
                    Recommended for you
                  </p>
                  <p className="mt-2 font-heading text-2xl font-bold">{finalRec.course}</p>
                  {finalRec.why && (
                    <p className="mt-3 text-sm leading-relaxed text-background/75">{finalRec.why}</p>
                  )}
                </div>
              ) : submitError ? (
                <div className="mx-auto mt-8 max-w-md rounded-2xl border border-red-400/40 bg-red-500/10 px-7 py-6 text-center">
                  <p className="text-sm text-red-300">{submitError}</p>
                </div>
              ) : (
                <div className="mx-auto mt-8 max-w-md rounded-2xl border border-background/20 bg-background/5 px-7 py-6 text-center">
                  <p className="text-sm text-background/60">
                    Thank you for completing the test. Our team will be in touch with a personalised recommendation.
                  </p>
                </div>
              )}

              {/* Per-question summary – no correct/wrong markers */}
              <div className="mx-auto mt-10 max-w-md space-y-2 text-left">
                {test.questions.map((question, i) => (
                  <div
                    key={question.id}
                    className="flex items-start gap-3 rounded-2xl border border-background/15 p-4"
                  >
                    <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-background/15 text-[10px] font-bold text-background">
                      {i + 1}
                    </span>
                    <div>
                      <p className="text-sm font-medium">{question.question}</p>
                      <p className="mt-1 text-xs text-background/60">
                        Your answer:{' '}
                        {answers[i] !== null
                          ? question.options[answers[i] as number]
                          : '—'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <UIButton size="lg" onClick={onExit}>
                  Explore more tests
                </UIButton>
                <UIButton
                  variant="ghost"
                  size="lg"
                  onClick={restart}
                  className="text-background"
                >
                  <RotateCcw className="size-4" />
                  Retake
                </UIButton>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key={current}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -24 }}
              transition={{ duration: 0.4 }}
            >
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-background/50">
                {test.title} · Question {current + 1} of {total}
              </p>
              <h1 className="mt-5 font-heading text-3xl font-bold leading-tight text-balance sm:text-4xl">
                {q.question}
              </h1>
              <div className="mt-10 grid gap-3">
                {q.options.map((option, idx) => (
                  <motion.button
                    key={option}
                    onClick={() => choose(idx)}
                    whileHover={{ x: 6 }}
                    className={cn(
                      'flex items-center justify-between rounded-2xl border p-5 text-left text-lg transition-colors',
                      selected === idx
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-background/20 hover:border-primary hover:bg-background/5',
                    )}
                  >
                    {option}
                    <span
                      className={cn(
                        'flex size-6 shrink-0 items-center justify-center rounded-full border transition-colors',
                        selected === idx
                          ? 'border-primary-foreground bg-primary-foreground text-primary'
                          : 'border-background/30',
                      )}
                    >
                      {selected === idx && <Check className="size-3.5" />}
                    </span>
                  </motion.button>
                ))}
              </div>

              <div className="mt-10 flex items-center justify-between">
                <UIButton
                  variant="ghost"
                  onClick={back}
                  disabled={current === 0}
                  className={cn('text-background', current === 0 && 'invisible')}
                >
                  <ArrowLeft className="size-4" /> Back
                </UIButton>
                <UIButton onClick={next} disabled={selected === null}>
                  {current === total - 1 ? 'See results' : 'Next'}
                  <ArrowRight className="size-4" />
                </UIButton>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export function TestsPage() {
  const [active, setActive] = useState<Test | null>(null)

  if (active) return <TestRunner test={active} onExit={() => setActive(null)} />
  return <TestList onPick={setActive} />
}
