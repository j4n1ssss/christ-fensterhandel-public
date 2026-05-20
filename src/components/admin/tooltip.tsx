"use client";

import { type ReactNode, useCallback, useRef, useState } from "react";

interface TooltipProps {
  children: ReactNode;
  content: string;
}

/**
 * Reusable admin tooltip — instant hover, fixed positioning to escape overflow:hidden.
 * Uses Payload theme variables for dark/light mode compatibility.
 *
 * Usage:
 *   <Tooltip content="Fehlend: erlaubte_farben">
 *     <Badge />
 *   </Tooltip>
 */
export function Tooltip({ children, content }: TooltipProps) {
  const [visible, setVisible] = useState(false);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const wrapperRef = useRef<HTMLSpanElement>(null);

  const show = useCallback(() => {
    if (wrapperRef.current) {
      const rect = wrapperRef.current.getBoundingClientRect();
      setCoords({
        x: rect.left + rect.width / 2,
        y: rect.top - 6,
      });
    }
    setVisible(true);
  }, []);

  const hide = useCallback(() => setVisible(false), []);

  return (
    <span
      ref={wrapperRef}
      onMouseEnter={show}
      onMouseLeave={hide}
      style={{ position: "relative", display: "inline-block" }}
    >
      {children}
      {visible && (
        <span
          style={{
            position: "fixed",
            left: coords.x,
            top: coords.y,
            transform: "translate(-50%, -100%)",
            padding: "6px 10px",
            borderRadius: 6,
            fontSize: 12,
            lineHeight: 1.4,
            fontWeight: 400,
            maxWidth: 260,
            whiteSpace: "normal",
            wordBreak: "break-word",
            pointerEvents: "none",
            backgroundColor: "var(--theme-elevation-100)",
            color: "var(--theme-elevation-800)",
            border: "1px solid var(--theme-elevation-250)",
            zIndex: 10000,
          }}
        >
          {content}
        </span>
      )}
    </span>
  );
}
