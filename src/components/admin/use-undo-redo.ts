"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  useForm,
  useAllFormFields,
  useDocumentInfo,
  useEditDepth,
  useFormModified,
  toast,
} from "@payloadcms/ui";
import type { FormState } from "payload";
import {
  createCleanSnapshot,
  getDocKey,
} from "@/components/admin/undo-redo-stack";
import { useUndoRedoContext } from "@/components/admin/undo-redo-provider";

const DEBOUNCE_MS = 300;
const HIGHLIGHT_BG_COLOR = "rgba(217, 119, 6, 0.15)";
const HIGHLIGHT_BORDER_COLOR = "rgba(217, 119, 6, 0.4)";
const HIGHLIGHT_LABEL_COLOR = "#d97706";
const HIGHLIGHT_DURATION_MS = 800;
const TOAST_DURATION_MS = 2000;

/**
 * Compute a simple hash of top-level field values for deduplication.
 * Only considers fields without dots (top-level paths) to keep it fast.
 */
function computeSnapshotHash(state: FormState): string {
  const parts: string[] = [];
  for (const [path, field] of Object.entries(state)) {
    if (!path.includes(".")) {
      parts.push(`${path}:${JSON.stringify(field.value)}`);
    }
  }
  return parts.join("|");
}

/**
 * Compute which top-level field paths changed between two snapshots.
 */
function getChangedFields(before: FormState, after: FormState): string[] {
  const changed: string[] = [];
  const allPaths = new Set([...Object.keys(before), ...Object.keys(after)]);

  for (const path of allPaths) {
    // Only consider top-level fields for highlight/counting
    if (path.includes(".")) continue;

    const beforeVal = JSON.stringify(before[path]?.value);
    const afterVal = JSON.stringify(after[path]?.value);
    if (beforeVal !== afterVal) {
      changed.push(path);
    }
  }

  return changed;
}

/**
 * Highlight a field element with a yellow flash.
 */
function highlightField(path: string): void {
  // Find the field element — could be INPUT (text) or DIV (select/relationship)
  const fieldEl = document.getElementById(`field-${path}`);
  if (!fieldEl) return;

  // Navigate to the .field-type container
  const fieldType =
    fieldEl.closest(".field-type") ||
    (fieldEl.classList.contains("field-type") ? fieldEl : null);
  if (!fieldType) return;

  // 1. Highlight the label text color
  const label = fieldType.querySelector(".field-label") as HTMLElement | null;
  if (label) {
    const origColor = label.style.color;
    label.style.transition = `color ${HIGHLIGHT_DURATION_MS}ms ease-out`;
    label.style.color = HIGHLIGHT_LABEL_COLOR;
    setTimeout(() => {
      label.style.color = origColor;
    }, HIGHLIGHT_DURATION_MS);
    setTimeout(() => {
      label.style.transition = "";
    }, HIGHLIGHT_DURATION_MS * 2);
  }

  // 2. Highlight the visible input element (background + border pulse)
  // For React Select dropdowns: .rs__control has the visible bg/border
  // For text/textarea inputs: the input itself or .field-type__wrap
  const wrap = fieldType.querySelector(
    ".field-type__wrap",
  ) as HTMLElement | null;
  const target =
    (wrap?.querySelector(".rs__control") as HTMLElement | null) ||
    (wrap?.querySelector("input, textarea") as HTMLElement | null) ||
    wrap;

  if (target) {
    const origBg = target.style.backgroundColor;
    const origBorder = target.style.borderColor;
    target.style.transition = `background-color ${HIGHLIGHT_DURATION_MS}ms ease-out, border-color ${HIGHLIGHT_DURATION_MS}ms ease-out`;
    target.style.backgroundColor = HIGHLIGHT_BG_COLOR;
    target.style.borderColor = HIGHLIGHT_BORDER_COLOR;
    setTimeout(() => {
      target.style.backgroundColor = origBg;
      target.style.borderColor = origBorder;
    }, HIGHLIGHT_DURATION_MS);
    setTimeout(() => {
      target.style.transition = "";
    }, HIGHLIGHT_DURATION_MS * 2);
  }
}

/**
 * Hook wiring Payload form state to UndoRedoStack.
 * Provides debounced snapshot capture, undo/redo actions,
 * field highlighting, toast feedback, and keyboard shortcuts.
 */
