'use client'

import { useState, useRef, useEffect } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import {
  ChevronDown,
  Users,
  UserRound,
  LogOut,
  LayoutDashboard,
  Menu,
  X,
} from 'lucide-react'
import { UIButton } from '@/components/ui-kit'
import { LocaleSwitcher } from '@/components/locale-switcher'
import { useMe } from '@/lib/hooks/useAuth'
import { useT, fmt } from '@/lib/i18n'
import { cn } from '@/lib/utils'

export type NavView =
  | 'home'
  | 'panel'
  | 'booking'
  | 'roundtable'
  | 'packages'
  | 'quiz'
  | 'about'
  | 'contact'
  | 'privacy'
  | 'terms'
  | 'cookies'
  | 'pillar-detail'

export function Navbar({
  current,
  onNavigate,
  isAuthed,
  onAuth,
  onLogout,
}: {
  current: NavView
  onNavigate: (v: NavView) => void
  isAuthed: boolean
  onAuth: (mode: 'login' | 'register') => void
  onLogout: () => void
}) {
  const { user: currentUser } = useMe()
  const t = useT()
  const [sessionsOpen, setSessionsOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const sessionsRef = useRef<HTMLDivElement>(null)
  const profileRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (sessionsRef.current && !sessionsRef.current.contains(e.target as Node)) {
        setSessionsOpen(false)
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false)
      }
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  const linkClass = (active: boolean) =>
    cn(
      'whitespace-nowrap rounded-full px-4 py-2 text-xs font-medium uppercase tracking-[0.14em] transition-all duration-200',
      active
        ? 'bg-foreground text-background shadow-sm'
        : 'text-foreground/70 hover:bg-secondary hover:text-foreground hover:scale-[1.02]',
    )

  const go = (v: NavView) => {
    onNavigate(v)
    setMobileOpen(false)
  }

  return (
    <header className="fixed inset-x-0 top-4 z-50 px-4">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-2 rounded-full border border-border bg-card/85 py-2 pl-4 pr-2 sm:gap-4 sm:pl-5 shadow-lg shadow-foreground/5 backdrop-blur-md">
        <button
          onClick={() => go('home')}
          className="font-heading text-xl font-bold tracking-tight transition-all duration-200 hover:opacity-80 hover:scale-[1.02]"
        >
          TEONA<span className="text-primary">.</span>
        </button>

        <nav className="hidden items-center gap-1 lg:flex">
          <button className={linkClass(current === 'about')} onClick={() => onNavigate('about')}>
            {t('nav.about')}
          </button>

          {/* Sessions dropdown */}
          <div className="relative" ref={sessionsRef}>
            <button
              className={cn(
                linkClass(current === 'roundtable' || current === 'booking' || current === 'packages'),
                'inline-flex items-center gap-1',
              )}
              onClick={() => setSessionsOpen((o) => !o)}
              aria-expanded={sessionsOpen}
              aria-haspopup="true"
            >
              {t('nav.sessions')}
              <ChevronDown
                className={cn('size-3.5 transition-transform', sessionsOpen && 'rotate-180')}
              />
            </button>
            <AnimatePresence>
            {sessionsOpen && (
              <motion.div
                  initial={{ opacity: 0, y: -6, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.97 }}
                  transition={{ duration: 0.16, ease: 'easeOut' }}
                  className="absolute left-1/2 mt-2 w-60 origin-top -translate-x-1/2 overflow-hidden rounded-2xl border border-border bg-card p-1.5 shadow-xl"
              >
                <button
                  onClick={() => {
                    onNavigate('roundtable')
                    setSessionsOpen(false)
                  }}
                  className="flex w-full items-start gap-3 rounded-xl px-3 py-3 text-left transition-colors hover:bg-secondary"
                >
                  <Users className="mt-0.5 size-4 text-primary" />
                  <span>
                    <span className="block text-sm font-semibold">{t('nav.groups')}</span>
                    <span className="block text-xs text-muted-foreground">
                      {t('nav.groups.desc')}
                    </span>
                  </span>
                </button>
                <button
                  onClick={() => {
                    onNavigate('booking')
                    setSessionsOpen(false)
                  }}
                  className="flex w-full items-start gap-3 rounded-xl px-3 py-3 text-left transition-colors hover:bg-secondary"
                >
                  <UserRound className="mt-0.5 size-4 text-primary" />
                  <span>
                    <span className="block text-sm font-semibold">{t('nav.individual')}</span>
                    <span className="block text-xs text-muted-foreground">
                      {t('nav.individual.desc')}
                    </span>
                  </span>
                </button>
                <button
                  onClick={() => {
                    onNavigate('packages')
                    setSessionsOpen(false)
                  }}
                  className="flex w-full items-start gap-3 rounded-xl px-3 py-3 text-left transition-colors hover:bg-secondary"
                >
                  <LayoutDashboard className="mt-0.5 size-4 text-primary" />
                  <span>
                    <span className="block text-sm font-semibold">{t('nav.packages')}</span>
                    <span className="block text-xs text-muted-foreground">
                      {t('nav.packages.desc')}
                    </span>
                  </span>
                </button>
              </motion.div>
            )}
            </AnimatePresence>
          </div>

          <button className={linkClass(current === 'quiz')} onClick={() => onNavigate('quiz')}>
            {t('nav.tests')}
          </button>
          <button className={linkClass(current === 'contact')} onClick={() => onNavigate('contact')}>
            {t('nav.contact')}
          </button>
        </nav>

        {/* Auth / Profile */}
        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          <LocaleSwitcher />
          {!isAuthed ? (
            <>
              <UIButton
                variant="outline"
                size="sm"
                onClick={() => onAuth('login')}
                // Very narrow phones: the bar only has room for logo, language and menu;
                // Log in / Sign up are both in the mobile menu panel.
                className="hidden min-[360px]:inline-flex"
              >
                {t('nav.login')}
              </UIButton>
              <UIButton size="sm" onClick={() => onAuth('register')} className="hidden sm:inline-flex">
                {t('nav.signup')}
              </UIButton>
            </>
          ) : (
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setProfileOpen((o) => !o)}
                aria-haspopup="true"
                aria-expanded={profileOpen}
                className="flex size-10 items-center justify-center rounded-full bg-foreground text-sm font-semibold text-background transition-transform hover:scale-105"
              >
                {currentUser?.initials}
              </button>
              <AnimatePresence>
              {profileOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -6, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.97 }}
                  transition={{ duration: 0.16, ease: 'easeOut' }}
                  className="absolute right-0 mt-2 w-52 origin-top-right overflow-hidden rounded-2xl border border-border bg-card p-1.5 shadow-xl"
                >
                  <div className="px-3 py-2">
                    <p className="text-sm font-semibold">{currentUser?.name}</p>
                    <p className="text-xs text-muted-foreground capitalize">
                      {currentUser?.role === 'admin'
                        ? t('nav.role.admin')
                        : fmt(t('nav.tier'), { tier: currentUser?.tier ?? '' })}
                    </p>
                  </div>
                  <div className="my-1 h-px bg-border" />
                  <button
                    onClick={() => {
                      onNavigate('panel')
                      setProfileOpen(false)
                    }}
                    className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-colors hover:bg-secondary"
                  >
                    <LayoutDashboard className="size-4" />
                    {t('nav.dashboard')}
                  </button>
                  <button
                    onClick={() => {
                      onLogout()
                      setProfileOpen(false)
                    }}
                    className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
                  >
                    <LogOut className="size-4" />
                    {t('nav.logout')}
                  </button>
                </motion.div>
              )}
              </AnimatePresence>
            </div>
          )}

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileOpen((o) => !o)}
            aria-label={t('nav.menu')}
            aria-expanded={mobileOpen}
            className="flex size-10 items-center justify-center rounded-full border border-border text-foreground transition-colors hover:bg-secondary lg:hidden"
          >
            {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown panel */}
      <AnimatePresence>
      {mobileOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto mt-2 max-h-[calc(100dvh-6.5rem)] max-w-5xl overflow-y-auto rounded-3xl border border-border bg-card p-2 shadow-xl lg:hidden"
        >
          {[
            { label: t('nav.about'), view: 'about' as NavView },
            { label: t('nav.groups'), view: 'roundtable' as NavView },
            { label: t('nav.individual'), view: 'booking' as NavView },
            { label: t('nav.packages'), view: 'packages' as NavView },
            { label: t('nav.tests'), view: 'quiz' as NavView },
            { label: t('nav.contact'), view: 'contact' as NavView },
          ].map((item) => (
            <button
              key={item.label}
              onClick={() => go(item.view)}
              className={cn(
                'flex w-full items-center rounded-2xl px-4 py-3 text-left text-sm font-medium transition-colors',
                current === item.view
                  ? 'bg-foreground text-background'
                  : 'hover:bg-secondary',
              )}
            >
              {item.label}
            </button>
          ))}
          {!isAuthed && (
            <div className="mt-2 grid grid-cols-2 gap-2 border-t border-border p-2 pt-3 sm:hidden">
              <UIButton
                variant="outline"
                size="sm"
                className="w-full px-2"
                onClick={() => {
                  setMobileOpen(false)
                  onAuth('login')
                }}
              >
                {t('nav.login')}
              </UIButton>
              <UIButton
                size="sm"
                className="w-full px-2"
                onClick={() => {
                  setMobileOpen(false)
                  onAuth('register')
                }}
              >
                {t('nav.signup')}
              </UIButton>
            </div>
          )}
        </motion.div>
      )}
      </AnimatePresence>
    </header>
  )
}
