import * as React from "react";

interface StatusBadgeProps {
  status: string;
  color: string;
  label: string;
}

export function StatusBadge({ color, label }: StatusBadgeProps) {
  // Build 15% opacity background: hex color + '26' suffix for ~15% alpha
  const bgColor = color + "26";

  return (
    <span
      style={{
        display: "inline-block",
        padding: "4px 12px",
        borderRadius: "12px",
        fontSize: "12px",
        fontWeight: 600,
        backgroundColor: bgColor,
        color: color,
      }}
    >
      {label}
    </span>
  );
}
