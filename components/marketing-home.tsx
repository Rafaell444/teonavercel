'use client'

import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import {
  ArrowRight,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Quote,
  Star,
} from 'lucide-react'
import { UIButton, UICard, UIBadge, Eyebrow } from '@/components/ui-kit'
import { SiteFooter } from '@/components/site-footer'
import { useEvents } from '@/lib/hooks/useEvents'
import { useTestimonials } from '@/lib/hooks/useTestimonials'
import { usePillars, useSiteSettings } from '@/lib/hooks/useContent'
import { ConsultationButton, ConsultationCTA } from '@/components/consultation-modal'
import { useT, useLocalized, useLocale, translate, fmt } from '@/lib/i18n'

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  show: { opacity: 1, y: 0 },
}

// Hero: badge, headline, subtitle and buttons arrive one after another
const heroStagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.13, delayChildren: 0.15 } },
}
const heroItem = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] as const } },
}

function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode
  delay?: number
  className?: string
}) {
  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

/* ----------------------------- Hero ----------------------------- */
function Hero({ onBook, onQuiz }: { onBook: () => void; onQuiz: () => void }) {
  const { settings } = useSiteSettings()
  const t = useT()
  const l = useLocalized()
  const locale = useLocale()
  // The headline is three pieces (title + highlighted word + closing words). The
  // title comes from the admin panel and may exist in English only, so all three
  // follow the language of the title actually shown instead of mixing two languages.
  const heroLocale = locale === 'ka' && settings?.heroTitleKa ? 'ka' : 'en'
  const heroTitle = heroLocale === 'ka' ? settings?.heroTitleKa : settings?.heroTitle
  const heroHighlight =
    heroLocale === 'ka' ? settings?.heroHighlightKa || settings?.heroHighlight : settings?.heroHighlight
  return (
    <section className="relative isolate flex min-h-[100svh] items-center overflow-hidden bg-foreground">
      {/* Slow settle on load; the section clips the overscale */}
      <motion.div
        initial={{ scale: 1.08 }}
        animate={{ scale: 1 }}
        transition={{ duration: 1.8, ease: [0.22, 1, 0.36, 1] }}
        className="absolute inset-0"
      >
        {/* Wait for the settings so the image is not swapped once they arrive */}
        {settings && (
          <Image
            src={settings.heroImage ?? '/hero.webp'}
            alt={t('hero.image_alt')}
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-60"
          />
        )}
      </motion.div>
      <div className="absolute inset-0 bg-gradient-to-t from-foreground via-foreground/70 to-foreground/30" />
      <div className="relative z-10 mx-auto w-full max-w-7xl px-6 pb-12 pt-28">
        <motion.div
          variants={heroStagger}
          initial="hidden"
          animate="show"
          className="max-w-3xl text-background"
        >
          <motion.div variants={heroItem}>
            <UIBadge className="mb-6 border-background/20 bg-background/10 text-background">
              <Star className="size-3 fill-primary text-primary" />
              {l(settings?.heroBadge, settings?.heroBadgeKa)}
            </UIBadge>
          </motion.div>
          <motion.h1 variants={heroItem} className="font-heading text-4xl font-bold leading-[1.07] tracking-tight text-balance break-words sm:text-6xl lg:text-7xl">
            {heroTitle}{' '}
            <span className="text-primary italic">{heroHighlight}</span>{' '}
            {settings && translate('hero.suffix', heroLocale)}
          </motion.h1>
          <motion.p variants={heroItem} className="mt-6 max-w-xl text-base leading-relaxed text-background/75 sm:text-lg">
            {l(settings?.heroSubtitle, settings?.heroSubtitleKa)}
          </motion.p>
          <motion.div variants={heroItem} className="mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
            <UIButton onClick={onBook} className="w-full sm:w-auto">
              {t('hero.book')}
              <ArrowRight className="size-4" />
            </UIButton>
            <UIButton
              variant="ghost"
              onClick={onQuiz}
              className="w-full text-background sm:w-auto"
            >
              {t('hero.quiz')}
            </UIButton>
            <ConsultationButton className="w-full border-background/40 text-background hover:bg-background/10 sm:w-auto" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

/* ----------------------------- Events Carousel ----------------------------- */
function EventsCarousel({ onBook }: { onBook: () => void }) {
  const { events } = useEvents()
  const t = useT()
  const scroller = useRef<HTMLDivElement>(null)
  const scrollBy = (dir: number) => {
    const el = scroller.current
    if (!el) return
    // Step by one card (card width + gap) so it works at every card size
    const card = el.querySelector<HTMLElement>(':scope > div')
    const step = card ? card.offsetWidth + 24 : 344
    el.scrollBy({ left: dir * step, behavior: 'smooth' })
  }
  return (
    <section id="events" className="bg-background py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-6">
        <Reveal className="mb-10 flex items-end justify-between gap-6">
          <div className="min-w-0">
            <Eyebrow>{t('events.upcoming')}</Eyebrow>
            <h2 className="mt-3 font-heading text-3xl font-bold tracking-tight text-balance sm:text-5xl">
              {t('events.heading')}
            </h2>
          </div>
          <div className="flex shrink-0 gap-2">
            <button
              onClick={() => scrollBy(-1)}
              aria-label={t('events.prev')}
              className="flex size-11 items-center justify-center rounded-full border border-border transition-all duration-200 hover:bg-foreground hover:text-background hover:border-foreground hover:scale-110 active:scale-95"
            >
              <ChevronLeft className="size-5" />
            </button>
            <button
              onClick={() => scrollBy(1)}
              aria-label={t('events.next')}
              className="flex size-11 items-center justify-center rounded-full border border-border transition-all duration-200 hover:bg-foreground hover:text-background hover:border-foreground hover:scale-110 active:scale-95"
            >
              <ChevronRight className="size-5" />
            </button>
          </div>
        </Reveal>
      </div>
      {/* The inline padding lines the first card up with the page container at
          every width (the container is max-w-7xl = 80rem with a 1.5rem gutter). */}
      <div
        ref={scroller}
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-px-6 px-6 pb-4 [scrollbar-width:none] sm:gap-6 xl:scroll-pl-[calc((100%-80rem)/2+1.5rem)] xl:pl-[calc((100%-80rem)/2+1.5rem)] [&::-webkit-scrollbar]:hidden"
      >
        {events.map((event, i) => (
          <div
            key={event.title + i}
            className="w-[82vw] max-w-[320px] shrink-0 snap-start"
          >
            <UICard className="group h-full overflow-hidden">
              <div className="relative h-48 overflow-hidden">
                <Image
                  src={event.image || '/placeholder.svg'}
                  alt={event.title}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <span className="absolute left-4 top-4 rounded-full bg-background/90 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em]">
                  {event.type}
                </span>
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
                  <span>{event.date}</span>
                  <span>{event.seats}</span>
                </div>
                <h3 className="mt-3 font-heading text-xl font-bold tracking-tight">
                  {event.title}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {event.location}
                </p>
                <button
                  onClick={onBook}
                  className="group/btn mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-primary-ink transition-all duration-200 hover:gap-3 hover:opacity-80"
                >
                  {t('events.reserve')} <ArrowUpRight className="size-4 transition-transform duration-200 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
                </button>
              </div>
            </UICard>
          </div>
        ))}
      </div>
    </section>
  )
}

/* ----------------------------- Pillars ----------------------------- */
function Pillars({ onPillarClick }: { onPillarClick: (id: string) => void }) {
  const { pillars } = usePillars()
  const t = useT()
  const l = useLocalized()
  return (
    <section id="pillars" className="bg-secondary py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-6">
        <Reveal className="mx-auto max-w-2xl text-center">
          <Eyebrow>{t('pillars.eyebrow')}</Eyebrow>
          <h2 className="mt-3 font-heading text-3xl font-bold tracking-tight text-balance sm:text-5xl">
            {t('pillars.title')}
          </h2>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            {t('pillars.subtitle')}
          </p>
        </Reveal>
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {pillars.map((pillar, i) => (
            <Reveal key={pillar.title} delay={i * 0.08}>
              <UICard
                className="group flex h-full cursor-pointer flex-col p-7 transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5"
                onClick={() => onPillarClick(pillar.id)}
              >
                <span className="font-heading text-5xl font-bold text-primary/30 transition-colors group-hover:text-primary">
                  0{i + 1}
                </span>
                <h3 className="mt-5 font-heading text-xl font-bold tracking-tight">
                  {l(pillar.title, pillar.title_ka)}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {l(pillar.blurb, pillar.blurb_ka)}
                </p>
                <ul className="mt-5 space-y-2 border-t border-border pt-5">
                  {(l(pillar.points, pillar.points_ka) || []).map((point: string) => (
                    <li
                      key={point}
                      className="flex items-center gap-2 text-sm text-foreground/80"
                    >
                      <span className="size-1.5 rounded-full bg-primary" />
                      {point}
                    </li>
                  ))}
                </ul>
              </UICard>
            </Reveal>
          ))}
        </div>
        <Reveal>
          <ConsultationCTA />
        </Reveal>
      </div>
    </section>
  )
}

/* ----------------------------- Testimonials ----------------------------- */
function TestimonialBody({ quote, name, role }: { quote: string; name: string; role: string }) {
  return (
    <>
      <blockquote className="font-heading text-xl font-medium leading-snug text-balance sm:text-3xl">
        &ldquo;{quote}&rdquo;
      </blockquote>
      <div className="mt-8">
        <p className="font-semibold">{name}</p>
        <p className="text-sm text-background/60">{role}</p>
      </div>
    </>
  )
}

function Testimonials() {
  const { testimonials } = useTestimonials()
  const t = useT()
  const [active, setActive] = useState(0)
  const safeActive = Math.min(active, Math.max(testimonials.length - 1, 0))
  const next = () => setActive((p) => (p + 1) % testimonials.length)
  const prev = () =>
    setActive((p) => (p - 1 + testimonials.length) % testimonials.length)

  if (testimonials.length === 0) return null

  return (
    <section id="results" className="bg-foreground py-20 text-background sm:py-28">
      <div className="mx-auto max-w-4xl px-6 text-center">
        <Eyebrow className="text-primary">{t('testimonials.label')}</Eyebrow>
        <Quote className="mx-auto mt-8 size-10 text-primary" />
        <div className="mt-8 grid" aria-live="polite">
          {/* Invisible copies of every testimonial share one grid cell, so the
              section is always as tall as the longest quote and never jumps. */}
          {testimonials.map((item, i) => (
            <div key={item.id ?? i} aria-hidden className="invisible col-start-1 row-start-1">
              <TestimonialBody quote={item.quote} name={item.name} role={item.role} />
            </div>
          ))}
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={safeActive}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="col-start-1 row-start-1 self-center"
            >
              <TestimonialBody
                quote={testimonials[safeActive].quote}
                name={testimonials[safeActive].name}
                role={testimonials[safeActive].role}
              />
            </motion.div>
          </AnimatePresence>
        </div>
        <div className="mt-10 flex items-center justify-center gap-4">
          <button
            onClick={prev}
            aria-label={t('testimonials.prev')}
            className="flex size-11 items-center justify-center rounded-full border border-background/20 transition-all duration-200 hover:bg-background/15 hover:border-background/40 hover:scale-110 active:scale-95"
          >
            <ChevronLeft className="size-5" />
          </button>
          <div className="flex gap-0">
            {testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => setActive(i)}
                aria-label={fmt(t('testimonials.item'), { n: i + 1 })}
                aria-current={i === safeActive}
                className="group flex h-11 items-center px-1"
              >
                <span
                  className={`block h-1.5 rounded-full transition-all duration-300 group-hover:opacity-80 ${
                    i === safeActive ? 'w-8 bg-primary' : 'w-2 bg-background/30'
                  }`}
                />
              </button>
            ))}
          </div>
          <button
            onClick={next}
            aria-label={t('testimonials.next')}
            className="flex size-11 items-center justify-center rounded-full border border-background/20 transition-all duration-200 hover:bg-background/15 hover:border-background/40 hover:scale-110 active:scale-95"
          >
            <ChevronRight className="size-5" />
          </button>
        </div>
      </div>
    </section>
  )
}

