import React from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { isValidLocale, DEFAULT_LOCALE } from '@/lib/i18n'

interface LocaleHomePageProps {
  params: Promise<{ locale: string }>
}

const KONFIGURATOR_CARDS = [
  {
    title: 'Fenster',
    description:
      'Konfigurieren Sie Ihr Wunschfenster Schritt für Schritt — von Material über Verglasung bis hin zu Farben und Extras.',
    href: '/konfigurator/fenster',
    available: true,
    icon: (
      <svg
        viewBox="0 0 80 80"
        fill="none"
        className="h-16 w-16 text-foreground"
        aria-hidden="true"
      >
        <rect x="8" y="8" width="64" height="64" rx="2" stroke="currentColor" strokeWidth="2.5" />
        <line x1="40" y1="8" x2="40" y2="72" stroke="currentColor" strokeWidth="2" />
        <line x1="8" y1="40" x2="72" y2="40" stroke="currentColor" strokeWidth="2" />
        <circle cx="36" cy="44" r="2" fill="currentColor" />
        <circle cx="44" cy="44" r="2" fill="currentColor" />
      </svg>
    ),
  },
  {
    title: 'Türen',
    description:
      'Haustür, Balkontür oder Nebeneingangstür — finden Sie die perfekte Tür für Ihr Zuhause.',
    href: '/konfigurator/tueren',
    available: false,
    icon: (
      <svg
        viewBox="0 0 80 80"
        fill="none"
        className="h-16 w-16 text-foreground"
        aria-hidden="true"
      >
        <rect x="16" y="4" width="48" height="72" rx="2" stroke="currentColor" strokeWidth="2.5" />
        <circle cx="52" cy="42" r="2.5" fill="currentColor" />
        <rect x="24" y="12" width="32" height="24" rx="1" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    title: 'Rollläden',
    description:
      'Wählen Sie den passenden Rollladen für optimalen Sonnen- und Sichtschutz.',
    href: '/konfigurator/rolllaeden',
    available: false,
    icon: (
      <svg
        viewBox="0 0 80 80"
        fill="none"
        className="h-16 w-16 text-foreground"
        aria-hidden="true"
      >
        <rect x="8" y="16" width="64" height="56" rx="2" stroke="currentColor" strokeWidth="2.5" />
        <rect x="8" y="8" width="64" height="12" rx="2" stroke="currentColor" strokeWidth="2.5" />
        <line x1="12" y1="28" x2="68" y2="28" stroke="currentColor" strokeWidth="1.5" />
        <line x1="12" y1="36" x2="68" y2="36" stroke="currentColor" strokeWidth="1.5" />
        <line x1="12" y1="44" x2="68" y2="44" stroke="currentColor" strokeWidth="1.5" />
        <line x1="12" y1="52" x2="68" y2="52" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
  },
]

/**
 * Locale-prefixed homepage: /de/ oder /en/
 * Statische Landing Page. Puck-CMS-Integration temporaer deaktiviert (siehe docs).
 */
export default async function LocaleHomePage({ params }: LocaleHomePageProps) {
  const { locale } = await params
  // Locale-Validierung (Routing-Konsistenz), aktuell nicht weiter genutzt
  void (isValidLocale(locale) ? locale : DEFAULT_LOCALE)

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="mx-auto max-w-5xl px-4 pb-16 pt-20 text-center sm:px-6">
        <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          Muster Fenster
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
          Konfigurieren Sie Fenster, Türen und Rollläden nach Ihren Wünschen —
          einfach, schnell und übersichtlich.
        </p>
      </section>

      {/* Configurator Cards */}
      <section className="mx-auto max-w-5xl px-4 pb-20 sm:px-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {KONFIGURATOR_CARDS.map((card) => (
            <Link
              key={card.title}
              href={card.href}
              className={`group relative flex flex-col items-center rounded-xl border border-border bg-card p-8 text-center transition-all ${
                card.available
                  ? 'hover:border-primary/50 hover:shadow-lg'
                  : 'cursor-default opacity-60'
              }`}
            >
              {!card.available && (
                <span className="absolute right-4 top-4 rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                  Bald verfügbar
                </span>
              )}
              <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-lg bg-secondary">
                {card.icon}
              </div>
              <h2 className="text-xl font-semibold text-card-foreground">{card.title}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{card.description}</p>
              {card.available && (
                <span className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-primary transition-all group-hover:gap-3">
                  Jetzt konfigurieren
                  <ArrowRight className="h-4 w-4" />
                </span>
              )}
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
