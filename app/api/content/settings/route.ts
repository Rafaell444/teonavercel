import { z } from 'zod'

import { requireAdmin } from '@/lib/server/auth'
import { COLLECTIONS, compact } from '@/lib/server/data'
import { db } from '@/lib/server/firebase'
import { handle, json, parseBody } from '@/lib/server/http'
import { deleteFile, uploadFile } from '@/lib/server/storage'
import { fileField, text } from '@/lib/server/validation'

/** Single document: settings/site. Field names are camelCase, as the frontend reads them. */
const DEFAULTS = {
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

const ref = () => db().collection(COLLECTIONS.settings).doc('site')

export async function readSettings() {
  const snap = await ref().get()
  return { ...DEFAULTS, ...(snap.data() ?? {}) }
}

export const GET = handle(async () => json(await readSettings()))

const patchSchema = z.object({
  brandName: text(60).optional(),
  heroBadge: text(200).optional(),
  heroBadgeKa: text(200).optional(),
  heroTitle: text(200).optional(),
  heroTitleKa: text(200).optional(),
  heroHighlight: text(100).optional(),
  heroHighlightKa: text(100).optional(),
  heroSubtitle: text(2000).optional(),
  heroSubtitleKa: text(2000).optional(),
  footerTagline: text(2000).optional(),
  footerTaglineKa: text(2000).optional(),
  contactEmail: text(254).optional(),
  contactPhone: text(50).optional(),
  contactLocation: text(200).optional(),
  statHours: text(20).optional(),
  statLives: text(20).optional(),
  statReturn: text(20).optional(),
  heroImage: fileField.optional(),
})

export const PATCH = handle(async (req) => {
  await requireAdmin(req)
  const { heroImage, ...fields } = await parseBody(req, patchSchema)
  const patch: Record<string, unknown> = compact(fields)
  if (heroImage) {
    const previous = (await readSettings()).heroImage
    patch.heroImage = await uploadFile(heroImage, 'hero', { imagesOnly: true })
    await deleteFile(previous)
  }
  if (Object.keys(patch).length) await ref().set(patch, { merge: true })
  return json(await readSettings())
})
