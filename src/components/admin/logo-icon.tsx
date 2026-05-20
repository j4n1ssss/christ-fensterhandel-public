"use client";
import React from "react";
import { useTheme } from "@payloadcms/ui";

export default function LogoIcon() {
  const { theme } = useTheme();
  const color = theme === "dark" ? "#ffffff" : "#0a0a0a";

  return (
    <span
      style={{
        color,
        fontFamily: "sans-serif",
        fontSize: 14,
        fontWeight: 600,
        letterSpacing: "0.04em",
        maxWidth: 140,
      }}
    >
      MF
    </span>
  );
}
