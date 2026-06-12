'use client'

import { useState, useEffect, useRef } from 'react'
import { CalendarDays, Clock, MapPin, Monitor, Check, X } from 'lucide-react'
import { UIButton, UICard, Eyebrow } from '@/components/ui-kit'
import { useSessions, useGroupSchedules, useGroupSeats, claimGroupSeat, releaseGroupSeat } from '@/lib/hooks/useSessions'
import type { GroupSeatPurchaseResult } from '@/lib/hooks/useSessions'
import { useMe } from '@/lib/hooks/useAuth'
import { getErrorMessage } from '@/lib/api'
import { cn } from '@/lib/utils'

function useCountUp(target: number, duration = 1200) {
  const [count, setCount] = useState(0)
  const rafRef = useRef<number | undefined>(undefined)
  useEffect(() => {
    const start = performance.now()
    const animate = (now: number) => {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)
      setCount(Math.round(progress * target))
      if (progress < 1) rafRef.current = requestAnimationFrame(animate)
    }
    rafRef.current = requestAnimationFrame(animate)
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [target, duration])
  return count
}

export default function RoundTable() {
  const { user: currentUser } = useMe()
  const { sessions } = useSessions('group')
  const [selectedSession, setSelectedSession] = useState<string>('')
  const [selectedSchedule, setSelectedSchedule] = useState<string>('')
  const [seatError, setSeatError] = useState('')
  const [pendingSeat, setPendingSeat] = useState<number | null>(null)
  const [purchasing, setPurchasing] = useState(false)
  const [purchaseResult, setPurchaseResult] = useState<GroupSeatPurchaseResult | null>(null)

  const activeSessionId = selectedSession || sessions[0]?.id || ''
  const { schedules } = useGroupSchedules(activeSessionId)
  const activeScheduleId = selectedSchedule || schedules[0]?.id || ''
  const { seats } = useGroupSeats(activeScheduleId)

  const activeSchedule = schedules.find(s => s.id === activeScheduleId)
  const activeSession = sessions.find(s => s.id === activeSessionId)

  const total = seats.length
  const filled = seats.filter(s => s.user !== null).length
  const filledCount = useCountUp(filled)
  const mySeat = seats.find(s => s.user === currentUser?.id)

  const handleSeatClick = (seatNumber: number) => {
    setSeatError('')
    setPurchaseResult(null)
    if (!currentUser) {
      setSeatError('Please log in to reserve a seat.')
      return
    }
    if (mySeat) return
    setPendingSeat(seatNumber)
  }

  const handleConfirmPurchase = async () => {
    if (!pendingSeat || !activeSchedule || !activeSession) return
    setSeatError('')
    setPurchasing(true)
    try {
      const result = await claimGroupSeat(activeScheduleId, pendingSeat)
      setPurchaseResult(result)
      setPendingSeat(null)
    } catch (e) {
      setSeatError(getErrorMessage(e))
    } finally {
      setPurchasing(false)
    }
  }

  const handleRelease = async (seatNumber: number) => {
    setSeatError('')
    setPurchaseResult(null)
    try {
      await releaseGroupSeat(activeScheduleId, seatNumber)
    } catch (e) { setSeatError(getErrorMessage(e)) }
  }

  if (sessions.length === 0) {
    return (
      <section className="bg-background py-16 sm:py-24" id="group-sessions">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <Eyebrow>Group Sessions</Eyebrow>
          <h2 className="mt-3 font-heading text-3xl font-bold tracking-tight sm:text-4xl">No group sessions available</h2>
          <p className="mt-4 text-muted-foreground">Check back soon for upcoming group coaching sessions.</p>
        </div>
      </section>
    )
  }

  return (
    <section className="bg-background py-16 sm:py-24" id="group-sessions">
      <div className="mx-auto max-w-4xl px-6">
        <div className="text-center mb-10">
          <Eyebrow>Group Sessions</Eyebrow>
          <h2 className="mt-3 font-heading text-3xl font-bold tracking-tight sm:text-4xl">
            {activeSession?.title || 'The Breakthrough Circle'}
          </h2>
          <p className="mt-3 max-w-xl mx-auto text-muted-foreground">
            Choose your seat, confirm your booking, and pay to secure your spot.
          </p>
        </div>

        {sessions.length > 1 && (
          <div className="flex flex-wrap justify-center gap-2 mb-6">
            {sessions.map(s => (
              <button key={s.id} onClick={() => { setSelectedSession(s.id); setSelectedSchedule(''); setPendingSeat(null); setPurchaseResult(null) }} className={cn('px-4 py-2 rounded-full text-sm font-medium border transition-all', activeSessionId === s.id ? 'bg-primary text-primary-foreground border-primary' : 'border-border hover:border-primary/50')}>
                {s.title}
              </button>
            ))}
          </div>
        )}

        {schedules.length > 1 && (
          <div className="flex flex-wrap justify-center gap-2 mb-6">
            {schedules.map(sch => (
              <button key={sch.id} onClick={() => { setSelectedSchedule(sch.id); setPendingSeat(null); setPurchaseResult(null) }} className={cn('px-3 py-1.5 rounded-full text-xs font-medium border transition-all', activeScheduleId === sch.id ? 'bg-foreground text-background' : 'border-border hover:border-primary/50')}>
                {sch.date} · {sch.start_time}
              </button>
            ))}
          </div>
        )}

        {activeSchedule && (
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-xs font-medium"><CalendarDays className="size-3.5" /> {activeSchedule.date}</span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-xs font-medium"><Clock className="size-3.5" /> {activeSchedule.start_time}</span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-xs font-medium">
              {activeSchedule.format === 'online' ? <Monitor className="size-3.5" /> : <MapPin className="size-3.5" />}
              {activeSchedule.format === 'online' ? 'Online · Live' : activeSchedule.location || 'In-Person'}
            </span>
          </div>
        )}

        {seatError && <div className="mb-4 rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive text-center">{seatError}</div>}

        {purchaseResult && (
          <UICard className="mx-auto mb-6 max-w-md p-6 text-center border-primary/30 bg-primary/5">
            <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-primary/10">
              <Check className="size-6 text-primary" />
            </div>
            <h3 className="font-heading text-lg font-bold">Seat confirmed!</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Seat #{purchaseResult.seat.seat_number} · {purchaseResult.booking.session_title}
            </p>
            <p className="mt-1 text-sm font-semibold text-primary">
              Paid ${Number(purchaseResult.booking.total).toLocaleString()} (mock)
            </p>
            {purchaseResult.booking.meet_link && (
              <a href={purchaseResult.booking.meet_link} target="_blank" rel="noopener noreferrer" className="mt-3 inline-block text-sm font-medium text-primary hover:underline">
                Open Google Meet link
              </a>
            )}
            {activeSchedule?.format === 'offline' && activeSchedule.location && (
              <p className="mt-2 text-sm text-muted-foreground">{activeSchedule.location}</p>
            )}
            <p className="mt-3 text-xs text-muted-foreground">This booking also appears in your dashboard.</p>
          </UICard>
        )}

        {schedules.length === 0 && (
          <UICard className="mx-auto max-w-md p-8 text-center">
            <p className="text-muted-foreground">No scheduled dates for this group session yet.</p>
            <p className="mt-1 text-xs text-muted-foreground">The administrator needs to add a schedule from the admin panel.</p>
          </UICard>
        )}

        {seats.length > 0 && (
        <>
        <div className="relative mx-auto size-[380px] sm:size-[420px]">
          <div className="absolute inset-0 m-auto flex size-28 flex-col items-center justify-center rounded-full border-2 border-border bg-card">
            <span className="font-heading text-3xl font-bold text-primary">{filledCount}</span>
            <span className="text-xs text-muted-foreground">/ {total}</span>
          </div>

          {seats.map((seat, i) => {
            const angle = (i / total) * 2 * Math.PI - Math.PI / 2
            const radius = 168
            const x = 50 + (radius / 210) * 50 * Math.cos(angle)
            const y = 50 + (radius / 210) * 50 * Math.sin(angle)
            const isOccupied = seat.user !== null
            const isMine = seat.user === currentUser?.id
            const isPending = pendingSeat === seat.seat_number

            return (
              <div
                key={seat.id}
                className="absolute -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${x}%`, top: `${y}%` }}
              >
                {isOccupied ? (
                  <div className={cn('flex size-11 items-center justify-center rounded-full text-xs font-bold transition-all', isMine ? 'bg-primary text-primary-foreground ring-2 ring-primary/30' : 'bg-secondary text-secondary-foreground')}>
                    {seat.user_initials || `S${seat.seat_number}`}
                  </div>
                ) : (
                  <button
                    onClick={() => handleSeatClick(seat.seat_number)}
                    disabled={!!mySeat || purchasing}
                    className={cn(
                      'flex size-11 items-center justify-center rounded-full border-2 text-primary transition-all hover:border-primary hover:bg-primary/5 disabled:opacity-40 disabled:cursor-not-allowed',
                      isPending ? 'border-primary bg-primary/10 ring-2 ring-primary/30' : 'border-dashed border-primary/30',
                    )}
                  >
                    +
                  </button>
                )}
              </div>
            )
          })}
        </div>

        {pendingSeat && activeSession && activeSchedule && !mySeat && (
          <UICard className="mt-6 mx-auto max-w-md p-6 border-primary/30">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-heading text-lg font-bold">Confirm your seat</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Seat #{pendingSeat} · {activeSession.title}
                </p>
              </div>
              <button onClick={() => setPendingSeat(null)} className="text-muted-foreground hover:text-foreground" aria-label="Cancel">
                <X className="size-5" />
              </button>
            </div>
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Date</span><span>{activeSchedule.date}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Time</span><span>{activeSchedule.start_time}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Format</span><span>{activeSchedule.format === 'online' ? 'Online' : 'In-Person'}</span></div>
              <hr className="border-border" />
              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span className="font-heading text-xl text-primary">${activeSession.price}</span>
              </div>
            </div>
            <UIButton className="mt-5 w-full" onClick={handleConfirmPurchase} disabled={purchasing}>
              {purchasing ? 'Processing...' : 'Confirm & Pay'}
            </UIButton>
            <p className="mt-2 text-center text-xs text-muted-foreground">Payment is mocked — your seat is confirmed immediately.</p>
          </UICard>
        )}

        {!pendingSeat && (
        <UICard className="mt-8 mx-auto max-w-md p-5 text-center">
          {mySeat ? (
            <>
              <p className="text-sm font-medium">You have <strong>Seat #{mySeat.seat_number}</strong> — booking confirmed</p>
              <UIButton size="sm" variant="outline" className="mt-3" onClick={() => handleRelease(mySeat.seat_number)}>
                Cancel reservation
              </UIButton>
            </>
          ) : (
            <>
              <p className="text-sm text-muted-foreground">{total - filled} seats remaining</p>
              <p className="mt-1 text-xs text-muted-foreground">Click an empty seat, then confirm and pay.</p>
              {activeSession && <p className="mt-2 font-heading text-lg font-bold text-primary">${activeSession.price}/seat</p>}
            </>
          )}
        </UICard>
        )}
        </>
        )}

        {activeSchedule?.format === 'offline' && activeSchedule.location_maps_url && (
          <UICard className="mt-4 mx-auto max-w-md p-5">
            <div className="flex items-center gap-3">
              <MapPin className="size-5 text-primary shrink-0" />
              <div>
                <p className="text-sm font-medium">{activeSchedule.location || 'Tbilisi'}</p>
                <a href={activeSchedule.location_maps_url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline">
                  Open in Google Maps
                </a>
              </div>
            </div>
          </UICard>
        )}
      </div>
    </section>
  )
}
