"use client";

import { UserIcon } from "./DashboardIcons";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Avatar from "@/components/ui/Avatar";
import { getUserFullName, useGetCurrentUserQuery } from "@/store/api";
import { getAbsoluteImageUrl } from "@/utils/imageUtils";

interface ProfileSectionProps {
  isCollapsed: boolean;
  onNavigate?: () => void;
}

export default function ProfileSection({
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

  // Don't block UI with loading/error states - show default and update when ready

  return (
    <div className="mb-8">
      {!isCollapsed ? (
        <div
          onClick={handleProfileClick}
          className="group flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
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
              View Profile →
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
              className="hover:scale-105 transition-transform"
            />
          </div>
        </div>
      )}
    </div>
  );
}
