'use client'

import { useState } from 'react'
import { motion } from 'motion/react'
import Image from 'next/image'
import { ArrowRight, X } from 'lucide-react'
import { UIButton, Eyebrow } from '@/components/ui-kit'
import { SiteFooter } from '@/components/site-footer'
import { useCertificates } from '@/lib/hooks/useContent'
import { useT } from '@/lib/i18n'

export function AboutPage({ onBook, onNavigate }: { onBook: () => void; onNavigate?: (view: string) => void }) {
  const t = useT()
  return (
    <div className="bg-background pt-32">
      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto max-w-3xl text-center"
        >
          <Eyebrow>{t('aboutPage.eyebrow')}</Eyebrow>
          <h1 className="mt-4 font-heading text-4xl font-bold leading-[1.1] tracking-tight text-balance sm:text-6xl">
            {t('aboutPage.title')}
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
            {t('aboutPage.subtitle')}
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
              title: t('aboutPage.values.depth'),
              body: t('aboutPage.values.depthBody'),
            },
            {
              title: t('aboutPage.values.honesty'),
              body: t('aboutPage.values.honestyBody'),
            },
            {
              title: t('aboutPage.values.results'),
              body: t('aboutPage.values.resultsBody'),
            },
          ].map((v) => (
            <div key={v.title} className="rounded-2xl border border-border bg-card p-7">
              <h3 className="font-heading text-xl font-bold tracking-tight">{v.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{v.body}</p>
            </div>
          ))}
        </div>

        <CertificationsSection />
      </div>
      <div className="pb-24" />
      <SiteFooter onNavigate={onNavigate} />
    </div>
  )
}

function CertificationsSection() {
  const t = useT()
  const { certificates } = useCertificates()
  const [viewImage, setViewImage] = useState<string | null>(null)

  if (certificates.length === 0) return null

  return (
    <div className="mt-24">
      <Eyebrow>{t('aboutPage.certs.eyebrow')}</Eyebrow>
      <h2 className="mt-3 font-heading text-3xl font-bold tracking-tight sm:text-4xl">
        {t('aboutPage.certs.title')}
      </h2>
      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
        {certificates.map((cert) => (
          <button
            key={cert.id}
            onClick={() => setViewImage(cert.image)}
            className="group relative aspect-[4/3] overflow-hidden rounded-2xl border border-border bg-card transition-all hover:shadow-lg"
          >
            <img src={cert.image} alt={cert.title} className="size-full object-contain p-3" />
            <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-foreground/80 to-transparent px-3 py-2 text-xs font-medium text-background opacity-0 transition-opacity group-hover:opacity-100">
              {cert.title}
            </span>
          </button>
        ))}
      </div>

      {viewImage && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-foreground/80 backdrop-blur-sm p-4" onClick={() => setViewImage(null)}>
          <button className="absolute right-4 top-4 rounded-full bg-background/20 p-2 text-background hover:bg-background/30">
            <X className="size-5" />
          </button>
          <img src={viewImage} alt="Certificate full view" className="max-h-[80vh] max-w-full rounded-2xl object-contain" />
        </div>
      )}
    </div>
  )
}
