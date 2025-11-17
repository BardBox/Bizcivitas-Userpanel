import React, { useState, useEffect } from "react";
import {
  User,
  UserPlus,
  UserMinus,
  Phone,
  Mail,
  Globe,
  MapPin,
  Calendar,
} from "lucide-react";
import ProfilePreview from "@/components/Dashboard/MyProfile/ProfilePhoto/ProfilePreview";
import ImageModal from "@/components/ui/ImageModal";
import ConnectionsAndShare from "@/components/Dashboard/MyProfile/ConnectionsAndShare";
import { ConnectionStatusInfo } from "../../../../types";

// Capitalize first letter utility
const capitalize = (str?: string) =>
  str ? str.charAt(0).toUpperCase() + str.slice(1) : "";

interface ViewOnlyProfileCardProps {
  profile: {
    fname?: string;
    lname?: string;
    username?: string;
    membershipType?: string;
    avatar?: string;
    contact?: {
      personal?: string;
      professional?: string;
      email?: string;
      website?: string;
    };
    business?: {
      name?: string;
      logo?: string;
    };
    location?: string;
    isActive?: boolean;
    joiningDate?: string;
  };
  connectionStatus?: ConnectionStatusInfo;
  onConnect?: () => void;
  onRemoveConnection?: () => void;
  onMessage?: () => void;
  userId?: string; // Pass userId for share functionality
  isConnecting?: boolean;
}

