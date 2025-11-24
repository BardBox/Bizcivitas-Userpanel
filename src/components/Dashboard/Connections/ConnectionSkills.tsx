"use client";

import React, { useState, useEffect } from "react";
import { useEndorseSkillMutation } from "@/store/api";
import { toast } from "react-hot-toast";
import { Award } from "lucide-react";

interface SkillItem {
    _id: string;
    name: string;
    score: number;
    endorsedByMe?: boolean;
    endorsedBy?: string[];
}

interface ConnectionSkillsProps {
    skills: SkillItem[];
    targetUserId: string;
    currentUserId?: string;
}

const ConnectionSkills: React.FC<ConnectionSkillsProps> = ({
    skills,
    targetUserId,
    currentUserId,
}) => {
    const [localSkills, setLocalSkills] = useState<SkillItem[]>(skills);
    const [endorseSkill, { isLoading: isEndorsing }] = useEndorseSkillMutation();
    const lastInteracted = React.useRef<{ [key: string]: number }>({});

    // Sync local state with props, but respect recent interactions to avoid flicker
    useEffect(() => {
        setLocalSkills((prevLocal) => {
            return skills.map((serverSkill) => {
                const localSkill = prevLocal.find((l) => l._id === serverSkill._id);
                const lastTime = lastInteracted.current[serverSkill._id];
                // If interacted within last 5 seconds, trust local state to avoid race conditions
                const isRecent = lastTime && Date.now() - lastTime < 5000;

                if (isRecent && localSkill) {
                    return {
                        ...serverSkill,
                        endorsedByMe: localSkill.endorsedByMe,
                        score: localSkill.score,
                    };
                }

                // Calculate endorsedByMe if missing, using endorsedBy array
                let isEndorsed = serverSkill.endorsedByMe;
                if (isEndorsed === undefined && serverSkill.endorsedBy && currentUserId) {
                    isEndorsed = serverSkill.endorsedBy.includes(currentUserId);
                }

                return {
                    ...serverSkill,
                    endorsedByMe: Boolean(isEndorsed),
                };
            });
        });
    }, [skills, currentUserId]);

    const handleEndorseSkill = async (skillId: string, endorsedByMe?: boolean) => {
        // Mark this skill as recently interacted
        lastInteracted.current[skillId] = Date.now();

        const oldScore = localSkills.find((s) => s._id === skillId)?.score || 0;
        const wasEndorsed = endorsedByMe || false;

        // Optimistic update
        const optimisticEndorsedState = !wasEndorsed;
        const optimisticScore = optimisticEndorsedState
            ? oldScore + 1
            : Math.max(0, oldScore - 1);

        setLocalSkills((prevSkills) =>
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
                skillId,
                targetUserId,
            }).unwrap();

            if (result.success && result.data) {
                const newScore = result.data.score;
                // Cast to SkillItem to ensure TS knows about endorsedByMe
                const serverEndorsedByMe = (result.data as unknown as SkillItem).endorsedByMe;

                setLocalSkills((prevSkills) =>
                    prevSkills.map((skill) => {
                        if (skill._id === skillId) {
                            return {
                                ...skill,
                                endorsedByMe: serverEndorsedByMe !== undefined ? serverEndorsedByMe : optimisticEndorsedState,
                                score: newScore, // Use actual score from server
                            };
                        }
                        return skill;
                    })
                );

                toast.success(
                    optimisticEndorsedState
                        ? "Skill endorsed successfully!"
                        : "Endorsement removed successfully!"
                );
            }
        } catch (error: any) {
            console.error("Endorse skill error:", error);
            toast.error(error?.data?.message || "Failed to update endorsement");

            // Revert optimistic update
            setLocalSkills((prevSkills) =>
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

    return (
        <div className="py-4 border-t border-gray-100">
            <div className="flex items-center gap-2 mb-3">
                <Award className="h-4 w-4 text-gray-500" />
                <span className="font-medium text-gray-700">Skills & Endorsements:</span>
            </div>

            {localSkills.length === 0 ? (
                <p className="text-gray-400 text-sm italic pl-6">No skills added yet</p>
            ) : (
                <div className="flex flex-wrap gap-3 pl-6">
                    {localSkills.map((skill) => (
                        <div
                            key={skill._id}
                            className="inline-flex items-center gap-2 group"
                        >
                            <span className="text-sm font-semibold text-gray-800 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-lg px-3 py-1.5 shadow-sm">
                                {skill.name}
                            </span>
                            <button
                                onClick={() => handleEndorseSkill(skill._id, skill.endorsedByMe)}
                                disabled={isEndorsing}
                                className={`flex items-center gap-1 px-2 py-1.5 rounded-lg font-medium transition-all ${skill.endorsedByMe
                                    ? "text-blue-600 bg-blue-50 hover:bg-blue-100"
                                    : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                                    }`}
                                title={
                                    skill.endorsedByMe
                                        ? "Remove endorsement"
                                        : "Endorse this skill"
                                }
                            >
                                {skill.endorsedByMe ? (
                                    <img
                                        src="/arrowfilled.svg"
                                        alt="Endorsed"
                                        className="h-4 w-4"
                                    />
                                ) : (
                                    <img
                                        src="/arrow.svg"
                                        alt="Endorse"
                                        className="h-4 w-4 opacity-60 group-hover:opacity-100"
                                    />
                                )}
                                <span className="text-xs font-bold">{skill.score}</span>
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ConnectionSkills;
