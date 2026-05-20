'use client'

import Link from 'next/link'

export default function KonfiguratorError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="mx-auto max-w-xl px-4 py-16 text-center">
      <h1 className="text-2xl font-bold text-foreground">Etwas ist schiefgelaufen</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Beim Laden des Konfigurators ist ein Fehler aufgetreten.
      </p>
      <div className="mt-6 flex items-center justify-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="rounded-lg bg-primary px-5 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Erneut versuchen
        </button>
        <Link
          href="/"
          className="rounded-lg border border-border px-5 py-2 text-sm font-medium text-foreground hover:bg-accent"
        >
          Zur Startseite
        </Link>
      </div>
      {process.env.NODE_ENV !== 'production' && (
        <pre className="mt-6 overflow-auto rounded-md bg-secondary p-3 text-left text-xs text-muted-foreground">
          {error.message}
        </pre>
      )}
    </div>
  )
}

