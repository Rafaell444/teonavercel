'use client'

import { useState } from 'react'
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
    setView(v)
    window.scrollTo({ top: 0 })
  }

  const handleAuthSuccess = () => {
    setAuthMode(null)
    setView('panel')
    window.scrollTo({ top: 0 })
  }

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

      {authMode && (
        <AuthModal
          mode={authMode}
          onClose={() => setAuthMode(null)}
          onSuccess={handleAuthSuccess}
          onSwitch={(mode) => setAuthMode(mode)}
        />
      )}
    </div>
  )
}

export default function Page() {
  return (
    <I18nProvider>
      <SWRConfig value={{ revalidateOnFocus: false }}>
        <AppShell />
      </SWRConfig>
    </I18nProvider>
  )
}
