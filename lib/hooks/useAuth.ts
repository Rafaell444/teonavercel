'use client'

import { useCallback } from 'react'
import useSWR, { mutate } from 'swr'

import { ApiError, setAccessToken } from '@/lib/api'

export interface AppUser {
  id: string
  name: string
  initials: string
  email: string
  role: 'admin' | 'member'
  tier: 'Explorer' | 'Achiever' | 'Master' | 'Luminary'
  xp: number
  vouchers: number
  joined: string
}

async function fetchMe(): Promise<AppUser | null> {
  const res = await fetch('/api/auth/me')
  if (res.status === 401) return null
  if (!res.ok) return null
  return res.json()
}

export function useMe() {
  const { data, error, isLoading } = useSWR<AppUser | null>('/api/auth/me', fetchMe, {
    revalidateOnFocus: false,
    shouldRetryOnError: false,
  })
  return { user: data ?? null, isLoading, error }
}

export function useLogin() {
  return useCallback(async (email: string, password: string): Promise<AppUser> => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    const data = await res.json()
    if (!res.ok) throw new ApiError(res.status, data)
    if (data.access) setAccessToken(data.access)
    await mutate('/api/auth/me', data.user, false)
    return data.user
  }, [])
}

export function useRegister() {
  return useCallback(async (name: string, email: string, password: string): Promise<AppUser> => {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    })
    const data = await res.json()
    if (!res.ok) throw new ApiError(res.status, data)
    if (data.access) setAccessToken(data.access)
    await mutate('/api/auth/me', data.user, false)
    return data.user
  }, [])
}

export function useLogout() {
  return useCallback(async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    setAccessToken(null)
    await mutate('/api/auth/me', null, false)
  }, [])
}
