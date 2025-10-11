"use client";

import { useState } from "react";
import {
  debugEnvVars,
  debugCors,
  debugNetwork,
  runFullDebug,
  quickDebug,
  createCorsProxyUrl,
  testLoginWithProxy,
  shouldUseCorsProxy,
} from "@/utils/debug";

export default function DebugPage() {
  const [corsResult, setCorsResult] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const handleCorsTest = async () => {
    setLoading(true);
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
      if (backendUrl) {
        await debugCors(backendUrl);
        setCorsResult("CORS test completed - check console");
      } else {
        setCorsResult("❌ NEXT_PUBLIC_BACKEND_URL not set");
      }
    } catch (error) {
      setCorsResult(`❌ Error: ${error}`);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          🔍 Debug Panel
        </h1>

        {/* Environment Variables */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Environment Variables</h2>
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <strong>NEXT_PUBLIC_BACKEND_URL:</strong>
                <code className="ml-2 text-sm bg-gray-100 px-2 py-1 rounded">
                  {process.env.NEXT_PUBLIC_BACKEND_URL || "❌ NOT SET"}
                </code>
              </div>
              <div>
                <strong>NODE_ENV:</strong>
                <code className="ml-2 text-sm bg-gray-100 px-2 py-1 rounded">
                  {process.env.NODE_ENV || "❌ NOT SET"}
                </code>
              </div>
            </div>
          </div>
          <button
            onClick={debugEnvVars}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Log All Env Vars to Console
          </button>
        </div>

        {/* Network Info */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Network Information</h2>
          <div className="space-y-2">
            <div>
              <strong>Origin:</strong>{" "}
              {typeof window !== "undefined"
                ? window.location.origin
                : "Server-side"}
            </div>
            <div>
              <strong>Current URL:</strong>{" "}
              {typeof window !== "undefined"
                ? window.location.href
                : "Server-side"}
            </div>
            <div>
              <strong>Online Status:</strong>{" "}
              {typeof window !== "undefined" && navigator.onLine
                ? "✅ Online"
                : "❌ Offline"}
            </div>
          </div>
          <button
            onClick={debugNetwork}
            className="mt-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Log Network Info to Console
          </button>
        </div>

        {/* CORS Testing */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">CORS Testing</h2>
          <p className="text-gray-600 mb-4">
            Test if the backend allows requests from this origin
          </p>
          <div className="space-x-4 mb-4">
            <button
              onClick={handleCorsTest}
              disabled={loading}
              className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 disabled:opacity-50"
            >
              {loading ? "Testing..." : "Test CORS"}
            </button>
            <button
              onClick={() => {
                console.log("CORS Proxy Check:", shouldUseCorsProxy());
                const exampleUrl =
                  process.env.NEXT_PUBLIC_BACKEND_URL + "/users/login";
                console.log("Original URL:", exampleUrl);
                console.log("Proxy URL:", createCorsProxyUrl(exampleUrl));
              }}
              className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
            >
              Check Proxy Need
            </button>
            <button
              onClick={async () => {
                try {
                  await testLoginWithProxy({
                    email: "test@example.com",
                    password: "testpassword",
                  });
                } catch (error) {
                  console.error("Proxy test failed:", error);
                }
              }}
              className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700"
            >
              Test Login via Proxy
            </button>
          </div>
          {corsResult && (
            <div className="mt-4 p-3 bg-gray-100 rounded">
              <code>{corsResult}</code>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="space-x-4">
            <button
              onClick={quickDebug}
              className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700"
            >
              Quick Debug
            </button>
            <button
              onClick={runFullDebug}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Run Full Debug Suite
            </button>
          </div>
        </div>

        {/* Login Test */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">🔐 Login Test</h2>
          <p className="text-gray-600 mb-4">
            Test direct login to backend with test credentials
          </p>
          <button
            onClick={async () => {
              try {
                const backendUrl =
                  process.env.NEXT_PUBLIC_BACKEND_URL ||
                  "https://backend.bizcivitas.com/api/v1";
                const loginUrl = `${backendUrl}/users/login`;

                console.log("🔐 Testing login to:", loginUrl);

                const response = await fetch(loginUrl, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  credentials: "include",
                  body: JSON.stringify({
                    email: "devenoza9@gmail.com",
                    password: "Password@123",
                  }),
                });

                console.log("✅ Response Status:", response.status);
                console.log(
                  "✅ Response Headers:",
                  Object.fromEntries(response.headers.entries())
                );

                if (response.ok) {
                  const data = await response.json();
                  console.log("✅ Login Success:", data);
                  alert("✅ Login successful! Check console for details.");

                  // Store token if present
                  const token =
                    data?.data?.accessToken || data?.accessToken || data?.token;
                  if (token) {
                    localStorage.setItem("accessToken", token);
                    console.log("✅ Token stored in localStorage");
                  }
                } else {
                  const errorText = await response.text();
                  console.error("❌ Login Failed:", errorText);
                  alert(`❌ Login failed: ${response.status} - ${errorText}`);
                }
              } catch (error) {
                console.error("❌ Login Error:", error);
                alert(
                  `❌ Error: ${
                    error instanceof Error ? error.message : String(error)
                  }`
                );
              }
            }}
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 font-semibold"
          >
            🚀 Test Login (devenoza9@gmail.com)
          </button>
          <div className="bg-blue-50 border border-blue-200 rounded p-4 mt-4">
            <p className="text-sm text-blue-800">
              💡 <strong>Credentials:</strong> devenoza9@gmail.com /
              Password@123
            </p>
            <p className="text-sm text-blue-800 mt-2">
              Check browser console (F12) for detailed request/response logs
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
