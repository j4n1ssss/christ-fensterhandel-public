"use client";

import { useEffect, useState } from "react";

export function WebhookFehlerBadge() {
  const [errorCount, setErrorCount] = useState(0);

  useEffect(() => {
    async function fetchDeadCount() {
      try {
        const res = await fetch(
          "/api/email_queue?where[status][equals]=dead&limit=0",
          { credentials: "include" },
        );
        if (!res.ok) return;
        const data = await res.json();
        setErrorCount(data.totalDocs || 0);
      } catch {
        // Silently fail -- nav should still work
      }
    }
    fetchDeadCount();
    const interval = setInterval(fetchDeadCount, 60_000);
    return () => clearInterval(interval);
  }, []);

  if (errorCount === 0) return null;

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        minWidth: "20px",
        height: "20px",
        padding: "0 6px",
        fontSize: "11px",
        fontWeight: 600,
        lineHeight: 1,
        borderRadius: "9999px",
        backgroundColor: "var(--theme-error-500, #ef4444)",
        color: "#fff",
      }}
    >
      {errorCount}
    </span>
  );
}

export default WebhookFehlerBadge;
