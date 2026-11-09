import type { Locale } from '@/lib/i18n'

/** Two-letter weekday headers for the booking calendars, Sunday first. */
export const WEEKDAY_LABELS: Record<Locale, string[]> = {
  en: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
  ka: ['კვ', 'ორ', 'სა', 'ოთ', 'ხუ', 'პა', 'შა'],
}

// Georgian names are written out here on purpose: not every browser ships
// Georgian date data, and those that don't silently fall back to English.
const KA_MONTHS = [
  'იანვარი', 'თებერვალი', 'მარტი', 'აპრილი', 'მაისი', 'ივნისი',
  'ივლისი', 'აგვისტო', 'სექტემბერი', 'ოქტომბერი', 'ნოემბერი', 'დეკემბერი',
]
const KA_MONTHS_SHORT = ['იან', 'თებ', 'მარ', 'აპრ', 'მაი', 'ივნ', 'ივლ', 'აგვ', 'სექ', 'ოქტ', 'ნოე', 'დეკ']
const KA_WEEKDAYS_SHORT = ['კვი', 'ორშ', 'სამ', 'ოთხ', 'ხუთ', 'პარ', 'შაბ']

/** "18:00:00" -> "18:00". Anything that is not a clock time is returned as is. */
export function formatTime(time?: string | null): string {
  if (!time) return ''
  const m = /^(\d{1,2}):(\d{2})/.exec(time)
  return m ? `${m[1].padStart(2, '0')}:${m[2]}` : time
}

function toDate(value: string | Date): Date | null {
  if (value instanceof Date) return value
  // Plain ISO dates are parsed as local midnight, not UTC, so the day never shifts
  const d = /^\d{4}-\d{2}-\d{2}$/.test(value) ? new Date(`${value}T00:00`) : new Date(value)
  return Number.isNaN(d.getTime()) ? null : d
}

export interface DateStyle {
  /** Include the year (default true). */
  year?: boolean
  /** Prefix the short weekday name (default false). */
  weekday?: boolean
}

/**
 * Formats a date for display in the visitor's language:
 * "Nov 23, 2026" in English, "23 ნოე, 2026" in Georgian.
 * Accepts Date objects, ISO dates ("2026-11-23") and the "Mar 14, 2026" strings
 * bookings are stored with. Text that is not a date (e.g. "Ongoing") is returned unchanged.
 */
export function formatDate(
  value: string | Date | null | undefined,
  locale: Locale,
  { year = true, weekday = false }: DateStyle = {},
): string {
  if (!value) return ''
  const d = toDate(value)
  if (!d) return String(value)

  if (locale === 'ka') {
    let out = `${d.getDate()} ${KA_MONTHS_SHORT[d.getMonth()]}`
    if (year) out += `, ${d.getFullYear()}`
    if (weekday) out = `${KA_WEEKDAYS_SHORT[d.getDay()]}, ${out}`
    return out
  }
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    ...(year ? { year: 'numeric' as const } : {}),
    ...(weekday ? { weekday: 'short' as const } : {}),
  })
}

/** Month and day as separate pieces, for the calendar-tile style date badge. */
export function dateParts(
  value: string | Date | null | undefined,
  locale: Locale,
): { month: string; day: string } | null {
  if (!value) return null
  const d = toDate(value)
  if (!d) return null
  return {
    month:
      locale === 'ka'
        ? KA_MONTHS_SHORT[d.getMonth()]
        : d.toLocaleDateString('en-US', { month: 'short' }),
    day: String(d.getDate()),
  }
}

/** "November 2026" / "ნოემბერი 2026" for calendar headers. */
export function monthYearLabel(year: number, monthIndex: number, locale: Locale): string {
  if (locale === 'ka') return `${KA_MONTHS[monthIndex]} ${year}`
  return new Date(year, monthIndex, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
}
