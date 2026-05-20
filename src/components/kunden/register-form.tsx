'use client'

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { UserPlus, Loader2 } from 'lucide-react'

const registerSchema = z
  .object({
    vorname: z.string().min(1, 'Vorname ist erforderlich'),
    nachname: z.string().min(1, 'Nachname ist erforderlich'),
    email: z.email('Bitte gültige E-Mail-Adresse eingeben'),
    password: z.string().min(8, 'Passwort muss mindestens 8 Zeichen lang sein'),
    password_confirm: z.string().min(1, 'Passwort-Bestätigung ist erforderlich'),
  })
  .refine((data) => data.password === data.password_confirm, {
    message: 'Passwörter stimmen nicht überein',
    path: ['password_confirm'],
  })

type RegisterFormValues = z.infer<typeof registerSchema>

export function RegisterForm() {
  const router = useRouter()
  const [serverError, setServerError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      vorname: '',
      nachname: '',
      email: '',
      password: '',
      password_confirm: '',
    },
  })

  const onSubmit = async (data: RegisterFormValues) => {
    setServerError(null)
    setIsSubmitting(true)

    try {
      // 1. Register user with rolle=kunde
      const registerResponse = await fetch('/api/users', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
          vorname: data.vorname,
          nachname: data.nachname,
          rolle: 'kunde',
        }),
      })

      if (!registerResponse.ok) {
        const result = await registerResponse.json().catch(() => null)
        const errorMsg =
          result?.errors?.[0]?.message || 'Registrierung fehlgeschlagen.'
        if (errorMsg.toLowerCase().includes('unique') || errorMsg.toLowerCase().includes('already')) {
          setServerError('Diese E-Mail-Adresse ist bereits registriert.')
        } else {
          setServerError(errorMsg)
        }
        return
      }

      // 2. Auto-login with same credentials
      const loginResponse = await fetch('/api/users/login', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
        }),
      })

      if (loginResponse.ok) {
        router.push('/kunden/dashboard')
        router.refresh()
      } else {
        // Registration succeeded but auto-login failed — redirect to login
        router.push('/kunden/login')
      }
    } catch {
      setServerError('Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const inputClassName =
    'w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary'
  const errorClassName = 'mt-1 text-xs text-red-600'

  return (
    <div className="mx-auto w-full max-w-md">
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-foreground">Konto erstellen</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Registrieren Sie sich, um Ihre Anfragen zu verwalten.
          </p>
        </div>

        {serverError && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="vorname"
                className="mb-1.5 block text-sm font-medium text-foreground"
              >
                Vorname <span className="text-red-500">*</span>
              </label>
              <input
                id="vorname"
                type="text"
                autoComplete="given-name"
                {...register('vorname')}
                className={inputClassName}
                placeholder="Max"
              />
              {errors.vorname && (
                <p className={errorClassName}>{errors.vorname.message}</p>
              )}
            </div>
            <div>
              <label
                htmlFor="nachname"
                className="mb-1.5 block text-sm font-medium text-foreground"
              >
                Nachname <span className="text-red-500">*</span>
              </label>
              <input
                id="nachname"
                type="text"
                autoComplete="family-name"
                {...register('nachname')}
                className={inputClassName}
                placeholder="Mustermann"
              />
              {errors.nachname && (
                <p className={errorClassName}>{errors.nachname.message}</p>
              )}
            </div>
          </div>

          <div>
            <label
              htmlFor="email"
              className="mb-1.5 block text-sm font-medium text-foreground"
            >
              E-Mail <span className="text-red-500">*</span>
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              {...register('email')}
              className={inputClassName}
              placeholder="ihre@email.de"
            />
            {errors.email && (
              <p className={errorClassName}>{errors.email.message}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-1.5 block text-sm font-medium text-foreground"
            >
              Passwort <span className="text-red-500">*</span>
            </label>
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              {...register('password')}
              className={inputClassName}
              placeholder="Mindestens 8 Zeichen"
            />
            {errors.password && (
              <p className={errorClassName}>{errors.password.message}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="password_confirm"
              className="mb-1.5 block text-sm font-medium text-foreground"
            >
              Passwort bestätigen <span className="text-red-500">*</span>
            </label>
            <input
              id="password_confirm"
              type="password"
              autoComplete="new-password"
              {...register('password_confirm')}
              className={inputClassName}
              placeholder="Passwort wiederholen"
            />
            {errors.password_confirm && (
              <p className={errorClassName}>{errors.password_confirm.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <UserPlus className="h-4 w-4" />
            )}
            {isSubmitting ? 'Wird registriert...' : 'Registrieren'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-muted-foreground">
          Bereits ein Konto?{' '}
          <Link
            href="/kunden/login"
            className="font-medium text-primary underline underline-offset-2 hover:text-primary/80"
          >
            Jetzt anmelden
          </Link>
        </p>
      </div>
    </div>
  )
}
