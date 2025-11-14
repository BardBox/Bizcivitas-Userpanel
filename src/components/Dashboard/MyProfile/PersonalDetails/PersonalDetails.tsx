import React, { useState } from "react";
import { useForm } from "react-hook-form";
import {
  Heart,
  Target,
  Award,
  Plus,
  Trash2,
  ArrowBigUpDash,
} from "lucide-react";
import { useUpdateMyBioMutation, useEndorseSkillMutation } from "@/store/api";
import { useAppDispatch } from "../../../../../store/hooks";
import { addToast } from "../../../../../store/toastSlice";
import { toast } from "react-hot-toast";

interface SkillItem {
  _id: string;
  name: string;
  score: number;
  endorsedByMe?: boolean;
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
  targetUserId?: string; // For skill endorsement
  isOwnProfile?: boolean; // To disable endorsement on own profile
}

const PersonalDetails: React.FC<PersonalDetailsProps> = ({
  personalDetails,
  mySkillItems = [],
  isEditing = false,
  onEditStateChange,
  formRef,
  targetUserId,
  isOwnProfile,
}) => {
  const dispatch = useAppDispatch();
  const [localSkills, setLocalSkills] = useState<SkillItem[]>(mySkillItems);
  const [newSkillName, setNewSkillName] = useState("");
  const [endorseSkill, { isLoading: isEndorsing }] = useEndorseSkillMutation();

  // No localStorage needed - API is the source of truth

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

  // Sync localSkills when mySkillItems prop changes (only when not editing)
  React.useEffect(() => {
    if (!isEditing) {
      // Ensure each skill has the endorsedByMe field properly set
      const skillsWithEndorsementStatus = mySkillItems.map(skill => ({
        ...skill,
        endorsedByMe: Boolean(skill.endorsedByMe) // Ensure it's always boolean
      }));
      setLocalSkills(skillsWithEndorsementStatus);
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

  const handleEndorseSkill = async (
    skillId: string,
    endorsedByMe?: boolean
  ) => {
    if (isOwnProfile) {
      toast.error("You cannot endorse your own skills!");
      return;
    }

    // Get the old score and state BEFORE making the API call
    const oldScore = localSkills.find(s => s._id === skillId)?.score || 0;
    const wasEndorsed = endorsedByMe || false;

    // Optimistic update - toggle state immediately for instant feedback
    const optimisticEndorsedState = !wasEndorsed;
    const optimisticScore = optimisticEndorsedState ? oldScore + 1 : Math.max(0, oldScore - 1);

    setLocalSkills(prevSkills =>
      prevSkills.map((skill) => {
        if (skill._id === skillId) {
          return {
            ...skill,
            endorsedByMe: optimisticEndorsedState,
            score: optimisticScore,
          };
        }
        return skill;
      })
    );

    try {
      const result = await endorseSkill({
        skillId: skillId,
        targetUserId: targetUserId!,
      }).unwrap();

      // IMPORTANT: Backend /increment endpoint is a toggle
      // It increments if not endorsed, decrements if already endorsed
      // The optimistic state matches what backend did
      if (result.success && result.data) {
        const newScore = result.data.score;

        // Update with the actual score from API
        // Keep the optimistic endorsedByMe state since backend is a toggle
        setLocalSkills(prevSkills =>
          prevSkills.map((skill) => {
            if (skill._id === skillId) {
              return {
                ...skill,
                // Keep optimistic state - backend toggles, so if we toggled to true, it's true
                endorsedByMe: optimisticEndorsedState,
                score: newScore, // Always use score from API
              };
            }
            return skill;
          })
        );

        // Show appropriate message based on the toggle
        toast.success(
          optimisticEndorsedState
            ? "Skill endorsed successfully!"
            : "Endorsement removed successfully!"
        );
      } else {
        // Fallback if API doesn't return expected data
        toast.success(result.message || "Action completed");
      }
    } catch (error: any) {
      console.error("Endorse skill error:", error);
      toast.error(error?.data?.message || "Failed to update endorsement");

      // Revert optimistic update on error
      setLocalSkills(prevSkills =>
        prevSkills.map((skill) => {
          if (skill._id === skillId) {
            return {
              ...skill,
              endorsedByMe: wasEndorsed,
              score: oldScore,
            };
          }
          return skill;
        })
      );
    }
  };

  const handleSave = async (data: PersonalDetailsFormData) => {
    // Prevent duplicate submissions while request is pending
    if (isLoading) return;

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
          duration: 3000, // Reduced from 3000ms to 3000ms (keeping same)
        })
      );
      onEditStateChange?.(false);
    } else if (errors.length > 0) {
      dispatch(
        addToast({
          type: "error",
          message: `Failed to update ${errors[0]}`,
          duration: 3000, // Reduced from 4000ms to 3000ms
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
    <div className="bg-white rounded-lg mb-6">
      <form ref={formRef} onSubmit={handleSubmit(handleSave)}>
        <fieldset disabled={isLoading} className="space-y-3">
          {/* About Me */}
          <div className="grid grid-cols-1 md:grid-cols-[35%_1fr] gap-1 md:gap-4 py-2">
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
          <div className="grid grid-cols-1 md:grid-cols-[35%_1fr] gap-1 md:gap-4 py-2">
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
          <div className="grid grid-cols-1 md:grid-cols-[35%_1fr] gap-1 md:gap-4 py-2 border-t border-gray-100 pt-4">
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
                  <div className="flex flex-wrap gap-3">
                    {localSkills.map((skill) => (
                      <div
                        key={skill._id}
                        className="inline-flex items-center gap-2 group"
                      >
                        <span className="text-sm font-semibold text-gray-800 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-lg px-3 py-1.5 shadow-sm">
                          {skill.name}
                        </span>
                        <button
                          onClick={() =>
                            handleEndorseSkill(skill._id, skill.endorsedByMe)
                          }
                          disabled={isEndorsing || isOwnProfile}
                          className={`flex items-center gap-1 px-2 py-1.5 rounded-lg font-medium ${
                            skill.endorsedByMe
                              ? "text-blue-600"
                              : "text-gray-600"
                          } ${
                            isOwnProfile
                              ? "cursor-not-allowed opacity-50"
                              : ""
                          }`}
                          title={
                            isOwnProfile
                              ? "Can't endorse own skills"
                              : skill.endorsedByMe
                              ? "Remove endorsement (Click to un-endorse)"
                              : "Endorse skill (Click to endorse)"
                          }
                        >
                          {skill.endorsedByMe ? (
                            // Filled arrow (endorsed by you)
                            <img
                              src="/arrowfilled.svg"
                              alt="Endorsed"
                              className="h-4 w-4"
                            />
                          ) : (
                            // Outlined arrow (not endorsed by you)
                            <img
                              src="/arrow.svg"
                              alt="Endorse"
                              className="h-4 w-4"
                            />
                          )}
                          <span className="text-xs font-bold text-gray-700">
                            {skill.score}
                          </span>
                        </button>
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
        </fieldset>
      </form>
    </div>
  );
};

export default PersonalDetails;
