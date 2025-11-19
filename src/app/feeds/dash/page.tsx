"use client";

import { useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../../../store/store";
import DashboardCard from "@/components/Dashboard/DashboardCard";
import BizConnectChart from "@/components/Dashboard/charts/BizConnectChart";
import BizWinChart from "@/components/Dashboard/charts/BizWinChart";
import MeetupsChart from "@/components/Dashboard/charts/MeetupsChart";
import VisitorInvitationChart from "@/components/Dashboard/charts/VisitorInvitationChart";
import {
  useGetReferralsMonthlyCountQuery,
  useGetRecordLast15DaysCountsQuery,
  useGetMeetupsMeetingCountQuery,
  useGetMeetingsLast15DaysInvitedCountQuery,
} from "../../../../store/api/dashboardApi";

type DateRange = "15days" | "3months" | "6months" | "tilldate" | "custom";

// Helper function to get period label based on date range
const getPeriodLabel = (range: DateRange): string => {
  switch (range) {
    case "15days":
      return "Fortnight Overview";
    case "3months":
      return "Quarterly Overview";
    case "6months":
      return "Half-Yearly Overview";
    case "tilldate":
      return "All Time Overview";
    case "custom":
      return "Custom Range Overview";
    default:
      return "Fortnight Overview";
  }
};

export default function DashboardPage() {
  const [activeChartIndex, setActiveChartIndex] = useState(0);
  const [selectedRange, setSelectedRange] = useState<DateRange>("15days");

  // Get user membership type from Redux store
  const user = useSelector((state: RootState) => state.auth.user);
  const membershipType = user?.membershipType?.toLowerCase() || "";

  // Check if user can see Visitor Invitation (only core, flagship, industria)
  // Membership types can be: "Core Membership", "Flagship", "Industria", "Digital"
  const canSeeVisitorInvitation =
    membershipType.includes("core") ||
    membershipType.includes("flagship") ||
    membershipType.includes("industria");

  // Fetch dashboard data for cards
  const { data: bizConnectData, isLoading: bizConnectLoading} = useGetReferralsMonthlyCountQuery();
  const { data: bizWinData, isLoading: bizWinLoading } = useGetRecordLast15DaysCountsQuery();
  const { data: meetupsData, isLoading: meetupsLoading } = useGetMeetupsMeetingCountQuery();
  const { data: visitorData, isLoading: visitorLoading } = useGetMeetingsLast15DaysInvitedCountQuery(undefined, {
    skip: !canSeeVisitorInvitation, // Skip fetching if user can't see visitor invitation
  });

  // Calculate values for dashboard cards
  const bizConnectCount = bizConnectData?.totalReferralsCount || 0;
  const bizWinCount = bizWinData?.overallReceived ? `₹${(bizWinData.overallReceived / 100000).toFixed(1)}L` : "₹0";
  const meetupsCount = meetupsData?.last15DaysMeetupCount || 0;
  const visitorCount = visitorData?.last15DaysCount || 0;

  const isLoading = bizConnectLoading || bizWinLoading || meetupsLoading || visitorLoading;

  // Get period label for card titles
  const periodLabel = getPeriodLabel(selectedRange);

  // Dashboard cards configuration with dynamic data and titles
  const baseDashboardCards = [
    {
      id: "1",
      title: `${periodLabel}: BizConnect`,
      value: isLoading ? "..." : String(bizConnectCount),
      icon: "/dashboard/dash/bizconnect.svg",
      bgColor: "bg-white",
      iconColor: "text-dashboard-gray",
    },
    {
      id: "2",
      title: `${periodLabel.replace('Overview', '')}: BizWin`,
      value: isLoading ? "..." : bizWinCount,
      icon: "/dashboard/dash/bizwin.svg",
      bgColor: "bg-white",
      iconColor: "text-dashboard-gray",
    },
    {
      id: "3",
      title: `${periodLabel.replace('Overview', '')}: Meet-ups`,
      value: isLoading ? "..." : String(meetupsCount),
      icon: "/dashboard/dash/meetup.svg",
      bgColor: "bg-white",
      iconColor: "text-dashboard-gray",
    },
  ];

  // Conditionally add Visitor Invitation card only for core, flagship, and industria members
  const dashboardCards = canSeeVisitorInvitation
    ? [
        ...baseDashboardCards,
        {
          id: "4",
          title: `Visitor Invitation`,
          value: isLoading ? "..." : String(visitorCount),
          icon: "/dashboard/dash/invite.svg",
          bgColor: "bg-white",
          iconColor: "text-dashboard-gray",
        },
      ]
    : baseDashboardCards;

  // Conditionally add VisitorInvitationChart only for eligible members
  const chartComponents = canSeeVisitorInvitation
    ? [BizConnectChart, BizWinChart, MeetupsChart, VisitorInvitationChart]
    : [BizConnectChart, BizWinChart, MeetupsChart];

  const ActiveChart = chartComponents[activeChartIndex];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-4 md:space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Dashboard
          </h1>
        </div>

        {/* Dashboard Cards Grid - Clickable to switch charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {dashboardCards.map((card, index) => (
            <div
              key={card.id}
              onClick={() => setActiveChartIndex(index)}
              className="cursor-pointer"
            >
              <DashboardCard
                card={card}
                isActive={activeChartIndex === index}
              />
            </div>
          ))}
        </div>

        {/* Chart Section */}
        <div className="mt-4 md:mt-6">
          <ActiveChart
            selectedRange={selectedRange}
            onRangeChange={setSelectedRange}
          />
        </div>
      </div>
    </div>
  );
}
