"use client";

import { UserIcon } from "./DashboardIcons";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Avatar from "@/components/ui/Avatar";
import {
  getUserFullName,
  useGetCurrentUserQuery,
} from "../../../store/api/userApi";
import { getAbsoluteImageUrl } from "@/utils/imageUtils";

interface ProfileSectionProps {
  isCollapsed: boolean;
}

export default function ProfileSection({ isCollapsed }: ProfileSectionProps) {
  const [isMounted, setIsMounted] = useState(false);
  const { data: user, isLoading, error } = useGetCurrentUserQuery();
  const router = useRouter();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Debug logging
  useEffect(() => {
    if (user) {
      if (user.avatar) {
        console.log("Generated image URL:", getAbsoluteImageUrl(user.avatar));
      }
    }
  }, [user]);

  const handleProfileClick = () => {
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

  // Show loading state
  if (!isMounted || isLoading) {
    return (
      <div className="mb-8">
        {!isCollapsed ? (
          <div
            onClick={handleProfileClick}
            className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
          >
            <div className="h-12 w-12 rounded-full bg-gray-200 animate-pulse flex-shrink-0"></div>
            <div className="flex-1 min-w-0">
              <div className="h-4 bg-gray-200 rounded animate-pulse mb-1"></div>
              <div className="h-3 bg-gray-200 rounded animate-pulse w-3/4"></div>
            </div>
          </div>
        ) : (
          <div className="flex justify-center">
            <div
              onClick={handleProfileClick}
              className="h-10 w-10 rounded-full bg-gray-200 animate-pulse cursor-pointer"
            ></div>
          </div>
        )}
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="mb-8">
        {!isCollapsed ? (
          <div
            onClick={handleProfileClick}
            className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
          >
            <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
              <UserIcon className="w-7 h-7 text-red-500" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="font-semibold text-gray-900 text-sm">
                Guest User
              </h2>
              <p className="text-xs text-red-500">Failed to load profile</p>
            </div>
          </div>
        ) : (
          <div className="flex justify-center">
            <div
              onClick={handleProfileClick}
              className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center cursor-pointer"
            >
              <UserIcon className="w-6 h-6 text-red-500" />
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="mb-8">
      {!isCollapsed ? (
        <div
          onClick={handleProfileClick}
          className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
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
