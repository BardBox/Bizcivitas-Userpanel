"use client";

import React from "react";
import { useRouter } from "next/navigation";
import Avatar from "@/components/ui/Avatar";

interface UserCardProps {
  id: string;
  name: string;
  title: string;
  company: string;
  avatar?: string;
  isOnline?: boolean;
  referrerTab?: string; // Optional: to preserve the tab when navigating back
  connectionStatus?: "connected" | "pending" | "not-connected"; // Connection status
}

const UserCard: React.FC<UserCardProps> = ({
  id,
  name,
  title,
  company,
  avatar,
  isOnline = false,
  referrerTab,
  connectionStatus = "not-connected",
}) => {
  const router = useRouter();

  // Generate slug from name or use ID
  const generateSlug = (name: string, id: string) => {
    return name.toLowerCase().replace(/\s+/g, "-") || id;
  };

  const handleCardClick = () => {
    // Use ID directly instead of slug for now, since API works with IDs
    // Preserve referrer tab if provided
    const url = referrerTab
      ? `/feeds/connections/${id}?from=${referrerTab}`
      : `/feeds/connections/${id}`;
    router.push(url);
  };

  // Get badge config based on connection status
  const getBadgeConfig = () => {
    switch (connectionStatus) {
      case "connected":
        return {
          text: "Connected",
          bgColor: "bg-green-100",
          textColor: "text-green-700",
          borderColor: "border-green-200",
        };
      case "pending":
        return {
          text: "Pending",
          bgColor: "bg-yellow-100",
          textColor: "text-yellow-700",
          borderColor: "border-yellow-200",
        };
      default:
        return null;
    }
  };

  const badgeConfig = getBadgeConfig();

  return (
    <div
      onClick={handleCardClick}
      className="bg-white rounded-2xl border border-gray-200 p-3 xl:p-6 hover:shadow-lg transition-all duration-300 cursor-pointer group hover:border-blue-200 relative"
    >
      {/* Connection Status Badge */}
      {badgeConfig && (
        <div className="absolute top-2 right-2 z-10">
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold border ${badgeConfig.bgColor} ${badgeConfig.textColor} ${badgeConfig.borderColor}`}>
            {badgeConfig.text}
          </span>
        </div>
      )}

      {/* Avatar Section */}
      <div className="flex flex-col items-center mb-6">
        <div className="relative mb-4">
          <Avatar
            src={avatar}
            alt={name}
            size="xl"
            fallbackText={name}
            showMembershipBorder={false}
            className=""
          />
          {isOnline && (
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 border-3 border-white rounded-full ring-2 ring-green-100"></div>
          )}
        </div>

        {/* Horizontal Line Separator */}
        <hr className="w-full border-gray-200 " />

        {/* User Info */}
        <div className="text-center">
          <h3 className="font-bold text-blue-600 xl:text-[20px] lg:text-[18px] md:text-[16px] text-[14px] group-hover:text-blue-700 transition-colors">
            {name || "-"}
          </h3>
          <p className="text-muted xl:text-[12px] lg:text-[11px] md:text-[10px] text-[8px] font-medium mb-2">
            {title || "-"}
          </p>
          <p className="text-muted xl:text-[14px] lg:text-[12px] md:text-[13px] text-[10px] font-semibold mb-1">
            {company || "-"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default UserCard;
