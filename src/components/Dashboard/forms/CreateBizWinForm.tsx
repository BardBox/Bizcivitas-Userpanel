"use client";

import { useState } from "react";
import Modal from "../Modal";
import UserSearchModal, { User } from "./UserSearchModal";
import { Search, User as UserIcon, IndianRupee, MessageSquare, AlertCircle } from "lucide-react";

interface CreateBizWinFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateBizWinForm({
  isOpen,
  onClose,
  onSuccess,
}: CreateBizWinFormProps) {
  const [formData, setFormData] = useState({
    to: "",
    toUserId: "",
    amount: "",
    comments: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);

  const handleUserSelect = (user: User) => {
    setFormData((prev) => ({
      ...prev,
      to: `${user.name}${user.companyName ? ` - ${user.companyName}` : ""}${user.city ? ` (${user.city})` : ""}`,
      toUserId: user.userId,
    }));
    setIsUserModalOpen(false);
    if (errors.to) {
      setErrors((prev) => ({ ...prev, to: "" }));
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    // For amount field, only allow numbers and decimal point
    if (name === "amount") {
      const filteredValue = value.replace(/[^0-9.]/g, "");
      // Only allow one decimal point
      if ((filteredValue.match(/\./g) || []).length <= 1) {
        setFormData((prev) => ({ ...prev, [name]: filteredValue }));
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.to) newErrors.to = "Please select a user";
    if (!formData.amount.trim()) {
      newErrors.amount = "Please enter an amount";
    } else if (isNaN(Number(formData.amount))) {
      newErrors.amount = "Please enter a valid number";
    } else if (Number(formData.amount) <= 0) {
      newErrors.amount = "Amount must be greater than 0";
    }
    if (!formData.comments.trim())
      newErrors.comments = "Please enter your comments";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setIsSubmitting(true);

    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";
      const response = await fetch(
        `${backendUrl}/record/create`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
          credentials: "include",
          body: JSON.stringify({
            to: formData.toUserId,
            amount: formData.amount,
            comments: formData.comments,
          }),
        }
      );

      const contentType = response.headers.get("content-type");
      if (contentType && contentType.indexOf("application/json") === -1) {
        const text = await response.text();
        console.error("Received non-JSON response:", text.substring(0, 200));
        throw new Error("Server returned non-JSON response");
      }

      const data = await response.json();

      if (response.ok && data.success) {
        // Reset form
        setFormData({
          to: "",
          toUserId: "",
          amount: "",
          comments: "",
        });
        onSuccess();
        onClose();
      } else {
        setErrors({ submit: data.message || "Failed to create BizWin record" });
      }
    } catch (error) {
      console.error("Error creating BizWin record:", error);
      setErrors({ submit: "Network error. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title="Create BizWin (TYFCB)">
        <form onSubmit={handleSubmit} className="p-4 space-y-4 bg-white">
          {/* To User */}
          <div>
            <label className="flex items-center gap-2 text-xs font-semibold text-blue-900 mb-1">
              <UserIcon className="w-5 h-5 text-blue-600" />
              Thank You To <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsUserModalOpen(true)}
                className="w-full px-3 py-2 bg-white/70 backdrop-blur-sm border-2 border-blue-200 rounded-xl text-left flex items-center justify-between hover:border-blue-400 hover:bg-white/90 transition-all shadow-sm"
              >
                <span className={formData.to ? "text-gray-900 font-medium" : "text-gray-400"}>
                  {formData.to || "Click to select user..."}
                </span>
                <Search className="w-5 h-5 text-blue-600" />
              </button>
            </div>
            {errors.to && (
              <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.to}
              </p>
            )}
          </div>

          {/* Amount */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-blue-900 mb-2">
              <IndianRupee className="w-5 h-5 text-blue-600" />
              Amount (₹) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-white/70 backdrop-blur-sm border-2 border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-400 transition-all shadow-sm text-sm"
              placeholder="Enter amount"
            />
            {errors.amount && (
              <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.amount}
              </p>
            )}
          </div>

          {/* Comments */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-blue-900 mb-2">
              <MessageSquare className="w-5 h-5 text-blue-600" />
              Comments <span className="text-red-500">*</span>
            </label>
            <textarea
              name="comments"
              value={formData.comments}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 bg-white/70 backdrop-blur-sm border-2 border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-400 transition-all resize-none shadow-sm text-sm"
              placeholder="Enter your comments"
            />
            {errors.comments && (
              <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.comments}
              </p>
            )}
          </div>

          {/* Submit Error */}
          {errors.submit && (
            <div className="p-4 bg-red-50 border-2 border-red-200 rounded-xl">
              <p className="text-sm text-red-600 flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                {errors.submit}
              </p>
            </div>
          )}

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:flex-1 px-4 py-2.5 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-semibold transition-all shadow-sm text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:flex-1 px-4 py-2.5 bg-blue-500 text-white rounded-xl hover:bg-blue-600 font-semibold transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              {isSubmitting ? "Creating..." : "Create BizWin"}
            </button>
          </div>
        </form>
      </Modal>

      {/* User Search Modal */}
      <UserSearchModal
        isOpen={isUserModalOpen}
        onClose={() => setIsUserModalOpen(false)}
        onSelectUser={handleUserSelect}
      />
    </>
  );
}
