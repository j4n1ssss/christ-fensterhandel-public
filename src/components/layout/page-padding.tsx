import * as React from "react";
import { cn } from "@/lib/utils";

interface PagePaddingProps extends React.HTMLAttributes<HTMLElement> {
  /** Wrapper-Element. Default: div. */
  as?: "div" | "section" | "main" | "article" | "header" | "footer";
}

/**
 * Applies horizontales Page-Padding über den Token
 * --page-padding-inline (responsiv: 1.5rem → 2rem → 3rem).
 *
 * Nutze das, wenn du Padding brauchst, aber KEINE Max-Breite
 * (anders als <Container>, die beides kombiniert).
 */
export function PagePadding({
  as: Comp = "div",
  className,
  children,
  ...props
}: PagePaddingProps) {
  return (
    <Comp
      className={cn("px-[var(--page-padding-inline)]", className)}
      {...props}
    >
      {children}
    </Comp>
  );
}
