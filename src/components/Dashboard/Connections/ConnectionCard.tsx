import React from "react";
import { useRouter } from "next/navigation";
import { User, UserPlus, UserMinus, Check } from "lucide-react";
import {
  getAvatarUrl,
  getMembershipStyling,
  formatUserName,
  formatConnectionDate,
  shouldShowCrown,
  FALLBACK_AVATAR_URL,
} from "@/utils/Feeds/connections/userHelpers";
import LoadingSkeleton from "./LoadingSkeleton";
import {
  useGetConnectionProfileQuery,
  useDeleteConnectionMutation,
  useAcceptConnectionRequestMutation,
} from "@/store/api";
import {
  ConnectionRequestState,
  ConnectionStatus,
} from "../../../../types/connection.types";
import { useAppDispatch } from "../../../../store/hooks";
import { addToast } from "../../../../store/toastSlice";

interface ConnectionCardProps {
  userId: string;
  connectionDate: string;
  requestState: ConnectionRequestState;
  connectionStatus?: ConnectionStatus;
  connectionId?: string;
  onSendRequest: (userId: string, userName: string) => void;
}

const ConnectionCard: React.FC<ConnectionCardProps> = ({
  userId,
  connectionDate,
  requestState,
  connectionStatus = "none",
  connectionId,
  onSendRequest,
}) => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const {
    data: userProfile,
    isLoading,
    error,
  } = useGetConnectionProfileQuery(userId);

  const [deleteConnection, { isLoading: isDeleting }] =
    useDeleteConnectionMutation();
  const [acceptRequest, { isLoading: isAccepting }] =
    useAcceptConnectionRequestMutation();

  const handleCardClick = () => {
    // If this is the current user's own card, redirect to their profile
    if (connectionStatus === "self") {
      router.push(`/feeds/myprofile`);
    } else {
      router.push(`/feeds/connections/${userId}`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleCardClick();
    }
  };

  const handleWithdrawRequest = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!connectionId) return;

    try {
      await deleteConnection({ connectionId }).unwrap();
      dispatch(
        addToast({
          type: "success",
          message: "Connection request withdrawn",
          duration: 3000,
        })
      );
    } catch (error) {
      dispatch(
        addToast({
          type: "error",
          message: "Failed to withdraw request",
          duration: 3000,
        })
      );
    }
  };

  const handleAcceptRequest = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!connectionId) return;

    try {
      await acceptRequest({ connectionId }).unwrap();
      dispatch(
        addToast({
          type: "success",
          message: "Connection request accepted",
          duration: 3000,
        })
      );
    } catch (error) {
      dispatch(
        addToast({
          type: "error",
          message: "Failed to accept request",
          duration: 3000,
        })
      );
    }
  };

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
    <div
      onClick={handleCardClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={`View ${fullName}'s profile`}
      className="group relative bg-white rounded-xl shadow-sm border-2 border-gray-100 p-5 cursor-pointer transition-all duration-300 ease-out hover:shadow-2xl hover:scale-[1.02] hover:-translate-y-1 hover:border-transparent overflow-hidden"
    >
      {/* Animated gradient border on hover */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" style={{ padding: '2px' }}>
        <div className="absolute inset-[2px] bg-white rounded-xl"></div>
      </div>

      {/* Glow effect on hover */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-400/20 via-purple-400/20 to-pink-400/20 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-300 -z-20"></div>
      {/* Header with Avatar and Basic Info */}
      <div className="flex items-start space-x-4 mb-4">
        {/* Avatar with membership border */}
        <div className="relative flex-shrink-0 transform group-hover:scale-110 transition-transform duration-300">
          <div
            className={`w-14 h-14 rounded-full p-0.5 ${membershipStyling.borderGradient} group-hover:shadow-lg transition-shadow duration-300`}
          >
            <div className="w-full h-full rounded-full overflow-hidden bg-white">
              {user?.avatar ? (
                <img
                  src={getAvatarUrl(user.avatar)}
                  alt={fullName}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = FALLBACK_AVATAR_URL;
                  }}
                />
              ) : (
                <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                  <User className="h-6 w-6 text-gray-600 group-hover:text-blue-600 transition-colors duration-300" />
                </div>
              )}
            </div>
          </div>

          {/* Crown for Core Members */}
          {showCrown && (
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center border-2 border-white transform group-hover:rotate-12 group-hover:scale-125 transition-all duration-300">
              <span className="text-yellow-800 text-xs">👑</span>
            </div>
          )}
        </div>

        {/* Name and Title */}
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-gray-900 text-lg leading-tight mb-1 truncate group-hover:text-blue-600 transition-colors duration-300">
            {fullName}
          </h4>
          <div className="flex items-center space-x-2">
            <span
              className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${membershipStyling.badgeClasses} transition-all duration-300 group-hover:shadow-md group-hover:scale-105`}
            >
              {membershipStyling.displayName}
            </span>
          </div>
        </div>
      </div>

      {/* Company and Industry */}
      <div className="mb-4 space-y-2">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 group-hover:animate-pulse group-hover:shadow-lg group-hover:shadow-blue-500/50"></div>
          <p className="font-medium text-gray-800 text-sm leading-relaxed group-hover:text-gray-900 transition-colors duration-300">
            {profile?.professionalDetails?.companyName ||
              "Company not specified"}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-gray-400 rounded-full flex-shrink-0 group-hover:bg-purple-500 group-hover:animate-pulse group-hover:shadow-lg group-hover:shadow-purple-500/50 transition-colors duration-300"></div>
          <p className="text-gray-600 text-sm leading-relaxed group-hover:text-gray-800 transition-colors duration-300">
            {profile?.professionalDetails?.industry ||
              profile?.professionalDetails?.business ||
              "Industry not specified"}
          </p>
        </div>
      </div>

      {/* Connection Date */}
      <div className="mb-4 py-2 px-3 bg-gray-50 rounded-lg transition-all duration-300 group-hover:bg-gradient-to-r group-hover:from-blue-50 group-hover:via-purple-50 group-hover:to-pink-50 group-hover:shadow-sm">
        <p className="text-xs text-gray-500 text-center group-hover:text-gray-700 group-hover:font-medium transition-all duration-300">
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
      ) : connectionStatus === "pending_sent" ? (
        <button
          onClick={handleWithdrawRequest}
          disabled={isDeleting || !connectionId}
          className="w-full flex items-center justify-center px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 bg-yellow-50 text-yellow-700 border border-yellow-200 hover:bg-yellow-100 disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label={
            !connectionId
              ? "Cannot withdraw - connection ID missing"
              : "Withdraw connection request"
          }
        >
          {isDeleting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-700 mr-2"></div>
              Withdrawing...
            </>
          ) : (
            <>
              <UserMinus className="h-4 w-4 mr-2" />
              {!connectionId ? "Unavailable" : "Withdraw Request"}
            </>
          )}
        </button>
      ) : connectionStatus === "pending_received" ? (
        <button
          onClick={handleAcceptRequest}
          disabled={isAccepting || !connectionId}
          className="w-full flex items-center justify-center px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 bg-green-600 text-white hover:bg-green-700 hover:shadow-lg transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none disabled:hover:translate-y-0"
          aria-label={
            !connectionId
              ? "Cannot accept - connection ID missing"
              : "Accept connection request"
          }
        >
          {isAccepting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Accepting...
            </>
          ) : (
            <>
              <Check className="h-4 w-4 mr-2" />
              {!connectionId ? "Unavailable" : "Accept Request"}
            </>
          )}
        </button>
      ) : connectionStatus === "none" || !connectionStatus ? (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onSendRequest(userId, fullName);
          }}
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
      ) : null}
    </div>
  );
};

export default ConnectionCard;
