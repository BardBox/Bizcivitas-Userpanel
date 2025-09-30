"use client";

import React from "react";
import Image from "next/image";
import { useAppDispatch } from "../../../../store/hooks";
import { addToast } from "../../../../store/toastSlice";

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

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: `${userProfile.fname} ${userProfile.lname} - BizCivitas`,
          text: `Connect with ${userProfile.fname} at ${userProfile.business?.name}`,
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
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
    <div className="flex space-x-3">
      <button
        onClick={() => {
          /* Add connection logic */
        }}
        className="inline-flex items-center px-3 py-2 border border-blue-600 text-sm font-medium rounded-md text-blue-600 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        <Image
          src="/dashboard/sidebaricons/connections.svg"
          alt="Connect"
          width={20}
          height={20}
          className="mr-2"
        />
        Connection
      </button>
      <button
        onClick={handleShare}
        className="inline-flex items-center px-3 py-2 border border-blue-600 text-sm font-medium rounded-md text-blue-600 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="mr-2"
        >
          <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
          <polyline points="16 6 12 2 8 6" />
          <line x1="12" y1="2" x2="12" y2="15" />
        </svg>
        Share Profile
      </button>
    </div>
  );
};

export default ConnectionsAndShare;
