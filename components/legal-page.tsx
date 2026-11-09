'use client'

import { Eyebrow } from '@/components/ui-kit'
import { SiteFooter } from '@/components/site-footer'
import { useT } from '@/lib/i18n'

export interface LegalSection {
  title: string
  body?: string
  list?: { term: string; text: string }[]
}

/** Shared layout for the Privacy, Terms and Cookies pages. */
export function LegalPage({
  title,
  sections,
  onNavigate,
}: {
  title: string
  sections: LegalSection[]
  onNavigate?: (view: string) => void
}) {
  const t = useT()
  return (
    <div className="bg-background">
      <div className="mx-auto max-w-3xl px-6 pb-16 pt-24 sm:pb-24 sm:pt-32">
        <Eyebrow>{t('legal.eyebrow')}</Eyebrow>
        <h1 className="mt-4 font-heading text-3xl font-bold tracking-tight break-words sm:text-5xl">
          {title}
        </h1>
        <p className="mt-4 text-sm text-muted-foreground">{t('legal.updated')}</p>

        <div className="mt-10 space-y-8 text-sm leading-relaxed text-muted-foreground">
          {sections.map((section, i) => (
            <section key={section.title}>
              <h2 className="font-heading text-lg font-bold text-foreground">
                {i + 1}. {section.title}
              </h2>
              {section.body && <p className="mt-2">{section.body}</p>}
              {section.list && (
                <ul className="mt-2 list-inside list-disc space-y-1">
                  {section.list.map((item) => (
                    <li key={item.term}>
                      <strong>{item.term}</strong> {item.text}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </div>
      </div>
      <SiteFooter onNavigate={onNavigate} />
    </div>
  )
}

/** Shared ending for "contact us" sentences: uses the address set in the admin panel. */
export function contactSuffix(email: string | undefined, locale: 'ka' | 'en'): string {
  if (!email) return ''
  return locale === 'ka' ? ` მისამართზე: ${email}` : ` at ${email}`
}
