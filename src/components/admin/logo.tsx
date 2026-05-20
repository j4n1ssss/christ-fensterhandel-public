"use client";
import React from "react";
import { useTheme } from "@payloadcms/ui";

export default function Logo() {
  const { theme } = useTheme();
  const color = theme === "dark" ? "#ffffff" : "#0a0a0a";

  return (
    <span
      style={{
        color,
        fontFamily: "sans-serif",
        fontSize: 18,
        fontWeight: 600,
        letterSpacing: "0.04em",
        maxWidth: 200,
      }}
    >
      Muster Fenster
    </span>
  );
}
