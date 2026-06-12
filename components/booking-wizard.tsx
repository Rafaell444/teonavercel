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
import { UIButton, UICard, Eyebrow } from '@/components/ui-kit'
import { useSessions, useTimeSlots } from '@/lib/hooks/useSessions'
import { createBooking } from '@/lib/hooks/useBookings'
import { validateVoucher } from '@/lib/hooks/useVouchers'
import { useMe } from '@/lib/hooks/useAuth'
import { getErrorMessage } from '@/lib/api'
import { cn } from '@/lib/utils'

const steps = ['Session', 'Number of Sessions', 'Date & Time', 'Format', 'Voucher', 'Confirm']
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]
const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate())
}

function Calendar({ availableDates, selected, onSelect }: { availableDates: string[], selected: Date | null, onSelect: (d: Date) => void }) {
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
        <button onClick={() => { if (canPrev) { if (viewMonth === 0) { setViewMonth(11); setViewYear(viewYear - 1) } else setViewMonth(viewMonth - 1) } }} disabled={!canPrev} className="p-1.5 rounded-lg hover:bg-secondary disabled:opacity-30">
          <ChevronLeft className="size-4" />
        </button>
        <span className="text-sm font-semibold">{MONTH_NAMES[viewMonth]} {viewYear}</span>
        <button onClick={() => { if (canNext) { if (viewMonth === 11) { setViewMonth(0); setViewYear(viewYear + 1) } else setViewMonth(viewMonth + 1) } }} disabled={!canNext} className="p-1.5 rounded-lg hover:bg-secondary disabled:opacity-30">
          <ChevronRight className="size-4" />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 mb-1">
        {WEEKDAYS.map((w) => <div key={w} className="text-center text-[10px] font-semibold text-muted-foreground py-1">{w}</div>)}
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
              onClick={() => onSelect(cell)}
              className={cn(
                'aspect-square rounded-lg text-xs font-medium transition-all duration-150 relative',
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
  const { user: currentUser } = useMe()
  const { sessions } = useSessions('individual')
  const [step, setStep] = useState(0)
  const [sessionId, setSessionId] = useState('')
  const [numSessions, setNumSessions] = useState(3)
  const [date, setDate] = useState<Date | null>(null)
  const [selectedSlotId, setSelectedSlotId] = useState('')
  const [time, setTime] = useState('')
  const [format, setFormat] = useState<'online' | 'offline'>('online')
  const [voucherCode, setVoucherCode] = useState('')
  const [voucherDiscount, setVoucherDiscount] = useState(0)
  const [voucherValid, setVoucherValid] = useState<boolean | null>(null)
  const [voucherMsg, setVoucherMsg] = useState('')
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')
  const [confirming, setConfirming] = useState(false)

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
      default: return false
    }
  })()

  const handleValidateVoucher = async () => {
    if (!voucherCode.trim()) return
    try {
      const result = await validateVoucher(voucherCode, activeSessionId, basePrice)
      setVoucherDiscount(Number(result.computed_discount))
      setVoucherValid(true)
      setVoucherMsg(`Code applied! ${result.discount_type === 'percentage' ? `${result.discount_value}% off` : `$${result.discount_value} off`}`)
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
        <h2 className="font-heading text-3xl font-bold">You&apos;re booked!</h2>
        <p className="mt-3 max-w-md text-muted-foreground">
          This date and time is for your <strong>first session</strong>. After each session, you&apos;ll be able to choose the date and time for your next one.
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          Your sessions expire based on your package — make sure to schedule them in time!
        </p>
        <UIButton className="mt-8" onClick={() => { setDone(false); setStep(0); setDate(null); setTime(''); setVoucherCode(''); setVoucherDiscount(0); setVoucherValid(null) }}>
          Book another
        </UIButton>
      </div>
    )
  }

  return (
    <section className="bg-background py-16 sm:py-24" id="book">
      <div className="mx-auto max-w-3xl px-6">
        <div className="mb-10 text-center">
          <Eyebrow>Book a session</Eyebrow>
          <h2 className="mt-3 font-heading text-3xl font-bold tracking-tight sm:text-4xl">Start your journey</h2>
        </div>

        {/* Progress */}
        <div className="mb-10 flex items-center justify-center gap-1">
          {steps.map((s, i) => (
            <div key={s} className={cn('h-1.5 rounded-full transition-all duration-300', i <= step ? 'w-8 bg-primary' : 'w-4 bg-border')} />
          ))}
        </div>

        {error && <div className="mb-4 rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">{error}</div>}

        <AnimatePresence mode="wait">
          <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
            {/* Step 0: Choose session */}
            {step === 0 && (
              <div className="grid gap-4 sm:grid-cols-2">
                {sessions.map((s) => (
                  <UICard
                    key={s.id}
                    onClick={() => setSessionId(s.id)}
                    className={cn('cursor-pointer p-5 transition-all duration-200 hover:border-primary/30 hover:shadow-sm', activeSessionId === s.id && 'border-primary ring-2 ring-primary/20')}
                  >
                    <h3 className="font-heading text-lg font-bold">{s.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{s.description || s.format}</p>
                    <p className="mt-3 text-2xl font-bold text-primary">${s.price}<span className="text-sm font-normal text-muted-foreground">/session</span></p>
                  </UICard>
                ))}
              </div>
            )}

            {/* Step 1: Number of sessions */}
            {step === 1 && (
              <div className="text-center space-y-6">
                <p className="text-muted-foreground">Choose how many sessions you&apos;d like (3-7)</p>
                <div className="flex items-center justify-center gap-6">
                  <button onClick={() => setNumSessions(Math.max(3, numSessions - 1))} className="flex size-12 items-center justify-center rounded-full border border-border text-lg font-bold hover:bg-secondary">-</button>
                  <span className="font-heading text-5xl font-bold text-primary">{numSessions}</span>
                  <button onClick={() => setNumSessions(Math.min(7, numSessions + 1))} className="flex size-12 items-center justify-center rounded-full border border-border text-lg font-bold hover:bg-secondary">+</button>
                </div>
                <input type="range" min={3} max={7} value={numSessions} onChange={(e) => setNumSessions(Number(e.target.value))} className="w-full max-w-xs accent-primary" />
                <p className="text-sm text-muted-foreground">
                  Total: <strong>${selectedSession ? selectedSession.price * numSessions : 0}</strong>
                </p>
                <div className="mx-auto max-w-xs rounded-xl border border-border bg-secondary/50 p-4 text-left">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground mb-2">Validity period</p>
                  <p className="text-sm font-medium">
                    {numSessions === 3 && '1.5 months to complete all sessions'}
                    {numSessions === 4 && '2 months to complete all sessions'}
                    {numSessions === 5 && '3 months to complete all sessions'}
                    {numSessions === 6 && '3 months to complete all sessions'}
                    {numSessions === 7 && '5 months to complete all sessions'}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">Sessions expire after this period — no refunds for unused sessions.</p>
                </div>
              </div>
            )}

            {/* Step 2: Date & Time */}
            {step === 2 && (
              <div className="space-y-6">
                <p className="text-center text-sm text-muted-foreground">This date and time is for your <strong>first session</strong>. You&apos;ll choose dates for subsequent sessions after each one.</p>
                <Calendar availableDates={availableDates} selected={date} onSelect={(d) => { setDate(d); setTime(''); setSelectedSlotId('') }} />
                {date && timesForDate.length > 0 && (
                  <div className="flex flex-wrap justify-center gap-2">
                    {timesForDate.map((slot) => (
                      <button
                        key={slot.id}
                        onClick={() => { setTime(slot.start_time); setSelectedSlotId(slot.id) }}
                        className={cn(
                          'inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium border transition-all duration-150',
                          time === slot.start_time ? 'bg-primary text-primary-foreground border-primary' : 'border-border hover:border-primary/50',
                        )}
                      >
                        <Clock className="size-3.5" /> {slot.start_time.slice(0, 5)}
                      </button>
                    ))}
                  </div>
                )}
                {availableDates.length === 0 && (
                  <p className="text-center text-sm text-muted-foreground">No available times yet — the administrator needs to add availability for this session.</p>
                )}
                {date && timesForDate.length === 0 && availableDates.length > 0 && (
                  <p className="text-center text-sm text-muted-foreground">No available slots for this date.</p>
                )}
              </div>
            )}

            {/* Step 3: Format */}
            {step === 3 && (
              <div className="grid gap-4 sm:grid-cols-2 max-w-lg mx-auto">
                <UICard
                  onClick={() => setFormat('online')}
                  className={cn('cursor-pointer p-6 text-center transition-all', format === 'online' && 'border-primary ring-2 ring-primary/20')}
                >
                  <Monitor className="mx-auto size-8 text-primary mb-3" />
                  <h3 className="font-bold">Online</h3>
                  <p className="text-xs text-muted-foreground mt-1">Google Meet link will be generated</p>
                </UICard>
                <UICard
                  onClick={() => setFormat('offline')}
                  className={cn('cursor-pointer p-6 text-center transition-all', format === 'offline' && 'border-primary ring-2 ring-primary/20')}
                >
                  <Users className="mx-auto size-8 text-primary mb-3" />
                  <h3 className="font-bold">In-Person</h3>
                  <p className="text-xs text-muted-foreground mt-1">Tbilisi location with directions</p>
                </UICard>
              </div>
            )}

            {/* Step 4: Voucher */}
            {step === 4 && (
              <div className="max-w-md mx-auto space-y-4">
                <p className="text-center text-muted-foreground">Have a promo code? Enter it below (optional).</p>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <input
                      value={voucherCode}
                      onChange={(e) => { setVoucherCode(e.target.value.toUpperCase()); setVoucherValid(null); setVoucherMsg('') }}
                      placeholder="PROMO CODE"
                      className="h-12 w-full rounded-xl border border-border bg-background pl-10 pr-4 text-sm font-mono uppercase placeholder:text-muted-foreground focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                    />
                  </div>
                  <UIButton onClick={handleValidateVoucher} disabled={!voucherCode.trim()}>Apply</UIButton>
                </div>
                {voucherMsg && (
                  <p className={cn('text-sm', voucherValid ? 'text-emerald-600' : 'text-destructive')}>{voucherMsg}</p>
                )}
                {!voucherCode && <p className="text-center text-xs text-muted-foreground">You can skip this step if you don&apos;t have a code.</p>}
              </div>
            )}

            {/* Step 5: Confirm */}
            {step === 5 && selectedSession && (
              <UICard className="p-6 space-y-4 max-w-md mx-auto">
                <h3 className="font-heading text-xl font-bold text-center">Confirm your booking</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">Session</span><span className="font-medium">{selectedSession.title}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Sessions</span><span className="font-medium">{numSessions}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">First session date</span><span className="font-medium">{date?.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Time</span><span className="font-medium">{time}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Format</span><span className="font-medium">{format === 'online' ? 'Online' : 'In-Person'}</span></div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Valid for</span>
                    <span className="font-medium">
                      {numSessions === 3 && '1.5 months'}
                      {numSessions === 4 && '2 months'}
                      {numSessions === 5 && '3 months'}
                      {numSessions === 6 && '3 months'}
                      {numSessions === 7 && '5 months'}
                    </span>
                  </div>
                  {voucherValid && <div className="flex justify-between"><span className="text-muted-foreground">Voucher</span><span className="font-medium text-emerald-600">-${voucherDiscount}</span></div>}
                  <hr className="border-border" />
                  <div className="flex justify-between text-base"><span className="font-semibold">Total</span><span className="font-heading text-xl font-bold text-primary">${total}</span></div>
                </div>
                <p className="text-xs text-muted-foreground text-center">After your first session, you&apos;ll choose date and time for each subsequent session. Unused sessions are not refunded after the validity period.</p>
              </UICard>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="mt-10 flex items-center justify-between">
          <UIButton variant="outline" onClick={() => setStep(step - 1)} disabled={step === 0}>
            <ArrowLeft className="size-4" /> Back
          </UIButton>
          {step < steps.length - 1 ? (
            <UIButton onClick={() => setStep(step + 1)} disabled={!canContinue}>
              Continue <ArrowRight className="size-4" />
            </UIButton>
          ) : (
            <UIButton onClick={confirm} disabled={confirming || !currentUser}>
              {confirming ? 'Booking...' : 'Confirm & Pay'} <Check className="size-4" />
            </UIButton>
          )}
        </div>
      </div>
    </section>
  )
}
