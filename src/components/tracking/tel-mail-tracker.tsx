"use client";

import { useEffect } from "react";
import { trackEvent } from "@/lib/tracking/pirsch";

/**
 * Globaler Click-Listener für `tel:`- und `mailto:`-Links.
 * Wird im Frontend-Root-Layout einmal montiert — vermeidet, dass jeder
 * einzelne Link manuell instrumentiert werden muss.
 */
export function TelMailTracker() {
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      const target = e.target;
      if (!(target instanceof Element)) return;
      const link = target.closest("a");
      if (!link) return;
      const href = link.getAttribute("href") ?? "";
      if (href.startsWith("tel:")) {
        trackEvent("Telefon geklickt");
      } else if (href.startsWith("mailto:")) {
        trackEvent("E-Mail geklickt");
      }
    }

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  return null;
}
