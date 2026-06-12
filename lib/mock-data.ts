export type Tier = 'Explorer' | 'Achiever' | 'Master' | 'Luminary'

export const pillars = [
  {
    title: 'Executive Coaching',
    blurb:
      'Sharpen decision-making, presence, and performance for high-stakes leadership.',
    points: ['Leadership identity', 'Strategic clarity', 'Peak performance'],
  },
  {
    title: 'RTT Therapy',
    blurb:
      'Rapid Transformational Therapy to rewire limiting beliefs at the source.',
    points: ['Subconscious work', 'Belief rewiring', 'Lasting change'],
  },
  {
    title: 'NLP Mastery',
    blurb:
      'Neuro-Linguistic Programming tools to shift patterns and communicate with power.',
    points: ['Language patterns', 'State control', 'Reframing'],
  },
  {
    title: 'Generative Coaching',
    blurb:
      'Create new futures from a place of wholeness, creativity, and intention.',
    points: ['Vision building', 'Creative flow', 'Embodied growth'],
  },
]

export const events = [
  {
    title: 'Unleash the Inner Edge',
    type: 'Live Seminar',
    date: 'Mar 14, 2026',
    location: 'Lisbon · In-Person',
    seats: '120 seats',
    image: '/event-1.png',
  },
  {
    title: 'Stillness & Strategy Retreat',
    type: 'Weekend Retreat',
    date: 'Apr 02, 2026',
    location: 'Azores · Retreat',
    seats: '24 seats',
    image: '/event-2.png',
  },
  {
    title: 'Deep Work: 1:1 Intensive',
    type: 'Private Session',
    date: 'Ongoing',
    location: 'Online · Worldwide',
    seats: 'By application',
    image: '/event-3.png',
  },
  {
    title: 'The Breakthrough Circle',
    type: 'Group Coaching',
    date: 'Mar 28, 2026',
    location: 'Online · Live',
    seats: '10 seats',
    image: '/event-1.png',
  },
]

export const testimonials = [
  {
    quote:
      'I walked in carrying years of doubt and walked out with a plan I actually believed in. This work is the real thing.',
    name: 'Sofia Marchetti',
    role: 'Founder, Northbound Studio',
  },
  {
    quote:
      'The RTT session unlocked something I had been circling for a decade. My relationship with fear completely shifted.',
    name: 'David Okonkwo',
    role: 'Managing Director',
  },
  {
    quote:
      'Less hype, more depth. The coaching was grounded, precise, and genuinely transformative for my leadership.',
    name: 'Hana Lindqvist',
    role: 'VP of Product',
  },
]

export const courses = [
  { id: 'executive', name: 'Executive Coaching', price: 480 },
  { id: 'rtt', name: 'RTT Therapy', price: 360 },
  { id: 'nlp', name: 'NLP Mastery', price: 420 },
  { id: 'generative', name: 'Generative Coaching', price: 390 },
]

export const tiers: { name: Tier; xp: number }[] = [
  { name: 'Explorer', xp: 0 },
  { name: 'Achiever', xp: 1500 },
  { name: 'Master', xp: 4000 },
  { name: 'Luminary', xp: 8000 },
]

export const user = {
  name: 'Elena Voss',
  initials: 'EV',
  tier: 'Achiever' as Tier,
  xp: 2840,
  vouchers: 3,
}

export const diaryEntries = [
  {
    date: 'Today',
    title: 'Morning clarity',
    excerpt: 'Noticed I default to over-planning when anxious. Naming it helped.',
    mood: 'Focused',
  },
  {
    date: 'Yesterday',
    title: 'After the session',
    excerpt: 'The reframe on "rest as strategy" is still landing. Felt lighter.',
    mood: 'Calm',
  },
  {
    date: 'Mar 02',
    title: 'Small win',
    excerpt: 'Said no to a meeting that drained me. Protecting deep work.',
    mood: 'Grounded',
  },
]

export const roundTableSeats = [
  { name: 'Elena Voss', initials: 'EV' },
  { name: 'Marcus Reed', initials: 'MR' },
  { name: 'Aiko Tanaka', initials: 'AT' },
  { name: 'Liam Brennan', initials: 'LB' },
  null,
  { name: 'Priya Nair', initials: 'PN' },
  null,
  null,
  { name: 'Tomas Vasquez', initials: 'TV' },
  null,
]

export const quizQuestions = [
  {
    question: 'When you imagine real change, what feels most alive?',
    options: [
      'Breaking through a long-held fear',
      'Building a bold new vision',
      'Finding calm and steadiness',
      'Leading others with clarity',
    ],
  },
  {
    question: 'Where do you feel the most friction right now?',
    options: [
      'My inner self-talk',
      'My career direction',
      'My relationships',
      'My energy and focus',
    ],
  },
  {
    question: 'How do you prefer to grow?',
    options: [
      'Deep one-on-one work',
      'Energy of a live group',
      'Quiet, reflective practice',
      'Structured challenges',
    ],
  },
  {
    question: 'What would success feel like in 90 days?',
    options: [
      'Freedom from an old pattern',
      'A clear, exciting plan',
      'Genuine inner peace',
      'Confident, decisive action',
    ],
  },
]

export const footerLinks = [
  { label: 'Courses', href: '/kursebi' },
  { label: 'Groups', href: '/jgupebi' },
  { label: 'Blog', href: '/blogi' },
  { label: 'Tests', href: '/testebi' },
]

export const scheduleItems = [
  {
    title: 'Deep Work: 1:1 Intensive',
    coach: 'with James Carter',
    date: 'Tomorrow',
    time: '10:00 AM',
    type: 'Online · Zoom',
    status: 'Confirmed',
  },
  {
    title: 'The Breakthrough Circle',
    coach: 'Group session',
    date: 'Mar 28',
    time: '6:00 PM',
    type: 'Online · Live',
    status: 'Confirmed',
  },
  {
    title: 'RTT Therapy Session',
    coach: 'with Dr. Amara Cole',
    date: 'Apr 04',
    time: '2:30 PM',
    type: 'In-Person · Lisbon',
    status: 'Pending',
  },
]

export const vaultItems = [
  {
    title: 'Rewiring the Inner Critic',
    kind: 'Audio · 42 min',
    locked: false,
  },
  {
    title: 'Morning Priming Ritual',
    kind: 'Video · 18 min',
    locked: false,
  },
  {
    title: 'The Identity Shift Workbook',
    kind: 'PDF · 24 pages',
    locked: false,
  },
  {
    title: 'Masterclass: Fear to Fuel',
    kind: 'Video · 1h 12min',
    locked: true,
  },
  {
    title: 'Luminary Live Recordings',
    kind: 'Collection · 9 items',
    locked: true,
  },
]

export const growthMilestones = [
  { label: 'First session completed', done: true },
  { label: 'Defined your core vision', done: true },
  { label: 'Reached Achiever tier', done: true },
  { label: '10 diary entries logged', done: true },
  { label: 'Complete a group circle', done: false },
  { label: 'Unlock Master tier', done: false },
]
