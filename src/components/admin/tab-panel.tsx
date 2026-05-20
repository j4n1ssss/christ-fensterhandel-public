"use client";

import React, { useState, useEffect } from "react";
import { StatusTimeline } from "@/components/admin/status-timeline";
import { WebhookTab } from "@/components/admin/webhook-tab";
import { EmailSendModal } from "@/components/admin/email-send-modal";
import {
  shouldShowDetailsTab,
  HERSTELLER_STATUSES,
} from "@/lib/detail-view-helpers";
import { formatCurrency } from "@/lib/format-currency";

const STORAGE_KEY = "anfrage-detail-tab";
const BASE_TABS = ["kontakt", "timeline", "notizen"] as const;
const TAB_LABELS: Record<string, string> = {
  kontakt: "Kontakt",
  timeline: "Timeline",
  notizen: "Notizen",
  details: "Details",
  webhooks: "Webhooks",
};

interface TabPanelProps {
  anfrageId: string;
  status: string;
  statusColor: string;
  doc: Record<string, any>;
  notizen: string;
  onNotizenChange: (value: string) => void;
  onSaveNotizen: () => void;
  savingNotizen: boolean;
  onAnonymize: () => void;
  anonymizing: boolean;
  refreshKey: number;
  userRole: string;
  onEmailSent?: () => void;
}

