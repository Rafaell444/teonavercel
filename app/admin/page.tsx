'use client'

import { useState, useEffect } from 'react'
import { Shield, Eye, EyeOff, ArrowLeft, Lock } from 'lucide-react'
import { AdminPanel } from '@/components/admin-panel'
import { useLogin, useLogout, useMe } from '@/lib/hooks/useAuth'
import { bootstrapAccessToken } from '@/lib/api'
import Link from 'next/link'
import { SWRConfig } from 'swr'

function AdminShell() {
  const loginFn = useLogin()
  const logoutFn = useLogout()
  const { user: currentUser, isLoading } = useMe()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')
  const [tokenReady, setTokenReady] = useState(false)

  const authed = currentUser?.role === 'admin'

  // Bootstrap access token from httpOnly cookie when user loads
  useEffect(() => {
    if (currentUser) {
      bootstrapAccessToken().then(() => setTokenReady(true))
    } else {
      setTokenReady(false)
    }
  }, [currentUser])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      const user = await loginFn(email.trim(), password)
      if (user.role !== 'admin') {
        await logoutFn()
        setError('Not an admin account.')
      } else {
        // Token is already set by useLogin, mark as ready
        setTokenReady(true)
      }
    } catch {
      setError('Invalid credentials. Access denied.')
    }
  }

  if (isLoading || (authed && !tokenReady)) {
    return <div className="flex min-h-screen items-center justify-center bg-background"><div className="size-8 animate-spin rounded-full border-2 border-border border-t-primary" /></div>
  }

  if (authed) {
    return (
      <div className="min-h-screen bg-background">
        {/* Slim admin bar */}
        <div className="sticky top-0 z-50 flex items-center justify-between border-b border-border bg-card/90 px-4 py-3 backdrop-blur-md sm:px-6">
          <div className="flex items-center gap-2.5">
            <div className="flex size-7 items-center justify-center rounded-lg bg-primary">
              <Shield className="size-3.5 text-primary-foreground" />
            </div>
            <span className="font-heading text-sm font-bold tracking-tight">
              Ascend<span className="text-primary">.</span> Admin
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary sm:inline-block">
              Administrator
            </span>
            <button
              onClick={() => logoutFn()}
              className="flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-destructive/50 hover:bg-destructive/10 hover:text-destructive"
            >
              <Lock className="size-3" />
              Lock
            </button>
          </div>
        </div>
        <AdminPanel />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      {/* Back to site */}
      <Link
        href="/"
        className="group absolute left-5 top-5 flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-3.5 transition-transform group-hover:-translate-x-0.5" />
        Back to site
      </Link>

      <div className="w-full max-w-sm">
        {/* Logo mark */}
        <div className="mb-8 flex flex-col items-center gap-3">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-foreground shadow-lg">
            <Shield className="size-6 text-background" />
          </div>
          <div className="text-center">
            <h1 className="font-heading text-2xl font-bold tracking-tight">
              Admin Access
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Restricted to authorised personnel only.
            </p>
          </div>
        </div>

        {/* Login form */}
        <form
          onSubmit={handleLogin}
          className="space-y-4 rounded-3xl border border-border bg-card p-7 shadow-xl shadow-foreground/5"
        >
          <div>
            <label
              htmlFor="admin-email"
              className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground"
            >
              Email
            </label>
            <input
              id="admin-email"
              type="email"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              required
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-base text-foreground sm:text-sm placeholder:text-muted-foreground/60 focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
            />
          </div>

          <div>
            <label
              htmlFor="admin-password"
              className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground"
            >
              Password
            </label>
            <div className="relative">
              <input
                id="admin-password"
                type={showPw ? 'text' : 'password'}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full rounded-xl border border-border bg-background py-3 pl-4 pr-11 text-base text-foreground sm:text-sm placeholder:text-muted-foreground/60 focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
              />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                aria-label={showPw ? 'Hide password' : 'Show password'}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
              >
                {showPw ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </div>

          {error && (
            <p role="alert" className="rounded-xl bg-destructive/10 px-4 py-2.5 text-center text-xs font-medium text-destructive">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="w-full rounded-xl bg-foreground py-3 text-sm font-semibold text-background transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-foreground/20 active:translate-y-0"
          >
            Enter Admin Panel
          </button>
        </form>

        <p className="mt-6 text-center text-[11px] text-muted-foreground/60">
          This area is monitored. Unauthorised access is prohibited.
        </p>
      </div>
    </div>
  )
}

export default function AdminPage() {
  return (
    <SWRConfig value={{ revalidateOnFocus: false }}>
      <AdminShell />
    </SWRConfig>
  )
}
