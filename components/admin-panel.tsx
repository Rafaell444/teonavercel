'use client'

import { useState } from 'react'
import {
  Users,
  ListChecks,
  Lock,
  CalendarDays,
  LayoutDashboard,
  Plus,
  Trash2,
  Pencil,
  X,
  Check,
  Upload,
  Crown,
  TrendingUp,
  CalendarRange,
  GraduationCap,
  Quote,
  Mail,
  Settings,
  Sparkles,
  Phone,
  MapPin,
  BarChart3,
  Star,
  ChevronDown,
  ChevronUp,
  Save,
  Globe,
  ExternalLink,
} from 'lucide-react'
import { UIButton, UICard, UIInput, Eyebrow, UIBadge } from '@/components/ui-kit'
import { getErrorMessage } from '@/lib/api'
import { useAdminUsers, updateAdminUser, addXP, deleteAdminUser } from '@/lib/hooks/useAdmin'
import { useTests, createTest, updateTest, deleteTest, COURSE_OPTIONS, type Test } from '@/lib/hooks/useTests'
import { useVault, uploadVaultItem, deleteVaultItem } from '@/lib/hooks/useVault'
import { useBookings, updateBookingStatus } from '@/lib/hooks/useBookings'
import { useEvents, createEvent, updateEvent, deleteEvent } from '@/lib/hooks/useEvents'
import { useSessions, createSession, updateSession, deleteSession, useTimeSlots, createTimeSlot, createTimeSlotssBulk, updateTimeSlot, deleteTimeSlot, useGroupSchedules, createGroupSchedule, usePackages, createPackage, updatePackage, deletePackage } from '@/lib/hooks/useSessions'
import type { Session, SessionTimeSlot as TimeSlotType, GroupSessionSchedule, Package } from '@/lib/hooks/useSessions'
import { useVouchers, createVoucher, updateVoucher, deleteVoucher } from '@/lib/hooks/useVouchers'
import type { Voucher } from '@/lib/hooks/useVouchers'
import { useTestimonials, createTestimonial, updateTestimonial, deleteTestimonial } from '@/lib/hooks/useTestimonials'
import { useMessages, markMessageRead, deleteMessage } from '@/lib/hooks/useMessages'
import { usePillars, useSiteSettings, updateSiteSettings, createPillar, updatePillar, deletePillar } from '@/lib/hooks/useContent'
import { useMe } from '@/lib/hooks/useAuth'
import type { AppUser } from '@/lib/hooks/useAuth'
import type { TestQuestion } from '@/lib/hooks/useTests'
import type { Booking } from '@/lib/hooks/useBookings'
import type { EventItem } from '@/lib/hooks/useEvents'
import type { Testimonial } from '@/lib/hooks/useTestimonials'
import type { Pillar, SiteSettings } from '@/lib/hooks/useContent'
import { cn } from '@/lib/utils'

type AdminTab =
  | 'Overview'
  | 'Users'
  | 'Tests'
  | 'Vault'
  | 'Bookings'
  | 'Events'
  | 'Sessions'
  | 'Packages'
  | 'Vouchers'
  | 'Testimonials'
  | 'Messages'
  | 'Content'

const tabs: { label: AdminTab; icon: typeof Users }[] = [
  { label: 'Overview', icon: LayoutDashboard },
  { label: 'Users', icon: Users },
  { label: 'Tests', icon: ListChecks },
  { label: 'Vault', icon: Lock },
  { label: 'Bookings', icon: CalendarDays },
  { label: 'Events', icon: CalendarRange },
  { label: 'Sessions', icon: GraduationCap },
  { label: 'Packages', icon: Sparkles },
  { label: 'Vouchers', icon: Star },
  { label: 'Testimonials', icon: Quote },
  { label: 'Messages', icon: Mail },
  { label: 'Content', icon: Settings },
]

/* =============================== Overview =============================== */
function OverviewTab({ go }: { go: (t: AdminTab) => void }) {
  const { users } = useAdminUsers()
  const { tests } = useTests()
  const { vault } = useVault()
  const { bookings } = useBookings()
  const { events } = useEvents()
  const { sessions: allSessions } = useSessions()
  const { testimonials } = useTestimonials()
  const { messages } = useMessages()
  const unread = messages.filter((m) => !m.read).length
  const stats = [
    { label: 'Members', value: users.filter((u) => u.role === 'member').length, icon: Users, tab: 'Users' as AdminTab, color: 'text-blue-500 bg-blue-500/10' },
    { label: 'Tests', value: tests.length, icon: ListChecks, tab: 'Tests' as AdminTab, color: 'text-violet-500 bg-violet-500/10' },
    { label: 'Vault items', value: vault.length, icon: Lock, tab: 'Vault' as AdminTab, color: 'text-amber-500 bg-amber-500/10' },
    { label: 'Bookings', value: bookings.length, icon: CalendarDays, tab: 'Bookings' as AdminTab, color: 'text-emerald-500 bg-emerald-500/10' },
    { label: 'Events', value: events.length, icon: CalendarRange, tab: 'Events' as AdminTab, color: 'text-primary bg-primary/10' },
    { label: 'Sessions', value: allSessions.length, icon: GraduationCap, tab: 'Sessions' as AdminTab, color: 'text-rose-500 bg-rose-500/10' },
    { label: 'Testimonials', value: testimonials.length, icon: Quote, tab: 'Testimonials' as AdminTab, color: 'text-cyan-500 bg-cyan-500/10' },
    { label: 'Messages', value: unread > 0 ? unread : messages.length, icon: Mail, tab: 'Messages' as AdminTab, color: unread > 0 ? 'text-destructive bg-destructive/10' : 'text-muted-foreground bg-secondary' },
  ]
  return (
    <div className="space-y-6">
      <div>
        <Eyebrow>Control Center</Eyebrow>
        <h2 className="mt-2 font-heading text-2xl font-bold tracking-tight">Everything at a glance</h2>
      </div>
      <div className="grid gap-3 grid-cols-2 sm:grid-cols-4">
        {stats.map((s) => {
          const Icon = s.icon
          return (
            <button key={s.label} onClick={() => go(s.tab)} className="group text-left">
              <UICard className="flex items-center gap-3 p-4 transition-all duration-200 hover:border-primary/50 hover:shadow-md hover:shadow-primary/5 hover:-translate-y-0.5">
                <div className={cn('flex size-10 shrink-0 items-center justify-center rounded-xl transition-transform group-hover:scale-110', s.color)}>
                  <Icon className="size-4" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                  <p className="font-heading text-xl font-bold">{s.value}</p>
                </div>
              </UICard>
            </button>
          )
        })}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <UICard className="p-5">
          <h3 className="font-heading text-base font-bold flex items-center gap-2">
            <CalendarDays className="size-4 text-primary" /> Recent Bookings
          </h3>
          <div className="mt-4 space-y-2">
            {bookings.slice(0, 5).map((b) => (
              <div key={b.id} className="flex items-center justify-between rounded-xl border border-border px-4 py-2.5 text-sm transition-colors hover:bg-secondary">
                <span className="font-medium truncate max-w-[100px]">{b.user_name}</span>
                <span className="text-muted-foreground hidden sm:block truncate max-w-[90px]">{b.session_title}</span>
                <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-semibold', b.status === 'Confirmed' && 'bg-emerald-500/10 text-emerald-600', b.status === 'Pending' && 'bg-amber-500/10 text-amber-600', b.status === 'Cancelled' && 'bg-destructive/10 text-destructive')}>
                  {b.status}
                </span>
                <span className="font-semibold text-primary">${b.total.toLocaleString()}</span>
              </div>
            ))}
            {bookings.length === 0 && <p className="text-sm text-muted-foreground py-4 text-center">No bookings yet.</p>}
          </div>
        </UICard>
        <UICard className="p-5">
          <h3 className="font-heading text-base font-bold flex items-center gap-2">
            <Mail className="size-4 text-primary" /> Recent Messages
            {unread > 0 && <span className="ml-auto inline-flex size-5 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-white">{unread}</span>}
          </h3>
          <div className="mt-4 space-y-2">
            {messages.slice(0, 4).map((m) => (
              <div key={m.id} className={cn('flex items-start gap-3 rounded-xl border px-4 py-2.5 text-sm transition-colors hover:bg-secondary', !m.read ? 'border-primary/30 bg-primary/5' : 'border-border')}>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{m.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{m.subject}</p>
                </div>
                <span className="text-xs text-muted-foreground shrink-0">{m.created_at ? new Date(m.created_at).toLocaleDateString() : ''}</span>
              </div>
            ))}
            {messages.length === 0 && <p className="text-sm text-muted-foreground py-4 text-center">No messages yet.</p>}
          </div>
          <button onClick={() => go('Messages')} className="mt-3 text-xs font-semibold text-primary hover:underline transition-all">
            View all messages →
          </button>
        </UICard>
      </div>

      <UICard className="p-5">
        <h3 className="font-heading text-base font-bold flex items-center gap-2">
          <TrendingUp className="size-4 text-primary" /> Revenue Overview
        </h3>
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Total Revenue', value: `$${bookings.reduce((s, b) => s + b.total, 0).toLocaleString()}` },
            { label: 'Confirmed', value: bookings.filter((b) => b.status === 'Confirmed').length },
            { label: 'Pending', value: bookings.filter((b) => b.status === 'Pending').length },
            { label: 'Avg. Booking', value: bookings.length > 0 ? `$${Math.round(bookings.reduce((s, b) => s + b.total, 0) / bookings.length).toLocaleString()}` : '$0' },
          ].map((s) => (
            <div key={s.label} className="rounded-xl bg-secondary p-3">
              <p className="text-xs text-muted-foreground">{s.label}</p>
              <p className="mt-1 font-heading text-lg font-bold">{s.value}</p>
            </div>
          ))}
        </div>
      </UICard>
    </div>
  )
}

