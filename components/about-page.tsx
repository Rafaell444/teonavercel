'use client'

import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import Image from 'next/image'
import { ArrowRight, Award, X } from 'lucide-react'
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
    { stat: settings?.statLives, label: t('about.stat.years') },
    { stat: settings?.statReturn, label: t('about.stat.management') },
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
              <p>{t('aboutPage.experience')}</p>
              <p>{t('aboutPage.interests')}</p>
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

        <div className="mt-16 sm:mt-24">
          <Eyebrow>{t('aboutPage.focus.eyebrow')}</Eyebrow>
          <h2 className="mt-3 font-heading text-3xl font-bold tracking-tight sm:text-4xl">
            {t('aboutPage.focus.title')}
          </h2>
          <div className="mt-8 grid gap-4 sm:gap-6 md:grid-cols-3">
            {[
              { title: t('aboutPage.focus.leadership'), body: t('aboutPage.focus.leadershipBody') },
              { title: t('aboutPage.focus.teams'), body: t('aboutPage.focus.teamsBody') },
              { title: t('aboutPage.focus.public'), body: t('aboutPage.focus.publicBody') },
            ].map((v) => (
              <div key={v.title} className="rounded-2xl border border-border bg-card p-6 sm:p-7">
                <h3 className="font-heading text-xl font-bold tracking-tight text-balance">{v.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{v.body}</p>
              </div>
            ))}
          </div>
        </div>

        <CredentialsSection />

        <CertificationsSection />
      </div>
      <div className="pb-24" />
      <SiteFooter onNavigate={onNavigate} />
    </div>
  )
}

/** Accreditation and coaching education, as listed on Teona's ICF Georgia profile. */
function CredentialsSection() {
  const t = useT()
  const training = [
    { title: t('aboutPage.cred.acc'), by: t('aboutPage.cred.accBy') },
    { title: t('aboutPage.cred.actp'), by: 'Erickson Coaching International' },
    { title: t('aboutPage.cred.team'), by: 'Erickson Coaching International' },
    { title: t('aboutPage.cred.nlp'), by: t('aboutPage.cred.nlpBy') },
    { title: t('aboutPage.cred.gc'), by: t('aboutPage.cred.gcBy') },
  ]
  const facts = [
    { label: t('aboutPage.cred.specialisms'), value: t('aboutPage.cred.specialismsValue') },
    { label: t('aboutPage.cred.hours'), value: t('aboutPage.cred.hoursValue') },
    { label: t('aboutPage.cred.languages'), value: t('aboutPage.cred.languagesValue') },
    { label: t('aboutPage.cred.workplace'), value: t('aboutPage.cred.workplaceValue') },
  ]
  return (
    <div className="mt-16 sm:mt-24">
      <Eyebrow>{t('aboutPage.cred.eyebrow')}</Eyebrow>
      <h2 className="mt-3 font-heading text-3xl font-bold tracking-tight sm:text-4xl">
        {t('aboutPage.cred.title')}
      </h2>
      <div className="mt-8 grid gap-4 sm:gap-6 lg:grid-cols-[3fr_2fr]">
        <ul className="divide-y divide-border rounded-2xl border border-border bg-card">
          {training.map((item) => (
            <li key={item.title} className="flex gap-4 p-5 sm:p-6">
              <Award className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden />
              <div className="min-w-0">
                <p className="font-semibold leading-snug">{item.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">{item.by}</p>
              </div>
            </li>
          ))}
        </ul>
        <dl className="grid content-start gap-5 rounded-2xl border border-border bg-card p-5 sm:p-6">
          {facts.map((f) => (
            <div key={f.label}>
              <dt className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">{f.label}</dt>
              <dd className="mt-1 font-medium">{f.value}</dd>
            </div>
          ))}
        </dl>
      </div>
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
