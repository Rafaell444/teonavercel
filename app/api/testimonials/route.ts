import { z } from 'zod'

import { byNumber } from '@/lib/server/data'
import { simpleCollection } from '@/lib/server/services/crud'
import { intField, required, text } from '@/lib/server/validation'

export const testimonialSchema = z.object({
  quote: required(2000),
  name: required(120),
  role: text(150).default(''),
  order: intField.min(0).default(0),
})

const routes = simpleCollection({
  collection: 'testimonials',
  create: testimonialSchema,
  patch: testimonialSchema.partial(),
  sort: byNumber('order'),
})

export const GET = routes.GET
export const POST = routes.POST
