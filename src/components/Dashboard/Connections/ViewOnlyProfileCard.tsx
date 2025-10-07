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
}

const ViewOnlyProfileCard: React.FC<ViewOnlyProfileCardProps> = ({
  profile,
  connectionStatus = { status: "none", connectionId: null },
  onConnect,
  onRemoveConnection,
  onMessage,
  userId,
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
    <div className="bg-white rounded-xl flex flex-col items-center justify-center shadow-lg border border-gray-100 overflow-hidden">
      {/* Profile Photo Section using ProfilePreview */}
      <div className="pt-6">
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

      {/* Action Buttons using ConnectionsAndShare */}
      <div className="my-4">
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
      <div className="mb-4 flex justify-center">
        {connectionStatus.status === "none" && (
          <button
            onClick={onConnect}
            className="flex items-center justify-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Send Request
          </button>
        )}

        {connectionStatus.status === "pending_sent" && (
          <button
            onClick={onRemoveConnection}
            className="flex items-center justify-center bg-gray-400 text-white px-4 py-2 rounded-lg hover:bg-gray-500 transition-colors text-sm"
          >
            <UserMinus className="h-4 w-4 mr-2" />
            Cancel Request
          </button>
        )}

        {connectionStatus.status === "pending_received" && (
          <button
            onClick={onConnect}
            className="flex items-center justify-center bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Accept Request
          </button>
        )}

        {connectionStatus.status === "connected" && (
          <button
            onClick={onRemoveConnection}
            className="flex items-center justify-center bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm"
          >
            <UserMinus className="h-4 w-4 mr-2" />
            Remove Connection
          </button>
        )}
      </div>

      {/* Business Information */}
      <div className="text-center w-full">
        <div className="text-center mb-4 sm:mb-6">
          <div
            className="relative w-12 h-12 sm:w-16 sm:h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3 overflow-hidden cursor-pointer"
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
                className="w-full h-full object-cover rounded-full"
                onError={() => setLogoLoadError(true)}
              />
            ) : (
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-600 rounded-full flex items-center justify-center">
                <div className="w-4 h-4 sm:w-6 sm:h-6 bg-white rounded-full"></div>
              </div>
            )}
          </div>
          <h3 className="font-semibold text-gray-900 text-sm sm:text-base">
            {profile.business?.name || "Business Name Not Provided"}
          </h3>
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
        <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm px-6 pb-6">
          {/* Location */}
          {profile.location && (
            <div className="mb-2 text-gray-800 font-medium text-xs sm:text-sm flex items-center justify-center gap-2">
              <MapPin className="h-4 w-4 text-gray-500" />
              <span>{profile.location}</span>
            </div>
          )}

          {/* Contact Details */}
          {profile.contact && (
            <>
              {profile.contact.personal && (
                <a
                  href={`tel:${profile.contact.personal}`}
                  className="flex items-center justify-center gap-2 text-blue-600 hover:text-blue-700 font-medium transition-colors"
                >
                  <Phone className="h-4 w-4" />
                  <span>Personal: {profile.contact.personal}</span>
                </a>
              )}
              {profile.contact.professional && (
                <a
                  href={`tel:${profile.contact.professional}`}
                  className="flex items-center justify-center gap-2 text-blue-600 hover:text-blue-700 font-medium transition-colors"
                >
                  <Phone className="h-4 w-4" />
                  <span>Professional: {profile.contact.professional}</span>
                </a>
              )}
              {profile.contact.email && (
                <a
                  href={`mailto:${profile.contact.email}`}
                  className="flex items-center justify-center gap-2 text-blue-600 hover:text-blue-700 font-medium break-all transition-colors"
                >
                  <Mail className="h-4 w-4 flex-shrink-0" />
                  <span className="break-all">{profile.contact.email}</span>
                </a>
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
                  className="flex items-center justify-center gap-2 text-blue-600 hover:text-blue-700 font-medium break-all transition-colors"
                >
                  <Globe className="h-4 w-4 flex-shrink-0" />
                  <span className="break-all">{profile.contact.website}</span>
                </a>
              )}
            </>
          )}

          {/* Member Since */}
          {profile.joiningDate && (
            <div className="mt-4 pt-3 border-t border-gray-100">
              <div className="text-gray-500 text-xs flex items-center justify-center gap-2">
                <Calendar className="h-4 w-4 text-gray-400" />
                <span>Member since {formatDate(profile.joiningDate)}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewOnlyProfileCard;
