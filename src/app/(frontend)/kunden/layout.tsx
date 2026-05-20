import React from 'react'

/**
 * Layout wrapper for /kunden/* routes.
 * Minimal pass-through layout — auth checks happen in individual pages.
 */
export default function KundenLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
