"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Home, ChevronRight } from "lucide-react";
import { toast } from "react-hot-toast";
import {
  useGetConnectionProfileQuery,
  useGetCurrentUserQuery,
  useDeleteConnectionMutation,
  useSendConnectionRequestMutation,
  useAcceptConnectionRequestMutation,
} from "@/store/api";

// Import components directly - no lazy loading to avoid skeleton states
import { AccordionItem } from "@/components/Dashboard/MyProfile/Accordion";
import ViewOnlyProfileCard from "@/components/Dashboard/Connections/ViewOnlyProfileCard";
import PersonalDetails from "@/components/Dashboard/MyProfile/PersonalDetails/PersonalDetails";
import BusinessDetails from "@/components/Dashboard/MyProfile/BusinessDetails";
import TravelDiary from "@/components/Dashboard/MyProfile/TravelDiary";
import Bizleads from "@/components/Dashboard/MyProfile/Bizleads/Bizleads";
import BizNeeds from "@/components/Dashboard/MyProfile/BizNeeds/BizNeeds";
import WeeklyPresentation from "@/components/Dashboard/MyProfile/WeeklyPresentation";
import ViewOnlyConnections from "@/components/Dashboard/Connections/ViewOnlyConnections";
import ConfirmDialog from "@/components/Dashboard/Connections/ConfirmDialog";

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
  const searchParams = useSearchParams();

  // Get referrer tab from URL params
  const referrerTab = searchParams?.get("from");

  // Get current user
  const { data: currentUser, isLoading: isCurrentUserLoading } =
    useGetCurrentUserQuery();

  // Use our API endpoint to fetch connection profile by ID
  const {
    data: connectionProfile,
    isLoading,
    error: apiError,
  } = useGetConnectionProfileQuery(slug, {
    skip: !slug || !isMounted,
  });

  // Combined loading state
  const isPageLoading = isLoading || isCurrentUserLoading;

  // Mutations for connection actions
  const [deleteConnection, { isLoading: isDeleting }] =
    useDeleteConnectionMutation();
  const [sendConnectionRequest] = useSendConnectionRequestMutation();
  const [acceptConnectionRequest] = useAcceptConnectionRequestMutation();

  // Confirm dialog state
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  // Handle client-side mounting
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Loading timeout state
  const [isLoadingSlow, setIsLoadingSlow] = useState(false);

  useEffect(() => {
    if (isPageLoading) {
      const timer = setTimeout(() => {
        setIsLoadingSlow(true);
      }, 2000); // Show slow loading message after 2 seconds

      return () => clearTimeout(timer);
    } else {
      setIsLoadingSlow(false);
    }
  }, [isPageLoading]);

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
      const senderId =
        typeof conn.sender === "string"
          ? conn.sender
          : (conn.sender as any)?._id || conn.sender;
      const receiverId =
        typeof conn.receiver === "string"
          ? conn.receiver
          : (conn.receiver as any)?._id || conn.receiver;
      return senderId === currentUserId || receiverId === currentUserId;
    });

    if (!connection) {
      return { status: "none", connectionId: null };
    }

    if (connection.isAccepted) {
      return { status: "connected", connectionId: connection._id };
    }

    // Check if current user is sender or receiver
    const senderId =
      typeof connection.sender === "string"
        ? connection.sender
        : (connection.sender as any)?._id || connection.sender;
    if (senderId === currentUserId) {
      return { status: "pending_sent", connectionId: connection._id };
    } else {
      return { status: "pending_received", connectionId: connection._id };
    }
  }, [currentUser, connectionProfile]);

  // Normalize connection profile data to match myprofile structure
  const normalizedData = useMemo(() => {
    if (!connectionProfile) return null;

    // connectionProfile is already the userDetails from the API response
    const user = connectionProfile as any; // Extended User type from API
    const profile = (user?.profile || {}) as any; // Extended profile with FullProfile fields

    // Check privacy settings and connection status
    // visibility.professionalDetails = true means RESTRICTED (hide from non-connections)
    // visibility.professionalDetails = false means PUBLIC (show to everyone)
    const isRestricted = profile?.visibility?.professionalDetails === true;
    const isConnected = connectionStatus.status === "connected";
    const canViewContactInfo = !isRestricted || isConnected; // Show if NOT restricted OR connected

    const businessData = {
      ...profile?.professionalDetails,
      email: canViewContactInfo ? user?.email : undefined,
      mobile: canViewContactInfo ? user?.mobile : undefined,
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
      skills: profile?.mySkillItems ?? [],
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
  }, [connectionProfile, connectionStatus.status]);

  // Prepare personal card data
  const personalCardData = useMemo(() => {
    if (!connectionProfile) return null;

    // connectionProfile is already the userDetails from the API response
    const user = connectionProfile as any; // Extended User type from API
    const profile = (user?.profile || {}) as any; // Extended profile with FullProfile fields

    // Get avatar URL
    const getAvatarUrl = (avatarPath?: string) => {
      if (!avatarPath || avatarPath.startsWith("http")) return avatarPath;
      const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
      return `${baseUrl}/image/${avatarPath}`;
    };

    // Get company logo URL
    const getCompanyLogoUrl = (logoPath?: string) => {
      if (!logoPath || logoPath.startsWith("http")) return logoPath;
      const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
      return `${baseUrl}/image/${logoPath}`;
    };

    // Check privacy settings and connection status
    // visibility.professionalDetails = true means RESTRICTED (hide from non-connections)
    // visibility.professionalDetails = false means PUBLIC (show to everyone)
    const isRestricted = profile?.visibility?.professionalDetails === true;
    const isConnected = connectionStatus.status === "connected";
    const canViewContactInfo = !isRestricted || isConnected; // Show if NOT restricted OR connected

    return {
      fname: user?.fname,
      lname: user?.lname,
      username: user?.username,
      membershipType: user?.membershipType,
      avatar: user?.avatar,
      contact: {
        personal: canViewContactInfo ? user?.mobile?.toString() : undefined,
        professional: canViewContactInfo ? profile?.contactDetails?.mobileNumber : undefined,
        email: canViewContactInfo ? user?.email : undefined,
        website: profile?.contactDetails?.website, // Website is always visible
      },
      business: {
        name: profile?.professionalDetails?.companyName,
        logo: getCompanyLogoUrl(profile?.professionalDetails?.companyLogo),
      },
      location: user?.region,
      isActive: user?.isActive,
      joiningDate: user?.joiningDate,
    };
  }, [connectionProfile, connectionStatus.status]);

  const handleConnect = async () => {
    setIsConnecting(true);
    const loadingToast = toast.loading("Sending request...");

    try {
      if (
        connectionStatus.status === "pending_received" &&
        connectionStatus.connectionId
      ) {
        // Accept connection request
        await acceptConnectionRequest({
          connectionId: connectionStatus.connectionId,
        }).unwrap();
        toast.success("Connection request accepted!", { id: loadingToast });
      } else {
        // Send new connection request
        await sendConnectionRequest({ receiverId: slug }).unwrap();
        toast.success(
          `Connection request sent to ${personalCardData?.fname} ${personalCardData?.lname}`,
          { id: loadingToast }
        );
      }
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to send connection request", {
        id: loadingToast,
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleRemoveConnection = async () => {
    if (!connectionStatus.connectionId) return;
    setShowConfirmDialog(true);
  };

  const confirmRemoveConnection = async () => {
    if (!connectionStatus.connectionId) return;

    try {
      await deleteConnection({
        connectionId: connectionStatus.connectionId,
      }).unwrap();

      const actionText =
        connectionStatus.status === "connected"
          ? "Connection removed successfully"
          : "Connection request cancelled";

      toast.success(actionText);
      setShowConfirmDialog(false);
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to remove connection");
      setShowConfirmDialog(false);
    }
  };

  const handleMessage = () => {
    toast("Message feature coming soon", { icon: "💬" });
  };

  // ⚡ PERFORMANCE: Show skeleton instead of blank screen
  // Remove loading skeleton completely - show content immediately
  if (!isMounted) {
    return null; // Prevent hydration mismatch
  }

  // Show loading state while fetching data
  if (isPageLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading connection details...</p>
          {isLoadingSlow && (
            <p className="mt-2 text-sm text-yellow-600">
              This is taking longer than expected...
            </p>
          )}
        </div>
      </div>
    );
  }

  // Handle error state - only show error if there's an error AND loading is complete
  if (
    !isPageLoading &&
    (apiError || !connectionProfile || !normalizedData || !personalCardData)
  ) {
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
            onClick={() => {
              if (referrerTab) {
                router.push(`/feeds/connections?tab=${referrerTab}`);
              } else {
                router.back();
              }
            }}
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
      props: { 
        professionalDetails: normalizedData!.business,
        isConnected: connectionStatus.status === "connected",
      },
      hasData: Object.values(normalizedData!.business || {}).some(
        (value) => value
      ),
    },
    {
      key: "bizleads",
      title: "Business Leads",
      component: Bizleads,
      props: { leads: normalizedData!.leads },
      hasData: normalizedData!.leads?.given?.length > 0,
    },
    {
      key: "bizneeds",
      title: "Business Needs",
      component: BizNeeds,
      props: { myAsk: normalizedData!.needs },
      hasData: normalizedData!.needs?.length > 0,
    },
    {
      key: "travel",
      title: "Travel Diary",
      component: TravelDiary,
      props: { travelDiary: normalizedData!.travel },
      hasData: Object.values(normalizedData!.travel || {}).some((value) =>
        Array.isArray(value) ? value.length > 0 : Boolean(value)
      ),
    },
    {
      key: "presentation",
      title: "Weekly Presentation",
      component: WeeklyPresentation,
      props: { weeklyPresentation: normalizedData!.presentation },
      hasData: Object.values(normalizedData!.presentation || {}).some(
        (value) => value
      ),
    },
    {
      key: "connections",
      title: "Connections",
      component: ViewOnlyConnections,
      props: { connections: normalizedData!.connections },
      hasData: normalizedData!.connections?.length > 0,
    },
  ];

  // Filter sections that have data
  const sectionsWithData = accordionSections.filter(
    (section) => section.hasData
  );

  // Helper function to get tab label
  const getTabLabel = (tab: string | null) => {
    switch (tab) {
      case "my-network":
        return "My Network";
      case "requests":
        return "Requests";
      case "messages":
        return "Messages";
      default:
        return "Connections";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Breadcrumb */}
      <div className="bg-white border-b border-gray-200 mt-4 sm:mt-6">
        <div className="max-w-6xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="py-2 sm:py-3">
            {/* Breadcrumb Navigation */}
            <div className="flex items-center gap-1 sm:gap-1.5 text-sm text-gray-600">
              <button
                onClick={() => router.push("/feeds")}
                className="hover:text-blue-600 transition-colors p-0.5"
              >
                <Home className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
              <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400" />
              <button
                onClick={() => {
                  if (referrerTab) {
                    router.push(`/feeds/connections?tab=${referrerTab}`);
                  } else {
                    router.push("/feeds/connections");
                  }
                }}
                className="text-[11px] sm:text-[13px] md:text-[14px] hover:text-blue-600 transition-colors"
              >
                Connections
              </button>
              {referrerTab && (
                <>
                  <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400" />
                  <button
                    onClick={() => {
                      router.push(`/feeds/connections?tab=${referrerTab}`);
                    }}
                    className="hover:text-blue-600 transition-colors text-[11px] sm:text-[13px] md:text-[14px]"
                  >
                    {getTabLabel(referrerTab)}
                  </button>
                </>
              )}
              <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400" />
              <span className="text-gray-900 font-medium text-[11px] sm:text-[13px] md:text-[14px] truncate max-w-[150px] sm:max-w-none">
                {`${personalCardData?.fname} ${personalCardData?.lname}`}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {/* Left Column - Profile Card */}
          <div className="xl:col-span-1">
            <div className="xl:sticky xl:top-24">
              {personalCardData && (
                <ViewOnlyProfileCard
                  profile={personalCardData}
                  connectionStatus={connectionStatus}
                  onConnect={handleConnect}
                  onRemoveConnection={handleRemoveConnection}
                  onMessage={handleMessage}
                  userId={slug}
                  isConnecting={isConnecting}
                />
              )}
            </div>
          </div>

          {/* Right Column - Accordion Sections */}
          <div className="xl:col-span-2 space-y-3 sm:space-y-4">
            {/* Personal Details Section */}
            <AccordionItem
              key="personal"
              title="Personal Details"
              defaultOpen={true}
              editable={false} // No edit functionality for connections
            >
              <PersonalDetails
                personalDetails={normalizedData!.personal}
                mySkillItems={normalizedData!.skills}
                isEditing={false} // Always read-only
                onEditStateChange={() => {}} // No-op
                targetUserId={connectionProfile!._id}
                isOwnProfile={false}
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
                      currentUserId={connectionProfile!._id || ""}
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

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <ConfirmDialog
          isOpen={showConfirmDialog}
          onClose={() => setShowConfirmDialog(false)}
          onConfirm={confirmRemoveConnection}
          title={
            connectionStatus.status === "connected"
              ? "Remove Connection"
              : "Cancel Connection Request"
          }
          message={
            connectionStatus.status === "connected"
              ? `Are you sure you want to remove ${personalCardData?.fname} ${personalCardData?.lname} from your connections?`
              : `Are you sure you want to cancel the connection request sent to ${personalCardData?.fname} ${personalCardData?.lname}?`
          }
          confirmText={
            connectionStatus.status === "connected"
              ? "Remove"
              : "Cancel Request"
          }
          cancelText="Go Back"
          isDestructive={true}
          isLoading={isDeleting}
        />
      )}
    </div>
  );
};

export default ConnectionDetailsClient;
