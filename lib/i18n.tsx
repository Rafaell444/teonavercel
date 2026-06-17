'use client'

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react'

export type Locale = 'ka' | 'en'

const translations: Record<string, Record<Locale, string>> = {
  // Navbar
  'nav.home': { ka: 'მთავარი', en: 'Home' },
  'nav.sessions': { ka: 'სესიები', en: 'Sessions' },
  'nav.groups': { ka: 'ჯგუფები', en: 'Groups' },
  'nav.packages': { ka: 'პაკეტები', en: 'Packages' },
  'nav.tests': { ka: 'ტესტები', en: 'Tests' },
  'nav.about': { ka: 'ჩვენს შესახებ', en: 'About' },
  'nav.contact': { ka: 'კონტაქტი', en: 'Contact' },
  'nav.dashboard': { ka: 'პანელი', en: 'Dashboard' },
  'nav.admin': { ka: 'ადმინი', en: 'Admin' },
  'nav.login': { ka: 'შესვლა', en: 'Log In' },
  'nav.signup': { ka: 'რეგისტრაცია', en: 'Sign Up' },
  'nav.logout': { ka: 'გასვლა', en: 'Log Out' },

  // Hero
  'hero.book': { ka: 'სესიის დაჯავშნა', en: 'Book a Session' },
  'hero.quiz': { ka: 'გაიარე ტესტი', en: 'Take the Vibe Check' },
  'hero.consultation': { ka: 'უფასო კონსულტაცია', en: 'Free Consultation' },
  'hero.suffix': { ka: 'ელის.', en: 'is waiting for.' },

  // Nav dropdown descriptions
  'nav.groups.desc': { ka: 'ჯგუფური კოუჩინგ სესიები', en: 'Round-table breakthrough circles' },
  'nav.individual.desc': { ka: 'პირადი 1:1 კოუჩინგი და თერაპია', en: 'Private 1:1 coaching & therapy' },
  'nav.packages.desc': { ka: 'სრული ტრანსფორმაციის პაკეტები', en: 'Complete transformation bundles' },

  // Pillars
  'pillars.eyebrow': { ka: 'პრაქტიკა', en: 'The Practice' },
  'pillars.title': { ka: 'აითვისე ცხოვრების ყველა სფერო', en: 'Master every area of your life' },
  'pillars.subtitle': { ka: 'ოთხი დისციპლინა, ერთი ინტეგრირებული გზა. აირჩიე საიდან დაიწყო — ჩვენ დანარჩენში დაგეხმარებით.', en: 'Four disciplines, one integrated path. Choose where you begin — we\'ll guide the rest.' },

  // Testimonials
  'testimonials.eyebrow': { ka: 'შედეგები', en: 'Results' },
  'testimonials.title': { ka: 'რას ამბობენ ჩვენი კლიენტები', en: 'Hear from those who\'ve walked the path' },

  // About section
  'about.eyebrow': { ka: 'მოტივაცია', en: 'The Hunger' },
  'about.title': { ka: 'ეს ჩემი პირადი გარდაქმნიდან ავაშენე.', en: 'I built this from the bottom of my own rock bottom.' },
  'about.p1': { ka: 'თხუთმეტი წლის წინ გადამწვარი, გაკოტრებული ვიყავი და დარწმუნებული — ცვლილება ჩემნაირებისთვის არ იყო. ერთმა გულწრფელმა საუბარმა ეს ისტორია გახსნა — და ყველაფერი შეიცვალა.', en: 'Fifteen years ago I was burned out, broke, and convinced change wasn\'t for people like me. One honest conversation cracked that story open — and everything shifted.' },
  'about.p2': { ka: '20,000-ზე მეტი საათი ვატარე ბიზნესის მფლობელებთან, ლიდერებთან და ადამიანებთან, ვინც უბრალოდ მეტისთვის მზად იყო. მისია მარტივია: დაგეხმარო გახდე ის ადამიანი, ვისაც შენი მომავალი ელის.', en: 'Since then I\'ve spent over 20,000 hours in the room with founders, leaders, and people simply ready for more. The mission is simple: help you become the person your future is waiting for.' },
  'about.stat.hours': { ka: 'საკოუჩინგ საათი', en: 'Coaching hours' },
  'about.stat.lives': { ka: 'შეცვლილი ცხოვრება', en: 'Lives changed' },
  'about.stat.return': { ka: 'დაბრუნდებოდა', en: 'Would return' },
  'about.cta': { ka: 'დაიწყე შენი ისტორია', en: 'Start your story' },

  // About page
  'aboutPage.eyebrow': { ka: 'ჩვენს შესახებ', en: 'About Ascend' },
  'aboutPage.title': { ka: 'ღრმა სამუშაო, რომელიც სიცოცხლის ბოლომდე გრძელდება.', en: 'Grounded work that lasts a lifetime.' },
  'aboutPage.subtitle': { ka: 'Ascend არის პრემიუმ კოუჩინგისა და თერაპიის პრაქტიკა ადამიანებისთვის, ვინც ნამდვილი მუშაობისთვის მზად არის — ჰაიპის გარეშე, მალსახმობების გარეშე, მხოლოდ ღრმა ტრანსფორმაცია.', en: 'Ascend is a premium coaching and therapy practice for people ready to do the real work — no hype, no shortcuts, just deep transformation.' },
  'aboutPage.values.depth': { ka: 'სიღრმე ჰაიპის ნაცვლად', en: 'Depth over hype' },
  'aboutPage.values.depthBody': { ka: 'ფესვამდე ვწვდებით, არა ზედაპირამდე. ნამდვილი ცვლილება, არა მოტივაციური შაქარი.', en: 'We go to the root, not the surface. Real change, not motivational sugar.' },
  'aboutPage.values.honesty': { ka: 'რადიკალური გულწრფელობა', en: 'Radical honesty' },
  'aboutPage.values.honestyBody': { ka: 'სიმართლეს იღებ, ზრუნვით მიწოდებულს. ზრდა კომფორტის ზონის მიღმა ცხოვრობს.', en: 'You get the truth, delivered with care. Growth lives outside comfort.' },
  'aboutPage.values.results': { ka: 'ხანგრძლივი შედეგები', en: 'Lasting results' },
  'aboutPage.values.resultsBody': { ka: 'სამუშაო ინტეგრაციისთვისაა შექმნილი — რომ შენარჩუნდეს ჩვენი დასრულების შემდეგაც.', en: 'The work is designed to integrate — so it holds long after we finish.' },
  'aboutPage.certs.eyebrow': { ka: 'სერტიფიკატები', en: 'Certifications' },
  'aboutPage.certs.title': { ka: 'სერტიფიცირებული და აკრედიტებული', en: 'Certified & accredited' },

  // Contact
  'contact.eyebrow': { ka: 'დაგვიკავშირდი', en: 'Get in touch' },
  'contact.title': { ka: 'დავიწყოთ საუბარი.', en: 'Let\'s start the conversation.' },
  'contact.subtitle': { ka: 'გაქვს შეკითხვა კოუჩინგზე, თერაპიაზე ან რომელი გზაა შენთვის? მოგვწერე — ჩვეულებრივ ერთ სამუშაო დღეში ვპასუხობთ.', en: 'Questions about coaching, therapy, or which path is right for you? Reach out — we usually reply within one business day.' },
  'contact.name': { ka: 'სახელი', en: 'Name' },
  'contact.email': { ka: 'ელფოსტა', en: 'Email' },
  'contact.subject': { ka: 'თემა', en: 'Subject' },
  'contact.message': { ka: 'შეტყობინება', en: 'Message' },
  'contact.send': { ka: 'გაგზავნა', en: 'Send message' },
  'contact.sending': { ka: 'იგზავნება…', en: 'Sending…' },
  'contact.sent.title': { ka: 'შეტყობინება გაგზავნილია', en: 'Message sent' },
  'contact.sent.body': { ka: 'მადლობა. მალე დაგიკავშირდებით.', en: 'Thanks for reaching out. We\'ll be in touch shortly.' },
  'contact.placeholder.name': { ka: 'თქვენი სახელი', en: 'Your name' },
  'contact.placeholder.email': { ka: 'you@email.com', en: 'you@email.com' },
  'contact.placeholder.subject': { ka: 'რით შეგვიძლია დაგეხმაროთ?', en: 'How can we help?' },
  'contact.placeholder.message': { ka: 'მოგვიყევით ცოტა იმაზე, რასაც ეძებთ…', en: 'Tell us a little about what you\'re looking for…' },

  // Booking wizard
  'booking.step.session': { ka: 'სესია', en: 'Session' },
  'booking.step.number': { ka: 'სესიების რაოდენობა', en: 'Number of Sessions' },
  'booking.step.datetime': { ka: 'თარიღი და დრო', en: 'Date & Time' },
  'booking.step.format': { ka: 'ფორმატი', en: 'Format' },
  'booking.step.voucher': { ka: 'ვაუჩერი', en: 'Voucher' },
  'booking.step.confirm': { ka: 'დადასტურება', en: 'Confirm' },
  'booking.continue': { ka: 'გაგრძელება', en: 'Continue' },
  'booking.back': { ka: 'უკან', en: 'Back' },
  'booking.confirm_pay': { ka: 'დადასტურება და გადახდა', en: 'Confirm & Pay' },
  'booking.booking': { ka: 'იჯავშნება...', en: 'Booking...' },
  'booking.online': { ka: 'ონლაინ', en: 'Online' },
  'booking.offline': { ka: 'ოფლაინ', en: 'Offline' },
  'booking.sessions_count': { ka: 'სესია', en: 'sessions' },
  'booking.choose_session': { ka: 'აირჩიე სესია', en: 'Choose your session' },
  'booking.how_many': { ka: 'რამდენი სესია გინდა?', en: 'How many sessions?' },
  'booking.pick_date': { ka: 'აირჩიე თარიღი და დრო', en: 'Pick your date & time' },
  'booking.choose_format': { ka: 'აირჩიე ფორმატი', en: 'Choose your format' },
  'booking.voucher_code': { ka: 'ვაუჩერის კოდი', en: 'Voucher code' },
  'booking.apply': { ka: 'გამოყენება', en: 'Apply' },
  'booking.confirm_title': { ka: 'დაადასტურე ჯავშანი', en: 'Confirm your booking' },
  'booking.language': { ka: 'სესიის ენა', en: 'Session Language' },
  'booking.lang.ka': { ka: 'ქართული', en: 'Georgian' },
  'booking.lang.en': { ka: 'ინგლისური', en: 'English' },

  // Group sessions
  'groups.eyebrow': { ka: 'ჯგუფური სესიები', en: 'Group Sessions' },
  'groups.no_sessions': { ka: 'ჯგუფური სესიები ამჟამად არ არის', en: 'No group sessions available' },
  'groups.no_sessions_sub': { ka: 'მალე შეამოწმეთ მომავალი ჯგუფური კოუჩინგ სესიები.', en: 'Check back soon for upcoming group coaching sessions.' },
  'groups.confirm_seat': { ka: 'დაადასტურე ადგილი', en: 'Confirm your seat' },
  'groups.confirm_pay': { ka: 'დადასტურება და გადახდა', en: 'Confirm & Pay' },
  'groups.processing': { ka: 'მუშავდება...', en: 'Processing...' },
  'groups.seat_confirmed': { ka: 'ადგილი დადასტურებულია', en: 'booking confirmed' },
  'groups.seats_remaining': { ka: 'ადგილი დარჩა', en: 'seats remaining' },
  'groups.click_seat': { ka: 'აირჩიეთ ცარიელი ადგილი, შემდეგ დაადასტურეთ.', en: 'Click an empty seat, then confirm and pay.' },
  'groups.payment_note': { ka: 'გადახდა მოკირებულია — თქვენი ადგილი დაუყოვნებლივ დასტურდება.', en: 'Payment is mocked — your seat is confirmed immediately.' },

  // Packages
  'packages.eyebrow': { ka: 'პაკეტები', en: 'Packages' },
  'packages.title': { ka: 'აირჩიე შენი პაკეტი', en: 'Choose your package' },
  'packages.months': { ka: 'თვე', en: 'months' },
  'packages.sessions_included': { ka: 'სესია შედის', en: 'sessions included' },

  // Consultation
  'consultation.title': { ka: 'უფასო კონსულტაცია', en: 'Free Consultation' },
  'consultation.subtitle': { ka: 'არ იცი საიდან დაიწყო? დაჯავშნე უფასო ზარი და დაგეხმარებით სწორი სესიის არჩევაში.', en: 'Not sure where to start? Book a free call and we\'ll help you find the right session.' },
  'consultation.booked_title': { ka: 'კონსულტაცია დაჯავშნილია!', en: 'Consultation Booked!' },
  'consultation.booked_body': { ka: 'თქვენი უფასო კონსულტაცია დადასტურებულია.', en: 'Your free consultation has been confirmed.' },
  'consultation.meet_link': { ka: 'Google Meet ლინკი:', en: 'Google Meet Link:' },
  'consultation.done': { ka: 'მზადაა', en: 'Done' },
  'consultation.pick_date': { ka: 'აირჩიე თარიღი', en: 'Pick a date' },
  'consultation.pick_time': { ka: 'აირჩიე დრო', en: 'Pick a time' },
  'consultation.confirm_btn': { ka: 'კონსულტაციის დადასტურება', en: 'Confirm Consultation' },
  'consultation.no_slots': { ka: 'კონსულტაციის სლოტები ამჟამად არ არის. მოგვიანებით შეამოწმეთ.', en: 'No consultation slots available at the moment. Please check back later.' },
  'consultation.cta_title': { ka: 'არ იცი რომელი სესიაა შენთვის?', en: 'Not sure which session is right for you?' },
  'consultation.cta_body': { ka: 'დაჯავშნე უფასო 15-წუთიანი კონსულტაცია. დაგეხმარებით საუკეთესო გზის არჩევაში — ვალდებულებების გარეშე.', en: 'Book a free 15-minute consultation. We\'ll help you choose the best path — no commitment, no pressure.' },
  'consultation.cta_btn': { ka: 'უფასო ზარის დაჯავშნა', en: 'Book Free Call' },

  // Pillar detail
  'pillar.detail.eyebrow': { ka: 'სესიის დეტალები', en: 'Session Detail' },
  'pillar.detail.about': { ka: 'ამ სესიის შესახებ', en: 'About this session' },
  'pillar.detail.history': { ka: 'ისტორია და ფონი', en: 'Background & History' },
  'pillar.detail.book': { ka: 'ამ სესიის დაჯავშნა', en: 'Book This Session' },
  'pillar.detail.back': { ka: 'სესიებში დაბრუნება', en: 'Back to sessions' },
  'pillar.detail.not_found': { ka: 'სესია ვერ მოიძებნა.', en: 'Session not found.' },

  // Sticky CTA
  'sticky.text': { ka: 'მზად ხარ დასაწყებად? პირველი სესია ყველაზე რთული ნაწილია.', en: 'Ready to begin? Your first session is the hardest part.' },

  // Footer
  'footer.company': { ka: 'კომპანია', en: 'Company' },
  'footer.sessions': { ka: 'სესიები', en: 'Sessions' },
  'footer.connect': { ka: 'კავშირი', en: 'Connect' },
  'footer.copyright': { ka: '© 2026 კოუჩინგი. ყველა უფლება დაცულია.', en: '© 2026 Coaching. All rights reserved.' },
  'footer.privacy': { ka: 'კონფიდენციალურობა', en: 'Privacy' },
  'footer.terms': { ka: 'პირობები', en: 'Terms' },
  'footer.cookies': { ka: 'ქუქი-ფაილები', en: 'Cookies' },
  'footer.link.about': { ka: 'ჩვენს შესახებ', en: 'About' },
  'footer.link.contact': { ka: 'კონტაქტი', en: 'Contact' },
  'footer.link.tests': { ka: 'ტესტები', en: 'Tests' },
  'footer.link.individual': { ka: '1:1 სესიები', en: '1:1 Sessions' },
  'footer.link.groups': { ka: 'ჯგუფური სესიები', en: 'Group Sessions' },
  'footer.link.packages': { ka: 'პაკეტები', en: 'Packages' },

  // Dashboard
  'dashboard.diary.eyebrow': { ka: 'ჩანაწერები', en: 'Reflections' },
  'dashboard.diary.title': { ka: 'შენი დღიური', en: 'Your diary' },
  'dashboard.diary.privacy': { ka: 'შენი დღიური სრულიად კონფიდენციალურია. მხოლოდ შენ ხედავ ამ ჩანაწერებს — არც ადმინი, არც სხვა ვინმე. აქ არაფერი შეიძლება გახდეს საჯარო ან გაზიარებული.', en: 'Your diary is completely private. Only you can see these entries — not the admin, not anyone else. Nothing here can be made public or shared.' },
  'dashboard.diary.privacy_bold': { ka: 'შენი დღიური სრულიად კონფიდენციალურია.', en: 'Your diary is completely private.' },
  'dashboard.diary.add': { ka: 'ჩანაწერის დამატება', en: 'Add entry' },
  'dashboard.diary.placeholder': { ka: 'რა შეამჩნიე დღეს?', en: 'What did you notice today?' },

  // Auth
  'auth.login': { ka: 'შესვლა', en: 'Log In' },
  'auth.register': { ka: 'რეგისტრაცია', en: 'Sign Up' },
  'auth.email': { ka: 'ელფოსტა', en: 'Email' },
  'auth.password': { ka: 'პაროლი', en: 'Password' },
  'auth.name': { ka: 'სახელი', en: 'Full Name' },

  // Legal
  'legal.privacy.title': { ka: 'კონფიდენციალურობის პოლიტიკა', en: 'Privacy Policy' },
  'legal.terms.title': { ka: 'მომსახურების პირობები', en: 'Terms of Service' },
  'legal.cookies.title': { ka: 'ქუქი-ფაილების პოლიტიკა', en: 'Cookie Policy' },
  'legal.eyebrow': { ka: 'სამართლებრივი', en: 'Legal' },
  'legal.updated': { ka: 'ბოლო განახლება: ივნისი 2026', en: 'Last updated: June 2026' },

  // Events
  'events.eyebrow': { ka: 'მოვლენები', en: 'Upcoming Events' },
  'events.title': { ka: 'არ გამოტოვო', en: "Don't miss out" },
  'events.register': { ka: 'რეგისტრაცია', en: 'Register' },
}

