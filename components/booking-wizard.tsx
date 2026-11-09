'use client'

import { AnimatePresence, motion } from 'motion/react'
import { useState, useMemo } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Monitor,
  Users,
  Clock,
  ChevronLeft,
  ChevronRight,
  Tag,
} from 'lucide-react'
import { ConsultationCTA } from '@/components/consultation-modal'
import { UIButton, UICard, Eyebrow } from '@/components/ui-kit'
import { useSessions, useTimeSlots } from '@/lib/hooks/useSessions'
import { createBooking } from '@/lib/hooks/useBookings'
import { validateVoucher } from '@/lib/hooks/useVouchers'
import { useMe } from '@/lib/hooks/useAuth'
import { getErrorMessage } from '@/lib/api'
import { cn } from '@/lib/utils'
import { useT, useLocale, useLocalized, fmt } from '@/lib/i18n'
import { WEEKDAY_LABELS, formatDate, formatTime, monthYearLabel } from '@/lib/format'

const STEP_KEYS = [
  'booking.step.session',
  'booking.step.number',
  'booking.step.datetime',
  'booking.step.format',
  'booking.language',
  'booking.step.voucher',
  'booking.step.confirm',
] as const
// How long a block of sessions stays valid, in months, by number of sessions
const VALIDITY_MONTHS: Record<number, string> = { 3: '1.5', 4: '2', 5: '3', 6: '3', 7: '5' }

function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate())
}

