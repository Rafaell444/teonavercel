'use client'

import { motion } from 'motion/react'
import { useEffect, useId, useRef, useState } from 'react'
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
  ShieldAlert,
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
import { useT, useLocale, fmt } from '@/lib/i18n'
import { formatDate, formatTime, dateParts } from '@/lib/format'

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

const tabKeys: Record<Tab | 'Book a Session', string> = {
  Overview: 'dash.tab.overview',
  Growth: 'dash.tab.growth',
  'My Schedule': 'dash.tab.schedule',
  'Private Vault': 'dash.tab.vault',
  'My Tests': 'dash.tab.tests',
  Diary: 'dash.tab.diary',
  'Book a Session': 'dash.tab.book',
  Profile: 'dash.tab.profile',
}

function SidebarContent({
  active,
  setActive,
  onBook,
}: {
  active: Tab
  setActive: (l: Tab) => void
  onBook: () => void
}) {
  const tr = useT()
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
              aria-current={isActive ? 'page' : undefined}
              className={cn(
                'flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                  : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground',
              )}
            >
              <Icon className="size-[18px]" />
              {tr(tabKeys[item.label])}
            </button>
          )
        })}
      </nav>
      <div className="mt-6 rounded-2xl border border-sidebar-border bg-sidebar-accent p-5">
        <Sparkles className="size-5 text-primary" />
        <p className="mt-3 text-sm font-semibold">{tr('dash.vault_card.title')}</p>
        <p className="mt-1 text-xs text-sidebar-foreground/60">
          {tr('dash.vault_card.body')}
        </p>
      </div>
    </>
  )
}

function TopBar({
  active,
  name,
  tier,
}: {
  active: Tab
  name: string
  tier: string
}) {
  const tr = useT()
  return (
    <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-4 sm:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <div className="min-w-0">
          <p className="text-sm text-muted-foreground">{tr(tabKeys[active])}</p>
          <h1 className="truncate font-heading text-lg font-bold tracking-tight sm:text-xl">
            {fmt(tr('dash.welcome'), { name })}
          </h1>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-3">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-primary-ink">
          <Crown className="size-3.5" />
          {tier}
        </span>
      </div>
    </div>
  )
}

