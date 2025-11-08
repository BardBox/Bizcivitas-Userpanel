import React from "react";

interface RewardModalProps {
  isOpen: boolean;
  onClose: () => void;
  message: string;
}

export default function RewardModal({ isOpen, onClose, message }: RewardModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-2xl p-6 shadow-xl max-w-sm w-full mx-4">
        <p className="text-gray-600 text-center text-base mb-6 leading-relaxed">
          {message}
        </p>
        <button
          onClick={onClose}
          className="w-full bg-[#ff9d00] text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-[#ea580c] transition-colors"
        >
          OK
        </button>
      </div>
    </div>
  );
}
