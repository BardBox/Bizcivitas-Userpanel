import React from "react";
import Link from "next/link";
import { Check, X } from "lucide-react";
import { ConnectionRequestItem } from "../../../../../types";
import Avatar from "@/components/ui/Avatar";

interface ConnectionRequestCardProps {
  request: ConnectionRequestItem;
  onAccept?: (connectionId: string) => void;
  onReject?: (connectionId: string) => void;
  onWithdraw?: (connectionId: string) => void;
  isProcessing?: boolean;
}

const ConnectionRequestCard: React.FC<ConnectionRequestCardProps> = ({
  request,
  onAccept,
  onReject,
  onWithdraw,
  isProcessing = false,
}) => {
  // Determine which user to display based on request type
  const displayUser =
    request.type === "received" ? request.sender : request.receiver;

  // Build user information
  const userName =
    `${displayUser.fname || ""} ${displayUser.lname || ""}`.trim() ||
    "Unknown User";
  const userEmail = displayUser.email || "No email provided";
  const companyName = displayUser.profile?.professionalDetails?.companyName;
  const jobTitle = displayUser.profile?.professionalDetails?.jobTitle;

  // User Info Component
  const UserInfo = () => (
    <div className="flex-1 min-w-0 px-4">
      <Link href={`/feeds/connections/${displayUser.id}?from=connect-members`}>
        <h3 className="font-bold text-blue-600 text-lg truncate mb-1 cursor-pointer">
          {userName}
        </h3>
      </Link>
      {jobTitle && (
        <p className="text-sm text-gray-600 font-medium truncate mb-1">
          {jobTitle}
        </p>
      )}
      {companyName && (
        <p className="text-sm text-gray-700 font-semibold truncate mb-1">
          {companyName}
        </p>
      )}
      <p className="text-xs text-gray-500 truncate">{userEmail}</p>
    </div>
  );

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-2 md:p-3 transition-all duration-200 hover:shadow-md hover:border-blue-300">
      {request.type === "received" ? (
        // RECEIVED REQUEST LAYOUT: Compact list on mobile, normal on desktop
        <div className="flex items-center gap-2 md:gap-3">
          {/* Avatar */}
          <Link href={`/feeds/connections/${displayUser.id}?from=connect-members`} className="flex-shrink-0">
            <div className="block md:hidden">
              <Avatar
                src={displayUser.avatar}
                alt={userName}
                size="sm"
                fallbackText={userName}
                showMembershipBorder={false}
                className="cursor-pointer"
              />
            </div>
            <div className="hidden md:block">
              <Avatar
                src={displayUser.avatar}
                alt={userName}
                size="md"
                fallbackText={userName}
                showMembershipBorder={false}
                className="cursor-pointer"
              />
            </div>
          </Link>

          {/* User Info */}
          <div className="flex-1 min-w-0">
            <Link href={`/feeds/connections/${displayUser.id}?from=connect-members`}>
              <h3 className="font-semibold text-blue-600 text-xs md:text-sm truncate hover:text-blue-700 cursor-pointer leading-none m-0 p-0">
                {userName}
              </h3>
            </Link>
            {jobTitle && (
              <p className="text-[10px] md:text-xs text-gray-600 truncate leading-none mt-0.5 m-0 p-0">
                {jobTitle}
              </p>
            )}
            {companyName && (
              <p className="text-[10px] md:text-xs text-gray-500 truncate leading-none mt-0.5 m-0 p-0">
                {companyName}
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex-shrink-0 flex items-center gap-1.5 md:gap-2">
            <button
              onClick={() => onAccept?.(request.connectionId)}
              disabled={isProcessing}
              className="p-1.5 md:p-2 bg-green-600 hover:bg-green-700 text-white rounded-full transition-all duration-200 disabled:opacity-50"
              title="Accept"
              aria-label="Accept connection request"
            >
              <Check className="h-3.5 w-3.5 md:h-4 md:w-4" />
            </button>
            <button
              onClick={() => onReject?.(request.connectionId)}
              disabled={isProcessing}
              className="p-1.5 md:p-2 bg-red-600 hover:bg-red-700 text-white rounded-full transition-all duration-200 disabled:opacity-50"
              title="Reject"
              aria-label="Reject connection request"
            >
              <X className="h-3.5 w-3.5 md:h-4 md:w-4" />
            </button>
          </div>
        </div>
      ) : (
        // SENT REQUEST LAYOUT: Compact list on mobile, normal on desktop
        <div className="flex items-center gap-2 md:gap-3">
          {/* Avatar - First */}
          <Link href={`/feeds/connections/${displayUser.id}?from=connect-members`} className="flex-shrink-0">
            <div className="block md:hidden">
              <Avatar
                src={displayUser.avatar}
                alt={userName}
                size="sm"
                fallbackText={userName}
                showMembershipBorder={false}
                className="cursor-pointer"
              />
            </div>
            <div className="hidden md:block">
              <Avatar
                src={displayUser.avatar}
                alt={userName}
                size="md"
                fallbackText={userName}
                showMembershipBorder={false}
                className="cursor-pointer"
              />
            </div>
          </Link>

          {/* User Info */}
          <div className="flex-1 min-w-0">
            <Link href={`/feeds/connections/${displayUser.id}?from=connect-members`}>
              <h3 className="font-semibold text-blue-600 text-xs md:text-sm truncate hover:text-blue-700 cursor-pointer leading-none m-0 p-0">
                {userName}
              </h3>
            </Link>
            {jobTitle && (
              <p className="text-[10px] md:text-xs text-gray-600 truncate leading-none mt-0.5 m-0 p-0">
                {jobTitle}
              </p>
            )}
            {companyName && (
              <p className="text-[10px] md:text-xs text-gray-500 truncate leading-none mt-0.5 m-0 p-0">
                {companyName}
              </p>
            )}
          </div>

          {/* Withdraw Button - Last */}
          <div className="flex-shrink-0 flex items-center">
            <button
              onClick={() => onWithdraw?.(request.connectionId)}
              disabled={isProcessing}
              className="flex items-center justify-center gap-1 px-2.5 py-1.5 md:px-3 md:py-2 bg-gray-700 hover:bg-gray-800 text-white rounded-md text-[10px] md:text-xs font-medium transition-all duration-200 disabled:opacity-50 whitespace-nowrap"
              aria-label="Withdraw"
            >
              <X className="h-3 w-3 md:h-3.5 md:w-3.5" />
              Withdraw
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConnectionRequestCard;
