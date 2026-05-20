"use client";

import React, { useState } from "react";
import { toast } from "@payloadcms/ui";

interface Props {
  entryId: string;
  status: string;
}

/**
 * Retry button for dead email queue entries.
 *
 * Resets the entry to 'pending' with 0 attempts via the Payload REST API.
 * Only renders when the entry status is 'dead'.
 */
export function EmailQueueRetryButton({ entryId, status }: Props) {
  const [loading, setLoading] = useState(false);

  if (status !== "dead") return null;

  const handleRetry = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/email_queue/${entryId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "pending",
          attempts: 0,
          next_retry_at: null,
          error_log: null,
        }),
      });
      if (!res.ok) throw new Error("Retry failed");
      toast.success("E-Mail wurde erneut in die Queue eingereiht");
      window.location.reload();
    } catch {
      toast.error("Fehler beim Wiederholen");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleRetry}
      disabled={loading}
      className="btn-ghost"
      style={{
        fontSize: "13px",
        opacity: loading ? 0.6 : 1,
        cursor: loading ? "wait" : "pointer",
      }}
    >
      {loading ? "Wird wiederholt..." : "Erneut versuchen"}
    </button>
  );
}
