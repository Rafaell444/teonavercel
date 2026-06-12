'use client'

import useSWR, { mutate } from 'swr'

import { apiFetch } from '@/lib/api'

export interface Voucher {
  id: string
  code: string
  discount_type: 'percentage' | 'fixed'
  discount_value: number
  max_uses: number | null
  times_used: number
  valid_from: string
  valid_until: string
  is_active: boolean
  applicable_sessions: string[]
  is_valid: boolean
  created_at: string
}

export interface VoucherValidation {
  code: string
  discount_type: 'percentage' | 'fixed'
  discount_value: string
  computed_discount: string
  valid: boolean
}

const fetcher = () => apiFetch<Voucher[]>('/api/vouchers/')

export function useVouchers() {
  const { data, error, isLoading } = useSWR('/api/vouchers/', fetcher)
  return { vouchers: data ?? [], isLoading, error }
}

export async function createVoucher(body: Partial<Voucher>) {
  const res = await apiFetch<Voucher>('/api/vouchers/', {
    method: 'POST',
    body: JSON.stringify(body),
  })
  await mutate('/api/vouchers/')
  return res
}

export async function updateVoucher(id: string, body: Partial<Voucher>) {
  const res = await apiFetch<Voucher>(`/api/vouchers/${id}/`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  })
  await mutate('/api/vouchers/')
  return res
}

export async function deleteVoucher(id: string) {
  await apiFetch(`/api/vouchers/${id}/`, { method: 'DELETE' })
  await mutate('/api/vouchers/')
}

export async function validateVoucher(
  code: string,
  sessionId?: string,
  basePrice?: number
): Promise<VoucherValidation> {
  return apiFetch<VoucherValidation>('/api/vouchers/validate/', {
    method: 'POST',
    body: JSON.stringify({
      code,
      session_id: sessionId || null,
      base_price: basePrice || 0,
    }),
  })
}
