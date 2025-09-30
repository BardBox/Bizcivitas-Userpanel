import React from "react";
import { useForm } from "react-hook-form";
import { Heart, Target } from "lucide-react";
import { useUpdateMyBioMutation } from "../../../../../store/api/userApi";

interface PersonalDetailsProps {
  personalDetails: {
    hobbiesAndInterests?: string;
    myBurningDesireIsTo?: string;
  };
  isEditing?: boolean; // Controlled by parent (accordion)
  onEditStateChange?: (isEditing: boolean) => void;
  formRef?: React.RefObject<HTMLFormElement | null>;
}

const PersonalDetails: React.FC<PersonalDetailsProps> = ({
  personalDetails,
  isEditing = false,
  onEditStateChange,
  formRef,
}) => {
  const defaultValues = {
    hobbiesAndInterests: personalDetails?.hobbiesAndInterests || "",
    myBurningDesireIsTo: personalDetails?.myBurningDesireIsTo || "",
  };

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm({ defaultValues });

  const [updateMyBio, { isLoading }] = useUpdateMyBioMutation();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleSave = async (data: any) => {
    try {
      const bioData = {
        myBio: {
          hobbiesAndInterests: data.hobbiesAndInterests || "",
          myBurningDesireIsTo: data.myBurningDesireIsTo || "",
        },
      };

      await updateMyBio(bioData).unwrap();
      onEditStateChange?.(false);
    } catch (err) {
      console.error("Failed to update personal details:", err);
    }
  };

  const handleCancel = () => {
    reset(defaultValues);
    onEditStateChange?.(false);
  };

  return (
    <div className="bg-white rounded-lg p-2 mb-6">
      <form ref={formRef} onSubmit={handleSubmit(handleSave)}>
        <div className="space-y-3">
          {/* About Me */}
          <div className="grid grid-cols-[35%_1fr] gap-4 py-2">
            <div>
              <span className="font-medium text-gray-700 flex items-center gap-2">
                <Target className="h-4 w-4 text-gray-500" />
                About Me:
              </span>
            </div>
            <div>
              {!isEditing ? (
                <span className="text-gray-600 whitespace-pre-wrap">
                  {personalDetails?.myBurningDesireIsTo || "-"}
                </span>
              ) : (
                <textarea
                  {...register("myBurningDesireIsTo")}
                  rows={3}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
                  placeholder="Tell us about yourself"
                />
              )}
            </div>
          </div>

          {/* Hobbies and Interests */}
          <div className="grid grid-cols-[35%_1fr] gap-4 py-2">
            <div>
              <span className="font-medium text-gray-700 flex items-center gap-2">
                <Heart className="h-4 w-4 text-gray-500" />
                Hobbies & Interests:
              </span>
            </div>
            <div>
              {!isEditing ? (
                <span className="text-gray-600 whitespace-pre-wrap">
                  {personalDetails?.hobbiesAndInterests || "-"}
                </span>
              ) : (
                <textarea
                  {...register("hobbiesAndInterests")}
                  rows={3}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
                  placeholder="Enter your hobbies and interests"
                />
              )}
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default PersonalDetails;
