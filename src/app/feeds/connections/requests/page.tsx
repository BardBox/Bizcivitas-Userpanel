"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Inbox, Send, XCircle } from "lucide-react";
import {
  useGetConnectionRequestsQuery,
  useAcceptConnectionRequestMutation,
  useDeleteConnectionMutation,
} from "@/store/api";
import { useAppDispatch } from "../../../../../store/hooks";
import { addToast } from "../../../../../store/toastSlice";
import ConnectionRequestCard from "@/components/Dashboard/Connections/SendAcceptRequest/ConnectionRequestCard";

export default function ConnectionRequestsPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [activeTab, setActiveTab] = useState<"sent" | "received">("received");

  // Fetch active tab data
  const {
    data: activeData,
    isLoading,
    error,
    refetch,
  } = useGetConnectionRequestsQuery(activeTab);

  // Fetch both tabs for badge counts
  const { data: sentData } = useGetConnectionRequestsQuery("sent");
  const { data: receivedData } = useGetConnectionRequestsQuery("received");

  // Mutations
  const [acceptConnection] = useAcceptConnectionRequestMutation();
  const [deleteConnection] = useDeleteConnectionMutation();

  // Extract requests
  const requests = activeData?.data?.connections || [];
  const sentCount = sentData?.data?.connections?.length || 0;
  const receivedCount = receivedData?.data?.connections?.length || 0;

  // Track processing state
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());

  // Handle Accept
  const handleAccept = async (connectionId: string) => {
    setProcessingIds((prev) => new Set(prev).add(connectionId));
    try {
      await acceptConnection({ connectionId }).unwrap();

      // Small delay to allow cache invalidation to complete
      setTimeout(() => {
        dispatch(
          addToast({
            type: "success",
            message: "Connection request accepted! Check your connections.",
            duration: 3000, // Reduced from 4000ms to 3000ms
          })
        );
      }, 500);

      refetch();
    } catch (error: any) {
      dispatch(
        addToast({
          type: "error",
          message: error?.data?.message || "Failed to accept request",
          duration: 3000,
        })
      );
    } finally {
      setProcessingIds((prev) => {
        const next = new Set(prev);
        next.delete(connectionId);
        return next;
      });
    }
  };

  // Handle Reject
  const handleReject = async (connectionId: string) => {
    setProcessingIds((prev) => new Set(prev).add(connectionId));
    try {
      await deleteConnection({ connectionId }).unwrap();
      dispatch(
        addToast({
          type: "success",
          message: "Connection request rejected",
          duration: 3000,
        })
      );
      refetch();
    } catch (error: any) {
      dispatch(
        addToast({
          type: "error",
          message: error?.data?.message || "Failed to reject request",
          duration: 3000,
        })
      );
    } finally {
      setProcessingIds((prev) => {
        const next = new Set(prev);
        next.delete(connectionId);
        return next;
      });
    }
  };

  // Handle Withdraw
  const handleWithdraw = async (connectionId: string) => {
    setProcessingIds((prev) => new Set(prev).add(connectionId));
    try {
      await deleteConnection({ connectionId }).unwrap();
      dispatch(
        addToast({
          type: "success",
          message: "Connection request cancelled",
          duration: 3000,
        })
      );
      refetch();
    } catch (error: any) {
      dispatch(
        addToast({
          type: "error",
          message: error?.data?.message || "Failed to cancel request",
          duration: 3000,
        })
      );
    } finally {
      setProcessingIds((prev) => {
        const next = new Set(prev);
        next.delete(connectionId);
        return next;
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Top Bar */}
          <div className="py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push("/feeds/connections")}
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Back
              </button>
              <h1 className="text-2xl font-bold text-gray-900">
                Connection Requests
              </h1>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 border-b border-gray-200">
            {/* Received Tab */}
            <button
              onClick={() => setActiveTab("received")}
              className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors ${
                activeTab === "received"
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <Inbox className="h-5 w-5" />
              Received
              {receivedCount > 0 && (
                <span className="bg-blue-100 text-blue-600 px-2 py-1 rounded-full text-xs font-semibold">
                  {receivedCount}
                </span>
              )}
            </button>

            {/* Sent Tab */}
            <button
              onClick={() => setActiveTab("sent")}
              className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors ${
                activeTab === "sent"
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <Send className="h-5 w-5" />
              Sent
              {sentCount > 0 && (
                <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs font-semibold">
                  {sentCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Loading State */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-blue-600"></div>
              <div className="absolute inset-0 rounded-full h-16 w-16 border-4 border-transparent border-t-blue-400 animate-ping opacity-20"></div>
            </div>
            <p className="text-gray-600 mt-6 text-lg font-medium">
              Loading {activeTab} requests...
            </p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-white rounded-2xl border border-red-200 shadow-lg p-8 text-center">
            <div className="bg-red-50 rounded-full p-4 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
              <XCircle className="h-10 w-10 text-red-500" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Oops! Something went wrong
            </h3>
            <p className="text-gray-600 mb-6">
              We couldn't load your connection requests. Please try again.
            </p>
            <button
              onClick={() => refetch()}
              className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-all duration-200 font-semibold shadow-md hover:shadow-lg hover:scale-105"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && requests.length === 0 && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-md p-12 text-center">
            {activeTab === "received" ? (
              <>
                <div className="bg-blue-50 rounded-full p-6 w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                  <Inbox className="h-12 w-12 text-blue-500" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  No Received Requests
                </h3>
                <p className="text-gray-600 mb-8 max-w-md mx-auto">
                  You don't have any pending connection requests at the moment.
                  Check back later or start exploring members!
                </p>
              </>
            ) : (
              <>
                <div className="bg-gray-50 rounded-full p-6 w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                  <Send className="h-12 w-12 text-gray-500" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  No Sent Requests
                </h3>
                <p className="text-gray-600 mb-8 max-w-md mx-auto">
                  You haven't sent any connection requests yet. Start building
                  your network today!
                </p>
              </>
            )}
            <button
              onClick={() => router.push("/feeds/connections")}
              className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-all duration-200 font-semibold shadow-md hover:shadow-lg hover:scale-105"
            >
              Browse Members
            </button>
          </div>
        )}

        {/* Requests List */}
        {!isLoading && !error && requests.length > 0 && (
          <div className="space-y-3">
            <div className="mb-4">
              <p className="text-sm text-gray-600">
                {requests.length}{" "}
                {requests.length === 1 ? "request" : "requests"} found
              </p>
            </div>
            {requests.map((request) => (
              <ConnectionRequestCard
                key={request.connectionId}
                request={request}
                onAccept={handleAccept}
                onReject={handleReject}
                onWithdraw={handleWithdraw}
                isProcessing={processingIds.has(request.connectionId)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
