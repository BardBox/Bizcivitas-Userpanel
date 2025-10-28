/**
 * Authentication utility functions
 * Uses in-memory token storage and HttpOnly cookies for security
 */

// In-memory token store (cleared on page refresh, relies on HttpOnly refresh token cookie)
let accessTokenStore: string | null = null;

/**
 * Decode JWT without verification (for reading expiry)
 */
function decodeJWT(token: string): { exp?: number; role?: string } | null {
  try {
    const base64Url = token.split(".")[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error("Failed to decode JWT:", error);
    return null;
  }
}

/**
 * Check if token is expired
 */
function isTokenExpired(token: string): boolean {
  const decoded = decodeJWT(token);
  if (!decoded || !decoded.exp) return true;

  // Check if token is expired (with 30 second buffer)
  const now = Math.floor(Date.now() / 1000);
  return decoded.exp < now + 30;
}

/**
 * Set access token in memory
 */
export function setAccessToken(token: string): void {
  accessTokenStore = token;
}

/**
 * Clear access token from memory
 */
export function clearAccessToken(): void {
  accessTokenStore = null;
}

/**
 * Check if user is authenticated with valid token
 * Optimized for speed - minimal operations
 */
export function isAuthenticated(): boolean {
  if (typeof window === "undefined") return false;

  // Check in-memory token first (fastest)
  if (accessTokenStore) {
    try {
      return !isTokenExpired(accessTokenStore);
    } catch (error) {
      clearAccessToken();
      return false;
    }
  }

  // Check both localStorage and sessionStorage
  const legacyToken =
    localStorage.getItem("accessToken") ||
    sessionStorage.getItem("accessToken");
  if (!legacyToken) {
    // Try to get token from user data
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        const user = JSON.parse(userData);
        const token =
          user.token ||
          user.accessToken ||
          user.auth?.token ||
          user.data?.token;
        if (token) {
          setAccessToken(token);
          return !isTokenExpired(token);
        }
      } catch (e) {
        console.error("Failed to parse user data:", e);
      }
    }
    return false;
  }

  try {
    if (!isTokenExpired(legacyToken)) {
      // Move to memory store for faster future access
      setAccessToken(legacyToken);
      return true;
    } else {
      // Clear expired token immediately
      localStorage.removeItem("accessToken");
      localStorage.removeItem("role");
      return false;
    }
  } catch (error) {
    // Clear invalid token immediately
    localStorage.removeItem("accessToken");
    localStorage.removeItem("role");
    return false;
  }
}

/**
 * Get the current access token
 */
export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;

  // Return in-memory token if available and valid
  if (accessTokenStore) {
    try {
      if (!isTokenExpired(accessTokenStore)) {
        return accessTokenStore;
      } else {
        clearAccessToken();
      }
    } catch (error) {
      console.error("Token validation error:", error);
      clearAccessToken();
    }
  }

  // Check both localStorage and sessionStorage
  const legacyToken =
    localStorage.getItem("accessToken") ||
    sessionStorage.getItem("accessToken");
  if (legacyToken) {
    setAccessToken(legacyToken);
    return legacyToken;
  }

  // Try to get token from user data
  const userData = localStorage.getItem("user");
  if (userData) {
    try {
      const user = JSON.parse(userData);
      const token =
        user.token || user.accessToken || user.auth?.token || user.data?.token;
      if (token) {
        setAccessToken(token);
        return token;
      }
    } catch (e) {
      console.error("Failed to parse user data:", e);
    }
  }

  return null;
}

/**
 * Get the current user role from token
 */
export function getUserRole(): string | null {
  const token = getAccessToken();
  if (!token) return null;

  try {
    const decoded = decodeJWT(token);
    return decoded?.role || null;
  } catch (error) {
    console.error("Failed to get user role:", error);
    return null;
  }
}

/**
 * Logout user - clear tokens and call server logout endpoint
 * Returns a promise for proper async handling
 */
export async function logout(): Promise<void> {
  if (typeof window === "undefined") return;

  try {
    // Get FCM token for logout
    const fcmToken = localStorage.getItem("fcmToken");
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

    // Call server logout endpoint to clear HttpOnly cookies and remove FCM token
    await fetch(`${backendUrl}/users/logout`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ fcmToken: fcmToken || "" }),
      credentials: "include",
    });
  } catch (error) {
    console.error("Logout API error:", error);
  } finally {
    // Clear in-memory token
    clearAccessToken();

    // Clear all local storage
    if (typeof window !== "undefined") {
      localStorage.clear();
    }
  }
}

/**
 * Refresh access token using HttpOnly refresh token cookie
 */
/**
 * Get the current FCM token
 */
export function getFcmToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("fcmToken");
}

/**
 * Set FCM token and optionally register with backend
 */
export async function setFcmToken(
  token: string,
  registerWithBackend = true
): Promise<void> {
  if (typeof window === "undefined") return;

  localStorage.setItem("fcmToken", token);

  if (registerWithBackend) {
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
      const accessToken = getAccessToken();

      await fetch(`${backendUrl}/users/add-fcm-token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
        credentials: "include",
        body: JSON.stringify({ token }),
      });
    } catch (error) {
      console.error("Error registering FCM token:", error);
    }
  }
}

export async function refreshAccessToken(): Promise<string | null> {
  if (typeof window === "undefined") return null;

  try {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    const response = await fetch(`${backendUrl}/users/refresh`, {
      method: "POST",
      credentials: "include", // Send HttpOnly refresh token cookie
    });

    if (!response.ok) {
      throw new Error("Token refresh failed");
    }

    const data = await response.json();
    const newToken = data?.data?.accessToken || data?.accessToken;

    if (newToken) {
      setAccessToken(newToken);
      return newToken;
    }

    return null;
  } catch (error) {
    console.error("Token refresh error:", error);
    clearAccessToken();
    return null;
  }
}
