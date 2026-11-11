import { z } from 'zod'

import { byNumber } from '@/lib/server/data'
import { getPillars, invalidate, TAGS } from '@/lib/server/public-content'
import { simpleCollection } from '@/lib/server/services/crud'
import { intField, required, stringList, text } from '@/lib/server/validation'

export const pillarSchema = z.object({
  title: required(150),
  title_ka: text(150).default(''),
  blurb: required(2000),
  blurb_ka: text(2000).default(''),
  points: stringList.default([]),
  points_ka: stringList.default([]),
  order: intField.min(0).default(0),
  long_description: text(20000).default(''),
  long_description_ka: text(20000).default(''),
  history: text(20000).default(''),
  history_ka: text(20000).default(''),
})

const routes = simpleCollection({
  collection: 'pillars',
  create: pillarSchema,
  patch: pillarSchema.partial(),
  sort: byNumber('order'),
  list: getPillars,
  onChange: () => invalidate(TAGS.pillars),
})

export const GET = routes.GET
export const POST = routes.POST
