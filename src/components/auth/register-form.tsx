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

const registerSchema = z
  .object({
    vorname: z.string().min(1, "Vorname ist erforderlich"),
    nachname: z.string().min(1, "Nachname ist erforderlich"),
    email: z.email("Bitte gültige E-Mail-Adresse eingeben"),
    password: z.string().min(8, "Mindestens 8 Zeichen"),
    password_confirm: z.string().min(1, "Bitte Passwort wiederholen"),
  })
  .refine((data) => data.password === data.password_confirm, {
    message: "Passwörter stimmen nicht überein",
    path: ["password_confirm"],
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

export function AuthRegisterForm() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      vorname: "",
      nachname: "",
      email: "",
      password: "",
      password_confirm: "",
    },
  });

  const onSubmit = async (data: RegisterFormValues) => {
    setServerError(null);
    setIsSubmitting(true);

    try {
      const registerResponse = await fetch("/api/users", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
          vorname: data.vorname,
          nachname: data.nachname,
          rolle: "kunde",
        }),
      });

      if (!registerResponse.ok) {
        const result = await registerResponse.json().catch(() => null);
        const errorMsg =
          result?.errors?.[0]?.message || "Registrierung fehlgeschlagen.";
        const lower = errorMsg.toLowerCase();
        if (lower.includes("unique") || lower.includes("already")) {
          setServerError("Diese E-Mail-Adresse ist bereits registriert.");
        } else {
          setServerError(errorMsg);
        }
        return;
      }

      trackEvent("Registrierung abgeschlossen");

      const loginResponse = await fetch("/api/users/login", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
        }),
      });

      if (loginResponse.ok) {
        router.push("/dashboard");
        router.refresh();
      } else {
        router.push("/anmelden");
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

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <Label htmlFor="vorname">Vorname</Label>
          <Input
            id="vorname"
            autoComplete="given-name"
            aria-invalid={!!errors.vorname}
            {...register("vorname")}
            placeholder="Max"
          />
          <FieldError>{errors.vorname?.message}</FieldError>
        </div>
        <div>
          <Label htmlFor="nachname">Nachname</Label>
          <Input
            id="nachname"
            autoComplete="family-name"
            aria-invalid={!!errors.nachname}
            {...register("nachname")}
            placeholder="Mustermann"
          />
          <FieldError>{errors.nachname?.message}</FieldError>
        </div>
      </div>

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
        <Label htmlFor="password">Passwort</Label>
        <Input
          id="password"
          type="password"
          autoComplete="new-password"
          aria-invalid={!!errors.password}
          {...register("password")}
          placeholder="Mindestens 8 Zeichen"
        />
        <FieldError>{errors.password?.message}</FieldError>
      </div>

      <div>
        <Label htmlFor="password_confirm">Passwort bestätigen</Label>
        <Input
          id="password_confirm"
          type="password"
          autoComplete="new-password"
          aria-invalid={!!errors.password_confirm}
          {...register("password_confirm")}
          placeholder="Passwort wiederholen"
        />
        <FieldError>{errors.password_confirm?.message}</FieldError>
      </div>

      <p className="pt-1 font-mono text-[11px] leading-relaxed text-black-500">
        Mit der Registrierung akzeptierst du unsere{" "}
        <Link
          href="/agb"
          className="underline-offset-2 hover:text-brand-700 hover:underline"
        >
          AGB
        </Link>{" "}
        und{" "}
        <Link
          href="/datenschutz"
          className="underline-offset-2 hover:text-brand-700 hover:underline"
        >
          Datenschutzerklärung
        </Link>
        .
      </p>

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
            Registrierung läuft…
          </>
        ) : (
          <>
            Konto erstellen
            <ArrowRight aria-hidden />
          </>
        )}
      </button>

      <p className="pt-2 text-center text-sm text-black-600">
        Bereits registriert?{" "}
        <Link
          href="/anmelden"
          className="font-medium text-black-950 underline-offset-2 transition-colors hover:text-brand-700 hover:underline"
        >
          Jetzt anmelden
        </Link>
      </p>
    </form>
  );
}
