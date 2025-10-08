"use client";

import React, { useState } from "react";
import { Pencil, Save, X, Plus, Trash2, Award, ThumbsUp } from "lucide-react";
import { useEndorseSkillMutation } from "@/store/api";
import toast from "react-hot-toast";

interface SkillItem {
  _id: string;
  name: string;
  score: number;
  endorsedByMe?: boolean;
}

interface MySkillsProps {
  mySkillItems?: SkillItem[];
  isEditing?: boolean;
  onEditStateChange?: (editing: boolean) => void;
  targetUserId?: string; //whose skills are these?
  isOwnProfile?: boolean; //can't endorse your own skills
}

const MySkills: React.FC<MySkillsProps> = ({
  mySkillItems = [],
  isEditing: externalIsEditing = false,
  onEditStateChange,
  targetUserId,
  isOwnProfile = false,
}) => {
  const [endorseSkill, { isLoading: isEndorsing }] = useEndorseSkillMutation();
  const [localSkills, setLocalSkills] = useState<SkillItem[]>(
    mySkillItems.length > 0 ? mySkillItems : []
  );
  const [newSkillName, setNewSkillName] = useState("");

  const handleAddSkill = () => {
    if (!newSkillName.trim()) return;

    const newSkill: SkillItem = {
      _id: `temp-${crypto.randomUUID()}`, // Temporary ID for new skills using UUID for uniqueness
      name: newSkillName.trim(),
      score: 0,
    };

    setLocalSkills([...localSkills, newSkill]);
    setNewSkillName("");
  };

  const handleRemoveSkill = (skillId: string) => {
    setLocalSkills(localSkills.filter((skill) => skill._id !== skillId));
  };

  const handleSave = async () => {
    // TODO: Call API to save skills
    console.log("Saving skills:", localSkills);
    // After successful save, notify parent to close edit mode
    if (onEditStateChange) {
      onEditStateChange(false);
    }
  };

  const handleCancel = () => {
    setLocalSkills(mySkillItems);
    setNewSkillName("");
    if (onEditStateChange) {
      onEditStateChange(false);
    }
  };

  const handleEndorseSkill = async (
    skillId: string,
    endorsedByMe?: boolean
  ) => {
    if (isOwnProfile) {
      toast.error("You cannot endorse your own skills!");
      return;
    }
    try {
      await endorseSkill({
        skillId: skillId,
        targetUserId: targetUserId!,
      }).unwrap();

      toast.success(endorsedByMe ? "Endorsement removed" : "Skill endorsed!");
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to endorse skill");
    }
  };
  // Sync with external prop changes
  React.useEffect(() => {
    if (!externalIsEditing) {
      setLocalSkills(mySkillItems);
    }
  }, [mySkillItems, externalIsEditing]);

  return (
    <div className="space-y-4">
      {/* View Mode */}
      {!externalIsEditing && (
        <>
          {localSkills.length === 0 ? (
            <div className="text-center py-8">
              <Award className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 mb-4">No skills added yet</p>
              <p className="text-sm text-gray-400">
                Click the edit button above to add your first skill
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {localSkills.map((skill) => (
                <div
                  key={skill._id}
                  className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100 hover:shadow-md transition-all duration-200"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-gray-900 text-sm flex-1 break-words pr-2">
                      {skill.name}
                    </h4>
                    <div className="flex items-center gap-1 bg-white px-2 py-1 rounded-full shadow-sm flex-shrink-0">
                      <button
                        onClick={() =>
                          handleEndorseSkill(skill._id, skill.endorsedByMe)
                        }
                        disabled={isEndorsing || isOwnProfile}
                        className={`flex items-center gap-1 px-2 py-1 rounded-full transition-all ${
                          skill.endorsedByMe
                            ? "bg-blue-600 text-white" // When endorsed
                            : "bg-white text-gray-600" // When not endorsed
                        } ${
                          isOwnProfile
                            ? "cursor-not-allowed opacity-50"
                            : "hover:scale-105"
                        }`}
                      >
                        <ThumbsUp
                          className="h-3 w-3"
                          fill={skill.endorsedByMe ? "currentColor" : "none"} // Filled or outline
                        />
                        <span className="text-xs font-bold">{skill.score}</span>
                      </button>{" "}
                      <span className="text-xs font-bold text-gray-700">
                        {skill.score}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-600">
                    {skill.score === 0
                      ? "No endorsements yet"
                      : `${skill.score} ${
                          skill.score === 1 ? "endorsement" : "endorsements"
                        }`}
                  </p>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Edit Mode */}
      {externalIsEditing && (
        <div className="space-y-4">
          {/* Add New Skill Input */}
          <div className="bg-gray-50 rounded-lg p-4 border-2 border-dashed border-gray-300">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Add New Skill
            </label>
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
                placeholder="e.g., Project Management, Digital Marketing"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                maxLength={50}
              />
              <button
                onClick={handleAddSkill}
                disabled={!newSkillName.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Press Enter or click Add to add the skill
            </p>
          </div>

          {/* Current Skills List */}
          {localSkills.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium text-gray-900 text-sm">
                Your Skills ({localSkills.length})
              </h4>
              <div className="space-y-2">
                {localSkills.map((skill) => (
                  <div
                    key={skill._id}
                    className="flex items-center justify-between bg-white border border-gray-200 rounded-lg p-3 hover:border-blue-300 transition-colors"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 text-sm">
                        {skill.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {skill.score}{" "}
                        {skill.score === 1 ? "endorsement" : "endorsements"}
                      </p>
                    </div>
                    <button
                      onClick={() => handleRemoveSkill(skill._id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="Remove skill"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={handleSave}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 font-medium"
            >
              <Save className="h-4 w-4" />
              Save Changes
            </button>
            <button
              onClick={handleCancel}
              className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 font-medium"
            >
              <X className="h-4 w-4" />
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MySkills;

// Custom hook for managing skills state with accordion
export const useMySkillsWithAccordion = (initialSkills?: SkillItem[]) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleEdit = () => setIsEditing(true);
  const handleCancel = () => setIsEditing(false);
  const handleSave = async () => {
    // This will be called by AccordionItem, actual save is handled in component
    setIsEditing(false);
  };

  const handleEditStateChange = (editing: boolean) => setIsEditing(editing);

  return {
    isEditing,
    isLoading,
    handleEdit,
    handleCancel,
    handleSave,
    handleEditStateChange,
  };
};
