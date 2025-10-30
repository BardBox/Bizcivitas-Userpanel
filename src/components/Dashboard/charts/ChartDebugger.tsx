"use client";

import { useGetReferralsMonthlyCountQuery } from "../../../../store/api/dashboardApi";

export default function ChartDebugger() {
  const { data, isLoading, error, isError } =
    useGetReferralsMonthlyCountQuery();

  if (process.env.NODE_ENV !== "development") {
    return null; // Only show in development
  }

  return (
    <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-4 mb-6">
      <h3 className="font-bold text-yellow-900 mb-2">🔍 Chart Debug Info</h3>
      <div className="text-sm space-y-2">
        <div>
          <span className="font-semibold">Loading:</span>{" "}
          {isLoading ? "Yes" : "No"}
        </div>
        <div>
          <span className="font-semibold">Has Error:</span>{" "}
          {isError ? "Yes" : "No"}
        </div>
        {error && (
          <div>
            <span className="font-semibold">Error:</span>
            <pre className="bg-red-100 p-2 rounded mt-1 overflow-auto text-xs">
              {JSON.stringify(error, null, 2)}
            </pre>
          </div>
        )}
        {data && (
          <div>
            <span className="font-semibold">Data:</span>
            <pre className="bg-green-100 p-2 rounded mt-1 overflow-auto text-xs max-h-40">
              {JSON.stringify(data, null, 2)}
            </pre>
          </div>
        )}
        {!isLoading && !data && !error && (
          <div className="text-orange-700">No data returned from API</div>
        )}
        <div className="mt-2 pt-2 border-t border-yellow-300">
          <span className="font-semibold">API Endpoint:</span> /referrals/monthly-count
        </div>
        <div>
          <span className="font-semibold">Backend URL:</span>{" "}
          {process.env.NEXT_PUBLIC_BACKEND_URL || "NOT SET"}
        </div>
        <div>
          <span className="font-semibold">Auth Token:</span>{" "}
          {typeof window !== "undefined" && localStorage.getItem("accessToken")
            ? "Present ✓"
            : "Missing ✗"}
        </div>
      </div>
    </div>
  );
}
