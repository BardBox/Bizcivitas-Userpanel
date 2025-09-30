import React from "react";
import { User, MessageCircle, UserPlus } from "lucide-react";
import ProfilePreview from "@/components/Dashboard/MyProfile/ProfilePhoto/ProfilePreview";

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
  onConnect?: () => void;
  onMessage?: () => void;
}

const ViewOnlyProfileCard: React.FC<ViewOnlyProfileCardProps> = ({
  profile,
  onConnect,
  onMessage,
}) => {
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

  const fullName = `${capitalize(profile?.fname)} ${profile?.lname || ''}`.trim();

  // Helper function to format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not available';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return 'Not available';
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

      {/* Action Buttons */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={onMessage}
          className="flex items-center bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors text-sm"
        >
          <MessageCircle className="h-4 w-4 mr-2" />
          Message
        </button>
        <button
          onClick={onConnect}
          className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
        >
          <UserPlus className="h-4 w-4 mr-2" />
          Connect
        </button>
      </div>

      {/* Business Information */}
      <div className="text-center mb-4">
        {profile.business?.logo && (
          <div className="mb-2">
            <img
              src={profile.business.logo}
              alt={`${profile.business.name} logo`}
              className="w-16 h-16 mx-auto rounded-lg object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          </div>
        )}
        <h3 className="font-semibold text-gray-900 text-sm sm:text-base">
          {profile.business?.name || "Business Name Not Provided"}
        </h3>
      </div>

      {/* Contact Information */}
      <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm text-gray-600 w-full px-6 pb-6">
        <div className="text-center">
          <div className="mb-2 text-gray-800 font-medium text-xs sm:text-sm">
            📍 {profile.location || "Location not provided"}
          </div>
          {profile.contact && (
            <>
              {profile.contact.personal && (
                <div className="text-blue-600 font-medium">
                  📱 Personal: {profile.contact.personal}
                </div>
              )}
              {profile.contact.professional && (
                <div className="text-blue-600 font-medium">
                  📞 Professional: {profile.contact.professional}
                </div>
              )}
              {profile.contact.email && (
                <div className="text-blue-600 font-medium break-all">
                  ✉️ {profile.contact.email}
                </div>
              )}
              {profile.contact.website && (
                <div className="text-blue-600 font-medium break-all">
                  🌐 {profile.contact.website}
                </div>
              )}
            </>
          )}

          {/* Member Since */}
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="text-gray-500 text-xs">
              🗓️ Member since {formatDate(profile.joiningDate)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewOnlyProfileCard;