'use client'

import { useState } from 'react'
import { motion } from 'motion/react'
import { X, ArrowRight } from 'lucide-react'
import { UIButton, UIInput } from '@/components/ui-kit'
import { useLogin, useRegister } from '@/lib/hooks/useAuth'
import { getErrorMessage } from '@/lib/api'

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" aria-hidden>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1Z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.26 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84Z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84C6.71 7.3 9.14 5.38 12 5.38Z"
      />
    </svg>
  )
}

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" aria-hidden>
      <path
        fill="#1877F2"
        d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07c0 6 4.39 10.97 10.13 11.87v-8.4H7.08v-3.47h3.05V9.41c0-3 1.79-4.67 4.53-4.67 1.31 0 2.68.24 2.68.24v2.95h-1.51c-1.49 0-1.95.93-1.95 1.88v2.26h3.32l-.53 3.47h-2.79v8.4C19.61 23.04 24 18.07 24 12.07Z"
      />
    </svg>
  )
}

export function AuthModal({
  mode,
  onClose,
  onSuccess,
  onSwitch,
}: {
  mode: 'login' | 'register'
  onClose: () => void
  onSuccess: () => void
  onSwitch: (mode: 'login' | 'register') => void
}) {
  const isRegister = mode === 'register'
  const loginFn = useLogin()
  const registerFn = useRegister()
  const [submitting, setSubmitting] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      if (isRegister) await registerFn(name, email, password)
      else await loginFn(email, password)
      onSuccess()
    } catch (err: unknown) {
      setError(getErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  const social = (_provider: string) => {
    // Social OAuth not implemented — placeholder
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-foreground/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-md rounded-3xl border border-border bg-card p-8 shadow-2xl"
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute right-5 top-5 flex size-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          <X className="size-5" />
        </button>

        <span className="font-heading text-2xl font-bold">
          Ascend<span className="text-primary">.</span>
        </span>
        <h2 className="mt-5 font-heading text-3xl font-bold tracking-tight text-balance">
          {isRegister ? 'Begin your ascent' : 'Welcome back'}
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {isRegister
            ? 'Create an account to track your growth and book sessions.'
            : 'Log in to access your dashboard and schedule.'}
        </p>

        {/* Social auth */}
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => social('google')}
            className="inline-flex h-12 items-center justify-center gap-2.5 rounded-xl border border-border bg-background text-sm font-medium transition-colors hover:bg-secondary"
          >
            <GoogleIcon />
            Google
          </button>
          <button
            type="button"
            onClick={() => social('facebook')}
            className="inline-flex h-12 items-center justify-center gap-2.5 rounded-xl border border-border bg-background text-sm font-medium transition-colors hover:bg-secondary"
          >
            <FacebookIcon />
            Facebook
          </button>
        </div>

        <div className="my-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-border" />
          <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
            or
          </span>
          <div className="h-px flex-1 bg-border" />
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {isRegister && (
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                Full name
              </label>
              <UIInput
                type="text"
                placeholder="Elena Voss"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          )}
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Email
            </label>
            <UIInput
              type="email"
              placeholder="you@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Password
            </label>
            <UIInput
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && (
            <p className="rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-600 dark:bg-red-950/30 dark:text-red-400">{error}</p>
          )}
          <UIButton type="submit" size="lg" className="mt-2 w-full" disabled={submitting}>
            {submitting ? 'Please wait…' : isRegister ? 'Create account' : 'Log in'}
            {!submitting && <ArrowRight className="size-4" />}
          </UIButton>
        </form>

        {!isRegister && (
          <p className="mt-4 text-center text-xs text-muted-foreground">
            Tip: log in as{' '}
            <span className="font-semibold text-foreground">admin@ascend.com</span> for
            the admin panel.
          </p>
        )}

        <p className="mt-6 text-center text-sm text-muted-foreground">
          {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button
            onClick={() => onSwitch(isRegister ? 'login' : 'register')}
            className="font-semibold text-primary hover:underline"
          >
            {isRegister ? 'Log in' : 'Sign up'}
          </button>
        </p>
      </motion.div>
    </div>
  )
}
