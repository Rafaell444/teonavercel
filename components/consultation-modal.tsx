'use client'

import { useState, useMemo, useEffect, useId } from 'react'
import { createPortal } from 'react-dom'
import { X, Calendar, Clock, Video, CheckCircle, Phone } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
import { UIButton, UICard } from '@/components/ui-kit'
import { useConsultationSlots, bookConsultation } from '@/lib/hooks/useConsultations'
import { useMe } from '@/lib/hooks/useAuth'
import { getErrorMessage } from '@/lib/api'
import { cn } from '@/lib/utils'
import { useT, useLocale } from '@/lib/i18n'
import { formatDate } from '@/lib/format'
import { useDialogFocus } from '@/lib/hooks/useDialogFocus'

interface ConsultationModalProps {
  open: boolean
  onClose: () => void
  onAuthRequired?: () => void
}

export function ConsultationModal({ open, onClose, onAuthRequired }: ConsultationModalProps) {
  const { user } = useMe()
  const t = useT()
  const locale = useLocale()
  const { slots, isLoading } = useConsultationSlots()
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null)
  const [meetLink, setMeetLink] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const dates = useMemo(() => {
    const unique = [...new Set(slots.filter(s => !s.is_booked).map(s => s.date))]
    return unique.sort()
  }, [slots])

  const timesForDate = useMemo(() => {
    if (!selectedDate) return []
    return slots.filter(s => s.date === selectedDate && !s.is_booked)
  }, [slots, selectedDate])

  const handleBook = async () => {
    if (!user) {
      onAuthRequired?.()
      return
    }
    if (!selectedSlot) return
    setError('')
    setSubmitting(true)
    try {
      const result = await bookConsultation(selectedSlot)
      setMeetLink(result.meet_link)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  // Reset only after the closing animation, so the content does not change mid-fade
  const resetState = () => {
    setSelectedDate(null)
    setSelectedSlot(null)
    setMeetLink(null)
    setError('')
  }

  const handleClose = onClose

  // Rendered in a portal: a parent that is mid-animation (transform) would
  // otherwise turn this fixed overlay into one positioned inside that parent.
  const titleId = useId()
  const panelRef = useDialogFocus<HTMLDivElement>(open)
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!mounted) return null

  return createPortal(
    <AnimatePresence onExitComplete={resetState}>
      {open && (
      <div key="consultation" className="fixed inset-0 z-[100] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby={titleId}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="absolute inset-0 bg-foreground/60 backdrop-blur-sm"
          onClick={handleClose}
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.97, y: 16, transition: { duration: 0.2, ease: 'easeIn' } }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          ref={panelRef}
          tabIndex={-1}
          className="relative max-h-[calc(100dvh-2rem)] w-full max-w-md overflow-y-auto outline-none overscroll-contain rounded-3xl border border-border bg-card p-5 shadow-2xl sm:p-6"
        >
          <button
            onClick={handleClose}
            aria-label={t('common.close')}
            className="absolute right-4 top-4 rounded-full p-1.5 text-muted-foreground hover:bg-secondary"
          >
            <X className="size-5" />
          </button>

          {meetLink ? (
            <div className="text-center py-4">
              <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-green-500/10">
                <CheckCircle className="size-7 text-green-600" />
              </div>
              <h3 className="font-heading text-xl font-bold">{t('consultation.booked_title')}</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {t('consultation.booked_body')}
              </p>
              <UICard className="mt-4 p-4">
                <div className="flex items-center gap-2 text-sm">
                  <Video className="size-4 text-primary" />
                  <span className="font-medium">{t('consultation.meet_link')}</span>
                </div>
                <a
                  href={meetLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 block text-sm text-primary-ink underline break-all"
                >
                  {meetLink}
                </a>
              </UICard>
              <UIButton className="mt-5 w-full" onClick={handleClose}>
                {t('consultation.done')}
              </UIButton>
            </div>
          ) : (
            <>
              <div className="mb-5 pr-8">
                <h3 id={titleId} className="font-heading text-xl font-bold">{t('consultation.title')}</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {t('consultation.subtitle')}
                </p>
              </div>

              {isLoading ? (
                <div className="flex items-center justify-center py-10">
                  <div className="size-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                </div>
              ) : dates.length === 0 ? (
                <div className="py-8 text-center text-sm text-muted-foreground">
                  {t('consultation.no_slots')}
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      <Calendar className="size-3.5" /> {t('consultation.pick_date')}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {dates.map(date => (
                        <button
                          key={date}
                          aria-pressed={selectedDate === date}
                          onClick={() => { setSelectedDate(date); setSelectedSlot(null) }}
                          className={cn(
                            'rounded-xl border px-3 py-2 text-sm font-medium transition-colors',
                            selectedDate === date
                              ? 'border-primary bg-primary text-primary-foreground'
                              : 'border-border hover:bg-secondary'
                          )}
                        >
                          {formatDate(date, locale, { year: false, weekday: true })}
                        </button>
                      ))}
                    </div>
                  </div>

                  {selectedDate && (
                    <div>
                      <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        <Clock className="size-3.5" /> {t('consultation.pick_time')}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {timesForDate.map(slot => (
                          <button
                            key={slot.id}
                            aria-pressed={selectedSlot === slot.id}
                            onClick={() => setSelectedSlot(slot.id)}
                            className={cn(
                              'rounded-xl border px-3 py-2 text-sm font-medium transition-colors',
                              selectedSlot === slot.id
                                ? 'border-primary bg-primary text-primary-foreground'
                                : 'border-border hover:bg-secondary'
                            )}
                          >
                            {slot.start_time.slice(0, 5)}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {error && <p className="text-sm text-red-600">{error}</p>}

                  <UIButton
                    className="w-full"
                    disabled={!selectedSlot || submitting}
                    onClick={handleBook}
                  >
                    {submitting ? t('booking.booking') : t('consultation.confirm_btn')}
                  </UIButton>
                </div>
              )}
            </>
          )}
        </motion.div>
      </div>
      )}
    </AnimatePresence>,
    document.body,
  )
}

export function ConsultationButton({ onAuthRequired, className }: { onAuthRequired?: () => void; className?: string }) {
  const [open, setOpen] = useState(false)
  const t = useT()
  return (
    <>
      <UIButton
        variant="outline"
        onClick={() => setOpen(true)}
        className={cn('gap-2 whitespace-nowrap', className)}
      >
        <Phone className="size-4" />
        {t('hero.consultation')}
      </UIButton>
      <ConsultationModal open={open} onClose={() => setOpen(false)} onAuthRequired={onAuthRequired} />
    </>
  )
}

export function ConsultationCTA({ onAuthRequired }: { onAuthRequired?: () => void }) {
  const [open, setOpen] = useState(false)
  const t = useT()
  return (
    <>
      <div className="mt-6 rounded-2xl border border-primary/20 bg-primary/5 p-5">
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
              <Phone className="size-5 text-primary" />
            </div>
            <div>
              <p className="font-heading text-sm font-bold">{t('consultation.cta_title')}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{t('consultation.cta_body')}</p>
            </div>
          </div>
          <UIButton
            variant="outline"
            size="sm"
            onClick={() => setOpen(true)}
            className="w-full shrink-0 whitespace-nowrap gap-1.5 border-primary/30 text-primary-ink hover:bg-primary hover:text-primary-foreground sm:w-auto"
          >
            <Phone className="size-3.5" />
            {t('consultation.cta_btn')}
          </UIButton>
        </div>
      </div>
      <ConsultationModal open={open} onClose={() => setOpen(false)} onAuthRequired={onAuthRequired} />
    </>
  )
}
