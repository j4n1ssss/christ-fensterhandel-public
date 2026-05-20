import type { Access } from 'payload'

/**
 * Access function: only admin role.
 */
export const isAdmin: Access = ({ req }) => {
  return req.user?.rolle === 'admin' || false
}
