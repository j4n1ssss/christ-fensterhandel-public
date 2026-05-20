import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getPayload } from 'payload'
import config from '@payload-config'
import { getCurrentUser } from '@/lib/auth'
import { AnfragenListe } from '@/components/kunden/anfragen-liste'
import { LogoutButton } from '@/components/kunden/logout-button'

export const metadata = {
  title: 'Dashboard | Muster Fenster',
  description: 'Verwalten Sie Ihre Anfragen.',
}

/** Force dynamic rendering — auth-dependent page */
export const dynamic = 'force-dynamic'

export default async function KundenDashboardPage() {
  const user = await getCurrentUser()

  if (!user || user.rolle !== 'kunde') {
    redirect('/kunden/login')
  }

  const payload = await getPayload({ config })

  // Query own Anfragen via Local API (bypasses access control).
  // MUST filter by email manually for security.
  const { docs: anfragen } = await payload.find({
    collection: 'anfragen',
    where: {
      'kontaktdaten.email': { equals: user.email },
    },
    sort: '-createdAt',
    limit: 100,
  })

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Meine Anfragen</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Willkommen, {user.vorname || user.email}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/konfigurator/fenster"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Neue Anfrage
          </Link>
          <LogoutButton />
        </div>
      </div>

      <AnfragenListe anfragen={anfragen} />
    </div>
  )
}
