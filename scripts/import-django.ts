/**
 * Imports data exported from the old Django backend into Firebase.
 *
 * 1. On the old server (PythonAnywhere), export the data:
 *      python manage.py dumpdata --indent 2 \
 *        -e contenttypes -e auth.permission -e admin -e sessions \
 *        -e token_blacklist -e notifications > dump.json
 * 2. Copy dump.json next to this project and run:
 *      pnpm import-django dump.json
 *
 * Users keep their ids and emails. Their old password hashes are stored and
 * checked on first login, when the password is moved into Firebase Auth.
 * Uploaded files (images, vault files) are NOT copied: re-upload them from
 * the admin panel.
 */
import './env'

import { readFileSync } from 'node:fs'

import { COLLECTIONS, initialsOf, newId } from '../lib/server/data'
import { Timestamp, auth, db } from '../lib/server/firebase'

interface Row {
  model: string
  pk: string | number
  fields: Record<string, unknown>
}

const file = process.argv[2]
if (!file) {
  console.error('Usage: pnpm import-django <dump.json>')
  process.exit(1)
}

const rows = JSON.parse(readFileSync(file, 'utf8')) as Row[]
const byModel = (name: string) => rows.filter((r) => r.model === name)
const ts = (value: unknown) => (typeof value === 'string' && value ? Timestamp.fromDate(new Date(value)) : Timestamp.now())
const str = (value: unknown, fallback = '') => (value == null ? fallback : String(value))
const num = (value: unknown, fallback = 0) => (value == null || value === '' ? fallback : Number(value))
const time = (value: unknown) => {
  const v = str(value)
  return v.length === 5 ? `${v}:00` : v
}

async function importUsers() {
  const users = byModel('users.user')
  console.log(`Users: ${users.length}`)
  for (const row of users) {
    const uid = String(row.pk)
    const f = row.fields
    const email = str(f.email).toLowerCase()
    try {
      await auth().getUser(uid)
    } catch {
      try {
        await auth().createUser({ uid, email, displayName: str(f.name), disabled: f.is_active === false })
      } catch (err) {
        console.warn(`  skipped auth user ${email}: ${(err as Error).message}`)
      }
    }
    await auth().setCustomUserClaims(uid, { role: f.role === 'admin' ? 'admin' : 'member' }).catch(() => {})
    await db().collection(COLLECTIONS.users).doc(uid).set(
      {
        name: str(f.name),
        email,
        role: f.role === 'admin' ? 'admin' : 'member',
        tier: str(f.tier, 'Explorer'),
        xp: num(f.xp),
        vouchers: num(f.vouchers),
        joined: str(f.joined, new Date().toISOString().slice(0, 10)),
        is_active: f.is_active !== false,
        created_at: ts(f.joined),
        legacy_password_hash: str(f.password) || null,
      },
      { merge: true },
    )
  }
}

