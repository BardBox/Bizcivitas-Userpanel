"use client";

import { useState, useRef, useEffect } from "react";
import { Calendar, X } from "lucide-react";

interface DateRangePickerProps {
  startDate: string;
  endDate: string;
  onDateChange: (startDate: string, endDate: string) => void;
  onClose?: () => void;
  maxDate?: string;
}

export default function DateRangePicker({
  startDate,
  endDate,
  onDateChange,
  onClose,
  maxDate,
}: DateRangePickerProps) {
  const [localStartDate, setLocalStartDate] = useState(startDate);
  const [localEndDate, setLocalEndDate] = useState(endDate);
  const modalRef = useRef<HTMLDivElement>(null);

  // Get today's date in YYYY-MM-DD format
  const today = maxDate || new Date().toISOString().split("T")[0];

  // Close modal when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        onClose?.();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  const handleApply = () => {
    if (localStartDate && localEndDate) {
      // Validate that start date is before end date
      if (new Date(localStartDate) > new Date(localEndDate)) {
        alert("Start date must be before end date");
        return;
      }
      onDateChange(localStartDate, localEndDate);
      onClose?.();
    } else {
      alert("Please select both start and end dates");
    }
  };

  const handleReset = () => {
    const defaultStart = new Date();
    defaultStart.setDate(defaultStart.getDate() - 15);
    const defaultStartStr = defaultStart.toISOString().split("T")[0];

    setLocalStartDate(defaultStartStr);
    setLocalEndDate(today);
    onDateChange(defaultStartStr, today);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-[200] flex items-center justify-center p-4">
      <div
        ref={modalRef}
        className="bg-white rounded-xl shadow-2xl w-full max-w-md animate-fadeIn"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 md:p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Calendar className="w-5 h-5 text-blue-600 flex-shrink-0" />
            </div>
            <h3 className="text-lg md:text-xl font-bold text-gray-900 leading-none">
              Select Date Range
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 md:p-6 space-y-4">
          {/* Start Date */}
          <div>
            <label
              htmlFor="start-date"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Start Date
            </label>
            <input
              id="start-date"
              type="date"
              value={localStartDate}
              onChange={(e) => setLocalStartDate(e.target.value)}
              max={localEndDate || today}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm md:text-base transition-all"
            />
          </div>

          {/* End Date */}
          <div>
            <label
              htmlFor="end-date"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              End Date
            </label>
            <input
              id="end-date"
              type="date"
              value={localEndDate}
              onChange={(e) => setLocalEndDate(e.target.value)}
              min={localStartDate}
              max={today}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm md:text-base transition-all"
            />
          </div>

          {/* Info Text */}
          <div className="text-xs md:text-sm text-gray-600 bg-blue-50 p-3 rounded-xl border border-blue-100">
            <p>
              <span className="font-semibold text-blue-700">Tip:</span> Select a custom date
              range to filter your dashboard data.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-3 p-4 md:p-6 border-t border-gray-200 bg-gray-50 rounded-b-xl">
          <button
            onClick={handleReset}
            className="w-full sm:w-auto px-4 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded-xl transition-colors"
          >
            Reset
          </button>
          <div className="flex gap-3 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 py-2.5 text-sm font-semibold text-gray-700 border border-gray-300 bg-white hover:bg-gray-50 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleApply}
              className="flex-1 sm:flex-none px-4 md:px-6 py-2.5 text-sm font-semibold text-white bg-blue-500 hover:bg-blue-600 rounded-xl transition-colors shadow-sm"
            >
              Apply
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
