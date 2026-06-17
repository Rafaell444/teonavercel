'use client'

import { useState, useMemo } from 'react'
import { X, Calendar, Clock, Video, CheckCircle, Phone } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
import { UIButton, UICard } from '@/components/ui-kit'
import { useConsultationSlots, bookConsultation } from '@/lib/hooks/useConsultations'
import { useMe } from '@/lib/hooks/useAuth'
import { getErrorMessage } from '@/lib/api'
import { cn } from '@/lib/utils'
import { useT } from '@/lib/i18n'

interface ConsultationModalProps {
  open: boolean
  onClose: () => void
  onAuthRequired?: () => void
}

export function ConsultationModal({ open, onClose, onAuthRequired }: ConsultationModalProps) {
  const { user } = useMe()
  const t = useT()
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

  const handleClose = () => {
    setSelectedDate(null)
    setSelectedSlot(null)
    setMeetLink(null)
    setError('')
    onClose()
  }

  if (!open) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-foreground/60 backdrop-blur-sm"
          onClick={handleClose}
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="relative w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-2xl"
        >
          <button
            onClick={handleClose}
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
                  className="mt-1 block text-sm text-primary underline break-all"
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
              <div className="mb-5">
                <h3 className="font-heading text-xl font-bold">{t('consultation.title')}</h3>
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
                          onClick={() => { setSelectedDate(date); setSelectedSlot(null) }}
                          className={cn(
                            'rounded-xl border px-3 py-2 text-sm font-medium transition-colors',
                            selectedDate === date
                              ? 'border-primary bg-primary text-primary-foreground'
                              : 'border-border hover:bg-secondary'
                          )}
                        >
                          {new Date(date + 'T00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', weekday: 'short' })}
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
    </AnimatePresence>
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
            className="shrink-0 whitespace-nowrap gap-1.5 border-primary/30 text-primary hover:bg-primary hover:text-primary-foreground"
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
