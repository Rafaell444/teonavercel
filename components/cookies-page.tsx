'use client'

import { LegalPage, contactSuffix, type LegalSection } from '@/components/legal-page'
import { useSiteSettings } from '@/lib/hooks/useContent'
import { useT, useLocale, type Locale } from '@/lib/i18n'

// `at` is the " at name@example.com" ending, built from the contact email set in the admin panel
const content: Record<Locale, (at: string) => LegalSection[]> = {
  en: (at) => [
    {
      title: 'What Are Cookies',
      body: 'Cookies are small text files stored on your device when you visit a website. They help us provide a better user experience by remembering your preferences and login status.',
    },
    {
      title: 'Cookies We Use',
      list: [
        { term: 'Essential cookies:', text: 'Required for authentication and security. These cannot be disabled.' },
        { term: 'Functional cookies:', text: 'Remember your preferences such as language and display settings.' },
        { term: 'Analytics cookies:', text: 'Help us understand how visitors use our platform to improve our services.' },
      ],
    },
    {
      title: 'Third-Party Cookies',
      body: 'We do not use any third-party advertising cookies. Analytics cookies are anonymized and used solely to improve our service.',
    },
    {
      title: 'Managing Cookies',
      body: 'You can control cookies through your browser settings. Note that disabling essential cookies may prevent you from logging in or using certain features.',
    },
    {
      title: 'Contact',
      body: `For questions about our cookie policy, please contact us${at}.`,
    },
  ],
  ka: (at) => [
    {
      title: 'რა არის ქუქი-ფაილები',
      body: 'ქუქი-ფაილები მცირე ტექსტური ფაილებია, რომლებიც ვებსაიტის მონახულებისას თქვენს მოწყობილობაზე ინახება. ისინი გვეხმარება უკეთესი გამოცდილების შეთავაზებაში — იმახსოვრებს თქვენს პარამეტრებსა და ავტორიზაციის სტატუსს.',
    },
    {
      title: 'რომელ ქუქი-ფაილებს ვიყენებთ',
      list: [
        { term: 'აუცილებელი ქუქი-ფაილები:', text: 'საჭიროა ავტორიზაციისა და უსაფრთხოებისთვის. მათი გამორთვა შეუძლებელია.' },
        { term: 'ფუნქციური ქუქი-ფაილები:', text: 'იმახსოვრებს თქვენს პარამეტრებს, მაგალითად ენასა და ეკრანის პარამეტრებს.' },
        { term: 'ანალიტიკური ქუქი-ფაილები:', text: 'გვეხმარება გავიგოთ, როგორ იყენებენ ვიზიტორები პლატფორმას, რათა გავაუმჯობესოთ მომსახურება.' },
      ],
    },
    {
      title: 'მესამე მხარის ქუქი-ფაილები',
      body: 'მესამე მხარის სარეკლამო ქუქი-ფაილებს არ ვიყენებთ. ანალიტიკური ქუქი-ფაილები ანონიმურია და მხოლოდ მომსახურების გასაუმჯობესებლად გამოიყენება.',
    },
    {
      title: 'ქუქი-ფაილების მართვა',
      body: 'ქუქი-ფაილების მართვა ბრაუზერის პარამეტრებიდან შეგიძლიათ. გაითვალისწინეთ, რომ აუცილებელი ქუქი-ფაილების გამორთვის შემთხვევაში შესაძლოა ვერ შეხვიდეთ ანგარიშზე ან ვერ ისარგებლოთ ზოგიერთი ფუნქციით.',
    },
    {
      title: 'კონტაქტი',
      body: `ქუქი-ფაილების პოლიტიკასთან დაკავშირებული კითხვებისთვის მოგვწერეთ${at}.`,
    },
  ],
}

export function CookiesPage({ onNavigate }: { onNavigate?: (view: string) => void } = {}) {
  const t = useT()
  const locale = useLocale()
  const { settings } = useSiteSettings()
  return (
    <LegalPage
      title={t('legal.cookies.title')}
      sections={content[locale](contactSuffix(settings?.contactEmail, locale))}
      onNavigate={onNavigate}
    />
  )
}
