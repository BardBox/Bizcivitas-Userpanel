"use client";

import { useState } from "react";
import Modal from "../Modal";
import { Search, X } from "lucide-react";

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
  const [searchQuery, setSearchQuery] = useState("");

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
    <Modal isOpen={isOpen} onClose={onClose} title="Create BizConnect">
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* To User */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Thank You To <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowUserSearch(true)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-left flex items-center justify-between hover:border-blue-400 transition-colors"
            >
              <span className={formData.to ? "text-gray-900" : "text-gray-400"}>
                {formData.to || "Select user..."}
              </span>
              <Search className="w-5 h-5 text-gray-400" />
            </button>
          </div>
          {errors.to && <p className="mt-1 text-sm text-red-600">{errors.to}</p>}
        </div>

        {/* Referral Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Referral Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="referralName"
            value={formData.referralName}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter referral name"
          />
          {errors.referralName && (
            <p className="mt-1 text-sm text-red-600">{errors.referralName}</p>
          )}
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Phone Number <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            name="telephone"
            value={formData.telephone}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter 10-digit phone number"
            maxLength={10}
          />
          {errors.telephone && (
            <p className="mt-1 text-sm text-red-600">{errors.telephone}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter email (optional)"
          />
        </div>

        {/* Address */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Address
          </label>
          <textarea
            name="address"
            value={formData.address}
            onChange={handleChange}
            rows={3}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            placeholder="Enter address (optional)"
          />
        </div>

        {/* Comments */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Comments
          </label>
          <textarea
            name="comments"
            value={formData.comments}
            onChange={handleChange}
            rows={4}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            placeholder="Enter comments"
          />
        </div>

        {/* Submit Error */}
        {errors.submit && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{errors.submit}</p>
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Creating..." : "Create Referral"}
          </button>
        </div>
      </form>

      {/* User Search Modal would go here - simplified for now */}
    </Modal>
  );
}
