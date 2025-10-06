"use client";

import { useGetConnectionRequestsQuery } from "@/store/api/userApi";
import React, { useState } from "react";

export default function ConnectionRequestsPage() {
  // State to track active tab
  const [activeTab, setActiveTab] = useState<"sent" | "received">("received");

  // Fetch data based on active tab
  const { data, isLoading, error } = useGetConnectionRequestsQuery(activeTab);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1>Connection Requests</h1>
      <div>
        <button
          onClick={() => setActiveTab("received")}
          className={
            activeTab === "received"
              ? "px-6 py-3 font-medium border-b-2 border-blue-600 text-blue-600"
              : "px-6 py-3 font-medium text-gray-600 hover:text-gray-900"
          }
        >
          Sent Requests
        </button>
      </div>

      {/* Sent Tab */}
      <button
        onClick={() => setActiveTab("sent")}
        className={
          activeTab === "sent"
            ? "px-6 py-3 font-medium border-b-2 border-blue-600 text-blue-600"
            : "px-6 py-3 font-medium text-gray-600 hover:text-gray-900"
        }
      >
        Sent Requests
      </button>
      {/* Tabs will go here */}
      {/* Request cards will go here */}
    </div>
  );
}
