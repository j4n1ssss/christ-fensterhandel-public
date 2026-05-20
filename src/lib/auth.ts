import { headers as getHeaders } from 'next/headers'
import { getPayload } from 'payload'
import config from '@payload-config'

/**
 * Server-side utility to get the currently authenticated user.
 * Uses Payload's built-in auth() method with the request headers (HTTP-only cookie).
 * Returns the user object or null if not authenticated.
 */
export async function getCurrentUser() {
  const payload = await getPayload({ config })
  const headersList = await getHeaders()
  const { user } = await payload.auth({ headers: headersList })
  return user
}
