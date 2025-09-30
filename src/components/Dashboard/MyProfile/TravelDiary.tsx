import React, { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { MapPin, Plane, Target, Car, Plus, Trash2 } from "lucide-react";
import { useUpdateTravelDiaryMutation } from "../../../../store/api/userApi";

interface TravelDiaryProps {
  travelDiary?: {
    businessBucketList?: string[];
    dealsOnWheels?: string[];
    dreamDestination?: string;
    myFootprints?: string[];
  };
  isEditing?: boolean; // Controlled by parent (accordion)
  onEditStateChange?: (isEditing: boolean) => void;
  formRef?: React.RefObject<HTMLFormElement | null>;
}

const TravelDiary: React.FC<TravelDiaryProps> = ({
  travelDiary,
  isEditing = false,
  onEditStateChange,
  formRef,
}) => {
  const defaultValues = {
    dreamDestination: travelDiary?.dreamDestination || "",
    myFootprints:
      travelDiary?.myFootprints?.map((place) => ({ value: place })) || [],
    businessBucketList:
      travelDiary?.businessBucketList?.map((dest) => ({ value: dest })) || [],
    dealsOnWheels:
      travelDiary?.dealsOnWheels?.map((deal) => ({ value: deal })) || [],
  };

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm({ defaultValues });

  const {
    fields: footprintFields,
    append: appendFootprint,
    remove: removeFootprint,
  } = useFieldArray({
    control,
    name: "myFootprints",
  });

  const {
    fields: bucketFields,
    append: appendBucket,
    remove: removeBucket,
  } = useFieldArray({
    control,
    name: "businessBucketList",
  });

  const {
    fields: dealFields,
    append: appendDeal,
    remove: removeDeal,
  } = useFieldArray({
    control,
    name: "dealsOnWheels",
  });

  const [updateTravelDiary, { isLoading, error }] =
    useUpdateTravelDiaryMutation();

  const handleSave = async (data: { dreamDestination?: string; myFootprints?: { value: string }[]; businessBucketList?: { value: string }[]; dealsOnWheels?: { value: string }[] }) => {
    console.log("Attempting to save travel diary:", data);
    try {
      // Transform array fields back to string arrays
      const myFootprints = data.myFootprints
        ?.filter((item: { value: string }) => item.value && item.value.trim() !== "")
        .map((item: { value: string }) => item.value.trim()) || [];

      const businessBucketList = data.businessBucketList
        ?.filter((item: { value: string }) => item.value && item.value.trim() !== "")
        .map((item: { value: string }) => item.value.trim()) || [];

      const dealsOnWheels = data.dealsOnWheels
        ?.filter((item: { value: string }) => item.value && item.value.trim() !== "")
        .map((item: { value: string }) => item.value.trim()) || [];

      // Clean the data
      const cleanedData = {
        ...(data.dreamDestination &&
          data.dreamDestination.trim() !== "" && {
            dreamDestination: data.dreamDestination.trim(),
          }),
        ...(myFootprints.length > 0 && { myFootprints }),
        ...(businessBucketList.length > 0 && { businessBucketList }),
        ...(dealsOnWheels.length > 0 && { dealsOnWheels }),
      };

      console.log("Cleaned data to send:", cleanedData);

      const result = await updateTravelDiary(cleanedData).unwrap();
      console.log("Save successful:", result);
      onEditStateChange?.(false);
    } catch (err) {
      console.error("Failed to update travel diary:", err);
      if (err && typeof err === "object") {
        console.error("Error details:", JSON.stringify(err, null, 2));
      }
    }
  };

  const handleCancel = () => {
    reset(defaultValues);
    onEditStateChange?.(false);
  };

  const addFootprint = () => {
    appendFootprint({ value: "" });
  };

  const addBucket = () => {
    appendBucket({ value: "" });
  };

  const addDeal = () => {
    appendDeal({ value: "" });
  };

  return (
    <div className="bg-white rounded-lg p-2 mb-6">
      <form ref={formRef} onSubmit={handleSubmit(handleSave)}>
        <div className="space-y-3">
          {/* Dream Destination */}
          <div className="grid grid-cols-[35%_1fr] gap-4 py-2">
            <div>
              <span className="font-medium text-gray-700 flex items-center gap-2">
                <MapPin className="h-4 w-4 text-gray-500" />
                Dream Destination:
              </span>
            </div>
            <div>
              {!isEditing ? (
                <span className="text-gray-600">
                  {travelDiary?.dreamDestination || "-"}
                </span>
              ) : (
                <input
                  {...register("dreamDestination")}
                  className="w-full border border-gray-300 rounded-md px-3 py-1 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  placeholder="Enter your dream travel destination"
                />
              )}
            </div>
          </div>

          {/* My Footprints */}
          <div className="grid grid-cols-[35%_1fr] gap-4 py-2">
            <div>
              <span className="font-medium text-gray-700 flex items-center gap-2">
                <Plane className="h-4 w-4 text-gray-500" />
                My Footprints:
              </span>
            </div>
            <div className="space-y-3">
              {!isEditing ? (
                travelDiary?.myFootprints &&
                travelDiary.myFootprints.length > 0 ? (
                  <div className="space-y-2">
                    {travelDiary.myFootprints.map((place, index) => (
                      <div
                        key={index}
                        className="text-gray-600 bg-gray-50 p-2 rounded text-sm"
                      >
                        {place}
                      </div>
                    ))}
                  </div>
                ) : (
                  <span className="text-gray-600">No places visited yet</span>
                )
              ) : (
                <div className="space-y-2">
                  {footprintFields.map((field, index) => (
                    <div key={field.id} className="flex gap-2">
                      <input
                        {...register(`myFootprints.${index}.value`)}
                        className="flex-1 border border-gray-300 rounded-md px-3 py-1 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        placeholder="Enter a place you've visited"
                      />
                      <button
                        type="button"
                        onClick={() => removeFootprint(index)}
                        className="px-2 py-1 text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addFootprint}
                    className="flex items-center gap-2 px-3 py-1 text-sm text-indigo-600 hover:text-indigo-800"
                  >
                    <Plus className="h-4 w-4" />
                    Add Footprint
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Business Bucket List */}
          <div className="grid grid-cols-[35%_1fr] gap-4 py-2">
            <div>
              <span className="font-medium text-gray-700 flex items-center gap-2">
                <Target className="h-4 w-4 text-gray-500" />
                Business Bucket List:
              </span>
            </div>
            <div className="space-y-3">
              {!isEditing ? (
                travelDiary?.businessBucketList &&
                travelDiary.businessBucketList.length > 0 ? (
                  <div className="space-y-2">
                    {travelDiary.businessBucketList.map(
                      (destination, index) => (
                        <div
                          key={index}
                          className="text-gray-600 bg-gray-50 p-2 rounded text-sm"
                        >
                          {destination}
                        </div>
                      )
                    )}
                  </div>
                ) : (
                  <span className="text-gray-600">
                    No business destinations planned
                  </span>
                )
              ) : (
                <div className="space-y-2">
                  {bucketFields.map((field, index) => (
                    <div key={field.id} className="flex gap-2">
                      <input
                        {...register(`businessBucketList.${index}.value`)}
                        className="flex-1 border border-gray-300 rounded-md px-3 py-1 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        placeholder="Enter a business destination you want to visit"
                      />
                      <button
                        type="button"
                        onClick={() => removeBucket(index)}
                        className="px-2 py-1 text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addBucket}
                    className="flex items-center gap-2 px-3 py-1 text-sm text-indigo-600 hover:text-indigo-800"
                  >
                    <Plus className="h-4 w-4" />
                    Add Business Destination
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Deals on Wheels */}
          <div className="grid grid-cols-[35%_1fr] gap-4 py-2">
            <div>
              <span className="font-medium text-gray-700 flex items-center gap-2">
                <Car className="h-4 w-4 text-gray-500" />
                Deals on Wheels:
              </span>
            </div>
            <div className="space-y-3">
              {!isEditing ? (
                travelDiary?.dealsOnWheels &&
                travelDiary.dealsOnWheels.length > 0 ? (
                  <div className="space-y-2">
                    {travelDiary.dealsOnWheels.map((deal, index) => (
                      <div
                        key={index}
                        className="text-gray-600 bg-gray-50 p-2 rounded text-sm"
                      >
                        {deal}
                      </div>
                    ))}
                  </div>
                ) : (
                  <span className="text-gray-600">No travel deals listed</span>
                )
              ) : (
                <div className="space-y-2">
                  {dealFields.map((field, index) => (
                    <div key={field.id} className="flex gap-2">
                      <textarea
                        {...register(`dealsOnWheels.${index}.value`)}
                        rows={2}
                        className="flex-1 border border-gray-300 rounded-md px-3 py-1 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
                        placeholder="Describe a travel deal or offer"
                      />
                      <button
                        type="button"
                        onClick={() => removeDeal(index)}
                        className="px-2 py-1 text-red-600 hover:text-red-800 self-start mt-1"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addDeal}
                    className="flex items-center gap-2 px-3 py-1 text-sm text-indigo-600 hover:text-indigo-800"
                  >
                    <Plus className="h-4 w-4" />
                    Add Travel Deal
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

// Hook to connect TravelDiary with Accordion edit functionality
export const useTravelDiaryWithAccordion = (
  travelDiary?: TravelDiaryProps["travelDiary"]
) => {
  const [isEditing, setIsEditing] = useState(false);
  const formRef = React.useRef<HTMLFormElement>(null);

  const [updateTravelDiary, { isLoading, error }] =
    useUpdateTravelDiaryMutation();

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
    // Props for TravelDiary component
    travelDiaryProps: {
      travelDiary,
      isEditing,
      onEditStateChange: handleEditStateChange,
      formRef,
    },
  };
};

export default TravelDiary;
