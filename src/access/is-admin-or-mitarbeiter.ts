import type { Access } from 'payload'
import { hasRole } from './role-checks'

/**
 * Access function: admin or mitarbeiter role.
 */
export const isAdminOrMitarbeiter: Access = ({ req }) => {
  return hasRole(req.user, ['admin', 'mitarbeiter'])
}
