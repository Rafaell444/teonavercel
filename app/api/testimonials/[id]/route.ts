import { byNumber } from '@/lib/server/data'
import { simpleCollection } from '@/lib/server/services/crud'

import { testimonialSchema } from '../route'

const routes = simpleCollection({
  collection: 'testimonials',
  create: testimonialSchema,
  patch: testimonialSchema.partial(),
  sort: byNumber('order'),
})

export const PATCH = routes.PATCH
export const DELETE = routes.DELETE
