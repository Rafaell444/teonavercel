import { requireAdmin } from '@/lib/server/auth'
import { COLLECTIONS, compact, getOr404 } from '@/lib/server/data'
import { assertId, handle, json, noContent, parseBody, type Params } from '@/lib/server/http'
import type { VoucherDoc } from '@/lib/server/services/bookings'

import { present, voucherSchema } from '../route'

type Ctx = Params<{ id: string }>

/** Admin: edit a voucher (the code itself cannot change, it is the id). */
export const PATCH = handle<Ctx>(async (req, { params }) => {
  await requireAdmin(req)
  const id = assertId((await params).id)
  const { ref } = await getOr404(COLLECTIONS.vouchers, id)
  const { code: _code, ...body } = await parseBody(req, voucherSchema.partial())
  const patch = compact({
    ...body,
    valid_from: body.valid_from?.toISOString(),
    valid_until: body.valid_until?.toISOString(),
  })
  if (Object.keys(patch).length) await ref.update(patch)
  return json(present((await getOr404<Omit<VoucherDoc, 'id'>>(COLLECTIONS.vouchers, id)).data as VoucherDoc))
})

export const DELETE = handle<Ctx>(async (req, { params }) => {
  await requireAdmin(req)
  const { ref } = await getOr404(COLLECTIONS.vouchers, assertId((await params).id))
  await ref.delete()
  return noContent()
})
