import React, { useState, useEffect } from "react";
import {
  Target,
  Building2,
  User,
  Briefcase,
  Plus,
  X,
} from "lucide-react";
import { useUpdateMyBioMutation } from "@/store/api";

interface BizNeedsProps {
  myAsk?: string[];
  isEditing?: boolean;
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
    const contacts = needsArray.slice(1).map((item) => {
      const [company = "", role = "", name = ""] = item
        .split(",")
        .map((s) => s.trim());
      return { company, role, name };
    });

    return { description, contacts };
  };

  const bizNeeds = parseBizNeeds(myAsk);

  const [description, setDescription] = useState(bizNeeds.description);
  const [contacts, setContacts] = useState(
    bizNeeds.contacts.length > 0 ? bizNeeds.contacts : []
  );

  const [updateMyBio, { isLoading, error }] = useUpdateMyBioMutation();

  // Reset local state when entering edit mode
  useEffect(() => {
    if (isEditing) {
      setDescription(bizNeeds.description);
      setContacts(bizNeeds.contacts.length > 0 ? bizNeeds.contacts : []);
    }
  }, [isEditing]);

  const handleSave = async () => {
    try {
      const myAskArray = [];

      if (description && description.trim() !== "") {
        myAskArray.push(description.trim());
      }

      if (contacts && contacts.length > 0) {
        const validContacts = contacts.filter(
          (contact: any) =>
            contact.company?.trim() ||
            contact.role?.trim() ||
            contact.name?.trim()
        );

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

      await updateMyBio(cleanedData).unwrap();
      onEditStateChange?.(false);
    } catch (err) {
      console.error("Failed to update business needs:", err);
    }
  };

  const handleCancel = () => {
    setDescription(bizNeeds.description);
    setContacts(bizNeeds.contacts.length > 0 ? bizNeeds.contacts : []);
    onEditStateChange?.(false);
  };

  const addContact = () => {
    setContacts([...contacts, { company: "", role: "", name: "" }]);
  };

  const removeContact = (index: number) => {
    setContacts(contacts.filter((_, i) => i !== index));
  };

  const updateContact = (index: number, field: string, value: string) => {
    const newContacts = [...contacts];
    newContacts[index] = { ...newContacts[index], [field]: value };
    setContacts(newContacts);
  };

  return (
    <div className="bg-white rounded-lg mb-6">
      <form ref={formRef} onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
        <div className="space-y-3">
          {/* Need Category/Description */}
          <div>
            {!isEditing ? (
              description ? (
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-blue-800 font-medium">
                    {description}
                  </p>
                </div>
              ) : (
                <span className="text-gray-600">
                  No business need specified
                </span>
              )
            ) : (
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
                placeholder="Describe what you're looking for (e.g., Web Developers, Marketing Partners, Legal Services)"
              />
            )}
          </div>

          {/* Need Contacts */}
          <div className="grid gap-4">
            <div className="space-y-3">
              {contacts.length > 0 ? (
                <>
                  {/* Desktop Table View */}
                  <div className="hidden md:block overflow-x-auto">
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
                        {contacts.map((contact, index) => (
                          <tr
                            key={index}
                            className="group hover:bg-gray-50 relative"
                          >
                            <td className="px-3 py-2 text-sm">
                              {isEditing ? (
                                <input
                                  type="text"
                                  value={contact.company || ""}
                                  onChange={(e) => updateContact(index, "company", e.target.value)}
                                  className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm text-gray-900 bg-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                  placeholder="Company name"
                                />
                              ) : (
                                <span className="text-gray-900 font-medium px-2">
                                  {contact.company || "-"}
                                </span>
                              )}
                            </td>
                            <td className="px-3 py-2 text-sm">
                              {isEditing ? (
                                <input
                                  type="text"
                                  value={contact.name || ""}
                                  onChange={(e) => updateContact(index, "name", e.target.value)}
                                  className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm text-gray-900 bg-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                  placeholder="Contact person"
                                />
                              ) : (
                                <span className="text-gray-600 px-2">
                                  {contact.name || "-"}
                                </span>
                              )}
                            </td>
                            <td className="px-3 py-2 text-sm relative">
                              {isEditing ? (
                                <input
                                  type="text"
                                  value={contact.role || ""}
                                  onChange={(e) => updateContact(index, "role", e.target.value)}
                                  className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm text-gray-900 bg-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                  placeholder="Job title/designation"
                                />
                              ) : (
                                <span className="text-gray-600 px-2">
                                  {contact.role || "-"}
                                </span>
                              )}
                              {isEditing && (
                                <button
                                  type="button"
                                  onClick={() => removeContact(index)}
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

                  {/* Mobile Card View */}
                  <div className="md:hidden space-y-3">
                    {contacts.map((contact, index) => (
                      <div
                        key={index}
                        className="border border-gray-200 rounded-lg p-3 space-y-2 relative bg-white"
                      >
                        {isEditing && (
                          <button
                            type="button"
                            onClick={() => removeContact(index)}
                            className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 shadow-md"
                            title="Remove contact"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        )}

                        <div>
                          <label className="text-xs font-medium text-gray-500 uppercase flex items-center gap-1.5">
                            <Building2 className="h-3 w-3" />
                            Company
                          </label>
                          {isEditing ? (
                            <input
                              type="text"
                              value={contact.company || ""}
                              onChange={(e) => updateContact(index, "company", e.target.value)}
                              className="w-full mt-1 border border-gray-300 rounded px-2 py-1.5 text-sm text-gray-900 bg-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                              placeholder="Company name"
                            />
                          ) : (
                            <p className="text-sm text-gray-900 font-medium mt-1">
                              {contact.company || "-"}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="text-xs font-medium text-gray-500 uppercase flex items-center gap-1.5">
                            <User className="h-3 w-3" />
                            Contact Name
                          </label>
                          {isEditing ? (
                            <input
                              type="text"
                              value={contact.name || ""}
                              onChange={(e) => updateContact(index, "name", e.target.value)}
                              className="w-full mt-1 border border-gray-300 rounded px-2 py-1.5 text-sm text-gray-900 bg-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                              placeholder="Contact person"
                            />
                          ) : (
                            <p className="text-sm text-gray-600 mt-1">
                              {contact.name || "-"}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="text-xs font-medium text-gray-500 uppercase flex items-center gap-1.5">
                            <Briefcase className="h-3 w-3" />
                            Designation
                          </label>
                          {isEditing ? (
                            <input
                              type="text"
                              value={contact.role || ""}
                              onChange={(e) => updateContact(index, "role", e.target.value)}
                              className="w-full mt-1 border border-gray-300 rounded px-2 py-1.5 text-sm text-gray-900 bg-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                              placeholder="Job title/designation"
                            />
                          ) : (
                            <p className="text-sm text-gray-600 mt-1">
                              {contact.role || "-"}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <span className="text-gray-600">
                  No need contacts specified
                </span>
              )}

              {isEditing && (
                <button
                  type="button"
                  onClick={addContact}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-indigo-600 hover:text-indigo-800 border border-indigo-200 rounded-md hover:bg-indigo-50"
                >
                  <Plus className="h-4 w-4" />
                  Add Contact Need
                </button>
              )}
            </div>
          </div>

          {error && isEditing && (
            <div className="text-red-500 text-sm">{String(error)}</div>
          )}
        </div>
      </form>
    </div>
  );
};

// Hook to connect BizNeeds with Accordion edit functionality
export const useBizNeedsWithAccordion = (myAsk?: string[]) => {
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
    bizNeedsProps: {
      myAsk,
      isEditing,
      onEditStateChange: handleEditStateChange,
      formRef,
    },
  };
};

export default BizNeeds;
