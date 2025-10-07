import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Heart, Target, Award, Plus, Trash2 } from "lucide-react";
import { useUpdateMyBioMutation } from "../../../../../store/api/userApi";
import { useAppDispatch } from "../../../../../store/hooks";
import { addToast } from "../../../../../store/toastSlice";

interface SkillItem {
  _id: string;
  name: string;
  score: number;
}

interface PersonalDetailsFormData {
  hobbiesAndInterests: string;
  myBurningDesireIsTo: string;
}

interface PersonalDetailsProps {
  personalDetails: {
    hobbiesAndInterests?: string;
    myBurningDesireIsTo?: string;
  };
  mySkillItems?: SkillItem[];
  isEditing?: boolean; // Controlled by parent (accordion)
  onEditStateChange?: (isEditing: boolean) => void;
  formRef?: React.RefObject<HTMLFormElement | null>;
}

const PersonalDetails: React.FC<PersonalDetailsProps> = ({
  personalDetails,
  mySkillItems = [],
  isEditing = false,
  onEditStateChange,
  formRef,
}) => {
  const dispatch = useAppDispatch();
  const [localSkills, setLocalSkills] = useState<SkillItem[]>(mySkillItems);
  const [newSkillName, setNewSkillName] = useState("");

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

  const [updateMyBio] = useUpdateMyBioMutation();

  // Sync localSkills when mySkillItems prop changes (only when not editing)
  React.useEffect(() => {
    if (!isEditing) {
      setLocalSkills(mySkillItems);
    }
  }, [isEditing, mySkillItems]);

  const handleAddSkill = () => {
    if (!newSkillName.trim()) return;

    const newSkill: SkillItem = {
      _id: `temp-${Date.now()}`,
      name: newSkillName.trim(),
      score: 0,
    };

    setLocalSkills([...localSkills, newSkill]);
    setNewSkillName("");
  };

  const handleRemoveSkill = (skillId: string) => {
    setLocalSkills(localSkills.filter((skill) => skill._id !== skillId));
  };

  const handleSave = async (data: PersonalDetailsFormData) => {
    // Find which skills were deleted (in original but not in localSkills)
    const deletedSkillIds = mySkillItems
      .filter(
        (originalSkill) =>
          !localSkills.some(
            (localSkill) => localSkill._id === originalSkill._id
          )
      )
      .map((skill) => skill._id);

    // Build the skills array to send to backend:
    // 1. Existing skills that remain (with _id and name)
    // 2. New skills (only name)
    // 3. Deleted skills (only _id, without name - triggers backend deletion)
    const skillsToSend = [
      // Keep/update existing skills
      ...localSkills.map((skill) => {
        if (!skill._id.startsWith("temp-")) {
          return {
            _id: skill._id,
            name: skill.name,
          };
        }
        // New skills (backend will create ID)
        return {
          name: skill.name,
        };
      }),
      // Add deleted skills with _id only (no name = deletion signal)
      ...deletedSkillIds.map((id) => ({
        _id: id,
      })),
    ];

    const bioAndSkillsData = {
      myBio: {
        hobbiesAndInterests: data.hobbiesAndInterests || "",
        myBurningDesireIsTo: data.myBurningDesireIsTo || "",
      },
      mySkillItems: skillsToSend,
    };

    // Track success state
    let updateSucceeded = false;
    const errors: string[] = [];

    // Save bio and skills together in one API call
    try {
      await updateMyBio(bioAndSkillsData).unwrap();
      updateSucceeded = true;
    } catch (err: any) {
      console.error("Failed to update personal details and skills:", err);
      errors.push("personal details and skills");
    }

    // Provide feedback based on success/failure
    if (updateSucceeded) {
      dispatch(
        addToast({
          type: "success",
          message: "Personal details and skills updated successfully!",
          duration: 3000,
        })
      );
      onEditStateChange?.(false);
    } else if (errors.length > 0) {
      dispatch(
        addToast({
          type: "error",
          message: `Failed to update ${errors[0]}`,
          duration: 4000,
        })
      );
    }
  };

  const handleCancel = () => {
    reset(defaultValues);
    setLocalSkills(mySkillItems);
    setNewSkillName("");
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

          {/* My Skills Section */}
          <div className="grid grid-cols-[35%_1fr] gap-4 py-2 border-t border-gray-100 pt-4">
            <div>
              <span className="font-medium text-gray-700 flex items-center gap-2">
                <Award className="h-4 w-4 text-gray-500" />
                My Skills:
              </span>
            </div>
            <div>
              {!isEditing ? (
                // View Mode
                localSkills.length === 0 ? (
                  <span className="text-gray-400 text-sm italic">
                    No skills added yet
                  </span>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {localSkills.map((skill) => (
                      <div
                        key={skill._id}
                        className="inline-flex items-center gap-2 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-lg px-3 py-1.5 hover:shadow-sm transition-all group"
                      >
                        <span className="text-sm font-medium text-gray-900">
                          {skill.name}
                        </span>
                        <div className="flex items-center gap-1 bg-white px-1.5 py-0.5 rounded-full">
                          <Award className="h-3 w-3 text-yellow-500" />
                          <span className="text-xs font-bold text-gray-700">
                            {skill.score}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              ) : (
                // Edit Mode
                <div className="space-y-3">
                  {/* Add New Skill */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newSkillName}
                      onChange={(e) => setNewSkillName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddSkill();
                        }
                      }}
                      placeholder="Add a skill (e.g., Project Management)"
                      className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      maxLength={50}
                    />
                    <button
                      type="button"
                      onClick={handleAddSkill}
                      disabled={!newSkillName.trim()}
                      className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Current Skills List */}
                  {localSkills.length > 0 && (
                    <div className="space-y-2">
                      {localSkills.map((skill) => (
                        <div
                          key={skill._id}
                          className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-md px-3 py-2"
                        >
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">
                              {skill.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {skill.score}{" "}
                              {skill.score === 1
                                ? "endorsement"
                                : "endorsements"}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveSkill(skill._id)}
                            className="p-1.5 text-red-500 hover:bg-red-50 rounded transition-colors"
                            title="Remove skill"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default PersonalDetails;
