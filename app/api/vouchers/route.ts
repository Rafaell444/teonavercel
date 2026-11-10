import { z } from 'zod'

import { requireAdmin } from '@/lib/server/auth'
import { COLLECTIONS, byString, listApi, now, toApi } from '@/lib/server/data'
import { db } from '@/lib/server/firebase'
import { badRequest, conflict, created, handle, json, parseBody } from '@/lib/server/http'
import { voucherIsValid, type VoucherDoc } from '@/lib/server/services/bookings'
import { money, stringList } from '@/lib/server/validation'

const col = () => db().collection(COLLECTIONS.vouchers)

export const present = (v: VoucherDoc) => ({ ...v, is_valid: voucherIsValid(v) })

export const voucherSchema = z.object({
  code: z.string().trim().min(2).max(50).transform((v) => v.toUpperCase()),
  discount_type: z.enum(['percentage', 'fixed']),
  discount_value: money,
  max_uses: z.preprocess((v) => (v === '' || v === null ? null : v), z.coerce.number().int().min(1).nullable()).default(null),
  valid_from: z.coerce.date({ error: 'Enter a valid "valid from" date.' }),
  valid_until: z.coerce.date({ error: 'Enter a valid "valid until" date.' }),
  is_active: z.coerce.boolean().default(true),
  applicable_sessions: stringList.default([]),
})

export const GET = handle(async (req) => {
  await requireAdmin(req)
  const items = (await listApi<Omit<VoucherDoc, 'id'>>(col())) as VoucherDoc[]
  items.sort(byString('created_at', 'desc'))
  return json(items.map(present))
})

/** Admin: create a voucher. The code is the document id, so it is unique. */
export const POST = handle(async (req) => {
  await requireAdmin(req)
  const body = await parseBody(req, voucherSchema)
  if (body.discount_type === 'percentage' && body.discount_value > 100) throw badRequest('A percentage discount cannot exceed 100.')
  if (body.valid_until <= body.valid_from) throw badRequest('"Valid until" must be after "valid from".')
  const ref = col().doc(body.code)
  if ((await ref.get()).exists) throw conflict('A voucher with this code already exists.')
  await ref.set({
    ...body,
    valid_from: body.valid_from.toISOString(),
    valid_until: body.valid_until.toISOString(),
    times_used: 0,
    created_at: now(),
  })
  return created(present(toApi<Omit<VoucherDoc, 'id'>>(await ref.get()) as VoucherDoc))
})
