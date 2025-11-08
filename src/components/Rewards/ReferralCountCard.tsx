import React from "react";
import RewardCard from "./RewardCard";

export default function ReferralCountCard() {
  return (
    <RewardCard>
      <div className="flex flex-col items-start">
        <div className="w-10 h-10 bg-gradient-to-br from-[#3359ff] to-[#2447cc] rounded-full flex items-center justify-center mb-3 shadow-md">
          <span className="text-white text-lg font-bold">0</span>
        </div>
        <h3 className="text-[#3359ff] text-sm font-semibold mb-2">
          Digital Membership Referral Count
        </h3>
        <p className="text-gray-600 text-xs">
          You haven&apos;t Referred anyone yet.
        </p>
      </div>
    </RewardCard>
  );
}
