'use client'

import { LegalPage, type LegalSection } from '@/components/legal-page'
import { useSiteSettings } from '@/lib/hooks/useContent'
import { useT, useLocale, type Locale } from '@/lib/i18n'

// `brand` is the brand name set in the admin panel
const content: Record<Locale, (brand: string) => LegalSection[]> = {
  en: (brand) => [
    {
      title: 'Acceptance of Terms',
      body: `By accessing or using ${brand}'s services, you agree to be bound by these Terms of Service. If you do not agree, please do not use our services.`,
    },
    {
      title: 'Services',
      body: `${brand} provides coaching and personal development services including individual sessions, group sessions, and digital resources. All services are subject to availability and scheduling.`,
    },
    {
      title: 'Account Responsibilities',
      body: 'You are responsible for maintaining the confidentiality of your account credentials. You agree to notify us immediately of any unauthorized access or use of your account.',
    },
    {
      title: 'Booking & Cancellation',
      body: 'Sessions must be cancelled at least 24 hours in advance for a full refund. Late cancellations or no-shows may forfeit the session. Rescheduling is available subject to slot availability.',
    },
    {
      title: 'Intellectual Property',
      body: `All content, materials, and branding on this platform are the property of ${brand} and may not be reproduced without prior written consent.`,
    },
    {
      title: 'Limitation of Liability',
      body: `Coaching services are not a substitute for professional medical or psychological treatment. ${brand} is not liable for any outcomes resulting from the application of coaching advice.`,
    },
    {
      title: 'Modifications',
      body: 'We reserve the right to modify these terms at any time. Continued use of our services after changes constitutes acceptance of the new terms.',
    },
  ],
  ka: (brand) => [
    {
      title: 'პირობებზე თანხმობა',
      body: `${brand}-ის მომსახურებით სარგებლობით თქვენ ეთანხმებით ამ მომსახურების პირობებს. თუ არ ეთანხმებით, გთხოვთ, ნუ ისარგებლებთ ჩვენი მომსახურებით.`,
    },
    {
      title: 'მომსახურება',
      body: `${brand} გთავაზობთ კოუჩინგისა და პიროვნული განვითარების მომსახურებას, მათ შორის ინდივიდუალურ სესიებს, ჯგუფურ სესიებსა და ციფრულ რესურსებს. ყველა მომსახურება დამოკიდებულია ხელმისაწვდომობასა და განრიგზე.`,
    },
    {
      title: 'ანგარიშთან დაკავშირებული პასუხისმგებლობა',
      body: 'თქვენ ხართ პასუხისმგებელი თქვენი ანგარიშის მონაცემების კონფიდენციალურობის დაცვაზე. თანახმა ხართ, დაუყოვნებლივ შეგვატყობინოთ თქვენს ანგარიშზე ნებისმიერი არაავტორიზებული წვდომის ან გამოყენების შესახებ.',
    },
    {
      title: 'ჯავშანი და გაუქმება',
      body: 'თანხის სრულად დასაბრუნებლად სესია უნდა გაუქმდეს მინიმუმ 24 საათით ადრე. დაგვიანებით გაუქმების ან გამოუცხადებლობის შემთხვევაში სესია შეიძლება ჩაითვალოს გამოყენებულად. სესიის გადატანა შესაძლებელია თავისუფალი დროის არსებობის შემთხვევაში.',
    },
    {
      title: 'ინტელექტუალური საკუთრება',
      body: `ამ პლატფორმაზე არსებული ყველა შინაარსი, მასალა და ბრენდინგი ${brand}-ის საკუთრებაა და მათი გამრავლება წინასწარი წერილობითი თანხმობის გარეშე დაუშვებელია.`,
    },
    {
      title: 'პასუხისმგებლობის შეზღუდვა',
      body: `კოუჩინგი არ ანაცვლებს პროფესიულ სამედიცინო ან ფსიქოლოგიურ მკურნალობას. ${brand} არ აგებს პასუხს კოუჩინგის რჩევების გამოყენებით მიღებულ შედეგებზე.`,
    },
    {
      title: 'ცვლილებები',
      body: 'ვიტოვებთ უფლებას, ნებისმიერ დროს შევცვალოთ ეს პირობები. ცვლილებების შემდეგ მომსახურებით სარგებლობის გაგრძელება ახალ პირობებზე თანხმობას ნიშნავს.',
    },
  ],
}

export function TermsPage({ onNavigate }: { onNavigate?: (view: string) => void } = {}) {
  const t = useT()
  const locale = useLocale()
  const { settings } = useSiteSettings()
  return (
    <LegalPage
      title={t('legal.terms.title')}
      sections={content[locale](settings?.brandName || 'Ascend')}
      onNavigate={onNavigate}
    />
  )
}
