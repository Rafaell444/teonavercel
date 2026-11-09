'use client'

import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import Image from 'next/image'
import { ArrowRight, X } from 'lucide-react'
import { UIButton, Eyebrow } from '@/components/ui-kit'
import { SiteFooter } from '@/components/site-footer'
import { useCertificates, useSiteSettings } from '@/lib/hooks/useContent'
import { useT } from '@/lib/i18n'

export function AboutPage({ onBook, onNavigate }: { onBook: () => void; onNavigate?: (view: string) => void }) {
  const t = useT()
  const { settings } = useSiteSettings()
  // Same figures as the home page, editable in the admin panel
  const stats = [
    { stat: settings?.statHours, label: t('about.stat.hours') },
    { stat: settings?.statLives, label: t('about.stat.lives') },
    { stat: settings?.statReturn, label: t('about.stat.return') },
  ]
  return (
    <div className="bg-background pt-24 sm:pt-32">
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
          <p className="mt-6 text-base leading-relaxed text-muted-foreground sm:text-lg">
            {t('aboutPage.subtitle')}
          </p>
        </motion.div>

        <div className="mt-12 grid items-center gap-10 sm:mt-16 sm:gap-14 lg:grid-cols-2">
          <div className="relative mx-auto aspect-[4/5] w-full max-w-md overflow-hidden rounded-3xl lg:max-w-none">
            <Image src="/coach.webp" alt={t('about.image_alt')} fill className="object-cover" />
          </div>
          <div>
            <Eyebrow>{t('about.eyebrow')}</Eyebrow>
            <h2 className="mt-3 font-heading text-3xl font-bold leading-tight tracking-tight text-balance sm:text-4xl">
              {t('about.title')}
            </h2>
            <div className="mt-6 space-y-5 text-muted-foreground leading-relaxed">
              <p>{t('about.p1')}</p>
              <p>{t('about.p2')}</p>
            </div>
            <div className="mt-8 flex flex-wrap gap-x-8 gap-y-5">
              {stats.map((s) => (
                <div key={s.label}>
                  <p className="font-heading text-3xl font-bold text-primary sm:text-4xl">{s.stat}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{s.label}</p>
                </div>
              ))}
            </div>
            <UIButton size="lg" onClick={onBook} className="mt-10 w-full sm:w-auto">
              {t('about.cta')}
              <ArrowRight className="size-4" />
            </UIButton>
          </div>
        </div>

        <div className="mt-16 grid gap-4 sm:mt-24 sm:gap-6 md:grid-cols-3">
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
            <div key={v.title} className="rounded-2xl border border-border bg-card p-6 sm:p-7">
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

  // Esc closes the enlarged certificate
  useEffect(() => {
    if (!viewImage) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setViewImage(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [viewImage])

  if (certificates.length === 0) return null

  return (
    <div className="mt-16 sm:mt-24">
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
            <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-foreground/80 to-transparent px-3 py-2 text-xs font-medium text-background transition-opacity md:opacity-0 md:group-hover:opacity-100 md:group-focus-visible:opacity-100">
              {cert.title}
            </span>
          </button>
        ))}
      </div>

      <AnimatePresence>
      {viewImage && (
        <motion.div
          key="certificate"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-foreground/80 backdrop-blur-sm p-4"
          onClick={() => setViewImage(null)}
        >
          <button autoFocus aria-label={t('common.close')} className="absolute right-4 top-4 flex size-11 items-center justify-center rounded-full bg-background/20 text-background hover:bg-background/30">
            <X className="size-5" />
          </button>
          <motion.img
            src={viewImage}
            alt="Certificate full view"
            initial={{ scale: 0.94 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.96 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="max-h-[80dvh] max-w-full rounded-2xl object-contain"
          />
        </motion.div>
      )}
      </AnimatePresence>
    </div>
  )
}
