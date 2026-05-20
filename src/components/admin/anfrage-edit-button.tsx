"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useDocumentInfo, useForm } from "@payloadcms/ui";

/**
 * Custom admin component: "Anfragedaten bearbeiten" button.
 * Opens a modal to edit kontaktdaten + gesamtpreis.
 * Shows confirmation dialog before saving.
 * Logs changes to interne_notizen automatically (via beforeChange hook).
 */
export const AnfrageEditButton: React.FC = () => {
  const { id } = useDocumentInfo();
  const { submit } = useForm();
  const [doc, setDoc] = useState<Record<string, any> | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  // Form state for editable fields
  const [formData, setFormData] = useState({
    vorname: "",
    nachname: "",
    email: "",
    telefon: "",
    strasse: "",
    plz: "",
    ort: "",
    gesamtpreis: 0,
  });

  // Load current document data when modal opens
  const loadDoc = useCallback(async () => {
    if (!id) return;
    try {
      const res = await fetch(`/api/anfragen/${id}`);
      if (res.ok) {
        const data = await res.json();
        setDoc(data);
        setFormData({
          vorname: data.kontaktdaten?.vorname || "",
          nachname: data.kontaktdaten?.nachname || "",
          email: data.kontaktdaten?.email || "",
          telefon: data.kontaktdaten?.telefon || "",
          strasse: data.kontaktdaten?.strasse || "",
          plz: data.kontaktdaten?.plz || "",
          ort: data.kontaktdaten?.ort || "",
          gesamtpreis: data.gesamtpreis || 0,
        });
      }
    } catch {
      // ignore
    }
  }, [id]);

  const handleOpenModal = () => {
    loadDoc();
    setShowModal(true);
    setSuccess(false);
  };

  const handleSaveClick = () => {
    setShowConfirm(true);
  };

  const handleConfirmSave = async () => {
    if (!id) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/anfragen/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kontaktdaten: {
            vorname: formData.vorname,
            nachname: formData.nachname,
            email: formData.email,
            telefon: formData.telefon,
            strasse: formData.strasse,
            plz: formData.plz,
            ort: formData.ort,
            nachricht: doc?.kontaktdaten?.nachricht || "",
          },
          gesamtpreis: formData.gesamtpreis,
          version: doc?.version,
        }),
      });

      if (res.status === 409) {
        alert(
          "Diese Anfrage wurde zwischenzeitlich von einem anderen Benutzer geaendert. Bitte laden Sie die Seite neu.",
        );
        return;
      }

      if (res.ok) {
        setSuccess(true);
        setShowConfirm(false);
        setShowModal(false);
        // Reload the page to reflect changes
        window.location.reload();
      }
    } catch {
      // ignore
    } finally {
      setSaving(false);
    }
  };

  const updateField = (field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  if (!id) return null;

  return (
    <>
      <button
        type="button"
        onClick={handleOpenModal}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "6px",
          padding: "8px 16px",
          border: "1px solid var(--theme-elevation-300)",
          borderRadius: "4px",
          background: "var(--theme-elevation-50)",
          color: "var(--theme-elevation-800)",
          cursor: "pointer",
          fontSize: "13px",
          fontWeight: 500,
          marginBottom: "24px",
        }}
      >
        Anfragedaten bearbeiten
      </button>

      {/* Edit Modal */}
      {showModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 10000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(0,0,0,0.5)",
          }}
          onClick={() => setShowModal(false)}
        >
          <div
            style={{
              background: "var(--theme-bg)",
              border: "1px solid var(--theme-elevation-200)",
              borderRadius: "8px",
              padding: "24px",
              width: "100%",
              maxWidth: "520px",
              maxHeight: "90vh",
              overflowY: "auto",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3
              style={{ margin: "0 0 4px", fontSize: "18px", fontWeight: 600 }}
            >
              Anfragedaten bearbeiten
            </h3>
            <p
              style={{
                margin: "0 0 20px",
                fontSize: "13px",
                color: "var(--theme-elevation-500)",
              }}
            >
              Änderungen werden protokolliert und überschreiben die
              Original-Anfragedaten.
            </p>

            {/* Kontaktdaten */}
            <fieldset
              style={{
                border: "1px solid var(--theme-elevation-200)",
                borderRadius: "6px",
                padding: "16px",
                margin: "0 0 16px",
              }}
            >
              <legend
                style={{ fontSize: "14px", fontWeight: 600, padding: "0 8px" }}
              >
                Kontaktdaten
              </legend>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "12px",
                }}
              >
                <FieldInput
                  label="Vorname"
                  value={formData.vorname}
                  onChange={(v) => updateField("vorname", v)}
                />
                <FieldInput
                  label="Nachname"
                  value={formData.nachname}
                  onChange={(v) => updateField("nachname", v)}
                />
                <FieldInput
                  label="E-Mail"
                  value={formData.email}
                  onChange={(v) => updateField("email", v)}
                  type="email"
                />
                <FieldInput
                  label="Telefon"
                  value={formData.telefon}
                  onChange={(v) => updateField("telefon", v)}
                />
                <FieldInput
                  label="Straße + Nr."
                  value={formData.strasse}
                  onChange={(v) => updateField("strasse", v)}
                  style={{ gridColumn: "1 / -1" }}
                />
                <FieldInput
                  label="PLZ"
                  value={formData.plz}
                  onChange={(v) => updateField("plz", v)}
                />
                <FieldInput
                  label="Ort"
                  value={formData.ort}
                  onChange={(v) => updateField("ort", v)}
                />
              </div>
            </fieldset>

            {/* Gesamtpreis */}
            <fieldset
              style={{
                border: "1px solid var(--theme-elevation-200)",
                borderRadius: "6px",
                padding: "16px",
                margin: "0 0 20px",
              }}
            >
              <legend
                style={{ fontSize: "14px", fontWeight: 600, padding: "0 8px" }}
              >
                Preis
              </legend>
              <FieldInput
                label="Gesamtpreis (Cent)"
                value={String(formData.gesamtpreis)}
                onChange={(v) =>
                  updateField("gesamtpreis", Math.round(parseFloat(v) || 0))
                }
                type="number"
              />
            </fieldset>

            {/* Actions */}
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "8px",
              }}
            >
              <button
                type="button"
                onClick={() => setShowModal(false)}
                style={{
                  padding: "8px 16px",
                  border: "1px solid var(--theme-elevation-300)",
                  borderRadius: "4px",
                  background: "transparent",
                  cursor: "pointer",
                  fontSize: "13px",
                }}
              >
                Abbrechen
              </button>
              <button
                type="button"
                onClick={handleSaveClick}
                style={{
                  padding: "8px 16px",
                  border: "none",
                  borderRadius: "4px",
                  background: "var(--theme-success-500, #16a34a)",
                  color: "#fff",
                  cursor: "pointer",
                  fontSize: "13px",
                  fontWeight: 600,
                }}
              >
                Änderungen speichern
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      {showConfirm && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 10001,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(0,0,0,0.6)",
          }}
        >
          <div
            style={{
              background: "var(--theme-bg)",
              border: "2px solid var(--theme-error-500, #dc2626)",
              borderRadius: "8px",
              padding: "24px",
              width: "100%",
              maxWidth: "420px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                marginBottom: "12px",
              }}
            >
              <span style={{ fontSize: "24px" }}>&#9888;</span>
              <h3
                style={{
                  margin: 0,
                  fontSize: "16px",
                  fontWeight: 700,
                  color: "var(--theme-error-500, #dc2626)",
                }}
              >
                Achtung: Anfragedaten ändern
              </h3>
            </div>
            <p
              style={{
                fontSize: "13px",
                lineHeight: 1.5,
                margin: "0 0 8px",
                color: "var(--theme-elevation-600)",
              }}
            >
              Sie sind dabei, die <strong>Original-Anfragedaten</strong> dieses
              Kunden manuell zu ändern.
            </p>
            <ul
              style={{
                fontSize: "13px",
                lineHeight: 1.6,
                margin: "0 0 16px",
                paddingLeft: "18px",
                color: "var(--theme-elevation-600)",
              }}
            >
              <li>
                Kontaktdaten und Preise werden{" "}
                <strong>unwiderruflich überschrieben</strong>
              </li>
              <li>
                Die Änderung wird mit Zeitstempel und Benutzer in den{" "}
                <strong>Internen Notizen</strong> protokolliert
              </li>
              <li>
                Der Kunde wird <strong>nicht automatisch benachrichtigt</strong>
              </li>
            </ul>
            <p
              style={{
                fontSize: "13px",
                fontWeight: 600,
                margin: "0 0 20px",
                color: "var(--theme-elevation-800)",
              }}
            >
              Sind Sie sicher, dass Sie fortfahren möchten?
            </p>
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "8px",
              }}
            >
              <button
                type="button"
                onClick={() => setShowConfirm(false)}
                style={{
                  padding: "8px 16px",
                  border: "1px solid var(--theme-elevation-300)",
                  borderRadius: "4px",
                  background: "transparent",
                  cursor: "pointer",
                  fontSize: "13px",
                }}
              >
                Abbrechen
              </button>
              <button
                type="button"
                onClick={handleConfirmSave}
                disabled={saving}
                style={{
                  padding: "8px 16px",
                  border: "none",
                  borderRadius: "4px",
                  background: "var(--theme-error-500, #dc2626)",
                  color: "#fff",
                  cursor: "pointer",
                  fontSize: "13px",
                  fontWeight: 600,
                  opacity: saving ? 0.6 : 1,
                }}
              >
                {saving ? "Wird gespeichert..." : "Ja, Daten ändern"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

/** Simple styled input field for the modal */
function FieldInput({
  label,
  value,
  onChange,
  type = "text",
  style,
}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
  type?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div style={style}>
      <label
        style={{
          display: "block",
          fontSize: "12px",
          fontWeight: 500,
          marginBottom: "4px",
          color: "var(--theme-elevation-600)",
        }}
      >
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: "100%",
          padding: "6px 10px",
          border: "1px solid var(--theme-elevation-300)",
          borderRadius: "4px",
          fontSize: "14px",
          background: "var(--theme-input-bg, var(--theme-bg))",
          color: "var(--theme-elevation-800)",
        }}
      />
    </div>
  );
}

export default AnfrageEditButton;
