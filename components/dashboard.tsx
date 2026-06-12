'use client'

import { motion } from 'motion/react'
import { useState } from 'react'
import {
  LayoutDashboard,
  TrendingUp,
  CalendarDays,
  Lock,
  BookOpen,
  CalendarPlus,
  UserRound,
  Crown,
  ArrowRight,
  Sparkles,
  Clock,
  MapPin,
  Gift,
  Check,
  PlayCircle,
  FileText,
  Plus,
  ListChecks,
  Menu,
  X,
} from 'lucide-react'
import { UIButton, UICard, UIInput, Eyebrow, UIBadge } from '@/components/ui-kit'
import { tiers, growthMilestones } from '@/lib/mock-data'
import { useMe } from '@/lib/hooks/useAuth'
import { useBookings } from '@/lib/hooks/useBookings'
import { useVault } from '@/lib/hooks/useVault'
import { useTests } from '@/lib/hooks/useTests'
import { useDiary, addDiaryEntry } from '@/lib/hooks/useDiary'
import { getErrorMessage } from '@/lib/api'
import { cn } from '@/lib/utils'

type Tab =
  | 'Overview'
  | 'Growth'
  | 'My Schedule'
  | 'Private Vault'
  | 'My Tests'
  | 'Diary'
  | 'Profile'

const navItems: { label: Tab | 'Book a Session'; icon: typeof LayoutDashboard }[] = [
  { label: 'Overview', icon: LayoutDashboard },
  { label: 'Growth', icon: TrendingUp },
  { label: 'My Schedule', icon: CalendarDays },
  { label: 'Private Vault', icon: Lock },
  { label: 'My Tests', icon: ListChecks },
  { label: 'Diary', icon: BookOpen },
  { label: 'Book a Session', icon: CalendarPlus },
  { label: 'Profile', icon: UserRound },
]

function SidebarContent({
  active,
  setActive,
  onBook,
}: {
  active: Tab
  setActive: (l: Tab) => void
  onBook: () => void
}) {
  return (
    <>
      <span className="font-heading text-2xl font-bold">
        Ascend<span className="text-primary">.</span>
      </span>
      <nav className="mt-10 flex flex-1 flex-col gap-1">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = active === item.label
          return (
            <button
              key={item.label}
              onClick={() =>
                item.label === 'Book a Session'
                  ? onBook()
                  : setActive(item.label as Tab)
              }
              className={cn(
                'flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                  : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground',
              )}
            >
              <Icon className="size-[18px]" />
              {item.label}
            </button>
          )
        })}
      </nav>
      <div className="mt-6 rounded-2xl border border-sidebar-border bg-sidebar-accent p-5">
        <Sparkles className="size-5 text-primary" />
        <p className="mt-3 text-sm font-semibold">Unlock the Vault</p>
        <p className="mt-1 text-xs text-sidebar-foreground/60">
          Exclusive recordings &amp; resources for Master tier.
        </p>
      </div>
    </>
  )
}

function TopBar({
  active,
  name,
  initials,
  tier,
  onMenu,
}: {
  active: Tab
  name: string
  initials: string
  tier: string
  onMenu: () => void
}) {
  return (
    <div className="flex items-center justify-between border-b border-border px-6 py-4">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenu}
          aria-label="Open menu"
          className="flex size-10 items-center justify-center rounded-full border border-border transition-colors hover:bg-secondary lg:hidden"
        >
          <Menu className="size-[18px]" />
        </button>
        <div>
          <p className="text-sm text-muted-foreground">{active}</p>
          <h1 className="font-heading text-xl font-bold tracking-tight">
            Welcome back, {name}
          </h1>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span className="hidden items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-primary sm:inline-flex">
          <Crown className="size-3.5" />
          {tier}
        </span>
        <div className="flex size-10 items-center justify-center rounded-full bg-foreground text-sm font-semibold text-background">
          {initials}
        </div>
      </div>
    </div>
  )
}

