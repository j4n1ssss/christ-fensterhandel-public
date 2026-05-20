import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { RegisterForm } from '@/components/kunden/register-form'

export const metadata = {
  title: 'Registrieren | Muster Fenster',
  description: 'Erstellen Sie ein Konto, um Ihre Anfragen zu verwalten.',
}

export default async function RegisterPage() {
  const user = await getCurrentUser()

  if (user) {
    redirect('/kunden/dashboard')
  }

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center px-4 py-12">
      <RegisterForm />
    </div>
  )
}