export function TabPanel({
  anfrageId,
  status,
  statusColor,
  doc,
  notizen,
  onNotizenChange,
  onSaveNotizen,
  savingNotizen,
  onAnonymize,
  anonymizing,
  refreshKey,
  userRole,
  onEmailSent,
}: TabPanelProps) {
  const showDetails = shouldShowDetailsTab(status);
  const availableTabs: string[] = (() => {
    const tabs: string[] = [...BASE_TABS];
    if (showDetails) tabs.push("details");
    if (userRole === "admin") tabs.push("webhooks");
    return tabs;
  })();

  const [activeTab, setActiveTab] = useState(() => {
    if (typeof window !== "undefined") {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      if (stored && availableTabs.includes(stored)) return stored;
    }
    return "kontakt";
  });

  // Revalidate active tab when status changes
  useEffect(() => {
    if (!availableTabs.includes(activeTab)) {
      setActiveTab("kontakt");
      sessionStorage.setItem(STORAGE_KEY, "kontakt");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const switchTab = (tab: string) => {
    setActiveTab(tab);
    sessionStorage.setItem(STORAGE_KEY, tab);
  };

  const kontakt = doc.kontaktdaten || {};

  return (
    <div>
      {/* Tab bar */}
      <div className="tab-panel__bar">
        {availableTabs.map((tab) => (
          <button
            key={tab}
            type="button"
            className={`tab-panel__trigger${activeTab === tab ? " tab-panel__trigger--active" : ""}`}
            onClick={() => switchTab(tab)}
          >
            {TAB_LABELS[tab]}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="tab-panel__content">
        {activeTab === "kontakt" && (
          <KontaktTab
            kontakt={kontakt}
            onAnonymize={onAnonymize}
            anonymizing={anonymizing}
            anfrageId={anfrageId}
            anfrageNummer={doc.anfrage_nummer || ""}
            userRole={userRole}
            onEmailSent={onEmailSent || (() => {})}
          />
        )}
        {activeTab === "timeline" && (
          <StatusTimeline key={refreshKey} anfrageId={anfrageId} />
        )}
        {activeTab === "notizen" && (
          <NotizenTab
            notizen={notizen}
            onNotizenChange={onNotizenChange}
            onSaveNotizen={onSaveNotizen}
            savingNotizen={savingNotizen}
          />
        )}
        {activeTab === "details" && showDetails && (
          <DetailsTab anfrageId={anfrageId} status={status} doc={doc} />
        )}
        {activeTab === "webhooks" && userRole === "admin" && (
          <WebhookTab anfrageId={anfrageId} />
        )}
      </div>
    </div>
  );
}

// --- Kontakt Tab ---

function KontaktTab({
  kontakt,
  onAnonymize,
  anonymizing,
  anfrageId,
  anfrageNummer,
  userRole,
  onEmailSent,
}: {
  kontakt: Record<string, any>;
  onAnonymize: () => void;
  anonymizing: boolean;
  anfrageId: string;
  anfrageNummer: string;
  userRole: string;
  onEmailSent: () => void;
}) {
  const [showEmailModal, setShowEmailModal] = useState(false);

  return (
    <div className="kontakt-tab">
      {/* Name as heading */}
      <div className="kontakt-tab__name">
        {kontakt.vorname} {kontakt.nachname}
      </div>

      {/* Contact rows */}
      <div className="kontakt-tab__contact-rows">
        {kontakt.email && (
          <div>
            <a href={`mailto:${kontakt.email}`} className="link-email">
              {kontakt.email}
            </a>
          </div>
        )}
        {kontakt.telefon && (
          <div className="kontakt-tab__phone">{kontakt.telefon}</div>
        )}
      </div>

      {/* Address (separate section with border-top) */}
      {kontakt.strasse && (
        <div className="kontakt-tab__address">
          {kontakt.strasse}
          <br />
          {kontakt.plz} {kontakt.ort}
        </div>
      )}

      {/* Customer message in styled box */}
      {kontakt.nachricht && (
        <div className="kontakt-tab__message">
          &ldquo;{kontakt.nachricht}&rdquo;
        </div>
      )}

      {/* Action buttons */}
      {(userRole === "admin" || userRole === "mitarbeiter") &&
        kontakt.email && (
          <div className="kontakt-tab__actions">
            <button
              type="button"
              className="btn-ghost"
              onClick={() => setShowEmailModal(true)}
            >
              E-Mail senden
            </button>
          </div>
        )}

      {/* DSGVO separator + link — moved to bottom, very subtle */}
      {kontakt.vorname && kontakt.vorname !== "GELÖSCHT" && (
        <>
          <div className="kontakt-tab__separator" />
          <button
            type="button"
            className="kontakt-tab__dsgvo-link"
            onClick={onAnonymize}
            disabled={anonymizing}
          >
            {anonymizing
              ? "Wird anonymisiert..."
              : "Kundendaten anonymisieren (DSGVO)"}
          </button>
        </>
      )}

      {/* Email modal (unchanged) */}
      {(userRole === "admin" || userRole === "mitarbeiter") &&
        kontakt.email &&
        showEmailModal && (
          <EmailSendModal
            anfrageId={anfrageId}
            anfrageNummer={anfrageNummer}
            kundenEmail={kontakt.email || ""}
            kundenName={`${kontakt.vorname || ""} ${kontakt.nachname || ""}`}
            onClose={() => setShowEmailModal(false)}
            onSent={onEmailSent}
          />
        )}
    </div>
  );
}

// --- Notizen Tab ---

function NotizenTab({
  notizen,
  onNotizenChange,
  onSaveNotizen,
  savingNotizen,
}: {
  notizen: string;
  onNotizenChange: (value: string) => void;
  onSaveNotizen: () => void;
  savingNotizen: boolean;
}) {
  return (
    <div>
      <textarea
        className="form-textarea"
        value={notizen}
        onChange={(e) => onNotizenChange(e.target.value)}
        rows={6}
      />
      <button
        type="button"
        className="btn-save"
        onClick={onSaveNotizen}
        disabled={savingNotizen}
      >
        {savingNotizen ? "Wird gespeichert..." : "Notizen speichern"}
      </button>
    </div>
  );
}

// --- Details Tab ---

function DetailsTab({
  anfrageId,
  status,
  doc,
}: {
  anfrageId: string;
  status: string;
  doc: Record<string, any>;
}) {
  const showHersteller = HERSTELLER_STATUSES.includes(status);
  const showStornierung = status === "storniert";

  const handleEditClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    window.location.href = `/admin/collections/anfragen/${anfrageId}?disableCustomView=true`;
  };

  return (
    <div className="details-tab">
      {/* Hersteller-Infos */}
      {showHersteller && (
        <div>
          <div className="text-section-heading">Hersteller-Infos</div>
          <div className="details-tab__section">
            <DetailField
              label="Bestellnummer"
              value={doc.hersteller_bestellnummer}
            />
            <DetailField
              label="Lieferdatum (erwartet)"
              value={
                doc.lieferdatum_erwartet
                  ? new Date(doc.lieferdatum_erwartet).toLocaleDateString(
                      "de-DE",
                    )
                  : undefined
              }
            />
            <DetailField
              label="Hersteller-Notizen"
              value={doc.hersteller_notizen}
            />
            <DetailField
              label="Hersteller-Antwort"
              value={doc.hersteller_antwort}
            />
          </div>
          <a
            href={`/admin/collections/anfragen/${anfrageId}`}
            className="link-edit"
            onClick={handleEditClick}
          >
            Bearbeiten
          </a>
        </div>
      )}

      {/* Stornierung-Infos */}
      {showStornierung && (
        <div>
          <div className="details-tab__heading--destructive">
            Stornierung-Infos
          </div>
          <div className="details-tab__section">
            <DetailField
              label="Stornierungsgrund"
              value={doc.stornierung_grund}
            />
            <DetailField
              label="Rückerstattungsbetrag"
              value={
                doc.rueckerstattung_betrag != null
                  ? formatCurrency(doc.rueckerstattung_betrag)
                  : undefined
              }
            />
            <DetailField
              label="Rückerstattungsstatus"
              value={doc.rueckerstattung_status}
            />
          </div>
          <a
            href={`/admin/collections/anfragen/${anfrageId}`}
            className="link-edit"
            onClick={handleEditClick}
          >
            Bearbeiten
          </a>
        </div>
      )}
    </div>
  );
}

// --- Detail Field (readonly) ---

function DetailField({
  label,
  value,
}: {
  label: string;
  value?: string | null;
}) {
  if (!value) return null;
  return (
    <div>
      <div className="detail-field__label">{label}</div>
      <div className="detail-field__value">{value}</div>
    </div>
  );
}
