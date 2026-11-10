// Static values the site still reads from code rather than from the API.
// (The old demo content that lived here — pillars, events, testimonials, quiz
// questions and so on — now comes from the backend and was removed.)

export type Tier = 'Explorer' | 'Achiever' | 'Master' | 'Luminary'

/** XP needed to reach each membership tier (must match tierForXp on the server). */
export const tiers: { name: Tier; xp: number }[] = [
  { name: 'Explorer', xp: 0 },
  { name: 'Achiever', xp: 1000 },
  { name: 'Master', xp: 5000 },
  { name: 'Luminary', xp: 10000 },
]

export const footerCompanyLinks: { label: string; view: string }[] = [
  { label: 'About', view: 'about' },
  { label: 'Contact', view: 'contact' },
  { label: 'Tests', view: 'quiz' },
]

export const footerSessionLinks: { label: string; view: string }[] = [
  { label: '1:1 Sessions', view: 'booking' },
  { label: 'Group Sessions', view: 'roundtable' },
  { label: 'Packages', view: 'packages' },
]

// NOTE: still placeholder data — every member sees this same list on the
// dashboard's Growth tab. It should come from the backend per user.
export const growthMilestones = [
  { label: 'First session completed', label_ka: 'პირველი სესია დასრულებულია', done: true },
  { label: 'Defined your core vision', label_ka: 'ძირითადი ხედვა განსაზღვრულია', done: true },
  { label: 'Reached Achiever tier', label_ka: 'Achiever დონე მიღწეულია', done: true },
  { label: '10 diary entries logged', label_ka: 'დღიურში 10 ჩანაწერია', done: true },
  { label: 'Complete a group circle', label_ka: 'ჯგუფური წრის გავლა', done: false },
  { label: 'Unlock Master tier', label_ka: 'Master დონის გახსნა', done: false },
]
