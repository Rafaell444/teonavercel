/**
 * Seeds a Firebase project with the first admin account and demo content.
 * Safe to run more than once: existing documents are left alone, except
 * that empty Georgian translations on seeded content are filled in.
 *
 *   pnpm seed
 *
 * Reads FIREBASE_* from .env.local plus, for the admin account,
 * SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD. A demo member is created too
 * (SEED_MEMBER_EMAIL / SEED_MEMBER_PASSWORD) unless SEED_MEMBER_PASSWORD
 * is set to an empty string.
 */
import './env'

import { COLLECTIONS, newId } from '../lib/server/data'
import { Timestamp, auth, db } from '../lib/server/firebase'

const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL ?? 'admin@example.com'
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD ?? ''
const MEMBER_EMAIL = process.env.SEED_MEMBER_EMAIL ?? 'elena@email.com'
const MEMBER_PASSWORD = process.env.SEED_MEMBER_PASSWORD ?? 'member1234'

const today = new Date()
const plusDays = (n: number) => {
  const d = new Date(today)
  d.setDate(d.getDate() + n)
  return d.toISOString().slice(0, 10)
}
const isWeekend = (iso: string) => [0, 6].includes(new Date(`${iso}T00:00:00Z`).getUTCDay())
const longDate = (iso: string) =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' })

async function ensureUser(email: string, password: string, profile: Record<string, unknown>) {
  let uid: string
  try {
    uid = (await auth().getUserByEmail(email)).uid
    console.log(`  user exists: ${email}`)
  } catch {
    uid = (await auth().createUser({ email, password, displayName: String(profile.name) })).uid
    console.log(`  created user: ${email}`)
  }
  await auth().setCustomUserClaims(uid, { role: profile.role })
  const ref = db().collection(COLLECTIONS.users).doc(uid)
  if (!(await ref.get()).exists) {
    await ref.set({ ...profile, email, joined: today.toISOString().slice(0, 10), is_active: true, created_at: Timestamp.now() })
  }
  return uid
}

/** Creates the document, or returns false when it already exists. */
async function ensureDoc(collection: string, id: string, data: Record<string, unknown>) {
  const ref = db().collection(collection).doc(id)
  if ((await ref.get()).exists) return false
  await ref.set({ created_at: Timestamp.now(), ...data })
  return true
}

/**
 * Creates the document, or fills in only the fields that are still empty on
 * an existing one (so translations added later reach older installs while
 * edits made in the admin panel are kept).
 */
async function ensureDocFilling(collection: string, id: string, data: Record<string, unknown>) {
  const ref = db().collection(collection).doc(id)
  const snap = await ref.get()
  if (!snap.exists) {
    await ref.set({ created_at: Timestamp.now(), ...data })
    return true
  }
  const current = snap.data() ?? {}
  const patch: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(data)) {
    const existing = current[key]
    const empty = existing === undefined || existing === null || existing === '' || (Array.isArray(existing) && existing.length === 0)
    if (empty && value !== '' && !(Array.isArray(value) && value.length === 0)) patch[key] = value
  }
  if (Object.keys(patch).length) await ref.update(patch)
  return false
}

