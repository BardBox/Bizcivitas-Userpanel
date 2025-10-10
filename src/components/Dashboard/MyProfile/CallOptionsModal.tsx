"use client";

import React, { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { X, Phone, MessageCircle, Copy } from "lucide-react";

interface CallOptionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  phoneNumber: string;
  userName: string;
  onCopySuccess?: () => void;
}

const CallOptionsModal: React.FC<CallOptionsModalProps> = ({
  isOpen,
  onClose,
  phoneNumber,
  userName,
  onCopySuccess,
}) => {
  const modalRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      // Prevent body scroll when modal is open
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const formatPhoneNumber = (phone: string) => {
    // Remove any non-digit characters for the links
    return phone.replace(/\D/g, "");
  };

  const handleCopyNumber = async () => {
    try {
      await navigator.clipboard.writeText(phoneNumber);
      if (onCopySuccess) {
        onCopySuccess();
      }
      onClose();
    } catch (error) {
      console.error("Failed to copy:", error);
      alert("Failed to copy phone number");
    }
  };

  const callOptions = [
    {
      name: "Direct Call",
      description: "Phone app",
      icon: Phone,
      bgColor: "bg-[#4a62ad]", // Brand blue
      hoverColor: "hover:bg-[#3d5191]",
      action: () => {
        window.open(`tel:${formatPhoneNumber(phoneNumber)}`, "_blank");
        onClose();
      },
    },
    {
      name: "WhatsApp",
      description: "Message",
      icon: MessageCircle,
      bgColor: "bg-[#22c55e]", // Brand green
      hoverColor: "hover:bg-[#16a34a]",
      action: () => {
        const message = encodeURIComponent(
          `Hi ${userName}, I got your contact from BizCivitas. I'd like to connect with you!`
        );
        window.open(
          `https://wa.me/${formatPhoneNumber(phoneNumber)}?text=${message}`,
          "_blank"
        );
        onClose();
      },
    },
    {
      name: "Copy Number",
      description: "Clipboard",
      icon: Copy,
      bgColor: "bg-[#f97316]", // Brand orange (primary button color)
      hoverColor: "hover:bg-[#ea580c]",
      action: handleCopyNumber,
    },
  ];

  const modalContent = (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-[9998] transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
        <div
          ref={modalRef}
          className="bg-white rounded-xl shadow-2xl max-w-md w-[80%] md:w-full overflow-hidden animate-scale-in border border-[#e2e8f0]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-[#4a62ad] to-[#3d5191] text-white p-4 sm:p-6 relative">
            <button
              onClick={onClose}
              className="absolute top-3 right-3 sm:top-4 sm:right-4 text-white hover:bg-white/20 rounded-full p-1.5 sm:p-2 transition-colors"
              aria-label="Close"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            <div className="pr-8 sm:pr-10">
              <h2 className="text-base sm:text-xl font-bold mb-0.5 sm:mb-1">
                Contact {userName}
              </h2>
              <p className="text-white/90 text-sm sm:text-base font-medium">
                {phoneNumber}
              </p>
            </div>
          </div>

          {/* Options */}
          <div className="p-4 sm:p-6">
            <p className="text-gray-700 text-xs sm:text-sm font-medium mb-3 sm:mb-4">
              Choose how you'd like to connect:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
              {callOptions.map((option, index) => {
                const IconComponent = option.icon;
                return (
                  <button
                    key={index}
                    onClick={option.action}
                    className={`${option.bgColor} ${option.hoverColor} text-white rounded-lg p-3 sm:p-4 text-center transition-all transform hover:scale-105 active:scale-95 shadow-md hover:shadow-lg flex flex-col items-center justify-center`}
                  >
                    <div className="bg-white/20 rounded-full p-2 sm:p-3 mb-2 sm:mb-3">
                      <IconComponent className="w-4 h-4 sm:w-6 sm:h-6" />
                    </div>
                    <div className="font-semibold text-xs sm:text-sm mb-0.5 sm:mb-1">
                      {option.name}
                    </div>
                    <div className="text-[10px] sm:text-xs opacity-90">
                      {option.description}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Footer */}
          <div className="bg-[#f8fafc] px-4 sm:px-6 py-3 sm:py-4 border-t border-[#e2e8f0]">
            <button
              onClick={onClose}
              className="w-full bg-white border-2 border-[#e2e8f0] hover:bg-[#f1f5f9] text-[#475569] font-medium py-2 sm:py-3 rounded-lg transition-colors text-sm sm:text-base"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-scale-in {
          animation: scale-in 0.2s ease-out;
        }
      `}</style>
    </>
  );

  // Use portal to render modal at document root level, bypassing parent overflow-hidden
  return typeof document !== "undefined"
    ? createPortal(modalContent, document.body)
    : null;
};

export default CallOptionsModal;
