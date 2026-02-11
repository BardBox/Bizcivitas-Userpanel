import React, { useState, useEffect } from "react";
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
import { useUpdateMyBioMutation } from "@/store/api";

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

  const [description, setDescription] = useState(bizleads.description);
  const [contacts, setContacts] = useState(
    bizleads.contacts.length > 0 ? bizleads.contacts : []
  );

  const [updateMyBio, { isLoading, error }] = useUpdateMyBioMutation();

  // Reset local state when entering edit mode
  useEffect(() => {
    if (isEditing) {
      setDescription(bizleads.description);
      setContacts(bizleads.contacts.length > 0 ? bizleads.contacts : []);
    }
  }, [isEditing]);

  const handleSave = async () => {
    try {
      const myGivesArray = [];

      // Add description as first item if it exists
      if (description && description.trim() !== "") {
        myGivesArray.push(description.trim());
      }

      // Add contacts in "company,role,name" format
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
          myGivesArray.push(contactString);
        });
      }

      const cleanedData = {
        myBio: {
          myGives: myGivesArray.length > 0 ? myGivesArray : [],
        },
      };

      await updateMyBio(cleanedData).unwrap();
      onEditStateChange?.(false);
    } catch (err) {
      console.error("Failed to update business leads:", err);
    }
  };

  const handleCancel = () => {
    setDescription(bizleads.description);
    setContacts(bizleads.contacts.length > 0 ? bizleads.contacts : []);
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
          {/* Lead Category/Description */}

          <div>
            {!isEditing ? (
              description ? (
                <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-green-800 font-medium">
                    {description}
                  </p>
                </div>
              ) : (
                <span className="text-gray-600">
                  No lead category specified
                </span>
              )
            ) : (
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
                placeholder="Describe the type of business leads you can provide (e.g., Software Development, Marketing Services, Legal Consultation)"
              />
            )}
          </div>

          {/* Lead Contacts */}
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
                            Contact Name
                          </th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                            Role/Position
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
                                  placeholder="Job title/role"
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
                            Role/Position
                          </label>
                          {isEditing ? (
                            <input
                              type="text"
                              value={contact.role || ""}
                              onChange={(e) => updateContact(index, "role", e.target.value)}
                              className="w-full mt-1 border border-gray-300 rounded px-2 py-1.5 text-sm text-gray-900 bg-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                              placeholder="Job title/role"
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
            <div className="grid grid-cols-1 md:grid-cols-[35%_1fr] gap-1 md:gap-4 py-2">
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
            <div className="grid grid-cols-1 md:grid-cols-[35%_1fr] gap-1 md:gap-4 py-2">
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
