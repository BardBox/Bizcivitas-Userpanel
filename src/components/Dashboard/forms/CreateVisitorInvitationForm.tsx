"use client";

import { useState, useEffect } from "react";
import Modal from "../Modal";
import { X, ChevronDown, Check, AlertCircle } from "lucide-react";
import { businessCategories } from "../data/businessCategories";

interface Meeting {
    _id: string;
    title: string;
    date: string;
    time?: string;
}

interface CreateVisitorInvitationFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}


export default function CreateVisitorInvitationForm({
    isOpen,
    onClose,
    onSuccess,
}: CreateVisitorInvitationFormProps) {
    const [formData, setFormData] = useState({
        meetingId: "",
        name: "",
        mobile: "",
        email: "",
        category: "",
        subcategory: "",
    });

    const [meetings, setMeetings] = useState<Meeting[]>([]);
    const [loadingMeetings, setLoadingMeetings] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Dropdown states
    const [showMeetingDropdown, setShowMeetingDropdown] = useState(false);
    const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
    const [showSubcategoryDropdown, setShowSubcategoryDropdown] = useState(false);

    // Fetch upcoming meetings when modal opens
    useEffect(() => {
        if (isOpen) {
            fetchMeetings();
        }
    }, [isOpen]);

    const fetchMeetings = async () => {
        setLoadingMeetings(true);
        try {
            const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";
            const response = await fetch(
                `${backendUrl}/meetings`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
                    },
                }
            );

            if (!response.ok) {
                throw new Error("Failed to fetch meetings");
            }

            const data = await response.json();

            if (data.success && Array.isArray(data.data)) {
                // Filter for upcoming meetings
                const today = new Date();
                today.setHours(0, 0, 0, 0);

                const upcomingMeetings = data.data.filter((meeting: Meeting) => {
                    const meetingDate = new Date(meeting.date);
                    return meetingDate >= today;
                });

                setMeetings(upcomingMeetings);
            } else {
                setMeetings([]);
            }
        } catch (error) {
            console.error("Error fetching meetings:", error);
            setMeetings([]);
        } finally {
            setLoadingMeetings(false);
        }
    };

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: "" }));
        }
    };

    const handleSelectMeeting = (meetingId: string) => {
        setFormData((prev) => ({ ...prev, meetingId }));
        setShowMeetingDropdown(false);
        if (errors.meetingId) {
            setErrors((prev) => ({ ...prev, meetingId: "" }));
        }
    };

    const handleSelectCategory = (category: string) => {
        setFormData((prev) => ({ ...prev, category, subcategory: "" })); // Reset subcategory when category changes
        setShowCategoryDropdown(false);
        if (errors.category) {
            setErrors((prev) => ({ ...prev, category: "" }));
        }
    };

    const handleSelectSubcategory = (subcategory: string) => {
        setFormData((prev) => ({ ...prev, subcategory }));
        setShowSubcategoryDropdown(false);
        if (errors.subcategory) {
            setErrors((prev) => ({ ...prev, subcategory: "" }));
        }
    };

    const validate = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.meetingId) newErrors.meetingId = "Please select a meeting";
        if (!formData.name.trim()) newErrors.name = "Name is required";
        if (!formData.mobile.trim()) {
            newErrors.mobile = "Mobile number is required";
        } else if (!/^\d{10}$/.test(formData.mobile.replace(/\D/g, ''))) {
            newErrors.mobile = "Invalid mobile number";
        }
        if (!formData.email.trim()) {
            newErrors.email = "Email is required";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = "Invalid email address";
        }
        if (!formData.category) newErrors.category = "Please select a category";
        if (!formData.subcategory) newErrors.subcategory = "Please select a subcategory";

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
                `${backendUrl}/meetings/invite`, // Corrected endpoint
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
                    },
                    body: JSON.stringify({
                        meetingId: formData.meetingId,
                        visitorName: formData.name, // Backend expects visitorName
                        mobile: formData.mobile,
                        email: formData.email,
                        businessCategory: formData.category, // Backend expects businessCategory
                        businessSubcategory: formData.subcategory, // Backend expects businessSubcategory
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
                setFormData({
                    meetingId: "",
                    name: "",
                    mobile: "",
                    email: "",
                    category: "",
                    subcategory: "",
                });
                onSuccess();
                onClose();
                alert("Invitation sent successfully!");
            } else {
                setErrors({ submit: data.message || "Failed to send invitation" });
            }
        } catch (error) {
            console.error("Error sending invitation:", error);
            setErrors({ submit: "Network error. Please try again." });
        } finally {
            setIsSubmitting(false);
        }
    };

    const selectedMeeting = meetings.find(m => m._id === formData.meetingId);
    const currentSubcategories = businessCategories.find(c => c.category === formData.category)?.subcategories || [];

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Invite Visitor to Upcoming Meeting"
            maxWidth="max-w-3xl"
            overflowVisible={true}
        >
            <form onSubmit={handleSubmit} className="p-4 space-y-3 bg-white">
                <div className="text-center mb-2">
                    <p className="text-xs text-indigo-600 font-medium italic">
                        ✨ "Expand your circle, expand your business opportunities."
                    </p>
                </div>

                {/* Meeting Selection - Full Width */}
                <div className="group relative">
                    <label className="block text-xs font-bold text-blue-600 mb-1">
                        Select Meeting <span className="text-red-500">*</span>
                    </label>
                    <button
                        type="button"
                        onClick={() => setShowMeetingDropdown(!showMeetingDropdown)}
                        className={`w-full px-3 py-2 text-sm border rounded-lg text-left flex items-center justify-between transition-all shadow-sm hover:bg-gray-50 ${errors.meetingId ? "border-red-300 bg-red-50" : "border-gray-300"
                            }`}
                    >
                        <span className={selectedMeeting ? "text-gray-900 font-medium" : "text-gray-500"}>
                            {selectedMeeting
                                ? `${selectedMeeting.title} - ${new Date(selectedMeeting.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}`
                                : "Select Meeting"}
                        </span>
                        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showMeetingDropdown ? 'rotate-180' : ''}`} />
                    </button>

                    {showMeetingDropdown && (
                        <div className="absolute z-30 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-60 overflow-y-auto custom-scrollbar">
                            {loadingMeetings ? (
                                <div className="p-3 text-center text-gray-500 text-xs">Loading meetings...</div>
                            ) : meetings.length === 0 ? (
                                <div className="p-3 text-center text-gray-500 text-xs">No upcoming meetings found</div>
                            ) : (
                                meetings.map((meeting) => (
                                    <button
                                        key={meeting._id}
                                        type="button"
                                        onClick={() => handleSelectMeeting(meeting._id)}
                                        className="w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center justify-between group border-b border-gray-50 last:border-0"
                                    >
                                        <div>
                                            <div className="font-medium text-gray-900 text-sm">{meeting.title}</div>
                                            <div className="text-xs text-gray-500">
                                                {new Date(meeting.date).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                                                {meeting.time && ` • ${meeting.time}`}
                                            </div>
                                        </div>
                                        {formData.meetingId === meeting._id && (
                                            <Check className="w-4 h-4 text-[#4A62AD]" />
                                        )}
                                    </button>
                                ))
                            )}
                        </div>
                    )}
                    {errors.meetingId && <p className="mt-1 text-xs text-red-500">{errors.meetingId}</p>}
                </div>

                {/* Two Column Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">

                    {/* Left Column: Personal Details */}
                    <div className="space-y-3">
                        {/* Name */}
                        <div>
                            <label className="block text-xs font-bold text-blue-600 mb-1">
                                Visitor Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm text-gray-900 placeholder-gray-400 ${errors.name ? "border-red-300 bg-red-50" : "border-gray-300"
                                    }`}
                                placeholder="Enter name"
                            />
                            {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
                        </div>

                        {/* Mobile Number */}
                        <div>
                            <label className="block text-xs font-bold text-blue-600 mb-1">
                                Mobile Number <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="tel"
                                name="mobile"
                                value={formData.mobile}
                                onChange={handleChange}
                                className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm text-gray-900 placeholder-gray-400 ${errors.mobile ? "border-red-300 bg-red-50" : "border-gray-300"
                                    }`}
                                placeholder="Enter mobile number"
                                maxLength={10}
                            />
                            {errors.mobile && <p className="mt-1 text-xs text-red-500">{errors.mobile}</p>}
                        </div>

                        {/* Email Address */}
                        <div>
                            <label className="block text-xs font-bold text-blue-600 mb-1">
                                Email Address <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm text-gray-900 placeholder-gray-400 ${errors.email ? "border-red-300 bg-red-50" : "border-gray-300"
                                    }`}
                                placeholder="Enter email address"
                            />
                            {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
                        </div>
                    </div>

                    {/* Right Column: Business Details */}
                    <div className="space-y-3">
                        {/* Category Selection */}
                        <div className="group relative">
                            <label className="block text-xs font-bold text-blue-600 mb-1">
                                Business Category <span className="text-red-500">*</span>
                            </label>
                            <button
                                type="button"
                                onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                                className={`w-full px-3 py-2 text-sm border rounded-lg text-left flex items-center justify-between transition-all shadow-sm hover:bg-gray-50 ${errors.category ? "border-red-300 bg-red-50" : "border-gray-300"
                                    }`}
                            >
                                <span className={formData.category ? "text-gray-900 font-medium" : "text-gray-500"}>
                                    {formData.category || "Select Category"}
                                </span>
                                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showCategoryDropdown ? 'rotate-180' : ''}`} />
                            </button>

                            {showCategoryDropdown && (
                                <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-60 overflow-y-auto custom-scrollbar">
                                    {businessCategories.map((cat, index) => (
                                        <button
                                            key={index}
                                            type="button"
                                            onClick={() => handleSelectCategory(cat.category)}
                                            className="w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center justify-between group border-b border-gray-50 last:border-0"
                                        >
                                            <span className="text-gray-700 font-medium text-sm">{cat.category}</span>
                                            {formData.category === cat.category && (
                                                <Check className="w-4 h-4 text-[#4A62AD]" />
                                            )}
                                        </button>
                                    ))}
                                </div>
                            )}
                            {errors.category && <p className="mt-1 text-xs text-red-500">{errors.category}</p>}
                        </div>

                        {/* Subcategory Selection */}
                        <div className="group relative">
                            <label className="block text-xs font-bold text-blue-600 mb-1">
                                Business Subcategory <span className="text-red-500">*</span>
                            </label>
                            <button
                                type="button"
                                onClick={() => setShowSubcategoryDropdown(!showSubcategoryDropdown)}
                                disabled={!formData.category}
                                className={`w-full px-3 py-2 text-sm border rounded-lg text-left flex items-center justify-between transition-all shadow-sm hover:bg-gray-50 ${!formData.category
                                    ? "bg-gray-100 border-gray-200 cursor-not-allowed"
                                    : errors.subcategory
                                        ? "border-red-300 bg-red-50"
                                        : "border-gray-300"
                                    }`}
                            >
                                <span className={formData.subcategory ? "text-gray-900 font-medium" : "text-gray-500"}>
                                    {formData.subcategory || "Select Subcategory"}
                                </span>
                                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showSubcategoryDropdown ? 'rotate-180' : ''}`} />
                            </button>

                            {showSubcategoryDropdown && formData.category && (
                                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-60 overflow-y-auto custom-scrollbar">
                                    {currentSubcategories.length > 0 ? (
                                        currentSubcategories.map((sub, index) => (
                                            <button
                                                key={index}
                                                type="button"
                                                onClick={() => handleSelectSubcategory(sub)}
                                                className="w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center justify-between group border-b border-gray-50 last:border-0"
                                            >
                                                <span className="text-gray-700 text-sm">{sub}</span>
                                                {formData.subcategory === sub && (
                                                    <Check className="w-4 h-4 text-[#4A62AD]" />
                                                )}
                                            </button>
                                        ))
                                    ) : (
                                        <div className="p-3 text-center text-gray-500 text-xs">No subcategories available</div>
                                    )}
                                </div>
                            )}
                            {errors.subcategory && <p className="mt-1 text-xs text-red-500">{errors.subcategory}</p>}
                        </div>
                    </div>
                </div>

                {/* Submit Error */}
                {errors.submit && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-sm text-red-700 font-medium flex items-center gap-2">
                            <AlertCircle className="w-4 h-4" /> {errors.submit}
                        </p>
                    </div>
                )}

                {/* Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    <button
                        type="button"
                        onClick={onClose}
                        className="w-full sm:flex-1 px-6 py-2 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold transition-all shadow-sm"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full sm:flex-1 px-6 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-semibold transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? "Sending..." : "Invite Visitor"}
                    </button>
                </div>
            </form>
        </Modal>
    );
}


