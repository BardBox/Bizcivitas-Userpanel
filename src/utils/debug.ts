"use client";

/**
 * Debug utilities for development and troubleshooting
 */

// Environment Variables Debug
export const debugEnvVars = () => {
  console.group("🔍 Environment Variables Debug");

  const envVars = {
    // Public env vars (safe to log)
    NEXT_PUBLIC_BACKEND_URL: process.env.NEXT_PUBLIC_BACKEND_URL,
    NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    NEXT_PUBLIC_FIREBASE_PROJECT_ID:
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    NODE_ENV: process.env.NODE_ENV,

    // Check if vars are set (without exposing values)
    RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID ? "✅ SET" : "❌ NOT SET",
    TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID
      ? "✅ SET"
      : "❌ NOT SET",
    MONGODB_URI: process.env.MONGODB_URI ? "✅ SET" : "❌ NOT SET",
  };

  console.table(envVars);
  console.groupEnd();

  return envVars;
};

// API Debug
export const debugApiCall = (
  url: string,
  options: RequestInit,
  label?: string
) => {
  console.group(`🌐 API Call Debug: ${label || url}`);
  console.log("URL:", url);
  console.log("Method:", options.method || "GET");
  console.log("Headers:", options.headers);
  console.log("Body:", options.body);
  console.log("Credentials:", options.credentials);
  console.groupEnd();
};

// Login Debug
export const debugLogin = (credentials: any, apiUrl: string) => {
  console.group("🔑 Login Debug");
  console.log("Login attempt at:", new Date().toISOString());
  console.log("API URL:", apiUrl);
  console.log("Email:", credentials.email || "Not provided");
  console.log(
    "Password:",
    credentials.password ? "✅ PROVIDED" : "❌ NOT PROVIDED"
  );
  console.log("Remember Me:", credentials.rememberMe || false);

  // Check if we're in production
  if (process.env.NODE_ENV === "production") {
    console.warn("🚨 Running in PRODUCTION mode");
  } else {
    console.log("🔧 Running in DEVELOPMENT mode");
  }

  console.groupEnd();
};

// CORS Debug
export const debugCors = async (apiUrl: string) => {
  console.group("🔒 CORS Debug");

  try {
    const testUrl = new URL("/api/v1/users/login", apiUrl).toString();
    console.log("Testing CORS for:", testUrl);
    console.log("Origin:", window.location.origin);

    // Test OPTIONS preflight request
    const response = await fetch(testUrl, {
      method: "OPTIONS",
      headers: {
        Origin: window.location.origin,
        "Access-Control-Request-Method": "POST",
        "Access-Control-Request-Headers": "Content-Type",
      },
    });

    console.log("CORS Response Status:", response.status);
    console.log("CORS Response Headers:");

    const corsHeaders = {
      "Access-Control-Allow-Origin": response.headers.get(
        "Access-Control-Allow-Origin"
      ),
      "Access-Control-Allow-Methods": response.headers.get(
        "Access-Control-Allow-Methods"
      ),
      "Access-Control-Allow-Headers": response.headers.get(
        "Access-Control-Allow-Headers"
      ),
      "Access-Control-Allow-Credentials": response.headers.get(
        "Access-Control-Allow-Credentials"
      ),
    };

    console.table(corsHeaders);

    if (response.status === 200 || response.status === 204) {
      console.log("✅ CORS preflight successful");
    } else {
      console.error("❌ CORS preflight failed");
    }
  } catch (error) {
    console.error("❌ CORS test failed:", error);
  }

  console.groupEnd();
};

// Network Debug
export const debugNetwork = () => {
  console.group("🌐 Network Debug");
  console.log("User Agent:", navigator.userAgent);
  console.log("Online:", navigator.onLine);
  console.log(
    "Connection:",
    (navigator as any).connection?.effectiveType || "Unknown"
  );
  console.log("Current URL:", window.location.href);
  console.log("Origin:", window.location.origin);
  console.groupEnd();
};

// Full Debug Suite
export const runFullDebug = async () => {
  console.log("🚀 Starting Full Debug Suite...");

  debugEnvVars();
  debugNetwork();

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  if (backendUrl) {
    await debugCors(backendUrl);
  } else {
    console.error("❌ NEXT_PUBLIC_BACKEND_URL not set!");
  }

  console.log("✅ Debug suite completed");
};

// CORS Workaround for development/testing
export const createCorsProxyUrl = (originalUrl: string) => {
  // Use a public CORS proxy for testing
  return `https://cors-anywhere.herokuapp.com/${originalUrl}`;
};

// Alternative CORS-free login function for testing
export const testLoginWithProxy = async (credentials: any) => {
  console.group("🔧 Testing Login with CORS Proxy");

  try {
    const backendUrl =
      process.env.NEXT_PUBLIC_BACKEND_URL ||
      "https://backend.bizcivitas.com/api/v1";
    const originalUrl = `${backendUrl}/users/login`;
    const proxyUrl = createCorsProxyUrl(originalUrl);

    console.log("Original URL:", originalUrl);
    console.log("Proxy URL:", proxyUrl);

    const response = await fetch(proxyUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Requested-With": "XMLHttpRequest",
      },
      body: JSON.stringify(credentials),
    });

    console.log("Proxy Response Status:", response.status);
    const result = await response.json();
    console.log("Proxy Response Data:", result);

    return result;
  } catch (error) {
    console.error("Proxy login failed:", error);
    throw error;
  } finally {
    console.groupEnd();
  }
};

// Check if CORS proxy is needed
export const shouldUseCorsProxy = () => {
  if (typeof window === "undefined") return false;

  const isProduction =
    window.location.hostname === "bizcivitas-user-panel.vercel.app";
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

  console.log("🔍 CORS Proxy Check:", {
    isProduction,
    hostname: window.location.hostname,
    backendUrl,
    recommendation:
      isProduction && backendUrl?.includes("backend.bizcivitas.com")
        ? "USE PROXY - Production CORS issue detected"
        : "DIRECT - Should work normally",
  });

  return isProduction && backendUrl?.includes("backend.bizcivitas.com");
};

// Quick debug function for development
export const quickDebug = () => {
  console.log("🔧 Quick Debug Info:");
  console.log("Backend URL:", process.env.NEXT_PUBLIC_BACKEND_URL);
  console.log("Environment:", process.env.NODE_ENV);
  console.log(
    "Origin:",
    typeof window !== "undefined" ? window.location.origin : "Server-side"
  );
  if (typeof window !== "undefined") {
    console.log("Should Use CORS Proxy:", shouldUseCorsProxy());
  }
};
