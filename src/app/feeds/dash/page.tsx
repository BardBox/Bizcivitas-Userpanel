"use client";

import { useState } from "react";
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

export default function DashboardPage() {
  const [activeChartIndex, setActiveChartIndex] = useState(0);

  // Fetch dashboard data for cards
  const { data: bizConnectData, isLoading: bizConnectLoading } = useGetReferralsMonthlyCountQuery();
  const { data: bizWinData, isLoading: bizWinLoading } = useGetRecordLast15DaysCountsQuery();
  const { data: meetupsData, isLoading: meetupsLoading } = useGetMeetupsMeetingCountQuery();
  const { data: visitorData, isLoading: visitorLoading } = useGetMeetingsLast15DaysInvitedCountQuery();

  // Calculate values for dashboard cards
  const bizConnectCount = bizConnectData?.totalReferralsCount || 0;
  const bizWinCount = bizWinData?.overallReceived ? `₹${(bizWinData.overallReceived / 100000).toFixed(1)}L` : "₹0";
  const meetupsCount = meetupsData?.last15DaysMeetupCount || 0;
  const visitorCount = visitorData?.last15DaysCount || 0;

  const isLoading = bizConnectLoading || bizWinLoading || meetupsLoading || visitorLoading;

  // Dashboard cards configuration with dynamic data
  const dashboardCards = [
    {
      id: "1",
      title: "Fortnight Overview: BizConnect",
      value: isLoading ? "..." : String(bizConnectCount),
      icon: "/dashboard/dash/bizconnect.svg",
      bgColor: "bg-white",
      iconColor: "text-dashboard-gray",
    },
    {
      id: "2",
      title: "Last Fortnight's BizWin",
      value: isLoading ? "..." : bizWinCount,
      icon: "/dashboard/dash/bizwin.svg",
      bgColor: "bg-white",
      iconColor: "text-dashboard-gray",
    },
    {
      id: "3",
      title: "Last Fortnight's Meet-ups",
      value: isLoading ? "..." : String(meetupsCount),
      icon: "/dashboard/dash/meetup.svg",
      bgColor: "bg-white",
      iconColor: "text-dashboard-gray",
    },
    {
      id: "4",
      title: "Visitor Invitation",
      value: isLoading ? "..." : String(visitorCount),
      icon: "/dashboard/dash/invite.svg",
      bgColor: "bg-white",
      iconColor: "text-dashboard-gray",
    },
  ];

  const chartComponents = [BizConnectChart, BizWinChart, MeetupsChart, VisitorInvitationChart];
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
          <ActiveChart />
        </div>
      </div>
    </div>
  );
}
