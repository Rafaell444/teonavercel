'use client'

import { useState } from 'react'
import { motion } from 'motion/react'
import { Mail, Phone, MapPin, Send, Check } from 'lucide-react'
import { UIButton, UIInput, UICard, Eyebrow } from '@/components/ui-kit'
import { useSiteSettings } from '@/lib/hooks/useContent'
import { sendMessage } from '@/lib/hooks/useMessages'
import { getErrorMessage } from '@/lib/api'
import { SiteFooter } from '@/components/site-footer'

export function ContactPage() {
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
    { icon: Mail, label: 'Email', value: settings?.contactEmail ?? '' },
    { icon: Phone, label: 'Phone', value: settings?.contactPhone ?? '' },
    { icon: MapPin, label: 'Location', value: settings?.contactLocation ?? '' },
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
          <Eyebrow>Get in touch</Eyebrow>
          <h1 className="mt-4 font-heading text-4xl font-bold leading-[1.1] tracking-tight text-balance sm:text-6xl">
            Let&apos;s start the conversation.
          </h1>
          <p className="mt-6 text-base leading-relaxed text-muted-foreground sm:text-lg">
            Questions about coaching, therapy, or which path is right for you? Reach
            out — we usually reply within one business day.
          </p>
        </motion.div>

        <div className="mt-14 grid gap-10 lg:grid-cols-[1fr_1.2fr]">
          <div className="space-y-4">
            {details.map((d) => {
              const Icon = d.icon
              return (
                <UICard key={d.label} className="flex items-center gap-4 p-5">
                  <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="size-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                      {d.label}
                    </p>
                    <p className="mt-0.5 truncate font-medium">{d.value}</p>
                  </div>
                </UICard>
              )
            })}
          </div>

          <UICard className="p-6 sm:p-8">
            {sent ? (
              <div className="flex h-full flex-col items-center justify-center py-12 text-center">
                <div className="flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Check className="size-7" />
                </div>
                <h3 className="mt-5 font-heading text-2xl font-bold">Message sent</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Thanks for reaching out. We&apos;ll be in touch shortly.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                      Name
                    </label>
                    <UIInput
                      type="text"
                      placeholder="Your name"
                      required
                      value={form.name}
                      onChange={set('name')}
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                      Email
                    </label>
                    <UIInput
                      type="email"
                      placeholder="you@email.com"
                      required
                      value={form.email}
                      onChange={set('email')}
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                    Subject
                  </label>
                  <UIInput
                    type="text"
                    placeholder="How can we help?"
                    required
                    value={form.subject}
                    onChange={set('subject')}
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                    Message
                  </label>
                  <textarea
                    required
                    rows={5}
                    value={form.message}
                    onChange={set('message')}
                    placeholder="Tell us a little about what you're looking for…"
                    className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                  />
                </div>
                {error && (
                  <p className="rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-600 dark:bg-red-950/30 dark:text-red-400">{error}</p>
                )}
                <UIButton type="submit" size="lg" className="mt-2 w-full sm:w-auto sm:self-start" disabled={submitting}>
                  {submitting ? 'Sending…' : 'Send message'}
                  {!submitting && <Send className="size-4" />}
                </UIButton>
              </form>
            )}
          </UICard>
        </div>
      </div>
      <SiteFooter />
    </div>
  )
}
