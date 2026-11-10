import { pbkdf2Sync, timingSafeEqual } from 'node:crypto'
import { cookies } from 'next/headers'

import { COLLECTIONS, now, plain } from './data'
import { auth, db, webApiKey } from './firebase'
import { HttpError, forbidden, unauthorized } from './http'

/**
 * Authentication = Firebase Authentication (email/password), driven from the
 * server so the frontend keeps its existing contract:
 *   POST /api/auth/login    -> { user, access }  + httpOnly cookies
 *   POST /api/auth/refresh  -> { access }
 *   GET  /api/auth/me       -> user
 * `access` is a Firebase ID token (1 hour); the refresh cookie holds the
 * Firebase refresh token. Profile data (role, tier, xp…) lives in users/{uid}.
 */

export const TIERS = ['Explorer', 'Achiever', 'Master', 'Luminary'] as const
export type Tier = (typeof TIERS)[number]
export type Role = 'admin' | 'member'

export interface UserProfile {
  id: string
  name: string
  email: string
  role: Role
  tier: Tier
  xp: number
  vouchers: number
  /** YYYY-MM-DD */
  joined: string
  is_active: boolean
  initials: string
}

interface StoredProfile {
  name: string
  email: string
  role: Role
  tier: Tier
  xp: number
  vouchers: number
  joined: string
  is_active: boolean
  created_at: unknown
  /** Django hash kept for users imported from the old backend; cleared on first login. */
  legacy_password_hash?: string
}

export const ACCESS_COOKIE = 'access_token'
export const REFRESH_COOKIE = 'refresh_token'
const ACCESS_MAX_AGE = 60 * 60
const REFRESH_MAX_AGE = 60 * 60 * 24 * 30

const initials = (name: string, email: string) => {
  const parts = (name.trim() || email).split(/\s+/).filter(Boolean)
  return parts.length >= 2 ? (parts[0][0] + parts[1][0]).toUpperCase() : (name || email).slice(0, 2).toUpperCase()
}

export function toProfile(id: string, data: StoredProfile): UserProfile {
  return {
    id,
    name: data.name,
    email: data.email,
    role: data.role ?? 'member',
    tier: data.tier ?? 'Explorer',
    xp: data.xp ?? 0,
    vouchers: data.vouchers ?? 0,
    joined: data.joined,
    is_active: data.is_active ?? true,
    initials: initials(data.name ?? '', data.email ?? ''),
  }
}

export function tierForXp(xp: number): Tier {
  if (xp >= 10_000) return 'Luminary'
  if (xp >= 5_000) return 'Master'
  if (xp >= 1_000) return 'Achiever'
  return 'Explorer'
}

const usersCol = () => db().collection(COLLECTIONS.users)

export async function getProfile(uid: string): Promise<UserProfile | null> {
  const snap = await usersCol().doc(uid).get()
  if (!snap.exists) return null
  return toProfile(snap.id, snap.data() as StoredProfile)
}

/* ───────────────────────────────────────────── Firebase Auth REST (Identity Toolkit) */

interface SignInResponse {
  idToken: string
  refreshToken: string
  localId: string
  expiresIn: string
}

/** Firebase Auth REST endpoints, or the local Auth emulator when it is running. */
function authHost(service: 'identitytoolkit' | 'securetoken') {
  const emulator = process.env.FIREBASE_AUTH_EMULATOR_HOST
  return emulator ? `http://${emulator}/${service}.googleapis.com` : `https://${service}.googleapis.com`
}

