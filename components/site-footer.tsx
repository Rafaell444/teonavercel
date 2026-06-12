'use client'

import { ArrowRight } from 'lucide-react'
import { footerLinks } from '@/lib/mock-data'
import { useSiteSettings } from '@/lib/hooks/useContent'

export function SiteFooter() {
  const { settings } = useSiteSettings()
  return (
    <footer className="bg-foreground pt-20 pb-28 text-background">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid gap-12 lg:grid-cols-[2fr_1fr_1fr]">
          <div>
            <span className="font-heading text-3xl font-bold">
              {settings?.brandName}<span className="text-primary">.</span>
            </span>
            <p className="mt-4 max-w-sm text-background/60 leading-relaxed">
              {settings?.footerTagline}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-background/50">
              Explore
            </p>
            <ul className="mt-5 space-y-3">
              {footerLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="group inline-flex items-center gap-1 text-background/80 transition-all duration-200 hover:text-primary hover:gap-2"
                  >
                    {link.label}
                    <ArrowRight className="size-3 opacity-0 -translate-x-2 transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-0" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-background/50">
              Connect
            </p>
            <ul className="mt-5 space-y-3 text-background/80">
              <li>{settings?.contactEmail}</li>
              <li>{settings?.contactPhone}</li>
              <li>{settings?.contactLocation}</li>
            </ul>
          </div>
        </div>
        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-background/10 pt-8 text-sm text-background/50 sm:flex-row">
          <p>© 2026 {settings?.brandName} Coaching. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-background">
              Privacy
            </a>
            <a href="#" className="hover:text-background">
              Terms
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
