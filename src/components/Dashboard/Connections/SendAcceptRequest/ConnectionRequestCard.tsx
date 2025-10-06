import React from "react";
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
      <h3 className="font-bold text-blue-600 text-lg truncate mb-1 hover:text-blue-700 transition-colors">
        {userName}
      </h3>
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
    <div className="bg-white rounded-2xl border border-gray-200 p-4 hover:shadow-lg hover:border-blue-200 transition-all duration-300 group">
      {request.type === "received" ? (
        // RECEIVED REQUEST LAYOUT: Avatar - Info - Actions
        <div className="flex items-center gap-4">
          <div className="flex-shrink-0">
            <Avatar
              src={displayUser.avatar}
              alt={userName}
              size="xl"
              fallbackText={userName}
              showMembershipBorder={false}
            />
          </div>
          <UserInfo />
          <div className="flex-shrink-0 flex gap-3">
            {/* Accept Button */}
            <button
              onClick={() => onAccept?.(request.connectionId)}
              disabled={isProcessing}
              className="p-3 bg-green-600 hover:bg-green-700 text-white rounded-full transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg hover:scale-105"
              title="Accept request"
              aria-label="Accept connection request"
            >
              <Check className="h-5 w-5" />
            </button>
            {/* Reject Button */}
            <button
              onClick={() => onReject?.(request.connectionId)}
              disabled={isProcessing}
              className="p-3 bg-red-600 hover:bg-red-700 text-white rounded-full transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg hover:scale-105"
              title="Reject request"
              aria-label="Reject connection request"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      ) : (
        // SENT REQUEST LAYOUT: Withdraw - Info - Avatar
        <div className="flex items-center gap-4">
          <div className="flex-shrink-0">
            {/* Withdraw Button */}
            <button
              onClick={() => onWithdraw?.(request.connectionId)}
              disabled={isProcessing}
              className="flex items-center gap-2 px-5 py-2.5 bg-gray-700 hover:bg-gray-800 text-white rounded-lg text-sm font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg hover:scale-105"
              aria-label="Withdraw connection request"
            >
              <X className="h-4 w-4" />
              Withdraw
            </button>
          </div>
          <UserInfo />
          <div className="flex-shrink-0">
            <Avatar
              src={displayUser.avatar}
              alt={userName}
              size="xl"
              fallbackText={userName}
              showMembershipBorder={false}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ConnectionRequestCard;