async function importSessions() {
  const sessions = byModel('sessions.session')
  console.log(`Sessions: ${sessions.length}`)
  for (const row of sessions) {
    const f = row.fields
    await db().collection(COLLECTIONS.sessions).doc(String(row.pk)).set({
      title: str(f.title), title_ka: str(f.title_ka), description: str(f.description), description_ka: str(f.description_ka),
      price: num(f.price), session_type: str(f.session_type), format: str(f.format, 'online'), language: str(f.language, 'both'),
      location: str(f.location), location_maps_url: str(f.location_maps_url), max_seats: num(f.max_seats, 12),
      is_active: f.is_active !== false, created_at: ts(f.created_at),
    })
  }

  const slots = byModel('sessions.sessiontimeslot')
  console.log(`Time slots: ${slots.length}`)
  const userNames = new Map(byModel('users.user').map((u) => [String(u.pk), str(u.fields.name)]))
  for (const row of slots) {
    const f = row.fields
    const start = time(f.start_time)
    await db().collection(COLLECTIONS.sessions).doc(String(f.session)).collection('slots').doc(`${f.date}_${start.replace(/:/g, '')}`).set({
      session: String(f.session), date: str(f.date), start_time: start, end_time: time(f.end_time),
      is_blocked: !!f.is_blocked, is_booked: !!f.is_booked,
      booked_by: f.booked_by ? String(f.booked_by) : null, booked_by_name: f.booked_by ? userNames.get(String(f.booked_by)) ?? null : null,
    })
  }

  const schedules = byModel('sessions.groupsessionschedule')
  const seats = byModel('sessions.groupsessionseat')
  console.log(`Group dates: ${schedules.length}, seats: ${seats.length}`)
  for (const row of schedules) {
    const f = row.fields
    const own = seats.filter((s) => String(s.fields.schedule) === String(row.pk))
    await db().collection(COLLECTIONS.schedules).doc(String(row.pk)).set({
      session: String(f.session), date: str(f.date), start_time: time(f.start_time), format: str(f.format, 'offline'),
      location: str(f.location), location_maps_url: str(f.location_maps_url),
      seats_total: own.length, seats_taken: own.filter((s) => s.fields.user).length,
    })
    for (const seat of own) {
      const sf = seat.fields
      const name = sf.user ? userNames.get(String(sf.user)) ?? null : null
      await db().collection(COLLECTIONS.schedules).doc(String(row.pk)).collection('seats').doc(String(sf.seat_number)).set({
        schedule: String(row.pk), seat_number: num(sf.seat_number), user: sf.user ? String(sf.user) : null,
        user_name: name, user_initials: name ? initialsOf(name) : null, reserved_at: sf.reserved_at ? ts(sf.reserved_at) : null,
      })
    }
  }

  const packages = byModel('sessions.package')
  console.log(`Packages: ${packages.length}`)
  for (const row of packages) {
    const f = row.fields
    await db().collection(COLLECTIONS.packages).doc(String(row.pk)).set({
      title: str(f.title), title_ka: str(f.title_ka), description: str(f.description), description_ka: str(f.description_ka),
      price: num(f.price), duration_months: num(f.duration_months, 6), is_active: f.is_active !== false,
      session_ids: ((f.sessions as unknown[]) ?? []).map(String), created_at: ts(f.created_at),
    })
  }
}

async function importBookings() {
  const bookings = byModel('bookings.booking')
  const bookingSessions = byModel('bookings.bookingsession')
  const users = new Map(byModel('users.user').map((u) => [String(u.pk), u.fields]))
  const sessions = new Map(byModel('sessions.session').map((s) => [String(s.pk), s.fields]))
  console.log(`Bookings: ${bookings.length}`)
  for (const row of bookings) {
    const f = row.fields
    const user = users.get(String(f.user))
    const session = sessions.get(String(f.session))
    const own = bookingSessions
      .filter((s) => String(s.fields.booking) === String(row.pk))
      .sort((a, b) => num(a.fields.session_number) - num(b.fields.session_number))
    await db().collection(COLLECTIONS.bookings).doc(String(row.pk)).set({
      user: String(f.user), user_name: str(user?.name), user_email: str(user?.email),
      session: String(f.session), session_title: str(session?.title), session_type: str(session?.session_type, 'individual'),
      num_sessions: num(f.num_sessions, 1), sessions_used: num(f.sessions_used), date: str(f.date), time: str(f.time),
      format: str(f.format, 'online'), session_language: str(f.session_language, 'ka'), is_package: !!f.is_package,
      package_duration_months: f.package_duration_months == null ? null : num(f.package_duration_months),
      total: num(f.total), discount_amount: num(f.discount_amount), voucher_code: str(f.voucher_code), meet_link: str(f.meet_link),
      status: str(f.status, 'Pending'), purchased_at: ts(f.purchased_at), expires_at: f.expires_at ? ts(f.expires_at) : null, created_at: ts(f.created_at),
      booking_sessions: own.map((s) => ({
        id: String(s.pk), booking: String(row.pk), time_slot: s.fields.time_slot ? String(s.fields.time_slot) : null,
        session_number: num(s.fields.session_number, 1), date: s.fields.date ? str(s.fields.date) : null,
        time: s.fields.time ? time(s.fields.time).slice(0, 5) : null, format: str(s.fields.format, 'online'),
        meet_link: str(s.fields.meet_link), status: str(s.fields.status, 'scheduled'), created_at: ts(s.fields.created_at),
      })),
    })
  }
}

