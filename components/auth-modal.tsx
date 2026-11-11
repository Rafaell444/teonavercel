'use client'

import { useEffect, useId, useState } from 'react'
import { motion } from 'motion/react'
import { X, ArrowRight } from 'lucide-react'
import { UIButton, UIInput } from '@/components/ui-kit'
import { useLogin, useRegister } from '@/lib/hooks/useAuth'
import { getErrorMessage } from '@/lib/api'
import { useT } from '@/lib/i18n'
import { useDialogFocus } from '@/lib/hooks/useDialogFocus'

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
  const t = useT()
  const fid = useId()
  const panelRef = useDialogFocus<HTMLDivElement>()
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

  // Esc closes the dialog
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby={`${fid}-title`}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="absolute inset-0 bg-foreground/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 16, scale: 0.97, transition: { duration: 0.2, ease: 'easeIn' } }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        ref={panelRef}
        tabIndex={-1}
        className="relative max-h-[calc(100dvh-2rem)] w-full max-w-md overflow-y-auto outline-none overscroll-contain rounded-3xl border border-border bg-card p-6 shadow-2xl sm:p-8"
      >
        <button
          onClick={onClose}
          aria-label={t('common.close')}
          className="absolute right-5 top-5 flex size-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          <X className="size-5" />
        </button>

        <span className="font-heading text-2xl font-bold">
          TEONA<span className="text-primary">.</span>
        </span>
        <h2 id={`${fid}-title`} className="mt-5 font-heading text-3xl font-bold tracking-tight text-balance">
          {isRegister ? t('auth.title.register') : t('auth.title.login')}
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {isRegister ? t('auth.subtitle.register') : t('auth.subtitle.login')}
        </p>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          {isRegister && (
            <div>
              <label htmlFor={`${fid}-0`} className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                {t('auth.name')}
              </label>
              <UIInput id={`${fid}-0`}
                type="text"
                name="name"
                autoComplete="name"
                placeholder={t('auth.name.placeholder')}
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          )}
          <div>
            <label htmlFor={`${fid}-1`} className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              {t('auth.email')}
            </label>
            <UIInput id={`${fid}-1`}
              type="email"
              name="email"
              autoComplete="email"
              placeholder="you@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor={`${fid}-2`} className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              {t('auth.password')}
            </label>
            <UIInput id={`${fid}-2`}
              type="password"
              name="password"
              autoComplete={isRegister ? 'new-password' : 'current-password'}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && (
            <p className="rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-600 dark:bg-red-950/30 dark:text-red-400">{error}</p>
          )}
          <UIButton type="submit" size="lg" className="mt-2 w-full whitespace-nowrap px-4" disabled={submitting}>
            {submitting ? t('auth.wait') : isRegister ? t('auth.create') : t('auth.login')}
            {!submitting && <ArrowRight className="size-4" />}
          </UIButton>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          {isRegister ? t('auth.have_account') : t('auth.no_account')}{' '}
          <button
            onClick={() => onSwitch(isRegister ? 'login' : 'register')}
            className="font-semibold text-primary-ink hover:underline"
          >
            {isRegister ? t('auth.login') : t('auth.register')}
          </button>
        </p>
      </motion.div>
    </div>
  )
}