function GamificationWidget({ xp, tier }: { xp: number; tier: string }) {
  const tr = useT()
  const currentIdx = Math.max(0, tiers.findIndex((t) => t.name === tier))
  const nextTier = tiers[currentIdx + 1]
  const floor = tiers[currentIdx].xp
  const ceil = nextTier ? nextTier.xp : tiers[currentIdx].xp
  const progress = nextTier ? Math.min(100, ((xp - floor) / (ceil - floor)) * 100) : 100

  return (
    <UICard className="overflow-hidden bg-foreground p-5 text-background sm:p-7">
      <div className="flex items-center justify-between">
        <Eyebrow className="text-primary">{tr('dash.growth.eyebrow')}</Eyebrow>
        <span className="text-sm text-background/60">{xp.toLocaleString()} XP</span>
      </div>
      <p className="mt-4 font-heading text-xl font-bold sm:text-2xl">
        {nextTier
          ? fmt(tr('dash.growth.to_next'), { xp: (ceil - xp).toLocaleString(), tier: nextTier.name })
          : tr('dash.growth.max')}
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
      <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <Icon className="size-5" />
      </div>
      <div className="min-w-0">
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
function OverviewTab({ onBook, onOpenDiary }: { onBook: () => void; onOpenDiary: () => void }) {
  const tr = useT()
  const locale = useLocale()
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
          <StatCard label={tr('dash.stat.xp')} value={u.xp.toLocaleString()} icon={TrendingUp} />
          <StatCard label={tr('dash.stat.vouchers')} value={fmt(tr('dash.stat.vouchers_n'), { n: u.vouchers })} icon={Gift} />
          <StatCard label={tr('dash.stat.sessions')} value={fmt(tr('dash.stat.sessions_n'), { n: myBookings.length })} icon={CalendarDays} />
          <StatCard label={tr('dash.stat.tier')} value={u.tier} icon={Crown} />
        </div>
      </div>
      <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
        <UICard className="flex flex-col justify-between bg-primary p-5 text-primary-foreground sm:p-7">
          <div>
            <Eyebrow className="text-primary-foreground/70">{tr('dash.next.eyebrow')}</Eyebrow>
            <h3 className="mt-4 font-heading text-2xl font-bold">
              {nextBooking ? nextBooking.session_title : tr('dash.next.none')}
            </h3>
            <div className="mt-5 space-y-2 text-sm">
              <p className="flex items-center gap-2">
                <Clock className="size-4" />{' '}
                {nextBooking
                  ? `${formatDate(nextBooking.date, locale)} · ${formatTime(nextBooking.time)}`
                  : tr('dash.next.book_first')}
              </p>
              <p className="flex items-center gap-2">
                <MapPin className="size-4" />{' '}
                {nextBooking
                  ? nextBooking.format === 'online'
                    ? tr('dash.next.online')
                    : tr('format.in_person')
                  : '—'}
              </p>
            </div>
          </div>
          <UIButton variant="dark" onClick={onBook} className="mt-8 w-full">
            {nextBooking ? tr('dash.next.book_another') : tr('dash.tab.book')}
            <ArrowRight className="size-4" />
          </UIButton>
        </UICard>
        <UICard className="p-5 sm:p-7">
          <div className="flex items-center justify-between">
            <Eyebrow>{tr('dash.diary.recent')}</Eyebrow>
            <button
              type="button"
              onClick={onOpenDiary}
              className="text-sm font-semibold text-primary-ink hover:underline"
            >
              {tr('dash.diary.view_all')}
            </button>
          </div>
          <div className="mt-5 divide-y divide-border">
            {diary.slice(0, 3).map((entry, i) => (
              <div key={String(entry.id ?? '') + i} className="flex flex-wrap items-start gap-x-4 gap-y-1 py-4 first:pt-0 last:pb-0">
                <span className="mt-0.5 w-full shrink-0 text-xs font-medium uppercase tracking-wide text-muted-foreground sm:w-20">
                  {formatDate(entry.date, locale, { year: false })}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">{entry.title}</p>
                  <p className="mt-0.5 text-sm text-muted-foreground">{entry.excerpt}</p>
                </div>
                <span className="shrink-0 rounded-full bg-secondary px-2.5 py-1 text-[11px] font-medium text-foreground/70">
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
  const tr = useT()
  const locale = useLocale()
  return (
    <div className="space-y-6">
      <SectionHeader eyebrow={tr('dash.journey.eyebrow')} title={tr('dash.journey.title')} />
      <GamificationWidget xp={u.xp} tier={u.tier} />
      <UICard className="p-5 sm:p-7">
        <div className="flex items-center justify-between gap-3">
          <h3 className="font-heading text-lg font-bold">{tr('dash.milestones')}</h3>
          <span className="text-sm text-muted-foreground">
            {fmt(tr('dash.milestones.count'), { done, total: growthMilestones.length })}
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
                {locale === 'ka' ? m.label_ka : m.label}
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
  const tr = useT()
  const locale = useLocale()
  // Statuses come from the server in English; fall back to the raw value if one is new
  const statusLabel = (status: string) => {
    const key = `status.${status}`
    const label = tr(key)
    return label === key ? status : label
  }
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <SectionHeader eyebrow={tr('dash.schedule.eyebrow')} title={tr('dash.schedule.title')} />
        <UIButton size="sm" onClick={onBook}>
          <Plus className="size-4" /> {tr('dash.schedule.new')}
        </UIButton>
      </div>
      {myBookings.length === 0 && (
        <UICard className="p-8 text-center text-muted-foreground">
          {tr('dash.schedule.empty')}
        </UICard>
      )}
      <div className="space-y-4">
        {myBookings.map((s) => {
          const needsScheduling = s.sessions_used < s.num_sessions && s.booking_sessions?.length < s.num_sessions && !s.is_expired
          return (
            <UICard key={s.id} className="space-y-3 p-4 sm:p-6">
              {s.is_expired && (
                <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-3 py-2 text-xs font-medium text-destructive">
                  {tr('dash.schedule.expired')}
                </div>
              )}
              {!s.is_expired && s.expires_at && (
                <div className="rounded-lg bg-orange-500/10 border border-orange-500/20 px-3 py-2 text-xs font-medium text-orange-700">
                  {fmt(tr('dash.schedule.expires'), { date: formatDate(s.expires_at, locale) })}
                </div>
              )}
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex size-14 shrink-0 flex-col items-center justify-center rounded-xl bg-secondary text-center">
                    <span className="text-[10px] font-medium uppercase text-muted-foreground">
                      {dateParts(s.date, locale)?.month ?? (s.date ? s.date.split(' ')[0] : '—')}
                    </span>
                    <span className="font-heading text-lg font-bold leading-none">
                      {dateParts(s.date, locale)?.day ?? (s.date ? (s.date.split(' ')[1]?.replace(',', '') ?? '·') : '·')}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold">{s.session_title}</p>
                    <p className="text-sm text-muted-foreground">
                      {fmt(tr('dash.schedule.used'), { used: s.sessions_used, total: s.num_sessions })}
                      {s.is_package && ` · ${tr('packages.package')}`}
                    </p>
                    <div className="mt-1 flex flex-wrap gap-x-3 text-xs text-muted-foreground">
                      {s.time && <span className="inline-flex items-center gap-1"><Clock className="size-3" /> {formatTime(s.time)}</span>}
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="size-3" /> {s.format === 'online' ? tr('booking.online') : tr('format.in_person')}
                      </span>
                    </div>
                    {s.meet_link && (
                      <a href={s.meet_link} target="_blank" rel="noopener noreferrer" className="mt-1 inline-flex items-center gap-1 text-xs text-primary-ink hover:underline">
                        {tr('dash.schedule.join')}
                      </a>
                    )}
                  </div>
                </div>
                <div className="flex flex-row flex-wrap items-center gap-2 sm:flex-col sm:items-end">
                  <span
                    className={cn(
                      'rounded-full px-3 py-1 text-xs font-semibold',
                      s.status === 'Confirmed' ? 'bg-primary/10 text-primary-ink' :
                      s.status === 'Expired' ? 'bg-orange-500/10 text-orange-700' :
                      s.status === 'Cancelled' ? 'bg-destructive/10 text-destructive' :
                      'bg-secondary text-muted-foreground',
                    )}
                  >
                    {statusLabel(s.status)}
                  </span>
                  {needsScheduling && (
                    <span className="text-xs text-primary-ink font-medium">{tr('dash.schedule.next_hint')}</span>
                  )}
                </div>
              </div>
              {/* Show individual sessions within this booking */}
              {s.booking_sessions && s.booking_sessions.length > 0 && (
                <div className="mt-3 border-t border-border pt-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground mb-2">{tr('dash.schedule.sessions')}</p>
                  <div className="space-y-1.5">
                    {s.booking_sessions.map((bs) => (
                      <div key={bs.id} className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-xs">
                        <span>#{bs.session_number} — {bs.date ? formatDate(bs.date, locale) : tr('dash.schedule.not_scheduled')}{bs.time ? ` · ${formatTime(bs.time)}` : ''}</span>
                        <div className="flex shrink-0 items-center gap-2">
                          {bs.meet_link && <a href={bs.meet_link} target="_blank" rel="noopener noreferrer" className="text-primary-ink hover:underline">{tr('dash.schedule.meet')}</a>}
                          <span className={cn('rounded-full px-2 py-0.5 font-medium', bs.status === 'completed' ? 'bg-emerald-500/10 text-emerald-700' : bs.status === 'scheduled' ? 'bg-primary/10 text-primary-ink' : 'bg-secondary text-muted-foreground')}>
                            {statusLabel(bs.status)}
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
  const tr = useT()

  const VaultCard = ({ v }: { v: (typeof vault)[number] }) => {
    const Icon = v.kind.startsWith('PDF') || v.category === 'Book' ? FileText : PlayCircle
    return (
      <UICard className={cn('flex items-center gap-4 p-4 sm:p-5', v.locked && 'opacity-70')}>
        <div
          className={cn(
            'flex size-12 shrink-0 items-center justify-center rounded-xl',
            v.locked ? 'bg-secondary text-muted-foreground' : 'bg-primary/10 text-primary',
          )}
        >
          {v.locked ? <Lock className="size-5" /> : <Icon className="size-5" />}
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-semibold break-words">{v.title}</p>
          <p className="text-xs text-muted-foreground">{v.kind}{v.added_by_name ? ` · ${fmt(tr('dash.by'), { name: v.added_by_name })}` : ''}</p>
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
            {tr('dash.vault.open')}
          </a>
        ) : null}
      </UICard>
    )
  }

  return (
    <div className="space-y-8">
      <SectionHeader eyebrow={tr('dash.vault.eyebrow')} title={tr('dash.vault.title')} />

      <div>
        <div className="mb-4 flex items-center gap-2">
          <UIBadge>{tr('dash.vault.assigned')}</UIBadge>
        </div>
        {personal.length === 0 ? (
          <UICard className="p-6 text-sm text-muted-foreground">
            {tr('dash.vault.assigned_empty')}
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
          <UIBadge>{tr('dash.vault.shared')}</UIBadge>
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
  const tr = useT()

  return (
    <div className="space-y-8">
      <SectionHeader eyebrow={tr('dash.tests.eyebrow')} title={tr('dash.tests.title')} />

      <div>
        <div className="mb-4">
          <UIBadge>{tr('dash.tests.assigned')}</UIBadge>
        </div>
        {assignedTests.length === 0 ? (
          <UICard className="p-6 text-sm text-muted-foreground">
            {tr('dash.tests.assigned_empty')}
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
                  <p className="text-xs text-muted-foreground">{fmt(tr('dash.tests.assigned_by'), { name: v.added_by_name ?? '' })}</p>
                </div>
              </UICard>
            ))}
          </div>
        )}
      </div>

      <div>
        <div className="mb-4">
          <UIBadge>{tr('dash.tests.open')}</UIBadge>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {open.map((t) => (
            <UICard key={t.id} className="p-5">
              <p className="font-semibold">{t.title}</p>
              <p className="mt-1 text-sm text-muted-foreground">{t.description}</p>
              <p className="mt-3 text-xs text-muted-foreground">
                {fmt(tr('tests.questions_n'), { n: t.questions.length })} · {t.category}
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
  const t = useT()
  const locale = useLocale()
  const [draft, setDraft] = useState('')
  const [diaryError, setDiaryError] = useState('')

  const addEntry = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!draft.trim()) return
    setDiaryError('')
    try {
      await addDiaryEntry({
        date: new Date().toISOString().split('T')[0],
        title: t('dash.diary.new_title'),
        excerpt: draft.trim(),
        mood: t('dash.diary.mood_open'),
      })
      setDraft('')
    } catch (err) {
      setDiaryError(getErrorMessage(err))
    }
  }

  return (
    <div className="space-y-6">
      <SectionHeader eyebrow={t('dashboard.diary.eyebrow')} title={t('dashboard.diary.title')} />
      <div className="flex items-start gap-3 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-600 dark:text-red-400">
        <ShieldAlert className="mt-0.5 size-5 shrink-0" />
        <p><strong>{t('dashboard.diary.privacy_bold')}</strong> {t('dashboard.diary.privacy')}</p>
      </div>
      <UICard className="p-6">
        <form onSubmit={addEntry} className="flex flex-col gap-3 sm:flex-row">
          <UIInput
            value={draft}
            aria-label={t('dashboard.diary.placeholder')}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={t('dashboard.diary.placeholder')}
            className="sm:flex-1"
          />
          <UIButton type="submit" className="shrink-0">
            {t('dashboard.diary.add')}
            <Plus className="size-4" />
          </UIButton>
        </form>
        {diaryError && (
          <p className="mt-3 text-sm text-red-600 dark:text-red-400">{diaryError}</p>
        )}
      </UICard>
      <div className="space-y-3">
        {diary.map((entry, i) => (
          <UICard key={String(entry.id ?? '') + i} className="flex flex-wrap items-start gap-x-4 gap-y-1 p-5">
            <span className="mt-0.5 w-full shrink-0 text-xs font-medium uppercase tracking-wide text-muted-foreground sm:w-20">
              {formatDate(entry.date, locale, { year: false })}
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-semibold">{entry.title}</p>
              <p className="mt-0.5 text-sm text-muted-foreground">{entry.excerpt}</p>
            </div>
            <span className="shrink-0 rounded-full bg-secondary px-2.5 py-1 text-[11px] font-medium text-foreground/70">
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
  const tr = useT()
  const fid = useId()

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
        setProfileError(msgs.join(' ') || tr('dash.profile.error'))
      } else {
        setProfileError(tr('dash.profile.error'))
      }
    }
  }

  return (
    <div className="space-y-6">
      <SectionHeader eyebrow={tr('dash.profile.eyebrow')} title={tr('dash.profile.title')} />
      <UICard className="p-5 sm:p-7">
        <div className="flex items-center gap-4 sm:gap-5">
          <div className="flex size-16 shrink-0 items-center justify-center rounded-full bg-foreground text-xl font-semibold text-background sm:size-20 sm:text-2xl">
            {u.initials}
          </div>
          <div className="min-w-0">
            <p className="font-heading text-xl font-bold break-words sm:text-2xl">{u.name}</p>
            <p className="flex items-center gap-1.5 text-sm text-primary-ink">
              <Crown className="size-4" /> {fmt(tr('dash.profile.tier_xp'), { tier: u.tier, xp: u.xp.toLocaleString() })}
            </p>
          </div>
        </div>
        <div className="mt-8 grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor={`${fid}-0`} className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              {tr('auth.name')}
            </label>
            <UIInput id={`${fid}-0`} value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <label htmlFor={`${fid}-1`} className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              {tr('auth.email')}
            </label>
            <UIInput id={`${fid}-1`} value={email} onChange={(e) => setEmail(e.target.value)} type="email" />
          </div>
        </div>
        {profileError && (
          <p className="mt-4 text-sm text-red-600 dark:text-red-400">{profileError}</p>
        )}
        <UIButton className="mt-7 w-full sm:w-auto" onClick={save}>
          {saved ? tr('dash.profile.saved') : tr('dash.profile.save')}
        </UIButton>
      </UICard>
    </div>
  )
}

export function Dashboard({ onBook }: { onBook: () => void }) {
  const { user: currentUser } = useMe()
  const [active, setActive] = useState<Tab>('Overview')
  const tr = useT()
  const stripRef = useRef<HTMLElement>(null)

  // Keep the active section's chip in view in the phone/tablet strip. Only the
  // strip itself is scrolled sideways, never the page.
  useEffect(() => {
    const strip = stripRef.current
    const chip = strip?.querySelector<HTMLElement>('[aria-current="page"]')
    if (!strip || !chip) return
    strip.scrollTo({
      left: chip.offsetLeft - strip.clientWidth / 2 + chip.clientWidth / 2,
      behavior: 'smooth',
    })
  }, [active])

  if (!currentUser) return null

  const pick = (t: Tab) => setActive(t)

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 flex-col bg-sidebar p-6 pt-24 text-sidebar-foreground lg:flex">
        <SidebarContent active={active} setActive={pick} onBook={onBook} />
      </aside>

      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <div className="pt-20">
          <TopBar
            active={active}
            name={currentUser.name.split(' ')[0]}
            tier={currentUser.tier}
          />
          {/* Phones and tablets: the sections as one scrollable row. This replaces
              the old slide-out drawer, whose menu button sat right under the site
              header's own menu button. The sidebar takes over from lg up. */}
          <nav
            ref={stripRef}
            aria-label={tr('dash.sections')}
            className="flex gap-1.5 overflow-x-auto border-b border-border px-4 py-3 [scrollbar-width:none] sm:px-6 lg:hidden [&::-webkit-scrollbar]:hidden"
          >
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = active === item.label
              return (
                <button
                  key={item.label}
                  onClick={() =>
                    item.label === 'Book a Session' ? onBook() : pick(item.label as Tab)
                  }
                  aria-current={isActive ? 'page' : undefined}
                  className={cn(
                    'inline-flex min-h-10 shrink-0 items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-medium transition-colors',
                    isActive
                      ? 'bg-foreground text-background'
                      : 'bg-secondary text-muted-foreground hover:text-foreground',
                  )}
                >
                  <Icon className="size-3.5 shrink-0" />
                  {tr(tabKeys[item.label])}
                </button>
              )
            })}
          </nav>
        </div>
        <main className="min-w-0 flex-1 p-4 sm:p-6">
          {active === 'Overview' && <OverviewTab onBook={onBook} onOpenDiary={() => pick('Diary')} />}
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
