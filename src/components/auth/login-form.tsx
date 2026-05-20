"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader2 } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Input, Label, FieldError } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { trackEvent } from "@/lib/tracking/pirsch";

const loginSchema = z.object({
  email: z.email("Bitte gültige E-Mail-Adresse eingeben"),
  password: z.string().min(1, "Passwort ist erforderlich"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function AuthLoginForm() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setServerError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/users/login", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: data.email, password: data.password }),
      });

      if (response.ok) {
        trackEvent("Login erfolgreich");
        router.push("/dashboard");
        router.refresh();
      } else {
        const result = await response.json().catch(() => null);
        setServerError(
          result?.errors?.[0]?.message || "E-Mail oder Passwort ist falsch.",
        );
      }
    } catch {
      setServerError(
        "Ein Fehler ist aufgetreten. Bitte versuche es erneut.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {serverError && (
        <div
          role="alert"
          className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
        >
          {serverError}
        </div>
      )}

      <div>
        <Label htmlFor="email">E-Mail-Adresse</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          aria-invalid={!!errors.email}
          {...register("email")}
          placeholder="du@beispiel.de"
        />
        <FieldError>{errors.email?.message}</FieldError>
      </div>

      <div>
        <div className="flex items-baseline justify-between">
          <Label htmlFor="password">Passwort</Label>
          <Link
            href="/passwort-vergessen"
            className="mb-1.5 text-xs text-black-500 underline-offset-2 transition-colors hover:text-brand-700 hover:underline"
          >
            Vergessen?
          </Link>
        </div>
        <Input
          id="password"
          type="password"
          autoComplete="current-password"
          aria-invalid={!!errors.password}
          {...register("password")}
          placeholder="Dein Passwort"
        />
        <FieldError>{errors.password?.message}</FieldError>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className={cn(
          buttonVariants({ variant: "primary", size: "normal" }),
          "mt-2 w-full",
        )}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="animate-spin" aria-hidden />
            Anmeldung läuft…
          </>
        ) : (
          <>
            Anmelden
            <ArrowRight aria-hidden />
          </>
        )}
      </button>

      <p className="pt-2 text-center text-sm text-black-600">
        Noch kein Konto?{" "}
        <Link
          href="/registrieren"
          className="font-medium text-black-950 underline-offset-2 transition-colors hover:text-brand-700 hover:underline"
        >
          Jetzt registrieren
        </Link>
      </p>
    </form>
  );
}
