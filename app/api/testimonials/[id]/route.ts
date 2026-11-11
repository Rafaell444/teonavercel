import { byNumber } from '@/lib/server/data'
import { invalidate, TAGS } from '@/lib/server/public-content'
import { simpleCollection } from '@/lib/server/services/crud'

import { testimonialSchema } from '../route'

const routes = simpleCollection({
  collection: 'testimonials',
  create: testimonialSchema,
  patch: testimonialSchema.partial(),
  sort: byNumber('order'),
  onChange: () => invalidate(TAGS.testimonials),
})

export const PATCH = routes.PATCH
export const DELETE = routes.DELETE
