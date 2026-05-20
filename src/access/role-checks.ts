import type { User } from '@/payload-types'

type UserWithRolle = Pick<User, 'rolle'> | null | undefined

/**
 * Check if user has one of the specified roles.
 */
export function hasRole(user: UserWithRolle, roles: string[]): boolean {
  if (!user) return false
  return user.rolle != null && roles.includes(user.rolle)
}

/**
 * Check if user is staff (admin, mitarbeiter, or viewer).
 */
export function isStaff(user: UserWithRolle): boolean {
  return hasRole(user, ['admin', 'mitarbeiter', 'viewer'])
}

/**
 * Field-level access: staff (admin/mitarbeiter/viewer) can read.
 */
export function staffCanRead({ req }: { req: { user?: UserWithRolle } }): boolean {
  return isStaff(req.user)
}

/**
 * Field-level access: admin/mitarbeiter can write.
 */
export function staffCanWrite({ req }: { req: { user?: UserWithRolle } }): boolean {
  return hasRole(req.user, ['admin', 'mitarbeiter'])
}