function GamificationWidget({ xp, tier }: { xp: number; tier: string }) {
  const currentIdx = Math.max(0, tiers.findIndex((t) => t.name === tier))
  const nextTier = tiers[currentIdx + 1]
  const floor = tiers[currentIdx].xp
  const ceil = nextTier ? nextTier.xp : tiers[currentIdx].xp
  const progress = nextTier ? Math.min(100, ((xp - floor) / (ceil - floor)) * 100) : 100

  return (
    <UICard className="overflow-hidden bg-foreground p-7 text-background">
      <div className="flex items-center justify-between">
        <Eyebrow className="text-primary">Your Growth</Eyebrow>
        <span className="text-sm text-background/60">{xp.toLocaleString()} XP</span>
      </div>
      <p className="mt-4 font-heading text-2xl font-bold">
        {nextTier
          ? `${(ceil - xp).toLocaleString()} XP to ${nextTier.name}`
          : 'Max tier reached'}
      </p>
      <div className="mt-6 h-3 w-full overflow-hidden rounded-full bg-background/15">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="h-full rounded-full bg-primary"
        />
      </div>
      <div className="mt-5 flex justify-between">
        {tiers.map((t, i) => (
          <div
            key={t.name}
            className={cn(
              'flex flex-col items-center gap-1.5 text-xs',
              i <= currentIdx ? 'text-primary' : 'text-background/40',
            )}
          >
            <span
              className={cn(
                'size-2.5 rounded-full',
                i <= currentIdx ? 'bg-primary' : 'bg-background/30',
              )}
            />
            {t.name}
          </div>
        ))}
      </div>
    </UICard>
  )
}

function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string
  value: string
  icon: typeof Gift
}) {
  return (
    <UICard className="flex items-center gap-4 p-5">
      <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <Icon className="size-5" />
      </div>
      <div>
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="font-heading text-xl font-bold">{value}</p>
      </div>
    </UICard>
  )
}

function SectionHeader({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div>
      <Eyebrow>{eyebrow}</Eyebrow>
      <h2 className="mt-2 font-heading text-2xl font-bold tracking-tight">{title}</h2>
    </div>
  )
}

/* ----------------------------- Tab: Overview ----------------------------- */
function OverviewTab({ onBook }: { onBook: () => void }) {
  const { user: currentUser } = useMe()
  const { bookings } = useBookings()
  const { diary } = useDiary()
  const u = currentUser!
  const myBookings = bookings
  const nextBooking = myBookings[0]

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <GamificationWidget xp={u.xp} tier={u.tier} />
        <div className="grid gap-6 sm:grid-cols-2">
          <StatCard label="XP earned" value={u.xp.toLocaleString()} icon={TrendingUp} />
          <StatCard label="Vouchers" value={`${u.vouchers} active`} icon={Gift} />
          <StatCard label="Sessions" value={`${myBookings.length} booked`} icon={CalendarDays} />
          <StatCard label="Current tier" value={u.tier} icon={Crown} />
        </div>
      </div>
      <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
        <UICard className="flex flex-col justify-between bg-primary p-7 text-primary-foreground">
          <div>
            <Eyebrow className="text-primary-foreground/70">Next Session</Eyebrow>
            <h3 className="mt-4 font-heading text-2xl font-bold">
              {nextBooking ? nextBooking.session_title : 'No sessions yet'}
            </h3>
            <div className="mt-5 space-y-2 text-sm">
              <p className="flex items-center gap-2">
                <Clock className="size-4" />{' '}
                {nextBooking ? `${nextBooking.date} · ${nextBooking.time}` : 'Book your first session'}
              </p>
              <p className="flex items-center gap-2">
                <MapPin className="size-4" />{' '}
                {nextBooking
                  ? nextBooking.format === 'online'
                    ? 'Online · Zoom'
                    : 'In-Person · Lisbon'
                  : '—'}
              </p>
            </div>
          </div>
          <UIButton variant="dark" onClick={onBook} className="mt-8 w-full">
            {nextBooking ? 'Manage booking' : 'Book a session'}
            <ArrowRight className="size-4" />
          </UIButton>
        </UICard>
        <UICard className="p-7">
          <div className="flex items-center justify-between">
            <Eyebrow>Recent Diary</Eyebrow>
            <span className="text-sm font-semibold text-primary">View all</span>
          </div>
          <div className="mt-5 divide-y divide-border">
            {diary.slice(0, 3).map((entry, i) => (
              <div key={String(entry.id ?? '') + i} className="flex items-start gap-4 py-4 first:pt-0 last:pb-0">
                <span className="mt-0.5 w-16 shrink-0 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {entry.date}
                </span>
                <div className="flex-1">
                  <p className="font-semibold">{entry.title}</p>
                  <p className="mt-0.5 text-sm text-muted-foreground">{entry.excerpt}</p>
                </div>
                <span className="rounded-full bg-secondary px-2.5 py-1 text-[11px] font-medium text-foreground/70">
                  {entry.mood}
                </span>
              </div>
            ))}
          </div>
        </UICard>
      </div>
    </div>
  )
}

