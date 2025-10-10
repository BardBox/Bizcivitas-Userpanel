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
  const previouslyFocusedElement = useRef<HTMLElement | null>(null);

  // Handle body scroll lock
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

  // Handle Escape key press
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  // Handle focus management and focus trap
  useEffect(() => {
    if (!isOpen || !modalRef.current) return;

    // Store the previously focused element
    previouslyFocusedElement.current = document.activeElement as HTMLElement;

    // Get all focusable elements within the modal
    const getFocusableElements = () => {
      if (!modalRef.current) return [];

      const focusableSelectors = [
        "button:not([disabled])",
        "a[href]",
        "input:not([disabled])",
        "select:not([disabled])",
        "textarea:not([disabled])",
        '[tabindex]:not([tabindex="-1"])',
      ].join(", ");

      return Array.from(
        modalRef.current.querySelectorAll(focusableSelectors)
      ) as HTMLElement[];
    };

    // Focus the first focusable element
    const focusableElements = getFocusableElements();
    if (focusableElements.length > 0) {
      focusableElements[0].focus();
    }

    // Tab trap handler
    const handleTabKey = (event: KeyboardEvent) => {
      if (event.key !== "Tab") return;

      const focusableElements = getFocusableElements();
      if (focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      // Shift + Tab: move focus to last element if on first
      if (event.shiftKey) {
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
        }
      }
      // Tab: move focus to first element if on last
      else {
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement.focus();
        }
      }
    };

    document.addEventListener("keydown", handleTabKey);

    // Cleanup: restore focus to previously focused element
    return () => {
      document.removeEventListener("keydown", handleTabKey);

      if (previouslyFocusedElement.current) {
        previouslyFocusedElement.current.focus();
      }
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const formatPhoneNumber = (phone: string) => {
    // Remove any non-digit characters for the links
    return phone.replace(/\D/g, "");
  };

  const handleCopyNumber = async () => {
    try {
      // Check if modern Clipboard API is available
      if (
        typeof navigator !== "undefined" &&
        navigator.clipboard &&
        typeof navigator.clipboard.writeText === "function"
      ) {
        // Use modern Clipboard API
        await navigator.clipboard.writeText(phoneNumber);
        if (onCopySuccess) {
          onCopySuccess();
        }
        onClose();
      } else {
        // Fallback for older browsers or when Clipboard API is unavailable
        const textArea = document.createElement("textarea");
        textArea.value = phoneNumber;

        // Make the textarea invisible and non-interactive
        textArea.style.position = "fixed";
        textArea.style.top = "0";
        textArea.style.left = "0";
        textArea.style.width = "2em";
        textArea.style.height = "2em";
        textArea.style.padding = "0";
        textArea.style.border = "none";
        textArea.style.outline = "none";
        textArea.style.boxShadow = "none";
        textArea.style.background = "transparent";
        textArea.style.opacity = "0";

        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        try {
          // Try to copy using the deprecated execCommand
          const successful = document.execCommand("copy");
          document.body.removeChild(textArea);

          if (successful) {
            if (onCopySuccess) {
              onCopySuccess();
            }
            onClose();
          } else {
            throw new Error("execCommand('copy') failed");
          }
        } catch (fallbackError) {
          // Clean up textarea
          document.body.removeChild(textArea);
          console.error("Fallback copy failed:", fallbackError);
          alert(
            "Unable to copy automatically. Please copy manually: " + phoneNumber
          );
          // Still close modal after showing error
          onClose();
        }
      }
    } catch (error) {
      console.error("Failed to copy phone number:", error);
      alert(
        "Unable to copy to clipboard. Please copy manually: " + phoneNumber
      );
      // Still close modal even on error
      onClose();
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
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
          aria-describedby="modal-description"
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
              <h2
                id="modal-title"
                className="text-base sm:text-xl font-bold mb-0.5 sm:mb-1"
              >
                Contact {userName}
              </h2>
              <p className="text-white/90 text-sm sm:text-base font-medium">
                {phoneNumber}
              </p>
            </div>
          </div>

          {/* Options */}
          <div className="p-4 sm:p-6">
            <p
              id="modal-description"
              className="text-gray-700 text-xs sm:text-sm font-medium mb-3 sm:mb-4"
            >
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
