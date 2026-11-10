const API_URL = ''

let _accessToken: string | null = null
let _refreshPromise: Promise<string | null> | null = null
let _refreshBlocked = false

export function setAccessToken(token: string | null) {
  _accessToken = token
  _refreshBlocked = !token
}

export function getAccessToken(): string | null {
  return _accessToken
}

export class ApiError extends Error {
  status: number
  data: unknown
  constructor(status: number, data: unknown) {
    super(`API error ${status}`)
    this.status = status
    this.data = data
  }
}

/**
 * Extract a human-readable error message from an ApiError or unknown catch value.
 * Handles DRF formats: { detail: "..." }, { field: ["error", ...] }, { non_field_errors: [...] }
 */
export function getErrorMessage(err: unknown): string {
  if (err instanceof ApiError) {
    const d = err.data as Record<string, unknown> | undefined
    if (!d) return 'Something went wrong. Please try again.'
    if (typeof d.detail === 'string') return d.detail
    if (Array.isArray(d.non_field_errors)) return d.non_field_errors.join(' ')
    const fieldErrors: string[] = []
    for (const [key, val] of Object.entries(d)) {
      if (Array.isArray(val)) {
        const label = key.replace(/_/g, ' ')
        fieldErrors.push(`${label}: ${val.join(' ')}`)
      } else if (typeof val === 'string') {
        fieldErrors.push(val)
      }
    }
    if (fieldErrors.length) return fieldErrors.join(' ')
    return `Error ${err.status}. Please try again.`
  }
  if (err instanceof Error) return err.message
  return 'Something went wrong. Please try again.'
}

async function refreshAccessToken(): Promise<string | null> {
  if (_refreshBlocked) return null
  if (_refreshPromise) return _refreshPromise

  _refreshPromise = (async () => {
    try {
      const res = await fetch('/api/auth/refresh', { method: 'POST' })
      if (!res.ok) {
        _accessToken = null
        _refreshBlocked = true
        return null
      }
      const data = await res.json()
      _accessToken = data.access ?? null
      return _accessToken
    } catch {
      _accessToken = null
      _refreshBlocked = true
      return null
    } finally {
      _refreshPromise = null
    }
  })()

  return _refreshPromise
}

/** Call once on app load to hydrate the in-memory token from httpOnly cookies. */
export async function bootstrapAccessToken(): Promise<string | null> {
  if (_accessToken) return _accessToken
  return refreshAccessToken()
}

export async function apiFetch<T = unknown>(
  rawPath: string,
  options: RequestInit & { skipAuth?: boolean } = {},
): Promise<T> {
  const { skipAuth, ...fetchOpts } = options
  // The hooks still use the old backend's trailing-slash paths ('/api/sessions/');
  // the Next.js API routes are the same paths without the slash.
  const path = rawPath.replace(/\/+(\?|$)/, '$1')

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(fetchOpts.headers as Record<string, string>),
  }

  const hadAuth = !skipAuth && !!_accessToken
  if (hadAuth) {
    headers['Authorization'] = `Bearer ${_accessToken}`
  }

  if (fetchOpts.body instanceof FormData) {
    delete headers['Content-Type']
  }

  let res = await fetch(`${API_URL}${path}`, { ...fetchOpts, headers })

  if (res.status === 401 && !skipAuth) {
    const newToken = await refreshAccessToken()
    if (newToken) {
      headers['Authorization'] = `Bearer ${newToken}`
      res = await fetch(`${API_URL}${path}`, { ...fetchOpts, headers })
    } else if (hadAuth) {
      // Stale bearer can 401 even on public endpoints — retry without auth once.
      const { Authorization: _removed, ...headersWithoutAuth } = headers
      res = await fetch(`${API_URL}${path}`, { ...fetchOpts, headers: headersWithoutAuth })
    }
  }

  if (!res.ok) {
    let errorData: unknown
    try {
      errorData = await res.json()
    } catch {
      errorData = { detail: res.statusText }
    }
    throw new ApiError(res.status, errorData)
  }

  if (res.status === 204) return undefined as T
  return res.json() as Promise<T>
}
