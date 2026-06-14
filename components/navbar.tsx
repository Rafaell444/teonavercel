'use client'

import { useState, useRef, useEffect } from 'react'
import {
  ChevronDown,
  Users,
  UserRound,
  LogOut,
  LayoutDashboard,
  Menu,
  X,
  LogIn,
} from 'lucide-react'
import { UIButton } from '@/components/ui-kit'
import { useMe } from '@/lib/hooks/useAuth'
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
      'rounded-full px-4 py-2 text-xs font-medium uppercase tracking-[0.14em] transition-all duration-200',
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
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 rounded-full border border-border bg-card/85 py-2 pl-5 pr-2 shadow-lg shadow-foreground/5 backdrop-blur-md">
        <button
          onClick={() => go('home')}
          className="font-heading text-xl font-bold tracking-tight transition-all duration-200 hover:opacity-80 hover:scale-[1.02]"
        >
          Ascend<span className="text-primary">.</span>
        </button>

        <nav className="hidden items-center gap-1 md:flex">
          <button className={linkClass(current === 'about')} onClick={() => onNavigate('about')}>
            About
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
              Sessions
              <ChevronDown
                className={cn('size-3.5 transition-transform', sessionsOpen && 'rotate-180')}
              />
            </button>
            {sessionsOpen && (
              <div className="absolute left-1/2 mt-2 w-60 -translate-x-1/2 overflow-hidden rounded-2xl border border-border bg-card p-1.5 shadow-xl">
                <button
                  onClick={() => {
                    onNavigate('roundtable')
                    setSessionsOpen(false)
                  }}
                  className="flex w-full items-start gap-3 rounded-xl px-3 py-3 text-left transition-colors hover:bg-secondary"
                >
                  <Users className="mt-0.5 size-4 text-primary" />
                  <span>
                    <span className="block text-sm font-semibold">Group Sessions</span>
                    <span className="block text-xs text-muted-foreground">
                      Round-table breakthrough circles
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
                    <span className="block text-sm font-semibold">Individual Sessions</span>
                    <span className="block text-xs text-muted-foreground">
                      Private 1:1 coaching &amp; therapy
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
                    <span className="block text-sm font-semibold">Packages</span>
                    <span className="block text-xs text-muted-foreground">
                      Complete transformation bundles
                    </span>
                  </span>
                </button>
              </div>
            )}
          </div>

          <button className={linkClass(current === 'quiz')} onClick={() => onNavigate('quiz')}>
            Vibe Check
          </button>
          <button className={linkClass(current === 'contact')} onClick={() => onNavigate('contact')}>
            Contact
          </button>
        </nav>

        {/* Auth / Profile */}
        <div className="flex flex-shrink-0 items-center gap-2">
          {!isAuthed ? (
            <>
              {/* Icon-only login on xs screens */}
              <button
                onClick={() => onAuth('login')}
                aria-label="Log in"
                className="flex size-10 items-center justify-center rounded-full border border-border text-foreground transition-colors hover:bg-secondary sm:hidden"
              >
                <LogIn className="size-4" />
              </button>
              <UIButton
                variant="outline"
                size="sm"
                onClick={() => onAuth('login')}
                className="hidden sm:inline-flex"
              >
                Log In
              </UIButton>
              <UIButton size="sm" onClick={() => onAuth('register')} className="hidden sm:inline-flex">
                Sign Up
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
              {profileOpen && (
                <div className="absolute right-0 mt-2 w-52 overflow-hidden rounded-2xl border border-border bg-card p-1.5 shadow-xl">
                  <div className="px-3 py-2">
                    <p className="text-sm font-semibold">{currentUser?.name}</p>
                    <p className="text-xs text-muted-foreground capitalize">
                      {currentUser?.role === 'admin' ? 'Administrator' : `${currentUser?.tier} tier`}
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
                    Dashboard
                  </button>
                  <button
                    onClick={() => {
                      onLogout()
                      setProfileOpen(false)
                    }}
                    className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
                  >
                    <LogOut className="size-4" />
                    Log Out
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileOpen((o) => !o)}
            aria-label="Menu"
            aria-expanded={mobileOpen}
            className="flex size-10 items-center justify-center rounded-full border border-border text-foreground transition-colors hover:bg-secondary md:hidden"
          >
            {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown panel */}
      {mobileOpen && (
        <div className="mx-auto mt-2 max-w-5xl overflow-hidden rounded-3xl border border-border bg-card p-2 shadow-xl md:hidden">
          {[
            { label: 'About', view: 'about' as NavView },
            { label: 'Group Sessions', view: 'roundtable' as NavView },
            { label: 'Individual Sessions', view: 'booking' as NavView },
            { label: 'Packages', view: 'packages' as NavView },
            { label: 'Vibe Check', view: 'quiz' as NavView },
            { label: 'Contact', view: 'contact' as NavView },
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
        </div>
      )}
    </header>
  )
}
