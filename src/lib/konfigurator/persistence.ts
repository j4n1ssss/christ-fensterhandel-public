const STORAGE_KEY = 'konfigurator'

/**
 * Check if LocalStorage has a saved configuration.
 * Used to show the "Möchten Sie Ihre letzte Konfiguration fortsetzen?" dialog.
 */
export function showRestoreDialog(): boolean {
  if (typeof window === 'undefined') return false

  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (!saved) return false

    const parsed = JSON.parse(saved)
    // Check if there's meaningful state (at least produkttyp selected)
    return parsed?.state?.produkttyp !== null
  } catch {
    return false
  }
}

/**
 * Clear the saved configuration from LocalStorage.
 * Called when user declines to restore or explicitly resets.
 */
export function clearSavedConfig(): void {
  if (typeof window === 'undefined') return

  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    // Silently fail if localStorage is not available
  }
}
