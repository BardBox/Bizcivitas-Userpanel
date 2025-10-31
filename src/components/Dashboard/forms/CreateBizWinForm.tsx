"use client";

import { useState } from "react";
import Modal from "../Modal";
import { Search } from "lucide-react";

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
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/record/create`,
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
    <Modal isOpen={isOpen} onClose={onClose} title="Create BizWin (TYFCB)">
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* To User */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Thank You To <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                /* TODO: Open user search modal */
              }}
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

        {/* Amount */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Amount (₹) <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter amount"
          />
          {errors.amount && (
            <p className="mt-1 text-sm text-red-600">{errors.amount}</p>
          )}
        </div>

        {/* Comments */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Comments <span className="text-red-500">*</span>
          </label>
          <textarea
            name="comments"
            value={formData.comments}
            onChange={handleChange}
            rows={5}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            placeholder="Enter your comments"
          />
          {errors.comments && (
            <p className="mt-1 text-sm text-red-600">{errors.comments}</p>
          )}
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
            className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Creating..." : "Create BizWin"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
