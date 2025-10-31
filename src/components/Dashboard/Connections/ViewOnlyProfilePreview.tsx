"use client";

import React, { useState } from "react";
import { X } from "lucide-react";
import Image from "next/image";
import {
  getAvatarUrl,
  getMembershipStyling,
  formatUserName,
  shouldShowCrown,
  FALLBACK_AVATAR_URL
} from "@/utils/Feeds/connections/userHelpers";

interface ViewOnlyProfilePreviewProps {
  user: {
    fname?: string;
    lname?: string;
    avatar?: string;
    membershipType?: string;
  };
  size?: "small" | "medium" | "large";
  showMembershipBadge?: boolean;
}

const ViewOnlyProfilePreview: React.FC<ViewOnlyProfilePreviewProps> = ({
  user,
  size = "medium",
  showMembershipBadge = true,
}) => {
  const [showImageModal, setShowImageModal] = useState(false);

  const sizeClasses = {
    small: "w-12 h-12",
    medium: "w-20 h-20",
    large: "w-32 h-32",
  };

  const currentImageUrl = getAvatarUrl(user?.avatar);
  const membershipStyling = getMembershipStyling(user?.membershipType);
  const fullName = formatUserName(user?.fname, user?.lname);
  const showCrown = shouldShowCrown(user?.membershipType);

  return (
    <>
      <div className="text-center">
        <div className={`relative ${sizeClasses[size]} mx-auto mb-4 group cursor-pointer`} onClick={() => setShowImageModal(true)}>
          {/* Profile image with membership border */}
          <div
            className={`${sizeClasses[size]} rounded-full p-1 ${membershipStyling.borderGradient}`}
          >
            <div className="w-full h-full rounded-full overflow-hidden bg-white">
              {currentImageUrl ? (
                <Image
                  src={currentImageUrl}
                  alt="Profile"
                  width={size === "large" ? 128 : size === "medium" ? 80 : 48}
                  height={size === "large" ? 128 : size === "medium" ? 80 : 48}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = FALLBACK_AVATAR_URL;
                  }}
                />
              ) : (
                <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                  <svg
                    className={`${size === "large" ? "w-16 h-16" : size === "medium" ? "w-10 h-10" : "w-6 h-6"} text-gray-600`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
              )}
            </div>
          </div>

          {/* Crown icon for Core Member */}
          {showMembershipBadge && showCrown && (
            <div className="absolute -top-1 -right-1">
              <div
                className={`${
                  size === "large" ? "w-8 h-8" : "w-6 h-6"
                } bg-yellow-400 rounded-full flex items-center justify-center border-2 border-white`}
              >
                <span
                  className={`text-yellow-800 ${
                    size === "large" ? "text-base" : "text-xs"
                  }`}
                >
                  👑
                </span>
              </div>
            </div>
          )}
        </div>

        {/* User name */}
        <div className="text-center">
          <h3
            className={`font-semibold text-gray-900 ${
              size === "large" ? "text-xl" : "text-base"
            }`}
          >
            {fullName || "Anonymous User"}
          </h3>
          {user?.membershipType && (
            <p
              className={`text-gray-600 ${
                size === "large" ? "text-base" : "text-sm"
              }`}
            >
              {user.membershipType} Member
            </p>
          )}
        </div>
      </div>

      {/* Image Preview Modal */}
      {showImageModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="relative max-w-3xl max-h-[90vh] p-4 border-2 border-gray-300 rounded-lg bg-white shadow-2xl">
            <button
              onClick={() => setShowImageModal(false)}
              className="absolute top-2 right-2 text-gray-700 hover:text-gray-900 bg-white rounded-full p-1 shadow-md z-10"
            >
              <X className="h-6 w-6" />
            </button>
            <div className="rounded-lg overflow-hidden">
              {currentImageUrl ? (
                <Image
                  src={currentImageUrl}
                  alt={fullName}
                  width={500}
                  height={500}
                  className="max-w-full max-h-[80vh] object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = FALLBACK_AVATAR_URL;
                  }}
                />
              ) : (
                <div className="w-96 h-96 bg-gray-300 flex items-center justify-center">
                  <svg
                    className="h-24 w-24 text-gray-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
              )}
            </div>
            <div className="text-center mt-4">
              <h3 className="text-white text-lg font-semibold">{fullName}</h3>
              <p className="text-gray-300 text-sm">{user?.membershipType} Member</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ViewOnlyProfilePreview;