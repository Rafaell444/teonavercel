import { z } from 'zod'

/** Shared field validators (zod). Multipart bodies arrive as strings, hence `coerce`. */

export const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Use the YYYY-MM-DD format.')

/** "HH:MM" or "HH:MM:SS" -> "HH:MM:SS" */
export const clockTime = z
  .string()
  .regex(/^\d{2}:\d{2}(:\d{2})?$/, 'Use the HH:MM format.')
  .transform((v) => (v.length === 5 ? `${v}:00` : v))

export const money = z.coerce.number().min(0).max(1_000_000)
export const intField = z.coerce.number().int()
export const boolField = z.preprocess((v) => (v === 'true' ? true : v === 'false' ? false : v), z.boolean())
export const text = (max = 1000) => z.string().trim().max(max)
export const required = (max = 200) => z.string().trim().min(1, 'This field is required.').max(max)
export const email = z.string().trim().toLowerCase().email('Enter a valid email address.')
export const uuidLike = z.string().min(1).max(128)
export const fileField = z.instanceof(File)
export const stringList = z.preprocess(
  (v) => (typeof v === 'string' ? (v.trim().startsWith('[') ? JSON.parse(v) : v.split(',').map((s) => s.trim()).filter(Boolean)) : v),
  z.array(z.string()),
)
export const jsonObject = z.preprocess((v) => (typeof v === 'string' ? JSON.parse(v) : v), z.record(z.string(), z.string()))
