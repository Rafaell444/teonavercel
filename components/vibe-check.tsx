'use client'

import { AnimatePresence, motion } from 'motion/react'
import { useState } from 'react'
import { Check, Sparkles, RotateCcw } from 'lucide-react'
import { UIButton, Eyebrow } from '@/components/ui-kit'
import { quizQuestions } from '@/lib/mock-data'
import { cn } from '@/lib/utils'

export function VibeCheck() {
  const [current, setCurrent] = useState(0)
  const [answers, setAnswers] = useState<number[]>([])
  const [selected, setSelected] = useState<number | null>(null)
  const [finished, setFinished] = useState(false)

  const total = quizQuestions.length
  const progress = ((finished ? total : current) / total) * 100

  const choose = (idx: number) => {
    setSelected(idx)
    setTimeout(() => {
      const nextAnswers = [...answers, idx]
      setAnswers(nextAnswers)
      setSelected(null)
      if (current < total - 1) {
        setCurrent(current + 1)
      } else {
        setFinished(true)
      }
    }, 350)
  }

  const restart = () => {
    setCurrent(0)
    setAnswers([])
    setSelected(null)
    setFinished(false)
  }

  return (
    <div className="flex min-h-screen flex-col bg-foreground text-background">
      {/* Progress bar */}
      <div className="h-1.5 w-full bg-background/10">
        <motion.div
          className="h-full bg-primary"
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>

      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center px-6 py-16">
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
              <Eyebrow className="mt-8 text-primary">Your Vibe</Eyebrow>
              <h1 className="mt-4 font-heading text-4xl font-bold leading-tight text-balance sm:text-5xl">
                You&apos;re ready for{' '}
                <span className="italic text-primary">deep transformation</span>.
              </h1>
              <p className="mx-auto mt-5 max-w-md text-background/70 leading-relaxed">
                Based on your answers, Generative Coaching paired with RTT therapy
                looks like your ideal path. Let&apos;s build it together.
              </p>
              <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <UIButton size="lg">See my recommended path</UIButton>
                <UIButton variant="ghost" size="lg" onClick={restart} className="text-background">
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
                Question {current + 1} of {total}
              </p>
              <h1 className="mt-5 font-heading text-3xl font-bold leading-tight text-balance sm:text-4xl">
                {quizQuestions[current].question}
              </h1>
              <div className="mt-10 grid gap-3">
                {quizQuestions[current].options.map((option, idx) => (
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
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
