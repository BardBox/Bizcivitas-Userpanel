import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * Middleware to sync auth token from localStorage to cookies automatically
 * This allows SSR to access the token without changing login flow
 */
export function middleware(request: NextRequest) {
  const response = NextResponse.next()

  // Check if authToken cookie already exists
  const authTokenFromCookie = request.cookies.get('authToken')

  // If no cookie but request might have token in localStorage,
  // we'll handle it on the client side with a script
  if (!authTokenFromCookie) {
    // Add a header to signal client to sync token
    response.headers.set('x-needs-auth-sync', 'true')
  }

  return response
}

// Run middleware on protected routes
export const config = {
  matcher: [
    '/feeds/:path*',
    '/dashboard/:path*',
    '/profile/:path*',
    // Add other protected routes here
  ],
}