export function useUndoRedo() {
  const form = useForm();
  const [fields, dispatchFields] = useAllFormFields();
  const { id, docConfig } = useDocumentInfo();
  const editDepth = useEditDepth();
  const { getStack } = useUndoRedoContext();

  // Derive stable doc key
  const docKey = getDocKey(docConfig?.slug || "", String(id || ""));
  const stack = getStack(docKey);
  const modified = useFormModified();

  // Refs for debounce and guards
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSnapshotHashRef = useRef<string>("");
  const isUndoRedoInProgress = useRef<boolean>(false);
  const prevDocKeyRef = useRef<string>(docKey);
  const prevModifiedRef = useRef(modified);

  // State for button enabled/disabled (triggers re-render)
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  // Reset stack when document changes
  useEffect(() => {
    if (prevDocKeyRef.current !== docKey) {
      prevDocKeyRef.current = docKey;
      lastSnapshotHashRef.current = "";
      setCanUndo(false);
      setCanRedo(false);
    }
  }, [docKey]);

  // Advance undo floor after successful save (modified: true -> false)
  useEffect(() => {
    if (prevModifiedRef.current === true && modified === false) {
      stack.markSaved();
      setCanUndo(stack.canUndo);
      setCanRedo(stack.canRedo);
    }
    prevModifiedRef.current = modified;
  }, [modified, stack]);

  // Debounced snapshot capture on form field changes
  useEffect(() => {
    // Skip if this change was caused by an undo/redo action
    if (isUndoRedoInProgress.current) return;

    // Clear existing debounce
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      // Double-check guard inside debounce callback (timing safety)
      if (isUndoRedoInProgress.current) return;

      // Get fresh fields at the moment of snapshot (avoid stale closure)
      const currentFields = form.getFields();
      const snapshot = createCleanSnapshot(currentFields);
      const hash = computeSnapshotHash(snapshot);

      // Skip duplicate snapshots
      if (hash === lastSnapshotHashRef.current) return;

      stack.push(snapshot);
      lastSnapshotHashRef.current = hash;
      setCanUndo(stack.canUndo);
      setCanRedo(stack.canRedo);
    }, DEBOUNCE_MS);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fields]);

  const handleUndo = useCallback(() => {
    const before = createCleanSnapshot(form.getFields());
    const snapshot = stack.undo();
    if (!snapshot) return;

    isUndoRedoInProgress.current = true;

    dispatchFields({
      type: "REPLACE_STATE",
      state: snapshot,
      optimize: false,
    });
    form.setModified(true);

    // Update hash to restored state — prevents debounced capture from
    // re-pushing the restored state as a new snapshot
    lastSnapshotHashRef.current = computeSnapshotHash(snapshot);

    // Compute changed fields and highlight
    const changed = getChangedFields(before, snapshot);
    for (const path of changed) {
      highlightField(path);
    }

    // Toast feedback
    const count = changed.length;
    if (count > 0) {
      const message =
        count === 1
          ? "1 Feld rückgängig gemacht"
          : `${count} Felder rückgängig gemacht`;
      toast.info(message, { duration: TOAST_DURATION_MS });
    }

    setCanUndo(stack.canUndo);
    setCanRedo(stack.canRedo);

    // Clear the guard after debounce period to prevent re-capture
    setTimeout(() => {
      isUndoRedoInProgress.current = false;
    }, DEBOUNCE_MS + 100);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form, stack, dispatchFields]);

  const handleRedo = useCallback(() => {
    const before = createCleanSnapshot(form.getFields());
    const snapshot = stack.redo();
    if (!snapshot) return;

    isUndoRedoInProgress.current = true;

    dispatchFields({
      type: "REPLACE_STATE",
      state: snapshot,
      optimize: false,
    });
    form.setModified(true);

    // Update hash to restored state — prevents debounced capture from
    // re-pushing the restored state as a new snapshot
    lastSnapshotHashRef.current = computeSnapshotHash(snapshot);

    // Compute changed fields and highlight
    const changed = getChangedFields(before, snapshot);
    for (const path of changed) {
      highlightField(path);
    }

    // Toast feedback
    const count = changed.length;
    if (count > 0) {
      const message =
        count === 1
          ? "1 Feld wiederhergestellt"
          : `${count} Felder wiederhergestellt`;
      toast.info(message, { duration: TOAST_DURATION_MS });
    }

    setCanUndo(stack.canUndo);
    setCanRedo(stack.canRedo);

    // Clear the guard after debounce period to prevent re-capture
    setTimeout(() => {
      isUndoRedoInProgress.current = false;
    }, DEBOUNCE_MS + 100);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form, stack, dispatchFields]);

  // Keyboard shortcuts: Cmd+Z (undo) and Cmd+Shift+Z (redo)
  // Using direct event listener instead of useHotkey for reliability
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const isMac = navigator.userAgent.includes("Mac OS X");
      const cmdOrCtrl = isMac ? e.metaKey : e.ctrlKey;

      if (!cmdOrCtrl) return;
      if (e.key !== "z" && e.key !== "Z") return;

      // Only fire at main document level (editDepth 1), not inside drawers
      if (editDepth !== 1) return;

      e.preventDefault();
      if (e.shiftKey) {
        handleRedo();
      } else {
        handleUndo();
      }
    };

    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [handleUndo, handleRedo, editDepth]);

  return { canUndo, canRedo, handleUndo, handleRedo };
}
