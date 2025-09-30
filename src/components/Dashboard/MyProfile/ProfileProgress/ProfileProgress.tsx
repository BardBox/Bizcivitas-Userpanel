import React from "react";
import { User, FullProfile } from "@/store/api/userApi";

interface ProfileProgressProps {
  user: User | undefined;
  profile: FullProfile | undefined;
  onDismiss?: () => void;
  onEdit?: () => void;
}

interface CategoryProgress {
  completed: number;
  total: number;
}

interface CategoryData {
  [key: string]: CategoryProgress;
}

const calculateProgress = (
  user: User | undefined,
  profile: FullProfile | undefined
): CategoryData => {
  return {
    "Basic Info": {
      completed: [user?.fname, user?.lname, user?.email, user?.mobile].filter(
        Boolean
      ).length,
      total: 4,
    },
    "Professional Details": {
      completed: [
        profile?.professionalDetails?.companyName,
        profile?.professionalDetails?.industry,
        profile?.professionalDetails?.businessSubcategory,
        profile?.professionalDetails?.myBusiness,
      ].filter(Boolean).length,
      total: 4,
    },
    "Address Info": {
      completed: [
        profile?.addresses?.address?.addressLine1,
        profile?.addresses?.address?.city,
        profile?.addresses?.address?.state,
      ].filter(Boolean).length,
      total: 3,
    },
    "Bio Information": {
      completed: [
        profile?.myBio?.myBurningDesireIsTo,
        profile?.myBio?.hobbiesAndInterests,
        profile?.myBio?.cityOfResidence,
        (profile?.myBio?.tags?.length || 0) > 0,
      ].filter(Boolean).length,
      total: 4,
    },
    "Additional Info": {
      completed: [
        user?.avatar,
        profile?.contactDetails?.website,
        profile?.professionalDetails?.directNumber,
        profile?.myBio?.yearsInBusiness,
        (profile?.contactDetails?.socialNetworkLinks?.length || 0) > 0,
      ].filter(Boolean).length,
      total: 5,
    },
    "Advanced Bio": {
      completed: [
        profile?.myBio?.myKeyToSuccess,
        profile?.myBio?.myBurningDesireIsTo,
      ].filter(Boolean).length,
      total: 2,
    },
  };
};

const ProfileProgress: React.FC<ProfileProgressProps> = ({
  user,
  profile,
  onDismiss,
  onEdit,
}) => {
  const progressData = calculateProgress(user, profile);

  // Calculate total progress
  const totalCompleted = Object.values(progressData).reduce(
    (acc, curr) => acc + curr.completed,
    0
  );
  const totalSections = Object.values(progressData).reduce(
    (acc, curr) => acc + curr.total,
    0
  );
  const progressPercentage = Math.round((totalCompleted / totalSections) * 100);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {/* Header with dismiss button */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            Complete your profile to boost visibility
          </h2>
          <p className="text-gray-500 mt-1">
            {totalCompleted} of {totalSections} sections completed
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-2xl font-bold text-gray-900">
            {progressPercentage}%
          </span>
          {onDismiss && (
            <button
              onClick={onDismiss}
              className="text-gray-400 hover:text-gray-500"
              aria-label="Dismiss"
            >
              <span className="text-sm">Dismiss</span>
            </button>
          )}
        </div>
      </div>

      {/* Profile Strength Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-600">
            Profile Strength
          </span>
        </div>
        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${
              progressPercentage >= 80
                ? "bg-green-500"
                : progressPercentage >= 40
                ? "bg-yellow-500"
                : "bg-red-500"
            }`}
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Category Progress Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(progressData).map(([category, progress]) => (
          <div key={category} className="bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">
                {category}
              </span>
              <span className="text-sm text-gray-500">
                {progress.completed}/{progress.total}
              </span>
            </div>
            <div className="w-full h-1 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-600"
                style={{
                  width: `${(progress.completed / progress.total) * 100}%`,
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Complete Profile Button */}
      {onEdit && progressPercentage < 100 && (
        <button
          onClick={onEdit}
          className="w-full mt-6 flex items-center justify-center space-x-2 px-4 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
            />
          </svg>
          <span>Complete My Profile</span>
        </button>
      )}
    </div>
  );
};

export default ProfileProgress;
