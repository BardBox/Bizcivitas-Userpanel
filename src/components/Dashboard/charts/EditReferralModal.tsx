"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { useUpdateReferralSlipMutation } from "../../../../store/api/dashboardApi";

interface EditReferralModalProps {
  isOpen: boolean;
  onClose: () => void;
  referral: any;
  onSuccess: () => void;
}

// Contact Relation options
const contactRelationOptions = [
  "Friend",
  "Family",
  "Business Partner",
  "Client",
  "Colleague",
  "Acquaintance",
  "Other",
];

// Status options
const statusOptions = [
  "contacted",
  "not contacted yet",
  "no response",
  "got the business",
];

export default function EditReferralModal({
  isOpen,
  onClose,
  referral,
  onSuccess,
}: EditReferralModalProps) {
  const [updateReferralSlip, { isLoading }] = useUpdateReferralSlipMutation();

  const [formData, setFormData] = useState({
    referral: "",
    telephone: "",
    email: "",
    address: "",
    comments: "",
    contactRelation: "",
    status: "got the business", // Default status
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load referral data when modal opens
  useEffect(() => {
    if (isOpen && referral) {
      setFormData({
        referral: referral.referralName || referral.referral || "",
        telephone: referral.telephone || "",
        email: referral.email || "",
        address: referral.address || "",
        comments: referral.comments || "",
        contactRelation: referral.contactRelation || "",
        status: referral.status || "got the business",
      });
      setErrors({});
    }
  }, [isOpen, referral]);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.referral.trim()) {
      newErrors.referral = "Referral name is required";
    }

    if (!formData.telephone.trim()) {
      newErrors.telephone = "Telephone is required";
    } else if (!/^[+]?[0-9]{10,15}$/.test(formData.telephone.replace(/\s/g, ""))) {
      newErrors.telephone = "Please enter a valid phone number";
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    try {
      const updateData: any = {
        referral: formData.referral,
        telephone: formData.telephone,
        email: formData.email || undefined,
        address: formData.address || undefined,
        comments: formData.comments || undefined,
        contactRelation: formData.contactRelation || undefined,
        // Status field removed - backend validation issue
      };

      await updateReferralSlip({
        id: referral._id || referral.id,
        data: updateData,
      }).unwrap();

      alert("Referral updated successfully");
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error("Update error:", error);
      alert(error?.data?.message || "Failed to update referral");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-indigo-600">
          <h2 className="text-2xl font-bold text-white">Edit Referral</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-white" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[calc(90vh-140px)] p-6">
          <div className="space-y-4">
            {/* Referral Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Referral Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.referral}
                onChange={(e) => setFormData({ ...formData, referral: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter referral name"
              />
              {errors.referral && (
                <p className="text-red-500 text-sm mt-1">{errors.referral}</p>
              )}
            </div>

            {/* Telephone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Telephone <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                value={formData.telephone}
                onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter phone number"
              />
              {errors.telephone && (
                <p className="text-red-500 text-sm mt-1">{errors.telephone}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter email address"
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
              )}
            </div>

            {/* Contact Relation Dropdown */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contact Relation
              </label>
              <select
                value={formData.contactRelation}
                onChange={(e) => setFormData({ ...formData, contactRelation: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              >
                <option value="">Select relation...</option>
                {contactRelationOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address
              </label>
              <textarea
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="Enter address"
              />
            </div>

            {/* Comments */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Comments
              </label>
              <textarea
                value={formData.comments}
                onChange={(e) => setFormData({ ...formData, comments: e.target.value })}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="Enter comments"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-6 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              {isLoading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
