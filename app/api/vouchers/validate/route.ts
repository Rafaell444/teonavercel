import { z } from 'zod'

import { COLLECTIONS, toApi } from '@/lib/server/data'
import { db } from '@/lib/server/firebase'
import { badRequest, handle, json, notFound, parseBody } from '@/lib/server/http'
import { computeDiscount, voucherIsValid, type VoucherDoc } from '@/lib/server/services/bookings'
import { money } from '@/lib/server/validation'

const schema = z.object({
  code: z.string().trim().min(1).max(50),
  session_id: z.string().optional().nullable(),
  num_sessions: z.coerce.number().int().optional(),
  base_price: money.optional(),
})

/** Public: check a code and preview the discount. The real discount is recomputed when booking. */
export const POST = handle(async (req) => {
  const body = await parseBody(req, schema)
  const code = body.code.toUpperCase()
  const voucher = toApi<Omit<VoucherDoc, 'id'>>(await db().collection(COLLECTIONS.vouchers).doc(code).get()) as VoucherDoc | null
  if (!voucher) throw notFound('Invalid voucher code.')
  if (!voucherIsValid(voucher)) throw badRequest('This voucher has expired or reached its usage limit.')
  if (body.session_id && voucher.applicable_sessions?.length && !voucher.applicable_sessions.includes(body.session_id)) {
    throw badRequest('This voucher is not applicable to this session.')
  }
  const discount = body.base_price ? computeDiscount(voucher, body.base_price) : 0
  return json({
    code: voucher.code,
    discount_type: voucher.discount_type,
    discount_value: String(voucher.discount_value),
    computed_discount: String(discount),
    valid: true,
  })
})
