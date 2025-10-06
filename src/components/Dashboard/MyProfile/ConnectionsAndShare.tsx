"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useAppDispatch } from "../../../../store/hooks";
import { addToast } from "../../../../store/toastSlice";
import { useGetCurrentUserQuery } from "../../../../store/api/userApi";

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
}

const ConnectionsAndShare: React.FC<ConnectionsAndShareProps> = ({
  userProfile,
}) => {
  const dispatch = useAppDispatch();
  const { data: currentUser } = useGetCurrentUserQuery();
  const [hoveredButton, setHoveredButton] = useState<string | null>(null);

  // Generate profile URL using user ID
  const getProfileUrl = () => {
    const userId = currentUser?._id || currentUser?.id;
    if (userId) {
      // Create a slug from user name or use ID
      const slug = `${userProfile.fname}-${userProfile.lname}`
        .toLowerCase()
        .replace(/\s+/g, "-");
      return `${window.location.origin}/feeds/connections/${slug}`;
    }
    return window.location.href;
  };

  const handleCall = () => {
    if (userProfile.contact?.personal) {
      window.location.href = `tel:${userProfile.contact.personal}`;
    } else {
      dispatch(
        addToast({
          type: "error",
          message: "Phone number not available",
          duration: 3000,
        })
      );
    }
  };

  const handleMessage = () => {
    // You can implement messaging logic here
    dispatch(
      addToast({
        type: "info",
        message: "Messaging feature coming soon",
        duration: 3000,
      })
    );
  };

  const handleConnect = () => {
    // Add connection logic here
    dispatch(
      addToast({
        type: "success",
        message: "Connection request sent",
        duration: 3000,
      })
    );
  };

  const handleShare = async () => {
    try {
      const profileUrl = getProfileUrl();

      if (navigator.share) {
        await navigator.share({
          title: `${userProfile.fname} ${userProfile.lname} - BizCivitas`,
          text: `Connect with ${userProfile.fname} at ${userProfile.business?.name}`,
          url: profileUrl,
        });
      } else {
        await navigator.clipboard.writeText(profileUrl);
        dispatch(
          addToast({
            type: "success",
            message: "Profile link copied to clipboard",
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
            width={40}
            height={40}
            className="w-10 h-10"
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
            width={40}
            height={40}
            className="w-10 h-10"
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
            width={40}
            height={40}
            className="w-10 h-10"
          />
        </button>
        {hoveredButton === "connect" && (
          <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10">
            Connection
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
            width={40}
            height={40}
            className="w-10 h-10"
          />
        </button>
        {hoveredButton === "share" && (
          <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10">
            Share Profile
          </div>
        )}
      </div>
    </div>
  );
};

export default ConnectionsAndShare;
