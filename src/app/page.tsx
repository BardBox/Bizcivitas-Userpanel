"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const backendUrl =
        process.env.NEXT_PUBLIC_BACKEND_URL ||
        "https://dev-backend.bizcivitas.com/api/v1";
      const response = await fetch(`${backendUrl}/users/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // for HttpOnly cookies
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();

      if (data?.data?.user) {
        const user = data.data.user;
        // Store accessToken and role in localStorage only
        let token = null;
        if (data?.data?.accessToken) {
          token = data.data.accessToken;
        } else if (data?.accessToken) {
          token = data.accessToken;
        } else if (data?.token) {
          token = data.token;
        }
        if (token) {
          localStorage.setItem("accessToken", token);
        }
        if (user.role) {
          localStorage.setItem("role", user.role);
        }
      }

      // Use client-side navigation for speed
      router.push("/feeds");
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
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full ">
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

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
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
