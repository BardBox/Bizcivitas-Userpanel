import React, { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { Target, Building2, User, Briefcase, Plus, Trash2 } from "lucide-react";
import { useUpdateMyBioMutation } from "../../../../../store/api/userApi";

interface BizNeedsProps {
  myAsk?: string[];
  isEditing?: boolean; // Controlled by parent (accordion)
  onEditStateChange?: (isEditing: boolean) => void;
  formRef?: React.RefObject<HTMLFormElement | null>;
}

const BizNeeds: React.FC<BizNeedsProps> = ({
  myAsk,
  isEditing = false,
  onEditStateChange,
  formRef,
}) => {
  const parseBizNeeds = (needsArray?: string[]) => {
    if (!needsArray || needsArray.length === 0)
      return { description: "", contacts: [] };

    const description = needsArray[0] || "";
    const contacts = needsArray.slice(1).map((item, index) => {
      const [company = "", role = "", name = ""] = item
        .split(",")
        .map((s) => s.trim());
      return { company, role, name };
    });

    return { description, contacts };
  };

  const bizNeeds = parseBizNeeds(myAsk);

  const defaultValues = {
    description: bizNeeds.description,
    contacts: bizNeeds.contacts.length > 0 ? bizNeeds.contacts : [],
  };

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm({ defaultValues });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "contacts",
  });

  const [updateMyBio, { isLoading, error }] = useUpdateMyBioMutation();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleSave = async (data: any) => {
    console.log("Attempting to save business needs:", data);
    try {
      // Transform data back to the myAsk format
      const myAskArray = [];

      // Add description as first item if it exists
      if (data.description && data.description.trim() !== "") {
        myAskArray.push(data.description.trim());
      }

      // Add contacts in "company,role,name" format
      if (data.contacts && data.contacts.length > 0) {
        const validContacts = data.contacts.filter(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (contact: any) =>
            contact.company?.trim() ||
            contact.role?.trim() ||
            contact.name?.trim()
        );

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        validContacts.forEach((contact: any) => {
          const contactString = [
            contact.company?.trim() || "",
            contact.role?.trim() || "",
            contact.name?.trim() || "",
          ].join(",");
          myAskArray.push(contactString);
        });
      }

      const cleanedData = {
        myBio: {
          myAsk: myAskArray.length > 0 ? myAskArray : [],
        },
      };

      console.log("Cleaned data to send:", cleanedData);

      const result = await updateMyBio(cleanedData).unwrap();
      console.log("Save successful:", result);
      onEditStateChange?.(false);
    } catch (err) {
      console.error("Failed to update business needs:", err);
      if (err && typeof err === "object") {
        console.error("Error details:", JSON.stringify(err, null, 2));
      }
    }
  };

  const handleCancel = () => {
    reset(defaultValues);
    onEditStateChange?.(false);
  };

  const addContact = () => {
    append({ company: "", role: "", name: "" });
  };

  return (
    <div className="bg-white rounded-lg p-2 mb-6">
      <form ref={formRef} onSubmit={handleSubmit(handleSave)}>
        <div className="space-y-3">
          {/* Description */}
          <div className="grid grid-cols-[35%_1fr] gap-4 py-2">
            <div>
              <span className="font-medium text-gray-700 flex items-center gap-2">
                <Target className="h-4 w-4 text-gray-500" />
                Business Need:
              </span>
            </div>
            <div>
              {!isEditing ? (
                bizNeeds.description ? (
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-blue-800 font-medium">
                      {bizNeeds.description}
                    </p>
                  </div>
                ) : (
                  <span className="text-gray-600">
                    No business need specified
                  </span>
                )
              ) : (
                <textarea
                  {...register("description")}
                  rows={3}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
                  placeholder="Describe your business need or what you're looking for"
                />
              )}
            </div>
          </div>

          {/* Contacts */}
          <div className="grid grid-cols-[35%_1fr] gap-4 py-2">
            <div>
              <span className="font-medium text-gray-700 flex items-center gap-2">
                <User className="h-4 w-4 text-gray-500" />
                Contacts Needed:
              </span>
            </div>
            <div className="space-y-3">
              {!isEditing ? (
                bizNeeds.contacts.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full border border-gray-200 rounded-lg">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                            Company
                          </th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                            Name
                          </th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                            Designation
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {bizNeeds.contacts.map((contact, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-3 py-2 text-sm text-gray-900">
                              {contact.company}
                            </td>
                            <td className="px-3 py-2 text-sm text-gray-600">
                              {contact.name}
                            </td>
                            <td className="px-3 py-2 text-sm text-gray-600">
                              {contact.role}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <span className="text-gray-600">
                    No specific contacts needed
                  </span>
                )
              ) : (
                <div className="space-y-3">
                  {fields.map((field, index) => (
                    <div
                      key={field.id}
                      className="border border-gray-200 rounded-lg p-3"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Company
                          </label>
                          <input
                            {...register(`contacts.${index}.company`)}
                            className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            placeholder="Company name"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Name
                          </label>
                          <input
                            {...register(`contacts.${index}.name`)}
                            className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            placeholder="Contact name"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Designation
                          </label>
                          <div className="flex gap-2">
                            <input
                              {...register(`contacts.${index}.role`)}
                              className="flex-1 border border-gray-300 rounded-md px-2 py-1 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                              placeholder="Job title/role"
                            />
                            <button
                              type="button"
                              onClick={() => remove(index)}
                              className="px-2 py-1 text-red-600 hover:text-red-800"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addContact}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-indigo-600 hover:text-indigo-800 border border-indigo-200 rounded-md hover:bg-indigo-50"
                  >
                    <Plus className="h-4 w-4" />
                    Add Contact Need
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

// Hook to connect BizNeeds with Accordion edit functionality
export const useBizNeedsWithAccordion = (myAsk?: BizNeedsProps["myAsk"]) => {
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
    // Props for BizNeeds component
    bizNeedsProps: {
      myAsk,
      isEditing,
      onEditStateChange: handleEditStateChange,
      formRef,
    },
  };
};

export default BizNeeds;
