'use client'

import { ArrowRight } from 'lucide-react'
import { footerCompanyLinks, footerSessionLinks } from '@/lib/mock-data'
import { useSiteSettings } from '@/lib/hooks/useContent'
import { useT, useLocalized } from '@/lib/i18n'

interface SiteFooterProps {
  onNavigate?: (view: string) => void
}

export function SiteFooter({ onNavigate }: SiteFooterProps) {
  const t = useT()
  const l = useLocalized()
  const { settings } = useSiteSettings()

  const linkLabels: Record<string, string> = {
    about: t('footer.link.about'),
    contact: t('footer.link.contact'),
    quiz: t('footer.link.tests'),
    booking: t('footer.link.individual'),
    roundtable: t('footer.link.groups'),
    packages: t('footer.link.packages'),
  }

  const handleNav = (view: string) => {
    if (onNavigate) {
      onNavigate(view)
    } else {
      window.scrollTo({ top: 0 })
    }
  }

  return (
    <footer className="bg-foreground pt-20 pb-28 text-background">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid gap-10 sm:grid-cols-3 sm:gap-12 lg:grid-cols-[2fr_1fr_1fr_1fr]">
          <div className="sm:col-span-3 lg:col-span-1">
            <span className="font-heading text-3xl font-bold">
              {settings?.brandName}<span className="text-primary">.</span>
            </span>
            <p className="mt-4 max-w-sm text-background/60 leading-relaxed">
              {l(settings?.footerTagline, settings?.footerTaglineKa)}
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-background/50">
              {t('footer.company')}
            </p>
            <ul className="mt-5 space-y-3">
              {footerCompanyLinks.map((link) => (
                <li key={link.view}>
                  <button
                    onClick={() => handleNav(link.view)}
                    className="group inline-flex items-center gap-1 text-background/80 transition-all duration-200 hover:text-primary hover:gap-2"
                  >
                    {linkLabels[link.view] || link.label}
                    <ArrowRight className="size-3 opacity-0 -translate-x-2 transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-0" />
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-background/50">
              {t('footer.sessions')}
            </p>
            <ul className="mt-5 space-y-3">
              {footerSessionLinks.map((link) => (
                <li key={link.view}>
                  <button
                    onClick={() => handleNav(link.view)}
                    className="group inline-flex items-center gap-1 text-background/80 transition-all duration-200 hover:text-primary hover:gap-2"
                  >
                    {linkLabels[link.view] || link.label}
                    <ArrowRight className="size-3 opacity-0 -translate-x-2 transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-0" />
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-background/50">
              {t('footer.connect')}
            </p>
            <ul className="mt-5 space-y-3 break-words text-background/80">
              <li>{settings?.contactEmail}</li>
              <li>{settings?.contactPhone}</li>
              <li>{settings?.contactLocation}</li>
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-background/10 pt-8 text-sm text-background/50 lg:flex-row">
          <p className="text-center lg:text-left">
            © {new Date().getFullYear()} {settings?.brandName ?? 'Ascend'}. {t('footer.rights')}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            <button onClick={() => handleNav('privacy')} className="hover:text-background transition-colors">
              {t('footer.privacy')}
            </button>
            <button onClick={() => handleNav('terms')} className="hover:text-background transition-colors">
              {t('footer.terms')}
            </button>
            <button onClick={() => handleNav('cookies')} className="hover:text-background transition-colors">
              {t('footer.cookies')}
            </button>
            <a
              href="https://mozaikko.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-background/40 transition-colors hover:text-primary"
            >
              Developed by MOZAIKKO
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
