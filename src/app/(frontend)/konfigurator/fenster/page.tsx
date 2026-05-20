"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useKonfiguratorStore } from "@/lib/konfigurator/store";
import { useCartStore } from "@/lib/cart/store";
import {
  useKonfiguratorUrlState,
  konfiguratorParsers,
} from "@/lib/konfigurator/url-state";
import {
  showRestoreDialog,
  clearSavedConfig,
} from "@/lib/konfigurator/persistence";
import { KonfiguratorShell } from "@/components/konfigurator/konfigurator-shell";

export default function FensterKonfiguratorPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-background">
          <div className="flex flex-col items-center gap-4">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <p className="text-sm text-muted-foreground">
              Daten werden geladen...
            </p>
          </div>
        </div>
      }
    >
      <FensterKonfiguratorContent />
    </Suspense>
  );
}

function FensterKonfiguratorContent() {
  const isLoading = useKonfiguratorStore((s) => s.isLoading);
  const loadCMSData = useKonfiguratorStore((s) => s.loadCMSData);
  const resetAll = useKonfiguratorStore((s) => s.resetAll);

  const [showRestore, setShowRestore] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  // Sync URL state
  useKonfiguratorUrlState();

  // Hydrate Zustand from localStorage (skipHydration: true)
  useEffect(() => {
    useKonfiguratorStore.persist.rehydrate();
    setHydrated(true);
  }, []);

  // After hydration, check for restore dialog and load CMS data
  useEffect(() => {
    if (!hydrated) return;

    // Skip restore dialog when editing a cart item — selections are already loaded
    const isEditing = useCartStore.getState().editingCartItemId !== null;

    // Deep-linked URL with selection params overrides restore dialog.
    // A shared/bookmarked URL is explicit user intent for a specific configuration.
    const urlParams = new URLSearchParams(window.location.search);
    const hasUrlSelections = Array.from(urlParams.keys()).some(
      (key) => key !== "step" && key in konfiguratorParsers,
    );

    if (hasUrlSelections || isEditing) {
      // URL params or cart edit take priority — skip restore dialog
      loadCMSData();
    } else if (showRestoreDialog()) {
      setShowRestore(true);
    } else {
      loadCMSData();
    }
  }, [hydrated, loadCMSData]);

  const handleRestore = () => {
    setShowRestore(false);
    loadCMSData();
  };

  const handleNewConfig = () => {
    clearSavedConfig();
    resetAll();
    setShowRestore(false);
    loadCMSData();
  };

  // Restore dialog
  if (showRestore) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="w-full max-w-md rounded-xl border border-border bg-card p-8 shadow-lg">
          <h2 className="text-xl font-bold text-card-foreground">
            Konfiguration fortsetzen?
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Es wurde eine gespeicherte Konfiguration gefunden. Möchten Sie diese
            fortsetzen oder neu beginnen?
          </p>
          <div className="mt-6 flex gap-3">
            <button
              type="button"
              onClick={handleNewConfig}
              className="flex-1 rounded-lg border border-border bg-background px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
            >
              Neu starten
            </button>
            <button
              type="button"
              onClick={handleRestore}
              className="flex-1 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Fortsetzen
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Loading state
  if (isLoading || !hydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">
            Daten werden geladen...
          </p>
        </div>
      </div>
    );
  }

  return <KonfiguratorShell />;
}
