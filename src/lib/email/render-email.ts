/**
 * Email rendering orchestrator.
 *
 * Dynamically loads and renders email templates based on template slug.
 * Returns HTML, plain text, and subject line for queue entry creation.
 */

import { render } from "@react-email/render";
import { createElement } from "react";
import { EVENT_MATRIX } from "./event-matrix";
import { renderSubject } from "./render-subject";
import type { EmailEventPayload, Recipient } from "./types";
import {
  STATUS_CUSTOMER_TEXT,
  STATUS_LABELS,
  STATUS_COLORS,
  type StatusKey,
} from "@/lib/status-config";
import type { BaseLayoutSettings } from "@/emails/components/base-layout";

// Template registry mapping slugs to components (lazy-loaded)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const TEMPLATE_COMPONENTS: Record<
  string,
  () => Promise<{ default: React.ComponentType<any> }>
> = {
  "anfrage-bestaetigung": () =>
    import("@/emails/templates/anfrage-bestaetigung"),
  "status-update": () => import("@/emails/templates/status-update"),
  "angebot-versendet": () => import("@/emails/templates/angebot-versendet"),
  zahlungslink: () => import("@/emails/templates/zahlungslink"),
  "zahlung-bestaetigung": () =>
    import("@/emails/templates/zahlung-bestaetigung"),
  stornierung: () => import("@/emails/templates/stornierung"),
  rueckfrage: () => import("@/emails/templates/rueckfrage"),
  reklamation: () => import("@/emails/templates/reklamation"),
  rueckerstattung: () => import("@/emails/templates/rueckerstattung"),
  "dispute-warnung": () => import("@/emails/templates/dispute-warnung"),
  "passwort-reset": () => import("@/emails/templates/passwort-reset"),
  freitext: () => import("@/emails/templates/freitext"),
  "neue-anfrage": () => import("@/emails/staff/neue-anfrage"),
  "status-benachrichtigung": () =>
    import("@/emails/staff/status-benachrichtigung"),
};

export const TEMPLATE_SLUGS = Object.keys(TEMPLATE_COMPONENTS);

interface RenderResult {
  html: string;
  plainText: string;
  subject: string;
}

/**
 * Renders an email template for a given event.
 *
 * @param templateSlug - The template to render (e.g. 'anfrage-bestaetigung')
 * @param payload - The email event payload with anfrage data
 * @param recipient - 'kunde' or 'staff'
 * @param settings - Settings Global data (firmenname, adresse, etc.)
 * @returns Rendered HTML, plain text, and subject line
 */
export async function renderEmailForEvent(
  templateSlug: string,
  payload: EmailEventPayload,
  recipient: Recipient,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  settings: Record<string, any>,
): Promise<RenderResult> {
  const loader = TEMPLATE_COMPONENTS[templateSlug];
  if (!loader) throw new Error(`Unknown template: ${templateSlug}`);

  const mod = await loader();
  const Component = mod.default;

  // Build URLs
  const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000";
  const logoUrl = settings.pdf_logo?.filename
    ? `${baseUrl}/api/media/${settings.pdf_logo.filename}`
    : undefined;
  const anfrageUrl = `${baseUrl}/dashboard/anfragen/${payload.anfrageId}`;
  const adminUrl = `${baseUrl}/admin/collections/anfragen/${payload.anfrageId}`;

  // Build settings object for BaseLayout
  const layoutSettings: BaseLayoutSettings = {
    firmenname: settings.firmenname || "",
    adresse_strasse: settings.adresse_strasse || "",
    adresse_hausnummer: settings.adresse_hausnummer || "",
    adresse_plz: settings.adresse_plz || "",
    adresse_ort: settings.adresse_ort || "",
    telefon: settings.telefon || "",
    email: settings.email || "",
  };

  // Build template-specific props
  const templateProps = buildTemplateProps(
    templateSlug,
    payload,
    recipient,
    layoutSettings,
    { baseUrl, logoUrl, anfrageUrl, adminUrl },
  );

  const element = createElement(Component, templateProps);
  const html = await render(element);
  const plainText = await render(element, { plainText: true });

  // Build subject line
  const eventConfig = EVENT_MATRIX[payload.eventType];
  const subjectTemplate = eventConfig?.betreff?.[recipient] || "";
  const subject = renderSubject(subjectTemplate, {
    anfrage_nummer: payload.anfrageNummer,
    status_text:
      STATUS_CUSTOMER_TEXT?.[payload.status as StatusKey] || payload.status,
    kunde_name: `${payload.kunde.vorname} ${payload.kunde.nachname}`,
    template_name: templateSlug,
  });

  return { html, plainText, subject };
}

/**
 * Maps payload data to each template's expected prop shape.
 */
