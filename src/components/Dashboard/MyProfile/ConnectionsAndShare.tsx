"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
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
    if (customMessage) {
      customMessage();
    } else {
      dispatch(
        addToast({
          type: "info",
          message: "Messaging feature coming soon",
          duration: 3000,
        })
      );
    }
  };

  const handleConnect = () => {
    if (customConnect) {
      customConnect();
    } else if (isOwnProfile) {
      // For own profile, navigate to connections page
      router.push("/feeds/connections");
    } else {
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
        // Copy detailed contact info to clipboard instead of just URL
        await navigator.clipboard.writeText(shareMessage);
        dispatch(
          addToast({
            type: "success",
            message: "Contact information copied to clipboard",
            duration: 3000,
          })
        );
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
