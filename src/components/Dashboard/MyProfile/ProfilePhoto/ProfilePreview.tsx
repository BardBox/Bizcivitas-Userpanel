"use client";

import React, { useState } from "react";
import { getAbsoluteImageUrl } from "@/utils/imageUtils";
import Image from "next/image";
import ProfilePhotoUpload from "./ProfilePhotoUpload";
import ImageModal from "@/components/ui/ImageModal";
import { useGetCurrentUserQuery } from "@/store/api";

interface ProfilePreviewProps {
  size?: "small" | "medium" | "large";
  showEditButton?: boolean;
  showMembershipBadge?: boolean;
  userData?: {
    fname?: string;
    lname?: string;
    avatar?: string;
    membershipType?: string;
  };
}

const ProfilePreview: React.FC<ProfilePreviewProps> = ({
  size = "medium",
  showEditButton = true,
  showMembershipBadge = true,
  userData,
}) => {
  const { data: currentUser } = useGetCurrentUserQuery();
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  // Use provided userData or fall back to current user
  const user = userData || currentUser;

  const sizeClasses = {
    small: "w-12 h-12",
    medium: "w-20 h-20",
    large: "w-32 h-32",
  };

  const textSizeClasses = {
    small: "text-sm",
    medium: "text-lg",
    large: "text-2xl",
  };

  // Handle image URL for both current user and external user data
  const currentImageUrl = user?.avatar
    ? userData
      ? getAbsoluteImageUrl(user.avatar)
      : getAbsoluteImageUrl(user.avatar)
    : null;
  const isCoreMember =
    user?.membershipType === "Core Member" ||
    user?.membershipType?.toLowerCase().includes("core");

  const handleImageUpdate = (newImageUrl: string) => {
    setShowUploadModal(false);
    // The query will automatically refetch and update the UI
  };

  return (
    <>
      <div className="text-center">
        <div className={`relative ${sizeClasses[size]} mx-auto mb-4 group`}>
          {/* Profile image with membership border */}
          <div
            className={`${sizeClasses[size]} rounded-full p-1
               ${isCoreMember
                ? "bg-gradient-to-tr from-orange-500 via-red-500 to-pink-500"
                : "bg-gradient-to-tr from-blue-500 to-purple-500"
              }`}
          >
            <div
              className="w-full h-full rounded-full overflow-hidden bg-white cursor-pointer"
              onClick={() => setShowPreviewModal(true)}
            >
              <img
                src={currentImageUrl || "/images/default-avatar.svg"}
                alt="Profile"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = "/images/default-avatar.svg";
                }}
              />
            </div>
          </div>

          {/* Crown icon for Core Member */}
          {showMembershipBadge && isCoreMember && (
            <div className="absolute -top-1 -right-1">
              <div
                className={`${size === "large" ? "w-8 h-8" : "w-6 h-6"
                  } bg-yellow-400 rounded-full flex items-center justify-center border-2 border-white`}
              >
                <span
                  className={`text-yellow-800 ${size === "large" ? "text-base" : "text-xs"
                    }`}
                >
                  👑
                </span>
              </div>
            </div>
          )}

          {/* Edit overlay on hover */}
          {showEditButton && (
            <div
              className="absolute inset-0 rounded-full  bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center cursor-pointer"
              onClick={() => setShowUploadModal(true)}
            >
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                  />
                </svg>
              </div>
            </div>
          )}
        </div>

        {/* User name */}
        <div className="text-center">
          <h3
            className={`font-semibold text-gray-900 ${size === "large" ? "text-xl" : "text-base"
              }`}
          >
            {user
              ? `${user.fname || ""} ${user.lname || ""}`.trim()
              : "Loading..."}
          </h3>
          {user?.membershipType && (
            <p
              className={`text-gray-600 ${size === "large" ? "text-base" : "text-sm"
                }`}
            >
              {user.membershipType} Member
            </p>
          )}
        </div>

        {/* Edit button */}
        {showEditButton && (
          <button
            onClick={() => setShowUploadModal(true)}
            className="mt-2 text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            Edit Photo
          </button>
        )}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0  bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Update Profile Photo</h3>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <ProfilePhotoUpload onImageUpdate={handleImageUpdate} />

            <div className="mt-4 flex justify-end space-x-2">
              <button
                onClick={() => setShowUploadModal(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      <ImageModal
        isOpen={showPreviewModal}
        onClose={() => setShowPreviewModal(false)}
        imageSrc={currentImageUrl || undefined}
        imageAlt={`${user?.fname || ""} ${user?.lname || ""} Profile Photo`}
        title="Profile Photo"
        showEditButton={showEditButton}
        onEdit={
          showEditButton
            ? () => {
              setShowPreviewModal(false);
              setShowUploadModal(true);
            }
            : undefined
        }
      />
    </>
  );
};

export default ProfilePreview;
