'use client'

import { motion } from 'motion/react'
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
import { useT, useLocalized } from '@/lib/i18n'

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  show: { opacity: 1, y: 0 },
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
  return (
    <section className="relative isolate flex min-h-[100vh] items-center overflow-hidden bg-foreground">
      <Image
        src={settings?.heroImage ?? '/hero.png'}
        alt="Coach on stage in dramatic light"
        fill
        priority
        className="object-cover opacity-60"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-foreground via-foreground/70 to-foreground/30" />
      <div className="relative z-10 mx-auto w-full max-w-7xl px-6 pt-28">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-3xl text-background"
        >
          <UIBadge className="mb-6 border-background/20 bg-background/10 text-background">
            <Star className="size-3 fill-primary text-primary" />
            {l(settings?.heroBadge, settings?.heroBadgeKa)}
          </UIBadge>
          <h1 className="font-heading text-4xl font-bold leading-[1.07] tracking-tight text-balance sm:text-6xl lg:text-7xl">
            {l(settings?.heroTitle, settings?.heroTitleKa)}{' '}
            <span className="text-primary italic">{l(settings?.heroHighlight, settings?.heroHighlightKa)}</span>{' '}
            {t('hero.suffix')}
          </h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-background/75 sm:text-lg">
            {l(settings?.heroSubtitle, settings?.heroSubtitleKa)}
          </p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-3">
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
          </div>
        </motion.div>
      </div>
    </section>
  )
}

