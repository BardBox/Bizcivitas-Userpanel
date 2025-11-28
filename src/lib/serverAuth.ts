import { cookies } from 'next/headers'

/**
 * Get authentication token from cookies (server-side only)
 * Note: In production, ensure token is stored in httpOnly cookies for security
 */
export async function getAuthToken(): Promise<string | null> {
  const cookieStore = await cookies()

  // Try different possible cookie names
  const token =
    cookieStore.get('authToken')?.value ||
    cookieStore.get('auth-token')?.value ||
    cookieStore.get('token')?.value ||
    null

  return token
}

/**
 * Create authenticated fetch headers
 */
export async function getAuthHeaders(): Promise<HeadersInit> {
  const token = await getAuthToken()

  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  }
}

/**
 * Make authenticated server-side fetch request
 */
export async function authFetch(url: string, options?: RequestInit) {
  const headers = await getAuthHeaders()

  return fetch(url, {
    ...options,
    headers: {
      ...headers,
      ...options?.headers,
    },
  })
}