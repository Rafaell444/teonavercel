import { byNumber } from '@/lib/server/data'
import { simpleCollection } from '@/lib/server/services/crud'

import { pillarSchema } from '../route'

const routes = simpleCollection({
  collection: 'pillars',
  create: pillarSchema,
  patch: pillarSchema.partial(),
  sort: byNumber('order'),
})

export const PATCH = routes.PATCH
export const DELETE = routes.DELETE
