import React, { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { User, FileText, Target, Heart, Plus, Trash2 } from "lucide-react";
import { useUpdateMyBioMutation } from "@/store/api";

interface MyBioSectionProps {
  myBio?: {
    aboutMe?: string;
    myStory?: string;
    mySkills?: string[];
    professionalInterests?: string[]; // keep if still used elsewhere
    hobbiesAndInterests?: string;
  };
  isEditing?: boolean; // Controlled by parent (accordion)
  onEditStateChange?: (isEditing: boolean) => void;
  formRef?: React.RefObject<HTMLFormElement | null>;
}

const MyBioSection: React.FC<MyBioSectionProps> = ({
  myBio,
  isEditing = false,
  onEditStateChange,
  formRef,
}) => {
  const defaultValues = {
    aboutMe: myBio?.aboutMe || "",
    myStory: myBio?.myStory || "",
    hobbiesAndInterests: myBio?.hobbiesAndInterests || "",
    mySkills: myBio?.mySkills?.map((skill) => ({ value: skill })) || [],
    professionalInterests:
      myBio?.professionalInterests?.map((interest) => ({ value: interest })) ||
      [],
  };

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm({ defaultValues });

  const {
    fields: skillFields,
    append: appendSkill,
    remove: removeSkill,
  } = useFieldArray({
    control,
    name: "mySkills",
  });

  const {
    fields: interestFields,
    append: appendInterest,
    remove: removeInterest,
  } = useFieldArray({
    control,
    name: "professionalInterests",
  });

  const [updateMyBio, { isLoading, error }] = useUpdateMyBioMutation();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleSave = async (data: any) => {
    console.log("Attempting to save bio section:", data);
    try {
      // Transform array fields back to string arrays
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mySkills = data.mySkills
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .filter((item: any) => item.value && item.value.trim() !== "")
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .map((item: any) => item.value.trim());

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const professionalInterests = data.professionalInterests
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .filter((item: any) => item.value && item.value.trim() !== "")
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .map((item: any) => item.value.trim());

      // Clean the data - remove empty strings and undefined values
      const cleanedData = {
        ...(data.aboutMe &&
          data.aboutMe.trim() !== "" && { aboutMe: data.aboutMe.trim() }),
        ...(data.myStory &&
          data.myStory.trim() !== "" && { myStory: data.myStory.trim() }),
        ...(data.hobbiesAndInterests &&
          data.hobbiesAndInterests.trim() !== "" && {
            hobbiesAndInterests: data.hobbiesAndInterests.trim(),
          }),
        ...(mySkills.length > 0 && { mySkills }),
        ...(professionalInterests.length > 0 && { professionalInterests }),
      };

      console.log("Cleaned data to send:", cleanedData);

      // Backend expects myBio wrapper
      const backendData = {
        myBio: cleanedData,
      };

      console.log("Backend format data:", backendData);
      const result = await updateMyBio(backendData).unwrap();
      console.log("Save successful:", result);
      onEditStateChange?.(false);
    } catch (err) {
      console.error("Failed to update bio section:", err);
      if (err && typeof err === "object") {
        console.error("Error details:", JSON.stringify(err, null, 2));
      }
    }
  };

  const handleCancel = () => {
    reset(defaultValues);
    onEditStateChange?.(false);
  };

  const addSkill = () => {
    appendSkill({ value: "" });
  };

  const addInterest = () => {
    appendInterest({ value: "" });
  };

  return (
    <div className="bg-white rounded-lg p-2 mb-6">
      <form ref={formRef} onSubmit={handleSubmit(handleSave)}>
        <div className="space-y-3">
          {/* About Me */}
          <div className="grid grid-cols-[35%_1fr] gap-4 py-2">
            <div>
              <span className="font-medium text-gray-700 flex items-center gap-2">
                <User className="h-4 w-4 text-gray-500" />
                About Me:
              </span>
            </div>
            <div>
              {!isEditing ? (
                <span className="text-gray-600 whitespace-pre-wrap">
                  {myBio?.aboutMe || "-"}
                </span>
              ) : (
                <textarea
                  {...register("aboutMe")}
                  rows={4}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
                  placeholder="Tell us about yourself"
                />
              )}
            </div>
          </div>

          {/* My Story */}
          <div className="grid grid-cols-[35%_1fr] gap-4 py-2">
            <div>
              <span className="font-medium text-gray-700 flex items-center gap-2">
                <FileText className="h-4 w-4 text-gray-500" />
                My Story:
              </span>
            </div>
            <div>
              {!isEditing ? (
                <span className="text-gray-600 whitespace-pre-wrap">
                  {myBio?.myStory || "-"}
                </span>
              ) : (
                <textarea
                  {...register("myStory")}
                  rows={4}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
                  placeholder="Share your professional story"
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
                  {myBio?.hobbiesAndInterests || "-"}
                </span>
              ) : (
                <textarea
                  {...register("hobbiesAndInterests")}
                  rows={3}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
                  placeholder="Describe your hobbies and personal interests"
                />
              )}
            </div>
          </div>

          {/* Skills */}
          <div className="grid grid-cols-[35%_1fr] gap-4 py-2">
            <div>
              <span className="font-medium text-gray-700 flex items-center gap-2">
                <Target className="h-4 w-4 text-gray-500" />
                Skills:
              </span>
            </div>
            <div className="space-y-3">
              {!isEditing ? (
                myBio?.mySkills && myBio.mySkills.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {myBio.mySkills.map((skill, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="text-gray-600">No skills listed</span>
                )
              ) : (
                <div className="space-y-2">
                  {skillFields.map((field, index) => (
                    <div key={field.id} className="flex gap-2">
                      <input
                        {...register(`mySkills.${index}.value`)}
                        className="flex-1 border border-gray-300 rounded-md px-3 py-1 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        placeholder="Enter a skill"
                      />
                      <button
                        type="button"
                        onClick={() => removeSkill(index)}
                        className="px-2 py-1 text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addSkill}
                    className="flex items-center gap-2 px-3 py-1 text-sm text-indigo-600 hover:text-indigo-800"
                  >
                    <Plus className="h-4 w-4" />
                    Add Skill
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Professional Interests */}
          <div className="grid grid-cols-[35%_1fr] gap-4 py-2">
            <div>
              <span className="font-medium text-gray-700 flex items-center gap-2">
                <Target className="h-4 w-4 text-gray-500" />
                Professional Interests:
              </span>
            </div>
            <div className="space-y-3">
              {!isEditing ? (
                myBio?.professionalInterests &&
                myBio.professionalInterests.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {myBio.professionalInterests.map((interest, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full"
                      >
                        {interest}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="text-gray-600">
                    No professional interests listed
                  </span>
                )
              ) : (
                <div className="space-y-2">
                  {interestFields.map((field, index) => (
                    <div key={field.id} className="flex gap-2">
                      <input
                        {...register(`professionalInterests.${index}.value`)}
                        className="flex-1 border border-gray-300 rounded-md px-3 py-1 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        placeholder="Enter a professional interest"
                      />
                      <button
                        type="button"
                        onClick={() => removeInterest(index)}
                        className="px-2 py-1 text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addInterest}
                    className="flex items-center gap-2 px-3 py-1 text-sm text-indigo-600 hover:text-indigo-800"
                  >
                    <Plus className="h-4 w-4" />
                    Add Professional Interest
                  </button>
                </div>
              )}
            </div>
          </div>

          {error && isEditing && (
            <div className="grid grid-cols-[35%_1fr] gap-4 py-2">
              <div></div>
              <div className="text-red-500 text-sm">{String(error)}</div>
            </div>
          )}
        </div>
      </form>
    </div>
  );
};

// Hook to connect MyBioSection with Accordion edit functionality
export const useMyBioSectionWithAccordion = (
  myBio?: MyBioSectionProps["myBio"]
) => {
  const [isEditing, setIsEditing] = useState(false);
  const formRef = React.useRef<HTMLFormElement>(null);

  const [updateMyBio, { isLoading, error }] = useUpdateMyBioMutation();

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleEditStateChange = (editing: boolean) => {
    setIsEditing(editing);
  };

  const handleFormSave = () => {
    // Trigger form submission
    if (formRef.current) {
      formRef.current.requestSubmit();
    }
  };

  return {
    isEditing,
    isLoading,
    handleEdit,
    handleSave: handleFormSave,
    handleCancel,
    handleEditStateChange,
    formRef,
    // Props for MyBioSection component
    myBioSectionProps: {
      myBio,
      isEditing,
      onEditStateChange: handleEditStateChange,
      formRef,
    },
  };
};

export default MyBioSection;
