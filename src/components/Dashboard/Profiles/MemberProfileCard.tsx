"use client";

import React from "react";
import Image from "next/image";
import { useAppDispatch } from "@/store/hooks";
// import { useConnections, useMemberProfile } from "@/hooks/useMemberProfile";
import { MemberProfileAPI } from "@/utils/Feeds/connections/memberProfileUtils";
import { addToast } from "@/store/toastSlice";

// Placeholder hooks until properly implemented
const useConnections = (userId?: string) => ({
  connections: [],
  isLoading: false,
  connect: async (slug: string) => {},
  disconnect: async (slug: string) => {},
  isConnectedTo: (slug: string) => false
});
const useMemberProfile = (slug: string) => ({
  member: null,
  profile: null,
  loading: { fetchMember: false, updateMember: false },
  error: { fetchMember: null, updateMember: null },
  fetchMember: (slug: string) => {}
});

interface MemberProfileCardProps {
  slug: string;
  initialData?: MemberProfileAPI | null;
  userId?: string;
  className?: string;
  showConnectionButton?: boolean;
  showSocialLinks?: boolean;
  showContactInfo?: boolean;
  variant?: "default" | "compact" | "mobile";
  onProfileUpdate?: (profile: MemberProfileAPI) => void;
}

export default function MemberProfileCard({
  slug,
  initialData,
  userId = "current-user-id",
  className = "",
  showConnectionButton = true,
  showSocialLinks = true,
  showContactInfo = true,
  variant = "default",
  onProfileUpdate,
}: MemberProfileCardProps) {
  const dispatch = useAppDispatch();

  // Redux hooks for member management
  const { member, loading, error, fetchMember } = useMemberProfile(slug);
  const { connect, disconnect, isConnectedTo } = useConnections(userId);

  // Use Redux data if available, fallback to initialData
  const memberProfile = member || initialData;
  const isConnected = isConnectedTo(slug);

  // Fetch member data if not available (but only on client side)
  React.useEffect(() => {
    if (
      typeof window !== "undefined" &&
      !memberProfile &&
      !loading.fetchMember &&
      fetchMember
    ) {
      fetchMember(slug);
    }
  }, [slug, memberProfile, fetchMember, loading.fetchMember]);

  // Call onProfileUpdate when member data changes
  React.useEffect(() => {
    if (memberProfile && onProfileUpdate) {
      onProfileUpdate(memberProfile);
    }
  }, [memberProfile, onProfileUpdate]);

  const handleDisconnect = async () => {
    if (!memberProfile) return;

    try {
      await disconnect(slug);
      dispatch(
        addToast({
          message: `Successfully disconnected from ${memberProfile.name}`,
          type: "success",
        })
      );
    } catch (error) {
      console.error("Failed to disconnect:", error);
      dispatch(
        addToast({
          message: "Failed to disconnect. Please try again.",
          type: "error",
        })
      );
    }
  };

  const handleConnect = async () => {
    if (!memberProfile) return;

    try {
      await connect(slug);
      dispatch(
        addToast({
          message: `Successfully connected to ${memberProfile.name}`,
          type: "success",
        })
      );
    } catch (error) {
      console.error("Failed to connect:", error);
      dispatch(
        addToast({
          message: "Failed to connect. Please try again.",
          type: "error",
        })
      );
    }
  };

  const handleSocialAction = (
    type: "phone" | "email" | "share" | "website"
  ) => {
    if (!memberProfile) return;

    switch (type) {
      case "phone":
        if (memberProfile.contact?.professional) {
          window.open(`tel:${memberProfile.contact.professional}`);
        }
        break;
      case "email":
        if (memberProfile.contact?.email) {
          window.open(`mailto:${memberProfile.contact.email}`);
        }
        break;
      case "share":
        if (navigator.share) {
          navigator.share({
            title: `${memberProfile.name} - BizCivitas`,
            text: `Connect with ${memberProfile.name} at ${memberProfile.business?.name || 'their company'}`,
            url: window.location.href,
          });
        } else {
          navigator.clipboard.writeText(window.location.href);
          dispatch(
            addToast({
              message: "Profile link copied to clipboard!",
              type: "info",
            })
          );
        }
        break;
      case "website":
        if (memberProfile.contact?.website) {
          window.open(memberProfile.contact.website, "_blank");
        }
        break;
    }
  };

  // Loading state
  if (loading.fetchMember && !memberProfile) {
    return (
      <div
        className={` rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}
      >
        <div className="animate-pulse">
          <div className="flex flex-col items-center">
            <div className="w-24 h-24 bg-gray-300 rounded-full mb-4"></div>
            <div className="h-6 bg-gray-300 rounded w-32 mb-2"></div>
            <div className="h-4 bg-gray-300 rounded w-20 mb-4"></div>
            <div className="h-10 bg-gray-300 rounded w-full mb-4"></div>
            <div className="flex space-x-3 mb-6">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="w-10 h-10 bg-gray-300 rounded-full"
                ></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error?.fetchMember && !memberProfile) {
    return (
      <div
        className={`bg-white rounded-lg shadow-sm border border-red-200 p-6 ${className}`}
      >
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <span className="text-2xl">⚠️</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Failed to Load Profile
          </h3>
          <p className="text-red-600 text-sm mb-4">{error.fetchMember}</p>
          <button
            onClick={() => fetchMember(slug)}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 text-sm"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!memberProfile) {
    return (
      <div
        className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}
      >
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Member Not Found
          </h3>
          <p className="text-gray-600">
            This profile may have been removed or is no longer available.
          </p>
        </div>
      </div>
    );
  }

  // Get profile initials
  const initials = memberProfile.name
    .split(" ")
    .map((n: string) => n[0])
    .join("");

  // Responsive classes based on variant
  const variantClasses = {
    default: "p-6",
    compact: "p-4",
    mobile: "p-4 max-w-sm mx-auto",
  };

  return (
    <div
      className={`bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden ${className} w-full max-w-sm mx-auto lg:max-w-none`}
    >
      {/* Profile Image and Basic Info */}
      <div className="text-center px-4 sm:px-6 pt-6 sm:pt-8 pb-4">
        <div className="relative w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-3 sm:mb-4">
          {/* Profile image with golden border for Core Member */}
          <div
            className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full p-1 ${
              memberProfile.membershipType === "Core Member"
                ? "bg-gradient-to-r from-yellow-400 to-orange-400"
                : ""
            }`}
          >
            <div className="w-full h-full rounded-full bg-gradient-to-br from-orange-400 to-pink-400 flex items-center justify-center">
              <span className="text-white text-base sm:text-lg font-bold">
                {initials}
              </span>
            </div>
          </div>
          {/* Crown icon for Core Member */}
          {memberProfile.membershipType === "Core Member" && (
            <div className="absolute -top-1 -right-1">
              <div className="w-6 h-6 sm:w-7 sm:h-7 bg-yellow-400 rounded-full flex items-center justify-center border-2 border-white">
                <span className="text-yellow-800 text-xs sm:text-sm">👑</span>
              </div>
            </div>
          )}
        </div>
        <hr className="w-[70%] mx-auto my-3 sm:my-4 " />
        <h2 className="text-xl sm:text-[24px] font-bold text-gray-900 mb-1">
          {memberProfile.name}
        </h2>
        <p className="text-blue-600 font-medium text-sm sm:text-[14px] mb-3 sm:mb-4">
          {memberProfile.membershipType}
        </p>
      </div>

      {/* Connect/Disconnect Button */}
      {showConnectionButton && (
        <div className="px-4 sm:px-6 mb-4 sm:mb-6 flex justify-center">
          {isConnected ? (
            <button
              onClick={handleDisconnect}
              disabled={loading.updateMember}
              className="w-[60%] sm:w-[45%] border border-red-300 text-red-600 py-2 sm:py-2.5 px-3 sm:px-4 rounded-lg hover:bg-red-50 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm"
            >
              {loading.updateMember ? "Disconnecting..." : "Disconnect"}
            </button>
          ) : (
            <button
              onClick={handleConnect}
              disabled={loading.updateMember}
              className="w-[60%] sm:w-[45%] border border-blue-300 text-blue-600 py-2 sm:py-2.5 px-3 sm:px-4 rounded-lg hover:bg-blue-50 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm"
            >
              {loading.updateMember ? "Connecting..." : "Connect"}
            </button>
          )}
        </div>
      )}

      {/* Social Links */}
      {showSocialLinks && (
        <div className="flex justify-center space-x-3 sm:space-x-4 px-4 sm:px-6 mb-4 sm:mb-6">
          <button
            onClick={() => handleSocialAction("phone")}
            className="w-9 h-9 sm:w-11 sm:h-11 text-white rounded-full flex items-center justify-center transition-colors shadow-md"
            title={`Call ${memberProfile.contact?.professional || 'member'}`}
          >
            <Image
              src="/icons/calldashboard.svg"
              alt="Call"
              width={16}
              height={16}
              className="sm:w-5 sm:h-5"
            />
          </button>
          <button
            onClick={() => handleSocialAction("email")}
            className="w-9 h-9 sm:w-11 sm:h-11 text-white rounded-full flex items-center justify-center transition-colors shadow-md"
            title={`Email ${memberProfile.contact?.email || 'member'}`}
          >
            <Image
              src="/icons/messagedashboard.svg"
              alt="Email"
              width={16}
              height={16}
              className="sm:w-5 sm:h-5"
            />
          </button>
          <button
            onClick={() => handleSocialAction("share")}
            className="w-9 h-9 sm:w-11 sm:h-11 text-white rounded-full flex items-center justify-center transition-colors shadow-md"
            title="Share profile"
          >
            <Image
              src="/icons/sharedashboard.svg"
              alt="Share"
              width={16}
              height={16}
              className="sm:w-5 sm:h-5"
            />
          </button>
          <button
            onClick={() => handleSocialAction("website")}
            className="w-9 h-9 sm:w-11 sm:h-11 text-white rounded-full flex items-center justify-center transition-colors shadow-md"
            title={`Visit ${memberProfile.contact?.website || 'website'}`}
          >
            <Image
              src="/icons/message2dashboard.svg"
              alt="Website"
              width={16}
              height={16}
              className="sm:w-5 sm:h-5"
            />
          </button>
        </div>
      )}

      {/* Business Info */}
      {showContactInfo && (
        <div className="bg-gray-50 px-4 sm:px-6 py-4 sm:py-6">
          {/* Business Name with Icon */}
          <div className="text-center mb-4 sm:mb-6">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-2 sm:mb-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <div className="w-4 h-4 sm:w-6 sm:h-6 bg-white rounded"></div>
              </div>
            </div>
            <h3 className="font-semibold text-gray-900 text-sm sm:text-base">
              {memberProfile.business?.name || 'No business listed'}
            </h3>
          </div>

          {/* Contact Information */}
          <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm text-gray-600">
            <div className="text-center">
              <div className="mb-2 text-gray-800 font-medium text-xs sm:text-sm">
                Location jad Hasdy hassh, Isdf, 222222
              </div>
              <div className="space-y-1">
                <div className="text-blue-600 font-medium">
                  Personal: {memberProfile.contact?.personal || 'Not provided'}
                </div>
                <div className="text-blue-600 font-medium">
                  Professional: {memberProfile.contact?.professional || 'Not provided'}
                </div>
                <div
                  className="text-blue-600 cursor-pointer hover:underline font-medium break-all"
                  onClick={() => handleSocialAction("email")}
                >
                  {memberProfile.contact?.email || 'Not provided'}
                </div>
                <div
                  className="text-blue-600 cursor-pointer hover:underline font-medium break-all"
                  onClick={() => handleSocialAction("website")}
                >
                  {memberProfile.contact?.website || 'Not provided'}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
