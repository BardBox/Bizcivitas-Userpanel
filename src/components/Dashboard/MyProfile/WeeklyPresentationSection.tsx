import React from "react";

interface WeeklyPresentationSectionProps {
  weeklyPresentation?: {
    title?: string;
    description?: string;
    presentationDate?: string;
  };
}

const WeeklyPresentationSection: React.FC<WeeklyPresentationSectionProps> = ({
  weeklyPresentation,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Weekly Presentation
      </h3>
      {weeklyPresentation ? (
        <div className="space-y-3">
          {weeklyPresentation.title && (
            <div>
              <span className="font-medium text-gray-700">Title: </span>
              <span className="text-gray-600">{weeklyPresentation.title}</span>
            </div>
          )}
          {weeklyPresentation.description && (
            <div>
              <span className="font-medium text-gray-700">Description: </span>
              <span className="text-gray-600">
                {weeklyPresentation.description}
              </span>
            </div>
          )}
          {weeklyPresentation.presentationDate && (
            <div>
              <span className="font-medium text-gray-700">Date: </span>
              <span className="text-gray-600">
                {new Date(
                  weeklyPresentation.presentationDate
                ).toLocaleDateString()}
              </span>
            </div>
          )}
        </div>
      ) : (
        <p className="text-gray-500">
          No weekly presentation information available
        </p>
      )}
    </div>
  );
};

export default WeeklyPresentationSection;
