import { z } from 'zod'

import { requireAdmin } from '@/lib/server/auth'
import { compact } from '@/lib/server/data'
import { handle, json, parseBody } from '@/lib/server/http'
import { getSettings, invalidate, readSettings, settingsRef, TAGS } from '@/lib/server/public-content'
import { deleteFile, uploadFile } from '@/lib/server/storage'
import { fileField, text } from '@/lib/server/validation'

/** Public: the site settings (cached; see lib/server/public-content). */
export const GET = handle(async () => json(await getSettings()))

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
  if (Object.keys(patch).length) {
    await settingsRef().set(patch, { merge: true })
    invalidate(TAGS.settings)
  }
  return json(await readSettings())
})
