'use client'

import { motion } from 'motion/react'
import Image from 'next/image'
import { ArrowRight } from 'lucide-react'
import { UIButton, Eyebrow } from '@/components/ui-kit'
import { SiteFooter } from '@/components/site-footer'

export function AboutPage({ onBook }: { onBook: () => void }) {
  return (
    <div className="bg-background pt-32">
      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto max-w-3xl text-center"
        >
          <Eyebrow>About Ascend</Eyebrow>
          <h1 className="mt-4 font-heading text-4xl font-bold leading-[1.1] tracking-tight text-balance sm:text-6xl">
            Grounded work that lasts a lifetime.
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
            Ascend is a premium coaching and therapy practice for people ready to do
            the real work — no hype, no shortcuts, just deep transformation.
          </p>
        </motion.div>

        <div className="mt-16 grid items-center gap-14 lg:grid-cols-2">
          <div className="relative aspect-[4/5] overflow-hidden rounded-3xl">
            <Image src="/coach.png" alt="Portrait of the lead coach" fill className="object-cover" />
          </div>
          <div>
            <Eyebrow>The Hunger</Eyebrow>
            <h2 className="mt-3 font-heading text-3xl font-bold leading-tight tracking-tight text-balance sm:text-4xl">
              I built this from the bottom of my own rock bottom.
            </h2>
            <div className="mt-6 space-y-5 text-muted-foreground leading-relaxed">
              <p>
                Fifteen years ago I was burned out, broke, and convinced change
                wasn&apos;t for people like me. One honest conversation cracked that
                story open — and everything shifted.
              </p>
              <p>
                Since then I&apos;ve spent over 20,000 hours in the room with founders,
                leaders, and people simply ready for more. The mission is simple: help
                you become the person your future is waiting for.
              </p>
            </div>
            <div className="mt-8 flex flex-wrap gap-8">
              {[
                { stat: '20k+', label: 'Coaching hours' },
                { stat: '12k+', label: 'Lives changed' },
                { stat: '98%', label: 'Would return' },
              ].map((s) => (
                <div key={s.label}>
                  <p className="font-heading text-4xl font-bold text-primary">{s.stat}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{s.label}</p>
                </div>
              ))}
            </div>
            <UIButton size="lg" onClick={onBook} className="mt-10">
              Start your story
              <ArrowRight className="size-4" />
            </UIButton>
          </div>
        </div>

        <div className="mt-24 grid gap-6 md:grid-cols-3">
          {[
            {
              title: 'Depth over hype',
              body: 'We go to the root, not the surface. Real change, not motivational sugar.',
            },
            {
              title: 'Radical honesty',
              body: 'You get the truth, delivered with care. Growth lives outside comfort.',
            },
            {
              title: 'Lasting results',
              body: 'The work is designed to integrate — so it holds long after we finish.',
            },
          ].map((v) => (
            <div key={v.title} className="rounded-2xl border border-border bg-card p-7">
              <h3 className="font-heading text-xl font-bold tracking-tight">{v.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{v.body}</p>
            </div>
          ))}
        </div>
      </div>
      <SiteFooter />
    </div>
  )
}
