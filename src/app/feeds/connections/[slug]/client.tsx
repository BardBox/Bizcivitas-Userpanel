"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { AccordionItem } from "@/components/Dashboard/MyProfile/Accordion";
import ViewOnlyProfileCard from "@/components/Dashboard/Connections/ViewOnlyProfileCard";
import PersonalDetails from "@/components/Dashboard/MyProfile/PersonalDetails/PersonalDetails";
import BusinessDetails from "@/components/Dashboard/MyProfile/BusinessDetails";
import TravelDiary from "@/components/Dashboard/MyProfile/TravelDiary";
import Bizleads from "@/components/Dashboard/MyProfile/Bizleads/Bizleads";
import BizNeeds from "@/components/Dashboard/MyProfile/BizNeeds/BizNeeds";
import WeeklyPresentation from "@/components/Dashboard/MyProfile/WeeklyPresentation";
import ViewOnlyConnections from "@/components/Dashboard/Connections/ViewOnlyConnections";
import { ArrowLeft } from "lucide-react";
import { useAppDispatch } from "../../../../../store/hooks";
import { addToast } from "../../../../../store/toastSlice";
import {
  useGetConnectionProfileQuery,
  useGetCurrentUserQuery,
  useDeleteConnectionMutation,
  useSendConnectionRequestMutation,
  useAcceptConnectionRequestMutation,
} from "../../../../../store/api/userApi";

interface ConnectionDetailsClientProps {
  slug: string;
}

// Capitalize first letter utility
const capitalize = (str?: string) =>
  str ? str.charAt(0).toUpperCase() + str.slice(1) : "";