const ViewOnlyProfileCard: React.FC<ViewOnlyProfileCardProps> = ({
  profile,
  connectionStatus = { status: "none", connectionId: null },
  onConnect,
  onRemoveConnection,
  onMessage,
  userId,
  isConnecting = false,
}) => {
  const [isLogoModalOpen, setIsLogoModalOpen] = useState(false);
  const [logoLoadError, setLogoLoadError] = useState(false);

  // Reset logo error when the logo URL changes to allow retrying new images
  useEffect(() => {
    setLogoLoadError(false);
  }, [profile.business?.logo]);

  // Handle null/undefined profile
  if (!profile) {
    return (
      <div className="bg-white rounded-xl flex flex-col items-center justify-center shadow-lg border border-gray-100 p-6">
        <div className="text-center text-gray-500">
          <User className="h-12 w-12 mx-auto mb-3" />
          <p>Profile information not available</p>
        </div>
      </div>
    );
  }

  const fullName = `${capitalize(profile?.fname)} ${
    profile?.lname || ""
  }`.trim();

  // Helper function to format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return "Not available";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return "Not available";
    }
  };

  return (
    <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
      {/* Header Background with Gradient */}
      <div className="relative bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 h-24 sm:h-28"></div>
      
      {/* Profile Photo Section - Overlapping header */}
      <div className="relative -mt-14 sm:-mt-16 px-4">
        <div className="flex justify-center">
          <ProfilePreview
            userData={{
              fname: profile.fname,
              lname: profile.lname,
              avatar: profile.avatar,
              membershipType: profile.membershipType,
            }}
            size="medium"
            showEditButton={false}
            showMembershipBadge={true}
          />
        </div>
      </div>

      {/* Name and Business */}
      <div className="text-center px-4 mt-3">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">{fullName}</h2>
        <p className="text-sm text-gray-600 mt-1 capitalize">
          {profile.membershipType || "Member"}
        </p>
      </div>

      {/* Action Buttons - Compact */}
      <div className="px-4 mt-4">
        <ConnectionsAndShare
          userProfile={{
            fname: profile.fname,
            lname: profile.lname,
            business: profile.business,
            contact: profile.contact,
          }}
          isOwnProfile={false}
          onConnect={onConnect}
          onMessage={onMessage}
          userId={userId}
        />
      </div>

      {/* Connection Status Actions */}
      <div className="px-4 mt-3 flex justify-center">
        {connectionStatus.status === "none" && (
          <button
            onClick={onConnect}
            disabled={isConnecting}
            className="w-full flex items-center justify-center bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2.5 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-md hover:shadow-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isConnecting ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Sending request...
              </>
            ) : (
              <>
                <UserPlus className="h-4 w-4 mr-2" />
                Send Request
              </>
            )}
          </button>
        )}

        {connectionStatus.status === "pending_sent" && (
          <button
            onClick={onRemoveConnection}
            className="w-full flex items-center justify-center bg-gradient-to-r from-gray-500 to-gray-600 text-white px-4 py-2.5 rounded-xl hover:from-gray-600 hover:to-gray-700 transition-all shadow-md hover:shadow-lg text-sm font-medium"
          >
            <UserMinus className="h-4 w-4 mr-2" />
            Cancel Request
          </button>
        )}

        {connectionStatus.status === "pending_received" && (
          <button
            onClick={onConnect}
            disabled={isConnecting}
            className="w-full flex items-center justify-center bg-gradient-to-r from-green-600 to-green-700 text-white px-4 py-2.5 rounded-xl hover:from-green-700 hover:to-green-800 transition-all shadow-md hover:shadow-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isConnecting ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Sending request...
              </>
            ) : (
              <>
                <UserPlus className="h-4 w-4 mr-2" />
                Accept Request
              </>
            )}
          </button>
        )}

        {connectionStatus.status === "connected" && (
          <button
            onClick={onRemoveConnection}
            className="w-full flex items-center justify-center bg-gradient-to-r from-red-600 to-red-700 text-white px-4 py-2.5 rounded-xl hover:from-red-700 hover:to-red-800 transition-all shadow-md hover:shadow-lg text-sm font-medium"
          >
            <UserMinus className="h-4 w-4 mr-2" />
            Remove Connection
          </button>
        )}
      </div>

      {/* Business Information */}
      <div className="mt-4 mx-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <div className="flex items-center gap-3">
            <div
              className="relative w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-50 rounded-xl flex items-center justify-center overflow-hidden cursor-pointer flex-shrink-0 border-2 border-blue-200"
              onClick={() =>
                profile.business?.logo &&
                !logoLoadError &&
                setIsLogoModalOpen(true)
              }
            >
              {profile.business?.logo && !logoLoadError ? (
                <img
                  src={profile.business.logo}
                  alt={`${profile.business.name} logo`}
                  className="w-full h-full object-cover rounded-xl"
                  onError={() => setLogoLoadError(true)}
                />
              ) : (
                <div className="w-6 h-6 bg-blue-600 rounded-lg flex items-center justify-center">
                  <div className="w-3 h-3 bg-white rounded-sm"></div>
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 text-sm truncate">
                {profile.business?.name || "Business Name Not Provided"}
              </h3>
              {profile.location && (
                <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                  <MapPin className="h-3 w-3" />
                  <span className="truncate">{profile.location}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Image Modal */}
        <ImageModal
          isOpen={isLogoModalOpen}
          onClose={() => setIsLogoModalOpen(false)}
          imageSrc={profile.business?.logo}
          imageAlt={`${profile.business?.name || "Company"} Logo`}
          title="Company Logo"
          showEditButton={false}
        />

        {/* Contact Information */}
        <div className="mt-4 space-y-2 px-4 pb-5">
          {/* Contact Details */}
          {profile.contact && (
            <>
              {profile.contact.personal ? (
                <a
                  href={`tel:${profile.contact.personal}`}
                  className="flex items-center gap-2 text-sm bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-2 rounded-lg transition-all group"
                >
                  <Phone className="h-4 w-4 group-hover:scale-110 transition-transform" />
                  <span className="font-medium">Personal: {profile.contact.personal}</span>
                </a>
              ) : (
                connectionStatus?.status !== "connected" && (
                  <div className="flex items-center gap-2 text-sm bg-gray-50 text-gray-400 px-3 py-2 rounded-lg">
                    <Phone className="h-4 w-4" />
                    <span className="font-medium">Personal: •••••••••</span>
                  </div>
                )
              )}
              {profile.contact.professional ? (
                <a
                  href={`tel:${profile.contact.professional}`}
                  className="flex items-center gap-2 text-sm bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-3 py-2 rounded-lg transition-all group"
                >
                  <Phone className="h-4 w-4 group-hover:scale-110 transition-transform" />
                  <span className="font-medium">Professional: {profile.contact.professional}</span>
                </a>
              ) : (
                connectionStatus?.status !== "connected" && (
                  <div className="flex items-center gap-2 text-sm bg-gray-50 text-gray-400 px-3 py-2 rounded-lg">
                    <Phone className="h-4 w-4" />
                    <span className="font-medium">Professional: •••••••••</span>
                  </div>
                )
              )}
              {profile.contact.email ? (
                <a
                  href={`mailto:${profile.contact.email}`}
                  className="flex items-center gap-2 text-sm bg-green-50 hover:bg-green-100 text-green-700 px-3 py-2 rounded-lg transition-all group"
                >
                  <Mail className="h-4 w-4 flex-shrink-0 group-hover:scale-110 transition-transform" />
                  <span className="font-medium truncate">{profile.contact.email}</span>
                </a>
              ) : (
                connectionStatus?.status !== "connected" && (
                  <div className="flex items-center gap-2 text-sm bg-gray-50 text-gray-400 px-3 py-2 rounded-lg">
                    <Mail className="h-4 w-4 flex-shrink-0" />
                    <span className="font-medium">•••••••••@••••••••</span>
                  </div>
                )
              )}
              {profile.contact.website && (
                <a
                  href={
                    profile.contact.website.startsWith("http")
                      ? profile.contact.website
                      : `https://${profile.contact.website}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm bg-purple-50 hover:bg-purple-100 text-purple-700 px-3 py-2 rounded-lg transition-all group"
                >
                  <Globe className="h-4 w-4 flex-shrink-0 group-hover:scale-110 transition-transform" />
                  <span className="font-medium truncate">{profile.contact.website}</span>
                </a>
              )}
            </>
          )}

          {/* Member Since */}
          {profile.joiningDate && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <div className="text-gray-600 text-xs flex items-center justify-center gap-2 bg-gray-50 px-3 py-2 rounded-lg">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span className="font-medium">Member since {formatDate(profile.joiningDate)}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewOnlyProfileCard;
