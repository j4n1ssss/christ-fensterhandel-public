import Link from 'next/link'
import { GastTrackingForm } from '@/components/kunden/gast-tracking-form'
import { Search } from 'lucide-react'

export const metadata = {
  title: 'Status prüfen | Muster Fenster',
  description: 'Prüfen Sie den Status Ihrer Anfrage ohne Anmeldung.',
}

/**
 * Public page for guest status checking.
 * No auth required — guests can check their Anfrage status with Anfrage-Nr + Email.
 */
export default function StatusPruefenPage() {
  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center px-4 py-12">
      <div className="mx-auto w-full max-w-md">
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="mb-6 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Search className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">Status prüfen</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Geben Sie Ihre Anfrage-Nr. und E-Mail ein, um den aktuellen Status zu sehen.
            </p>
          </div>

          <GastTrackingForm />

          <p className="mt-6 text-center text-xs text-muted-foreground">
            Sie haben ein Konto?{' '}
            <Link
              href="/kunden/login"
              className="font-medium text-primary underline underline-offset-2 hover:text-primary/80"
            >
              Jetzt anmelden
            </Link>{' '}
            für eine vollständige Übersicht.
          </p>
        </div>
      </div>
    </div>
  )
}
