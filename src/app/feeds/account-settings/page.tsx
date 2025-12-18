"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, Lock, Eye, MapPin, Mail } from "lucide-react";
import { useGetFullProfileQuery, useToggleProfessionalVisibilityMutation } from "@/store/api/profileApi";
import { toast } from "react-hot-toast";

export default function AccountSettingsPage() {
  const router = useRouter();
  const { data: profile, isLoading } = useGetFullProfileQuery();
  const [toggleVisibility, { isLoading: isUpdatingVisibility }] = useToggleProfessionalVisibilityMutation();
  const [isPublic, setIsPublic] = useState(false);

 
  useEffect(() => {
    if (profile?.visibility?.professionalDetails !== undefined) {
      setIsPublic(profile.visibility.professionalDetails);
    }
  }, [profile]);

  const handleToggleVisibility = async () => {
    const newValue = !isPublic;
    
    // Optimistically update UI
    setIsPublic(newValue);

    try {
      await toggleVisibility({ isPublic: newValue }).unwrap();
      
      toast.success(
        newValue
          ? "Contact info restricted to connections only"
          : "Contact info is now public"
      );
    } catch (error: any) {
      // Revert on error
      setIsPublic(!newValue);
      toast.error(error?.data?.message || "Failed to update privacy settings");
      console.error("Error updating visibility:", error);
    }
  };

  const settingsOptions = [
    {
      id: "email-management",
      label: "Email Management",
      icon: Mail,
      description: "Manage primary and secondary emails",
      onClick: () => router.push("/feeds/account-settings/email-management"),
    },
    {
      id: "password",
      label: "Update Password",
      icon: Lock,
      onClick: () => router.push("/feeds/account-settings/update-password"),
    },
    {
      id: "billing-address",
      label: "Billing Address",
      icon: MapPin,
      onClick: () => router.push("/feeds/account-settings/billing-address"),
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen overflow-y-auto bg-gray-50 md:rounded-3xl md:mt-12">
      <div className="max-w-4xl mx-auto p-4 sm:p-6 ">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Account Settings
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Manage your account preferences and privacy
          </p>
        </div>

        {/* Settings List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {settingsOptions.map((option, index) => {
            const Icon = option.icon;
            return (
              <button
                key={option.id}
                onClick={option.onClick}
                className={`w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors ${
                  index !== settingsOptions.length - 1
                    ? "border-b border-gray-100"
                    : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                    <Icon size={20} className="text-blue-600" />
                  </div>
                  <span className="text-sm sm:text-base font-medium text-gray-900">
                    {option.label}
                  </span>
                </div>
                <ChevronRight size={20} className="text-gray-400" />
              </button>
            );
          })}

          {/* Privacy Toggle Setting */}
          <div className="p-4 border-t border-gray-100">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 flex-1">
                <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center flex-shrink-0">
                  <Eye size={20} className="text-purple-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm sm:text-base font-medium text-gray-900">
                    Contact Information Privacy
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {isPublic
                      ? "Contact info restricted to connections only"
                      : "Contact info visible to everyone"}
                  </p>
                </div>
              </div>
              
              {/* Toggle Switch */}
              <button
                onClick={handleToggleVisibility}
                disabled={isUpdatingVisibility}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  isPublic ? "bg-green-500" : "bg-gray-300"
                } ${isUpdatingVisibility ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    isPublic ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex gap-3">
            <div className="flex-shrink-0">
              <svg
                className="w-5 h-5 text-blue-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-medium text-blue-900">
                Privacy Settings
              </h3>
              <p className="text-sm text-blue-700 mt-1">
                When enabled (toggle ON), only your connections can view your email and phone number. 
                Non-connections will see masked contact information and cannot call or email you directly.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
