"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import Link from "next/link";
import PublicRoute from "@/components/auth/PublicRoute";
import { setAccessToken } from "@/lib/auth";
import { setUser } from "../../../store/authSlice";
import { debugLogin, debugApiCall, quickDebug } from "@/utils/debug";

function LoginPageContent() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const dispatch = useDispatch();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent any parent handlers

    console.log("🔥 handleSubmit called!"); // Debug log
    console.log("📋 Form data:", formData);

    setLoading(true);
    setError("");

    try {
      const backendUrl =
        process.env.NEXT_PUBLIC_BACKEND_URL ||
        (process.env.NODE_ENV === "development"
          ? "http://localhost:3000" // Development fallback
          : (() => {
              throw new Error(
                "NEXT_PUBLIC_BACKEND_URL environment variable is not set. This is required for authentication to work."
              );
            })());
      const loginUrl = `${backendUrl}/users/login`;

      // 🔍 Debug login attempt
      debugLogin(formData, loginUrl);

      const requestOptions = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include" as RequestCredentials, // for HttpOnly cookies
        body: JSON.stringify(formData),
      };

      // 🔍 Debug API call
      debugApiCall(loginUrl, requestOptions, "Login Request");

      const response = await fetch(loginUrl, requestOptions);

      console.log("🔍 Login Response:", {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        url: response.url,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();

      if (data?.data?.user) {
        const user = data.data.user;

        // Save user data to localStorage (without FCM tokens)
        localStorage.setItem("user", JSON.stringify(user));

        // Dispatch user to Redux store
        dispatch(setUser(user));

        // Store accessToken and role efficiently
        let token = null;
        if (data?.data?.accessToken) {
          token = data.data.accessToken;
        } else if (data?.accessToken) {
          token = data.accessToken;
        } else if (data?.token) {
          token = data.token;
        }

        if (token) {
          // Store in both memory and localStorage for speed
          setAccessToken(token);
          localStorage.setItem("accessToken", token);
        }
        if (user.role) {
          localStorage.setItem("role", user.role);
        }

        // Handle FCM token from response
        let fcmToken = data?.data?.fcmToken || data?.fcmToken;
        if (!fcmToken && data?.data?.user?.fcmToken) {
          fcmToken = data.data.user.fcmToken;
        }

        if (fcmToken) {
          // Check if this is a new token
          const existingToken = localStorage.getItem("fcmToken");
          if (existingToken !== fcmToken) {
            console.log("New FCM token detected, updating..."); // Debug log

            try {
              const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

              // First, remove old token if it exists
              if (existingToken) {
                await fetch(`${backendUrl}/users/remove-fcm-token`, {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                  },
                  credentials: "include",
                  body: JSON.stringify({ token: existingToken }),
                });
              }

              // Then add new token
              await fetch(`${backendUrl}/users/add-fcm-token`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
                credentials: "include",
                body: JSON.stringify({
                  token: fcmToken,
                  deviceId: window.navigator.userAgent, // Add device identifier
                  timestamp: new Date().toISOString(), // Add timestamp
                }),
              });

              // Only store the token after successful registration
              localStorage.setItem("fcmToken", fcmToken);
            } catch (error) {
              console.error("Error managing FCM token:", error);
            }
          } else {
            console.log("Using existing FCM token"); // Debug log
          }
        }
      }

      // Use immediate client-side navigation
      router.replace("/feeds");
    } catch (err) {
      const error = err as Error;
      if (error.message.includes("401")) {
        setError("Invalid email or password.");
      } else if (error.message.includes("403")) {
        setError("Account not activated. Please check your email.");
      } else if (
        error.name === "TypeError" &&
        error.message.includes("fetch")
      ) {
        setError(
          "Network error: Cannot connect to server. Please check your connection."
        );
      } else {
        setError(`Login failed: ${error.message}. Please try again.`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-indigo-100">
            <svg
              className="h-6 w-6 text-indigo-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Sign in to BizCivitas
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Welcome back to the business community
          </p>
        </div>

        <form
          className="mt-8 space-y-6"
          onSubmit={handleSubmit}
          action="javascript:void(0);"
        >
          <div className="rounded-md shadow-sm -space-y-px">
            <input
              id="email"
              name="email"
              type="email"
              required
              placeholder="Email address"
              value={formData.email}
              onChange={handleChange}
              disabled={loading}
              className="appearance-none rounded-none relative block w-full px-3 py-2 border 
                         border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md 
                         focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
            <input
              id="password"
              name="password"
              type="password"
              required
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              disabled={loading}
              className="appearance-none rounded-none relative block w-full px-3 py-2 border 
                         border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md 
                         focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 p-2 rounded">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent 
                       rounded-md text-white bg-indigo-600 hover:bg-indigo-700 
                       focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 
                       disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>

          {/* Debug Button - Only in development */}
          {process.env.NODE_ENV !== "production" && (
            <button
              type="button"
              onClick={quickDebug}
              className="w-full flex justify-center py-1 px-2 border border-gray-300 
                         rounded-md text-gray-600 bg-gray-100 hover:bg-gray-200 
                         text-xs"
            >
              🔍 Debug Info (Check Console)
            </button>
          )}

          <div className="flex items-center justify-between text-sm">
            <Link
              href="/forgot-password"
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              Forgot password?
            </Link>
            <Link
              href="/register"
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              Create account
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <PublicRoute>
      <LoginPageContent />
    </PublicRoute>
  );
}