/* ----------------------------- About ----------------------------- */
function About({ onBook }: { onBook: () => void }) {
  const { settings } = useSiteSettings()
  const t = useT()
  const stats = [
    { stat: settings?.statHours, label: t('about.stat.hours') },
    { stat: settings?.statLives, label: t('about.stat.years') },
    { stat: settings?.statReturn, label: t('about.stat.management') },
  ]
  return (
    <section id="about" className="bg-background py-16 sm:py-24">
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-6 sm:gap-14 lg:grid-cols-2">
        <Reveal>
          <div className="relative mx-auto aspect-[4/5] w-full max-w-md overflow-hidden rounded-3xl lg:max-w-none">
            <Image
              src="/coach.webp"
              alt={t('about.image_alt')}
              fill
              className="object-cover"
            />
          </div>
        </Reveal>
        <Reveal delay={0.1}>
          <Eyebrow>{t('about.eyebrow')}</Eyebrow>
          <h2 className="mt-3 font-heading text-3xl font-bold leading-tight tracking-tight text-balance sm:text-5xl">
            {t('about.title')}
          </h2>
          <div className="mt-6 space-y-5 text-muted-foreground leading-relaxed">
            <p>{t('about.p1')}</p>
            <p>{t('about.p2')}</p>
          </div>
          <div className="mt-8 flex flex-wrap gap-x-8 gap-y-5">
            {stats.map((s) => (
              <div key={s.label}>
                <p className="font-heading text-3xl font-bold text-primary sm:text-4xl">
                  {s.stat}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>
          <UIButton size="lg" onClick={onBook} className="mt-10 w-full sm:w-auto">
            {t('about.cta')}
            <ArrowRight className="size-4" />
          </UIButton>
        </Reveal>
      </div>
    </section>
  )
}

/* ----------------------------- Sticky CTA ----------------------------- */
function StickyCTA({ onBook }: { onBook: () => void }) {
  const [show, setShow] = useState(false)
  const t = useT()
  useEffect(() => {
    const onScroll = () => {
      const doc = document.documentElement
      const nearBottom = window.innerHeight + window.scrollY > doc.scrollHeight - 260
      setShow(window.scrollY > 800 && !nearBottom)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  return (
    <motion.div
      initial={{ y: 120 }}
      animate={{ y: show ? 0 : 120 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      aria-hidden={!show}
      className={`fixed inset-x-0 bottom-0 z-40 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] ${show ? '' : 'pointer-events-none'}`}
    >
      <div className="mx-auto flex max-w-3xl flex-col items-center justify-between gap-4 rounded-2xl border border-border bg-card/95 p-2.5 shadow-2xl backdrop-blur sm:flex-row sm:p-4 sm:pl-6">
        <p className="hidden text-center font-heading text-lg font-semibold sm:block sm:text-left">
          {t('sticky.text')}
        </p>
        <UIButton onClick={onBook} tabIndex={show ? 0 : -1} className="w-full shrink-0 sm:w-auto">
          {t('hero.book')}
          <ArrowRight className="size-4" />
        </UIButton>
      </div>
    </motion.div>
  )
}

/* ----------------------------- Page ----------------------------- */
export function MarketingHome({
  onBook,
  onQuiz,
  onNavigate,
  onPillarClick,
}: {
  onBook: () => void
  onQuiz: () => void
  onNavigate?: (view: string) => void
  onPillarClick?: (pillarId: string) => void
}) {
  return (
    <div className="bg-background">
      <Hero onBook={onBook} onQuiz={onQuiz} />
      <EventsCarousel onBook={onBook} />
      <Pillars onPillarClick={(id) => onPillarClick?.(id)} />
      <Testimonials />
      <About onBook={onBook} />
      <SiteFooter onNavigate={onNavigate} />
      <StickyCTA onBook={onBook} />
    </div>
  )
}
