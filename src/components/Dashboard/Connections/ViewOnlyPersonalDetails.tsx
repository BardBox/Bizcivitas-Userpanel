import React from "react";
import { Heart, User } from "lucide-react";

interface ViewOnlyPersonalDetailsProps {
  personalDetails: {
    hobbiesAndInterests?: string;
    myBurningDesireIsTo?: string;
  };
}

const ViewOnlyPersonalDetails: React.FC<ViewOnlyPersonalDetailsProps> = ({
  personalDetails,
}) => {
  const hasData = personalDetails?.hobbiesAndInterests || personalDetails?.myBurningDesireIsTo;

  if (!hasData) {
    return (
      <div className="text-center py-8 text-gray-500">
        <User className="h-12 w-12 mx-auto mb-3 text-gray-300" />
        <p>This member hasn&apos;t added their personal details yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {personalDetails?.hobbiesAndInterests && (
        <div>
          <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
            <Heart className="h-5 w-5 mr-2 text-pink-600" />
            Hobbies & Interests
          </h4>
          <p className="text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-lg">
            {personalDetails.hobbiesAndInterests}
          </p>
        </div>
      )}

      {personalDetails?.myBurningDesireIsTo && (
        <div>
          <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
            <Heart className="h-5 w-5 mr-2 text-red-600" />
            My Burning Desire
          </h4>
          <p className="text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-lg">
            {personalDetails.myBurningDesireIsTo}
          </p>
        </div>
      )}
    </div>
  );
};

export default ViewOnlyPersonalDetails;