/* =============================== Users =============================== */
function UsersTab() {
  const { users } = useAdminUsers()
  const tierOptions: AppUser['tier'][] = ['Explorer', 'Achiever', 'Master', 'Luminary']
  const [search, setSearch] = useState('')
  const filtered = users.filter(
    (u) => u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Eyebrow>Members</Eyebrow>
          <h2 className="mt-2 font-heading text-2xl font-bold tracking-tight">Manage users</h2>
        </div>
        <UIInput value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name or email…" className="sm:w-64" />
      </div>
      <div className="space-y-3">
        {filtered.map((u) => (
          <UICard key={u.id} className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between transition-all duration-200 hover:border-primary/30 hover:shadow-sm">
            <div className="flex items-center gap-4">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-foreground text-sm font-semibold text-background">
                {u.initials}
              </div>
              <div>
                <p className="font-semibold">
                  {u.name}{' '}
                  {u.role === 'admin' && <UIBadge className="ml-1 align-middle">Admin</UIBadge>}
                </p>
                <p className="text-sm text-muted-foreground">{u.email} · joined {u.joined}</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary">
                <Crown className="size-3.5" /> {u.tier}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1.5 text-xs font-medium text-muted-foreground">
                <TrendingUp className="size-3.5" /> {u.xp.toLocaleString()} XP
              </span>
              <select
                value={u.tier}
                onChange={(e) => updateAdminUser(u.id, { tier: e.target.value as AppUser['tier'] })}
                className="h-9 rounded-lg border border-border bg-background px-2 text-sm cursor-pointer transition-colors hover:border-primary focus:outline-none focus:border-primary"
                aria-label="Change tier"
              >
                {tierOptions.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
              <button
                onClick={() => addXP(u.id, 500)}
                className="inline-flex h-9 items-center gap-1 rounded-lg border border-border px-3 text-xs font-medium transition-all duration-200 hover:bg-primary hover:text-primary-foreground hover:border-primary hover:scale-105 active:scale-95"
              >
                <Plus className="size-3.5" /> 500 XP
              </button>
              {u.role !== 'admin' && (
                <button
                  onClick={() => deleteAdminUser(u.id)}
                  aria-label="Remove user"
                  className="flex size-9 items-center justify-center rounded-lg border border-border text-destructive transition-all duration-200 hover:bg-destructive hover:text-white hover:border-destructive hover:scale-105 active:scale-95"
                >
                  <Trash2 className="size-4" />
                </button>
              )}
            </div>
          </UICard>
        ))}
        {filtered.length === 0 && <UICard className="p-8 text-center text-muted-foreground">No users found.</UICard>}
      </div>
    </div>
  )
}

/* =============================== Tests =============================== */
function emptyQuestion(): TestQuestion {
  return {
    id: `q-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    question: '',
    options: ['', '', '', ''],
    order: 0,
  }
}

function generateCombinations(questions: TestQuestion[]): string[] {
  if (questions.length === 0) return []
  const optionCounts = questions.map((q) => q.options.length)
  const results: string[] = []
  const indices = Array(questions.length).fill(0)

  while (true) {
    results.push(indices.join(','))
    let carry = questions.length - 1
    while (carry >= 0) {
      indices[carry]++
      if (indices[carry] < optionCounts[carry]) break
      indices[carry] = 0
      carry--
    }
    if (carry < 0) break
  }
  return results
}

function TestEditor({ test, onSave, onCancel }: { test: Test; onSave: (t: Test) => void; onCancel: () => void }) {
  const [draft, setDraft] = useState<Test>(test)

  const setQ = (qi: number, patch: Partial<TestQuestion>) =>
    setDraft((d) => ({ ...d, questions: d.questions.map((q, i) => (i === qi ? { ...q, ...patch } : q)) }))

  const setOption = (qi: number, oi: number, value: string) =>
    setDraft((d) => ({
      ...d,
      questions: d.questions.map((q, i) =>
        i === qi ? { ...q, options: q.options.map((o, j) => (j === oi ? value : o)) } : q,
      ),
    }))

  const setCombinationCourse = (comboKey: string, course: string) =>
    setDraft((d) => ({ ...d, combination_results: { ...d.combination_results, [comboKey]: course } }))

  const setCourseOutcome = (course: string, text: string) =>
    setDraft((d) => ({ ...d, course_outcomes: { ...d.course_outcomes, [course]: text } }))

  const allCombinations = generateCombinations(draft.questions)

  return (
    <UICard className="p-6">
      <div className="flex items-center justify-between">
        <h3 className="font-heading text-xl font-bold">{test.title ? 'Edit test' : 'New test'}</h3>
        <button onClick={onCancel} aria-label="Cancel" className="flex size-8 items-center justify-center rounded-full text-muted-foreground transition-all duration-200 hover:bg-destructive/10 hover:text-destructive hover:scale-110">
          <X className="size-5" />
        </button>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Title</label>
          <UIInput value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} placeholder="Resilience Check" />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Category</label>
          <UIInput value={draft.category} onChange={(e) => setDraft({ ...draft, category: e.target.value })} placeholder="Mindset" />
        </div>
      </div>
      <div className="mt-4">
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Description</label>
        <UIInput value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} placeholder="What this test reveals" />
      </div>

      {/* Questions */}
      <div className="mt-6 space-y-5">
        {draft.questions.map((q, qi) => (
          <div key={q.id} className="rounded-2xl border border-border p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Question {qi + 1}</span>
              {draft.questions.length > 1 && (
                <button
                  onClick={() => setDraft((d) => ({ ...d, questions: d.questions.filter((_, i) => i !== qi) }))}
                  aria-label="Remove question"
                  className="flex size-7 items-center justify-center rounded-full text-destructive transition-all duration-200 hover:bg-destructive/10 hover:scale-110"
                >
                  <Trash2 className="size-4" />
                </button>
              )}
            </div>
            <UIInput className="mt-3" value={q.question} onChange={(e) => setQ(qi, { question: e.target.value })} placeholder="Type the question" />

            <div className="mt-3 space-y-2">
              <p className="text-xs font-medium text-muted-foreground">Answer options:</p>
              {q.options.map((opt, oi) => (
                <input
                  key={oi}
                  value={opt}
                  onChange={(e) => setOption(qi, oi, e.target.value)}
                  placeholder={`Option ${oi + 1}`}
                  className="h-9 w-full rounded-xl border border-border bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={() => setDraft((d) => ({ ...d, questions: [...d.questions, emptyQuestion()] }))}
        className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-primary transition-all duration-200 hover:gap-3 hover:underline"
      >
        <Plus className="size-4" /> Add question
      </button>

      {/* Combination → Course mapping */}
      {draft.questions.length > 0 && draft.questions.every((q) => q.options.some((o) => o.trim())) && (
        <div className="mt-8 rounded-2xl border border-border bg-secondary/30 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground mb-1">Answer combinations → Recommended course</p>
          <p className="text-xs text-muted-foreground mb-4">
            For every combination of answers, select which course to recommend.
          </p>
          <div className="max-h-96 overflow-y-auto space-y-2">
            {allCombinations.map((comboKey) => {
              const indices = comboKey.split(',').map(Number)
              const label = indices.map((idx, qi) => {
                const opt = draft.questions[qi]?.options[idx]
                return `Q${qi + 1}: ${opt || `Option ${idx + 1}`}`
              }).join(' / ')
              return (
                <div key={comboKey} className="flex items-center gap-3 rounded-xl border border-border bg-background p-3">
                  <span className="min-w-0 flex-1 text-xs text-foreground truncate" title={label}>{label}</span>
                  <select
                    value={draft.combination_results?.[comboKey] ?? ''}
                    onChange={(e) => setCombinationCourse(comboKey, e.target.value)}
                    className="h-8 shrink-0 rounded-lg border border-border bg-background px-2 text-xs text-foreground focus:border-primary focus:outline-none"
                  >
                    <option value="">— select course —</option>
                    {COURSE_OPTIONS.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Course outcome descriptions */}
      <div className="mt-8 rounded-2xl border border-border bg-secondary/30 p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground mb-1">Course recommendation texts</p>
        <p className="text-xs text-muted-foreground mb-4">Fill in the "why" text shown to the client for each programme recommendation.</p>
        <div className="grid gap-4 sm:grid-cols-2">
          {COURSE_OPTIONS.map((course) => (
            <div key={course}>
              <label className="mb-1.5 block text-xs font-semibold text-foreground">{course}</label>
              <textarea
                rows={3}
                value={draft.course_outcomes?.[course] ?? ''}
                onChange={(e) => setCourseOutcome(course, e.target.value)}
                placeholder={`Why ${course} is the right path for this person…`}
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <UIButton onClick={() => onSave(draft)} disabled={!draft.title.trim() || draft.questions.some((q) => !q.question.trim())}>
          <Save className="size-4" /> Save test
        </UIButton>
        <UIButton variant="outline" onClick={onCancel}>Cancel</UIButton>
        <label className="ml-auto flex cursor-pointer items-center gap-2 text-sm select-none">
          <input type="checkbox" checked={draft.published} onChange={(e) => setDraft({ ...draft, published: e.target.checked })} className="size-4 accent-primary cursor-pointer" />
          Published
        </label>
      </div>
    </UICard>
  )
}

function TestsTab() {
  const { tests } = useTests()
  const [editing, setEditing] = useState<Test | null>(null)
  const [saveError, setSaveError] = useState('')

  const handleSave = async (t: Test) => {
    setSaveError('')
    try {
      if (t.id && tests.find((x) => x.id === t.id)) {
        await updateTest(t.id, t)
      } else {
        await createTest(t)
      }
      setEditing(null)
    } catch (err) {
      setSaveError(getErrorMessage(err))
    }
  }

  if (editing) {
    return (
      <div className="space-y-4">
        {saveError && (
          <p className="rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-600 dark:bg-red-950/30 dark:text-red-400">{saveError}</p>
        )}
        <TestEditor test={editing} onSave={handleSave} onCancel={() => setEditing(null)} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Eyebrow>Assessments</Eyebrow>
          <h2 className="mt-2 font-heading text-2xl font-bold tracking-tight">Manage tests</h2>
        </div>
        <UIButton size="sm" onClick={() => setEditing({ id: '', title: '', description: '', category: 'General', questions: [emptyQuestion()], published: true, course_outcomes: {}, combination_results: {}, created_at: '', updated_at: '' })}>
          <Plus className="size-4" /> New test
        </UIButton>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {tests.map((t) => (
          <UICard key={t.id} className="group flex flex-col p-5 transition-all duration-200 hover:border-primary/40 hover:shadow-md hover:shadow-primary/5">
            <div className="flex items-start justify-between">
              <UIBadge>{t.category}</UIBadge>
              <span className={cn('rounded-full px-2.5 py-1 text-[11px] font-medium', t.published ? 'bg-emerald-500/10 text-emerald-600' : 'bg-secondary text-muted-foreground')}>
                {t.published ? 'Published' : 'Draft'}
              </span>
            </div>
            <h3 className="mt-3 font-heading text-lg font-bold">{t.title}</h3>
            <p className="mt-1 flex-1 text-sm text-muted-foreground">{t.description}</p>
            <p className="mt-3 text-xs text-muted-foreground">{t.questions.length} questions</p>
            <div className="mt-4 flex gap-2">
              <UIButton size="sm" variant="outline" onClick={() => setEditing(t)}><Pencil className="size-3.5" /> Edit</UIButton>
              <button onClick={() => deleteTest(t.id)} aria-label="Delete test" className="flex size-9 items-center justify-center rounded-full border border-border text-destructive transition-all duration-200 hover:bg-destructive hover:text-white hover:border-destructive hover:scale-105 active:scale-95">
                <Trash2 className="size-4" />
              </button>
            </div>
          </UICard>
        ))}
      </div>
    </div>
  )
}

/* =============================== Vault =============================== */
function VaultTab() {
  const { users } = useAdminUsers()
  const { vault } = useVault()
  const members = users.filter((u) => u.role === 'member')
  const [title, setTitle] = useState('')
  const [kind, setKind] = useState('PDF · 1 page')
  const [category, setCategory] = useState<'Test' | 'Book' | 'Resource'>('Book')
  const [target, setTarget] = useState<string>('all')
  const [file, setFile] = useState<File | null>(null)
  const [vaultError, setVaultError] = useState('')

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (f) setFile(f)
  }

  const upload = async () => {
    if (!title.trim()) return
    setVaultError('')
    const fd = new FormData()
    fd.append('title', title.trim())
    fd.append('kind', kind)
    fd.append('category', category)
    if (target !== 'all') fd.append('assigned_to', target)
    if (file) fd.append('file', file)
    try {
      await uploadVaultItem(fd)
      setTitle('')
      setFile(null)
    } catch (err) {
      setVaultError(getErrorMessage(err))
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <Eyebrow>Resources</Eyebrow>
        <h2 className="mt-2 font-heading text-2xl font-bold tracking-tight">Upload tests &amp; books</h2>
        <p className="mt-1 text-sm text-muted-foreground">Assign a resource to everyone or to one specific member&apos;s private vault.</p>
      </div>
      <UICard className="p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Title</label>
            <UIInput value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Confidence Builder Workbook" />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Type</label>
            <select value={category} onChange={(e) => setCategory(e.target.value as 'Test' | 'Book' | 'Resource')} className="h-12 w-full rounded-xl border border-border bg-background px-4 text-sm cursor-pointer transition-colors hover:border-primary focus:outline-none focus:border-primary">
              <option value="Book">Book</option>
              <option value="Test">Test</option>
              <option value="Resource">Resource</option>
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Detail</label>
            <UIInput value={kind} onChange={(e) => setKind(e.target.value)} placeholder="PDF · 24 pages" />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">File</label>
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-medium transition-all duration-200 hover:border-primary hover:bg-primary/5">
              <Upload className="size-4" />
              {file ? file.name : 'Choose file…'}
              <input type="file" onChange={handleFileChange} className="hidden" />
            </label>
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Assign to</label>
            <select value={target} onChange={(e) => setTarget(e.target.value)} className="h-12 w-full rounded-xl border border-border bg-background px-4 text-sm cursor-pointer transition-colors hover:border-primary focus:outline-none focus:border-primary">
              <option value="all">Everyone (shared library)</option>
              {members.map((m) => <option key={m.id} value={m.id}>{m.name} ({m.email})</option>)}
            </select>
          </div>
        </div>
        {vaultError && (
          <p className="mt-4 rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-600 dark:bg-red-950/30 dark:text-red-400">{vaultError}</p>
        )}
        <UIButton className="mt-5" onClick={upload} disabled={!title.trim()}><Upload className="size-4" /> Upload to vault</UIButton>
      </UICard>
      <div className="space-y-3">
        {vault.map((v) => {
          const assignedLabel = v.assigned_to_name ?? 'Everyone'
          return (
            <UICard key={v.id} className="flex items-center justify-between gap-4 p-4 transition-all duration-200 hover:border-primary/30 hover:shadow-sm">
              <div className="flex items-center gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"><Lock className="size-4" /></span>
                <div>
                  <p className="font-semibold">{v.title}</p>
                  <p className="text-xs text-muted-foreground">{v.category} · {v.kind} · by {v.added_by_name}</p>
                  <p className="text-xs text-muted-foreground">Assigned to: <span className="font-medium text-foreground">{assignedLabel}</span></p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {v.file_url && (
                  <a href={v.file_url} target="_blank" rel="noopener noreferrer" className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-border text-primary transition-all duration-200 hover:bg-primary/10 hover:border-primary hover:scale-105">
                    <ExternalLink className="size-4" />
                  </a>
                )}
                <button onClick={() => deleteVaultItem(v.id)} aria-label="Remove item" className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-border text-destructive transition-all duration-200 hover:bg-destructive hover:text-white hover:border-destructive hover:scale-105 active:scale-95">
                  <Trash2 className="size-4" />
                </button>
              </div>
            </UICard>
          )
        })}
      </div>
    </div>
  )
}

/* =============================== Bookings =============================== */
function BookingsTab() {
  const { bookings } = useBookings()
  const statuses: Booking['status'][] = ['Confirmed', 'Pending', 'Cancelled', 'Expired']
  return (
    <div className="space-y-6">
      <div>
        <Eyebrow>Schedule</Eyebrow>
        <h2 className="mt-2 font-heading text-2xl font-bold tracking-tight">All bookings</h2>
      </div>
      <div className="space-y-3">
        {bookings.map((b) => (
          <UICard key={b.id} className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between transition-all duration-200 hover:border-primary/30 hover:shadow-sm">
            <div>
              <p className="font-semibold">{b.session_title}</p>
              <p className="text-sm text-muted-foreground">
                {b.user_name} · {b.num_sessions} sessions · {b.format === 'online' ? 'Online' : 'In-Person'}
                {b.is_package && ' · Package'}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Used: {b.sessions_used}/{b.num_sessions}
                {b.expires_at && ` · Expires: ${new Date(b.expires_at).toLocaleDateString()}`}
                {b.is_expired && ' · EXPIRED'}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-heading text-lg font-bold text-primary">${Number(b.total).toLocaleString()}</span>
              <select
                value={b.status}
                onChange={(e) => updateBookingStatus(b.id, e.target.value as Booking['status'])}
                className={cn('h-9 rounded-lg border border-border bg-background px-2 text-sm font-medium cursor-pointer transition-colors hover:border-primary focus:outline-none', b.status === 'Confirmed' && 'text-emerald-600', b.status === 'Cancelled' && 'text-destructive', b.status === 'Expired' && 'text-orange-500')}
              >
                {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </UICard>
        ))}
        {bookings.length === 0 && <UICard className="p-8 text-center text-muted-foreground">No bookings yet.</UICard>}
      </div>
    </div>
  )
}

/* =============================== Events =============================== */
const typeOptions = ['Live Seminar', 'Weekend Retreat', 'Private Session', 'Group Coaching', 'Workshop', 'Masterclass']

function EventsTab() {
  const { events } = useEvents()
  const [editing, setEditing] = useState<EventItem | null>(null)
  const [isNew, setIsNew] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  const startNew = () => { setEditing({ id: '', title: '', type: 'Live Seminar', date: '', location: '', seats: '', image: null }); setIsNew(true); setImageFile(null); setImagePreview(null) }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      setImagePreview(URL.createObjectURL(file))
    }
  }

  const [eventError, setEventError] = useState('')

  const handleSaveEvent = async () => {
    if (!editing) return
    setEventError('')
    const fd = new FormData()
    fd.append('title', editing.title)
    fd.append('type', editing.type)
    fd.append('date', editing.date)
    fd.append('location', editing.location)
    fd.append('seats', editing.seats)
    if (imageFile) {
      fd.append('image', imageFile)
    }
    try {
      if (isNew) {
        await createEvent(fd)
      } else {
        await updateEvent(editing.id, fd)
      }
      setEditing(null)
      setIsNew(false)
      setImageFile(null)
      setImagePreview(null)
    } catch (err) {
      setEventError(getErrorMessage(err))
    }
  }

  if (editing) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Eyebrow>Events</Eyebrow>
            <h2 className="mt-2 font-heading text-2xl font-bold tracking-tight">{isNew ? 'New event' : 'Edit event'}</h2>
          </div>
          <button onClick={() => { setEditing(null); setIsNew(false) }} aria-label="Cancel" className="flex size-9 items-center justify-center rounded-full border border-border transition-all duration-200 hover:bg-destructive/10 hover:text-destructive hover:border-destructive hover:scale-110">
            <X className="size-5" />
          </button>
        </div>
        <UICard className="p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Title</label>
              <UIInput value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} placeholder="Unleash the Inner Edge" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Type</label>
              <select value={editing.type} onChange={(e) => setEditing({ ...editing, type: e.target.value })} className="h-12 w-full rounded-xl border border-border bg-background px-4 text-sm cursor-pointer transition-colors hover:border-primary focus:outline-none focus:border-primary">
                {typeOptions.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Date</label>
              <UIInput value={editing.date} onChange={(e) => setEditing({ ...editing, date: e.target.value })} placeholder="Mar 14, 2026" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Location</label>
              <UIInput value={editing.location} onChange={(e) => setEditing({ ...editing, location: e.target.value })} placeholder="Lisbon · In-Person" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Seats</label>
              <UIInput value={editing.seats} onChange={(e) => setEditing({ ...editing, seats: e.target.value })} placeholder="120 seats" />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Cover Image</label>
              <div className="flex items-center gap-4">
                {(imagePreview || editing.image) && (
                  <div className="relative h-20 w-32 overflow-hidden rounded-xl border border-border">
                    <img src={imagePreview || editing.image || ''} alt="Cover preview" className="h-full w-full object-cover" />
                  </div>
                )}
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-medium transition-all duration-200 hover:border-primary hover:bg-primary/5">
                  <Upload className="size-4" />
                  {imagePreview || editing.image ? 'Change image' : 'Upload image'}
                  <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                </label>
              </div>
            </div>
          </div>
          {eventError && (
            <p className="mt-4 rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-600 dark:bg-red-950/30 dark:text-red-400">{eventError}</p>
          )}
          <div className="mt-6 flex gap-3">
            <UIButton onClick={handleSaveEvent} disabled={!editing.title.trim() || !editing.date.trim()}>
              <Save className="size-4" /> Save event
            </UIButton>
            <UIButton variant="outline" onClick={() => { setEditing(null); setIsNew(false) }}>Cancel</UIButton>
          </div>
        </UICard>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Eyebrow>Upcoming</Eyebrow>
          <h2 className="mt-2 font-heading text-2xl font-bold tracking-tight">Manage events</h2>
        </div>
        <UIButton size="sm" onClick={startNew}><Plus className="size-4" /> New event</UIButton>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {events.map((event) => (
          <UICard key={event.id} className="group overflow-hidden transition-all duration-200 hover:border-primary/40 hover:shadow-md hover:shadow-primary/5">
            <div className="relative h-36 overflow-hidden">
              <img src={event.image || '/placeholder.svg'} alt={event.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
              <span className="absolute left-3 top-3 rounded-full bg-background/90 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em]">{event.type}</span>
            </div>
            <div className="p-4">
              <h3 className="font-heading text-base font-bold">{event.title}</h3>
              <p className="mt-1 text-xs text-muted-foreground">{event.date} · {event.location} · {event.seats}</p>
              <div className="mt-3 flex gap-2">
                <UIButton size="sm" variant="outline" onClick={() => { setEditing(event); setIsNew(false); setImageFile(null); setImagePreview(null) }}><Pencil className="size-3.5" /> Edit</UIButton>
                <button onClick={() => deleteEvent(event.id)} aria-label="Delete event" className="flex size-9 items-center justify-center rounded-full border border-border text-destructive transition-all duration-200 hover:bg-destructive hover:text-white hover:border-destructive hover:scale-105 active:scale-95">
                  <Trash2 className="size-4" />
                </button>
              </div>
            </div>
          </UICard>
        ))}
        {events.length === 0 && <UICard className="col-span-2 p-8 text-center text-muted-foreground">No events yet. Click &ldquo;New event&rdquo; to add one.</UICard>}
      </div>
    </div>
  )
}

/* =============================== Sessions =============================== */
function SessionsTab() {
  const { sessions: groupSessions } = useSessions('group')
  const { sessions: individualSessions } = useSessions('individual')
  const [subTab, setSubTab] = useState<'group' | 'individual'>('individual')
  const [showForm, setShowForm] = useState(false)
  const [title, setTitle] = useState('')
  const [price, setPrice] = useState('')
  const [format, setFormat] = useState<'online' | 'offline' | 'hybrid'>('online')
  const [location, setLocation] = useState('')
  const [mapsUrl, setMapsUrl] = useState('')
  const [maxSeats, setMaxSeats] = useState('12')
  const [error, setError] = useState('')

  const handleCreate = async () => {
    if (!title.trim()) return
    setError('')
    try {
      await createSession({
        title: title.trim(),
        price: Number(price) || 0,
        session_type: subTab,
        format: subTab === 'group' ? 'hybrid' : format,
        location: subTab === 'individual' ? location.trim() : '',
        location_maps_url: subTab === 'individual' ? mapsUrl.trim() : '',
        max_seats: subTab === 'group' ? (Number(maxSeats) || 12) : 1,
      })
      setTitle(''); setPrice(''); setLocation(''); setMapsUrl(''); setMaxSeats('12'); setShowForm(false)
    } catch (e) { setError(getErrorMessage(e)) }
  }

  const sessions = subTab === 'group' ? groupSessions : individualSessions

  return (
    <div className="space-y-6">
      <div>
        <Eyebrow>Sessions</Eyebrow>
        <h2 className="mt-2 font-heading text-2xl font-bold tracking-tight">Manage sessions</h2>
        <p className="mt-1 text-sm text-muted-foreground">Configure group and individual sessions for clients.</p>
      </div>

      <div className="flex gap-2">
        <UIButton size="sm" variant={subTab === 'individual' ? 'primary' : 'outline'} onClick={() => setSubTab('individual')}>Individual Sessions</UIButton>
        <UIButton size="sm" variant={subTab === 'group' ? 'primary' : 'outline'} onClick={() => setSubTab('group')}>Group Sessions</UIButton>
        <UIButton size="sm" className="ml-auto" onClick={() => setShowForm(!showForm)}><Plus className="size-4" /> New</UIButton>
      </div>

      {showForm && (
        <UICard className="p-5 space-y-4">
          <h3 className="font-heading text-base font-bold">Create {subTab} session</h3>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Title</label>
              <UIInput value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Executive Coaching" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Price {subTab === 'group' ? '/ seat ($)' : '/ session ($)'}</label>
              <UIInput type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="480" />
            </div>
            {subTab === 'group' && (
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Max seats</label>
                <UIInput type="number" value={maxSeats} onChange={(e) => setMaxSeats(e.target.value)} placeholder="12" />
              </div>
            )}
            {subTab === 'individual' && (
              <>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Default format</label>
                  <select value={format} onChange={(e) => setFormat(e.target.value as typeof format)} className="h-10 w-full rounded-xl border border-border bg-background px-3 text-sm">
                    <option value="online">Online</option>
                    <option value="offline">Offline</option>
                    <option value="hybrid">Hybrid</option>
                  </select>
                </div>
                {format !== 'online' && (
                  <>
                    <div>
                      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Location</label>
                      <UIInput value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Tbilisi, Georgia" />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Google Maps URL</label>
                      <UIInput value={mapsUrl} onChange={(e) => setMapsUrl(e.target.value)} placeholder="https://maps.google.com/..." />
                    </div>
                  </>
                )}
              </>
            )}
          </div>
          {subTab === 'group' && (
            <p className="text-xs text-muted-foreground">Format, location, and meet link are set per scheduled date — you&apos;ll add those after creating the session.</p>
          )}
          {subTab === 'individual' && (
            <p className="text-xs text-muted-foreground">After creating, open Availability to add dates/times and block weekends or days off.</p>
          )}
          <div className="flex gap-2">
            <UIButton onClick={handleCreate} disabled={!title.trim()}><Plus className="size-4" /> Create</UIButton>
            <UIButton variant="outline" onClick={() => setShowForm(false)}>Cancel</UIButton>
          </div>
        </UICard>
      )}

      <div className="space-y-3">
        {sessions.map((s) => (
          <SessionCard key={s.id} session={s} sessionType={subTab} onDelete={() => deleteSession(s.id)} />
        ))}
        {sessions.length === 0 && <UICard className="p-8 text-center text-muted-foreground">No {subTab} sessions yet.</UICard>}
      </div>
    </div>
  )
}

const DEFAULT_SLOT_TIMES = ['09:00', '10:30', '13:00', '15:30']

function addHourToTime(time: string): string {
  const [h, m] = time.split(':').map(Number)
  const endH = h + 1
  return `${String(endH).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

function generateSlotsInRange(
  from: string,
  to: string,
  times: string[],
  weekdaysOnly: boolean,
) {
  const slots: { date: string; start_time: string; end_time: string }[] = []
  const start = new Date(`${from}T12:00:00`)
  const end = new Date(`${to}T12:00:00`)
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || start > end) return slots

  const cursor = new Date(start)
  while (cursor <= end) {
    const dow = cursor.getDay()
    if (!weekdaysOnly || (dow !== 0 && dow !== 6)) {
      const dateStr = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, '0')}-${String(cursor.getDate()).padStart(2, '0')}`
      for (const t of times) {
        slots.push({
          date: dateStr,
          start_time: t,
          end_time: addHourToTime(t),
        })
      }
    }
    cursor.setDate(cursor.getDate() + 1)
  }
  return slots
}

function IndividualAvailabilityPanel({ sessionId }: { sessionId: string }) {
  const { slots } = useTimeSlots(sessionId, true)
  const [slotDate, setSlotDate] = useState('')
  const [slotStart, setSlotStart] = useState('09:00')
  const [slotEnd, setSlotEnd] = useState('10:00')
  const [bulkFrom, setBulkFrom] = useState('')
  const [bulkTo, setBulkTo] = useState('')
  const [weekdaysOnly, setWeekdaysOnly] = useState(true)
  const [slotError, setSlotError] = useState('')
  const [busy, setBusy] = useState(false)

  const upcoming = [...slots]
    .filter((sl) => sl.date >= new Date().toISOString().slice(0, 10))
    .sort((a, b) => `${a.date}${a.start_time}`.localeCompare(`${b.date}${b.start_time}`))

  const handleAddSlot = async () => {
    if (!slotDate || !slotStart) return
    setSlotError('')
    setBusy(true)
    try {
      await createTimeSlot(sessionId, {
        date: slotDate,
        start_time: slotStart,
        end_time: slotEnd || addHourToTime(slotStart),
      })
      setSlotDate('')
    } catch (e) {
      setSlotError(getErrorMessage(e))
    } finally {
      setBusy(false)
    }
  }

  const handleBulkGenerate = async () => {
    if (!bulkFrom || !bulkTo) return
    setSlotError('')
    setBusy(true)
    try {
      const generated = generateSlotsInRange(bulkFrom, bulkTo, DEFAULT_SLOT_TIMES, weekdaysOnly)
      if (!generated.length) {
        setSlotError('No slots in that range. Check dates and weekday settings.')
        return
      }
      await createTimeSlotssBulk(sessionId, generated)
      setBulkFrom('')
      setBulkTo('')
    } catch (e) {
      setSlotError(getErrorMessage(e))
    } finally {
      setBusy(false)
    }
  }

  const toggleBlock = async (slotId: string, blocked: boolean) => {
    setSlotError('')
    try {
      await updateTimeSlot(sessionId, slotId, { is_blocked: !blocked })
    } catch (e) {
      setSlotError(getErrorMessage(e))
    }
  }

  const handleDelete = async (slotId: string) => {
    setSlotError('')
    try {
      await deleteTimeSlot(sessionId, slotId)
    } catch (e) {
      setSlotError(getErrorMessage(e))
    }
  }

  return (
    <div className="mt-3 border-t border-border pt-3 space-y-4">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        Availability — clients only see open slots (packages use these too)
      </p>
      {slotError && <p className="text-sm text-destructive">{slotError}</p>}

      <div className="rounded-xl border border-border bg-secondary/30 p-3 space-y-2">
        <p className="text-xs font-medium text-muted-foreground">Add single slot</p>
        <div className="grid gap-2 sm:grid-cols-3">
          <UIInput type="date" value={slotDate} onChange={(e) => setSlotDate(e.target.value)} />
          <UIInput type="time" value={slotStart} onChange={(e) => { setSlotStart(e.target.value); setSlotEnd(addHourToTime(e.target.value)) }} />
          <UIInput type="time" value={slotEnd} onChange={(e) => setSlotEnd(e.target.value)} />
        </div>
        <UIButton size="sm" onClick={handleAddSlot} disabled={busy || !slotDate}><Plus className="size-3.5" /> Add slot</UIButton>
      </div>

      <div className="rounded-xl border border-border bg-secondary/30 p-3 space-y-2">
        <p className="text-xs font-medium text-muted-foreground">Generate range ({DEFAULT_SLOT_TIMES.join(', ')})</p>
        <div className="grid gap-2 sm:grid-cols-2">
          <UIInput type="date" value={bulkFrom} onChange={(e) => setBulkFrom(e.target.value)} placeholder="From" />
          <UIInput type="date" value={bulkTo} onChange={(e) => setBulkTo(e.target.value)} placeholder="To" />
        </div>
        <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
          <input type="checkbox" checked={weekdaysOnly} onChange={(e) => setWeekdaysOnly(e.target.checked)} className="rounded border-border" />
          Weekdays only (skip Sat & Sun)
        </label>
        <UIButton size="sm" variant="outline" onClick={handleBulkGenerate} disabled={busy || !bulkFrom || !bulkTo}>
          Generate slots
        </UIButton>
      </div>

      <div>
        <p className="text-xs font-medium text-muted-foreground mb-2">
          Upcoming slots ({upcoming.length}) — block days off or weekends you can&apos;t work
        </p>
        {upcoming.length === 0 ? (
          <p className="text-xs text-muted-foreground">No slots yet. Add or generate availability above.</p>
        ) : (
          <div className="max-h-56 space-y-1.5 overflow-y-auto pr-1">
            {upcoming.map((sl) => (
              <div key={sl.id} className="flex items-center justify-between gap-2 rounded-lg border border-border px-3 py-2 text-xs">
                <span className={cn(sl.is_blocked && 'line-through text-muted-foreground')}>
                  {sl.date} · {sl.start_time?.slice(0, 5)}
                  {sl.is_booked && ' · Booked'}
                  {sl.is_blocked && !sl.is_booked && ' · Blocked'}
                </span>
                <div className="flex shrink-0 gap-1">
                  {!sl.is_booked && (
                    <UIButton size="sm" variant="outline" onClick={() => toggleBlock(sl.id, sl.is_blocked)}>
                      {sl.is_blocked ? 'Unblock' : 'Block'}
                    </UIButton>
                  )}
                  {!sl.is_booked && (
                    <button onClick={() => handleDelete(sl.id)} aria-label="Delete slot" className="flex size-8 items-center justify-center rounded-full border border-border text-destructive hover:bg-destructive hover:text-white">
                      <Trash2 className="size-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function SessionCard({ session: s, sessionType, onDelete }: { session: Session, sessionType: 'group' | 'individual', onDelete: () => void }) {
  const [showScheduleForm, setShowScheduleForm] = useState(false)
  const [showAvailability, setShowAvailability] = useState(false)
  const [schedDate, setSchedDate] = useState('')
  const [schedTime, setSchedTime] = useState('')
  const [schedFormat, setSchedFormat] = useState<'online' | 'offline'>('offline')
  const [schedLocation, setSchedLocation] = useState('')
  const [schedMaps, setSchedMaps] = useState('')
  const { schedules } = useGroupSchedules(sessionType === 'group' ? s.id : '')

  const handleAddSchedule = async () => {
    if (!schedDate || !schedTime) return
    try {
      await createGroupSchedule(s.id, {
        date: schedDate,
        start_time: schedTime,
        format: schedFormat,
        location: schedLocation,
        location_maps_url: schedMaps,
      } as any)
      setShowScheduleForm(false)
      setSchedDate(''); setSchedTime(''); setSchedLocation(''); setSchedMaps('')
    } catch (e) { /* silently handle */ }
  }

  return (
    <UICard className="p-4 transition-all duration-200 hover:border-primary/30 hover:shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"><GraduationCap className="size-5" /></span>
          <div>
            <p className="font-semibold">{s.title}</p>
            <p className="text-xs text-muted-foreground">
              ${s.price}/{sessionType === 'group' ? 'seat' : 'session'}
              {sessionType === 'group' ? ` · ${s.max_seats} max seats` : ` · ${s.format}`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-heading text-lg font-bold text-primary">${s.price}</span>
          {sessionType === 'group' && (
            <UIButton size="sm" variant="outline" onClick={() => { setShowScheduleForm(!showScheduleForm); setShowAvailability(false) }}>
              <Plus className="size-3.5" /> Schedule
            </UIButton>
          )}
          {sessionType === 'individual' && (
            <UIButton size="sm" variant="outline" onClick={() => { setShowAvailability(!showAvailability); setShowScheduleForm(false) }}>
              <CalendarDays className="size-3.5" /> Availability
            </UIButton>
          )}
          <button onClick={onDelete} aria-label="Delete session" className="flex size-9 items-center justify-center rounded-full border border-border text-destructive transition-all duration-200 hover:bg-destructive hover:text-white hover:border-destructive hover:scale-105 active:scale-95">
            <Trash2 className="size-4" />
          </button>
        </div>
      </div>

      {sessionType === 'group' && schedules.length > 0 && (
        <div className="mt-3 border-t border-border pt-3">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground mb-2">Scheduled dates</p>
          <div className="flex flex-wrap gap-2">
            {schedules.map(sch => (
              <span key={sch.id} className="inline-flex items-center gap-1 rounded-full bg-secondary px-3 py-1 text-xs font-medium">
                {sch.date} · {sch.start_time?.slice(0, 5)} · {sch.format} · {sch.seats_taken}/{sch.seats_total} seats
              </span>
            ))}
          </div>
        </div>
      )}

      {sessionType === 'individual' && showAvailability && (
        <IndividualAvailabilityPanel sessionId={s.id} />
      )}

      {showScheduleForm && (
        <div className="mt-3 border-t border-border pt-3 space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Add schedule (auto-creates {s.max_seats} seats)</p>
          <div className="grid gap-2 sm:grid-cols-2">
            <UIInput type="date" value={schedDate} onChange={(e) => setSchedDate(e.target.value)} />
            <UIInput type="time" value={schedTime} onChange={(e) => setSchedTime(e.target.value)} />
            <select value={schedFormat} onChange={(e) => setSchedFormat(e.target.value as 'online' | 'offline')} className="h-10 w-full rounded-xl border border-border bg-background px-3 text-sm">
              <option value="offline">Offline</option>
              <option value="online">Online</option>
            </select>
            {schedFormat === 'offline' && (
              <>
                <UIInput value={schedLocation} onChange={(e) => setSchedLocation(e.target.value)} placeholder="Location address" />
                <UIInput value={schedMaps} onChange={(e) => setSchedMaps(e.target.value)} placeholder="Google Maps URL" className="sm:col-span-2" />
              </>
            )}
          </div>
          <div className="flex gap-2">
            <UIButton size="sm" onClick={handleAddSchedule} disabled={!schedDate || !schedTime}><Plus className="size-3.5" /> Add</UIButton>
            <UIButton size="sm" variant="outline" onClick={() => setShowScheduleForm(false)}>Cancel</UIButton>
          </div>
        </div>
      )}
    </UICard>
  )
}

/* =============================== Packages =============================== */
function PackagesTab() {
  const { packages } = usePackages()
  const { sessions } = useSessions('individual')
  const [showForm, setShowForm] = useState(false)
  const [title, setTitle] = useState('')
  const [price, setPrice] = useState('')
  const [duration, setDuration] = useState('6')
  const [selectedSessions, setSelectedSessions] = useState<string[]>([])
  const [error, setError] = useState('')

  const handleCreate = async () => {
    if (!title.trim()) return
    setError('')
    try {
      await createPackage({
        title: title.trim(),
        price: Number(price) || 0,
        duration_months: Number(duration) || 6,
        session_ids: selectedSessions,
      } as any)
      setTitle(''); setPrice(''); setDuration('6'); setSelectedSessions([]); setShowForm(false)
    } catch (e) { setError(getErrorMessage(e)) }
  }

  const toggleSession = (id: string) => {
    setSelectedSessions(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id])
  }

  return (
    <div className="space-y-6">
      <div>
        <Eyebrow>Packages</Eyebrow>
        <h2 className="mt-2 font-heading text-2xl font-bold tracking-tight">Manage packages</h2>
        <p className="mt-1 text-sm text-muted-foreground">Big packages bundle individual sessions. Booking dates come from each session&apos;s availability (Sessions → Individual → Availability).</p>
      </div>

      <UIButton size="sm" onClick={() => setShowForm(!showForm)}><Plus className="size-4" /> New package</UIButton>

      {showForm && (
        <UICard className="p-5 space-y-4">
          <h3 className="font-heading text-base font-bold">Create package</h3>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Package title</label>
              <UIInput value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Full Transformation" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Price ($)</label>
              <UIInput type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="2000" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Duration (months, 6-9)</label>
              <UIInput type="number" min={6} max={9} value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="6" />
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Include sessions</label>
            <div className="flex flex-wrap gap-2 mt-1">
              {sessions.map(s => (
                <button key={s.id} onClick={() => toggleSession(s.id)} className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${selectedSessions.includes(s.id) ? 'bg-primary text-primary-foreground border-primary' : 'border-border hover:border-primary/50'}`}>
                  {s.title}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <UIButton onClick={handleCreate} disabled={!title.trim()}><Plus className="size-4" /> Create</UIButton>
            <UIButton variant="outline" onClick={() => setShowForm(false)}>Cancel</UIButton>
          </div>
        </UICard>
      )}

      <div className="space-y-3">
        {packages.map((p) => (
          <UICard key={p.id} className="p-4 transition-all duration-200 hover:border-primary/30 hover:shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold">{p.title}</p>
                <p className="text-xs text-muted-foreground">{p.duration_months} months · {p.sessions_detail?.length || 0} sessions included</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-heading text-lg font-bold text-primary">${p.price}</span>
                <button onClick={() => deletePackage(p.id)} aria-label="Delete package" className="flex size-9 items-center justify-center rounded-full border border-border text-destructive transition-all duration-200 hover:bg-destructive hover:text-white hover:border-destructive hover:scale-105 active:scale-95">
                  <Trash2 className="size-4" />
                </button>
              </div>
            </div>
          </UICard>
        ))}
        {packages.length === 0 && <UICard className="p-8 text-center text-muted-foreground">No packages yet.</UICard>}
      </div>
    </div>
  )
}

