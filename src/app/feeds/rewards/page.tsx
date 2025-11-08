"use client";

import { useState } from "react";
import ReferralCountCard from "@/components/Rewards/ReferralCountCard";
import RenewalCard from "@/components/Rewards/RenewalCard";
import SpotlightCard from "@/components/Rewards/SpotlightCard";
import ReferralIdCard from "@/components/Rewards/ReferralIdCard";
import DomesticTripCard from "@/components/Rewards/DomesticTripCard";
import RewardModal from "@/components/Rewards/RewardModal";

export default function RewardsPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");

  const handleRenewalCheck = () => {
    setModalMessage("Request successfully submitted.");
    setModalOpen(true);
  };

  const handleSpotlightRequest = () => {
    setModalMessage("You are not yet eligible.");
    setModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4">
            <h1 className="text-xl font-semibold text-gray-900">Rewards</h1>
            <p className="text-sm text-gray-600">
              Track your referrals, renewals, and exclusive benefits
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Responsive Grid Layout: 1 column on mobile, 2 columns on larger screens */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          {/* Digital Membership Referral Count */}
          <ReferralCountCard />

          {/* Renewal/Upgrade */}
          <RenewalCard onCheck={handleRenewalCheck} />

          {/* Spotlight Video */}
          <SpotlightCard onRequest={handleSpotlightRequest} />

          {/* Referral ID */}
          <ReferralIdCard />
        </div>

        {/* Domestic Trip Waitlist Access - Full Width */}
        <DomesticTripCard />
      </div>

      {/* Modal */}
      <RewardModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        message={modalMessage}
      />
    </div>
  );
}
