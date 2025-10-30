"use client";

import React from "react";
import { X, AlertTriangle } from "lucide-react";

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  isDeleting?: boolean;
}

export default function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Delete Post",
  message = "Are you sure you want to delete this post? This action cannot be undone.",
  isDeleting = false,
}: DeleteConfirmModalProps) {
  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Click outside to close */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md mx-4 overflow-hidden animate-fadeIn">
        {/* Decorative gradient header */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 via-red-600 to-red-500" />

        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-gradient-to-br from-red-100 to-red-200 rounded-2xl shadow-sm">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
              <p className="text-xs text-gray-500 mt-0.5">This action is permanent</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="p-2 hover:bg-gray-100 rounded-full transition-all hover:rotate-90 duration-300 disabled:opacity-50"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 pb-6">
          <p className="text-sm text-gray-700 mb-5 bg-red-50 p-4 rounded-xl border border-red-100">
            {message}
          </p>

          <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
            <p className="text-xs text-gray-600">
              <strong>Note:</strong> Once deleted, this post will be permanently removed from the system and cannot be recovered.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 px-6 py-4 bg-gray-50 border-t border-gray-100">
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-white border border-gray-300 rounded-xl transition-all disabled:opacity-50 hover:shadow-sm"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={isDeleting}
            className={`px-6 py-2.5 text-sm font-semibold text-white rounded-xl transition-all transform hover:scale-105 ${
              isDeleting
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 shadow-lg hover:shadow-xl"
            }`}
          >
            {isDeleting ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Deleting...</span>
              </div>
            ) : (
              "Delete Post"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
