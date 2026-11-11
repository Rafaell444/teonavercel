import { revalidatePath, revalidateTag, unstable_cache } from 'next/cache'

import { COLLECTIONS, byNumber, byString, listApi } from './data'
import { db } from './firebase'
import { packagesCol, presentPackages, sessionsCol } from './services/sessions'

/**
 * Public site content, cached on the server.
 *
 * Everything a visitor sees on the marketing pages changes only when the
 * coach edits it in the admin panel, so it is read from Firestore once and
 * served from Next's data cache (shared by every server instance on Vercel).
 * Each admin write calls `invalidate()` for the content it touched, which
 * empties that cache entry and the cached home page at once, so edits show
 * up on the next request. The one-hour `revalidate` is only a safety net.
 *
 * The same functions feed the API routes and the home page's first render,
 * so a visitor gets the content in the initial HTML.
 */

export const TAGS = {
  settings: 'content:settings',
  pillars: 'content:pillars',
  testimonials: 'content:testimonials',
  events: 'content:events',
  certificates: 'content:certificates',
  sessions: 'content:sessions',
  packages: 'content:packages',
} as const

export type ContentTag = (typeof TAGS)[keyof typeof TAGS]

const SAFETY_REVALIDATE_SECONDS = 3600

function cached<T>(tag: ContentTag, read: () => Promise<T>) {
  return unstable_cache(read, [tag], { tags: [tag], revalidate: SAFETY_REVALIDATE_SECONDS })
}

/**
 * Empties the cache for the given content right away (call after every write),
 * and the prebuilt home page that embeds it: a statically built page does not
 * pick up the data-cache tags, so it is refreshed by path.
 */
export function invalidate(...tags: ContentTag[]) {
  for (const tag of tags) revalidateTag(tag, { expire: 0 })
  revalidatePath('/')
}

/* ------------------------------------------------------------------ settings */

/** Single document: settings/site. Field names are camelCase, as the frontend reads them. */
export const SETTINGS_DEFAULTS = {
  brandName: 'TEONA',
  heroBadge: '',
  heroBadgeKa: '',
  heroTitle: '',
  heroTitleKa: '',
  heroHighlight: '',
  heroHighlightKa: '',
  heroSubtitle: '',
  heroSubtitleKa: '',
  footerTagline: '',
  footerTaglineKa: '',
  contactEmail: '',
  contactPhone: '',
  contactLocation: '',
  statHours: '',
  statLives: '',
  statReturn: '',
  heroImage: null as string | null,
}

export const settingsRef = () => db().collection(COLLECTIONS.settings).doc('site')

/** Reads the settings straight from Firestore (no cache), for the admin write path. */
export async function readSettings() {
  const snap = await settingsRef().get()
  return { ...SETTINGS_DEFAULTS, ...(snap.data() ?? {}) }
}

export const getSettings = cached(TAGS.settings, readSettings)

/* -------------------------------------------------------------- collections */

export const getPillars = cached(TAGS.pillars, async () => {
  const items = await listApi(db().collection(COLLECTIONS.pillars))
  return items.sort(byNumber('order'))
})

export const getTestimonials = cached(TAGS.testimonials, async () => {
  const items = await listApi(db().collection(COLLECTIONS.testimonials))
  return items.sort(byNumber('order'))
})

export const getEvents = cached(TAGS.events, async () => {
  const items = await listApi(db().collection(COLLECTIONS.events))
  return items.sort(byString('created_at', 'desc'))
})

export const getCertificates = cached(TAGS.certificates, async () => {
  const items = await listApi(db().collection(COLLECTIONS.certificates))
  return items.sort(byNumber('order'))
})

/** Active sessions, newest first. Filter by type with `sessionsOfType`. */
export const getActiveSessions = cached(TAGS.sessions, async () => {
  const items = await listApi(sessionsCol().where('is_active', '==', true))
  return items.sort(byString('created_at', 'desc'))
})

export function sessionsOfType<T extends Record<string, unknown>>(items: T[], type: string | null) {
  return type === 'group' || type === 'individual' ? items.filter((s) => s.session_type === type) : items
}

/** Active packages with the sessions they include (so it also depends on sessions). */
export const getActivePackages = unstable_cache(
  async () => {
    const items = await listApi(packagesCol().where('is_active', '==', true))
    items.sort(byString('created_at', 'desc'))
    return presentPackages(items)
  },
  [TAGS.packages],
  { tags: [TAGS.packages, TAGS.sessions], revalidate: SAFETY_REVALIDATE_SECONDS },
)

/* ---------------------------------------------------------- first render */

/**
 * SWR fallback data for the home page, keyed exactly like the client hooks
 * (lib/hooks/*). A part that fails to load is simply left out; the browser
 * then fetches it as before, so the page never fails because of it.
 */
export async function loadPublicFallback(): Promise<Record<string, unknown>> {
  const parts: Array<[string, () => Promise<unknown>]> = [
    ['/api/content/settings/', getSettings],
    ['/api/content/pillars/', getPillars],
    ['/api/testimonials/', getTestimonials],
    ['/api/events/', getEvents],
    ['/api/content/certificates/', getCertificates],
    ['/api/sessions/packages/', getActivePackages],
  ]
  const fallback: Record<string, unknown> = {}
  const [sessions, ...results] = await Promise.allSettled([getActiveSessions(), ...parts.map(([, read]) => read())])
  results.forEach((result, i) => {
    if (result.status === 'fulfilled') fallback[parts[i][0]] = result.value
  })
  if (sessions.status === 'fulfilled') {
    fallback['/api/sessions/'] = sessions.value
    fallback['/api/sessions/?type=group'] = sessionsOfType(sessions.value, 'group')
    fallback['/api/sessions/?type=individual'] = sessionsOfType(sessions.value, 'individual')
  }
  // Same JSON the API routes send, so values such as Firestore Timestamps
  // become plain data that can be passed to the client
  return JSON.parse(JSON.stringify(fallback)) as Record<string, unknown>
}
