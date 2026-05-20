"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input, Label, FieldError } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

/**
 * Inline Zod schema (Zod v4 zodResolver-Kompatibilität).
 * Spiegelt kontaktSchema aus @/lib/anfrage/schemas.ts.
 */
const kontaktFormSchema = z.object({
  vorname: z.string().min(1, "Vorname ist erforderlich"),
  nachname: z.string().min(1, "Nachname ist erforderlich"),
  email: z.email("Bitte gültige E-Mail-Adresse eingeben"),
  datenschutz: z.literal(true, {
    error: "Datenschutzerklärung muss akzeptiert werden",
  }),
  agb: z.literal(true, {
    error: "AGB müssen akzeptiert werden",
  }),
  telefon: z.string().optional(),
  strasse: z.string().optional(),
  plz: z.string().optional(),
  ort: z.string().optional(),
  nachricht: z.string().optional(),
});

type KontaktFormValues = z.infer<typeof kontaktFormSchema>;

/**
 * Kontaktformular der Anfrage (Schritt 2 von 3).
 * React Hook Form + Zod mit deutschen Fehlertexten.
 * Persistiert in sessionStorage, navigiert zu /anfrage/zusammenfassung.
 */
interface ContactFormProps {
  agbLink?: string;
}

/**
 * Pflicht-Stern — kräftige error-500 auf hellem Grund für Scanbarkeit.
 */
function Required() {
  return (
    <span aria-hidden className="ml-0.5 text-error-500">
      *
    </span>
  );
}

export function ContactForm({ agbLink = "/agb" }: ContactFormProps) {
  const router = useRouter();

  const getDefaults = (): Partial<KontaktFormValues> => {
    if (typeof window === "undefined") return {};
    try {
      const stored = sessionStorage.getItem("kontaktdaten");
      if (stored) return JSON.parse(stored);
    } catch {
      // ignore
    }
    return {};
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<KontaktFormValues>({
    resolver: zodResolver(kontaktFormSchema),
    defaultValues: {
      vorname: "",
      nachname: "",
      email: "",
      telefon: "",
      strasse: "",
      plz: "",
      ort: "",
      nachricht: "",
      ...getDefaults(),
    },
  });

  const onSubmit = (data: KontaktFormValues) => {
    sessionStorage.setItem("kontaktdaten", JSON.stringify(data));
    router.push("/anfrage/zusammenfassung");
  };

  // Textarea nutzt die gleichen Visuals wie <Input>, braucht aber eigene Klassen,
  // weil <Input> ein <input> rendert. Wir duplizieren die Kern-Klassen bewusst.
  const textareaClass = cn(
    "flex w-full rounded-md border border-black-300 bg-white px-3.5 py-2.5 text-sm text-black-950",
    "placeholder:text-black-400",
    "transition-colors duration-150",
    "focus-visible:border-brand-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/25",
    "disabled:cursor-not-allowed disabled:opacity-50",
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mt-12 space-y-6" noValidate>
      {/* Name */}
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <Label htmlFor="vorname">
            Vorname <Required />
          </Label>
          <Input
            id="vorname"
            type="text"
            placeholder="Max"
            aria-invalid={Boolean(errors.vorname)}
            {...register("vorname")}
          />
          <FieldError>{errors.vorname?.message}</FieldError>
        </div>
        <div>
          <Label htmlFor="nachname">
            Nachname <Required />
          </Label>
          <Input
            id="nachname"
            type="text"
            placeholder="Mustermann"
            aria-invalid={Boolean(errors.nachname)}
            {...register("nachname")}
          />
          <FieldError>{errors.nachname?.message}</FieldError>
        </div>
      </div>

      {/* Email */}
      <div>
        <Label htmlFor="email">
          E-Mail <Required />
        </Label>
        <Input
          id="email"
          type="email"
          placeholder="max@beispiel.de"
          aria-invalid={Boolean(errors.email)}
          {...register("email")}
        />
        <FieldError>{errors.email?.message}</FieldError>
      </div>

      {/* Telefon */}
      <div>
        <Label htmlFor="telefon">Telefon</Label>
        <Input
          id="telefon"
          type="tel"
          placeholder="+49 30 000 000 00"
          {...register("telefon")}
        />
      </div>

      {/* Adresse */}
      <div>
        <Label htmlFor="strasse">Straße + Nr.</Label>
        <Input
          id="strasse"
          type="text"
          placeholder="Musterstraße 1"
          {...register("strasse")}
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-[180px_1fr]">
        <div>
          <Label htmlFor="plz">PLZ</Label>
          <Input
            id="plz"
            type="text"
            inputMode="numeric"
            placeholder="12345"
            {...register("plz")}
          />
        </div>
        <div>
          <Label htmlFor="ort">Ort</Label>
          <Input
            id="ort"
            type="text"
            placeholder="Musterstadt"
            {...register("ort")}
          />
        </div>
      </div>

      {/* Nachricht */}
      <div>
        <Label htmlFor="nachricht">Nachricht</Label>
        <textarea
          id="nachricht"
          rows={4}
          placeholder="Besondere Wünsche, Zeitrahmen oder Anmerkungen?"
          className={textareaClass}
          {...register("nachricht")}
        />
      </div>

      {/* Datenschutz */}
      <div>
        <label className="flex items-start gap-3">
          <input
            type="checkbox"
            {...register("datenschutz")}
            className="mt-0.5 size-4 rounded border-black-300 accent-brand-500 focus-visible:ring-2 focus-visible:ring-brand-500"
          />
          <span className="text-sm leading-relaxed text-black-700">
            Ich habe die{" "}
            <Link
              href="/datenschutz"
              className="text-brand-700 underline underline-offset-2 hover:text-brand-800"
              target="_blank"
            >
              Datenschutzerklärung
            </Link>{" "}
            gelesen und akzeptiere diese.
            <Required />
          </span>
        </label>
        {errors.datenschutz ? (
          <p className="ml-7 mt-1.5 text-xs text-error-600" role="alert">
            {errors.datenschutz.message}
          </p>
        ) : null}
      </div>

      {/* AGB */}
      <div>
        <label className="flex items-start gap-3">
          <input
            type="checkbox"
            {...register("agb")}
            className="mt-0.5 size-4 rounded border-black-300 accent-brand-500 focus-visible:ring-2 focus-visible:ring-brand-500"
            aria-required="true"
          />
          <span className="text-sm leading-relaxed text-black-700">
            Ich akzeptiere die{" "}
            <a
              href={agbLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-700 underline underline-offset-2 hover:text-brand-800"
            >
              AGB
            </a>
            <Required />
          </span>
        </label>
        {errors.agb ? (
          <p className="ml-7 mt-1.5 text-xs text-error-600" role="alert">
            {errors.agb.message || "AGB müssen akzeptiert werden"}
          </p>
        ) : null}
      </div>

      <p className="text-xs leading-relaxed text-black-500">
        Preise sind unverbindlich. Der endgültige Preis steht im Angebot.
      </p>

      {/* Navigation */}
      <div className="flex flex-col gap-3 border-t border-black-200 pt-6 sm:flex-row sm:items-center sm:justify-between">
        <Button
          asChild
          variant="alternate"
          size="normal"
          leadingIcon={<ArrowLeft aria-hidden />}
        >
          <Link href="/warenkorb">Zurück zum Warenkorb</Link>
        </Button>
        <Button
          type="submit"
          variant="primary"
          size="normal"
          trailingIcon={<ArrowRight aria-hidden />}
        >
          Weiter zur Zusammenfassung
        </Button>
      </div>
    </form>
  );
}
