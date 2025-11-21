"use client";

import { useState } from "react";
import Modal from "../Modal";
import { Calendar, Clock, Search, X } from "lucide-react";
import UserSearchModal, { User } from "./UserSearchModal";

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
    agenda: "",
    attendees: [] as string[],
    attendeeNames: [] as string[],
    date: "",
    time: "",
    meetingPlace: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);

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

  const handleUserSelect = (user: User) => {
    if (!formData.attendees.includes(user.userId)) {
      setFormData((prev) => ({
        ...prev,
        attendees: [...prev.attendees, user.userId],
        attendeeNames: [...prev.attendeeNames, user.name],
      }));
    }
    setIsUserModalOpen(false);
    if (errors.attendees) {
      setErrors((prev) => ({ ...prev, attendees: "" }));
    }
  };

  const handleRemoveAttendee = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      attendees: prev.attendees.filter((_, i) => i !== index),
      attendeeNames: prev.attendeeNames.filter((_, i) => i !== index),
    }));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (formData.attendees.length === 0)
      newErrors.attendees = "Please select at least one attendee";
    if (!formData.title.trim())
      newErrors.title = "Title is required";
    else if (formData.title.trim().length < 3)
      newErrors.title = "Title must be at least 3 characters long";

    if (!formData.agenda.trim())
      newErrors.agenda = "Agenda is required";
    else if (formData.agenda.trim().length < 3)
      newErrors.agenda = "Agenda must be at least 3 characters long";

    if (!formData.date) newErrors.date = "Date is required";
    if (!formData.time) newErrors.time = "Time is required";
    if (!formData.meetingPlace || formData.meetingPlace.trim().length < 3)
      newErrors.meetingPlace = "Meeting place is required and must be at least 3 characters long";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setIsSubmitting(true);

    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000/api/v1";
      // Ensure we don't double slash if the env var has a trailing slash
      const baseUrl = backendUrl.endsWith('/') ? backendUrl.slice(0, -1) : backendUrl;

      const response = await fetch(
        `${baseUrl}/meetup/add`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
          credentials: "include",
          body: JSON.stringify({
            title: formData.title.trim(),
            agenda: formData.agenda.trim(),
            attendees: formData.attendees,
            date: formData.date,
            time: formData.time,
            meetingPlace: formData.meetingPlace.trim(),
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
          title: "",
          agenda: "",
          attendees: [],
          attendeeNames: [],
          date: "",
          time: "",
          meetingPlace: "",
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
    <>
      <Modal isOpen={isOpen} onClose={onClose} title="Create Meet-up">
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Attendees */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Meet With <span className="text-red-500">*</span>
            </label>
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => setIsUserModalOpen(true)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-left flex items-center justify-between hover:border-blue-400 transition-colors text-sm"
              >
                <span className="text-gray-500">Select attendees...</span>
                <Search className="w-4 h-4 text-gray-400" />
              </button>

              {/* Selected Attendees List */}
              {formData.attendeeNames.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.attendeeNames.map((name, index) => (
                    <div
                      key={index}
                      className="bg-blue-50 text-blue-700 px-2 py-1 rounded-md text-xs flex items-center gap-1 border border-blue-100"
                    >
                      <span>{name}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveAttendee(index)}
                        className="hover:text-blue-900"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {errors.attendees && (
              <p className="mt-1 text-sm text-red-600">{errors.attendees}</p>
            )}
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Date <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  min={today}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>
              {errors.date && (
                <p className="mt-1 text-sm text-red-600">{errors.date}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Time <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="time"
                  name="time"
                  value={formData.time}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>
              {errors.time && (
                <p className="mt-1 text-sm text-red-600">{errors.time}</p>
              )}
            </div>
          </div>

          {/* Meeting Place */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Meeting Place <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="meetingPlace"
              value={formData.meetingPlace}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              placeholder="Enter meeting place"
            />
            {errors.meetingPlace && (
              <p className="mt-1 text-sm text-red-600">{errors.meetingPlace}</p>
            )}
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              placeholder="Enter meeting title"
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600">{errors.title}</p>
            )}
          </div>

          {/* Agenda */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Agenda <span className="text-red-500">*</span>
            </label>
            <textarea
              name="agenda"
              value={formData.agenda}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm"
              placeholder="Enter meeting agenda"
            />
            {errors.agenda && (
              <p className="mt-1 text-sm text-red-600">{errors.agenda}</p>
            )}
          </div>

          {/* Submit Error */}
          {errors.submit && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{errors.submit}</p>
            </div>
          )}

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:flex-1 px-4 py-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              {isSubmitting ? "Creating..." : "Create Meet-up"}
            </button>
          </div>
        </form>
      </Modal>

      <UserSearchModal
        isOpen={isUserModalOpen}
        onClose={() => setIsUserModalOpen(false)}
        onSelectUser={handleUserSelect}
      />
    </>
  );
}
