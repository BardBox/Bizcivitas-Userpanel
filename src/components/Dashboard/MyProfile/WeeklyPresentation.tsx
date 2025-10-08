import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Presentation, Calendar, FileText } from "lucide-react";
import { useUpdateProfileMutation } from "@/store/api";

interface WeeklyPresentationProps {
  weeklyPresentation?: {
    title?: string;
    description?: string;
    presentationDate?: string;
  };
  isEditing?: boolean; // Controlled by parent (accordion)
  onEditStateChange?: (isEditing: boolean) => void;
  formRef?: React.RefObject<HTMLFormElement | null>;
}

const WeeklyPresentation: React.FC<WeeklyPresentationProps> = ({
  weeklyPresentation,
  isEditing = false,
  onEditStateChange,
  formRef,
}) => {
  // Format date for input field (YYYY-MM-DD format)
  const formatDateForInput = (dateString?: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toISOString().split("T")[0];
  };

  const defaultValues = {
    title: weeklyPresentation?.title || "",
    description: weeklyPresentation?.description || "",
    presentationDate: formatDateForInput(weeklyPresentation?.presentationDate),
  };

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ defaultValues });

  const [updateProfile, { isLoading, error }] = useUpdateProfileMutation();

  const handleSave = async (data: {
    title?: string;
    description?: string;
    weeklyPresentationLink?: string;
    presentationDate?: string;
  }) => {
    console.log("Attempting to save weekly presentation:", data);
    try {
      // Clean the data - remove empty strings and undefined values
      const presentationData = {
        ...(data.title &&
          data.title.trim() !== "" && { title: data.title.trim() }),
        ...(data.description &&
          data.description.trim() !== "" && {
            description: data.description.trim(),
          }),
        ...(data.presentationDate &&
          data.presentationDate.trim() !== "" && {
            presentationDate: data.presentationDate.trim(),
          }),
      };

      const cleanedData = {
        weeklyPresentation: presentationData,
      };

      console.log("Cleaned data to send:", cleanedData);

      const result = await updateProfile(cleanedData as any).unwrap();
      console.log("Save successful:", result);
      onEditStateChange?.(false);
    } catch (err) {
      console.error("Failed to update weekly presentation:", err);
      if (err && typeof err === "object") {
        console.error("Error details:", JSON.stringify(err, null, 2));
      }
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
          {/* Title */}
          <div className="grid grid-cols-[35%_1fr] gap-4 py-2">
            <div>
              <span className="font-medium text-gray-700 flex items-center gap-2">
                <Presentation className="h-4 w-4 text-gray-500" />
                Presentation Title:
              </span>
            </div>
            <div>
              {!isEditing ? (
                <span className="text-gray-600">
                  {weeklyPresentation?.title || "No title set"}
                </span>
              ) : (
                <input
                  {...register("title", {
                    required: "Title is required",
                  })}
                  className="w-full border border-gray-300 rounded-md px-3 py-1 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  placeholder="Enter presentation title"
                />
              )}
              {errors.title && (
                <span className="text-red-500 text-sm block mt-1">
                  {errors.title.message}
                </span>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="grid grid-cols-[35%_1fr] gap-4 py-2">
            <div>
              <span className="font-medium text-gray-700 flex items-center gap-2">
                <FileText className="h-4 w-4 text-gray-500" />
                Description:
              </span>
            </div>
            <div>
              {!isEditing ? (
                <span className="text-gray-600 whitespace-pre-wrap">
                  {weeklyPresentation?.description ||
                    "No description available"}
                </span>
              ) : (
                <textarea
                  {...register("description", {
                    required: "Description is required",
                  })}
                  rows={4}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
                  placeholder="Describe your presentation topic and content"
                />
              )}
              {errors.description && (
                <span className="text-red-500 text-sm block mt-1">
                  {errors.description.message}
                </span>
              )}
            </div>
          </div>

          {/* Presentation Date */}
          <div className="grid grid-cols-[35%_1fr] gap-4 py-2">
            <div>
              <span className="font-medium text-gray-700 flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                Presentation Date:
              </span>
            </div>
            <div>
              {!isEditing ? (
                <span className="text-gray-600">
                  {weeklyPresentation?.presentationDate
                    ? new Date(
                        weeklyPresentation.presentationDate
                      ).toLocaleDateString()
                    : "No date scheduled"}
                </span>
              ) : (
                <input
                  {...register("presentationDate", {
                    required: "Presentation date is required",
                  })}
                  type="date"
                  className="w-full border border-gray-300 rounded-md px-3 py-1 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              )}
              {errors.presentationDate && (
                <span className="text-red-500 text-sm block mt-1">
                  {errors.presentationDate.message}
                </span>
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

// Hook to connect WeeklyPresentation with Accordion edit functionality
export const useWeeklyPresentationWithAccordion = (
  weeklyPresentation?: WeeklyPresentationProps["weeklyPresentation"]
) => {
  const [isEditing, setIsEditing] = useState(false);
  const formRef = React.useRef<HTMLFormElement>(null);

  const [updateProfile, { isLoading, error }] = useUpdateProfileMutation();

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
    // Props for WeeklyPresentation component
    weeklyPresentationProps: {
      weeklyPresentation,
      isEditing,
      onEditStateChange: handleEditStateChange,
      formRef,
    },
  };
};

export default WeeklyPresentation;
