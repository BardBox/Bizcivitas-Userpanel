import React from "react";
import { User, UserPlus, Check } from "lucide-react";
import {
  getAvatarUrl,
  getMembershipStyling,
  formatUserName,
  formatConnectionDate,
  shouldShowCrown,
  FALLBACK_AVATAR_URL,
} from "@/utils/Feeds/connections/userHelpers";
import LoadingSkeleton from "./LoadingSkeleton";
import { useGetConnectionProfileQuery } from "../../../../store/api/userApi";

interface ConnectionCardProps {
  userId: string;
  connectionDate: string;
  requestState: "idle" | "sending" | "sent";
  connectionStatus?: "self" | "connected" | "not_connected";
  onSendRequest: (userId: string, userName: string) => void;
}

const ConnectionCard: React.FC<ConnectionCardProps> = ({
  userId,
  connectionDate,
  requestState,
  connectionStatus = "not_connected",
  onSendRequest,
}) => {
  const {
    data: userProfile,
    isLoading,
    error,
  } = useGetConnectionProfileQuery(userId);

  if (isLoading) {
    return <LoadingSkeleton type="userProfile" />;
  }

  if (error || !userProfile) {
    return (
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="text-center py-4">
          <User className="h-8 w-8 mx-auto mb-2 text-gray-400" />
          <p className="text-sm text-gray-500">Unable to load profile</p>
        </div>
      </div>
    );
  }

  const user = userProfile;
  const profile = user?.profile || {};
  const fullName = formatUserName(user?.fname, user?.lname);
  const membershipStyling = getMembershipStyling(user?.membershipType);
  const showCrown = shouldShowCrown(user?.membershipType);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-all duration-200 hover:border-blue-200">
      {/* Header with Avatar and Basic Info */}
      <div className="flex items-start space-x-4 mb-4">
        {/* Avatar with membership border */}
        <div className="relative flex-shrink-0">
          <div
            className={`w-14 h-14 rounded-full p-0.5 ${membershipStyling.borderGradient}`}
          >
            <div className="w-full h-full rounded-full overflow-hidden bg-white">
              {user?.avatar ? (
                <img
                  src={getAvatarUrl(user.avatar)}
                  alt={fullName}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = FALLBACK_AVATAR_URL;
                  }}
                />
              ) : (
                <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                  <User className="h-6 w-6 text-gray-600" />
                </div>
              )}
            </div>
          </div>

          {/* Crown for Core Members */}
          {showCrown && (
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center border-2 border-white">
              <span className="text-yellow-800 text-xs">👑</span>
            </div>
          )}
        </div>

        {/* Name and Title */}
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-gray-900 text-lg leading-tight mb-1 truncate">
            {fullName}
          </h4>
          <div className="flex items-center space-x-2">
            <span
              className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${membershipStyling.badgeClasses}`}
            >
              {membershipStyling.displayName}
            </span>
          </div>
        </div>
      </div>

      {/* Company and Industry */}
      <div className="mb-4 space-y-2">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
          <p className="font-medium text-gray-800 text-sm leading-relaxed">
            {profile?.professionalDetails?.companyName ||
              "Company not specified"}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-gray-400 rounded-full flex-shrink-0"></div>
          <p className="text-gray-600 text-sm leading-relaxed">
            {profile?.professionalDetails?.industry ||
              profile?.professionalDetails?.business ||
              "Industry not specified"}
          </p>
        </div>
      </div>

      {/* Connection Date */}
      <div className="mb-4 py-2 px-3 bg-gray-50 rounded-lg">
        <p className="text-xs text-gray-500 text-center">
          Connected on {formatConnectionDate(connectionDate)}
        </p>
      </div>

      {/* Action Button */}
      {connectionStatus === "self" ? (
        <div className="w-full flex items-center justify-center px-4 py-3 rounded-xl text-sm font-semibold bg-gray-100 text-gray-600 border border-gray-200">
          <User className="h-4 w-4 mr-2" />
          This is you
        </div>
      ) : connectionStatus === "connected" ? (
        <div className="w-full flex items-center justify-center px-4 py-3 rounded-xl text-sm font-semibold bg-green-50 text-green-700 border border-green-200">
          <Check className="h-4 w-4 mr-2" />
          Already Connected
        </div>
      ) : (
        <button
          onClick={() => onSendRequest(userId, fullName)}
          disabled={requestState !== "idle"}
          className={`w-full flex items-center justify-center px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
            requestState === "sent"
              ? "bg-green-50 text-green-700 border border-green-200 cursor-not-allowed"
              : requestState === "sending"
              ? "bg-gray-50 text-gray-500 border border-gray-200 cursor-not-allowed"
              : "bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg transform hover:-translate-y-0.5"
          }`}
        >
          {requestState === "sending" && (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-500 mr-2"></div>
          )}
          {requestState === "sent" ? (
            <>
              <Check className="h-4 w-4 mr-2" />
              Request Sent
            </>
          ) : requestState === "sending" ? (
            "Sending Request..."
          ) : (
            <>
              <UserPlus className="h-4 w-4 mr-2" />
              Send Request
            </>
          )}
        </button>
      )}
    </div>
  );
};

export default ConnectionCard;
