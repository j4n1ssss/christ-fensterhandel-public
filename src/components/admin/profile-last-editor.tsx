"use client";

import { useDocumentInfo, useFormFields } from "@payloadcms/ui";
import { useEffect, useState } from "react";

interface ResolvedEditor {
  id: string;
  vorname?: string;
  nachname?: string;
  email: string;
}

function formatEditorName(editor: ResolvedEditor): {
  name: string | null;
  email: string;
} {
  const parts = [editor.vorname, editor.nachname].filter(Boolean);
  const name = parts.join(" ");
  return { name: name || null, email: editor.email };
}

const dateFormatter = new Intl.DateTimeFormat("de-DE", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

function isResolvedEditor(value: unknown): value is ResolvedEditor {
  return (
    typeof value === "object" &&
    value !== null &&
    "id" in value &&
    "email" in value
  );
}

/**
 * ProfileLastEditor — displays "Zuletzt bearbeitet von [Name] ([Email]) am [Datum]"
 * in the beforeDocumentControls area.
 *
 * Payload v3 useDocumentInfo() does NOT provide initialData.
 * Instead we watch updatedAt via useFormFields (to detect saves),
 * then fetch the profile with depth=1 from the REST API to get
 * the resolved last_edited_by user object.
 */
export function ProfileLastEditor() {
  const { id } = useDocumentInfo();
  const updatedAtField = useFormFields(([fields]) => fields.updatedAt);
  const updatedAt = updatedAtField?.value as string | undefined;

  const [editor, setEditor] = useState<ResolvedEditor | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    let cancelled = false;

    fetch(`/api/profile/${id}?depth=1`, { credentials: "include" })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((doc) => {
        if (cancelled) return;
        if (isResolvedEditor(doc.last_edited_by)) {
          setEditor(doc.last_edited_by);
        }
        if (doc.updatedAt) {
          setLastUpdated(doc.updatedAt);
        }
      })
      .catch(() => {
        /* silently ignore — component just won't show */
      });

    return () => {
      cancelled = true;
    };
  }, [id, updatedAt]);

  if (!id || !editor) return null;

  const { name, email } = formatEditorName(editor);
  const formattedDate = lastUpdated
    ? dateFormatter.format(new Date(lastUpdated))
    : null;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <span
        style={{
          fontSize: 11,
          fontWeight: 400,
          color: "var(--theme-elevation-500)",
          whiteSpace: "nowrap",
        }}
      >
        Zuletzt bearbeitet von{" "}
        {name ? (
          <>
            <span
              style={{
                fontWeight: 600,
                color: "var(--theme-elevation-700)",
              }}
            >
              {name}
            </span>{" "}
            ({email})
          </>
        ) : (
          <span
            style={{
              fontWeight: 600,
              color: "var(--theme-elevation-700)",
            }}
          >
            {email}
          </span>
        )}
        {formattedDate && <> am {formattedDate}</>}
      </span>
      <div
        style={{
          width: 1,
          height: 16,
          background: "var(--theme-elevation-200)",
          margin: "0 8px",
        }}
      />
    </div>
  );
}
