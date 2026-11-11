import { byNumber } from '@/lib/server/data'
import { invalidate, TAGS } from '@/lib/server/public-content'
import { simpleCollection } from '@/lib/server/services/crud'

import { pillarSchema } from '../route'

const routes = simpleCollection({
  collection: 'pillars',
  create: pillarSchema,
  patch: pillarSchema.partial(),
  sort: byNumber('order'),
  onChange: () => invalidate(TAGS.pillars),
})

export const PATCH = routes.PATCH
export const DELETE = routes.DELETE