const ConnectionDetailsClient: React.FC<ConnectionDetailsClientProps> = ({
  slug,
}) => {
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();
  const dispatch = useAppDispatch();

  // Get current user
  const { data: currentUser } = useGetCurrentUserQuery();

  // Use our API endpoint to fetch connection profile by ID
  const {
    data: connectionProfile,
    isLoading,
    error: apiError,
  } = useGetConnectionProfileQuery(slug, {
    skip: !slug || !isMounted,
  });

  // Mutations for connection actions
  const [deleteConnection] = useDeleteConnectionMutation();
  const [sendConnectionRequest] = useSendConnectionRequestMutation();
  const [acceptConnectionRequest] = useAcceptConnectionRequestMutation();

  // Handle client-side mounting
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Determine connection status
  const connectionStatus = useMemo((): {
    status: "none" | "pending_sent" | "pending_received" | "connected";
    connectionId: string | null;
  } => {
    if (!currentUser || !connectionProfile)
      return { status: "none", connectionId: null };

    const currentUserId = currentUser._id || currentUser.id;
    const connections = connectionProfile.connections || [];

    // Find connection between current user and viewed profile
    const connection = connections.find((conn: any) => {
      const sender = conn.sender?._id || conn.sender;
      const receiver = conn.receiver?._id || conn.receiver;
      return sender === currentUserId || receiver === currentUserId;
    });

    if (!connection) {
      return { status: "none", connectionId: null };
    }

    if (connection.isAccepted) {
      return { status: "connected", connectionId: connection._id };
    }

    // Check if current user is sender or receiver
    const sender = connection.sender?._id || connection.sender;
    if (sender === currentUserId) {
      return { status: "pending_sent", connectionId: connection._id };
    } else {
      return { status: "pending_received", connectionId: connection._id };
    }
  }, [currentUser, connectionProfile]);

  // Normalize connection profile data to match myprofile structure
  const normalizedData = useMemo(() => {
    if (!connectionProfile) return null;

    // connectionProfile is already the userDetails from the API response
    const user = connectionProfile;
    const profile = user?.profile || {};

    const businessData = {
      ...profile?.professionalDetails,
      email: user?.email,
      mobile: user?.mobile,
      location: user?.region,
      companyLogo: profile?.professionalDetails?.companyLogo,
      // Map companyAddress to businessAddress for compatibility
      businessAddress:
        profile?.professionalDetails?.companyAddress ||
        profile?.professionalDetails?.businessAddress,
      // Map address fields from addresses.address to business fields
      businessCity:
        profile?.professionalDetails?.businessCity ||
        profile?.addresses?.address?.city,
      businessState:
        profile?.professionalDetails?.businessState ||
        profile?.addresses?.address?.state,
      businessCountry:
        profile?.professionalDetails?.businessCountry ||
        profile?.addresses?.address?.country,
    };

    return {
      personal: {
        hobbiesAndInterests: profile?.myBio?.hobbiesAndInterests,
        myBurningDesireIsTo: profile?.myBio?.myBurningDesireIsTo,
      },
      business: businessData,
      leads: {
        given: profile?.myBio?.myGives || [],
        received: [], // not applicable for connections
      },
      needs: profile?.myBio?.myAsk || [],
      travel: profile?.travelDiary,
      presentation: profile?.weeklyPresentation,
      contacts: profile?.contactDetails,
      connections: user?.connections || [],
      membership: {
        type: user?.membershipType,
        status: user?.membershipStatus,
        paymentStatus: user?.paymentVerificationStatus,
        community: user?.community,
        coreGroup: user?.coreGroup,
        joiningDate: user?.joiningDate,
      },
    };
  }, [connectionProfile]);

  // Prepare personal card data
  const personalCardData = useMemo(() => {
    if (!connectionProfile) return null;

    // connectionProfile is already the userDetails from the API response
    const user = connectionProfile;
    const profile = user?.profile || {};

    // Get avatar URL
    const getAvatarUrl = (avatarPath?: string) => {
      if (!avatarPath || avatarPath.startsWith("http")) return avatarPath;
      const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
      return `${baseUrl}/image/${avatarPath}`;
    };

    return {
      fname: user?.fname,
      lname: user?.lname,
      username: user?.username,
      membershipType: user?.membershipType,
      avatar: user?.avatar,
      contact: {
        personal: user?.mobile?.toString(),
        professional: profile?.contactDetails?.mobileNumber,
        email: user?.email,
        website: profile?.contactDetails?.website,
      },
      business: {
        name: profile?.professionalDetails?.companyName,
        logo: profile?.professionalDetails?.companyLogo,
      },
      location: user?.region,
      isActive: user?.isActive,
      joiningDate: user?.joiningDate,
    };
  }, [connectionProfile]);

  const handleConnect = async () => {
    try {
      if (
        connectionStatus.status === "pending_received" &&
        connectionStatus.connectionId
      ) {
        // Accept connection request
        await acceptConnectionRequest({
          connectionId: connectionStatus.connectionId,
        }).unwrap();
        dispatch(
          addToast({
            type: "success",
            message: `Connection request accepted!`,
            duration: 3000,
          })
        );
      } else {
        // Send new connection request
        await sendConnectionRequest({ receiverId: slug }).unwrap();
        dispatch(
          addToast({
            type: "success",
            message: `Connection request sent to ${personalCardData?.fname} ${personalCardData?.lname}`,
            duration: 3000,
          })
        );
      }
    } catch (error: any) {
      dispatch(
        addToast({
          type: "error",
          message: error?.data?.message || "Failed to send connection request",
          duration: 3000,
        })
      );
    }
  };

  const handleRemoveConnection = async () => {
    if (!connectionStatus.connectionId) return;

    try {
      await deleteConnection({
        connectionId: connectionStatus.connectionId,
      }).unwrap();

      const actionText =
        connectionStatus.status === "connected"
          ? "Connection removed successfully"
          : "Connection request cancelled";

      dispatch(
        addToast({
          type: "success",
          message: actionText,
          duration: 3000,
        })
      );
    } catch (error: any) {
      dispatch(
        addToast({
          type: "error",
          message: error?.data?.message || "Failed to remove connection",
          duration: 3000,
        })
      );
    }
  };

  const handleMessage = () => {
    dispatch(
      addToast({
        type: "info",
        message: "Message feature coming soon",
        duration: 3000,
      })
    );
  };

  // Show loading state during SSR or while data is being fetched
  if (!isMounted || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading connection details...</p>
        </div>
      </div>
    );
  }

  // Handle error state
  if (apiError || !connectionProfile || !normalizedData || !personalCardData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Connection Not Found
          </h1>
          <p className="text-red-600 mb-4">
            Unable to load connection details.
          </p>
          <button
            onClick={() => router.back()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 mr-2"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Accordion sections configuration without edit functionality
  const accordionSections = [
    {
      key: "business",
      title: "Business Details",
      component: BusinessDetails,
      props: { professionalDetails: normalizedData.business },
      hasData: Object.values(normalizedData.business || {}).some(
        (value) => value
      ),
    },
    {
      key: "bizleads",
      title: "Business Leads",
      component: Bizleads,
      props: { leads: normalizedData.leads },
      hasData: normalizedData.leads?.given?.length > 0,
    },
    {
      key: "bizneeds",
      title: "Business Needs",
      component: BizNeeds,
      props: { myAsk: normalizedData.needs },
      hasData: normalizedData.needs?.length > 0,
    },
    {
      key: "travel",
      title: "Travel Diary",
      component: TravelDiary,
      props: { travelDiary: normalizedData.travel },
      hasData: Object.values(normalizedData.travel || {}).some((value) =>
        Array.isArray(value) ? value.length > 0 : Boolean(value)
      ),
    },
    {
      key: "presentation",
      title: "Weekly Presentation",
      component: WeeklyPresentation,
      props: { weeklyPresentation: normalizedData.presentation },
      hasData: Object.values(normalizedData.presentation || {}).some(
        (value) => value
      ),
    },
    {
      key: "connections",
      title: "Connections",
      component: ViewOnlyConnections,
      props: { connections: normalizedData.connections },
      hasData: normalizedData.connections?.length > 0,
    },
  ];

  // Filter sections that have data
  const sectionsWithData = accordionSections.filter(
    (section) => section.hasData
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <button
              onClick={() => router.back()}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Connections
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {/* Left Column - Profile Card */}
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-24">
              {personalCardData && (
                <ViewOnlyProfileCard
                  profile={personalCardData}
                  connectionStatus={connectionStatus}
                  onConnect={handleConnect}
                  onRemoveConnection={handleRemoveConnection}
                  onMessage={handleMessage}
                />
              )}
            </div>
          </div>

          {/* Right Column - Accordion Sections */}
          <div className="lg:col-span-2 space-y-3 sm:space-y-4">
            {/* Personal Details Section */}
            <AccordionItem
              key="personal"
              title="Personal Details"
              defaultOpen={true}
              editable={false} // No edit functionality for connections
            >
              <PersonalDetails
                personalDetails={normalizedData.personal}
                isEditing={false} // Always read-only
                onEditStateChange={() => {}} // No-op
                formRef={React.createRef<HTMLFormElement>()}
              />
            </AccordionItem>

            {/* Dynamic sections with data */}
            {sectionsWithData.map((section) => {
              const Component = section.component;

              // Common props for MyProfile components
              const commonProps = {
                isEditing: false,
                onEditStateChange: () => {},
                formRef: React.createRef<HTMLFormElement>(),
              };

              return (
                <AccordionItem
                  key={section.key}
                  title={section.title}
                  defaultOpen={false}
                  editable={false} // No edit functionality for connections
                >
                  {/* Render each component with appropriate props */}
                  {section.key === "business" && (
                    <BusinessDetails
                      professionalDetails={section.props.professionalDetails}
                      {...commonProps}
                    />
                  )}
                  {section.key === "bizleads" && (
                    <Bizleads leads={section.props.leads} {...commonProps} />
                  )}
                  {section.key === "bizneeds" && (
                    <BizNeeds myAsk={section.props.myAsk} {...commonProps} />
                  )}
                  {section.key === "travel" && (
                    <TravelDiary
                      travelDiary={section.props.travelDiary}
                      {...commonProps}
                    />
                  )}
                  {section.key === "presentation" && (
                    <WeeklyPresentation
                      weeklyPresentation={section.props.weeklyPresentation}
                      {...commonProps}
                    />
                  )}
                  {section.key === "connections" && (
                    <ViewOnlyConnections
                      connections={section.props.connections}
                      currentUserId={connectionProfile?._id || ""}
                    />
                  )}
                </AccordionItem>
              );
            })}

            {/* Show message if no sections have data */}
            {sectionsWithData.length === 0 && (
              <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                <p className="text-gray-500">
                  This member hasn&apos;t filled out their profile details yet.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConnectionDetailsClient;
