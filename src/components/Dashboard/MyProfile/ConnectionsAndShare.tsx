"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useAppDispatch } from "../../../../store/hooks";
import { addToast } from "../../../../store/toastSlice";
import { useGetCurrentUserQuery } from "@/store/api";
import CallOptionsModal from "./CallOptionsModal";

interface ConnectionsAndShareProps {
  totalConnections?: number;
  userProfile: {
    fname?: string;
    lname?: string;
    business?: {
      name?: string;
    };
    contact?: {
      email?: string;
      personal?: string;
      website?: string;
    };
  };
  isOwnProfile?: boolean; // true for logged-in user's profile, false for viewing others
  onConnect?: () => void; // Custom connect handler for connection profiles
  onMessage?: () => void; // Custom message handler for connection profiles
  userId?: string; // User ID for connection profile URL
}

const ConnectionsAndShare: React.FC<ConnectionsAndShareProps> = ({
  userProfile,
  isOwnProfile = true,
  onConnect: customConnect,
  onMessage: customMessage,
  userId,
}) => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { data: currentUser } = useGetCurrentUserQuery();
  const [hoveredButton, setHoveredButton] = useState<string | null>(null);
  const [isCallModalOpen, setIsCallModalOpen] = useState(false);

  // Generate profile URL
  const getProfileUrl = () => {
    if (isOwnProfile) {
      return `${window.location.origin}/feeds/myprofile`;
    } else if (userId) {
      return `${window.location.origin}/feeds/connections/${userId}`;
    }
    return window.location.href;
  };

  const handleCall = () => {
    const phoneNumber = userProfile.contact?.personal;

    if (!phoneNumber) {
      dispatch(
        addToast({
          type: "error",
          message: "Phone number not available",
          duration: 3000,
        })
      );
      return;
    }

    // Always show modal - it works on both mobile and desktop
    // Modal provides options: Direct Call, WhatsApp, Copy Number
    setIsCallModalOpen(true);
  };

  const handleMessage = () => {
    router.push("/feeds/messages");
  };

  const handleConnect = () => {
    console.log("Connection icon clicked!", {
      isOwnProfile,
      userId,
      customConnect: !!customConnect,
    });

    if (isOwnProfile) {
      // For own profile, navigate to connections page
      console.log("Navigating to own connections:", "/feeds/connections");
      router.push("/feeds/connections");
    } else if (userId) {
      // For other users, navigate to their connections page (prioritize navigation over connection actions)
      const targetUrl = `/feeds/connections/${userId}/connections`;
      console.log("Navigating to user connections:", targetUrl);
      router.push(targetUrl);
    } else if (customConnect) {
      // Fall back to custom connect handler if no userId
      customConnect();
    } else {
      console.log("No userId provided, showing toast");
      dispatch(
        addToast({
          type: "info",
          message: "Connection feature coming soon",
          duration: 3000,
        })
      );
    }
  };

  const handleShare = async () => {
    try {
      const profileUrl = getProfileUrl();

      // Build detailed contact information like in the APK
      const firstName = userProfile.fname || "";
      const lastName = userProfile.lname || "";
      const company = userProfile.business?.name || "";
      const email = userProfile.contact?.email || "";
      const mobile = userProfile.contact?.personal || "";
      const website = userProfile.contact?.website || "";

      // Create detailed share message matching APK format
      const shareMessage = `Contact Information:\n\nName: ${firstName} ${lastName}\nCompany: ${company}\n\nEmail: ${email}\nMobile: ${mobile}\nWebsite: ${website}\n\nProfile: ${profileUrl}\n\nShared via BizCivitas`;

      if (navigator.share) {
        await navigator.share({
          title: `---- ${firstName} ${lastName}'s Contact Information ----`,
          text: shareMessage,
        });
      } else {
        // Fallback: Copy detailed contact info to clipboard
        // Check if modern Clipboard API is available
        if (
          typeof navigator !== "undefined" &&
          navigator.clipboard &&
          typeof navigator.clipboard.writeText === "function"
        ) {
          // Use modern Clipboard API
          await navigator.clipboard.writeText(shareMessage);
          dispatch(
            addToast({
              type: "success",
              message: "Contact information copied to clipboard",
              duration: 3000,
            })
          );
        } else {
          // Fallback for older browsers
          const textArea = document.createElement("textarea");
          textArea.value = shareMessage;

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
              dispatch(
                addToast({
                  type: "success",
                  message: "Contact information copied to clipboard",
                  duration: 3000,
                })
              );
            } else {
              throw new Error("execCommand('copy') failed");
            }
          } catch (fallbackError) {
            // Clean up textarea
            document.body.removeChild(textArea);
            console.error("Fallback copy failed:", fallbackError);
            // Show the content to user so they can copy manually
            toast.error(
              "Unable to copy automatically. Please copy the information manually.",
              { duration: 5000 }
            );
          }
        }
      }
    } catch (error) {
      dispatch(
        addToast({
          type: "error",
          message: "Failed to share profile",
          duration: 3000,
        })
      );
    }
  };

  return (
    <div className="flex items-center justify-center gap-3">
      {/* Call Button */}
      {!isOwnProfile && (
        <div className="relative group">
          <button
            onClick={handleCall}
            onMouseEnter={() => setHoveredButton("call")}
            onMouseLeave={() => setHoveredButton(null)}
            className="transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-full"
            aria-label="Call"
          >
            <Image
              src="/myprofile/call.svg"
              alt="Call"
              width={0}
              height={0}
              className="w-auto h-auto"
            />
          </button>
          {hoveredButton === "call" && (
            <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10">
              Call
            </div>
          )}
        </div>
      )}

      {/* Message Button */}
      <div className="relative group">
        <button
          onClick={handleMessage}
          onMouseEnter={() => setHoveredButton("message")}
          onMouseLeave={() => setHoveredButton(null)}
          className="transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-full"
          aria-label="Message"
        >
          <Image
            src="/myprofile/msg.svg"
            alt="Message"
            width={0}
            height={0}
            className="w-auto h-auto"
          />
        </button>
        {hoveredButton === "message" && (
          <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10">
            Message
          </div>
        )}
      </div>

      {/* Connection Button */}
      <div className="relative group">
        <button
          onClick={handleConnect}
          onMouseEnter={() => setHoveredButton("connect")}
          onMouseLeave={() => setHoveredButton(null)}
          className="transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-full"
          aria-label="Connect"
        >
          <Image
            src="/myprofile/connection.svg"
            alt="Connect"
            width={0}
            height={0}
            className="w-auto h-auto"
          />
        </button>
        {hoveredButton === "connect" && (
          <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10">
            {isOwnProfile
              ? "View Connections"
              : customConnect
              ? "Connection"
              : userId
              ? "View Connections"
              : "Coming soon"}
          </div>
        )}
      </div>

      {/* Share Button */}
      <div className="relative group">
        <button
          onClick={handleShare}
          onMouseEnter={() => setHoveredButton("share")}
          onMouseLeave={() => setHoveredButton(null)}
          className="transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-full"
          aria-label="Share Profile"
        >
          <Image
            src="/myprofile/share.svg"
            alt="Share"
            width={0}
            height={0}
            className="w-auto h-auto"
          />
        </button>
        {hoveredButton === "share" && (
          <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10">
            Share Profile
          </div>
        )}
      </div>

      {/* Call Options Modal */}
      <CallOptionsModal
        isOpen={isCallModalOpen}
        onClose={() => setIsCallModalOpen(false)}
        phoneNumber={userProfile.contact?.personal || ""}
        userName={`${userProfile.fname || ""} ${
          userProfile.lname || ""
        }`.trim()}
        onCopySuccess={() => {
          dispatch(
            addToast({
              type: "success",
              message: "Phone number copied to clipboard",
              duration: 3000,
            })
          );
        }}
      />
    </div>
  );
};

export default ConnectionsAndShare;
