"use client";

import { useState } from "react";
import Modal from "../Modal";
import UserSearchModal, { User } from "./UserSearchModal";
import { Search, User as UserIcon, FileText, Phone, Mail, MapPinned, MessageSquare, AlertCircle } from "lucide-react";

interface CreateBizConnectFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateBizConnectForm({
  isOpen,
  onClose,
  onSuccess,
}: CreateBizConnectFormProps) {
  const [formData, setFormData] = useState({
    to: "",
    toUserId: "",
    referralName: "",
    telephone: "",
    email: "",
    address: "",
    comments: "",
    contactRelation: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showUserSearch, setShowUserSearch] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSelectUser = (user: User) => {
    setFormData((prev) => ({
      ...prev,
      to: user.name,
      toUserId: user.userId,
    }));
    setShowUserSearch(false);
    // Clear error when user selects
    if (errors.to) {
      setErrors((prev) => ({ ...prev, to: "" }));
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.to) newErrors.to = "Please select a user";
    if (!formData.referralName.trim())
      newErrors.referralName = "Referral name is required";
    if (!formData.telephone.trim())
      newErrors.telephone = "Phone number is required";
    else if (!/^\d{10}$/.test(formData.telephone))
      newErrors.telephone = "Phone number must be 10 digits";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setIsSubmitting(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/referrals/create`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
          credentials: "include",
          body: JSON.stringify({
            to: formData.toUserId,
            referral: formData.referralName,
            telephone: formData.telephone,
            email: formData.email || null,
            address: formData.address || null,
            comments: formData.comments || "",
            contactRelation: formData.contactRelation || "",
          }),
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        // Reset form
        setFormData({
          to: "",
          toUserId: "",
          referralName: "",
          telephone: "",
          email: "",
          address: "",
          comments: "",
          contactRelation: "",
        });
        onSuccess();
        onClose();
      } else {
        setErrors({ submit: data.message || "Failed to create referral slip" });
      }
    } catch (error) {
      console.error("Error creating referral slip:", error);
      setErrors({ submit: "Network error. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create BizConnect"
    >
      <form onSubmit={handleSubmit} className="p-8 space-y-6 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        {/* Two Column Layout for Large Screens */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            {/* To User */}
            <div className="group">
              <label className="block text-sm font-semibold text-blue-900 mb-2 flex items-center gap-2">
                <UserIcon className="w-4 h-4 text-blue-600" />
                Thank You To <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowUserSearch(true)}
                  className="w-full px-4 py-3.5 border-2 border-blue-200 rounded-xl text-left flex items-center justify-between hover:border-blue-400 hover:bg-white transition-all shadow-sm bg-white/80 backdrop-blur-sm"
                >
                  <span className={formData.to ? "text-gray-900 font-medium" : "text-gray-500"}>
                    {formData.to || "Select user..."}
                  </span>
                  <Search className="w-5 h-5 text-blue-500" />
                </button>
              </div>
              {errors.to && (
                <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" /> {errors.to}
                </p>
              )}
            </div>

            {/* Referral Name */}
            <div className="group">
              <label className="block text-sm font-semibold text-blue-900 mb-2 flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600" />
                Referral Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="referralName"
                value={formData.referralName}
                onChange={handleChange}
                className="w-full px-4 py-3.5 border-2 border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm bg-white/80 backdrop-blur-sm hover:bg-white text-gray-900 placeholder-gray-500"
                placeholder="Enter referral name"
              />
              {errors.referralName && (
                <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" /> {errors.referralName}
                </p>
              )}
            </div>

            {/* Phone */}
            <div className="group">
              <label className="block text-sm font-semibold text-blue-900 mb-2 flex items-center gap-2">
                <Phone className="w-4 h-4 text-blue-600" />
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                name="telephone"
                value={formData.telephone}
                onChange={handleChange}
                className="w-full px-4 py-3.5 border-2 border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm bg-white/80 backdrop-blur-sm hover:bg-white text-gray-900 placeholder-gray-500"
                placeholder="Enter 10-digit phone number"
                maxLength={10}
              />
              {errors.telephone && (
                <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" /> {errors.telephone}
                </p>
              )}
            </div>

            {/* Email */}
            <div className="group">
              <label className="block text-sm font-semibold text-blue-900 mb-2 flex items-center gap-2">
                <Mail className="w-4 h-4 text-blue-600" />
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3.5 border-2 border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm bg-white/80 backdrop-blur-sm hover:bg-white text-gray-900 placeholder-gray-500"
                placeholder="Enter email (optional)"
              />
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Address */}
            <div className="group">
              <label className="block text-sm font-semibold text-blue-900 mb-2 flex items-center gap-2">
                <MapPinned className="w-4 h-4 text-blue-600" />
                Address
              </label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                rows={5}
                className="w-full px-4 py-3.5 border-2 border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm bg-white/80 backdrop-blur-sm hover:bg-white resize-none text-gray-900 placeholder-gray-500"
                placeholder="Enter address (optional)"
              />
            </div>

            {/* Comments */}
            <div className="group">
              <label className="block text-sm font-semibold text-blue-900 mb-2 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-blue-600" />
                Comments
              </label>
              <textarea
                name="comments"
                value={formData.comments}
                onChange={handleChange}
                rows={7}
                className="w-full px-4 py-3.5 border-2 border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm bg-white/80 backdrop-blur-sm hover:bg-white resize-none text-gray-900 placeholder-gray-500"
                placeholder="Enter comments"
              />
            </div>
          </div>
        </div>

        {/* Submit Error */}
        {errors.submit && (
          <div className="p-4 bg-red-50 border-2 border-red-200 rounded-xl">
            <p className="text-sm text-red-700 font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4" /> {errors.submit}
            </p>
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-4 pt-6">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-6 py-3.5 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-100 font-semibold transition-all shadow-sm hover:shadow-md"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 px-6 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 font-semibold transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5 active:translate-y-0"
          >
            {isSubmitting ? "Creating..." : "Create Referral"}
          </button>
        </div>
      </form>

      {/* User Search Modal */}
      <UserSearchModal
        isOpen={showUserSearch}
        onClose={() => setShowUserSearch(false)}
        onSelectUser={handleSelectUser}
      />
    </Modal>
  );
}
