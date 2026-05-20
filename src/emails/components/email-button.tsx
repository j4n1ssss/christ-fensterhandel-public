import { Button } from "@react-email/components";
import * as React from "react";

interface EmailButtonProps {
  href: string;
  children: string;
  variant?: "primary" | "staff";
}

export function EmailButton({
  href,
  children,
  variant = "primary",
}: EmailButtonProps) {
  const isPrimary = variant === "primary";

  return (
    <Button
      href={href}
      style={{
        backgroundColor: isPrimary ? "#1a1a1a" : "#f0f0f0",
        color: isPrimary ? "#ffffff" : "#1a1a1a",
        fontSize: "14px",
        fontWeight: 600,
        padding: "12px 24px",
        borderRadius: "6px",
        textDecoration: "none",
        textAlign: "center" as const,
        display: "inline-block",
      }}
    >
      {children}
    </Button>
  );
}
