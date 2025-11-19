"use client";

import { useGetCurrentUserQuery, useGetMembershipBenefitsQuery } from "@/store/api";
import MembershipCard from "@/components/Membership/MembershipCard";
import { Check } from "lucide-react";

export default function MyMembershipPage() {
  const { data: userData, isLoading: userLoading } = useGetCurrentUserQuery();
  const { data: benefitsData, isLoading: benefitsLoading } = useGetMembershipBenefitsQuery();

  // userData is already transformed to just the user object (not wrapped in data)
  const user = userData;

  const membershipType = user?.membershipType || "Flagship Membership";
  const firstName = user?.fname || "User";
  const lastName = user?.lname || "";
  const userName = `${firstName} ${lastName}`.trim() || "User";
  const joinDate = "01/12/2025"; // Static as per mobile app
  const renewalDate = user?.renewalDate || new Date().toISOString();

  // Find benefits for current membership type
  const membershipBenefits = benefitsData?.data?.find(
    (item) => item.membershipType === membershipType
  )?.content || [];

  if (userLoading || benefitsLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="py-4">
              <h1 className="text-xl font-semibold text-gray-900">My Membership</h1>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex flex-col items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-600">Loading membership details...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 md:rounded-3xl">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200 md:mt-12 md:rounded-tl-3xl md:rounded-tr-3xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4">
            <h1 className="text-xl font-semibold text-gray-900">My Membership</h1>
            <p className="text-sm text-gray-600">
              View your membership details and benefits
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="max-w-2xl">
          {/* Membership Card */}
          <MembershipCard
            membershipType={membershipType}
            userName={userName}
            joinDate={joinDate}
            renewalDate={renewalDate}
          />

          {/* Membership Benefits */}
          <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Membership Benefits
            </h2>
            {membershipBenefits.length > 0 ? (
              <div className="space-y-3">
                {membershipBenefits.map((benefit, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                      <div className="w-5 h-5 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
                        <Check className="w-3 h-3 text-white" strokeWidth={3} />
                      </div>
                    </div>
                    <p className="text-sm text-gray-700 flex-1">{benefit}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No benefits available</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