function buildTemplateProps(
  templateSlug: string,
  payload: EmailEventPayload,
  _recipient: Recipient,
  settings: BaseLayoutSettings,
  urls: {
    baseUrl: string;
    logoUrl?: string;
    anfrageUrl: string;
    adminUrl: string;
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Record<string, any> {
  const { kunde, anfrageNummer, produkte, gesamtbetragCents } = payload;
  const produkteFormatted = produkte.map((p) => ({
    name: p.produkttyp,
    stueckzahl: p.stueckzahl,
    einzelpreis: p.einzelpreis,
  }));

  const baseProps = {
    settings,
    logoUrl: urls.logoUrl,
  };

  switch (templateSlug) {
    case "anfrage-bestaetigung":
      return {
        ...baseProps,
        anfrageNummer,
        kunde,
        produkte: produkteFormatted,
        gesamtbetragCents,
        anfrageUrl: urls.anfrageUrl,
      };

    case "status-update": {
      const statusKey = payload.status as StatusKey;
      return {
        ...baseProps,
        anfrageNummer,
        kunde,
        statusLabel: STATUS_LABELS[statusKey] || payload.status,
        statusColor: STATUS_COLORS[statusKey] || "#6b7280",
        statusText: STATUS_CUSTOMER_TEXT[statusKey] || "",
        anfrageUrl: urls.anfrageUrl,
      };
    }

    case "angebot-versendet":
      return {
        ...baseProps,
        anfrageNummer,
        kunde,
        produkte: produkteFormatted,
        gesamtbetragCents,
        gueltigBis: (payload.zusatzDaten?.gueltigBis as string) || "30 Tage",
        angebotUrl: `${urls.baseUrl}/angebot/${payload.anfrageId}`,
      };

    case "zahlungslink":
      return {
        ...baseProps,
        anfrageNummer,
        kunde,
        gesamtbetragCents,
        zahlungsUrl:
          (payload.zusatzDaten?.zahlungsUrl as string) || urls.anfrageUrl,
        ablaufDatum: (payload.zusatzDaten?.ablaufDatum as string) || "7 Tage",
      };

    case "zahlung-bestaetigung":
      return {
        ...baseProps,
        anfrageNummer,
        kunde,
        gesamtbetragCents,
        produkte: produkteFormatted,
        anfrageUrl: urls.anfrageUrl,
      };

    case "stornierung":
      return {
        ...baseProps,
        anfrageNummer,
        kunde,
        grund: payload.zusatzDaten?.grund as string | undefined,
        rueckerstattungInfo: payload.zusatzDaten?.rueckerstattungInfo as
          | string
          | undefined,
      };

    case "rueckfrage":
      return {
        ...baseProps,
        anfrageNummer,
        kunde,
        frageText:
          (payload.zusatzDaten?.frageText as string) ||
          "Bitte kontaktieren Sie uns fuer weitere Details.",
        antwortUrl: urls.anfrageUrl,
      };

    case "reklamation":
      return {
        ...baseProps,
        anfrageNummer,
        kunde,
        anfrageUrl: urls.anfrageUrl,
      };

    case "rueckerstattung":
      return {
        ...baseProps,
        anfrageNummer,
        kunde,
        betragCents:
          (payload.zusatzDaten?.betragCents as number) || gesamtbetragCents,
        methode: (payload.zusatzDaten?.methode as string) || "Bankueberweisung",
      };

    case "dispute-warnung":
      return {
        ...baseProps,
        anfrageNummer,
        disputeId: (payload.zusatzDaten?.dispute_id as string) || "",
        disputeReason:
          (payload.zusatzDaten?.dispute_reason as string) || "unbekannt",
        disputeAmountCents:
          (payload.zusatzDaten?.dispute_amount as number) || gesamtbetragCents,
      };

    case "passwort-reset":
      return {
        ...baseProps,
        resetUrl: payload.resetUrl || "",
      };

    case "freitext":
      return {
        ...baseProps,
        anfrageNummer,
        kunde,
        freitext: (payload.zusatzDaten?.freitext as string) || "",
        subject: (payload.zusatzDaten?.subject as string) || "",
        anfrageUrl: urls.anfrageUrl,
      };

    // Staff templates
    case "neue-anfrage":
      return {
        ...baseProps,
        anfrageNummer,
        kundeName: `${kunde.vorname} ${kunde.nachname}`,
        produkte: produkteFormatted,
        gesamtbetragCents,
        adminUrl: urls.adminUrl,
      };

    case "status-benachrichtigung": {
      const statusKey = payload.status as StatusKey;
      return {
        ...baseProps,
        anfrageNummer,
        statusLabel: STATUS_LABELS[statusKey] || payload.status,
        statusAlt: payload.statusAlt
          ? STATUS_LABELS[payload.statusAlt as StatusKey] || payload.statusAlt
          : undefined,
        kundeName: `${kunde.vorname} ${kunde.nachname}`,
        adminUrl: urls.adminUrl,
      };
    }

    default:
      return baseProps;
  }
}
