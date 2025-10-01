import React, { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import {
  Target,
  TrendingUp,
  Plus,
  Trash2,
  Building2,
  User,
  Briefcase,
  X,
} from "lucide-react";
import { useUpdateMyBioMutation } from "../../../../../store/api/userApi";

interface BizleadsProps {
  leads?: {
    given?: string[]; // myGives from API
    received?: string[]; // Could be used for future received leads
  };
  isEditing?: boolean; // Controlled by parent (accordion)
  onEditStateChange?: (isEditing: boolean) => void;
  formRef?: React.RefObject<HTMLFormElement | null>;
}

const Bizleads: React.FC<BizleadsProps> = ({
  leads,
  isEditing = false,
  onEditStateChange,
  formRef,
}) => {
  const parseBizleads = (leadsArray?: string[]) => {
    if (!leadsArray || leadsArray.length === 0)
      return { description: "", contacts: [] };

    const description = leadsArray[0] || "";
    const contacts = leadsArray.slice(1).map((item, index) => {
      const [company = "", role = "", name = ""] = item
        .split(",")
        .map((s) => s.trim());
      return { company, role, name };
    });

    return { description, contacts };
  };

  const bizleads = parseBizleads(leads?.given);

  const defaultValues = {
    description: bizleads.description,
    contacts: bizleads.contacts.length > 0 ? bizleads.contacts : [],
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
    console.log("Attempting to save business leads:", data);
    try {
      // Transform data back to the myGives format (similar to myAsk)
      const myGivesArray = [];

      // Add description as first item if it exists
      if (data.description && data.description.trim() !== "") {
        myGivesArray.push(data.description.trim());
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
          myGivesArray.push(contactString);
        });
      }

      const cleanedData = {
        myBio: {
          myGives: myGivesArray.length > 0 ? myGivesArray : [],
        },
      };

      const result = await updateMyBio(cleanedData).unwrap();
      console.log("Save successful:", result);
      onEditStateChange?.(false);
    } catch (err) {
      console.error("Failed to update business leads:", err);
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
    <div className="bg-white rounded-lg mb-6">
      <form ref={formRef} onSubmit={handleSubmit(handleSave)}>
        <div className="space-y-3">
          {/* Lead Category/Description */}

          <div>
            {!isEditing ? (
              bizleads.description ? (
                <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-green-800 font-medium">
                    {bizleads.description}
                  </p>
                </div>
              ) : (
                <span className="text-gray-600">
                  No lead category specified
                </span>
              )
            ) : (
              <textarea
                {...register("description")}
                rows={3}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
                placeholder="Describe the type of business leads you can provide (e.g., Software Development, Marketing Services, Legal Consultation)"
              />
            )}
          </div>

          {/* Lead Contacts */}
          <div className="grid gap-4">
            <div className="space-y-3">
              {fields.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full border border-gray-200 rounded-lg">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                          Company
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                          Contact Name
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                          Role/Position
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {fields.map((field, index) => (
                        <tr key={field.id} className="group hover:bg-gray-50 relative">
                          <td className="px-3 py-2 text-sm">
                            {isEditing ? (
                              <input
                                {...register(`contacts.${index}.company`)}
                                className="w-full border-0 border-b border-transparent hover:border-gray-300 focus:border-indigo-500 bg-transparent px-2 py-1 text-sm focus:outline-none transition-colors"
                                placeholder="Company name"
                              />
                            ) : (
                              <span className="text-gray-900 font-medium px-2">
                                {control._formValues.contacts[index]?.company || "-"}
                              </span>
                            )}
                          </td>
                          <td className="px-3 py-2 text-sm">
                            {isEditing ? (
                              <input
                                {...register(`contacts.${index}.name`)}
                                className="w-full border-0 border-b border-transparent hover:border-gray-300 focus:border-indigo-500 bg-transparent px-2 py-1 text-sm focus:outline-none transition-colors"
                                placeholder="Contact person"
                              />
                            ) : (
                              <span className="text-gray-600 px-2">
                                {control._formValues.contacts[index]?.name || "-"}
                              </span>
                            )}
                          </td>
                          <td className="px-3 py-2 text-sm relative">
                            {isEditing ? (
                              <input
                                {...register(`contacts.${index}.role`)}
                                className="w-full border-0 border-b border-transparent hover:border-gray-300 focus:border-indigo-500 bg-transparent px-2 py-1 text-sm focus:outline-none transition-colors"
                                placeholder="Job title/role"
                              />
                            ) : (
                              <span className="text-gray-600 px-2">
                                {control._formValues.contacts[index]?.role || "-"}
                              </span>
                            )}
                            {isEditing && (
                              <button
                                type="button"
                                onClick={() => remove(index)}
                                className="absolute right-1 top-1/2 -translate-y-1/2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                                title="Remove contact"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <span className="text-gray-600">
                  No lead contacts specified
                </span>
              )}

              {isEditing && (
                <button
                  type="button"
                  onClick={addContact}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-indigo-600 hover:text-indigo-800 border border-indigo-200 rounded-md hover:bg-indigo-50"
                >
                  <Plus className="h-4 w-4" />
                  Add Lead Contact
                </button>
              )}
            </div>
          </div>

          {/* Received Leads - Display only for now */}
          {!isEditing && leads?.received && leads.received.length > 0 && (
            <div className="grid grid-cols-[35%_1fr] gap-4 py-2">
              <div>
                <span className="font-medium text-gray-700 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-gray-500" />
                  Leads Received:
                </span>
              </div>
              <div className="space-y-2">
                {leads.received
                  .filter((lead) => lead.trim() !== "")
                  .map((lead, index) => (
                    <div
                      key={index}
                      className="bg-gray-50 p-3 rounded-lg border border-gray-200 text-sm"
                    >
                      <p className="text-gray-700">{lead}</p>
                    </div>
                  ))}
              </div>
            </div>
          )}

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

// Hook to connect Bizleads with Accordion edit functionality
export const useBizleadsWithAccordion = (leads?: BizleadsProps["leads"]) => {
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
    // Props for Bizleads component
    bizleadsProps: {
      leads,
      isEditing,
      onEditStateChange: handleEditStateChange,
      formRef,
    },
  };
};

export default Bizleads;
