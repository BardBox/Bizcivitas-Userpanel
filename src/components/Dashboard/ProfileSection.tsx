"use client";

import { UserIcon } from "./DashboardIcons";
import { useEffect, useState, memo } from "react";
import { useRouter } from "next/navigation";
import Avatar from "@/components/ui/Avatar";
import { getUserFullName, useGetCurrentUserQuery } from "@/store/api";
import { getAbsoluteImageUrl } from "@/utils/imageUtils";

interface ProfileSectionProps {
  isCollapsed: boolean;
  onNavigate?: () => void;
}

const ProfileSection = memo(function ProfileSection({
  isCollapsed,
  onNavigate,
}: ProfileSectionProps) {
  const [isMounted, setIsMounted] = useState(false);
  // Don't block rendering - fetch in background
  const {
    data: user,
    isLoading,
    error,
  } = useGetCurrentUserQuery(undefined, {
    // These settings prevent blocking and improve performance
    refetchOnMountOrArgChange: false,
    skip: false,
  });
  const router = useRouter();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Handle error state
  useEffect(() => {
    if (error) {
      // Log error for debugging/telemetry
      console.error("Failed to load user profile:", error);
      // You can also send to telemetry service here:
      // telemetryService.logError('ProfileSection', error);
    }
  }, [error]);

  const handleProfileClick = () => {
    if (onNavigate) {
      onNavigate();
    }
    router.push("/feeds/myprofile");
  };

  const getGreeting = () => {
    if (!isMounted || isLoading) return "Hello!"; // Consistent render until data loads
    if (!user) return "Hello!";
    return `${getUserFullName(user)}!`;
  };

  const getUserInitials = () => {
    if (!user?.fname && !user?.lname) return "U";
    return `${user?.fname?.[0] || ""}${user?.lname?.[0] || ""}`.toUpperCase();
  };

  const getUserTitle = () => {
    if (!user) return "Loading...";
    return (
      user.profile?.professionalDetails?.companyName ||
      user.companyName ||
      user.profile?.professionalDetails?.classification ||
      user.classification ||
      "BizCivitas Member"
    );
  };

  // Show loading state while data is being fetched
  if (isLoading) {
    return (
      <div className="mb-3">
        {!isCollapsed ? (
          <div className="flex items-center space-x-3 p-2.5 rounded-lg">
            <div className="w-12 h-12 bg-gray-200 rounded-full animate-pulse"></div>
            <div className="flex-1 min-w-0">
              <div className="h-4 bg-gray-200 rounded animate-pulse mb-2 w-24"></div>
              <div className="h-3 bg-gray-200 rounded animate-pulse w-32"></div>
            </div>
          </div>
        ) : (
          <div className="flex justify-center">
            <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>
          </div>
        )}
      </div>
    );
  }

  // Show error state if profile failed to load
  if (error) {
    return (
      <div className="mb-3">
        {!isCollapsed ? (
          <div className="flex items-center space-x-3 p-2.5 rounded-lg bg-red-50 border border-red-200">
            <div className="w-12 h-12 bg-red-200 rounded-full flex items-center justify-center">
              <UserIcon className="w-6 h-6 text-red-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-red-900">
                Failed to load profile
              </p>
              <p className="text-xs text-red-600">Please try refreshing</p>
            </div>
          </div>
        ) : (
          <div className="flex justify-center">
            <div
              className="w-10 h-10 bg-red-200 rounded-full flex items-center justify-center"
              title="Failed to load profile"
            >
              <UserIcon className="w-5 h-5 text-red-600" />
            </div>
          </div>
        )}
      </div>
    );
  }

  // Don't render partial data - ensure we have user data before rendering
  if (!user) {
    return null;
  }

  return (
    <div className="mb-3">
      {!isCollapsed ? (
        <div
          onClick={handleProfileClick}
          className="group flex items-center space-x-3 p-2.5 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer border border-transparent hover:border-gray-200"
        >
          <div className="">
            <Avatar
              src={user?.avatar}
              alt={getUserFullName(user)}
              size="lg"
              className=""
              fallbackText={getUserFullName(user)}
              showMembershipBorder={true}
              membershipType={user?.membershipType}
              showCrown={true}
            />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-semibold text-gray-900 text-sm truncate">
              {getGreeting()}
            </h2>
            <p className="text-xs text-gray-500 truncate">{getUserTitle()}</p>
            {/* View Profile hint on hover */}
            <p className="text-[10px] text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity mt-0.5">
              View Profile
            </p>
          </div>
        </div>
      ) : (
        <div className="flex justify-center">
          <div className="rounded-full shadow-[0_0_10px_rgba(0,0,0,0.1)]">
            <Avatar
              src={user?.avatar}
              alt={getUserFullName(user)}
              size="md"
              fallbackText={getUserFullName(user)}
              showMembershipBorder={true}
              membershipType={user?.membershipType}
              showCrown={true}
              onClick={handleProfileClick}
              className="hover:scale-105 transition-transform cursor-pointer"
            />
          </div>
        </div>
      )}
    </div>
  );
});

export default ProfileSection;
