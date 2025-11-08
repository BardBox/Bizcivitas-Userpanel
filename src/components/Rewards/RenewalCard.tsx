import React from "react";
import RewardCard from "./RewardCard";

interface RenewalCardProps {
  onCheck: () => void;
}

export default function RenewalCard({ onCheck }: RenewalCardProps) {
  return (
    <RewardCard>
      <h3 className="text-[#ff9d00] text-sm font-semibold mb-2">
        Renewal/Upgrade!
      </h3>
      <p className="text-gray-600 text-xs mb-3">
        Click here to check your eligibility for free renewal/upgrade.
      </p>
      <button
        onClick={onCheck}
        className="bg-[#ff9d00] text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-[#ea580c] transition-colors"
      >
        Check
      </button>
    </RewardCard>
  );
}
