'use client'

import { useState } from 'react'
import { AnimatePresence, MotionConfig, motion } from 'motion/react'
import { Navbar, type NavView } from '@/components/navbar'
import { AuthModal } from '@/components/auth-modal'
import { MarketingHome } from '@/components/marketing-home'
import { Dashboard } from '@/components/dashboard'
import BookingWizard from '@/components/booking-wizard'
import RoundTable from '@/components/round-table'
import PackageBooking from '@/components/package-booking'
import { TestsPage } from '@/components/tests-page'
import { AboutPage } from '@/components/about-page'
import { ContactPage } from '@/components/contact-page'
import { PillarDetailPage } from '@/components/pillar-detail-page'
import { PrivacyPage } from '@/components/privacy-page'
import { TermsPage } from '@/components/terms-page'
import { CookiesPage } from '@/components/cookies-page'
import { useEffect } from 'react'
import { useMe, useLogout } from '@/lib/hooks/useAuth'
import { bootstrapAccessToken } from '@/lib/api'
import { SWRConfig } from 'swr'
import { I18nProvider } from '@/lib/i18n'

function AppShell() {
  const [view, setView] = useState<NavView>('home')
  const [authMode, setAuthMode] = useState<'login' | 'register' | null>(null)
  const [selectedPillarId, setSelectedPillarId] = useState<string | null>(null)
  const { user: currentUser } = useMe()
  const logoutFn = useLogout()
  const isAuthed = !!currentUser

  useEffect(() => {
    if (currentUser) bootstrapAccessToken()
  }, [currentUser])

  const navigate = (v: NavView) => {
    if (v === 'panel' && !isAuthed) {
      setAuthMode('login')
      return
    }
    if (v === view) {
      // Already here (e.g. logo click on the home page): just glide to the top
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }
    // The old page fades out first; the scroll reset happens in onExitComplete
    // below so the visitor never sees the outgoing page jump to the top.
    setView(v)
  }

  const handleAuthSuccess = () => {
    setAuthMode(null)
    if (view === 'panel') return
    setView('panel')
  }

  // Each view (and each pillar) is its own page for transition purposes
  const pageKey = view === 'pillar-detail' ? `pillar-${selectedPillarId}` : view

  const handleLogout = async () => {
    await logoutFn()
    setView('home')
  }

  return (
    <div className="relative">
      <Navbar
        current={view}
        onNavigate={navigate}
        isAuthed={isAuthed}
        onAuth={(mode) => setAuthMode(mode)}
        onLogout={handleLogout}
      />

      {/* Opacity only: a transform here would break the fixed sticky bar inside pages */}
      <AnimatePresence
        mode="wait"
        initial={false}
        onExitComplete={() => window.scrollTo({ top: 0 })}
      >
      <motion.div
        key={pageKey}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
      >
      {view === 'home' && (
        <MarketingHome
          onBook={() => navigate('booking')}
          onQuiz={() => navigate('quiz')}
          onNavigate={(v) => navigate(v as NavView)}
          onPillarClick={(id) => { setSelectedPillarId(id); navigate('pillar-detail') }}
        />
      )}
      {view === 'panel' && <Dashboard onBook={() => navigate('booking')} />}
      {view === 'booking' && <BookingWizard />}
      {view === 'roundtable' && <RoundTable />}
      {view === 'packages' && <PackageBooking />}
      {view === 'quiz' && <TestsPage />}
      {view === 'pillar-detail' && selectedPillarId && (
        <PillarDetailPage
          pillarId={selectedPillarId}
          onBook={() => navigate('booking')}
          onBack={() => navigate('home')}
          onNavigate={(v) => navigate(v as NavView)}
        />
      )}
      {view === 'about' && <AboutPage onBook={() => navigate('booking')} onNavigate={(v) => navigate(v as NavView)} />}
      {view === 'contact' && <ContactPage onNavigate={(v) => navigate(v as NavView)} />}
      {view === 'privacy' && <PrivacyPage onNavigate={(v) => navigate(v as NavView)} />}
      {view === 'terms' && <TermsPage onNavigate={(v) => navigate(v as NavView)} />}
      {view === 'cookies' && <CookiesPage onNavigate={(v) => navigate(v as NavView)} />}
      </motion.div>
      </AnimatePresence>

      <AnimatePresence>
        {authMode && (
          <AuthModal
            key="auth"
            mode={authMode}
            onClose={() => setAuthMode(null)}
            onSuccess={handleAuthSuccess}
            onSwitch={(mode) => setAuthMode(mode)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

/**
 * The whole client app. `fallback` is the public content loaded on the
 * server (app/page.tsx), keyed like the SWR hooks, so the first paint already
 * has the hero, events, pillars and testimonials; SWR then refreshes them.
 */
export function AppRoot({ fallback = {} }: { fallback?: Record<string, unknown> }) {
  return (
    <I18nProvider>
      <SWRConfig value={{ revalidateOnFocus: false, fallback }}>
        {/* Honour the device's "reduce motion" setting across every animation */}
        <MotionConfig reducedMotion="user">
          <AppShell />
        </MotionConfig>
      </SWRConfig>
    </I18nProvider>
  )
}
