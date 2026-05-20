'use client'

import { usePathname, useRouter } from 'next/navigation'
import { LOCALES, isValidLocale, getAlternateLocale, DEFAULT_LOCALE } from '@/lib/i18n'
import type { Locale } from '@/lib/i18n'

/**
 * Compact DE/EN language toggle for the header.
 * Reads current locale from URL pathname, swaps to alternate locale on click.
 */
export function LanguageToggle() {
  const pathname = usePathname()
  const router = useRouter()

  // Detect current locale from first path segment
  const segments = pathname.split('/')
  const firstSegment = segments[1] || ''
  const currentLocale: Locale = isValidLocale(firstSegment) ? firstSegment : DEFAULT_LOCALE

  function handleSwitch(targetLocale: Locale) {
    if (targetLocale === currentLocale) return

    let newPath: string
    if (isValidLocale(firstSegment)) {
      // Replace existing locale prefix
      segments[1] = targetLocale
      newPath = segments.join('/')
    } else {
      // No locale prefix — add one
      newPath = `/${targetLocale}${pathname}`
    }

    router.push(newPath || '/')
  }

  return (
    <div className="flex items-center gap-0.5 text-sm font-medium">
      {LOCALES.map((locale, index) => (
        <span key={locale} className="flex items-center">
          {index > 0 && (
            <span className="mx-0.5 text-muted-foreground/50">|</span>
          )}
          <button
            type="button"
            onClick={() => handleSwitch(locale)}
            className={`rounded px-1 py-0.5 uppercase transition-colors ${
              locale === currentLocale
                ? 'text-foreground font-semibold'
                : 'text-muted-foreground hover:text-foreground'
            }`}
            aria-label={`Sprache wechseln zu ${locale === 'de' ? 'Deutsch' : 'English'}`}
            aria-current={locale === currentLocale ? 'true' : undefined}
          >
            {locale}
          </button>
        </span>
      ))}
    </div>
  )
}