async function identityToolkit<T>(method: string, body: Record<string, unknown>): Promise<T> {
  const res = await fetch(`${authHost('identitytoolkit')}/v1/accounts:${method}?key=${webApiKey()}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const data = await res.json()
  if (!res.ok) throw new FirebaseAuthError(data?.error?.message ?? 'AUTH_ERROR')
  return data as T
}

class FirebaseAuthError extends Error {
  code: string
  constructor(code: string) {
    super(code)
    this.code = code
  }
}

async function signInWithPassword(email: string, password: string) {
  return identityToolkit<SignInResponse>('signInWithPassword', { email, password, returnSecureToken: true })
}

/** Django-format check for users imported from the old backend. */
function verifyLegacyPassword(password: string, stored: string): boolean {
  const [algorithm, iterations, salt, digest] = stored.split('$')
  if (algorithm !== 'pbkdf2_sha256' || !iterations || !salt || !digest) return false
  const expected = Buffer.from(digest, 'base64')
  const actual = pbkdf2Sync(password, salt, Number(iterations), expected.length, 'sha256')
  return expected.length === actual.length && timingSafeEqual(expected, actual)
}

export interface Session {
  user: UserProfile
  access: string
  refresh: string
}

export async function login(email: string, password: string): Promise<Session> {
  const normalized = email.trim().toLowerCase()
  let tokens: SignInResponse
  try {
    tokens = await signInWithPassword(normalized, password)
  } catch (err) {
    const code = err instanceof FirebaseAuthError ? err.code : ''
    if (code === 'USER_DISABLED') throw new HttpError(403, 'Account is disabled.')
    // Imported users have no Firebase password yet: check the old hash once,
    // then set this password in Firebase so next time it is a normal sign-in.
    const migrated = await migrateLegacyPassword(normalized, password)
    if (!migrated) throw new HttpError(401, 'Invalid credentials.')
    tokens = await signInWithPassword(normalized, password)
  }
  const profile = await getProfile(tokens.localId)
  if (!profile) throw new HttpError(401, 'Invalid credentials.')
  if (!profile.is_active) throw new HttpError(403, 'Account is disabled.')
  return { user: profile, access: tokens.idToken, refresh: tokens.refreshToken }
}

async function migrateLegacyPassword(email: string, password: string): Promise<boolean> {
  const snap = await usersCol().where('email', '==', email).limit(1).get()
  const doc = snap.docs[0]
  const legacy = doc?.get('legacy_password_hash') as string | undefined
  if (!doc || !legacy || !verifyLegacyPassword(password, legacy)) return false
  await auth().updateUser(doc.id, { password })
  await doc.ref.update({ legacy_password_hash: null })
  return true
}

export async function register(name: string, email: string, password: string): Promise<Session> {
  const normalized = email.trim().toLowerCase()
  let uid: string
  try {
    const record = await auth().createUser({ email: normalized, password, displayName: name.trim() })
    uid = record.uid
  } catch (err) {
    const code = (err as { code?: string }).code ?? ''
    if (code === 'auth/email-already-exists') throw new HttpError(400, { email: ['A user with this email already exists.'] })
    if (code === 'auth/invalid-password') throw new HttpError(400, { password: ['Password must be at least 6 characters.'] })
    if (code === 'auth/invalid-email') throw new HttpError(400, { email: ['Enter a valid email address.'] })
    throw err
  }
  const profile: StoredProfile = {
    name: name.trim(),
    email: normalized,
    role: 'member',
    tier: 'Explorer',
    xp: 0,
    vouchers: 0,
    joined: new Date().toISOString().slice(0, 10),
    is_active: true,
    created_at: now(),
  }
  await usersCol().doc(uid).set(profile)
  await auth().setCustomUserClaims(uid, { role: 'member' })
  const tokens = await signInWithPassword(normalized, password)
  return { user: toProfile(uid, profile), access: tokens.idToken, refresh: tokens.refreshToken }
}

export async function refreshSession(refreshToken: string): Promise<{ access: string; refresh: string } | null> {
  const res = await fetch(`${authHost('securetoken')}/v1/token?key=${webApiKey()}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'refresh_token', refresh_token: refreshToken }),
  })
  if (!res.ok) return null
  const data = (await res.json()) as { id_token: string; refresh_token: string }
  return { access: data.id_token, refresh: data.refresh_token }
}

export async function revokeAllSessions(uid: string) {
  await auth().revokeRefreshTokens(uid)
}

/* ─────────────────────────────────────────────────────────────── cookies */

const cookieBase = { httpOnly: true, sameSite: 'lax' as const, secure: process.env.NODE_ENV === 'production', path: '/' }

export async function setAuthCookies(tokens: { access: string; refresh: string }) {
  const jar = await cookies()
  jar.set(ACCESS_COOKIE, tokens.access, { ...cookieBase, maxAge: ACCESS_MAX_AGE })
  jar.set(REFRESH_COOKIE, tokens.refresh, { ...cookieBase, maxAge: REFRESH_MAX_AGE })
}

export async function clearAuthCookies() {
  const jar = await cookies()
  jar.delete(ACCESS_COOKIE)
  jar.delete(REFRESH_COOKIE)
}

/* ──────────────────────────────────────────────────────── current user */

/** Accepts "Authorization: Bearer <id token>" or the access_token cookie. */
export async function getCurrentUser(req: Request): Promise<UserProfile | null> {
  let token: string | undefined
  const header = req.headers.get('authorization')
  if (header?.startsWith('Bearer ')) token = header.slice(7).trim()
  if (!token) token = (await cookies()).get(ACCESS_COOKIE)?.value
  if (!token) return null
  try {
    const decoded = await auth().verifyIdToken(token)
    const profile = await getProfile(decoded.uid)
    return profile && profile.is_active ? profile : null
  } catch {
    return null
  }
}

export async function requireUser(req: Request): Promise<UserProfile> {
  const user = await getCurrentUser(req)
  if (!user) throw unauthorized()
  return user
}

export async function requireAdmin(req: Request): Promise<UserProfile> {
  const user = await requireUser(req)
  if (user.role !== 'admin') throw forbidden()
  return user
}

export const isAdmin = (user: UserProfile | null | undefined) => user?.role === 'admin'

/** Used by admin user management. Keeps Firebase custom claims in step with the role. */
export async function updateProfile(uid: string, patch: Partial<Pick<StoredProfile, 'name' | 'email' | 'role' | 'tier' | 'xp' | 'vouchers' | 'is_active'>>) {
  const ref = usersCol().doc(uid)
  const snap = await ref.get()
  if (!snap.exists) return null
  const current = snap.data() as StoredProfile
  const next: StoredProfile = { ...current, ...patch }
  if (patch.xp !== undefined && patch.tier === undefined) next.tier = tierForXp(next.xp)
  await ref.set(next, { merge: true })
  const authPatch: Record<string, unknown> = {}
  if (patch.email && patch.email !== current.email) authPatch.email = patch.email
  if (patch.name && patch.name !== current.name) authPatch.displayName = patch.name
  if (patch.is_active !== undefined) authPatch.disabled = !patch.is_active
  if (Object.keys(authPatch).length) await auth().updateUser(uid, authPatch)
  if (patch.role && patch.role !== current.role) await auth().setCustomUserClaims(uid, { role: patch.role })
  return toProfile(uid, plain<StoredProfile>(next))
}
