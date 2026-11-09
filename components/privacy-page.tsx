'use client'

import { LegalPage, contactSuffix, type LegalSection } from '@/components/legal-page'
import { useSiteSettings } from '@/lib/hooks/useContent'
import { useT, useLocale, type Locale } from '@/lib/i18n'

// `at` is the " at name@example.com" ending, built from the contact email set in the admin panel
const content: Record<Locale, (at: string) => LegalSection[]> = {
  en: (at) => [
    {
      title: 'Information We Collect',
      body: 'We collect information you provide directly when you create an account, book a session, or contact us. This includes your name, email address, phone number, and any notes or diary entries you create within the platform.',
    },
    {
      title: 'How We Use Your Information',
      body: 'We use your information to provide our coaching services, process bookings, send appointment reminders, and improve our platform. We never sell your personal data to third parties.',
    },
    {
      title: 'Data Security',
      body: 'We implement industry-standard security measures to protect your personal information. All data is encrypted in transit and at rest. Diary entries are private and only accessible by you.',
    },
    {
      title: 'Data Retention',
      body: 'We retain your personal data for as long as your account is active or as needed to provide services. You may request deletion of your data at any time by contacting us.',
    },
    {
      title: 'Your Rights',
      body: `You have the right to access, correct, or delete your personal data. You may also request a copy of your data in a portable format. To exercise these rights, contact us${at}.`,
    },
    {
      title: 'Contact Us',
      body: `If you have questions about this Privacy Policy, please contact us${at}.`,
    },
  ],
  ka: (at) => [
    {
      title: 'ინფორმაცია, რომელსაც ვაგროვებთ',
      body: 'ვაგროვებთ ინფორმაციას, რომელსაც უშუალოდ გვაწვდით ანგარიშის შექმნისას, სესიის დაჯავშნისას ან ჩვენთან დაკავშირებისას. ეს მოიცავს თქვენს სახელს, ელფოსტის მისამართს, ტელეფონის ნომერს და პლატფორმაზე შექმნილ ნებისმიერ ჩანაწერს, მათ შორის დღიურის ჩანაწერებს.',
    },
    {
      title: 'როგორ ვიყენებთ თქვენს ინფორმაციას',
      body: 'თქვენს ინფორმაციას ვიყენებთ კოუჩინგის მომსახურების გასაწევად, ჯავშნების დასამუშავებლად, შეხვედრების შეხსენებების გასაგზავნად და პლატფორმის გასაუმჯობესებლად. თქვენს პერსონალურ მონაცემებს მესამე პირებს არასდროს მივყიდით.',
    },
    {
      title: 'მონაცემთა უსაფრთხოება',
      body: 'თქვენი პერსონალური ინფორმაციის დასაცავად ვიყენებთ ინდუსტრიაში მიღებულ უსაფრთხოების ზომებს. მონაცემები დაშიფრულია როგორც გადაცემისას, ისე შენახვისას. დღიურის ჩანაწერები პირადია და მხოლოდ თქვენთვისაა ხელმისაწვდომი.',
    },
    {
      title: 'მონაცემთა შენახვა',
      body: 'თქვენს პერსონალურ მონაცემებს ვინახავთ მანამ, სანამ თქვენი ანგარიში აქტიურია, ან რამდენადაც ეს საჭიროა მომსახურების გასაწევად. მონაცემების წაშლა ნებისმიერ დროს შეგიძლიათ მოითხოვოთ ჩვენთან დაკავშირებით.',
    },
    {
      title: 'თქვენი უფლებები',
      body: `გაქვთ უფლება, მიიღოთ წვდომა თქვენს პერსონალურ მონაცემებზე, შეასწოროთ ან წაშალოთ ისინი. ასევე შეგიძლიათ მოითხოვოთ თქვენი მონაცემების ასლი გადატანად ფორმატში. ამ უფლებებით სარგებლობისთვის მოგვწერეთ${at}.`,
    },
    {
      title: 'დაგვიკავშირდით',
      body: `თუ ამ კონფიდენციალურობის პოლიტიკასთან დაკავშირებით კითხვები გაქვთ, მოგვწერეთ${at}.`,
    },
  ],
}

export function PrivacyPage({ onNavigate }: { onNavigate?: (view: string) => void } = {}) {
  const t = useT()
  const locale = useLocale()
  const { settings } = useSiteSettings()
  return (
    <LegalPage
      title={t('legal.privacy.title')}
      sections={content[locale](contactSuffix(settings?.contactEmail, locale))}
      onNavigate={onNavigate}
    />
  )
}
