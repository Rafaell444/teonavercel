'use client'

import { useState, useMemo } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Check, ChevronLeft, ChevronRight, Clock, ArrowRight, Sparkles } from 'lucide-react'
import { UIButton, UICard, Eyebrow } from '@/components/ui-kit'
import { usePackages, useTimeSlots } from '@/lib/hooks/useSessions'
import type { Package } from '@/lib/hooks/useSessions'
import { createBooking } from '@/lib/hooks/useBookings'
import { useMe } from '@/lib/hooks/useAuth'
import { getErrorMessage } from '@/lib/api'
import { cn } from '@/lib/utils'

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]
const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate())
}

function MiniCalendar({ availableDates, selected, onSelect }: { availableDates: string[], selected: Date | null, onSelect: (d: Date) => void }) {
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
    <div className="w-full max-w-xs mx-auto">
      <div className="flex items-center justify-between mb-2">
        <button onClick={() => { if (canPrev) { if (viewMonth === 0) { setViewMonth(11); setViewYear(viewYear - 1) } else setViewMonth(viewMonth - 1) } }} disabled={!canPrev} className="p-1 rounded-lg hover:bg-secondary disabled:opacity-30"><ChevronLeft className="size-4" /></button>
        <span className="text-xs font-semibold">{MONTH_NAMES[viewMonth]} {viewYear}</span>
        <button onClick={() => { if (canNext) { if (viewMonth === 11) { setViewMonth(0); setViewYear(viewYear + 1) } else setViewMonth(viewMonth + 1) } }} disabled={!canNext} className="p-1 rounded-lg hover:bg-secondary disabled:opacity-30"><ChevronRight className="size-4" /></button>
      </div>
      <div className="grid grid-cols-7 gap-0.5 mb-1">
        {WEEKDAYS.map((w) => <div key={w} className="text-center text-[9px] font-semibold text-muted-foreground py-0.5">{w}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-0.5">
        {cells.map((cell, i) => {
          if (!cell) return <div key={`e-${i}`} />
          const dateStr = `${cell.getFullYear()}-${String(cell.getMonth() + 1).padStart(2, '0')}-${String(cell.getDate()).padStart(2, '0')}`
          const isAvailable = availableSet.has(dateStr)
          const isPast = cell < today
          const isSelected = selected && cell.getTime() === selected.getTime()
          const disabled = isPast || !isAvailable

          return (
            <button key={dateStr} disabled={disabled} onClick={() => onSelect(cell)} className={cn('aspect-square rounded text-[10px] font-medium transition-all relative', isSelected ? 'bg-primary text-primary-foreground' : '', !isSelected && isAvailable && !isPast ? 'hover:bg-primary/10' : '', disabled ? 'text-muted-foreground/30 cursor-not-allowed' : 'cursor-pointer')}>
              {cell.getDate()}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default function PackageBooking() {
  const { user: currentUser } = useMe()
  const { packages } = usePackages()
  const [selectedPkg, setSelectedPkg] = useState<Package | null>(null)
  const [firstSessionId, setFirstSessionId] = useState('')
  const [date, setDate] = useState<Date | null>(null)
  const [time, setTime] = useState('')
  const [format, setFormat] = useState<'online' | 'offline'>('online')
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')
  const [confirming, setConfirming] = useState(false)

  const activeSessionId = firstSessionId || selectedPkg?.sessions_detail?.[0]?.id || ''
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

  const confirm = async () => {
    if (!currentUser || !selectedPkg || !date) return
    setError('')
    setConfirming(true)
    try {
      const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      await createBooking({
        session_id: activeSessionId,
        date: dateStr,
        time,
        format,
        num_sessions: selectedPkg.sessions_detail?.length || 4,
        is_package: true,
        package_duration_months: selectedPkg.duration_months,
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
        <h2 className="font-heading text-3xl font-bold">Package booked!</h2>
        <p className="mt-3 max-w-md text-muted-foreground">
          Your first session is scheduled. After each session, you&apos;ll choose the date, time, and format (live or online) for your next one from your dashboard.
        </p>
        <p className="mt-2 text-sm text-muted-foreground">Package duration: {selectedPkg?.duration_months} months</p>
        <UIButton className="mt-8" onClick={() => { setDone(false); setSelectedPkg(null); setDate(null); setTime('') }}>
          Back to packages
        </UIButton>
      </div>
    )
  }

  if (packages.length === 0) {
    return (
      <section className="bg-background py-16 sm:py-24" id="packages">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <Eyebrow>Packages</Eyebrow>
          <h2 className="mt-3 font-heading text-3xl font-bold tracking-tight sm:text-4xl">No packages available</h2>
          <p className="mt-4 text-muted-foreground">Check back soon for bundled session packages.</p>
        </div>
      </section>
    )
  }

  return (
    <section className="bg-background py-16 sm:py-24" id="packages">
      <div className="mx-auto max-w-4xl px-6">
        <div className="text-center mb-10">
          <Eyebrow>Big Packages</Eyebrow>
          <h2 className="mt-3 font-heading text-3xl font-bold tracking-tight sm:text-4xl">All sessions together</h2>
          <p className="mt-3 max-w-xl mx-auto text-muted-foreground">
            Get the complete transformation experience with all sessions bundled together.
          </p>
        </div>

        {error && <div className="mb-4 rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive text-center">{error}</div>}

        {!selectedPkg ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {packages.map((pkg) => (
              <UICard key={pkg.id} className="p-6 flex flex-col transition-all duration-200 hover:border-primary/30 hover:shadow-md cursor-pointer" onClick={() => setSelectedPkg(pkg)}>
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="size-5 text-primary" />
                  <h3 className="font-heading text-lg font-bold">{pkg.title}</h3>
                </div>
                {pkg.description && <p className="text-sm text-muted-foreground mb-4 flex-1">{pkg.description}</p>}
                <div className="space-y-2 text-sm text-muted-foreground mb-4">
                  <p>{pkg.duration_months} months duration</p>
                  <p>{pkg.sessions_detail?.length || 0} sessions included</p>
                </div>
                <div className="mt-auto">
                  <p className="font-heading text-2xl font-bold text-primary">${pkg.price}</p>
                  <UIButton className="mt-3 w-full" size="sm">Select <ArrowRight className="size-4" /></UIButton>
                </div>
              </UICard>
            ))}
          </div>
        ) : (
          <div className="max-w-lg mx-auto space-y-6">
            <UICard className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-heading text-xl font-bold">{selectedPkg.title}</h3>
                <button onClick={() => setSelectedPkg(null)} className="text-sm text-muted-foreground hover:text-foreground">Change</button>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Choose the date and time for your <strong>first session</strong>. After each session, you&apos;ll select the date for the next one from your dashboard.
              </p>

              {selectedPkg.sessions_detail && selectedPkg.sessions_detail.length > 1 && (
                <div className="mb-4">
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Start with</label>
                  <div className="flex flex-wrap gap-2">
                    {selectedPkg.sessions_detail.map(s => (
                      <button key={s.id} onClick={() => { setFirstSessionId(s.id); setDate(null); setTime('') }} className={cn('px-3 py-1.5 rounded-full text-xs font-medium border transition-all', (activeSessionId === s.id) ? 'bg-primary text-primary-foreground border-primary' : 'border-border hover:border-primary/50')}>
                        {s.title}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {availableDates.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No available times for this session yet. Ask the administrator to add availability under Sessions → Individual.</p>
              ) : (
              <MiniCalendar availableDates={availableDates} selected={date} onSelect={(d) => { setDate(d); setTime('') }} />
              )}

              {date && timesForDate.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {timesForDate.map((slot) => (
                    <button key={slot.id} onClick={() => setTime(slot.start_time)} className={cn('inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium border transition-all', time === slot.start_time ? 'bg-primary text-primary-foreground border-primary' : 'border-border hover:border-primary/50')}>
                      <Clock className="size-3" /> {slot.start_time.slice(0, 5)}
                    </button>
                  ))}
                </div>
              )}

              <div className="flex gap-3 mt-4">
                <button onClick={() => setFormat('online')} className={cn('flex-1 rounded-xl border p-3 text-center text-sm font-medium transition-all', format === 'online' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/30')}>Online</button>
                <button onClick={() => setFormat('offline')} className={cn('flex-1 rounded-xl border p-3 text-center text-sm font-medium transition-all', format === 'offline' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/30')}>In-Person</button>
              </div>
            </UICard>

            <UICard className="p-5">
              <div className="flex justify-between text-sm mb-2"><span className="text-muted-foreground">Package</span><span className="font-medium">{selectedPkg.title}</span></div>
              <div className="flex justify-between text-sm mb-2"><span className="text-muted-foreground">Duration</span><span className="font-medium">{selectedPkg.duration_months} months</span></div>
              <hr className="border-border my-2" />
              <div className="flex justify-between"><span className="font-semibold">Total</span><span className="font-heading text-xl font-bold text-primary">${selectedPkg.price}</span></div>
            </UICard>

            <UIButton className="w-full" onClick={confirm} disabled={confirming || !date || !time || !currentUser}>
              {confirming ? 'Booking...' : 'Confirm & Pay'} <Check className="size-4" />
            </UIButton>
          </div>
        )}
      </div>
    </section>
  )
}
