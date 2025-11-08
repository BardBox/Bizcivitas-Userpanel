import React from "react";
import RewardCard from "./RewardCard";

export default function ReferralIdCard() {
  return (
    <RewardCard>
      <h3 className="text-[#f59e0b] text-sm font-semibold mb-2">
        Referral ID
      </h3>
      <p className="text-gray-600 text-xs mb-3">
        Share your unique referral ID with others.
      </p>
      <div className="bg-[#f59e0b] text-white px-3 py-1.5 rounded-md inline-block font-bold text-xs">
        DO51830
      </div>
    </RewardCard>
  );
}
