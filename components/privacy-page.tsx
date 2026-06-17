'use client'

import { Eyebrow } from '@/components/ui-kit'
import { SiteFooter } from '@/components/site-footer'
import { useT } from '@/lib/i18n'

export function PrivacyPage({ onNavigate }: { onNavigate?: (view: string) => void } = {}) {
  const t = useT()
  return (
    <div className="bg-background pb-16 pt-24 sm:pb-24 sm:pt-32">
      <div className="mx-auto max-w-3xl px-6">
        <Eyebrow>{t('legal.eyebrow')}</Eyebrow>
        <h1 className="mt-4 font-heading text-4xl font-bold tracking-tight sm:text-5xl">{t('legal.privacy.title')}</h1>
        <p className="mt-4 text-sm text-muted-foreground">{t('legal.updated')}</p>

        <div className="mt-10 space-y-8 text-sm leading-relaxed text-muted-foreground">
          <section>
            <h2 className="font-heading text-lg font-bold text-foreground">1. Information We Collect</h2>
            <p className="mt-2">We collect information you provide directly when you create an account, book a session, or contact us. This includes your name, email address, phone number, and any notes or diary entries you create within the platform.</p>
          </section>

          <section>
            <h2 className="font-heading text-lg font-bold text-foreground">2. How We Use Your Information</h2>
            <p className="mt-2">We use your information to provide our coaching services, process bookings, send appointment reminders, and improve our platform. We never sell your personal data to third parties.</p>
          </section>

          <section>
            <h2 className="font-heading text-lg font-bold text-foreground">3. Data Security</h2>
            <p className="mt-2">We implement industry-standard security measures to protect your personal information. All data is encrypted in transit and at rest. Diary entries are private and only accessible by you.</p>
          </section>

          <section>
            <h2 className="font-heading text-lg font-bold text-foreground">4. Data Retention</h2>
            <p className="mt-2">We retain your personal data for as long as your account is active or as needed to provide services. You may request deletion of your data at any time by contacting us.</p>
          </section>

          <section>
            <h2 className="font-heading text-lg font-bold text-foreground">5. Your Rights</h2>
            <p className="mt-2">You have the right to access, correct, or delete your personal data. You may also request a copy of your data in a portable format. To exercise these rights, contact us at support@ascend.coach.</p>
          </section>

          <section>
            <h2 className="font-heading text-lg font-bold text-foreground">6. Contact Us</h2>
            <p className="mt-2">If you have questions about this Privacy Policy, please contact us at support@ascend.coach.</p>
          </section>
        </div>
      </div>
      <SiteFooter onNavigate={onNavigate} />
    </div>
  )
}
