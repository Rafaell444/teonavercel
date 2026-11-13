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

  // About section (home page and About page). Source: Teona's ICF Georgia profile, icf.ge/coach.php?id=86
  'about.eyebrow': { ka: 'გაიცანით თეონა', en: 'Meet Teona' },
  'about.title': { ka: 'თეონა ბებია — ლიდერობისა და გუნდების კოუჩი.', en: 'Teona Bebia, leadership and team coach.' },
  'about.p1': { ka: 'თეონას აქვს საჯარო სექტორში მუშაობის 20-წლიანი გამოცდილება, მათ შორის 14 წელზე მეტი — მენეჯერულ პოზიციაზე. 200-ზე მეტი საათის კოუჩინგური პრაქტიკით, ის ეხმარება ადამიანებსა და ლიდერებს საკუთარი პოტენციალის აღმოჩენაში, შინაგანი რესურსების გაცნობიერებასა და პირადი თუ პროფესიული გამოწვევების გადალახვაში.', en: 'Teona brings over 20 years of experience in the public sector, including more than 14 years in managerial positions. With over 200 hours of coaching practice, she supports individuals and leaders in discovering their potential, recognising their inner resources, and navigating personal and professional challenges.' },
  'about.p2': { ka: 'თეონას საქმიანობის მიზანია ძლიერი, მოტივირებული და მდგრადი ლიდერების ხელშეწყობა: დაეხმაროს ადამიანებს, გახდნენ უფრო გაცნობიერებული, თავდაჯერებული და ეფექტიანი ლიდერები და მოიტანონ პოზიტიური, მდგრადი ცვლილება საკუთარ პროფესიულ ცხოვრებასა და გუნდებში.', en: 'Through her work, Teona aims to empower individuals to become more self-aware, confident, and effective leaders, fostering positive and sustainable change in their professional lives and teams.' },
  'about.stat.hours': { ka: 'კოუჩინგის საათი', en: 'Coaching hours' },
  'about.stat.years': { ka: 'წელი საჯარო სექტორში', en: 'Years in the public sector' },
  'about.stat.management': { ka: 'წელი მენეჯერულ პოზიციაზე', en: 'Years in management' },
  'about.cta': { ka: 'დაჯავშნე სესია', en: 'Book a session' },

  // About page
  'aboutPage.eyebrow': { ka: 'თეონას შესახებ', en: 'About Teona' },
  'aboutPage.title': { ka: 'კოუჩინგი ძლიერი, მოტივირებული და მდგრადი ლიდერებისთვის.', en: 'Coaching for strong, motivated and resilient leaders.' },
  'aboutPage.subtitle': { ka: 'TEONA არის თეონა ბებიას კოუჩინგის პრაქტიკა. თეონა ICF-ის აკრედიტებული (ACC) ლიდერობის, მენეჯმენტისა და გუნდების კოუჩია და მუშაობს ქართულ და ინგლისურ ენებზე.', en: 'TEONA is the coaching practice of Teona Bebia, an ICF-accredited (ACC) leadership, management and team coach working in Georgian and English.' },
  'aboutPage.experience': { ka: 'თეონას პროფესიული გამოცდილება მოიცავს საგადასახადო დავების მართვას, მედიაციის პროცესებს, ორგანიზაციულ განვითარებასა და გუნდების ხელმძღვანელობას. სხვადასხვა პერიოდში მონაწილეობდა და ხელმძღვანელობდა მნიშვნელოვან სისტემურ და ინოვაციურ პროექტებს, მათ შორის საგადასახადო დავების ელექტრონული პლატფორმის, საჩივრების ელექტრონული სისტემისა და ერთიანი მეთოდოლოგიური ბაზის შექმნასა და განვითარებას.', en: 'Teona has extensive experience in tax dispute resolution, mediation, organisational development, and team leadership. Throughout her career she has led and delivered innovative, organisation-wide projects, including an electronic tax dispute platform, an online complaints system, and a unified knowledge and methodology base.' },
  'aboutPage.interests': { ka: 'განსაკუთრებულ ინტერესს იჩენს ახალი იდეების, ინოვაციური მიდგომებისა და განვითარების შესაძლებლობების მიმართ. პროფესიული საქმიანობის მიღმა უყვარს მოგზაურობა, ახალი კულტურების აღმოჩენა და განსხვავებული გამოცდილების მიღება.', en: 'She is passionate about exploring new ideas, embracing innovative approaches, and discovering opportunities for growth. Outside her professional life, she enjoys travelling, discovering new cultures, and experiencing different perspectives.' },
  'aboutPage.focus.eyebrow': { ka: 'ფოკუსი', en: 'Focus' },
  'aboutPage.focus.title': { ka: 'ძირითადი მიმართულებები', en: 'Key areas of focus' },
  'aboutPage.focus.leadership': { ka: 'ლიდერული კომპეტენციების განვითარება', en: 'Developing leadership competencies' },
  'aboutPage.focus.leadershipBody': { ka: 'ლიდერებს ეხმარება შინაგანი რესურსების გაცნობიერებაში, გამოწვევების გადალახვასა და თავდაჯერებულ, ეფექტიან ლიდერებად ზრდაში.', en: 'Helping leaders recognise their inner resources, overcome challenges and grow into confident, effective leaders.' },
  'aboutPage.focus.teams': { ka: 'გუნდური ურთიერთობებისა და თანამშრომლობის გაძლიერება', en: 'Strengthening team relationships and collaboration' },
  'aboutPage.focus.teamsBody': { ka: 'გუნდების კოუჩინგი, რომელიც ეფუძნება მაღალეფექტიანი გუნდების კოუჩინგის პროფესიულ მომზადებას და გუნდების ხელმძღვანელობის მრავალწლიან გამოცდილებას.', en: 'Team coaching built on High-Performance Team Coach training and many years of leading teams.' },
  'aboutPage.focus.public': { ka: 'მენეჯერებისა და საჯარო მოხელეების პროფესიული ზრდა', en: 'Supporting managers and public servants' },
  'aboutPage.focus.publicBody': { ka: 'საჯარო სექტორში 20-წლიან გამოცდილებაზე დაყრდნობით, ხელს უწყობს მენეჯერებისა და საჯარო მოხელეების პროფესიულ ზრდასა და განვითარებას.', en: 'Drawing on 20 years in the public sector to support managers and public servants in their professional growth and development.' },
  'aboutPage.cred.eyebrow': { ka: 'კვალიფიკაცია', en: 'Credentials' },
  'aboutPage.cred.title': { ka: 'განათლება და აკრედიტაცია', en: 'Training and accreditation' },
  'aboutPage.cred.acc': { ka: 'ICF-ის ასოცირებული სერტიფიცირებული კოუჩი (ACC)', en: 'ICF Associate Certified Coach (ACC)' },
  'aboutPage.cred.accBy': { ka: 'საერთაშორისო კოუჩინგის ფედერაცია (ICF)', en: 'International Coaching Federation' },
  'aboutPage.cred.actp': { ka: '„The Art & Science of Coaching“, ACTP (I და II დონე)', en: '“The Art & Science of Coaching”, ACTP (Levels 1 and 2)' },
  'aboutPage.cred.team': { ka: 'High-Performance Team Coach და Team Coach', en: 'High-Performance Team Coach and Team Coach' },
  'aboutPage.cred.nlp': { ka: 'NLP Master Practitioner & Coach', en: 'NLP Master Practitioner & Coach' },
  'aboutPage.cred.nlpBy': { ka: 'NLP School „The Art of Change“', en: 'NLP School “The Art of Change”' },
  'aboutPage.cred.gc': { ka: 'გენერაციული კოუჩინგის პრაქტიკოსი', en: 'Generative Coaching Practitioner' },
  'aboutPage.cred.gcBy': { ka: 'Generative Coaching', en: 'Generative Coaching' },
  'aboutPage.cred.languages': { ka: 'სამუშაო ენები', en: 'Working languages' },
  'aboutPage.cred.languagesValue': { ka: 'ქართული, ინგლისური', en: 'Georgian, English' },
  'aboutPage.cred.hours': { ka: 'კოუჩინგის პრაქტიკა', en: 'Coaching practice' },
  'aboutPage.cred.hoursValue': { ka: '200+ საათი', en: '200+ hours' },
  'aboutPage.cred.workplace': { ka: 'სამუშაო ადგილი', en: 'Workplace' },
  'aboutPage.cred.workplaceValue': { ka: 'შემოსავლების სამსახური', en: 'Revenue Service of Georgia' },
  'aboutPage.cred.specialisms': { ka: 'სპეციალიზაცია', en: 'Specialisms' },
  'aboutPage.cred.specialismsValue': { ka: 'ლიდერობის, მენეჯმენტისა და გუნდების კოუჩინგი', en: 'Leadership, management and team coaching' },
  'aboutPage.certs.eyebrow': { ka: 'სერტიფიკატები', en: 'Certificates' },
  'aboutPage.certs.title': { ka: 'სერტიფიკატები და დიპლომები', en: 'Certificates and diplomas' },

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
  'groups.seat_confirmed': { ka: 'დადასტურებულია', en: 'confirmed' },
  'groups.seats_remaining': { ka: 'ადგილი დარჩა', en: 'seats remaining' },
  'groups.click_seat': { ka: 'აირჩიეთ ცარიელი ადგილი, შემდეგ დაადასტურეთ.', en: 'Click an empty seat, then confirm and pay.' },
  'groups.payment_note': { ka: 'დადასტურებისთანავე ადგილი შენია.', en: 'Your seat is confirmed immediately.' },

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
  'dashboard.diary.privacy': { ka: 'მხოლოდ შენ ხედავ ამ ჩანაწერებს — არც ადმინი, არც სხვა ვინმე. აქ არაფერი შეიძლება გახდეს საჯარო ან გაზიარებული.', en: 'Only you can see these entries — not the admin, not anyone else. Nothing here can be made public or shared.' },
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

  // ── Added: shared ────────────────────────────────────────────────────────
  'common.close': { ka: 'დახურვა', en: 'Close' },
  'common.language': { ka: 'ენა', en: 'Language' },
  'booking.fewer': { ka: 'ნაკლები სესია', en: 'Fewer sessions' },
  'booking.more': { ka: 'მეტი სესია', en: 'More sessions' },
  'booking.step_of': { ka: 'ნაბიჯი {current} / {total}', en: 'Step {current} of {total}' },
  'dash.sections': { ka: 'პანელის სექციები', en: 'Dashboard sections' },
  'common.tbilisi': { ka: 'თბილისი', en: 'Tbilisi' },
  'format.in_person': { ka: 'პირისპირ', en: 'In-person' },

  // Navbar
  'nav.individual': { ka: 'ინდივიდუალური სესიები', en: '1:1 Sessions' },
  'nav.menu': { ka: 'მენიუ', en: 'Menu' },
  'nav.role.admin': { ka: 'ადმინისტრატორი', en: 'Administrator' },
  'nav.tier': { ka: 'დონე: {tier}', en: '{tier} tier' },

  // Home
  'hero.image_alt': { ka: 'კოუჩი სცენაზე, დრამატულ განათებაში', en: 'Coach on stage in dramatic light' },
  'about.image_alt': { ka: 'თეონა ბებიას პორტრეტი', en: 'Portrait of Teona Bebia' },
  'events.upcoming': { ka: 'მალე', en: 'Upcoming' },
  'events.heading': { ka: 'ცოცხალი სესიები და სემინარები', en: 'Live sessions & seminars' },
  'events.reserve': { ka: 'ადგილის დაჯავშნა', en: 'Reserve seat' },
  'events.prev': { ka: 'წინა ღონისძიებები', en: 'Previous events' },
  'events.next': { ka: 'შემდეგი ღონისძიებები', en: 'Next events' },
  'testimonials.label': { ka: 'ტრანსფორმაციები', en: 'Transformations' },
  'testimonials.prev': { ka: 'წინა შეფასება', en: 'Previous testimonial' },
  'testimonials.next': { ka: 'შემდეგი შეფასება', en: 'Next testimonial' },
  'testimonials.item': { ka: 'შეფასება {n}', en: 'Testimonial {n}' },
  'footer.rights': { ka: 'ყველა უფლება დაცულია.', en: 'All rights reserved.' },

  // Contact
  'contact.phone': { ka: 'ტელეფონი', en: 'Phone' },
  'contact.location': { ka: 'მდებარეობა', en: 'Location' },

  // Auth
  'auth.title.register': { ka: 'დაიწყე შენი გზა', en: 'Begin your ascent' },
  'auth.title.login': { ka: 'კეთილი იყოს შენი დაბრუნება', en: 'Welcome back' },
  'auth.subtitle.register': { ka: 'შექმენი ანგარიში, რომ თვალი ადევნო შენს ზრდას და დაჯავშნო სესიები.', en: 'Create an account to track your growth and book sessions.' },
  'auth.subtitle.login': { ka: 'შედი, რომ ნახო შენი პანელი და განრიგი.', en: 'Log in to access your dashboard and schedule.' },
  'auth.or': { ka: 'ან', en: 'or' },
  'auth.name.placeholder': { ka: 'სახელი და გვარი', en: 'Your full name' },
  'auth.wait': { ka: 'გთხოვ, მოიცადე…', en: 'Please wait…' },
  'auth.create': { ka: 'ანგარიშის შექმნა', en: 'Create account' },
  'auth.have_account': { ka: 'უკვე გაქვს ანგარიში?', en: 'Already have an account?' },
  'auth.no_account': { ka: 'არ გაქვს ანგარიში?', en: "Don't have an account?" },

  // Booking
  'booking.eyebrow': { ka: 'სესიის დაჯავშნა', en: 'Book a session' },
  'booking.title': { ka: 'დაიწყე შენი გზა', en: 'Start your journey' },
  'booking.per_session': { ka: '/სესია', en: '/session' },
  'booking.total': { ka: 'სულ', en: 'Total' },
  'booking.validity': { ka: 'მოქმედების ვადა', en: 'Validity period' },
  'booking.validity.complete': { ka: '{n} თვე ყველა სესიის გასავლელად', en: '{n} months to complete all sessions' },
  'booking.validity.note': { ka: 'ამ ვადის შემდეგ სესიები იწურება — გამოუყენებელი სესიების თანხა არ ბრუნდება.', en: 'Sessions expire after this period — no refunds for unused sessions.' },
  'booking.no_times': { ka: 'თავისუფალი დრო ჯერ არ არის. გთხოვ, მოგვიანებით შეამოწმე.', en: 'No available times yet. Please check back soon.' },
  'booking.no_slots_date': { ka: 'ამ თარიღზე თავისუფალი დრო არ არის.', en: 'No available slots for this date.' },
  'booking.online.desc': { ka: 'Google Meet-ის ბმულს დაჯავშნის შემდეგ მიიღებ', en: 'A Google Meet link will be generated' },
  'booking.offline.desc': { ka: 'შეხვედრა თბილისში, მისამართითა და მითითებებით', en: 'Tbilisi location with directions' },
  'booking.voucher.skip': { ka: 'თუ კოდი არ გაქვს, შეგიძლია ეს ნაბიჯი გამოტოვო.', en: "You can skip this step if you don't have a code." },
  'booking.voucher.applied': { ka: 'კოდი გააქტიურდა! ფასდაკლება: {value}', en: 'Code applied! {value} off' },
  'booking.first_date': { ka: 'პირველი სესიის თარიღი', en: 'First session date' },
  'booking.time': { ka: 'დრო', en: 'Time' },
  'booking.date': { ka: 'თარიღი', en: 'Date' },
  'booking.valid_for': { ka: 'მოქმედებს', en: 'Valid for' },
  'booking.months_n': { ka: '{n} თვე', en: '{n} months' },
  'booking.confirm.note': { ka: 'პირველი სესიის შემდეგ ყოველი მომდევნო სესიის თარიღსა და დროს თავად აირჩევ. მოქმედების ვადის გასვლის შემდეგ გამოუყენებელი სესიების თანხა არ ბრუნდება.', en: "After your first session, you'll choose date and time for each subsequent session. Unused sessions are not refunded after the validity period." },
  'booking.done.title': { ka: 'ჯავშანი მიღებულია!', en: "You're booked!" },
  'booking.done.body': { ka: 'ეს თარიღი და დრო შენი პირველი სესიისთვისაა. ყოველი სესიის შემდეგ შეძლებ მომდევნოს თარიღისა და დროის არჩევას.', en: "This date and time is for your first session. After each session, you'll be able to choose the date and time for your next one." },
  'booking.done.note': { ka: 'სესიებს მოქმედების ვადა აქვს — არ დაგავიწყდეს მათი დროულად დაგეგმვა!', en: 'Your sessions expire based on your package — make sure to schedule them in time!' },
  'booking.done.again': { ka: 'კიდევ ერთის დაჯავშნა', en: 'Book another' },
  'booking.login_required': { ka: 'ჯავშნის დასადასტურებლად გთხოვ, ჯერ შედი ანგარიშზე.', en: 'Please log in to confirm your booking.' },
  'booking.prev_month': { ka: 'წინა თვე', en: 'Previous month' },
  // Request-and-confirm flow (payments switched off)
  'booking.request': { ka: 'მოთხოვნის გაგზავნა', en: 'Send booking request' },
  'booking.requesting': { ka: 'იგზავნება…', en: 'Sending…' },
  'booking.request.note': { ka: 'ონლაინ გადახდა არ არის საჭირო. კოუჩი დაგიკავშირდება ჯავშნის დასადასტურებლად და გადახდის შესათანხმებლად.', en: 'No online payment is needed. The coach will contact you to confirm the booking and arrange payment.' },
  'booking.done.request_title': { ka: 'მოთხოვნა გაგზავნილია!', en: 'Request sent!' },
  'booking.done.request_body': { ka: 'შენი არჩეული დრო დაჯავშნილია. კოუჩი მალე დაგიკავშირდება ჯავშნის დასადასტურებლად და გადახდის დეტალების შესათანხმებლად.', en: 'Your chosen time is held for you. The coach will contact you shortly to confirm the booking and arrange payment.' },
  'groups.reserve': { ka: 'ადგილის დაჯავშნა', en: 'Reserve seat' },
  'groups.requested_title': { ka: 'ადგილი შენახულია!', en: 'Seat reserved!' },
  'groups.request_note': { ka: 'ადგილი შენთვისაა შენახული. კოუჩი დაადასტურებს ჯავშანს და შეგითანხმებს გადახდას.', en: 'The seat is held for you. The coach will confirm the booking and arrange payment with you.' },
  'groups.price': { ka: 'ფასი', en: 'Price' },
  'booking.next_month': { ka: 'შემდეგი თვე', en: 'Next month' },

  // Group sessions
  'groups.login_required': { ka: 'ადგილის დასაჯავშნად გთხოვ, შედი ანგარიშზე.', en: 'Please log in to reserve a seat.' },
  'groups.default_title': { ka: 'ჯგუფური სესია', en: 'Group session' },
  'groups.online_live': { ka: 'ონლაინ · პირდაპირი', en: 'Online · Live' },
  'groups.confirmed_title': { ka: 'ადგილი დადასტურებულია!', en: 'Seat confirmed!' },
  'groups.seat_n': { ka: 'ადგილი #{n}', en: 'Seat #{n}' },
  'groups.total_n': { ka: 'სულ: {amount}', en: 'Total: {amount}' },
  'groups.meet_open': { ka: 'Google Meet-ის ბმულის გახსნა', en: 'Open Google Meet link' },
  'groups.in_dashboard': { ka: 'ეს ჯავშანი შენს პანელშიც გამოჩნდება.', en: 'This booking also appears in your dashboard.' },
  'groups.no_schedule': { ka: 'ამ ჯგუფური სესიისთვის თარიღები ჯერ არ არის დანიშნული.', en: 'No scheduled dates for this group session yet.' },
  'groups.no_schedule_sub': { ka: 'გთხოვ, მოგვიანებით შეამოწმე.', en: 'Please check back soon.' },
  'groups.per_seat': { ka: '/ადგილი', en: '/seat' },
  'groups.maps': { ka: 'Google Maps-ში გახსნა', en: 'Open in Google Maps' },
  'groups.cancel': { ka: 'გაუქმება', en: 'Cancel' },
  'groups.pick_seat_n': { ka: 'ადგილი #{n}-ის არჩევა', en: 'Choose seat #{n}' },

  // Packages
  'packages.subtitle': { ka: 'რამდენიმე სესია ერთ პაკეტში — თანმიმდევრული გზა რეალური ცვლილებისკენ.', en: 'Several sessions in one bundle — a structured path to real change.' },
  'packages.empty': { ka: 'პაკეტები ამჟამად არ არის. გთხოვ, მოგვიანებით შეამოწმე.', en: 'No packages are available right now. Please check back soon.' },
  'packages.done.title': { ka: 'პაკეტი დაჯავშნილია!', en: 'Package booked!' },
  'packages.done.body': { ka: 'შენი პირველი სესია დაგეგმილია. ყოველი სესიის შემდეგ მომდევნოს თარიღს, დროსა და ფორმატს (პირისპირ ან ონლაინ) შენი პანელიდან აირჩევ.', en: "Your first session is scheduled. After each session, you'll choose the date, time, and format (live or online) for your next one from your dashboard." },
  'packages.done.duration': { ka: 'პაკეტის ხანგრძლივობა: {n} თვე', en: 'Package duration: {n} months' },
  'packages.back': { ka: 'პაკეტებზე დაბრუნება', en: 'Back to packages' },
  'packages.select': { ka: 'არჩევა', en: 'Select' },
  'packages.change': { ka: 'შეცვლა', en: 'Change' },
  'packages.first_session': { ka: 'აირჩიე შენი პირველი სესიის თარიღი და დრო. ყოველი სესიის შემდეგ მომდევნოს თარიღს შენი პანელიდან აირჩევ.', en: "Choose the date and time for your first session. After each session, you'll select the date for the next one from your dashboard." },
  'packages.start_with': { ka: 'დაიწყე აქედან', en: 'Start with' },
  'packages.package': { ka: 'პაკეტი', en: 'Package' },
  'packages.duration': { ka: 'ხანგრძლივობა', en: 'Duration' },

  // Tests
  'tests.eyebrow': { ka: 'თვითშეფასება', en: 'Self-assessment' },
  'tests.title': { ka: 'ტესტები და შეფასებები', en: 'Tests & assessments' },
  'tests.intro': { ka: 'აირჩიე ტესტი. თითოეული მათგანი რამდენიმე მოკლე კითხვაა, რომელიც დაგეხმარება გაიგო, სად ხარ ახლა და რომელი გზა გერგება ყველაზე მეტად.', en: 'Choose a test below. Each one is a short series of questions that helps map where you are and what path fits you best.' },
  'tests.questions_n': { ka: '{n} კითხვა', en: '{n} questions' },
  'tests.minutes_n': { ka: '~{n} წთ', en: '~{n} min' },
  'tests.start': { ka: 'ტესტის დაწყება', en: 'Start test' },
  'tests.empty': { ka: 'ტესტები ამჟამად არ არის. გთხოვ, მოგვიანებით შეამოწმე.', en: 'No tests are available right now. Check back soon.' },
  'tests.all': { ka: 'ყველა ტესტი', en: 'All tests' },
  'tests.results.title': { ka: 'შენი შედეგები მზადაა', en: 'Your results are in' },
  'tests.results.body': { ka: 'შენი პასუხების მიხედვით, აი პროგრამა, რომელიც ახლა ყველაზე მეტად გერგება.', en: 'Based on your answers, here is the programme that fits you best right now.' },
  'tests.results.recommended': { ka: 'შენთვის რეკომენდებული', en: 'Recommended for you' },
  'tests.results.thanks': { ka: 'მადლობა ტესტის გავლისთვის. ჩვენი გუნდი დაგიკავშირდება პერსონალური რეკომენდაციით.', en: 'Thank you for completing the test. Our team will be in touch with a personalised recommendation.' },
  'tests.your_answer': { ka: 'შენი პასუხი:', en: 'Your answer:' },
  'tests.more': { ka: 'სხვა ტესტების ნახვა', en: 'Explore more tests' },
  'tests.retake': { ka: 'თავიდან გავლა', en: 'Retake' },
  'tests.progress': { ka: 'კითხვა {current} / {total}', en: 'Question {current} of {total}' },
  'tests.next': { ka: 'შემდეგი', en: 'Next' },
  'tests.see_results': { ka: 'შედეგების ნახვა', en: 'See results' },

  // Statuses (bookings and individual sessions)
  'status.Confirmed': { ka: 'დადასტურებული', en: 'Confirmed' },
  'status.Pending': { ka: 'მოლოდინში', en: 'Pending' },
  'status.Cancelled': { ka: 'გაუქმებული', en: 'Cancelled' },
  'status.Expired': { ka: 'ვადაგასული', en: 'Expired' },
  'status.scheduled': { ka: 'დაგეგმილი', en: 'Scheduled' },
  'status.completed': { ka: 'დასრულებული', en: 'Completed' },
  'status.missed': { ka: 'გაცდენილი', en: 'Missed' },
  'status.cancelled': { ka: 'გაუქმებული', en: 'Cancelled' },

  // Dashboard
  'dash.tab.overview': { ka: 'მიმოხილვა', en: 'Overview' },
  'dash.tab.growth': { ka: 'ზრდა', en: 'Growth' },
  'dash.tab.schedule': { ka: 'ჩემი განრიგი', en: 'My Schedule' },
  'dash.tab.vault': { ka: 'პირადი საცავი', en: 'Private Vault' },
  'dash.tab.tests': { ka: 'ჩემი ტესტები', en: 'My Tests' },
  'dash.tab.diary': { ka: 'დღიური', en: 'Diary' },
  'dash.tab.book': { ka: 'სესიის დაჯავშნა', en: 'Book a Session' },
  'dash.tab.profile': { ka: 'პროფილი', en: 'Profile' },
  'dash.vault_card.title': { ka: 'გახსენი საცავი', en: 'Unlock the Vault' },
  'dash.vault_card.body': { ka: 'ექსკლუზიური ჩანაწერები და რესურსები Master დონისთვის.', en: 'Exclusive recordings & resources for Master tier.' },
  'dash.welcome': { ka: 'გამარჯობა, {name}', en: 'Welcome back, {name}' },
  'dash.open_menu': { ka: 'მენიუს გახსნა', en: 'Open menu' },
  'dash.close_menu': { ka: 'მენიუს დახურვა', en: 'Close menu' },
  'dash.growth.eyebrow': { ka: 'შენი ზრდა', en: 'Your Growth' },
  'dash.growth.to_next': { ka: '{xp} XP {tier} დონემდე', en: '{xp} XP to {tier}' },
  'dash.growth.max': { ka: 'მაქსიმალური დონე მიღწეულია', en: 'Max tier reached' },
  'dash.stat.xp': { ka: 'მიღებული XP', en: 'XP earned' },
  'dash.stat.vouchers': { ka: 'ვაუჩერები', en: 'Vouchers' },
  'dash.stat.vouchers_n': { ka: '{n} აქტიური', en: '{n} active' },
  'dash.stat.sessions': { ka: 'სესიები', en: 'Sessions' },
  'dash.stat.sessions_n': { ka: '{n} დაჯავშნილი', en: '{n} booked' },
  'dash.stat.tier': { ka: 'ამჟამინდელი დონე', en: 'Current tier' },
  'dash.next.eyebrow': { ka: 'შემდეგი სესია', en: 'Next Session' },
  'dash.next.none': { ka: 'სესიები ჯერ არ გაქვს', en: 'No sessions yet' },
  'dash.next.book_first': { ka: 'დაჯავშნე პირველი სესია', en: 'Book your first session' },
  'dash.next.online': { ka: 'ონლაინ · Google Meet', en: 'Online · Google Meet' },
  'dash.next.book_another': { ka: 'კიდევ ერთი სესიის დაჯავშნა', en: 'Book another session' },
  'dash.diary.recent': { ka: 'ბოლო ჩანაწერები', en: 'Recent Diary' },
  'dash.diary.view_all': { ka: 'ყველას ნახვა', en: 'View all' },
  'dash.diary.new_title': { ka: 'ახალი ჩანაწერი', en: 'New reflection' },
  'dash.diary.mood_open': { ka: 'ღია', en: 'Open' },
  'dash.journey.eyebrow': { ka: 'შენი გზა', en: 'Your Journey' },
  'dash.journey.title': { ka: 'ზრდა და ეტაპები', en: 'Growth & milestones' },
  'dash.milestones': { ka: 'ეტაპები', en: 'Milestones' },
  'dash.milestones.count': { ka: '{done}/{total} შესრულებული', en: '{done}/{total} complete' },
  'dash.schedule.eyebrow': { ka: 'მომავალი', en: 'Upcoming' },
  'dash.schedule.title': { ka: 'ჩემი სესიები', en: 'My sessions' },
  'dash.schedule.new': { ka: 'ახალი ჯავშანი', en: 'New booking' },
  'dash.schedule.empty': { ka: 'ჯავშნები ჯერ არ გაქვს. დაჯავშნე პირველი სესია და აქ გამოჩნდება.', en: 'No bookings yet. Book your first session to see it here.' },
  'dash.schedule.expired': { ka: 'ამ ჯავშნის ვადა ამოიწურა. სესიების დაგეგმვა აღარ შეიძლება.', en: 'This booking has expired. Sessions can no longer be scheduled.' },
  'dash.schedule.expires': { ka: 'ვადა იწურება: {date}', en: 'Expires: {date}' },
  'dash.schedule.used': { ka: '{used}/{total} სესია გამოყენებულია', en: '{used}/{total} sessions used' },
  'dash.schedule.join': { ka: 'Google Meet-ზე შესვლა', en: 'Join Google Meet' },
  'dash.schedule.next_hint': { ka: 'შემდეგი სესია ჯერ არ არის დაგეგმილი', en: 'Next session not scheduled yet' },
  'dash.schedule.sessions': { ka: 'სესიები', en: 'Sessions' },
  'dash.schedule.not_scheduled': { ka: 'არ არის დაგეგმილი', en: 'Not scheduled' },
  'dash.schedule.meet': { ka: 'Meet-ის ბმული', en: 'Meet link' },
  // Scheduling sessions 2..n of a multi-session booking from the dashboard
  'dash.schedule.schedule_next': { ka: 'შემდეგი სესიის დაგეგმვა', en: 'Schedule next session' },
  'dash.schedule.close': { ka: 'დახურვა', en: 'Close' },
  'dash.schedule.pick_date': { ka: 'აირჩიე თარიღი', en: 'Pick a date' },
  'dash.schedule.pick_time': { ka: 'აირჩიე დრო', en: 'Pick a time' },
  'dash.schedule.no_slots': { ka: 'ამ სესიისთვის თავისუფალი დრო ჯერ არ არის. სცადე მოგვიანებით.', en: 'No free times for this session yet. Please check back later.' },
  'dash.schedule.confirm_next': { ka: 'დაგეგმვა', en: 'Schedule' },
  'dash.schedule.scheduling': { ka: 'იგეგმება…', en: 'Scheduling…' },
  'dash.schedule.pending_hint': { ka: 'შემდეგი სესიების დაგეგმვა შესაძლებელი იქნება, როცა კოუჩი ჯავშანს დაადასტურებს', en: 'You can schedule the next sessions once the coach confirms the booking' },
  'groups.seat_reserved': { ka: 'დაჯავშნილია', en: 'reserved' },
  'dash.vault.eyebrow': { ka: 'მხოლოდ წევრებისთვის', en: 'Members Only' },
  'dash.vault.title': { ka: 'პირადი საცავი', en: 'Private vault' },
  'dash.vault.assigned': { ka: 'შენთვის მინიჭებული', en: 'Assigned to you' },
  'dash.vault.assigned_empty': { ka: 'შენს კოუჩს პირადი მასალა ჯერ არ აუტვირთავს. შენთვის მინიჭებული მასალები აქ გამოჩნდება.', en: "Your coach hasn't uploaded anything personal yet. Items assigned to you will appear here." },
  'dash.vault.shared': { ka: 'საერთო ბიბლიოთეკა', en: 'Shared library' },
  'dash.vault.open': { ka: 'გახსნა', en: 'Open' },
  'dash.by': { ka: 'ავტორი: {name}', en: 'by {name}' },
  'dash.tests.eyebrow': { ka: 'მინიჭებული და ღია', en: 'Assigned & open' },
  'dash.tests.title': { ka: 'ჩემი ტესტები', en: 'My tests' },
  'dash.tests.assigned': { ka: 'კოუჩის მიერ მინიჭებული', en: 'Assigned by your coach' },
  'dash.tests.assigned_empty': { ka: 'ტესტები ჯერ არ მოგნიჭებია.', en: 'No tests have been assigned to you yet.' },
  'dash.tests.assigned_by': { ka: 'მოგანიჭა: {name}', en: 'Assigned by {name}' },
  'dash.tests.open': { ka: 'ღია ტესტები', en: 'Open assessments' },
  'dash.profile.eyebrow': { ka: 'ანგარიში', en: 'Account' },
  'dash.profile.title': { ka: 'შენი პროფილი', en: 'Your profile' },
  'dash.profile.tier_xp': { ka: '{tier} დონე · {xp} XP', en: '{tier} tier · {xp} XP' },
  'dash.profile.saved': { ka: 'შენახულია!', en: 'Saved!' },
  'dash.profile.save': { ka: 'ცვლილებების შენახვა', en: 'Save changes' },
  'dash.profile.error': { ka: 'ცვლილებების შენახვა ვერ მოხერხდა. გთხოვ, სცადე თავიდან.', en: 'Failed to save changes. Please try again.' },
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

  useEffect(() => {
    document.documentElement.lang = locale
  }, [locale])

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

/** Fills {placeholders} in a translated string: fmt('Seat #{n}', { n: 3 }). */
export function fmt(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key) => (key in vars ? String(vars[key]) : match))
}

/** Looks a key up in a specific language, regardless of the visitor's current one. */
export function translate(key: string, locale: Locale): string {
  return translations[key]?.[locale] ?? key
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