/* =============================== Vouchers =============================== */
function VouchersTab() {
  const { vouchers } = useVouchers()
  const [showForm, setShowForm] = useState(false)
  const [code, setCode] = useState('')
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage')
  const [discountValue, setDiscountValue] = useState('')
  const [maxUses, setMaxUses] = useState('')
  const [validFrom, setValidFrom] = useState('')
  const [validUntil, setValidUntil] = useState('')
  const [error, setError] = useState('')

  const handleCreate = async () => {
    if (!code.trim() || !discountValue) return
    setError('')
    try {
      await createVoucher({
        code: code.trim().toUpperCase(),
        discount_type: discountType,
        discount_value: Number(discountValue),
        max_uses: maxUses ? Number(maxUses) : null,
        valid_from: validFrom || new Date().toISOString(),
        valid_until: validUntil || new Date(Date.now() + 90 * 86400000).toISOString(),
        is_active: true,
      })
      setCode(''); setDiscountValue(''); setMaxUses(''); setValidFrom(''); setValidUntil(''); setShowForm(false)
    } catch (e) { setError(getErrorMessage(e)) }
  }

  return (
    <div className="space-y-6">
      <div>
        <Eyebrow>Promotions</Eyebrow>
        <h2 className="mt-2 font-heading text-2xl font-bold tracking-tight">Vouchers & Promo Codes</h2>
        <p className="mt-1 text-sm text-muted-foreground">Generate and manage discount codes for sessions.</p>
      </div>

      <UIButton size="sm" onClick={() => setShowForm(!showForm)}><Plus className="size-4" /> New voucher</UIButton>

      {showForm && (
        <UICard className="p-5 space-y-4">
          <h3 className="font-heading text-base font-bold">Create voucher</h3>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Code</label>
              <UIInput value={code} onChange={(e) => setCode(e.target.value)} placeholder="e.g. SUMMER20" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Discount type</label>
              <select value={discountType} onChange={(e) => setDiscountType(e.target.value as typeof discountType)} className="h-10 w-full rounded-xl border border-border bg-background px-3 text-sm">
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed amount ($)</option>
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Discount value</label>
              <UIInput type="number" value={discountValue} onChange={(e) => setDiscountValue(e.target.value)} placeholder={discountType === 'percentage' ? '20' : '50'} />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Max uses (blank = unlimited)</label>
              <UIInput type="number" value={maxUses} onChange={(e) => setMaxUses(e.target.value)} placeholder="100" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Valid from</label>
              <UIInput type="datetime-local" value={validFrom} onChange={(e) => setValidFrom(e.target.value)} />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Valid until</label>
              <UIInput type="datetime-local" value={validUntil} onChange={(e) => setValidUntil(e.target.value)} />
            </div>
          </div>
          <div className="flex gap-2">
            <UIButton onClick={handleCreate} disabled={!code.trim() || !discountValue}><Plus className="size-4" /> Create</UIButton>
            <UIButton variant="outline" onClick={() => setShowForm(false)}>Cancel</UIButton>
          </div>
        </UICard>
      )}

      <div className="space-y-3">
        {vouchers.map((v) => (
          <UICard key={v.id} className="p-4 transition-all duration-200 hover:border-primary/30 hover:shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary font-mono text-xs font-bold">{v.code.slice(0, 3)}</span>
                <div>
                  <p className="font-semibold font-mono">{v.code}</p>
                  <p className="text-xs text-muted-foreground">
                    {v.discount_type === 'percentage' ? `${v.discount_value}% off` : `$${v.discount_value} off`}
                    {' · '}{v.times_used}{v.max_uses ? `/${v.max_uses}` : ''} uses
                    {!v.is_valid && ' · Expired'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold', v.is_valid ? 'bg-primary/10 text-primary' : 'bg-secondary text-muted-foreground')}>{v.is_valid ? 'Active' : 'Inactive'}</span>
                <button onClick={() => deleteVoucher(v.id)} aria-label="Delete voucher" className="flex size-9 items-center justify-center rounded-full border border-border text-destructive transition-all duration-200 hover:bg-destructive hover:text-white hover:border-destructive hover:scale-105 active:scale-95">
                  <Trash2 className="size-4" />
                </button>
              </div>
            </div>
          </UICard>
        ))}
        {vouchers.length === 0 && <UICard className="p-8 text-center text-muted-foreground">No vouchers yet.</UICard>}
      </div>
    </div>
  )
}

/* =============================== Testimonials =============================== */
function TestimonialsTab() {
  const { testimonials } = useTestimonials()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [draft, setDraft] = useState<Testimonial | null>(null)
  const [showNew, setShowNew] = useState(false)
  const [newDraft, setNewDraft] = useState<Omit<Testimonial, 'id'>>({ quote: '', name: '', role: '', order: 0 })

  const startEdit = (t: Testimonial) => { setEditingId(t.id); setDraft({ ...t }); setShowNew(false) }
  const saveEdit = async () => { if (!draft) return; await updateTestimonial(draft.id, draft); setEditingId(null); setDraft(null) }
  const addNew = async () => {
    if (!newDraft.quote.trim() || !newDraft.name.trim()) return
    await createTestimonial(newDraft)
    setNewDraft({ quote: '', name: '', role: '', order: 0 }); setShowNew(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Eyebrow>Social proof</Eyebrow>
          <h2 className="mt-2 font-heading text-2xl font-bold tracking-tight">Manage testimonials</h2>
        </div>
        <UIButton size="sm" onClick={() => { setShowNew(true); setEditingId(null) }}><Plus className="size-4" /> New testimonial</UIButton>
      </div>

      {showNew && (
        <UICard className="p-5 border-primary/30">
          <h3 className="mb-4 font-heading text-base font-bold text-primary flex items-center gap-2"><Star className="size-4" /> New testimonial</h3>
          <div className="space-y-3">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Quote</label>
              <textarea value={newDraft.quote} onChange={(e) => setNewDraft({ ...newDraft, quote: e.target.value })} rows={3} placeholder="The transformation I experienced…" className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30" />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Name</label>
                <UIInput value={newDraft.name} onChange={(e) => setNewDraft({ ...newDraft, name: e.target.value })} placeholder="Sofia Marchetti" />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Role / Company</label>
                <UIInput value={newDraft.role} onChange={(e) => setNewDraft({ ...newDraft, role: e.target.value })} placeholder="Founder, Northbound Studio" />
              </div>
            </div>
          </div>
          <div className="mt-4 flex gap-3">
            <UIButton onClick={addNew} disabled={!newDraft.quote.trim() || !newDraft.name.trim()}><Save className="size-4" /> Save</UIButton>
            <UIButton variant="outline" onClick={() => setShowNew(false)}>Cancel</UIButton>
          </div>
        </UICard>
      )}

      <div className="space-y-3">
        {testimonials.map((t) => (
          <UICard key={t.id} className="p-5 transition-all duration-200 hover:border-primary/30 hover:shadow-sm">
            {editingId === t.id && draft ? (
              <div className="space-y-3">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Quote</label>
                  <textarea value={draft.quote} onChange={(e) => setDraft({ ...draft, quote: e.target.value })} rows={3} className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30" />
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <UIInput value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} placeholder="Name" />
                  <UIInput value={draft.role} onChange={(e) => setDraft({ ...draft, role: e.target.value })} placeholder="Role / Company" />
                </div>
                <div className="flex gap-2">
                  <UIButton size="sm" onClick={saveEdit}><Check className="size-3.5" /> Save</UIButton>
                  <UIButton size="sm" variant="outline" onClick={() => setEditingId(null)}>Cancel</UIButton>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-2">
                    <Quote className="mt-1 size-4 shrink-0 text-primary" />
                    <p className="text-sm leading-relaxed text-foreground/80 italic">&ldquo;{t.quote}&rdquo;</p>
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">{t.name.charAt(0)}</div>
                    <div>
                      <p className="text-sm font-semibold">{t.name}</p>
                      <p className="text-xs text-muted-foreground">{t.role}</p>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <UIButton size="sm" variant="outline" onClick={() => startEdit(t)}><Pencil className="size-3.5" /> Edit</UIButton>
                  <button onClick={() => deleteTestimonial(t.id)} aria-label="Delete testimonial" className="flex size-9 items-center justify-center rounded-full border border-border text-destructive transition-all duration-200 hover:bg-destructive hover:text-white hover:border-destructive hover:scale-105 active:scale-95">
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>
            )}
          </UICard>
        ))}
        {testimonials.length === 0 && <UICard className="p-8 text-center text-muted-foreground">No testimonials yet.</UICard>}
      </div>
    </div>
  )
}

/* =============================== Messages =============================== */
function MessagesTab() {
  const { messages } = useMessages()
  const [selected, setSelected] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'unread'>('all')
  const filtered = filter === 'unread' ? messages.filter((m) => !m.read) : messages

  const handleOpen = (id: string) => { setSelected(selected === id ? null : id); markMessageRead(id) }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Eyebrow>Inbox</Eyebrow>
          <h2 className="mt-2 font-heading text-2xl font-bold tracking-tight flex items-center gap-2">
            Messages
            {messages.filter((m) => !m.read).length > 0 && (
              <span className="inline-flex size-6 items-center justify-center rounded-full bg-destructive text-xs font-bold text-white">
                {messages.filter((m) => !m.read).length}
              </span>
            )}
          </h2>
        </div>
        <div className="flex gap-2">
          {(['all', 'unread'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn('rounded-full px-4 py-2 text-xs font-medium uppercase tracking-[0.12em] transition-all duration-200 capitalize', filter === f ? 'bg-foreground text-background' : 'border border-border text-muted-foreground hover:bg-secondary hover:text-foreground hover:border-foreground/30')}
            >
              {f}
            </button>
          ))}
        </div>
      </div>
      <div className="space-y-2">
        {filtered.map((m) => (
          <UICard key={m.id} className={cn('overflow-hidden transition-all duration-200', !m.read ? 'border-primary/40 bg-primary/5' : 'hover:border-border/80 hover:shadow-sm')}>
            <button className="flex w-full items-start gap-4 p-4 text-left" onClick={() => handleOpen(m.id)}>
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-foreground text-sm font-semibold text-background">{m.name.charAt(0)}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className={cn('text-sm font-semibold', !m.read && 'text-primary')}>{m.name}</p>
                  <span className="text-xs text-muted-foreground shrink-0">{m.created_at ? new Date(m.created_at).toLocaleDateString() : ''}</span>
                </div>
                <p className="text-sm font-medium text-foreground/80">{m.subject}</p>
                <p className="mt-0.5 text-xs text-muted-foreground truncate">{m.message}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {!m.read && <span className="size-2 rounded-full bg-primary" />}
                {selected === m.id ? <ChevronUp className="size-4 text-muted-foreground" /> : <ChevronDown className="size-4 text-muted-foreground" />}
              </div>
            </button>
            {selected === m.id && (
              <div className="border-t border-border bg-background px-4 pb-4 pt-3">
                <div className="mb-3 flex gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Mail className="size-3" /> {m.email}</span>
                  <span>{m.created_at ? new Date(m.created_at).toLocaleDateString() : ''}</span>
                </div>
                <p className="text-sm leading-relaxed text-foreground/80">{m.message}</p>
                <div className="mt-4 flex gap-2 flex-wrap">
                  <a href={`mailto:${m.email}?subject=Re: ${encodeURIComponent(m.subject)}`} className="inline-flex h-9 items-center gap-1.5 rounded-full border border-border bg-background px-4 text-xs font-semibold uppercase tracking-[0.12em] transition-all duration-200 hover:bg-primary hover:text-primary-foreground hover:border-primary hover:scale-105">
                    <Mail className="size-3.5" /> Reply via email
                  </a>
                  <button onClick={() => { deleteMessage(m.id); setSelected(null) }} className="flex h-9 items-center gap-1.5 rounded-full border border-border px-4 text-xs font-semibold uppercase tracking-[0.12em] text-destructive transition-all duration-200 hover:bg-destructive hover:text-white hover:border-destructive hover:scale-105">
                    <Trash2 className="size-3.5" /> Delete
                  </button>
                </div>
              </div>
            )}
          </UICard>
        ))}
        {filtered.length === 0 && <UICard className="p-8 text-center text-muted-foreground">{filter === 'unread' ? 'No unread messages.' : 'No messages yet.'}</UICard>}
      </div>
    </div>
  )
}

