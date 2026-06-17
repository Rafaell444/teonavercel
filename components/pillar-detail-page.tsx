'use client'

import { motion } from 'motion/react'
import { ArrowRight, ArrowLeft } from 'lucide-react'
import { UIButton, Eyebrow } from '@/components/ui-kit'
import { SiteFooter } from '@/components/site-footer'
import { ConsultationCTA } from '@/components/consultation-modal'
import { usePillars } from '@/lib/hooks/useContent'
import { useT, useLocalized } from '@/lib/i18n'

interface PillarDetailPageProps {
  pillarId: string
  onBook: () => void
  onBack: () => void
  onNavigate?: (view: string) => void
}

export function PillarDetailPage({ pillarId, onBook, onBack, onNavigate }: PillarDetailPageProps) {
  const { pillars } = usePillars()
  const t = useT()
  const l = useLocalized()
  const pillar = pillars.find(p => p.id === pillarId)

  if (!pillar) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background pt-24">
        <div className="text-center">
          <p className="text-muted-foreground">{t('pillar.detail.not_found')}</p>
          <UIButton variant="outline" onClick={onBack} className="mt-4">
            <ArrowLeft className="size-4" /> {t('pillar.detail.back')}
          </UIButton>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-background">
      <div className="mx-auto max-w-3xl px-6 pb-16 pt-24 sm:pb-24 sm:pt-32">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <button
            onClick={onBack}
            className="mb-8 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            {t('pillar.detail.back')}
          </button>

          <Eyebrow>{t('pillar.detail.eyebrow')}</Eyebrow>
          <h1 className="mt-3 font-heading text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
            {l(pillar.title, pillar.title_ka)}
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
            {l(pillar.blurb, pillar.blurb_ka)}
          </p>

          <ul className="mt-8 space-y-3">
            {(l(pillar.points, pillar.points_ka) || []).map((point: string) => (
              <li key={point} className="flex items-center gap-3 text-foreground/85">
                <span className="size-2 shrink-0 rounded-full bg-primary" />
                {point}
              </li>
            ))}
          </ul>

          {l(pillar.long_description, pillar.long_description_ka) && (
            <div className="mt-12">
              <h2 className="font-heading text-2xl font-bold tracking-tight">{t('pillar.detail.about')}</h2>
              <p className="mt-4 whitespace-pre-line leading-relaxed text-muted-foreground">
                {l(pillar.long_description, pillar.long_description_ka)}
              </p>
            </div>
          )}

          {l(pillar.history, pillar.history_ka) && (
            <div className="mt-10">
              <h2 className="font-heading text-2xl font-bold tracking-tight">{t('pillar.detail.history')}</h2>
              <p className="mt-4 whitespace-pre-line leading-relaxed text-muted-foreground">
                {l(pillar.history, pillar.history_ka)}
              </p>
            </div>
          )}

          <div className="mt-12">
            <UIButton size="lg" onClick={onBook}>
              {t('pillar.detail.book')}
              <ArrowRight className="size-4" />
            </UIButton>
          </div>

          <ConsultationCTA />
        </motion.div>
      </div>
      <SiteFooter onNavigate={onNavigate} />
    </div>
  )
}
