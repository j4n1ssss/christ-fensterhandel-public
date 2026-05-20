"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useDocumentInfo, toast, useAuth } from "@payloadcms/ui";
import { getStatusColor } from "@/lib/status-config";
import { AttentionBar } from "@/components/admin/attention-bar";
import { Splitbutton } from "@/components/admin/splitbutton";
import { ProductCard } from "@/components/admin/product-card";
import { TabPanel } from "@/components/admin/tab-panel";
import { DokumentePanel } from "@/components/admin/dokumente-panel";
import { ZahlungsPanel } from "@/components/admin/zahlungs-panel";
import { AngebotsModal } from "@/components/admin/angebots-modal";

export default function AnfrageDetailView() {
  const { id } = useDocumentInfo();
  const { user } = useAuth();
  const userRole = (user as any)?.rolle || "";
  const [doc, setDoc] = useState<Record<string, any> | null>(null);
  const [loading, setLoading] = useState(true);
  const [notizen, setNotizen] = useState("");
  const [savingNotizen, setSavingNotizen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [anonymizing, setAnonymizing] = useState(false);
  const [isConflict, setIsConflict] = useState(false);
  const [showAngebotsModal, setShowAngebotsModal] = useState(false);
  const [angebotInfo, setAngebotInfo] = useState<{
    lastBrutto?: number;
    nextVersion: number;
  }>({ nextVersion: 1 });

  const loadDoc = useCallback(async () => {
    if (!id) return;
    try {
      const res = await fetch(`/api/anfragen/${id}?depth=1`, {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setDoc(data);
        setNotizen(data.interne_notizen || "");
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadDoc();
  }, [loadDoc, refreshKey]);

  const handleStatusChanged = () => {
    setRefreshKey((k) => k + 1);
  };

  // Load Angebots-Info for modal pre-fill (latest version + brutto)
  useEffect(() => {
    if (!id) return;
    fetch(
      `/api/angebote?where[anfrage][equals]=${id}&sort=-version&limit=1&depth=0`,
      { credentials: "include" },
    )
      .then((res) => (res.ok ? res.json() : { docs: [] }))
      .then((data) => {
        const latest = data.docs?.[0];
        if (latest) {
          setAngebotInfo({
            lastBrutto: latest.betrag_brutto_cents,
            nextVersion: (latest.version || 1) + 1,
          });
        } else {
          setAngebotInfo({ nextVersion: 1 });
        }
      })
      .catch(() => {});
  }, [id, refreshKey]);

  const handleOpenAngebotsModal = () => {
    setShowAngebotsModal(true);
  };

  const handleAngebotsModalSuccess = () => {
    setRefreshKey((k) => k + 1);
  };

  const handleAnonymize = async () => {
    if (!id) return;
    const confirmed = window.confirm(
      'ACHTUNG: Alle Kontaktdaten dieser Anfrage werden unwiderruflich durch "GELOESCHT" ersetzt. Fortfahren?',
    );
    if (!confirmed) return;
    setAnonymizing(true);
    try {
      const res = await fetch("/api/admin/anonymize-customer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ anfrageId: id }),
      });
      if (res.ok) {
        setRefreshKey((k) => k + 1);
      } else {
        const data = await res.json().catch(() => ({}));
        alert(
          data.error ||
            "Anonymisierung fehlgeschlagen -- bitte Seite neu laden und erneut versuchen.",
        );
      }
    } catch {
      alert(
        "Anonymisierung fehlgeschlagen -- bitte Seite neu laden und erneut versuchen.",
      );
    } finally {
      setAnonymizing(false);
    }
  };

  const saveNotizen = async () => {
    if (!id) return;
    setSavingNotizen(true);
    try {
      const res = await fetch(`/api/anfragen/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          interne_notizen: notizen,
          version: doc?.version,
        }),
      });
      if (res.status === 409) {
        toast.error(
          "Diese Anfrage wurde zwischenzeitlich von einem anderen Benutzer geaendert. Bitte laden Sie die Seite neu.",
        );
        setIsConflict(true);
        return;
      }
      if (res.ok) {
        // Update local version from response
        const updated = await res.json();
        setDoc((prev) =>
          prev
            ? { ...prev, version: updated.doc?.version ?? prev.version }
            : prev,
        );
      }
    } catch {
      // ignore
    } finally {
      setSavingNotizen(false);
    }
  };

  if (!id) return null;

  if (loading) {
    return <div className="detail-view__loading">Lade Anfrage...</div>;
  }

  if (!doc) {
    return <div className="detail-view__loading">Anfrage nicht gefunden.</div>;
  }

  const produkte = doc.produkte || [];
  const statusColor = getStatusColor(doc.status);

  return (
    <div className="admin-content">
      {/* Version Conflict Banner */}
      {isConflict && (
        <div
          className="error-message"
          style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}
        >
          <span>Diese Anfrage wurde zwischenzeitlich geändert.</span>
          <button type="button" onClick={() => window.location.reload()} className="btn-save" style={{ margin: 0 }}>
            Seite neu laden
          </button>
        </div>
      )}

      {/* Attention Bar */}
      <AttentionBar
        anfrageNummer={doc.anfrage_nummer || `#${id}`}
        status={doc.status}
        createdAt={doc.createdAt}
        lastStatusChangeAt={doc.last_status_change_at || null}
        gesamtpreis={doc.gesamtpreis || null}
        produkte={produkte}
        stripePaymentStatus={doc.stripe_payment_status || null}
        stripeCheckoutUrl={doc.stripe_checkout_url || null}
      />

      {/* Splitbutton Action Zone */}
      <div className="detail-view__action-zone">
        <Splitbutton
          anfrageId={String(id)}
          currentStatus={doc.status}
          onStatusChanged={handleStatusChanged}
          lastStatusChangeAt={doc.last_status_change_at || null}
          version={doc.version}
          gesamtpreis={doc.gesamtpreis || null}
          onOpenAngebotsModal={handleOpenAngebotsModal}
        />
      </div>

      {/* Two-Column Layout */}
      <div className="detail-layout">
        {/* Left: Products (60%) */}
        <div>
          {produkte.length === 0 ? (
            <div className="detail-view__empty-state">
              Keine Produkte konfiguriert.
            </div>
          ) : (
            <div className="detail-view__products-column">
              {produkte.map((p: any, i: number) => (
                <ProductCard key={p.id || i} produkt={p} />
              ))}
            </div>
          )}
        </div>

        {/* Right: Tab Panel (40%) + Dokumente + Zahlung */}
        <div>
          <TabPanel
            anfrageId={String(id)}
            status={doc.status}
            statusColor={statusColor}
            doc={doc}
            notizen={notizen}
            onNotizenChange={setNotizen}
            onSaveNotizen={saveNotizen}
            savingNotizen={savingNotizen}
            onAnonymize={handleAnonymize}
            anonymizing={anonymizing}
            refreshKey={refreshKey}
            userRole={userRole}
            onEmailSent={handleStatusChanged}
          />
          <DokumentePanel
            anfrageId={String(id)}
            anfrageNummer={doc.anfrage_nummer || ""}
            userRole={userRole}
            onOpenAngebotsModal={handleOpenAngebotsModal}
          />
          <ZahlungsPanel
            anfrageId={String(id)}
            status={doc.status}
            doc={doc}
            onStatusChanged={handleStatusChanged}
          />
        </div>
      </div>

      {/* Angebots-Modal */}
      <AngebotsModal
        open={showAngebotsModal}
        onClose={() => setShowAngebotsModal(false)}
        anfrageId={String(id)}
        anfrageNummer={doc.anfrage_nummer || ""}
        produkte={produkte}
        gesamtpreis={doc.gesamtpreis || 0}
        onSuccess={handleAngebotsModalSuccess}
        lastAngebotBrutto={angebotInfo.lastBrutto}
        nextVersion={angebotInfo.nextVersion}
      />
    </div>
  );
}
