import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import RewardCard from "./RewardCard";

export default function DomesticTripCard() {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="mb-4">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-base font-semibold text-gray-900">
          Domestic Trip Waitlist Access
        </h2>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-gray-600 hover:text-gray-900 transition-colors"
        >
          {isExpanded ? (
            <ChevronUp className="h-6 w-6" />
          ) : (
            <ChevronDown className="h-6 w-6" />
          )}
        </button>
      </div>

      {/* Collapsible Card */}
      {isExpanded && (
        <RewardCard>
          <p className="text-gray-600 text-xs mb-3">
            If you will be eligible, we will notify you.
          </p>
          <button className="bg-[#3359ff] text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-[#2447cc] transition-colors">
            Apply
          </button>
        </RewardCard>
      )}
    </div>
  );
}
