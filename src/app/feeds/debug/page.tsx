"use client";

import { useGetCurrentUserQuery } from "../../../../store/api/userApi";

export default function DebugPage() {
  const { data, isLoading, error } = useGetCurrentUserQuery();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">API Debug Page</h1>

      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold">Environment Variables:</h2>
          <p>
            NEXT_PUBLIC_BACKEND_URL:{" "}
            {process.env.NEXT_PUBLIC_BACKEND_URL || "Not set"}
          </p>
        </div>

        <div>
          <h2 className="text-lg font-semibold">Cookies (document.cookie):</h2>
          <pre className="bg-gray-100 p-2 text-sm">
            {typeof window !== "undefined"
              ? document.cookie || "No cookies found"
              : "SSR"}
          </pre>
        </div>

        <div>
          <h2 className="text-lg font-semibold">API Call Status:</h2>
          <p>Loading: {isLoading.toString()}</p>
          <p>Has Data: {!!data}</p>
          <p>Has Error: {!!error}</p>
        </div>

        {error && (
          <div>
            <h2 className="text-lg font-semibold text-red-600">
              Error Details:
            </h2>
            <pre className="bg-red-50 p-2 text-sm overflow-auto">
              {JSON.stringify(error, null, 2)}
            </pre>
          </div>
        )}

        {data && (
          <div>
            <h2 className="text-lg font-semibold text-green-600">
              Success Data:
            </h2>
            <pre className="bg-green-50 p-2 text-sm overflow-auto">
              {JSON.stringify(data, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
