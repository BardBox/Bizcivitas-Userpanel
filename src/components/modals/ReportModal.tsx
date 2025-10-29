"use client";

import React, { useState } from "react";
import { X, AlertTriangle } from "lucide-react";

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (reason: string) => Promise<void>;
  type: "comment" | "post";
}

const reportReasons = [
  { value: "spam", label: "Spam or misleading" },
  { value: "inappropriate", label: "Inappropriate content" },
  { value: "hate speech", label: "Hate speech or harassment" },
  { value: "misinformation", label: "False information" },
  { value: "other", label: "Other" },
];

export default function ReportModal({
  isOpen,
  onClose,
  onSubmit,
  type,
}: ReportModalProps) {
  const [selectedReason, setSelectedReason] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!selectedReason) return;

    setIsSubmitting(true);
    try {
      await onSubmit(selectedReason);
      setSelectedReason("");
      onClose();
    } catch (error) {
      console.error("Failed to submit report:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setSelectedReason("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center  backdrop-blur-sm p-4">
      {/* Click outside to close */}
      <div
        className="absolute inset-0"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md mx-4 overflow-hidden animate-fadeIn">
        {/* Decorative gradient header */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 via-orange-500 to-red-500" />

        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-gradient-to-br from-red-100 to-orange-100 rounded-2xl shadow-sm">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Report {type === "comment" ? "Comment" : "Post"}
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">Help us keep the community safe</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-all hover:rotate-90 duration-300"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 pb-6">
          <p className="text-sm text-gray-600 mb-5 bg-blue-50 p-3 rounded-xl border border-blue-100">
            <span className="font-medium text-blue-900">Anonymous Report:</span> Your identity will remain confidential.
          </p>

          <div className="space-y-3">
            {reportReasons.map((reason, index) => (
              <label
                key={reason.value}
                className={`flex items-center p-4 border-2 rounded-2xl cursor-pointer transition-all duration-200 transform hover:scale-[1.02] ${
                  selectedReason === reason.value
                    ? "border-red-500 bg-gradient-to-r from-red-50 to-orange-50 shadow-md"
                    : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                }`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <input
                  type="radio"
                  name="reason"
                  value={reason.value}
                  checked={selectedReason === reason.value}
                  onChange={(e) => setSelectedReason(e.target.value)}
                  className="w-5 h-5 text-red-600 focus:ring-red-500 focus:ring-2"
                />
                <span className={`ml-3 text-sm font-medium ${
                  selectedReason === reason.value ? "text-red-900" : "text-gray-700"
                }`}>
                  {reason.label}
                </span>
                {selectedReason === reason.value && (
                  <span className="ml-auto text-red-500">✓</span>
                )}
              </label>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 px-6 py-4 bg-gray-50 border-t border-gray-100">
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-white border border-gray-300 rounded-xl transition-all disabled:opacity-50 hover:shadow-sm"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!selectedReason || isSubmitting}
            className={`px-6 py-2.5 text-sm font-semibold text-white rounded-xl transition-all transform hover:scale-105 ${
              !selectedReason || isSubmitting
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 shadow-lg hover:shadow-xl"
            }`}
          >
            {isSubmitting ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Reporting...</span>
              </div>
            ) : (
              "Submit Report"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}