function Calendar({ availableDates, selected, onSelect }: { availableDates: string[], selected: Date | null, onSelect: (d: Date) => void }) {
  const t = useT()
  const locale = useLocale()
  const today = startOfDay(new Date())
  const [viewMonth, setViewMonth] = useState(today.getMonth())
  const [viewYear, setViewYear] = useState(today.getFullYear())

  const maxDate = new Date(today)
  maxDate.setMonth(maxDate.getMonth() + 12)

  const canPrev = viewYear > today.getFullYear() || viewMonth > today.getMonth()
  const canNext = viewYear < maxDate.getFullYear() || (viewYear === maxDate.getFullYear() && viewMonth < maxDate.getMonth())

  const firstDayOfMonth = new Date(viewYear, viewMonth, 1).getDay()
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()

  const cells: (Date | null)[] = []
  for (let i = 0; i < firstDayOfMonth; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(viewYear, viewMonth, d))

  const availableSet = useMemo(() => new Set(availableDates), [availableDates])

  return (
    <div className="w-full max-w-sm mx-auto">
      <div className="flex items-center justify-between mb-3">
        <button onClick={() => { if (canPrev) { if (viewMonth === 0) { setViewMonth(11); setViewYear(viewYear - 1) } else setViewMonth(viewMonth - 1) } }} disabled={!canPrev} aria-label={t('booking.prev_month')} className="flex size-10 items-center justify-center rounded-lg hover:bg-secondary disabled:opacity-30">
          <ChevronLeft className="size-4" />
        </button>
        <span className="text-sm font-semibold">{monthYearLabel(viewYear, viewMonth, locale)}</span>
        <button onClick={() => { if (canNext) { if (viewMonth === 11) { setViewMonth(0); setViewYear(viewYear + 1) } else setViewMonth(viewMonth + 1) } }} disabled={!canNext} aria-label={t('booking.next_month')} className="flex size-10 items-center justify-center rounded-lg hover:bg-secondary disabled:opacity-30">
          <ChevronRight className="size-4" />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 mb-1">
        {WEEKDAY_LABELS[locale].map((w) => <div key={w} className="text-center text-[10px] font-semibold text-muted-foreground py-1">{w}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((cell, i) => {
          if (!cell) return <div key={`e-${i}`} />
          const dateStr = `${cell.getFullYear()}-${String(cell.getMonth() + 1).padStart(2, '0')}-${String(cell.getDate()).padStart(2, '0')}`
          const isAvailable = availableSet.has(dateStr)
          const isPast = cell < today
          const isSelected = selected && cell.getTime() === selected.getTime()
          const isToday = cell.getTime() === today.getTime()
          const disabled = isPast || !isAvailable

          return (
            <button
              key={dateStr}
              disabled={disabled}
              aria-label={formatDate(cell, locale, { weekday: true })}
              aria-pressed={!!isSelected}
              onClick={() => onSelect(cell)}
              className={cn(
                'aspect-square rounded-lg text-sm font-medium transition-all duration-150 relative',
                isSelected ? 'bg-primary text-primary-foreground shadow-sm' : '',
                !isSelected && isAvailable && !isPast ? 'hover:bg-primary/10 text-foreground' : '',
                disabled ? 'text-muted-foreground/30 cursor-not-allowed' : 'cursor-pointer',
                isToday && !isSelected ? 'ring-1 ring-primary/40' : '',
              )}
            >
              {cell.getDate()}
              {isAvailable && !isPast && !isSelected && <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 size-1 rounded-full bg-primary" />}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default function BookingWizard() {
  const t = useT()
  const locale = useLocale()
  const l = useLocalized()
  const { user: currentUser } = useMe()
  const { sessions } = useSessions('individual')
  const [step, setStep] = useState(0)
  const [sessionId, setSessionId] = useState('')
  const [numSessions, setNumSessions] = useState(3)
  const [date, setDate] = useState<Date | null>(null)
  const [selectedSlotId, setSelectedSlotId] = useState('')
  const [time, setTime] = useState('')
  const [format, setFormat] = useState<'online' | 'offline'>('online')
  const [sessionLang, setSessionLang] = useState<'ka' | 'en'>('ka')
  const [voucherCode, setVoucherCode] = useState('')
  const [voucherDiscount, setVoucherDiscount] = useState(0)
  const [voucherValid, setVoucherValid] = useState<boolean | null>(null)
  const [voucherMsg, setVoucherMsg] = useState('')
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')
  const [confirming, setConfirming] = useState(false)

  const steps = STEP_KEYS.map(k => t(k))

  const selectedSession = sessions.find(s => s.id === sessionId) || sessions[0]
  const activeSessionId = sessionId || sessions[0]?.id || ''

  const { slots } = useTimeSlots(activeSessionId)

  const availableDates = useMemo(() => {
    const dates = new Set<string>()
    slots.forEach(s => { if (!s.is_blocked && !s.is_booked) dates.add(s.date) })
    return Array.from(dates)
  }, [slots])

  const timesForDate = useMemo(() => {
    if (!date) return []
    const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
    return slots.filter(s => s.date === dateStr && !s.is_blocked && !s.is_booked)
  }, [slots, date])

  const basePrice = selectedSession ? selectedSession.price * numSessions : 0
  const total = Math.max(basePrice - voucherDiscount, 0)

  const canContinue = (() => {
    switch (step) {
      case 0: return !!activeSessionId
      case 1: return numSessions >= 3 && numSessions <= 7
      case 2: return !!date && !!time
      case 3: return true
      case 4: return true
      case 5: return true
      case 6: return true
      default: return false
    }
  })()

  const handleValidateVoucher = async () => {
    if (!voucherCode.trim()) return
    try {
      const result = await validateVoucher(voucherCode, activeSessionId, basePrice)
      setVoucherDiscount(Number(result.computed_discount))
      setVoucherValid(true)
      setVoucherMsg(fmt(t('booking.voucher.applied'), { value: result.discount_type === 'percentage' ? `${result.discount_value}%` : `$${result.discount_value}` }))
    } catch (e) {
      setVoucherValid(false)
      setVoucherDiscount(0)
      setVoucherMsg(getErrorMessage(e))
    }
  }

  const confirm = async () => {
    if (!currentUser || !date || !selectedSession) return
    setError('')
    setConfirming(true)
    try {
      const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      await createBooking({
        session_id: activeSessionId,
        date: dateStr,
        time,
        format,
        // The language picked in step 5. It was collected but never sent before.
        session_language: sessionLang,
        num_sessions: numSessions,
        voucher_code: voucherValid ? voucherCode : undefined,
        discount_amount: voucherDiscount,
      })
      setDone(true)
    } catch (e) {
      setError(getErrorMessage(e))
    } finally {
      setConfirming(false)
    }
  }

  if (done) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="mb-6 flex size-20 items-center justify-center rounded-full bg-primary/10">
          <Check className="size-9 text-primary" />
        </motion.div>
        <h2 className="font-heading text-3xl font-bold">{t('booking.done.title')}</h2>
        <p className="mt-3 max-w-md text-muted-foreground">
          {t('booking.done.body')}
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          {t('booking.done.note')}
        </p>
        <UIButton className="mt-8" onClick={() => { setDone(false); setStep(0); setDate(null); setTime(''); setVoucherCode(''); setVoucherDiscount(0); setVoucherValid(null) }}>
          {t('booking.done.again')}
        </UIButton>
      </div>
    )
  }

  return (
    <section className="overflow-x-clip bg-background pb-16 pt-24 sm:pb-24 sm:pt-32" id="book">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <div className="mb-10 text-center">
          <Eyebrow>{t('booking.eyebrow')}</Eyebrow>
          <h2 className="mt-3 font-heading text-3xl font-bold tracking-tight sm:text-4xl">{t('booking.title')}</h2>
        </div>

        {/* Progress */}
        <div
          className="mb-10 flex items-center justify-center gap-1"
          role="img"
          aria-label={`${fmt(t('booking.step_of'), { current: step + 1, total: steps.length })}: ${steps[step]}`}
        >
          {steps.map((s, i) => (
            <div key={s} className={cn('h-1.5 rounded-full transition-all duration-300', i <= step ? 'w-8 bg-primary' : 'w-4 bg-border')} />
          ))}
        </div>

        {error && <div className="mb-4 rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">{error}</div>}

        <AnimatePresence mode="wait">
          <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
            {/* Step 0: Choose session */}
            {step === 0 && (
              <div>
                <h3 className="text-center text-lg font-semibold mb-4">{t('booking.choose_session')}</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                {sessions.map((s) => (
                  <UICard
                    key={s.id}
                    onClick={() => setSessionId(s.id)}
                    aria-pressed={activeSessionId === s.id}
                    className={cn('cursor-pointer p-5 transition-all duration-200 hover:border-primary/30 hover:shadow-sm', activeSessionId === s.id && 'border-primary ring-2 ring-primary/20')}
                  >
                    <h3 className="font-heading text-lg font-bold">{l(s.title, s.title_ka)}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{l(s.description, s.description_ka) || (s.format === 'offline' ? t('booking.offline') : t('booking.online'))}</p>
                    <p className="mt-3 text-2xl font-bold text-primary">${s.price}<span className="text-sm font-normal text-muted-foreground">{t('booking.per_session')}</span></p>
                  </UICard>
                ))}
                </div>
              </div>
            )}

            {/* Step 1: Number of sessions */}
            {step === 1 && (
              <div className="text-center space-y-6">
                <h3 className="text-lg font-semibold">{t('booking.how_many')}</h3>
                <div className="flex items-center justify-center gap-6">
                  <button onClick={() => setNumSessions(Math.max(3, numSessions - 1))} aria-label={t('booking.fewer')} className="flex size-12 items-center justify-center rounded-full border border-border text-lg font-bold hover:bg-secondary">-</button>
                  <span className="font-heading text-5xl font-bold text-primary">{numSessions}</span>
                  <button onClick={() => setNumSessions(Math.min(7, numSessions + 1))} aria-label={t('booking.more')} className="flex size-12 items-center justify-center rounded-full border border-border text-lg font-bold hover:bg-secondary">+</button>
                </div>
                <input type="range" aria-label={t('booking.step.number')} min={3} max={7} value={numSessions} onChange={(e) => setNumSessions(Number(e.target.value))} className="w-full max-w-xs accent-primary" />
                <p className="text-sm text-muted-foreground">
                  {t('booking.total')}: <strong>${selectedSession ? selectedSession.price * numSessions : 0}</strong>
                </p>
                <div className="mx-auto max-w-xs rounded-xl border border-border bg-secondary/50 p-4 text-left">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground mb-2">{t('booking.validity')}</p>
                  <p className="text-sm font-medium">
                    {fmt(t('booking.validity.complete'), { n: VALIDITY_MONTHS[numSessions] ?? '' })}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">{t('booking.validity.note')}</p>
                </div>
              </div>
            )}

            {/* Step 2: Date & Time */}
            {step === 2 && (
              <div className="space-y-6">
                <h3 className="text-center text-lg font-semibold mb-2">{t('booking.pick_date')}</h3>
                <Calendar availableDates={availableDates} selected={date} onSelect={(d) => { setDate(d); setTime(''); setSelectedSlotId('') }} />
                {date && timesForDate.length > 0 && (
                  <div className="flex flex-wrap justify-center gap-2">
                    {timesForDate.map((slot) => (
                      <button
                        key={slot.id}
                        onClick={() => { setTime(slot.start_time); setSelectedSlotId(slot.id) }}
                        className={cn(
                          'inline-flex min-h-11 items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium border transition-all duration-150',
                          time === slot.start_time ? 'bg-primary text-primary-foreground border-primary' : 'border-border hover:border-primary/50',
                        )}
                      >
                        <Clock className="size-3.5" /> {slot.start_time.slice(0, 5)}
                      </button>
                    ))}
                  </div>
                )}
                {availableDates.length === 0 && (
                  <p className="text-center text-sm text-muted-foreground">{t('booking.no_times')}</p>
                )}
                {date && timesForDate.length === 0 && availableDates.length > 0 && (
                  <p className="text-center text-sm text-muted-foreground">{t('booking.no_slots_date')}</p>
                )}
              </div>
            )}

            {/* Step 3: Format */}
            {step === 3 && (
              <div>
                <h3 className="text-center text-lg font-semibold mb-4">{t('booking.choose_format')}</h3>
                <div className="grid gap-4 sm:grid-cols-2 max-w-lg mx-auto">
                <UICard
                  onClick={() => setFormat('online')}
                  aria-pressed={format === 'online'}
                  className={cn('cursor-pointer p-6 text-center transition-all', format === 'online' && 'border-primary ring-2 ring-primary/20')}
                >
                  <Monitor className="mx-auto size-8 text-primary mb-3" />
                  <h3 className="font-bold">{t('booking.online')}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{t('booking.online.desc')}</p>
                </UICard>
                <UICard
                  onClick={() => setFormat('offline')}
                  aria-pressed={format === 'offline'}
                  className={cn('cursor-pointer p-6 text-center transition-all', format === 'offline' && 'border-primary ring-2 ring-primary/20')}
                >
                  <Users className="mx-auto size-8 text-primary mb-3" />
                  <h3 className="font-bold">{t('booking.offline')}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{t('booking.offline.desc')}</p>
                </UICard>
                </div>
              </div>
            )}

            {/* Step 4: Session Language */}
            {step === 4 && (
              <div>
                <h3 className="text-center text-lg font-semibold mb-4">{t('booking.language')}</h3>
                <div className="grid gap-4 sm:grid-cols-2 max-w-lg mx-auto">
                  <UICard
                    onClick={() => setSessionLang('ka')}
                    aria-pressed={sessionLang === 'ka'}
                    className={cn('cursor-pointer p-6 text-center transition-all', sessionLang === 'ka' && 'border-primary ring-2 ring-primary/20')}
                  >
                    <span className="mx-auto mb-3 block text-3xl">🇬🇪</span>
                    <h3 className="font-bold">{t('booking.lang.ka')}</h3>
                  </UICard>
                  <UICard
                    onClick={() => setSessionLang('en')}
                    aria-pressed={sessionLang === 'en'}
                    className={cn('cursor-pointer p-6 text-center transition-all', sessionLang === 'en' && 'border-primary ring-2 ring-primary/20')}
                  >
                    <span className="mx-auto mb-3 block text-3xl">🇬🇧</span>
                    <h3 className="font-bold">{t('booking.lang.en')}</h3>
                  </UICard>
                </div>
              </div>
            )}

            {/* Step 5: Voucher */}
            {step === 5 && (
              <div className="max-w-md mx-auto space-y-4">
                <h3 className="text-center text-lg font-semibold mb-2">{t('booking.voucher_code')}</h3>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <div className="relative flex-1">
                    <Tag className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <input
                      value={voucherCode}
                      aria-label={t('booking.voucher_code')}
                      onChange={(e) => { setVoucherCode(e.target.value.toUpperCase()); setVoucherValid(null); setVoucherMsg('') }}
                      placeholder={t('booking.voucher_code')}
                      className="h-12 w-full rounded-xl border border-border bg-background pl-10 pr-4 text-base font-mono uppercase sm:text-sm placeholder:text-muted-foreground focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                    />
                  </div>
                  <UIButton onClick={handleValidateVoucher} disabled={!voucherCode.trim()} className="h-12 shrink-0">{t('booking.apply')}</UIButton>
                </div>
                {voucherMsg && (
                  <p className={cn('text-sm', voucherValid ? 'text-emerald-700' : 'text-destructive')}>{voucherMsg}</p>
                )}
                {!voucherCode && <p className="text-center text-xs text-muted-foreground">{t('booking.voucher.skip')}</p>}
              </div>
            )}

            {/* Step 6: Confirm */}
            {step === 6 && selectedSession && (
              <UICard className="mx-auto max-w-md space-y-4 p-5 sm:p-6">
                <h3 className="font-heading text-xl font-bold text-center">{t('booking.confirm_title')}</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between gap-4"><span className="shrink-0 text-muted-foreground">{t('booking.step.session')}</span><span className="text-right font-medium">{l(selectedSession.title, selectedSession.title_ka)}</span></div>
                  <div className="flex justify-between gap-4"><span className="shrink-0 text-muted-foreground">{t('booking.step.number')}</span><span className="font-medium">{numSessions}</span></div>
                  <div className="flex justify-between gap-4"><span className="shrink-0 text-muted-foreground">{t('booking.first_date')}</span><span className="font-medium">{date ? formatDate(date, locale) : ''}</span></div>
                  <div className="flex justify-between gap-4"><span className="shrink-0 text-muted-foreground">{t('booking.time')}</span><span className="font-medium">{formatTime(time)}</span></div>
                  <div className="flex justify-between gap-4"><span className="shrink-0 text-muted-foreground">{t('booking.step.format')}</span><span className="font-medium">{format === 'online' ? t('booking.online') : t('booking.offline')}</span></div>
                  <div className="flex justify-between gap-4"><span className="shrink-0 text-muted-foreground">{t('booking.language')}</span><span className="font-medium">{sessionLang === 'ka' ? t('booking.lang.ka') : t('booking.lang.en')}</span></div>
                  <div className="flex justify-between gap-4">
                    <span className="text-muted-foreground">{t('booking.valid_for')}</span>
                    <span className="font-medium">
                      {fmt(t('booking.months_n'), { n: VALIDITY_MONTHS[numSessions] ?? '' })}
                    </span>
                  </div>
                  {voucherValid && <div className="flex justify-between gap-4"><span className="shrink-0 text-muted-foreground">{t('booking.step.voucher')}</span><span className="font-medium text-emerald-700">-${voucherDiscount}</span></div>}
                  <hr className="border-border" />
                  <div className="flex justify-between text-base"><span className="font-semibold">{t('booking.total')}</span><span className="font-heading text-xl font-bold text-primary">${total}</span></div>
                </div>
                <p className="text-xs text-muted-foreground text-center">{t('booking.confirm.note')}</p>
              </UICard>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="mt-10 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
          <UIButton variant="outline" onClick={() => setStep(step - 1)} disabled={step === 0} className="w-full sm:w-auto">
            <ArrowLeft className="size-4" /> {t('booking.back')}
          </UIButton>
          {step < steps.length - 1 ? (
            <UIButton onClick={() => setStep(step + 1)} disabled={!canContinue} className="w-full sm:w-auto">
              {t('booking.continue')} <ArrowRight className="size-4" />
            </UIButton>
          ) : (
            <UIButton onClick={confirm} disabled={confirming || !currentUser} className="w-full sm:w-auto">
              {confirming ? t('booking.booking') : t('booking.confirm_pay')} <Check className="size-4" />
            </UIButton>
          )}
        </div>

        {step === steps.length - 1 && !currentUser && (
          <p className="mt-3 text-center text-sm text-muted-foreground sm:text-right">
            {t('booking.login_required')}
          </p>
        )}

        <ConsultationCTA />
      </div>
    </section>
  )
}
