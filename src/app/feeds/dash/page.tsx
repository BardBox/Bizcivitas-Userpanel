"use client";

import { useState } from "react";
import DashboardCard from "@/components/Dashboard/DashboardCard";
import BizConnectChart from "@/components/Dashboard/charts/BizConnectChart";
import BizWinChart from "@/components/Dashboard/charts/BizWinChart";
import MeetupsChart from "@/components/Dashboard/charts/MeetupsChart";
import VisitorInvitationChart from "@/components/Dashboard/charts/VisitorInvitationChart";
import {
  dashboardCards,
  userProfile,
} from "@/components/Dashboard/data/dashboard-data";

export default function DashboardPage() {
  const [activeChartIndex, setActiveChartIndex] = useState(0);

  const chartComponents = [BizConnectChart, BizWinChart, MeetupsChart, VisitorInvitationChart];
  const ActiveChart = chartComponents[activeChartIndex];

  return (
    <div className="min-h-screen bg-gray-50 p-6 lg:p-8">
      <div className="max-w-[1400px] mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-3xl font-bold text-gray-900">
            Dashboard
          </h1>
        </div>

        {/* Dashboard Cards Grid - Clickable to switch charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
        <div className="mt-6">
          <ActiveChart />
        </div>
      </div>
    </div>
  );
}