interface I18nContextType {
  locale: Locale
  setLocale: (l: Locale) => void
  t: (key: string) => string
}

const I18nContext = createContext<I18nContextType>({
  locale: 'ka',
  setLocale: () => {},
  t: (key) => key,
})

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>('ka')

  useEffect(() => {
    const saved = localStorage.getItem('locale') as Locale | null
    if (saved && (saved === 'ka' || saved === 'en')) {
      setLocale(saved)
    }
  }, [])

  const changeLocale = useCallback((l: Locale) => {
    setLocale(l)
    localStorage.setItem('locale', l)
  }, [])

  const t = useCallback((key: string): string => {
    return translations[key]?.[locale] ?? key
  }, [locale])

  return (
    <I18nContext.Provider value={{ locale, setLocale: changeLocale, t }}>
      {children}
    </I18nContext.Provider>
  )
}

export function useI18n() {
  return useContext(I18nContext)
}

export function useT() {
  const { t } = useContext(I18nContext)
  return t
}

export function useLocale(): Locale {
  const { locale } = useContext(I18nContext)
  return locale
}

/**
 * Resolves bilingual fields: returns _ka variant when locale is 'ka' (if available),
 * otherwise falls back to the default (English) field.
 */
export function useLocalized() {
  const { locale } = useContext(I18nContext)
  return useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (en: any, ka: any): any => {
      if (locale === 'ka' && ka != null) {
        if (Array.isArray(ka)) return ka.length > 0 ? ka : en
        if (typeof ka === 'string') return ka.length > 0 ? ka : en
        return ka
      }
      return en
    },
    [locale]
  )
}
