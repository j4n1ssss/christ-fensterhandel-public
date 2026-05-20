import * as React from "react";
import { cn } from "@/lib/utils";

export type ContainerSize = "xs" | "sm" | "md" | "lg" | "xl";

interface ContainerProps extends React.HTMLAttributes<HTMLElement> {
  /** Max-Breite. xs=640, sm=768, md=1024, lg=1280, xl=1536 px. Default: lg. */
  size?: ContainerSize;
  /** Horizontales Page-Padding deaktivieren (z. B. wenn Parent es schon setzt). */
  noPadding?: boolean;
  /** Wrapper-Element. Default: div. */
  as?: "div" | "section" | "main" | "article" | "header" | "footer";
}

const sizeMap: Record<ContainerSize, string> = {
  xs: "max-w-[var(--layout-xs)]",
  sm: "max-w-[var(--layout-sm)]",
  md: "max-w-[var(--layout-md)]",
  lg: "max-w-[var(--layout-lg)]",
  xl: "max-w-[var(--layout-xl)]",
};

export function Container({
  size = "lg",
  noPadding = false,
  as: Comp = "div",
  className,
  children,
  ...props
}: ContainerProps) {
  return (
    <Comp
      className={cn(
        "mx-auto w-full",
        sizeMap[size],
        !noPadding && "px-[var(--page-padding-inline)]",
        className,
      )}
      {...props}
    >
      {children}
    </Comp>
  );
}
