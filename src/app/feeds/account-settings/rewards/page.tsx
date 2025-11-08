"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import ReferralCountCard from "@/components/Rewards/ReferralCountCard";
import RenewalCard from "@/components/Rewards/RenewalCard";
import SpotlightCard from "@/components/Rewards/SpotlightCard";
import ReferralIdCard from "@/components/Rewards/ReferralIdCard";
import DomesticTripCard from "@/components/Rewards/DomesticTripCard";
import RewardModal from "@/components/Rewards/RewardModal";

export default function RewardsPage() {
  const router = useRouter();
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
    <div className="min-h-screen bg-white">
      {/* Header with Orange Gradient */}
      <div className="bg-gradient-to-r from-[#FFDA7D] to-[#FE9D01] sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center relative py-4">
            <button
              onClick={() => router.back()}
              className="absolute left-0 text-white hover:text-gray-100 transition-colors"
            >
              <ArrowLeft className="h-6 w-6" />
            </button>
            <h1 className="text-xl font-bold text-white">Rewards</h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Digital Membership Referral Count */}
        <ReferralCountCard />

        {/* Renewal/Upgrade */}
        <RenewalCard onCheck={handleRenewalCheck} />

        {/* Spotlight Video */}
        <SpotlightCard onRequest={handleSpotlightRequest} />

        {/* Referral ID */}
        <ReferralIdCard />

        {/* Domestic Trip Waitlist Access */}
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
