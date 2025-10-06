import React from "react";
import ProfilePhotoUpload from "./ProfilePhoto/ProfilePhotoUpload";
import CompanyLogoUpload from "./CompanyLogo/CompanyLogoUpload";
import ConnectionsAndShare from "./ConnectionsAndShare";

// Capitalize first letter utility
const capitalize = (str?: string) =>
  str ? str.charAt(0).toUpperCase() + str.slice(1) : "";

interface PersonalProfileCardProps {
  profile: {
    fname?: string;
    lname?: string;
    gender?: string;
    membershipType?: string;
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
  };
}

const PersonalProfileCard: React.FC<PersonalProfileCardProps> = ({
  profile,
}) => {
  return (
    <div className=" rounded-xl flex flex-col items-center justify-center border bg-white border-gray-100 overflow-hidden ">
      <ProfilePhotoUpload />
      <h2 className="text-xl sm:text-[24px] font-bold text-gray-900 mb-1">
        <span>
          {capitalize(profile.fname)} {profile.lname}
        </span>
      </h2>
      <p className="text-blue-600 font-medium text-sm sm:text-[14px] mb-3">
        {profile.membershipType}
      </p>
      <div className="mb-4">
        <ConnectionsAndShare userProfile={profile} />
      </div>
      <div className="text-center">
        <div className="text-center mb-4 sm:mb-6">
          <CompanyLogoUpload
            companyName={profile.business?.name}
            currentLogo={profile.business?.logo}
            onLogoUpdate={(logoUrl) => {
              // Optional: Handle logo update callback if needed
              console.log("Logo updated:", logoUrl);
            }}
          />
          <h3 className="font-semibold text-gray-900 text-sm sm:text-base">
            {profile.business?.name || "Business Name"}
          </h3>
        </div>
        {/* Contact Information */}
        <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm text-gray-600">
          <div className="text-center">
            <div className="mb-2 text-gray-800 font-medium text-xs sm:text-sm">
              {profile.location || "Location not provided"}
            </div>
            {profile.contact && (
              <>
                <div className="text-blue-600 font-medium">
                  Personal: {profile.contact.personal || "N/A"}
                </div>
                <div className="text-blue-600 font-medium">
                  Professional: {profile.contact.professional || "N/A"}
                </div>
                {profile.contact.email && (
                  <div className="text-blue-600 font-medium break-all">
                    {profile.contact.email}
                  </div>
                )}
                {profile.contact.website && (
                  <div className="text-blue-600 font-medium break-all">
                    {profile.contact.website}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonalProfileCard;
