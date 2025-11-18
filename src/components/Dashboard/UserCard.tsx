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
      className="group relative bg-white rounded-2xl border-2 border-gray-100 p-3 xl:p-6 cursor-pointer transition-all duration-300 ease-out hover:shadow-2xl hover:scale-[1.02] hover:-translate-y-1 hover:border-transparent overflow-hidden"
    >
      {/* Animated gradient border on hover using brand colors */}
      <div
        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"
        style={{
          padding: '2px',
          background: 'linear-gradient(135deg, var(--color-brand-orange), var(--color-brand-blue), var(--color-brand-green-dark))'
        }}
      >
        <div className="absolute inset-[2px] bg-white rounded-2xl"></div>
      </div>

      {/* Glow effect on hover using brand colors */}
      <div
        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-300 -z-20"
        style={{
          background: 'linear-gradient(135deg, rgba(255, 157, 0, 0.2), rgba(51, 89, 255, 0.2), rgba(29, 178, 18, 0.2))'
        }}
      ></div>
      {/* Connection Status Badge */}
      {badgeConfig && (
        <div className="absolute top-2 right-2 z-10">
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold border transition-all duration-300 group-hover:scale-105 group-hover:shadow-md ${badgeConfig.bgColor} ${badgeConfig.textColor} ${badgeConfig.borderColor}`}>
            {badgeConfig.text}
          </span>
        </div>
      )}

      {/* Avatar Section */}
      <div className="flex flex-col items-center mb-6">
        <div className="relative mb-4">
          <div className="rounded-full overflow-hidden group-hover:scale-110 transition-transform duration-300 group-hover:shadow-lg">
            <Avatar
              src={avatar}
              alt={name}
              size="xl"
              fallbackText={name}
              showMembershipBorder={false}
            />
          </div>
          {isOnline && (
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 border-3 border-white rounded-full ring-2 ring-green-100 group-hover:animate-pulse"></div>
          )}
        </div>

        {/* Horizontal Line Separator */}
        <hr className="w-full border-gray-200 transition-colors duration-300 group-hover:border-gray-300" />

        {/* User Info */}
        <div className="text-center">
          <h3 className="font-bold text-blue-600 xl:text-[20px] lg:text-[18px] md:text-[16px] text-[14px] transition-all duration-300 group-hover:text-blue-700 group-hover:scale-105">
            {name || "-"}
          </h3>
          <p className="text-muted xl:text-[12px] lg:text-[11px] md:text-[10px] text-[12px] font-medium mb-2 transition-colors duration-300 group-hover:text-gray-700">
            {title || "-"}
          </p>
          <p className="text-muted xl:text-[14px] lg:text-[12px] md:text-[13px] text-[10px] font-semibold mb-1 transition-colors duration-300 group-hover:text-gray-700">
            {company || "-"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default UserCard;