/* ----------------------------- Events Carousel ----------------------------- */
function EventsCarousel({ onBook }: { onBook: () => void }) {
  const { events } = useEvents()
  const scroller = useRef<HTMLDivElement>(null)
  const scrollBy = (dir: number) => {
    scroller.current?.scrollBy({ left: dir * 360, behavior: 'smooth' })
  }
  return (
    <section id="events" className="bg-background py-24">
      <div className="mx-auto max-w-7xl px-6">
        <Reveal className="mb-10 flex items-end justify-between gap-6">
          <div>
            <Eyebrow>Upcoming</Eyebrow>
            <h2 className="mt-3 font-heading text-4xl font-bold tracking-tight text-balance sm:text-5xl">
              Live sessions &amp; seminars
            </h2>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => scrollBy(-1)}
              aria-label="Previous events"
              className="flex size-11 items-center justify-center rounded-full border border-border transition-all duration-200 hover:bg-foreground hover:text-background hover:border-foreground hover:scale-110 active:scale-95"
            >
              <ChevronLeft className="size-5" />
            </button>
            <button
              onClick={() => scrollBy(1)}
              aria-label="Next events"
              className="flex size-11 items-center justify-center rounded-full border border-border transition-all duration-200 hover:bg-foreground hover:text-background hover:border-foreground hover:scale-110 active:scale-95"
            >
              <ChevronRight className="size-5" />
            </button>
          </div>
        </Reveal>
      </div>
      <div
        ref={scroller}
        className="flex snap-x snap-mandatory gap-6 overflow-x-auto px-6 pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        style={{ touchAction: 'pan-x', marginLeft: '10%' }}
      >
        <div className="shrink-0 pl-0 sm:pl-[max(0px,calc((100vw-80rem)/2))]" />
        {events.map((event, i) => (
          <div
            key={event.title + i}
            className="w-[300px] shrink-0 snap-start sm:w-[320px]"
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
                  className="group/btn mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-primary transition-all duration-200 hover:gap-3 hover:opacity-80"
                >
                  Reserve seat <ArrowUpRight className="size-4 transition-transform duration-200 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
                </button>
              </div>
            </UICard>
          </div>
        ))}
        <div className="w-4 shrink-0" />
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
    <section id="pillars" className="bg-secondary py-24">
      <div className="mx-auto max-w-7xl px-6">
        <Reveal className="mx-auto max-w-2xl text-center">
          <Eyebrow>{t('pillars.eyebrow')}</Eyebrow>
          <h2 className="mt-3 font-heading text-4xl font-bold tracking-tight text-balance sm:text-5xl">
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
function Testimonials() {
  const { testimonials } = useTestimonials()
  const [active, setActive] = useState(0)
  const safeActive = Math.min(active, Math.max(testimonials.length - 1, 0))
  const next = () => setActive((p) => (p + 1) % testimonials.length)
  const prev = () =>
    setActive((p) => (p - 1 + testimonials.length) % testimonials.length)

  if (testimonials.length === 0) return null

  return (
    <section id="results" className="bg-foreground py-28 text-background">
      <div className="mx-auto max-w-4xl px-6 text-center">
        <Eyebrow className="text-primary">Transformations</Eyebrow>
        <Quote className="mx-auto mt-8 size-10 text-primary" />
        <motion.blockquote
          key={safeActive}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mt-8 font-heading text-2xl font-medium leading-snug text-balance sm:text-3xl"
        >
          &ldquo;{testimonials[safeActive].quote}&rdquo;
        </motion.blockquote>
        <div className="mt-8">
          <p className="font-semibold">{testimonials[safeActive].name}</p>
          <p className="text-sm text-background/60">{testimonials[safeActive].role}</p>
        </div>
        <div className="mt-10 flex items-center justify-center gap-4">
          <button
            onClick={prev}
            aria-label="Previous testimonial"
            className="flex size-11 items-center justify-center rounded-full border border-background/20 transition-all duration-200 hover:bg-background/15 hover:border-background/40 hover:scale-110 active:scale-95"
          >
            <ChevronLeft className="size-5" />
          </button>
          <div className="flex gap-2">
            {testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => setActive(i)}
                aria-label={`Testimonial ${i + 1}`}
                className={`h-1.5 rounded-full transition-all duration-300 hover:opacity-80 ${
                  i === safeActive ? 'w-8 bg-primary' : 'w-2 bg-background/30'
                }`}
              />
            ))}
          </div>
          <button
            onClick={next}
            aria-label="Next testimonial"
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
    { stat: settings?.statLives, label: t('about.stat.lives') },
    { stat: settings?.statReturn, label: t('about.stat.return') },
  ]
  return (
    <section id="about" className="bg-background py-24">
      <div className="mx-auto grid max-w-7xl items-center gap-14 px-6 lg:grid-cols-2">
        <Reveal>
          <div className="relative aspect-[4/5] overflow-hidden rounded-3xl">
            <Image
              src="/coach.png"
              alt="Portrait of the lead coach"
              fill
              className="object-cover"
            />
          </div>
        </Reveal>
        <Reveal delay={0.1}>
          <Eyebrow>{t('about.eyebrow')}</Eyebrow>
          <h2 className="mt-3 font-heading text-4xl font-bold leading-tight tracking-tight text-balance sm:text-5xl">
            {t('about.title')}
          </h2>
          <div className="mt-6 space-y-5 text-muted-foreground leading-relaxed">
            <p>{t('about.p1')}</p>
            <p>{t('about.p2')}</p>
          </div>
          <div className="mt-8 flex flex-wrap gap-8">
            {stats.map((s) => (
              <div key={s.label}>
                <p className="font-heading text-4xl font-bold text-primary">
                  {s.stat}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>
          <UIButton size="lg" onClick={onBook} className="mt-10">
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
    const onScroll = () => setShow(window.scrollY > 800)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  return (
    <motion.div
      initial={{ y: 120 }}
      animate={{ y: show ? 0 : 120 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="fixed inset-x-0 bottom-0 z-40 px-4 pb-4"
    >
      <div className="mx-auto flex max-w-3xl flex-col items-center justify-between gap-4 rounded-2xl border border-border bg-card/95 p-4 shadow-2xl backdrop-blur sm:flex-row sm:pl-6">
        <p className="text-center font-heading text-lg font-semibold sm:text-left">
          {t('sticky.text')}
        </p>
        <UIButton onClick={onBook} className="w-full shrink-0 sm:w-auto">
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