async function importSimple() {
  const vouchers = byModel('vouchers.voucher')
  console.log(`Vouchers: ${vouchers.length}`)
  for (const row of vouchers) {
    const f = row.fields
    const code = str(f.code).toUpperCase()
    await db().collection(COLLECTIONS.vouchers).doc(code).set({
      code, discount_type: str(f.discount_type), discount_value: num(f.discount_value),
      max_uses: f.max_uses == null ? null : num(f.max_uses), times_used: num(f.times_used),
      valid_from: str(f.valid_from), valid_until: str(f.valid_until), is_active: f.is_active !== false,
      applicable_sessions: ((f.applicable_sessions as unknown[]) ?? []).map(String), created_at: ts(f.created_at),
    })
  }

  for (const row of byModel('testimonials.testimonial')) {
    const f = row.fields
    await db().collection(COLLECTIONS.testimonials).doc(String(row.pk)).set({ quote: str(f.quote), name: str(f.name), role: str(f.role), order: num(f.order), created_at: Timestamp.now() })
  }
  for (const row of byModel('content.pillar')) {
    const f = row.fields
    await db().collection(COLLECTIONS.pillars).doc(String(row.pk)).set({
      title: str(f.title), title_ka: str(f.title_ka), blurb: str(f.blurb), blurb_ka: str(f.blurb_ka),
      points: (f.points as string[]) ?? [], points_ka: (f.points_ka as string[]) ?? [], order: num(f.order),
      long_description: str(f.long_description), long_description_ka: str(f.long_description_ka), history: str(f.history), history_ka: str(f.history_ka),
      created_at: Timestamp.now(),
    })
  }
  const settings = byModel('content.sitesettings')[0]
  if (settings) {
    const f = settings.fields
    await db().collection(COLLECTIONS.settings).doc('site').set({
      brandName: str(f.brand_name, 'TEONA'), heroBadge: str(f.hero_badge), heroBadgeKa: str(f.hero_badge_ka), heroTitle: str(f.hero_title), heroTitleKa: str(f.hero_title_ka),
      heroHighlight: str(f.hero_highlight), heroHighlightKa: str(f.hero_highlight_ka), heroSubtitle: str(f.hero_subtitle), heroSubtitleKa: str(f.hero_subtitle_ka),
      footerTagline: str(f.footer_tagline), footerTaglineKa: str(f.footer_tagline_ka), contactEmail: str(f.contact_email), contactPhone: str(f.contact_phone),
      contactLocation: str(f.contact_location), statHours: str(f.stat_hours), statLives: str(f.stat_lives), statReturn: str(f.stat_return), heroImage: null,
    }, { merge: true })
  }
  for (const row of byModel('events.event')) {
    const f = row.fields
    await db().collection(COLLECTIONS.events).doc(String(row.pk)).set({ title: str(f.title), type: str(f.type), date: str(f.date), location: str(f.location), seats: str(f.seats), image: null, created_at: ts(f.created_at) })
  }
  for (const row of byModel('messages.contactmessage')) {
    const f = row.fields
    await db().collection(COLLECTIONS.messages).doc(String(row.pk)).set({ name: str(f.name), email: str(f.email), subject: str(f.subject), message: str(f.message), read: !!f.read, created_at: ts(f.created_at) })
  }
  for (const row of byModel('diary.diaryentry')) {
    const f = row.fields
    await db().collection(COLLECTIONS.users).doc(String(f.user)).collection('diary').doc(String(row.pk)).set({ user: String(f.user), date: str(f.date), title: str(f.title), excerpt: str(f.excerpt), mood: str(f.mood), created_at: ts(f.created_at) })
  }

  const questions = byModel('tests_app.testquestion')
  for (const row of byModel('tests_app.test')) {
    const f = row.fields
    await db().collection(COLLECTIONS.tests).doc(String(row.pk)).set({
      title: str(f.title), description: str(f.description), category: str(f.category, 'General'), published: !!f.published,
      course_outcomes: (f.course_outcomes as Record<string, string>) ?? {}, combination_results: (f.combination_results as Record<string, string>) ?? {},
      created_at: ts(f.created_at), updated_at: ts(f.updated_at),
      questions: questions
        .filter((q) => String(q.fields.test) === String(row.pk))
        .sort((a, b) => num(a.fields.order) - num(b.fields.order))
        .map((q, i) => ({ id: String(q.pk), order: i + 1, question: str(q.fields.question), options: (q.fields.options as string[]) ?? [] })),
    })
  }
  for (const row of byModel('tests_app.testresult')) {
    const f = row.fields
    await db().collection(COLLECTIONS.testResults).doc(String(row.pk)).set({
      user: String(f.user), test: String(f.test), answers: f.answers ?? {}, score: num(f.score),
      recommended_course: str(f.recommended_course), recommendation_why: str(f.recommendation_why), completed_at: ts(f.completed_at),
    })
  }

  const slotRows = byModel('consultations.consultationslot')
  for (const row of slotRows) {
    const f = row.fields
    const start = time(f.start_time)
    await db().collection(COLLECTIONS.consultationSlots).doc(`${f.date}_${start.replace(/:/g, '')}`).set({
      date: str(f.date), start_time: start, end_time: time(f.end_time), is_booked: !!f.is_booked,
      booked_by: f.booked_by ? String(f.booked_by) : null, booked_by_name: null, created_at: Timestamp.now(),
    })
  }
  const users = new Map(byModel('users.user').map((u) => [String(u.pk), u.fields]))
  for (const row of byModel('consultations.consultationbooking')) {
    const f = row.fields
    const slot = slotRows.find((s) => String(s.pk) === String(f.slot))?.fields
    const user = users.get(String(f.user))
    await db().collection(COLLECTIONS.consultationBookings).doc(String(row.pk)).set({
      user: String(f.user), user_name: str(user?.name), user_email: str(user?.email),
      slot: slot ? `${slot.date}_${time(slot.start_time).replace(/:/g, '')}` : String(f.slot),
      date: str(slot?.date), start_time: slot ? time(slot.start_time) : '', end_time: slot ? time(slot.end_time) : '',
      meet_link: str(f.meet_link), status: str(f.status, 'confirmed'), created_at: ts(f.created_at),
    })
  }
  for (const row of byModel('vault.vaultitem')) {
    const f = row.fields
    const addedBy = f.added_by ? users.get(String(f.added_by)) : undefined
    const assigned = f.assigned_to ? users.get(String(f.assigned_to)) : undefined
    await db().collection(COLLECTIONS.vault).doc(String(row.pk)).set({
      title: str(f.title), kind: str(f.kind), category: str(f.category, 'Resource'), locked: !!f.locked, file_url: null,
      added_by_id: f.added_by ? String(f.added_by) : null, added_by_name: str(addedBy?.name) || null,
      assigned_to_id: f.assigned_to ? String(f.assigned_to) : null, assigned_to_name: assigned ? str(assigned.name) || str(assigned.email) : null,
      created_at: ts(f.created_at),
    })
  }
}

async function main() {
  console.log(`Importing ${rows.length} records from ${file}`)
  await importUsers()
  await importSessions()
  await importBookings()
  await importSimple()
  console.log('Done. Re-upload images and vault files from the admin panel; they were not part of the export.')
  void newId
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
