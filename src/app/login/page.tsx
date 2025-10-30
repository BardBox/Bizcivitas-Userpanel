"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import Link from "next/link";
import Image from "next/image";
import PublicRoute from "@/components/auth/PublicRoute";
import { setAccessToken } from "@/lib/auth";
import { setUser } from "../../../store/authSlice";
import { debugLogin, debugApiCall } from "@/utils/debug";
import { Mail, Lock, ArrowRight, Eye, EyeOff } from "lucide-react";

function LoginPageContent() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 px-4 py-12">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-2xl p-8 space-y-8">
          {/* Logo */}
          <div className="flex justify-center">
            <Image src="/favicon.ico" alt="BizCivitas" width={64} height={64} className="rounded-lg" />
          </div>

          <div>
            <h2 className="text-center text-4xl font-extrabold text-gray-900">
              Welcome Back
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Use your credentials which you are using for mobile applications of BizCivitas
            </p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleSubmit} action="javascript:void(0);">
            <div className="space-y-5">
              {/* Email Input */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={loading}
                    className="appearance-none block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    disabled={loading}
                    className="appearance-none block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="rounded-lg bg-red-50 p-4 border border-red-200">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-red-800">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Forgot Password Link */}
            <div className="flex items-center justify-end">
              <Link
                href="/forgot-password"
                className="text-sm font-medium text-blue-600 hover:text-blue-500 transition"
              >
                Forgot your password?
              </Link>
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent rounded-lg text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150 font-semibold text-base shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>

          </form>
        </div>
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