async function main() {
  if (!ADMIN_PASSWORD || ADMIN_PASSWORD.length < 8) {
    throw new Error('Set SEED_ADMIN_PASSWORD (at least 8 characters) in .env.local before seeding.')
  }

  console.log('Accounts')
  await ensureUser(ADMIN_EMAIL, ADMIN_PASSWORD, { name: 'Administrator', role: 'admin', tier: 'Luminary', xp: 0, vouchers: 0 })
  // Demo member for trying the dashboard and booking flow; skipped when SEED_MEMBER_PASSWORD is empty
  let memberId: string | null = null
  if (MEMBER_PASSWORD.length >= 8) {
    memberId = await ensureUser(MEMBER_EMAIL, MEMBER_PASSWORD, { name: 'Elena Voss', role: 'member', tier: 'Explorer', xp: 0, vouchers: 0 })
  }

  console.log('Site settings')
  await ensureDocFilling(COLLECTIONS.settings, 'site', {
    brandName: 'Ascend',
    heroBadge: 'Trusted by 12,000+ clients worldwide',
    heroBadgeKa: 'გვენდობა 12,000+ კლიენტი მსოფლიოდან',
    heroTitle: 'Become the person your',
    heroTitleKa: 'გახდი ის, ვისაც შენი',
    heroHighlight: 'future',
    heroHighlightKa: 'მომავალი',
    heroSubtitle: 'Premium one-on-one coaching, transformational therapy, and live seminars.',
    heroSubtitleKa: 'პრემიუმ ინდივიდუალური კოუჩინგი, ტრანსფორმაციული თერაპია და ცოცხალი სემინარები.',
    footerTagline: 'Premium coaching and transformational therapy for leaders and founders.',
    footerTaglineKa: 'პრემიუმ კოუჩინგი და ტრანსფორმაციული თერაპია ლიდერებისა და დამფუძნებლებისთვის.',
    contactEmail: ADMIN_EMAIL,
    contactPhone: '+995 555 12 34 56',
    contactLocation: 'Tbilisi · Online Worldwide',
    statHours: '20k+',
    statLives: '12k+',
    statReturn: '98%',
    heroImage: null,
  })

  console.log('Sessions and availability')
  const sessions = [
    ['10000000-0000-0000-0000-000000000001', 'Executive Coaching', 'ექსეკუტივ კოუჩინგი', 480, 'Sharpen decision-making, presence and performance for high-stakes leadership.', 'გააუმჯობესე გადაწყვეტილებების მიღება, ყოფნა და შედეგიანობა მაღალი ფსონის ლიდერობისთვის.'],
    ['10000000-0000-0000-0000-000000000002', 'RTT Therapy', 'RTT თერაპია', 360, 'Rapid Transformational Therapy to rewire limiting beliefs at the source.', 'სწრაფი ტრანსფორმაციული თერაპია შემზღუდველი რწმენების სათავეშივე შესაცვლელად.'],
    ['10000000-0000-0000-0000-000000000003', 'NLP Mastery', 'NLP ოსტატობა', 420, 'Neuro-Linguistic Programming tools to shift patterns and communicate with power.', 'ნეირო-ლინგვისტური პროგრამირების ინსტრუმენტები შაბლონების შესაცვლელად და ძლიერი კომუნიკაციისთვის.'],
    ['10000000-0000-0000-0000-000000000004', 'Generative Coaching', 'გენერაციული კოუჩინგი', 390, 'Create new futures from a place of wholeness, creativity and intention.', 'შექმენი ახალი მომავალი მთლიანობის, კრეატიულობისა და განზრახვის ადგილიდან.'],
  ] as const
  for (const [id, title, titleKa, price, description, descriptionKa] of sessions) {
    const made = await ensureDocFilling(COLLECTIONS.sessions, id, {
      title, title_ka: titleKa, description, description_ka: descriptionKa, price, session_type: 'individual', format: 'online',
      language: 'both', location: '', location_maps_url: '', max_seats: 12, is_active: true,
    })
    if (!made) continue
    // Weekday availability for the next two months
    const batch = db().batch()
    for (let offset = 3; offset < 60; offset += 1) {
      const date = plusDays(offset)
      if (isWeekend(date)) continue
      for (const start of ['09:00:00', '10:30:00', '13:00:00', '15:30:00']) {
        const end = `${String(Number(start.slice(0, 2)) + 1).padStart(2, '0')}${start.slice(2)}`
        batch.set(db().collection(COLLECTIONS.sessions).doc(id).collection('slots').doc(`${date}_${start.replace(/:/g, '')}`), {
          session: id, date, start_time: start, end_time: end, is_blocked: false, is_booked: false, booked_by: null, booked_by_name: null,
        })
      }
    }
    await batch.commit()
  }

  const groupId = '10000000-0000-0000-0000-000000000010'
  const groupMade = await ensureDocFilling(COLLECTIONS.sessions, groupId, {
    title: 'The Breakthrough Circle', title_ka: 'გარღვევის წრე',
    description: 'Group coaching session for shared growth and accountability.',
    description_ka: 'ჯგუფური კოუჩინგ სესია საერთო ზრდისა და პასუხისმგებლობისთვის.',
    price: 150, session_type: 'group', format: 'online', language: 'both', location: '', location_maps_url: '', max_seats: 12, is_active: true,
  })
  if (groupMade) {
    const dates: Array<[string, string, 'online' | 'offline', string]> = [
      [plusDays(14), '18:00:00', 'online', ''],
      [plusDays(35), '19:00:00', 'offline', '12 Rustaveli Ave, Tbilisi'],
    ]
    for (const [date, start_time, format, location] of dates) {
      const scheduleId = newId()
      const batch = db().batch()
      batch.set(db().collection(COLLECTIONS.schedules).doc(scheduleId), {
        session: groupId, date, start_time, format, location, location_maps_url: '', seats_total: 12, seats_taken: 0,
      })
      for (let n = 1; n <= 12; n++) {
        batch.set(db().collection(COLLECTIONS.schedules).doc(scheduleId).collection('seats').doc(String(n)), {
          schedule: scheduleId, seat_number: n, user: null, user_name: null, user_initials: null, reserved_at: null,
        })
      }
      await batch.commit()
    }
  }

  console.log('Packages')
  await ensureDoc(COLLECTIONS.packages, '20000000-0000-0000-0000-000000000001', {
    title: 'Full Transformation', title_ka: 'სრული ტრანსფორმაცია',
    description: 'Six months of executive and generative coaching, booked session by session from the live availability.',
    description_ka: 'ექვსი თვე ექსეკუტივ და გენერაციული კოუჩინგი, სესიების დაჯავშნა ცოცხალი განრიგიდან.',
    price: 2400, duration_months: 6, is_active: true,
    session_ids: ['10000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000004'],
  })

  console.log('Vouchers')
  const validFrom = new Date(today)
  validFrom.setUTCHours(0, 0, 0, 0)
  const validUntil = new Date(validFrom)
  validUntil.setUTCFullYear(validUntil.getUTCFullYear() + 1)
  await ensureDoc(COLLECTIONS.vouchers, 'WELCOME10', {
    code: 'WELCOME10', discount_type: 'percentage', discount_value: 10, max_uses: 100,
    valid_from: validFrom.toISOString(), valid_until: validUntil.toISOString(), is_active: true, applicable_sessions: [], times_used: 0,
  })

  console.log('Free consultation slots')
  for (let offset = 2, made = 0; offset < 30 && made < 6; offset += 1) {
    const date = plusDays(offset)
    if (isWeekend(date)) continue
    for (const [start_time, end_time] of [['11:00:00', '11:30:00'], ['16:00:00', '16:30:00']]) {
      await ensureDoc(COLLECTIONS.consultationSlots, `${date}_${start_time.replace(/:/g, '')}`, {
        date, start_time, end_time, is_booked: false, booked_by: null, booked_by_name: null,
      })
    }
    made += 1
  }

  console.log('Events')
  const events = [
    ['60000000-0000-0000-0000-000000000001', 'Unleash the Inner Edge', 'Workshop', plusDays(32), 'Tbilisi · In-Person', '60 seats', '/event-1.webp'],
    ['60000000-0000-0000-0000-000000000002', 'The Art of Presence', 'Masterclass', plusDays(50), 'Online · Live', '200 seats', '/event-2.webp'],
    ['60000000-0000-0000-0000-000000000003', 'Founders Retreat', 'Retreat', plusDays(75), 'Kakheti · 3 days', '20 seats', '/event-3.webp'],
  ] as const
  for (const [id, title, type, date, location, seats, image] of events) {
    await ensureDoc(COLLECTIONS.events, id, { title, type, date: longDate(date), location, seats, image })
  }

  console.log('Content')
  const pillars = [
    ['40000000-0000-0000-0000-000000000001', 'Executive Coaching', 'ექსეკუტივ კოუჩინგი', 'Sharpen decision-making, presence, and performance for high-stakes leadership.', 'გააუმჯობესე გადაწყვეტილებების მიღება, ყოფნა და შედეგიანობა მაღალი ფსონის ლიდერობისთვის.', ['Leadership identity', 'Strategic clarity', 'Peak performance'], ['ლიდერის იდენტობა', 'სტრატეგიული სიცხადე', 'პიკური შედეგიანობა']],
    ['40000000-0000-0000-0000-000000000002', 'RTT Therapy', 'RTT თერაპია', 'Rapid Transformational Therapy to rewire limiting beliefs at the source.', 'სწრაფი ტრანსფორმაციული თერაპია შემზღუდველი რწმენების სათავეშივე შესაცვლელად.', ['Subconscious work', 'Belief rewiring', 'Lasting change'], ['ქვეცნობიერთან მუშაობა', 'რწმენების გადაწყობა', 'მყარი ცვლილება']],
    ['40000000-0000-0000-0000-000000000003', 'NLP Mastery', 'NLP ოსტატობა', 'Neuro-Linguistic Programming tools to shift patterns and communicate with power.', 'ნეირო-ლინგვისტური პროგრამირების ინსტრუმენტები შაბლონების შესაცვლელად და ძლიერი კომუნიკაციისთვის.', ['Language patterns', 'State control', 'Reframing'], ['ენობრივი შაბლონები', 'მდგომარეობის მართვა', 'რეფრეიმინგი']],
    ['40000000-0000-0000-0000-000000000004', 'Generative Coaching', 'გენერაციული კოუჩინგი', 'Create new futures from a place of wholeness, creativity, and intention.', 'შექმენი ახალი მომავალი მთლიანობის, კრეატიულობისა და განზრახვის ადგილიდან.', ['Vision building', 'Creative flow', 'Embodied growth'], ['ხედვის შექმნა', 'კრეატიული ნაკადი', 'განსხეულებული ზრდა']],
  ] as const
  for (const [i, [id, title, titleKa, blurb, blurbKa, points, pointsKa]] of pillars.entries()) {
    await ensureDocFilling(COLLECTIONS.pillars, id, {
      title, title_ka: titleKa, blurb, blurb_ka: blurbKa, points: [...points], points_ka: [...pointsKa], order: i + 1,
      long_description: '', long_description_ka: '', history: '', history_ka: '',
    })
  }
  const testimonials = [
    ['30000000-0000-0000-0000-000000000001', 'I walked in carrying years of doubt and walked out with a plan I actually believed in.', 'Sofia Marchetti', 'Founder, Northbound Studio'],
    ['30000000-0000-0000-0000-000000000002', 'The RTT session unlocked something I had been circling for a decade.', 'David Okonkwo', 'Managing Director'],
    ['30000000-0000-0000-0000-000000000003', 'Less hype, more depth. The coaching was genuinely transformative for my leadership.', 'Hana Lindqvist', 'VP of Product'],
  ] as const
  for (const [i, [id, quote, name, role]] of testimonials.entries()) {
    await ensureDoc(COLLECTIONS.testimonials, id, { quote, name, role, order: i + 1 })
  }
  await ensureDoc(COLLECTIONS.tests, '50000000-0000-0000-0000-000000000001', {
    title: 'Find Your Path',
    description: 'A quick reflection to match you with the right coaching style.',
    category: 'Self-discovery',
    published: true,
    course_outcomes: {},
    combination_results: {},
    updated_at: Timestamp.now(),
    questions: [
      { id: newId(), order: 1, question: 'When you imagine real change, what feels most alive?', options: ['Breaking through a long-held fear', 'Building a bold new vision', 'Finding calm and steadiness', 'Leading others with clarity'] },
      { id: newId(), order: 2, question: 'Where do you feel the most friction right now?', options: ['My inner self-talk', 'My career direction', 'My relationships', 'My energy and focus'] },
    ],
  })
  console.log(memberId ? `Done. Demo member: ${MEMBER_EMAIL}` : 'Done.')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
