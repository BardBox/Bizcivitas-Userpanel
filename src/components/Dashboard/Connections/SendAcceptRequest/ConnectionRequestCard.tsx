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
    <div className="group relative bg-white rounded-2xl border-2 border-gray-100 p-4 cursor-pointer transition-all duration-300 ease-out hover:shadow-2xl hover:scale-[1.01] hover:-translate-y-1 hover:border-transparent overflow-hidden">
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
      {request.type === "received" ? (
        // RECEIVED REQUEST LAYOUT: Avatar - Info - Actions
        <div className="flex items-center gap-4">
          <Link href={`/feeds/connections/${displayUser.id}?from=connect-members`} className="flex-shrink-0">
            <Avatar
              src={displayUser.avatar}
              alt={userName}
              size="xl"
              fallbackText={userName}
              showMembershipBorder={false}
              className="cursor-pointer"
            />
          </Link>
          <UserInfo />
          <div className="flex-shrink-0 flex gap-3">
            {/* Accept Button */}
            <button
              onClick={() => onAccept?.(request.connectionId)}
              disabled={isProcessing}
              className="p-3 bg-green-600 hover:bg-green-700 text-white rounded-full transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
              title="Accept request"
              aria-label="Accept connection request"
            >
              <Check className="h-5 w-5" />
            </button>
            {/* Reject Button */}
            <button
              onClick={() => onReject?.(request.connectionId)}
              disabled={isProcessing}
              className="p-3 bg-red-600 hover:bg-red-700 text-white rounded-full transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
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
              className="flex items-center gap-2 px-5 py-2.5 bg-gray-700 hover:bg-gray-800 text-white rounded-lg text-sm font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
              aria-label="Withdraw connection request"
            >
              <X className="h-4 w-4" />
              Withdraw
            </button>
          </div>
          <UserInfo />
          <Link href={`/feeds/connections/${displayUser.id}?from=connect-members`} className="flex-shrink-0">
            <Avatar
              src={displayUser.avatar}
              alt={userName}
              size="xl"
              fallbackText={userName}
              showMembershipBorder={false}
              className="cursor-pointer"
            />
          </Link>
        </div>
      )}
    </div>
  );
};

export default ConnectionRequestCard;
