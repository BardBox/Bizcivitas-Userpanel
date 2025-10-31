"use client";

import { useState } from "react";
import Modal from "../Modal";
import { Calendar, Clock, Search } from "lucide-react";

interface CreateMeetupFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateMeetupForm({
  isOpen,
  onClose,
  onSuccess,
}: CreateMeetupFormProps) {
  const [formData, setFormData] = useState({
    title: "",
    attendees: [] as string[],
    attendeeNames: [] as string[],
    date: "",
    time: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

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

    if (formData.attendees.length === 0)
      newErrors.attendees = "Please select at least one attendee";
    if (!formData.title.trim())
      newErrors.title = "Agenda is required";
    else if (formData.title.trim().length < 3)
      newErrors.title = "Agenda must be at least 3 characters long";
    if (!formData.date) newErrors.date = "Date is required";
    if (!formData.time) newErrors.time = "Time is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setIsSubmitting(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/meetup/add`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
          credentials: "include",
          body: JSON.stringify({
            title: formData.title.trim(),
            attendees: formData.attendees,
            date: formData.date,
            time: formData.time,
          }),
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        // Reset form
        setFormData({
          title: "",
          attendees: [],
          attendeeNames: [],
          date: "",
          time: "",
        });
        onSuccess();
        onClose();
      } else {
        setErrors({ submit: data.message || "Failed to create meetup" });
      }
    } catch (error) {
      console.error("Error creating meetup:", error);
      setErrors({ submit: "Network error. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get today's date in YYYY-MM-DD format for min attribute
  const today = new Date().toISOString().split("T")[0];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Meet-up">
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Attendees */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Meet With <span className="text-red-500">*</span>
          </label>
          <button
            type="button"
            onClick={() => {
              /* TODO: Open user search modal for multiple selection */
            }}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-left flex items-center justify-between hover:border-blue-400 transition-colors"
          >
            <span
              className={
                formData.attendeeNames.length > 0
                  ? "text-gray-900"
                  : "text-gray-400"
              }
            >
              {formData.attendeeNames.length > 0
                ? `${formData.attendeeNames.length} attendee(s) selected`
                : "Select attendees..."}
            </span>
            <Search className="w-5 h-5 text-gray-400" />
          </button>
          {errors.attendees && (
            <p className="mt-1 text-sm text-red-600">{errors.attendees}</p>
          )}
        </div>

        {/* Date and Time */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                min={today}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            </div>
            {errors.date && (
              <p className="mt-1 text-sm text-red-600">{errors.date}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Time <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="time"
                name="time"
                value={formData.time}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <Clock className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            </div>
            {errors.time && (
              <p className="mt-1 text-sm text-red-600">{errors.time}</p>
            )}
          </div>
        </div>

        {/* Agenda */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Agenda <span className="text-red-500">*</span>
          </label>
          <textarea
            name="title"
            value={formData.title}
            onChange={handleChange}
            rows={5}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            placeholder="Enter meeting agenda"
          />
          {errors.title && (
            <p className="mt-1 text-sm text-red-600">{errors.title}</p>
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
            className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Creating..." : "Create Meet-up"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
