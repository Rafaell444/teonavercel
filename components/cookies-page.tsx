'use client'

import { Eyebrow } from '@/components/ui-kit'
import { SiteFooter } from '@/components/site-footer'
import { useT } from '@/lib/i18n'

export function CookiesPage({ onNavigate }: { onNavigate?: (view: string) => void } = {}) {
  const t = useT()
  return (
    <div className="bg-background pb-16 pt-24 sm:pb-24 sm:pt-32">
      <div className="mx-auto max-w-3xl px-6">
        <Eyebrow>{t('legal.eyebrow')}</Eyebrow>
        <h1 className="mt-4 font-heading text-4xl font-bold tracking-tight sm:text-5xl">{t('legal.cookies.title')}</h1>
        <p className="mt-4 text-sm text-muted-foreground">{t('legal.updated')}</p>

        <div className="mt-10 space-y-8 text-sm leading-relaxed text-muted-foreground">
          <section>
            <h2 className="font-heading text-lg font-bold text-foreground">1. What Are Cookies</h2>
            <p className="mt-2">Cookies are small text files stored on your device when you visit a website. They help us provide a better user experience by remembering your preferences and login status.</p>
          </section>

          <section>
            <h2 className="font-heading text-lg font-bold text-foreground">2. Cookies We Use</h2>
            <ul className="mt-2 list-inside list-disc space-y-1">
              <li><strong>Essential cookies:</strong> Required for authentication and security. These cannot be disabled.</li>
              <li><strong>Functional cookies:</strong> Remember your preferences such as language and display settings.</li>
              <li><strong>Analytics cookies:</strong> Help us understand how visitors use our platform to improve our services.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-heading text-lg font-bold text-foreground">3. Third-Party Cookies</h2>
            <p className="mt-2">We do not use any third-party advertising cookies. Analytics cookies are anonymized and used solely to improve our service.</p>
          </section>

          <section>
            <h2 className="font-heading text-lg font-bold text-foreground">4. Managing Cookies</h2>
            <p className="mt-2">You can control cookies through your browser settings. Note that disabling essential cookies may prevent you from logging in or using certain features.</p>
          </section>

          <section>
            <h2 className="font-heading text-lg font-bold text-foreground">5. Contact</h2>
            <p className="mt-2">For questions about our cookie policy, please contact support@ascend.coach.</p>
          </section>
        </div>
      </div>
      <SiteFooter onNavigate={onNavigate} />
    </div>
  )
}
