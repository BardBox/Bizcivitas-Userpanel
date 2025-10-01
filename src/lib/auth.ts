/**
 * Authentication utility functions
 */

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  if (typeof window === "undefined") return false;
  const token = localStorage.getItem("accessToken");
  return !!token;
}

/**
 * Get the current access token
 */
export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("accessToken");
}

/**
 * Get the current user role
 */
export function getUserRole(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("role");
}

/**
 * Logout user and redirect to login
 */
export function logout(): void {
  if (typeof window === "undefined") return;

  // Clear all auth data
  localStorage.removeItem("accessToken");
  localStorage.removeItem("role");

  // Redirect to login
  window.location.href = "/login";
}
