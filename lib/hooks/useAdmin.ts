'use client'

import useSWR, { mutate } from 'swr'

import { apiFetch } from '@/lib/api'
import type { AppUser } from './useAuth'

export interface AdminUserPatch {
  tier?: string
  xp?: number
  vouchers?: number
  role?: string
}

export function useAdminUsers(params?: { role?: string; tier?: string; search?: string }) {
  const qs = new URLSearchParams()
  if (params?.role) qs.set('role', params.role)
  if (params?.tier) qs.set('tier', params.tier)
  if (params?.search) qs.set('search', params.search)
  const key = `/api/users/?${qs.toString()}`
  const { data, error, isLoading } = useSWR(key, () => apiFetch<AppUser[]>(key))
  return { users: data ?? [], isLoading, error }
}

export async function updateAdminUser(id: string, patch: AdminUserPatch) {
  const res = await apiFetch<AppUser>(`/api/users/${id}/`, {
    method: 'PATCH',
    body: JSON.stringify(patch),
  })
  await mutate((key: string) => key.startsWith('/api/users/'))
  return res
}

export async function addXP(id: string, amount: number) {
  const res = await apiFetch<AppUser>(`/api/users/${id}/add-xp/`, {
    method: 'POST',
    body: JSON.stringify({ amount }),
  })
  await mutate((key: string) => key.startsWith('/api/users/'))
  return res
}

export async function deleteAdminUser(id: string) {
  await apiFetch(`/api/users/${id}/`, { method: 'DELETE' })
  await mutate((key: string) => key.startsWith('/api/users/'))
}
