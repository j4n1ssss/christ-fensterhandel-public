export const LOCALES = ['de', 'en'] as const

export type Locale = (typeof LOCALES)[number]

export const DEFAULT_LOCALE: Locale = 'de'

export function isValidLocale(locale: string): locale is Locale {
  return LOCALES.includes(locale as Locale)
}

export function getAlternateLocale(current: Locale): Locale {
  return current === 'de' ? 'en' : 'de'
}
