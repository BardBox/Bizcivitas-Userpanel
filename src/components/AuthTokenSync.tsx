'use client'

import { useEffect } from 'react'

/**
 * Auto-sync authentication token from localStorage to cookies
 * This runs on every page load to ensure SSR has access to the token
 *
 * NO CHANGES TO LOGIN REQUIRED - works with existing localStorage system
 */
export default function AuthTokenSync() {
  useEffect(() => {
    // Get token from localStorage (your existing system)
    const token = localStorage.getItem('authToken')

    if (token) {
      // Check if cookie already has the token
      const cookieHasToken = document.cookie.includes('authToken=')

      if (!cookieHasToken) {
        // Sync to cookie for SSR
        const maxAge = 60 * 60 * 24 // 24 hours
        document.cookie = `authToken=${token}; path=/; max-age=${maxAge}; SameSite=Lax${
          window.location.protocol === 'https:' ? '; Secure' : ''
        }`

        console.log('✅ Auth token synced to cookies for SSR')
      }
    } else {
      // If no token in localStorage, clear cookie
      const cookieHasToken = document.cookie.includes('authToken=')
      if (cookieHasToken) {
        document.cookie = 'authToken=; path=/; max-age=0'
        console.log('🧹 Auth cookie cleared (no localStorage token)')
      }
    }
  }, [])

  // This component renders nothing
  return null
}