/* ----------------------------- Tab: Growth ----------------------------- */
function GrowthTab() {
  const { user: currentUser } = useMe()
  const u = currentUser!
  const done = growthMilestones.filter((m) => m.done).length
  return (
    <div className="space-y-6">
      <SectionHeader eyebrow="Your Journey" title="Growth & milestones" />
      <GamificationWidget xp={u.xp} tier={u.tier} />
      <UICard className="p-7">
        <div className="flex items-center justify-between">
          <h3 className="font-heading text-lg font-bold">Milestones</h3>
          <span className="text-sm text-muted-foreground">
            {done}/{growthMilestones.length} complete
          </span>
        </div>
        <div className="mt-5 space-y-3">
          {growthMilestones.map((m) => (
            <div
              key={m.label}
              className="flex items-center gap-3 rounded-xl border border-border px-4 py-3"
            >
              <span
                className={cn(
                  'flex size-6 shrink-0 items-center justify-center rounded-full',
                  m.done ? 'bg-primary text-primary-foreground' : 'border border-border text-muted-foreground',
                )}
              >
                {m.done ? <Check className="size-3.5" /> : <span className="size-1.5 rounded-full bg-muted-foreground" />}
              </span>
              <span className={cn('text-sm font-medium', !m.done && 'text-muted-foreground')}>
                {m.label}
              </span>
            </div>
          ))}
        </div>
      </UICard>
    </div>
  )
}

