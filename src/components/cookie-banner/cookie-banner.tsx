'use client'

import { useState, useEffect } from 'react'
import Cookies from 'js-cookie'

const COOKIE_NAME = 'cookie-consent'

interface ConsentState {
  necessary: boolean
  statistics: boolean
  marketing: boolean
}

/**
 * DSGVO-compliant cookie consent banner.
 * 3 categories: Notwendig (always on), Statistik, Marketing.
 * Saves consent as JSON cookie for 365 days.
 */
export function CookieBanner() {
  const [visible, setVisible] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [consent, setConsent] = useState<ConsentState>({
    necessary: true,
    statistics: false,
    marketing: false,
  })

  useEffect(() => {
    const existing = Cookies.get(COOKIE_NAME)
    if (!existing) {
      setVisible(true)
    }
  }, [])

  function saveConsent(consentData: ConsentState) {
    Cookies.set(COOKIE_NAME, JSON.stringify(consentData), {
      path: '/',
      expires: 365,
      sameSite: 'lax',
    })
    setVisible(false)
  }

  function handleAcceptAll() {
    saveConsent({ necessary: true, statistics: true, marketing: true })
  }

  function handleNecessaryOnly() {
    saveConsent({ necessary: true, statistics: false, marketing: false })
  }

  function handleSaveSelection() {
    saveConsent(consent)
  }

  if (!visible) return null

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background p-4 shadow-lg sm:p-6">
      <div className="mx-auto max-w-4xl">
        <h3 className="text-base font-semibold text-foreground">
          Cookie-Einstellungen
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Wir verwenden Cookies, um Ihnen die bestmögliche Erfahrung auf unserer Website zu
          bieten. Sie können wählen, welche Kategorien Sie zulassen möchten.
        </p>

        {expanded && (
          <div className="mt-4 space-y-3">
            {/* Notwendig — always on */}
            <div className="flex items-center justify-between rounded-md border border-border px-4 py-3">
              <div>
                <p className="text-sm font-medium text-foreground">Notwendig</p>
                <p className="text-xs text-muted-foreground">
                  Session, Sicherheit — immer aktiv
                </p>
              </div>
              <div className="relative inline-flex h-6 w-11 cursor-not-allowed items-center rounded-full bg-primary opacity-60">
                <span className="inline-block h-4 w-4 translate-x-6 rounded-full bg-white transition-transform" />
              </div>
            </div>

            {/* Statistik */}
            <div className="flex items-center justify-between rounded-md border border-border px-4 py-3">
              <div>
                <p className="text-sm font-medium text-foreground">Statistik</p>
                <p className="text-xs text-muted-foreground">
                  Vorbereitet für Google Analytics
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={consent.statistics}
                onClick={() =>
                  setConsent((prev) => ({ ...prev, statistics: !prev.statistics }))
                }
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  consent.statistics ? 'bg-primary' : 'bg-muted'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${
                    consent.statistics ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Marketing */}
            <div className="flex items-center justify-between rounded-md border border-border px-4 py-3">
              <div>
                <p className="text-sm font-medium text-foreground">Marketing</p>
                <p className="text-xs text-muted-foreground">
                  Vorbereitet für Tracking Pixels
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={consent.marketing}
                onClick={() =>
                  setConsent((prev) => ({ ...prev, marketing: !prev.marketing }))
                }
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  consent.marketing ? 'bg-primary' : 'bg-muted'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${
                    consent.marketing ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        )}

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleAcceptAll}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Alle akzeptieren
          </button>
          <button
            type="button"
            onClick={handleNecessaryOnly}
            className="rounded-md border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Nur notwendige
          </button>
          {expanded ? (
            <button
              type="button"
              onClick={handleSaveSelection}
              className="rounded-md border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
            >
              Auswahl speichern
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setExpanded(true)}
              className="rounded-md px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Einstellungen
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
