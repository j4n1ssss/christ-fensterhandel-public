"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useAuth, toast } from "@payloadcms/ui";
import { EVENT_MATRIX } from "@/lib/email/event-matrix";
import type { EmailEventType } from "@/lib/email/types";

const STORAGE_KEY = "settings-tab";

const TABS = [
  { key: "firmendaten", label: "Firmendaten" },
  { key: "steuer", label: "Steuer" },
  { key: "stripe", label: "Stripe" },
  { key: "dokumente", label: "Dokumente" },
  { key: "email", label: "E-Mail" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

interface SettingsData {
  // Firmendaten
  firmenname?: string;
  adresse_strasse?: string;
  adresse_hausnummer?: string;
  adresse_plz?: string;
  adresse_ort?: string;
  telefon?: string;
  email?: string;
  steuernummer?: string;
  ust_id?: string;
  bank_iban?: string;
  bank_bic?: string;
  bank_name?: string;
  // Steuer
  mwst_satz?: number;
  preisanzeige?: string;
  // Stripe
  stripe_zahlungslink_ablauf_stunden?: number;
  stripe_waehrung?: string;
  // Dokumente
  angebots_gueltigkeit_tage?: number;
  widerrufsbelehrung?: string;
  agb_link?: string;
  agb_pdf?: { id: string; filename?: string } | string | null;
  pdf_logo?: { id: string; filename?: string } | string | null;
  // E-Mail
  email_absender_name?: string;
  email_reply_to?: string;
  email_signatur?: string;
  benachrichtigungs_emails?: string;
  email_event_toggles?: Record<string, boolean>;
  // Meta
  zuletzt_aktualisiert_am?: string;
  zuletzt_aktualisiert_von?:
    | { id: string; email?: string; rolle?: string }
    | string
    | null;
}

function formatLastUpdated(dateStr?: string): string {
  if (!dateStr) return "";
  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(dateStr));
}

function getUpdatedByName(
  user?: SettingsData["zuletzt_aktualisiert_von"],
): string {
  if (!user) return "";
  if (typeof user === "string") return user;
  return user.email || user.id || "";
}

function getMediaDisplay(
  field: { id: string; filename?: string } | string | null | undefined,
): { id: string; filename: string } | null {
  if (!field) return null;
  if (typeof field === "string") return { id: field, filename: field };
  return { id: field.id, filename: field.filename || field.id };
}

export default function SettingsPage() {
  const { user } = useAuth();
  const isAdmin = user?.rolle === "admin";

  const [activeTab, setActiveTab] = useState<TabKey>(() => {
    if (typeof window !== "undefined") {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      if (stored && TABS.some((t) => t.key === stored)) return stored as TabKey;
    }
    return "firmendaten";
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [settings, setSettings] = useState<SettingsData>({});

  const loadSettings = useCallback(async () => {
    try {
      const res = await fetch("/api/globals/settings?depth=1", {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setSettings(data);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const switchTab = (tab: TabKey) => {
    setActiveTab(tab);
    sessionStorage.setItem(STORAGE_KEY, tab);
  };

  const updateField = (name: string, value: string | number) => {
    setSettings((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/globals/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setSettings(data);
        toast.success("Einstellungen gespeichert");
      } else {
        const errData = await res.json().catch(() => ({}));
        setError(
          errData.errors?.[0]?.message ||
            "Fehler beim Speichern. Bitte versuchen Sie es erneut.",
        );
      }
    } catch {
      setError("Fehler beim Speichern. Bitte versuchen Sie es erneut.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="detail-view__loading">
        Einstellungen werden geladen...
      </div>
    );
  }

  return (
    <div className="admin-content">
      <h1 className="text-display">Einstellungen</h1>

      {settings.zuletzt_aktualisiert_am && (
        <p className="text-caption">
          Zuletzt aktualisiert am{" "}
          {formatLastUpdated(settings.zuletzt_aktualisiert_am)} von{" "}
          {getUpdatedByName(settings.zuletzt_aktualisiert_von)}
        </p>
      )}

      {!isAdmin && (
        <div
          style={{
            padding: "12px 16px",
            background: "var(--theme-elevation-50)",
            border: "1px solid var(--theme-elevation-200)",
            borderRadius: "6px",
            marginTop: "16px",
            marginBottom: "16px",
          }}
        >
          <p className="text-body-muted">
            Nur Administratoren koennen Einstellungen aendern.
          </p>
        </div>
      )}

      {/* Tab bar */}
      <div className="tab-panel__bar">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            className={`tab-panel__trigger ${activeTab === tab.key ? "tab-panel__trigger--active" : ""}`}
            onClick={() => switchTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="tab-panel__content">
        {activeTab === "firmendaten" && (
          <FirmendatenTab
            settings={settings}
            onChange={updateField}
            disabled={!isAdmin}
          />
        )}
        {activeTab === "steuer" && (
          <SteuerTab
            settings={settings}
            onChange={updateField}
            disabled={!isAdmin}
          />
        )}
        {activeTab === "stripe" && (
          <StripeTab
            settings={settings}
            onChange={updateField}
            disabled={!isAdmin}
          />
        )}
        {activeTab === "dokumente" && (
          <DokumenteTab
            settings={settings}
            onChange={updateField}
            disabled={!isAdmin}
          />
        )}
        {activeTab === "email" && (
          <EmailTab
            settings={settings}
            onChange={updateField}
            disabled={!isAdmin}
            onSettingsChange={setSettings}
          />
        )}

        {error && <div className="error-message">{error}</div>}

        {isAdmin && (
          <button
            type="button"
            className="btn-save"
            onClick={handleSave}
            disabled={saving}
            style={{ opacity: saving ? 0.6 : 1 }}
          >
            {saving ? "Wird gespeichert..." : "Einstellungen speichern"}
          </button>
        )}
      </div>
    </div>
  );
}

// --- Field components ---

function FormField({
  label,
  name,
  value,
  onChange,
  disabled,
  type = "text",
  suffix,
  rows,
  required,
}: {
  label: string;
  name: string;
  value: string | number | undefined;
  onChange: (name: string, value: string | number) => void;
  disabled: boolean;
  type?: "text" | "email" | "number" | "textarea" | "select";
  suffix?: string;
  rows?: number;
  required?: boolean;
  options?: { label: string; value: string }[];
}) {
  const id = `settings-${name}`;

  if (type === "textarea") {
    return (
      <div className="form-group">
        <label htmlFor={id} className="text-label">
          {label}
          {required && " *"}
        </label>
        <textarea
          id={id}
          className="form-textarea"
          value={(value as string) || ""}
          onChange={(e) => onChange(name, e.target.value)}
          disabled={disabled}
          rows={rows || 4}
          aria-required={required}
        />
      </div>
    );
  }

  return (
    <div className="form-group">
      <label htmlFor={id} className="text-label">
        {label}
        {required && " *"}
      </label>
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <input
          id={id}
          className="form-input"
          type={type === "number" ? "number" : type}
          value={value ?? ""}
          onChange={(e) =>
            onChange(
              name,
              type === "number"
                ? e.target.value === ""
                  ? ""
                  : Number(e.target.value)
                : e.target.value,
            )
          }
          disabled={disabled}
          aria-required={required}
        />
        {suffix && (
          <span className="text-body-muted" style={{ whiteSpace: "nowrap" }}>
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
}

function SelectField({
  label,
  name,
  value,
  onChange,
  disabled,
  options,
}: {
  label: string;
  name: string;
  value: string | undefined;
  onChange: (name: string, value: string) => void;
  disabled: boolean;
  options: { label: string; value: string }[];
}) {
  const id = `settings-${name}`;
  return (
    <div className="form-group">
      <label htmlFor={id} className="text-label">
        {label}
      </label>
      <select
        id={id}
        className="form-select"
        value={value || ""}
        onChange={(e) => onChange(name, e.target.value)}
        disabled={disabled}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

// --- Tab components ---

interface TabProps {
  settings: SettingsData;
  onChange: (name: string, value: string | number) => void;
  disabled: boolean;
}

function FirmendatenTab({ settings, onChange, disabled }: TabProps) {
  return (
    <div>
      <div className="text-section-heading">Firmenanschrift</div>

      <FormField
        label="Firmenname"
        name="firmenname"
        value={settings.firmenname}
        onChange={onChange}
        disabled={disabled}
      />

      <div className="form-row-grid">
        <FormField
          label="Straße"
          name="adresse_strasse"
          value={settings.adresse_strasse}
          onChange={onChange}
          disabled={disabled}
        />
        <FormField
          label="Hausnummer"
          name="adresse_hausnummer"
          value={settings.adresse_hausnummer}
          onChange={onChange}
          disabled={disabled}
        />
      </div>

      <div className="form-row-grid">
        <FormField
          label="PLZ"
          name="adresse_plz"
          value={settings.adresse_plz}
          onChange={onChange}
          disabled={disabled}
        />
        <FormField
          label="Ort"
          name="adresse_ort"
          value={settings.adresse_ort}
          onChange={onChange}
          disabled={disabled}
        />
      </div>

      <FormField
        label="Telefon"
        name="telefon"
        value={settings.telefon}
        onChange={onChange}
        disabled={disabled}
      />

      <FormField
        label="E-Mail"
        name="email"
        value={settings.email}
        onChange={onChange}
        disabled={disabled}
        type="email"
      />

      <div className="text-section-heading" style={{ marginTop: "24px" }}>
        Steuerdaten
      </div>

      <FormField
        label="Steuernummer"
        name="steuernummer"
        value={settings.steuernummer}
        onChange={onChange}
        disabled={disabled}
      />

      <FormField
        label="USt-IdNr."
        name="ust_id"
        value={settings.ust_id}
        onChange={onChange}
        disabled={disabled}
      />

      <div className="text-section-heading" style={{ marginTop: "24px" }}>
        Bankverbindung
      </div>
      <p className="text-body-muted">
        Optional -- Stripe ist primaeres Zahlungsmittel
      </p>

      <div className="form-row-grid">
        <FormField
          label="IBAN"
          name="bank_iban"
          value={settings.bank_iban}
          onChange={onChange}
          disabled={disabled}
        />
        <FormField
          label="BIC"
          name="bank_bic"
          value={settings.bank_bic}
          onChange={onChange}
          disabled={disabled}
        />
      </div>

      <FormField
        label="Bank-Name"
        name="bank_name"
        value={settings.bank_name}
        onChange={onChange}
        disabled={disabled}
      />
    </div>
  );
}

function SteuerTab({ settings, onChange, disabled }: TabProps) {
  return (
    <div>
      <div className="text-section-heading">MwSt-Konfiguration</div>

      <FormField
        label="MwSt-Satz"
        name="mwst_satz"
        value={settings.mwst_satz}
        onChange={onChange}
        disabled={disabled}
        type="number"
        suffix="%"
        required
      />
      <p className="text-body-muted">
        Wird für alle Preisberechnungen, PDFs und Stripe-Zahlungen verwendet
      </p>

      <SelectField
        label="Preisanzeige"
        name="preisanzeige"
        value={settings.preisanzeige}
        onChange={onChange}
        disabled={disabled}
        options={[
          { label: "Brutto (inkl. MwSt)", value: "brutto" },
          { label: "Netto (zzgl. MwSt)", value: "netto" },
        ]}
      />
    </div>
  );
}

function StripeTab({ settings, onChange, disabled }: TabProps) {
  return (
    <div>
      <div className="text-section-heading">Zahlungseinstellungen</div>

      <FormField
        label="Zahlungslink-Ablaufzeit"
        name="stripe_zahlungslink_ablauf_stunden"
        value={settings.stripe_zahlungslink_ablauf_stunden}
        onChange={onChange}
        disabled={disabled}
        type="number"
        suffix="Stunden"
      />

      <SelectField
        label="Waehrung"
        name="stripe_waehrung"
        value={settings.stripe_waehrung}
        onChange={onChange}
        disabled={disabled}
        options={[
          { label: "EUR", value: "eur" },
          { label: "USD", value: "usd" },
          { label: "PYG", value: "pyg" },
        ]}
      />

      <div
        style={{
          padding: "12px 16px",
          background: "var(--theme-elevation-50)",
          border: "1px solid var(--theme-elevation-200)",
          borderRadius: "6px",
          marginTop: "16px",
        }}
      >
        <p className="text-body-muted">
          API-Keys werden über Umgebungsvariablen (.env) konfiguriert und sind
          hier aus Sicherheitsgruenden nicht sichtbar.
        </p>
      </div>
    </div>
  );
}

function DokumenteTab({ settings, onChange, disabled }: TabProps) {
  const agbPdf = getMediaDisplay(settings.agb_pdf);
  const pdfLogo = getMediaDisplay(settings.pdf_logo);

  return (
    <div>
      <div className="text-section-heading">Angebots-Einstellungen</div>

      <FormField
        label="Angebots-Gültigkeit"
        name="angebots_gueltigkeit_tage"
        value={settings.angebots_gueltigkeit_tage}
        onChange={onChange}
        disabled={disabled}
        type="number"
        suffix="Tage"
      />

      <div className="text-section-heading" style={{ marginTop: "24px" }}>
        Rechtliches
      </div>

      <FormField
        label="Widerrufsbelehrung"
        name="widerrufsbelehrung"
        value={settings.widerrufsbelehrung}
        onChange={onChange}
        disabled={disabled}
        type="textarea"
        rows={6}
      />

      <FormField
        label="AGB-Link"
        name="agb_link"
        value={settings.agb_link}
        onChange={onChange}
        disabled={disabled}
      />

      <div className="form-group">
        <span className="text-label">AGB als PDF</span>
        {agbPdf ? (
          <p className="text-body-muted">
            Aktuelle Datei:{" "}
            <a
              href={`/admin/collections/media/${agbPdf.id}`}
              style={{ color: "#3b82f6" }}
            >
              {agbPdf.filename}
            </a>
          </p>
        ) : (
          <p className="text-body-muted">
            Noch keine Datei hochgeladen. Bitte über die{" "}
            <a href="/admin/collections/media" style={{ color: "#3b82f6" }}>
              Medien-Verwaltung
            </a>{" "}
            hochladen.
          </p>
        )}
      </div>

      <div className="form-group">
        <span className="text-label">Logo für PDFs</span>
        {pdfLogo ? (
          <p className="text-body-muted">
            Aktuelle Datei:{" "}
            <a
              href={`/admin/collections/media/${pdfLogo.id}`}
              style={{ color: "#3b82f6" }}
            >
              {pdfLogo.filename}
            </a>
          </p>
        ) : (
          <p className="text-body-muted">
            Noch keine Datei hochgeladen. Bitte über die{" "}
            <a href="/admin/collections/media" style={{ color: "#3b82f6" }}>
              Medien-Verwaltung
            </a>{" "}
            hochladen.
          </p>
        )}
      </div>
    </div>
  );
}

// --- Event labels for human-readable display ---

const EVENT_LABELS: Record<string, string> = {
  neue_anfrage: "Neue Anfrage",
  in_bearbeitung: "In Bearbeitung",
  angebot_versendet: "Angebot versendet",
  bestaetigt: "Bestätigt",
  zahlungslink_versendet: "Zahlungslink versendet",
  bezahlt: "Bezahlt",
  an_hersteller: "An Hersteller",
  hersteller_bestaetigt: "Hersteller bestätigt",
  hersteller_bestaetigt_mit_vorbehalt: "Hersteller bestätigt (Vorbehalt)",
  in_produktion: "In Produktion",
  hersteller_problem: "Hersteller-Problem",
  versandbereit: "Versandbereit",
  geliefert: "Geliefert",
  abgeschlossen: "Abgeschlossen",
  storniert: "Storniert",
  rueckfrage: "Rückfrage",
  zahlungsproblem: "Zahlungsproblem",
  reklamation: "Reklamation",
  kundenantwort: "Kundenantwort",
  test_preview: "Test-Vorschau",
};

interface EmailTabProps extends TabProps {
  onSettingsChange: React.Dispatch<React.SetStateAction<SettingsData>>;
}

function EmailTab({
  settings,
  onChange,
  disabled,
  onSettingsChange,
}: EmailTabProps) {
  const toggles = settings.email_event_toggles || {};
  const eventTypes = Object.keys(EVENT_MATRIX) as EmailEventType[];

  const updateToggle = (key: string, checked: boolean) => {
    onSettingsChange((prev) => ({
      ...prev,
      email_event_toggles: {
        ...prev.email_event_toggles,
        [key]: checked,
      },
    }));
  };

  const setAllForRecipient = (recipient: "kunde" | "staff", value: boolean) => {
    onSettingsChange((prev) => {
      const newToggles = { ...prev.email_event_toggles };
      for (const eventType of eventTypes) {
        const config = EVENT_MATRIX[eventType];
        if (config.empfaenger.includes(recipient)) {
          newToggles[`${eventType}_${recipient}`] = value;
        }
      }
      return { ...prev, email_event_toggles: newToggles };
    });
  };

  const isToggleEnabled = (eventType: string, recipient: string): boolean => {
    const key = `${eventType}_${recipient}`;
    // Default: enabled (true) unless explicitly set to false
    return toggles[key] !== false;
  };

  return (
    <div>
      <div className="text-section-heading">E-Mail-Konfiguration</div>

      <FormField
        label="Absendername"
        name="email_absender_name"
        value={settings.email_absender_name}
        onChange={onChange}
        disabled={disabled}
      />

      <FormField
        label="Antwort-Adresse (Reply-To)"
        name="email_reply_to"
        value={settings.email_reply_to}
        onChange={onChange}
        disabled={disabled}
        type="email"
      />

      <FormField
        label="E-Mail-Signatur"
        name="email_signatur"
        value={settings.email_signatur}
        onChange={onChange}
        disabled={disabled}
        type="textarea"
        rows={4}
      />

      <div className="text-section-heading" style={{ marginTop: "24px" }}>
        Mitarbeiter-Benachrichtigungen
      </div>

      <div className="form-group">
        <label
          htmlFor="settings-benachrichtigungs_emails"
          className="text-label"
        >
          Benachrichtigungs-E-Mails (Mitarbeiter)
        </label>
        <textarea
          id="settings-benachrichtigungs_emails"
          className="form-textarea"
          value={settings.benachrichtigungs_emails || ""}
          onChange={(e) => onChange("benachrichtigungs_emails", e.target.value)}
          disabled={disabled}
          rows={3}
          placeholder="admin@example.com, mitarbeiter@example.com"
        />
        <p className="text-caption" style={{ marginTop: "4px" }}>
          Komma-getrennte E-Mail-Adressen für Mitarbeiter-Benachrichtigungen
        </p>
      </div>

      <div className="text-section-heading" style={{ marginTop: "24px" }}>
        E-Mail-Benachrichtigungen
      </div>

      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          fontSize: "13px",
          marginTop: "8px",
        }}
      >
        <thead>
          <tr
            style={{
              borderBottom: "2px solid var(--theme-elevation-200)",
            }}
          >
            <th
              style={{
                textAlign: "left",
                padding: "8px 12px",
                fontWeight: 600,
              }}
            >
              Event
            </th>
            <th style={{ textAlign: "center", padding: "8px 12px" }}>
              <div style={{ fontWeight: 600 }}>Kunde</div>
              {!disabled && (
                <div style={{ fontSize: "12px", marginTop: "2px" }}>
                  <button
                    type="button"
                    onClick={() => setAllForRecipient("kunde", true)}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#3b82f6",
                      cursor: "pointer",
                      fontSize: "12px",
                      padding: 0,
                    }}
                  >
                    Alle aktivieren
                  </button>
                  {" | "}
                  <button
                    type="button"
                    onClick={() => setAllForRecipient("kunde", false)}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#3b82f6",
                      cursor: "pointer",
                      fontSize: "12px",
                      padding: 0,
                    }}
                  >
                    Alle deaktivieren
                  </button>
                </div>
              )}
            </th>
            <th style={{ textAlign: "center", padding: "8px 12px" }}>
              <div style={{ fontWeight: 600 }}>Mitarbeiter</div>
              {!disabled && (
                <div style={{ fontSize: "12px", marginTop: "2px" }}>
                  <button
                    type="button"
                    onClick={() => setAllForRecipient("staff", true)}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#3b82f6",
                      cursor: "pointer",
                      fontSize: "12px",
                      padding: 0,
                    }}
                  >
                    Alle aktivieren
                  </button>
                  {" | "}
                  <button
                    type="button"
                    onClick={() => setAllForRecipient("staff", false)}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#3b82f6",
                      cursor: "pointer",
                      fontSize: "12px",
                      padding: 0,
                    }}
                  >
                    Alle deaktivieren
                  </button>
                </div>
              )}
            </th>
          </tr>
        </thead>
        <tbody>
          {eventTypes
            .filter((et) => et !== "test_preview")
            .map((eventType) => {
              const config = EVENT_MATRIX[eventType];
              const hasKunde = config.empfaenger.includes("kunde");
              const hasStaff = config.empfaenger.includes("staff");

              return (
                <tr
                  key={eventType}
                  style={{
                    borderBottom: "1px solid var(--theme-elevation-200)",
                  }}
                >
                  <td style={{ padding: "8px 12px" }}>
                    {EVENT_LABELS[eventType] || eventType}
                  </td>
                  <td style={{ textAlign: "center", padding: "8px 12px" }}>
                    <input
                      type="checkbox"
                      checked={hasKunde && isToggleEnabled(eventType, "kunde")}
                      onChange={(e) =>
                        updateToggle(`${eventType}_kunde`, e.target.checked)
                      }
                      disabled={disabled || !hasKunde}
                      style={{
                        cursor:
                          disabled || !hasKunde ? "not-allowed" : "pointer",
                      }}
                    />
                  </td>
                  <td style={{ textAlign: "center", padding: "8px 12px" }}>
                    <input
                      type="checkbox"
                      checked={hasStaff && isToggleEnabled(eventType, "staff")}
                      onChange={(e) =>
                        updateToggle(`${eventType}_staff`, e.target.checked)
                      }
                      disabled={disabled || !hasStaff}
                      style={{
                        cursor:
                          disabled || !hasStaff ? "not-allowed" : "pointer",
                      }}
                    />
                  </td>
                </tr>
              );
            })}
        </tbody>
      </table>
    </div>
  );
}
