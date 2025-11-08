import React from "react";
import RewardCard from "./RewardCard";

interface SpotlightCardProps {
  onRequest: () => void;
}

export default function SpotlightCard({ onRequest }: SpotlightCardProps) {
  return (
    <RewardCard>
      <h3 className="text-[#22c55e] text-sm font-semibold mb-2">
        Spotlight video?
      </h3>
      <p className="text-gray-600 text-xs mb-3">
        You can request a video to spotlight.
      </p>
      <button
        onClick={onRequest}
        className="bg-[#22c55e] text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-[#1db212] transition-colors"
      >
        Request
      </button>
    </RewardCard>
  );
}