/* =============================== Content / Settings =============================== */
type ContentSection = 'hero' | 'contact' | 'stats' | 'pillars'

function ContentTab() {
  const { settings } = useSiteSettings()
  const { pillars } = usePillars()
  const [draft, setDraft] = useState<SiteSettings | null>(null)
  const [saved, setSaved] = useState(false)
  const [editingPillarId, setEditingPillarId] = useState<string | null>(null)
  const [pillarDraft, setPillarDraft] = useState<Pillar | null>(null)
  const [section, setSection] = useState<ContentSection>('hero')

  const currentDraft = draft ?? settings ?? ({} as SiteSettings)

  const [contentError, setContentError] = useState('')

  const handleSave = async () => {
    if (!draft) return
    setContentError('')
    try {
      await updateSiteSettings(draft)
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch (err) {
      setContentError(getErrorMessage(err))
    }
  }
  const startEditPillar = (p: Pillar) => { setEditingPillarId(p.id); setPillarDraft({ ...p }) }
  const savePillarEdit = async () => {
    setContentError('')
    try {
      if (!pillarDraft) return
      await updatePillar(pillarDraft.id, pillarDraft)
      setEditingPillarId(null)
      setPillarDraft(null)
    } catch (err) {
      setContentError(getErrorMessage(err))
    }
  }

  const sections: { key: ContentSection; label: string; icon: typeof Globe }[] = [
    { key: 'hero', label: 'Hero Section', icon: Sparkles },
    { key: 'contact', label: 'Contact Info', icon: Phone },
    { key: 'stats', label: 'Stats', icon: BarChart3 },
    { key: 'pillars', label: 'Pillars', icon: GraduationCap },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Eyebrow>Site Content</Eyebrow>
          <h2 className="mt-2 font-heading text-2xl font-bold tracking-tight">Content &amp; Settings</h2>
          <p className="mt-1 text-sm text-muted-foreground">Edit the live content of the marketing website.</p>
        </div>
        <UIButton onClick={handleSave} className={cn('transition-all duration-300', saved && 'bg-emerald-600 hover:bg-emerald-600 border-emerald-600')}>
          {saved ? <Check className="size-4" /> : <Save className="size-4" />}
          {saved ? 'Saved!' : 'Save changes'}
        </UIButton>
      </div>

      {contentError && (
        <p className="rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-600 dark:bg-red-950/30 dark:text-red-400">{contentError}</p>
      )}

      <div className="flex gap-2 flex-wrap">
        {sections.map((s) => {
          const Icon = s.icon
          return (
            <button key={s.key} onClick={() => setSection(s.key)} className={cn('inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-medium uppercase tracking-[0.12em] transition-all duration-200', section === s.key ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/20' : 'border border-border text-muted-foreground hover:bg-secondary hover:text-foreground hover:border-foreground/30 hover:scale-105')}>
              <Icon className="size-3.5" /> {s.label}
            </button>
          )
        })}
      </div>

      {section === 'hero' && (
        <UICard className="p-6">
          <h3 className="mb-5 font-heading text-base font-bold flex items-center gap-2"><Sparkles className="size-4 text-primary" /> Hero Section</h3>
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Brand Name</label>
              <UIInput value={currentDraft.brandName ?? ''} onChange={(e) => setDraft({ ...currentDraft, brandName: e.target.value })} placeholder="Ascend" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Hero Badge Text</label>
              <UIInput value={currentDraft.heroBadge ?? ''} onChange={(e) => setDraft({ ...currentDraft, heroBadge: e.target.value })} placeholder="Trusted by 12,000+ clients worldwide" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Title (before highlight)</label>
                <UIInput value={currentDraft.heroTitle ?? ''} onChange={(e) => setDraft({ ...currentDraft, heroTitle: e.target.value })} placeholder="Become the person your" />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Highlighted Word</label>
                <UIInput value={currentDraft.heroHighlight ?? ''} onChange={(e) => setDraft({ ...currentDraft, heroHighlight: e.target.value })} placeholder="future" />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Hero Subtitle</label>
              <textarea value={currentDraft.heroSubtitle ?? ''} onChange={(e) => setDraft({ ...currentDraft, heroSubtitle: e.target.value })} rows={3} className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Footer Tagline</label>
              <textarea value={currentDraft.footerTagline ?? ''} onChange={(e) => setDraft({ ...currentDraft, footerTagline: e.target.value })} rows={2} placeholder="Short footer description shown under the brand name…" className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30" />
            </div>
          </div>
          <div className="mt-5 rounded-2xl border border-dashed border-border bg-secondary/50 p-5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground mb-2">Live preview</p>
            <p className="text-xs text-muted-foreground mb-1">{currentDraft.heroBadge}</p>
            <p className="font-heading text-lg font-bold">{currentDraft.heroTitle} <span className="text-primary italic">{currentDraft.heroHighlight}</span> is waiting for.</p>
            <p className="mt-2 text-sm text-muted-foreground">{currentDraft.heroSubtitle}</p>
          </div>
        </UICard>
      )}

      {section === 'contact' && (
        <UICard className="p-6">
          <h3 className="mb-5 font-heading text-base font-bold flex items-center gap-2"><Phone className="size-4 text-primary" /> Contact Information</h3>
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground flex items-center gap-1.5"><Mail className="size-3.5" /> Email Address</label>
              <UIInput value={currentDraft.contactEmail ?? ''} onChange={(e) => setDraft({ ...currentDraft, contactEmail: e.target.value })} placeholder="hello@ascend.co" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground flex items-center gap-1.5"><Phone className="size-3.5" /> Phone Number</label>
              <UIInput value={currentDraft.contactPhone ?? ''} onChange={(e) => setDraft({ ...currentDraft, contactPhone: e.target.value })} placeholder="+1 (415) 555-0148" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground flex items-center gap-1.5"><MapPin className="size-3.5" /> Location</label>
              <UIInput value={currentDraft.contactLocation ?? ''} onChange={(e) => setDraft({ ...currentDraft, contactLocation: e.target.value })} placeholder="Lisbon · Online Worldwide" />
            </div>
          </div>
        </UICard>
      )}

      {section === 'stats' && (
        <UICard className="p-6">
          <h3 className="mb-5 font-heading text-base font-bold flex items-center gap-2"><BarChart3 className="size-4 text-primary" /> Stats Display</h3>
          <p className="mb-4 text-sm text-muted-foreground">These numbers appear in the About section of the marketing page.</p>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { key: 'statHours' as const, label: 'Coaching Hours', sub: 'Shown as: "Coaching hours"', ph: '20k+' },
              { key: 'statLives' as const, label: 'Lives Changed', sub: 'Shown as: "Lives changed"', ph: '12k+' },
              { key: 'statReturn' as const, label: 'Return Rate', sub: 'Shown as: "Would return"', ph: '98%' },
            ].map((s) => (
              <div key={s.key}>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">{s.label}</label>
                <UIInput value={currentDraft[s.key] ?? ''} onChange={(e) => setDraft({ ...currentDraft, [s.key]: e.target.value })} placeholder={s.ph} />
                <p className="mt-1 text-xs text-muted-foreground">{s.sub}</p>
              </div>
            ))}
          </div>
          <div className="mt-5 rounded-2xl border border-dashed border-border bg-secondary/50 p-5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground mb-3">Preview</p>
            <div className="flex flex-wrap gap-8">
              {[{ stat: currentDraft.statHours, label: 'Coaching hours' }, { stat: currentDraft.statLives, label: 'Lives changed' }, { stat: currentDraft.statReturn, label: 'Would return' }].map((s) => (
                <div key={s.label}>
                  <p className="font-heading text-2xl font-bold text-primary">{s.stat}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </UICard>
      )}

      {section === 'pillars' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-heading text-base font-bold flex items-center gap-2"><GraduationCap className="size-4 text-primary" /> Pillar Cards</h3>
            <UIButton size="sm" onClick={() => { const np: Pillar = { id: '', title: '', blurb: '', points: [''], order: 0 }; startEditPillar(np) }}>
              <Plus className="size-4" /> Add pillar
            </UIButton>
          </div>
          {pillars.map((p, i) => (
            <UICard key={p.id} className="p-5 transition-all duration-200 hover:border-primary/30 hover:shadow-sm">
              {editingPillarId === p.id && pillarDraft ? (
                <div className="space-y-3">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Title</label>
                      <UIInput value={pillarDraft.title} onChange={(e) => setPillarDraft({ ...pillarDraft, title: e.target.value })} placeholder="Executive Coaching" />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Blurb</label>
                      <UIInput value={pillarDraft.blurb} onChange={(e) => setPillarDraft({ ...pillarDraft, blurb: e.target.value })} placeholder="Short description…" />
                    </div>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Bullet points (one per line)</label>
                    <textarea rows={3} value={pillarDraft.points.join('\n')} onChange={(e) => setPillarDraft({ ...pillarDraft, points: e.target.value.split('\n') })} className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30" />
                  </div>
                  <div className="flex gap-2">
                    <UIButton size="sm" onClick={savePillarEdit}><Check className="size-3.5" /> Save</UIButton>
                    <UIButton size="sm" variant="outline" onClick={() => setEditingPillarId(null)}>Cancel</UIButton>
                  </div>
                </div>
              ) : (
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="font-heading text-3xl font-bold text-primary/30">0{i + 1}</span>
                    <h4 className="mt-1 font-heading text-base font-bold">{p.title}</h4>
                    <p className="mt-1 text-sm text-muted-foreground">{p.blurb}</p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {p.points.filter(Boolean).map((pt) => (
                        <span key={pt} className="rounded-full bg-secondary px-2.5 py-0.5 text-xs text-muted-foreground">{pt}</span>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <UIButton size="sm" variant="outline" onClick={() => startEditPillar(p)}><Pencil className="size-3.5" /> Edit</UIButton>
                    <button onClick={() => deletePillar(p.id)} aria-label="Delete pillar" className="flex size-9 items-center justify-center rounded-full border border-border text-destructive transition-all duration-200 hover:bg-destructive hover:text-white hover:border-destructive hover:scale-105 active:scale-95">
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </div>
              )}
            </UICard>
          ))}
        </div>
      )}
    </div>
  )
}

/* =============================== Shell =============================== */
export function AdminPanel() {
  const { user: currentUser } = useMe()
  const { messages } = useMessages()
  const [tab, setTab] = useState<AdminTab>('Overview')
  const unreadCount = messages.filter((m) => !m.read).length

  if (currentUser?.role !== 'admin') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 px-6 text-center">
        <div className="flex size-16 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
          <Lock className="size-8" />
        </div>
        <h1 className="font-heading text-2xl font-bold">Admins only</h1>
        <p className="text-muted-foreground max-w-sm">
          Log in as <span className="font-semibold text-primary">admin@ascend.com</span> to access the control panel.
        </p>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="hidden w-64 shrink-0 flex-col bg-sidebar p-6 pt-24 text-sidebar-foreground lg:flex">
        <div className="flex items-center gap-2">
          <span className="font-heading text-xl font-bold text-sidebar-foreground">Admin</span>
          <UIBadge className="border-primary/40 bg-primary/20 text-primary text-[10px]">Control</UIBadge>
        </div>
        <p className="mt-1 text-xs text-sidebar-foreground/50">{currentUser.name}</p>
        <nav className="mt-8 flex flex-col gap-0.5">
          {tabs.map((t) => {
            const Icon = t.icon
            const isMsgs = t.label === 'Messages'
            return (
              <button
                key={t.label}
                onClick={() => setTab(t.label)}
                className={cn(
                  'group flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-200',
                  tab === t.label
                    ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-sm shadow-primary/20'
                    : 'text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground hover:pl-5',
                )}
              >
                <Icon className="size-[17px] shrink-0 transition-transform group-hover:scale-110" />
                <span className="flex-1">{t.label}</span>
                {isMsgs && unreadCount > 0 && (
                  <span className="flex size-5 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-white">{unreadCount}</span>
                )}
              </button>
            )
          })}
        </nav>
        <div className="mt-auto pt-6 border-t border-sidebar-border">
          <div className="rounded-xl bg-sidebar-accent p-3">
            <p className="text-xs font-semibold text-sidebar-foreground/70">Admin Mode Active</p>
            <p className="mt-0.5 text-[11px] text-sidebar-foreground/40">All changes saved locally</p>
          </div>
        </div>
      </aside>

      <div className="flex min-h-screen flex-1 flex-col overflow-hidden">
        {/* Mobile tab strip */}
        <div className="flex gap-1.5 overflow-x-auto px-4 pb-3 pt-20 lg:hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {tabs.map((t) => {
            const Icon = t.icon
            const isMsgs = t.label === 'Messages'
            return (
              <button
                key={t.label}
                onClick={() => setTab(t.label)}
                className={cn(
                  'relative shrink-0 inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-medium transition-all duration-200',
                  tab === t.label ? 'bg-foreground text-background' : 'bg-secondary text-muted-foreground hover:bg-foreground/10 hover:text-foreground',
                )}
              >
                <Icon className="size-3.5 shrink-0" />
                {t.label}
                {isMsgs && unreadCount > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-destructive text-[9px] font-bold text-white">{unreadCount}</span>
                )}
              </button>
            )
          })}
        </div>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:pt-8">
          {tab === 'Overview' && <OverviewTab go={setTab} />}
          {tab === 'Users' && <UsersTab />}
          {tab === 'Tests' && <TestsTab />}
          {tab === 'Vault' && <VaultTab />}
          {tab === 'Bookings' && <BookingsTab />}
          {tab === 'Events' && <EventsTab />}
          {tab === 'Sessions' && <SessionsTab />}
          {tab === 'Packages' && <PackagesTab />}
          {tab === 'Vouchers' && <VouchersTab />}
          {tab === 'Testimonials' && <TestimonialsTab />}
          {tab === 'Messages' && <MessagesTab />}
          {tab === 'Content' && <ContentTab />}
        </main>
      </div>
    </div>
  )
}
