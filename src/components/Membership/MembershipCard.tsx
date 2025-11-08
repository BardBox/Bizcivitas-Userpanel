import React from "react";
import { User } from "lucide-react";

interface MembershipCardProps {
  membershipType: string;
  userName: string;
  joinDate: string;
  renewalDate: string;
}

const membershipConfig = {
  "Core Membership": {
    color: "#C2963E",
    displayName: "Core Member",
    bgGradient: "from-amber-700 to-amber-600",
    badgeLetter: "C",
  },
  "Flagship Membership": {
    color: "#1DB212",
    displayName: "Flagship Member",
    bgGradient: "from-green-600 to-green-500",
    badgeLetter: "F",
  },
  "Industria Membership": {
    color: "#0078F0",
    displayName: "Industria Member",
    bgGradient: "from-blue-600 to-blue-500",
    badgeLetter: "I",
  },
  "Digital Membership": {
    color: "#FF9D00",
    displayName: "Digital Member",
    bgGradient: "from-orange-500 to-orange-400",
    badgeLetter: "D",
  },
};

export default function MembershipCard({
  membershipType,
  userName,
  joinDate,
  renewalDate,
}: MembershipCardProps) {
  const config =
    membershipConfig[membershipType as keyof typeof membershipConfig] ||
    membershipConfig["Flagship Membership"];

  return (
    <div className="w-full">
      <div
        className="relative rounded-xl overflow-hidden border-2 shadow-lg bg-gradient-to-br from-gray-50 to-white"
        style={{ borderColor: config.color }}
      >
        {/* Card Header */}
        <div
          className="relative border-b-2 px-4 py-3 flex items-center justify-between bg-white/80 backdrop-blur-sm"
          style={{ borderColor: config.color }}
        >
          <h3
            className="text-base sm:text-lg font-semibold"
            style={{ color: config.color }}
          >
            {config.displayName}
          </h3>
          <div
            className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-white font-bold text-lg sm:text-xl shadow-md"
            style={{ backgroundColor: config.color }}
          >
            {config.badgeLetter}
          </div>
        </div>

        {/* Card Content */}
        <div className="relative flex items-start p-4 sm:p-6 gap-4">
          {/* User Avatar/Icon */}
          <div
            className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center text-white shadow-lg flex-shrink-0 bg-gradient-to-br ${config.bgGradient}`}
          >
            <User className="w-8 h-8 sm:w-10 sm:h-10" />
          </div>

          {/* User Details */}
          <div className="flex flex-col gap-2 flex-1">
            <div
              className="px-3 py-1.5 rounded-full text-white text-xs sm:text-sm font-medium inline-block shadow-sm w-fit"
              style={{ backgroundColor: config.color }}
            >
              {userName || "User"}
            </div>
            <div
              className="px-3 py-1.5 rounded-full text-white text-xs inline-block shadow-sm w-fit"
              style={{ backgroundColor: config.color }}
            >
              Join Date: {joinDate}
            </div>
            <div
              className="px-3 py-1.5 rounded-full text-white text-xs inline-block shadow-sm w-fit"
              style={{ backgroundColor: config.color }}
            >
              Renewal Date: {new Date(renewalDate).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </div>
          </div>
        </div>

        {/* Renew Button */}
        <div className="relative px-4 sm:px-6 pb-4">
          <button
            className="px-6 py-2 rounded-lg text-white font-medium text-sm hover:opacity-90 transition-opacity shadow-md"
            style={{ backgroundColor: config.color }}
          >
            Renew
          </button>
        </div>
      </div>
    </div>
  );
}
