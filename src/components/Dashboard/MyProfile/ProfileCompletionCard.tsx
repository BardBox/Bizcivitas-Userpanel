import { FC } from "react";
import { User, FullProfile } from "@/store/api/userApi";
import { useProfileCompletion } from "@/hooks/useProfileCompletion";

interface ProfileCompletionCardProps {
  user: User | undefined;
  profile: FullProfile | undefined;
  onDismiss?: () => void;
  onEdit?: () => void;
}

const ProfileCompletionCard: FC<ProfileCompletionCardProps> = ({
  user,
  profile,
  onDismiss,
  onEdit,
}) => {
  const completion = useProfileCompletion(user, profile);

  // Color based on completion percentage
  const getCompletionColor = () => {
    if (completion.percentage >= 80) return "bg-emerald-100 text-emerald-600";
    if (completion.percentage >= 60) return "bg-amber-100 text-amber-600";
    return "bg-red-100 text-red-600";
  };

  const getProgressBarColor = () => {
    if (completion.percentage >= 80) return "bg-emerald-500";
    if (completion.percentage >= 60) return "bg-amber-500";
    return "bg-red-500";
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-6 relative">
      {/* Dismiss button */}
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="absolute top-3 right-3 flex items-center space-x-1 text-gray-500 hover:text-gray-700 text-sm"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
          <span>Dismiss</span>
        </button>
      )}

      {/* Header */}
      <div className="flex items-start space-x-4 mb-4">
        <div className={`rounded-full p-2 ${getCompletionColor()}`}>
          {completion.percentage >= 80 ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
              />
            </svg>
          )}
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-gray-900">
            {completion.percentage >= 100
              ? "Amazing! Your profile is complete!"
              : completion.percentage >= 80
              ? "Almost there! Complete your profile"
              : completion.percentage >= 60
              ? "Good progress! Keep going"
              : "Complete your profile to boost visibility"}
          </h3>
          <p className="text-gray-500 mt-1">
            {completion.completed} of {completion.total} sections completed
          </p>
        </div>
        <div className="text-3xl font-bold text-gray-900">
          {completion.percentage}%
        </div>
      </div>

      {/* Progress Bar */}
      <div className="relative pt-1">
        <div className="flex mb-2 items-center justify-between">
          <div className="text-right">
            <span className="text-xs font-semibold inline-block text-gray-600">
              Profile Strength
            </span>
          </div>
        </div>
        <div className="flex h-2 mb-4 overflow-hidden bg-gray-100 rounded">
          <div
            style={{ width: `${completion.percentage}%` }}
            className={`${getProgressBarColor()} transition-all duration-500 ease-out`}
          />
        </div>
      </div>

      {/* Category Completion */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
        {Object.entries(completion.completedByCategory).map(
          ([category, stats]) => (
            <div key={category} className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">
                  {category}
                </span>
                <span className="text-sm text-gray-500">
                  {stats.completed}/{stats.total}
                </span>
              </div>
              <div className="relative h-1 bg-gray-200 rounded">
                <div
                  style={{ width: `${(stats.completed / stats.total) * 100}%` }}
                  className="absolute h-1 bg-indigo-500 rounded"
                />
              </div>
            </div>
          )
        )}
      </div>

      {/* Action Button */}
      {onEdit && completion.percentage < 100 && (
        <button
          onClick={onEdit}
          className="w-full mt-6 bg-indigo-600 text-white py-2 px-4 rounded hover:bg-indigo-700 transition-colors flex items-center justify-center space-x-2"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
          </svg>
          <span>Complete My Profile</span>
        </button>
      )}
    </div>
  );
};

export default ProfileCompletionCard;
