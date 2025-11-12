"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import Link from "next/link";
import Image from "next/image";
import PublicRoute from "@/components/auth/PublicRoute";
import { setAccessToken } from "@/lib/auth";
import { setUser } from "../../store/authSlice";
import { debugLogin, debugApiCall } from "@/utils/debug";
import { Mail, Lock, ArrowRight, Eye, EyeOff } from "lucide-react";

function HomePageContent() {
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
    e.stopPropagation();

    setLoading(true);
    setError("");

    try {
      const backendUrl =
        process.env.NEXT_PUBLIC_BACKEND_URL ||
        (process.env.NODE_ENV === "development"
          ? "http://localhost:3000"
          : (() => {
              throw new Error(
                "NEXT_PUBLIC_BACKEND_URL environment variable is not set. This is required for authentication to work."
              );
            })());
      const loginUrl = `${backendUrl}/users/login`;

      debugLogin(formData, loginUrl);

      const requestOptions = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include" as RequestCredentials,
        body: JSON.stringify(formData),
      };

      debugApiCall(loginUrl, requestOptions, "Login Request");

      const response = await fetch(loginUrl, requestOptions);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();

      if (data?.data?.user) {
        const user = data.data.user;

        localStorage.setItem("user", JSON.stringify(user));
        dispatch(setUser(user));

        let token = null;
        if (data?.data?.accessToken) {
          token = data.data.accessToken;
        } else if (data?.accessToken) {
          token = data.accessToken;
        } else if (data?.token) {
          token = data.token;
        }

        if (token) {
          setAccessToken(token);
          localStorage.setItem("accessToken", token);
        }
        if (user.role) {
          localStorage.setItem("role", user.role);
        }

        let fcmToken = data?.data?.fcmToken || data?.fcmToken;
        if (!fcmToken && data?.data?.user?.fcmToken) {
          fcmToken = data.data.user.fcmToken;
        }

        if (fcmToken) {
          const existingToken = localStorage.getItem("fcmToken");
          if (existingToken !== fcmToken) {
            try {
              const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

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

              await fetch(`${backendUrl}/users/add-fcm-token`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
                credentials: "include",
                body: JSON.stringify({
                  token: fcmToken,
                  deviceId: window.navigator.userAgent,
                  timestamp: new Date().toISOString(),
                }),
              });

              localStorage.setItem("fcmToken", fcmToken);
            } catch (error) {
              console.error("Error managing FCM token:", error);
            }
          }
        }
      }

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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 px-4 py-12 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-blue-200/30 to-transparent rounded-full blur-3xl animate-pulse"></div>
        <div
          className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-purple-200/30 to-transparent rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>
      </div>

      <div className="max-w-md w-full relative z-10">
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 space-y-8 transform transition-all duration-300 hover:shadow-3xl">
          {/* Logo with animation */}
          <div className="flex justify-center">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity"></div>
              <div className="relative bg-white rounded-2xl p-3 transform transition-transform group-hover:scale-105">
                <Image
                  src="/favicon.ico"
                  alt="BizCivitas"
                  width={64}
                  height={64}
                  className="rounded-lg"
                />
              </div>
            </div>
          </div>

          {/* Header */}
          <div className="space-y-3">
            <h2 className="text-center text-4xl font-extrabold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Welcome Back
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600 max-w-sm mx-auto leading-relaxed">
              Use your credentials which you are using for mobile applications
              of BizCivitas
            </p>
          </div>

          <form
            className="mt-8 space-y-6"
            onSubmit={handleSubmit}
            action="javascript:void(0);"
          >
            <div className="space-y-5">
              {/* Email Input */}
              <div className="group">
                <label
                  htmlFor="email"
                  className="block text-sm font-semibold text-gray-700 mb-2 transition-colors group-focus-within:text-blue-600"
                >
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors group-focus-within:text-blue-600">
                    <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
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
                    className="appearance-none block w-full pl-10 pr-3 py-3.5 border-2 border-gray-200 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed bg-gray-50 focus:bg-white hover:border-gray-300"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="group">
                <label
                  htmlFor="password"
                  className="block text-sm font-semibold text-gray-700 mb-2 transition-colors group-focus-within:text-blue-600"
                >
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors">
                    <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
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
                    className="appearance-none block w-full pl-10 pr-12 py-3.5 border-2 border-gray-200 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed bg-gray-50 focus:bg-white hover:border-gray-300"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center hover:scale-110 transition-transform"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="rounded-xl bg-gradient-to-r from-red-50 to-red-100/50 p-4 border-2 border-red-200 animate-shake">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="h-6 w-6 rounded-full bg-red-100 flex items-center justify-center">
                      <svg
                        className="h-4 w-4 text-red-600"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-3 flex-1">
                    <p className="text-sm font-semibold text-red-800">
                      {error}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Forgot Password Link */}
            <div className="flex items-center justify-end">
              <Link
                href="/forgot-password"
                className="text-sm font-semibold text-blue-600 hover:text-blue-700 transition-all hover:underline decoration-2 underline-offset-2"
              >
                Forgot your password?
              </Link>
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center items-center py-3.5 px-6 border border-transparent rounded-xl text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-4 focus:ring-blue-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-semibold text-base shadow-lg hover:shadow-2xl transform hover:-translate-y-0.5 active:translate-y-0 overflow-hidden"
            >
              <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-blue-700 to-indigo-700 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></span>
              <span className="relative flex items-center justify-center">
                {loading ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-200" />
                  </>
                )}
              </span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <PublicRoute>
      <HomePageContent />
    </PublicRoute>
  );
}
