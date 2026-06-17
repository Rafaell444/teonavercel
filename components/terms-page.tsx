'use client'

import { Eyebrow } from '@/components/ui-kit'
import { SiteFooter } from '@/components/site-footer'
import { useT } from '@/lib/i18n'

export function TermsPage({ onNavigate }: { onNavigate?: (view: string) => void } = {}) {
  const t = useT()
  return (
    <div className="bg-background pb-16 pt-24 sm:pb-24 sm:pt-32">
      <div className="mx-auto max-w-3xl px-6">
        <Eyebrow>{t('legal.eyebrow')}</Eyebrow>
        <h1 className="mt-4 font-heading text-4xl font-bold tracking-tight sm:text-5xl">{t('legal.terms.title')}</h1>
        <p className="mt-4 text-sm text-muted-foreground">{t('legal.updated')}</p>

        <div className="mt-10 space-y-8 text-sm leading-relaxed text-muted-foreground">
          <section>
            <h2 className="font-heading text-lg font-bold text-foreground">1. Acceptance of Terms</h2>
            <p className="mt-2">By accessing or using Ascend&apos;s services, you agree to be bound by these Terms of Service. If you do not agree, please do not use our services.</p>
          </section>

          <section>
            <h2 className="font-heading text-lg font-bold text-foreground">2. Services</h2>
            <p className="mt-2">Ascend provides coaching and personal development services including individual sessions, group sessions, and digital resources. All services are subject to availability and scheduling.</p>
          </section>

          <section>
            <h2 className="font-heading text-lg font-bold text-foreground">3. Account Responsibilities</h2>
            <p className="mt-2">You are responsible for maintaining the confidentiality of your account credentials. You agree to notify us immediately of any unauthorized access or use of your account.</p>
          </section>

          <section>
            <h2 className="font-heading text-lg font-bold text-foreground">4. Booking &amp; Cancellation</h2>
            <p className="mt-2">Sessions must be cancelled at least 24 hours in advance for a full refund. Late cancellations or no-shows may forfeit the session. Rescheduling is available subject to slot availability.</p>
          </section>

          <section>
            <h2 className="font-heading text-lg font-bold text-foreground">5. Intellectual Property</h2>
            <p className="mt-2">All content, materials, and branding on this platform are the property of Ascend and may not be reproduced without prior written consent.</p>
          </section>

          <section>
            <h2 className="font-heading text-lg font-bold text-foreground">6. Limitation of Liability</h2>
            <p className="mt-2">Coaching services are not a substitute for professional medical or psychological treatment. Ascend is not liable for any outcomes resulting from the application of coaching advice.</p>
          </section>

          <section>
            <h2 className="font-heading text-lg font-bold text-foreground">7. Modifications</h2>
            <p className="mt-2">We reserve the right to modify these terms at any time. Continued use of our services after changes constitutes acceptance of the new terms.</p>
          </section>
        </div>
      </div>
      <SiteFooter onNavigate={onNavigate} />
    </div>
  )
}
