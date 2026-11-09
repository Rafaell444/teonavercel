'use client'

import { useI18n, useT, type Locale } from '@/lib/i18n'
import { cn } from '@/lib/utils'

export function LocaleSwitcher({ className }: { className?: string }) {
  const { locale, setLocale } = useI18n()
  const t = useT()

  const options: { value: Locale; label: string; name: string }[] = [
    { value: 'ka', label: 'KA', name: 'ქართული' },
    { value: 'en', label: 'EN', name: 'English' },
  ]

  return (
    <div role="group" aria-label={t('common.language')} className={cn('flex items-center rounded-full border border-border p-0.5 text-xs font-medium', className)}>
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => setLocale(opt.value)}
          aria-pressed={locale === opt.value}
          aria-label={opt.name}
          lang={opt.value}
          className={cn(
            'rounded-full px-2.5 py-1 transition-all',
            locale === opt.value
              ? 'bg-foreground text-background'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}
