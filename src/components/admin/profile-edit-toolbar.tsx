"use client";

import React, { useState, useRef, useCallback } from "react";
import { Undo2, Redo2 } from "lucide-react";
import { useUndoRedo } from "@/components/admin/use-undo-redo";

interface ToolbarButtonProps {
  icon: React.ReactNode;
  onClick: () => void;
  disabled: boolean;
  tooltip: string;
}

function ToolbarButton({
  icon,
  onClick,
  disabled,
  tooltip,
}: ToolbarButtonProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const tooltipTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleMouseEnter = useCallback(() => {
    if (disabled) return;
    setIsHovered(true);
    tooltipTimerRef.current = setTimeout(() => {
      setShowTooltip(true);
    }, 400);
  }, [disabled]);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    setShowTooltip(false);
    if (tooltipTimerRef.current) {
      clearTimeout(tooltipTimerRef.current);
      tooltipTimerRef.current = null;
    }
  }, []);

  return (
    <div style={{ position: "relative", display: "inline-flex" }}>
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: 32,
          height: 32,
          minWidth: 32,
          minHeight: 32,
          background: isHovered ? "var(--theme-elevation-50)" : "transparent",
          border: `1px solid ${
            isHovered
              ? "var(--theme-elevation-300)"
              : "var(--theme-elevation-200)"
          }`,
          borderRadius: "4px",
          cursor: disabled ? "not-allowed" : "pointer",
          opacity: disabled ? 0.4 : 1,
          pointerEvents: disabled ? ("none" as const) : ("auto" as const),
          transition: "all 0.15s",
          padding: 0,
          color: disabled
            ? "var(--theme-elevation-300)"
            : "var(--theme-elevation-900)",
        }}
      >
        {icon}
      </button>

      {showTooltip && !disabled && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            left: "50%",
            transform: "translateX(-50%)",
            marginTop: "4px",
            background: "var(--theme-elevation-900)",
            color: "var(--theme-elevation-0)",
            fontSize: "12px",
            padding: "4px 8px",
            borderRadius: "4px",
            whiteSpace: "nowrap",
            zIndex: 100,
            pointerEvents: "none",
          }}
        >
          {tooltip}
        </div>
      )}
    </div>
  );
}

export function ProfileEditToolbar() {
  const { canUndo, canRedo, handleUndo, handleRedo } = useUndoRedo();

  return (
    <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
      <ToolbarButton
        icon={<Undo2 size={16} />}
        onClick={handleUndo}
        disabled={!canUndo}
        tooltip="Rückgängig (Cmd+Z)"
      />
      <ToolbarButton
        icon={<Redo2 size={16} />}
        onClick={handleRedo}
        disabled={!canRedo}
        tooltip="Wiederherstellen (Cmd+Shift+Z)"
      />
    </div>
  );
}
