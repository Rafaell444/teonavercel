'use client'

import { useId, useState } from 'react'
import { motion } from 'motion/react'
import { Mail, Phone, MapPin, Send, Check } from 'lucide-react'
import { UIButton, UIInput, UICard, Eyebrow } from '@/components/ui-kit'
import { useSiteSettings } from '@/lib/hooks/useContent'
import { sendMessage } from '@/lib/hooks/useMessages'
import { getErrorMessage } from '@/lib/api'
import { SiteFooter } from '@/components/site-footer'
import { ConsultationCTA } from '@/components/consultation-modal'
import { useT } from '@/lib/i18n'

export function ContactPage({ onNavigate }: { onNavigate?: (view: string) => void } = {}) {
  const t = useT()
  const fid = useId()
  const { settings } = useSiteSettings()
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  })

  const details = [
    { icon: Mail, label: t('contact.email'), value: settings?.contactEmail ?? '' },
    { icon: Phone, label: t('contact.phone'), value: settings?.contactPhone ?? '' },
    { icon: MapPin, label: t('contact.location'), value: settings?.contactLocation ?? '' },
  ]

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await sendMessage(form)
      setSent(true)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="bg-background">
      <div className="mx-auto max-w-6xl px-6 pb-16 pt-24 sm:pb-24 sm:pt-32">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-2xl"
        >
          <Eyebrow>{t('contact.eyebrow')}</Eyebrow>
          <h1 className="mt-4 font-heading text-4xl font-bold leading-[1.1] tracking-tight text-balance sm:text-6xl">
            {t('contact.title')}
          </h1>
          <p className="mt-6 text-base leading-relaxed text-muted-foreground sm:text-lg">
            {t('contact.subtitle')}
          </p>
        </motion.div>

        <div className="mt-10 grid gap-6 sm:mt-14 sm:gap-10 lg:grid-cols-[1fr_1.2fr]">
          <div className="space-y-4">
            {details.map((d) => {
              const Icon = d.icon
              return (
                <UICard key={d.label} className="flex items-center gap-4 p-4 sm:p-5">
                  <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="size-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                      {d.label}
                    </p>
                    <p className="mt-0.5 font-medium break-words">{d.value}</p>
                  </div>
                </UICard>
              )
            })}
          </div>

          <UICard className="p-5 sm:p-8">
            {sent ? (
              <div className="flex h-full flex-col items-center justify-center py-12 text-center">
                <div className="flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Check className="size-7" />
                </div>
                <h3 className="mt-5 font-heading text-2xl font-bold">{t('contact.sent.title')}</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {t('contact.sent.body')}
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor={`${fid}-0`} className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                      {t('contact.name')}
                    </label>
                    <UIInput id={`${fid}-0`}
                      type="text"
                      name="name"
                      autoComplete="name"
                      placeholder={t('contact.placeholder.name')}
                      required
                      value={form.name}
                      onChange={set('name')}
                    />
                  </div>
                  <div>
                    <label htmlFor={`${fid}-1`} className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                      {t('contact.email')}
                    </label>
                    <UIInput id={`${fid}-1`}
                      type="email"
                      name="email"
                      autoComplete="email"
                      placeholder={t('contact.placeholder.email')}
                      required
                      value={form.email}
                      onChange={set('email')}
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor={`${fid}-2`} className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                    {t('contact.subject')}
                  </label>
                  <UIInput id={`${fid}-2`}
                    type="text"
                    placeholder={t('contact.placeholder.subject')}
                    required
                    value={form.subject}
                    onChange={set('subject')}
                  />
                </div>
                <div>
                  <label htmlFor={`${fid}-3`} className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                    {t('contact.message')}
                  </label>
                  <textarea id={`${fid}-3`}
                    required
                    rows={5}
                    value={form.message}
                    onChange={set('message')}
                    placeholder={t('contact.placeholder.message')}
                    className="w-full rounded-xl border border-border bg-background px-4 py-3 text-base text-foreground sm:text-sm placeholder:text-muted-foreground focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                  />
                </div>
                {error && (
                  <p className="rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-600 dark:bg-red-950/30 dark:text-red-400">{error}</p>
                )}
                <UIButton type="submit" size="lg" className="mt-2 w-full sm:w-auto sm:self-start" disabled={submitting}>
                  {submitting ? t('contact.sending') : t('contact.send')}
                  {!submitting && <Send className="size-4" />}
                </UIButton>
              </form>
            )}
          </UICard>
        </div>

        <ConsultationCTA />
      </div>
      <SiteFooter onNavigate={onNavigate} />
    </div>
  )
}
