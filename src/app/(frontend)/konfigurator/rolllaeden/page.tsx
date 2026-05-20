import React from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function RollladenPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <h1 className="text-3xl font-bold text-foreground">Rollläden-Konfigurator</h1>
      <p className="mt-4 text-lg text-muted-foreground">
        Bald verfügbar — wir arbeiten daran!
      </p>
      <Link
        href="/"
        className="mt-8 inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
      >
        <ArrowLeft className="h-4 w-4" />
        Zurück zur Startseite
      </Link>
    </div>
  )
}