/* ----------------------------- Tab: Schedule ----------------------------- */
function ScheduleTab({ onBook }: { onBook: () => void }) {
  const { bookings: myBookings } = useBookings()
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <SectionHeader eyebrow="Upcoming" title="My sessions" />
        <UIButton size="sm" onClick={onBook}>
          <Plus className="size-4" /> New booking
        </UIButton>
      </div>
      {myBookings.length === 0 && (
        <UICard className="p-8 text-center text-muted-foreground">
          No bookings yet. Book your first session to see it here.
        </UICard>
      )}
      <div className="space-y-4">
        {myBookings.map((s) => {
          const needsScheduling = s.sessions_used < s.num_sessions && s.booking_sessions?.length < s.num_sessions && !s.is_expired
          return (
            <UICard key={s.id} className="p-6 space-y-3">
              {s.is_expired && (
                <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-3 py-2 text-xs font-medium text-destructive">
                  This booking has expired. Sessions can no longer be scheduled.
                </div>
              )}
              {!s.is_expired && s.expires_at && (
                <div className="rounded-lg bg-orange-500/10 border border-orange-500/20 px-3 py-2 text-xs font-medium text-orange-600">
                  Expires: {new Date(s.expires_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </div>
              )}
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex size-14 flex-col items-center justify-center rounded-xl bg-secondary text-center">
                    <span className="text-[10px] font-medium uppercase text-muted-foreground">
                      {s.date ? s.date.split(' ')[0] : '—'}
                    </span>
                    <span className="font-heading text-lg font-bold leading-none">
                      {s.date ? (s.date.split(' ')[1]?.replace(',', '') ?? '·') : '·'}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold">{s.session_title}</p>
                    <p className="text-sm text-muted-foreground">
                      {s.sessions_used}/{s.num_sessions} sessions used
                      {s.is_package && ' · Package'}
                    </p>
                    <div className="mt-1 flex flex-wrap gap-x-3 text-xs text-muted-foreground">
                      {s.time && <span className="inline-flex items-center gap-1"><Clock className="size-3" /> {s.time}</span>}
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="size-3" /> {s.format === 'online' ? 'Online' : 'In-Person'}
                      </span>
                    </div>
                    {s.meet_link && (
                      <a href={s.meet_link} target="_blank" rel="noopener noreferrer" className="mt-1 inline-flex items-center gap-1 text-xs text-primary hover:underline">
                        Join Google Meet
                      </a>
                    )}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span
                    className={cn(
                      'rounded-full px-3 py-1 text-xs font-semibold',
                      s.status === 'Confirmed' ? 'bg-primary/10 text-primary' :
                      s.status === 'Expired' ? 'bg-orange-500/10 text-orange-600' :
                      s.status === 'Cancelled' ? 'bg-destructive/10 text-destructive' :
                      'bg-secondary text-muted-foreground',
                    )}
                  >
                    {s.status}
                  </span>
                  {needsScheduling && (
                    <span className="text-xs text-primary font-medium">Schedule next session from your calendar</span>
                  )}
                </div>
              </div>
              {/* Show individual sessions within this booking */}
              {s.booking_sessions && s.booking_sessions.length > 0 && (
                <div className="mt-3 border-t border-border pt-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground mb-2">Sessions</p>
                  <div className="space-y-1.5">
                    {s.booking_sessions.map((bs) => (
                      <div key={bs.id} className="flex items-center justify-between text-xs">
                        <span>#{bs.session_number} — {bs.date || 'Not scheduled'} {bs.time ? `at ${bs.time}` : ''}</span>
                        <div className="flex items-center gap-2">
                          {bs.meet_link && <a href={bs.meet_link} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Meet link</a>}
                          <span className={cn('rounded-full px-2 py-0.5 font-medium', bs.status === 'completed' ? 'bg-emerald-500/10 text-emerald-600' : bs.status === 'scheduled' ? 'bg-primary/10 text-primary' : 'bg-secondary text-muted-foreground')}>
                            {bs.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </UICard>
          )
        })}
      </div>
    </div>
  )
}

/* ----------------------------- Tab: Vault ----------------------------- */
function VaultTab() {
  const { user: currentUser } = useMe()
  const { vault } = useVault()
  const personal = vault.filter((v) => v.assigned_to_id === currentUser?.id)
  const shared = vault.filter((v) => v.assigned_to_id === null)

  const VaultCard = ({ v }: { v: (typeof vault)[number] }) => {
    const Icon = v.kind.startsWith('PDF') || v.category === 'Book' ? FileText : PlayCircle
    return (
      <UICard className={cn('flex items-center gap-4 p-5', v.locked && 'opacity-70')}>
        <div
          className={cn(
            'flex size-12 shrink-0 items-center justify-center rounded-xl',
            v.locked ? 'bg-secondary text-muted-foreground' : 'bg-primary/10 text-primary',
          )}
        >
          {v.locked ? <Lock className="size-5" /> : <Icon className="size-5" />}
        </div>
        <div className="flex-1">
          <p className="font-semibold">{v.title}</p>
          <p className="text-xs text-muted-foreground">{v.kind} · by {v.added_by_name}</p>
        </div>
        {v.locked ? (
          <span className="rounded-full bg-secondary px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
            Master
          </span>
        ) : v.file_url ? (
          <a
            href={v.file_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-medium text-primary-foreground transition-all hover:bg-primary/90 hover:scale-105 active:scale-95"
          >
            <ArrowRight className="size-3.5" />
            Open
          </a>
        ) : null}
      </UICard>
    )
  }

  return (
    <div className="space-y-8">
      <SectionHeader eyebrow="Members Only" title="Private vault" />

      <div>
        <div className="mb-4 flex items-center gap-2">
          <UIBadge>Assigned to you</UIBadge>
        </div>
        {personal.length === 0 ? (
          <UICard className="p-6 text-sm text-muted-foreground">
            Your coach hasn&apos;t uploaded anything personal yet. Items assigned to you
            from the admin panel will appear here.
          </UICard>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {personal.map((v) => (
              <VaultCard key={v.id} v={v} />
            ))}
          </div>
        )}
      </div>

      <div>
        <div className="mb-4 flex items-center gap-2">
          <UIBadge>Shared library</UIBadge>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {shared.map((v) => (
            <VaultCard key={v.id} v={v} />
          ))}
        </div>
      </div>
    </div>
  )
}

/* ----------------------------- Tab: My Tests ----------------------------- */
function MyTestsTab() {
  const { vault } = useVault()
  const { tests } = useTests()
  const assignedTests = vault.filter((v) => v.category === 'Test')
  const open = tests.filter((t) => t.published)

  return (
    <div className="space-y-8">
      <SectionHeader eyebrow="Assigned & open" title="My tests" />

      <div>
        <div className="mb-4">
          <UIBadge>Assigned by your coach</UIBadge>
        </div>
        {assignedTests.length === 0 ? (
          <UICard className="p-6 text-sm text-muted-foreground">
            No tests have been assigned to you yet.
          </UICard>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {assignedTests.map((v) => (
              <UICard key={v.id} className="flex items-center gap-4 p-5">
                <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <ListChecks className="size-5" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold">{v.title}</p>
                  <p className="text-xs text-muted-foreground">Assigned by {v.added_by_name}</p>
                </div>
              </UICard>
            ))}
          </div>
        )}
      </div>

      <div>
        <div className="mb-4">
          <UIBadge>Open assessments</UIBadge>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {open.map((t) => (
            <UICard key={t.id} className="p-5">
              <p className="font-semibold">{t.title}</p>
              <p className="mt-1 text-sm text-muted-foreground">{t.description}</p>
              <p className="mt-3 text-xs text-muted-foreground">
                {t.questions.length} questions · {t.category}
              </p>
            </UICard>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ----------------------------- Tab: Diary ----------------------------- */
function DiaryTab() {
  const { diary } = useDiary()
  const [draft, setDraft] = useState('')
  const [diaryError, setDiaryError] = useState('')

  const addEntry = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!draft.trim()) return
    setDiaryError('')
    try {
      await addDiaryEntry({
        date: new Date().toISOString().split('T')[0],
        title: 'New reflection',
        excerpt: draft.trim(),
        mood: 'Open',
      })
      setDraft('')
    } catch (err) {
      setDiaryError(getErrorMessage(err))
    }
  }

  return (
    <div className="space-y-6">
      <SectionHeader eyebrow="Reflections" title="Your diary" />
      <UICard className="p-6">
        <form onSubmit={addEntry} className="flex flex-col gap-3 sm:flex-row">
          <UIInput
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="What did you notice today?"
            className="flex-1"
          />
          <UIButton type="submit" className="shrink-0">
            Add entry
            <Plus className="size-4" />
          </UIButton>
        </form>
        {diaryError && (
          <p className="mt-3 text-sm text-red-600 dark:text-red-400">{diaryError}</p>
        )}
      </UICard>
      <div className="space-y-3">
        {diary.map((entry, i) => (
          <UICard key={String(entry.id ?? '') + i} className="flex items-start gap-4 p-5">
            <span className="mt-0.5 w-16 shrink-0 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {entry.date}
            </span>
            <div className="flex-1">
              <p className="font-semibold">{entry.title}</p>
              <p className="mt-0.5 text-sm text-muted-foreground">{entry.excerpt}</p>
            </div>
            <span className="rounded-full bg-secondary px-2.5 py-1 text-[11px] font-medium text-foreground/70">
              {entry.mood}
            </span>
          </UICard>
        ))}
      </div>
    </div>
  )
}

/* ----------------------------- Tab: Profile ----------------------------- */
function ProfileTab() {
  const { user: currentUser } = useMe()
  const u = currentUser!
  const [name, setName] = useState(u?.name ?? '')
  const [email, setEmail] = useState(u?.email ?? '')
  const [saved, setSaved] = useState(false)
  const [profileError, setProfileError] = useState('')

  const save = async () => {
    setProfileError('')
    try {
      const res = await fetch('/api/auth/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw { status: res.status, data }
      }
      setSaved(true)
      setTimeout(() => setSaved(false), 1500)
    } catch (err: unknown) {
      const e = err as { data?: Record<string, unknown> }
      const d = e?.data
      if (d) {
        const msgs: string[] = []
        for (const [key, val] of Object.entries(d)) {
          if (Array.isArray(val)) msgs.push(`${key.replace(/_/g, ' ')}: ${val.join(' ')}`)
          else if (typeof val === 'string') msgs.push(val)
        }
        setProfileError(msgs.join(' ') || 'Failed to save changes.')
      } else {
        setProfileError('Failed to save changes. Please try again.')
      }
    }
  }

  return (
    <div className="space-y-6">
      <SectionHeader eyebrow="Account" title="Your profile" />
      <UICard className="p-7">
        <div className="flex items-center gap-5">
          <div className="flex size-20 items-center justify-center rounded-full bg-foreground text-2xl font-semibold text-background">
            {u.initials}
          </div>
          <div>
            <p className="font-heading text-2xl font-bold">{u.name}</p>
            <p className="flex items-center gap-1.5 text-sm text-primary">
              <Crown className="size-4" /> {u.tier} tier · {u.xp.toLocaleString()} XP
            </p>
          </div>
        </div>
        <div className="mt-8 grid gap-5 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Full name
            </label>
            <UIInput value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Email
            </label>
            <UIInput value={email} onChange={(e) => setEmail(e.target.value)} type="email" />
          </div>
        </div>
        {profileError && (
          <p className="mt-4 text-sm text-red-600 dark:text-red-400">{profileError}</p>
        )}
        <UIButton className="mt-7" onClick={save}>
          {saved ? 'Saved!' : 'Save changes'}
        </UIButton>
      </UICard>
    </div>
  )
}

export function Dashboard({ onBook }: { onBook: () => void }) {
  const { user: currentUser } = useMe()
  const [active, setActive] = useState<Tab>('Overview')
  const [drawerOpen, setDrawerOpen] = useState(false)

  if (!currentUser) return null

  const pick = (t: Tab) => {
    setActive(t)
    setDrawerOpen(false)
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 flex-col bg-sidebar p-6 pt-24 text-sidebar-foreground lg:flex">
        <SidebarContent active={active} setActive={pick} onBook={onBook} />
      </aside>

      {/* Mobile drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <div
            className="absolute inset-0 bg-foreground/50 backdrop-blur-sm"
            onClick={() => setDrawerOpen(false)}
            aria-hidden
          />
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            className="relative flex h-full w-72 flex-col bg-sidebar p-6 text-sidebar-foreground"
          >
            <button
              onClick={() => setDrawerOpen(false)}
              aria-label="Close menu"
              className="absolute right-4 top-4 flex size-9 items-center justify-center rounded-full text-sidebar-foreground/70 hover:bg-sidebar-accent"
            >
              <X className="size-5" />
            </button>
            <SidebarContent active={active} setActive={pick} onBook={onBook} />
          </motion.aside>
        </div>
      )}

      <div className="flex min-h-screen flex-1 flex-col">
        <div className="pt-20 lg:pt-20">
          <TopBar
            active={active}
            name={currentUser.name.split(' ')[0]}
            initials={currentUser.initials}
            tier={currentUser.tier}
            onMenu={() => setDrawerOpen(true)}
          />
        </div>
        <main className="flex-1 p-6">
          {active === 'Overview' && <OverviewTab onBook={onBook} />}
          {active === 'Growth' && <GrowthTab />}
          {active === 'My Schedule' && <ScheduleTab onBook={onBook} />}
          {active === 'Private Vault' && <VaultTab />}
          {active === 'My Tests' && <MyTestsTab />}
          {active === 'Diary' && <DiaryTab />}
          {active === 'Profile' && <ProfileTab />}
        </main>
      </div>
    </div>
  )
}
