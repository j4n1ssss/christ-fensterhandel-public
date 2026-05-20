import type { Access } from 'payload'
import { isStaff } from './role-checks'

/**
 * Access function for Anfragen:
 * - Admin/Mitarbeiter/Viewer see all
 * - Kunde sees only own Anfragen (matched by email)
 * - Unauthenticated blocked
 */
export const isOwnAnfrage: Access = ({ req }) => {
  if (!req.user) return false

  if (isStaff(req.user)) return true

  if (req.user.rolle === 'kunde') {
    return {
      'kontaktdaten.email': { equals: req.user.email },
    }
  }

  return false
}
