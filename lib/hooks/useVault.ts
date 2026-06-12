'use client'

import useSWR, { mutate } from 'swr'

import { apiFetch } from '@/lib/api'

export interface VaultItem {
  id: string
  title: string
  kind: string
  category: 'Test' | 'Book' | 'Resource'
  locked: boolean
  file_url: string | null
  added_by_name: string | null
  assigned_to_id: string | null
  assigned_to_name: string | null
  created_at: string
}

const fetcher = () => apiFetch<VaultItem[]>('/api/vault/')

export function useVault() {
  const { data, error, isLoading } = useSWR('/api/vault/', fetcher)
  return { vault: data ?? [], isLoading, error }
}

export async function uploadVaultItem(formData: FormData) {
  const res = await apiFetch<VaultItem>('/api/vault/', { method: 'POST', body: formData })
  await mutate('/api/vault/')
  return res
}

export async function deleteVaultItem(id: string) {
  await apiFetch(`/api/vault/${id}/`, { method: 'DELETE' })
  await mutate('/api/vault/')
}
