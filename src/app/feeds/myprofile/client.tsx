"use client";

import React, { useState, useRef, useMemo } from "react";
import { AccordionItem } from "@/components/Dashboard/MyProfile/Accordion";
import PersonalProfileCard from "@/components/Dashboard/MyProfile/PersonalProfileCard";

import TravelDiary, {
  useTravelDiaryWithAccordion,
} from "@/components/Dashboard/MyProfile/TravelDiary";
import BusinessDetails, {
  useBusinessDetailsWithAccordion,
} from "@/components/Dashboard/MyProfile/BusinessDetails";
import PersonalDetails from "@/components/Dashboard/MyProfile/PersonalDetails/PersonalDetails";
import Bizleads, {
  useBizleadsWithAccordion,
} from "@/components/Dashboard/MyProfile/Bizleads/Bizleads";
import BizNeeds, {
  useBizNeedsWithAccordion,
} from "@/components/Dashboard/MyProfile/BizNeeds/BizNeeds";
import WeeklyPresentation, {
  useWeeklyPresentationWithAccordion,
} from "@/components/Dashboard/MyProfile/WeeklyPresentation";
import {
  useGetCurrentUserQuery,
  useGetFullProfileQuery,
} from "../../../../store/api/userApi";
import { useAccordion } from "@/hooks/useAccordion";

const MyProfileClient: React.FC = () => {
  // API hooks
  const {
    data: user,
    isLoading: userLoading,
    error: userError,
  } = useGetCurrentUserQuery();
  const {
    data: profile,
    isLoading: profileLoading,
    error: profileError,
  } = useGetFullProfileQuery();

  const { expandedSections, toggleSection } = useAccordion({
    defaultExpanded: ["personal"],
  });

  // Normalize all profile data once at the top level
  const normalizedData = useMemo(() => {
    return {
      personal: {
        hobbiesAndInterests: profile?.myBio?.hobbiesAndInterests,
        myBurningDesireIsTo: profile?.myBio?.myBurningDesireIsTo,
      },
      business: {
        ...profile?.professionalDetails,
        email: user?.email,
        mobile: user?.mobile,
        location: user?.city || profile?.addresses?.address?.city,
        companyLogo: profile?.professionalDetails?.companyLogo,
        // Business location data comes from professionalDetails (can be updated by user)
        // Fallback to addresses.address if not set in professionalDetails
        businessCity:
          profile?.professionalDetails?.businessCity ||
          profile?.addresses?.address?.city,
        businessState:
          profile?.professionalDetails?.businessState ||
          profile?.addresses?.address?.state,
        businessCountry:
          profile?.professionalDetails?.businessCountry ||
          profile?.addresses?.address?.country,
      },
      leads: {
        given: profile?.myBio?.myGives,
        received: [], // reserved for future
      },
      needs: profile?.myBio?.myAsk,
      travel: profile?.travelDiary,
      presentation: profile?.weeklyPresentation,
      skills: profile?.mySkillItems ?? [],
    };
  }, [user, profile]);

  // Edit functionality hooks for each component using normalized data
  const businessDetailsHook = useBusinessDetailsWithAccordion(
    normalizedData.business
  );
  const bizleadsHook = useBizleadsWithAccordion(normalizedData.leads);
  const bizNeedsHook = useBizNeedsWithAccordion(normalizedData.needs);
  const travelDiaryHook = useTravelDiaryWithAccordion(normalizedData.travel);
  const weeklyPresentationHook = useWeeklyPresentationWithAccordion(
    normalizedData.presentation
  );

  // Simple PersonalDetails state management
  const [isEditingPersonal, setIsEditingPersonal] = useState(false);
  const personalFormRef = useRef<HTMLFormElement>(null);

  const handlePersonalEdit = () => setIsEditingPersonal(true);
  const handlePersonalCancel = () => setIsEditingPersonal(false);
  const handlePersonalSave = () => {
    if (personalFormRef.current) {
      personalFormRef.current.requestSubmit();
    }
  };

  // Derived state
  const isLoading = userLoading || profileLoading;
  const error = userError || profileError;

  // Handle loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-600">Loading profile...</p>
      </div>
    );
  }

  // Error state with retry functionality
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Unable to Load Profile
          </h1>
          <p className="text-gray-600 mb-6">
            We&apos;re having trouble loading your profile information. Please
            try again.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Not logged in state
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Not Logged In
          </h1>
          <p className="text-gray-600 mb-4">
            Please log in to view your profile.
          </p>
        </div>
      </div>
    );
  }

  // Prepare personal card data
  const personalCardData = {
    fname: user.fname || undefined,
    lname: user.lname || undefined,
    gender: user.gender || undefined,
    membershipType: user.membershipType || undefined,
    contact: {
      personal: user.mobile?.toString() || undefined,
      email: user.email || undefined,
      website: profile?.contactDetails?.website || undefined,
    },
    business: {
      name:
        profile?.professionalDetails?.companyName ||
        user.companyName ||
        undefined,
      logo: profile?.professionalDetails?.companyLogo,
    },
    location: user.city || profile?.addresses?.address?.city || undefined,
  };

  // Accordion sections configuration with hooks and normalized data
  const accordionSections = [
    {
      key: "business",
      title: "Business Details",
      hook: businessDetailsHook,
      component: BusinessDetails,
      props: { professionalDetails: normalizedData.business },
    },
    {
      key: "bizleads",
      title: "Business Leads",
      hook: bizleadsHook,
      component: Bizleads,
      props: { leads: normalizedData.leads },
    },
    {
      key: "bizneeds",
      title: "Business Needs",
      hook: bizNeedsHook,
      component: BizNeeds,
      props: { myAsk: normalizedData.needs },
    },
    {
      key: "travel",
      title: "Travel Diary",
      hook: travelDiaryHook,
      component: TravelDiary,
      props: { travelDiary: normalizedData.travel },
    },
    {
      key: "presentation",
      title: "Weekly Presentation",
      hook: weeklyPresentationHook,
      component: WeeklyPresentation,
      props: { weeklyPresentation: normalizedData.presentation },
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-2 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {/* Left Column - Profile Card */}
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-24">
              <PersonalProfileCard profile={personalCardData} />
            </div>
          </div>

          {/* Right Column - Accordion Sections */}
          <div className="lg:col-span-2 space-y-3 sm:space-y-4">
            {/* Personal Details Section */}
            <AccordionItem
              key="personal"
              title="Personal Details"
              defaultOpen={expandedSections["personal"] || false}
              editable={true}
              onEdit={handlePersonalEdit}
              onSave={handlePersonalSave}
              onCancel={handlePersonalCancel}
              isEditing={isEditingPersonal}
              isSaving={false}
            >
              <PersonalDetails
                personalDetails={normalizedData.personal}
                mySkillItems={normalizedData.skills}
                isEditing={isEditingPersonal}
                onEditStateChange={setIsEditingPersonal}
                formRef={personalFormRef}
              />
            </AccordionItem>

            {accordionSections.map((section) => {
              const Component = section.component;
              return (
                <AccordionItem
                  key={section.key}
                  title={section.title}
                  defaultOpen={expandedSections[section.key] || false}
                  editable={true}
                  onEdit={section.hook.handleEdit}
                  onSave={section.hook.handleSave}
                  onCancel={section.hook.handleCancel}
                  isEditing={section.hook.isEditing}
                  isSaving={section.hook.isLoading}
                >
                  <Component
                    {...section.props}
                    isEditing={section.hook.isEditing}
                    onEditStateChange={section.hook.handleEditStateChange}
                    formRef={section.hook.formRef}
                  />
                </AccordionItem>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyProfileClient;
