"use client";

import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  useGetReferralsMonthlyCountQuery,
  useGetReferrals3MonthCountsQuery,
  useGetReferrals6MonthCountsQuery,
  useGetReferralsTillDateCountsQuery,
} from "../../../../store/api/dashboardApi";
import { Plus } from "lucide-react";
import CreateBizConnectForm from "../forms/CreateBizConnectForm";
import BizConnectDetailModal from "./BizConnectDetailModal";

type DateRange = "15days" | "3months" | "6months" | "tilldate";

interface DateFilterButton {
  id: DateRange;
  label: string;
}

interface BizConnectChartProps {
  selectedRange?: DateRange;
  onRangeChange?: (range: DateRange) => void;
}

const dateFilters: DateFilterButton[] = [
  { id: "15days", label: "15 Days" },
  { id: "3months", label: "3 Months" },
  { id: "6months", label: "6 Months" },
  { id: "tilldate", label: "Till Date" },
];

export default function BizConnectChart({
  selectedRange: externalRange,
  onRangeChange,
}: BizConnectChartProps = {}) {
  const [internalRange, setInternalRange] = useState<DateRange>("15days");
  const selectedRange = externalRange || internalRange;

  const handleRangeChange = (range: DateRange) => {
    if (onRangeChange) {
      onRangeChange(range);
    } else {
      setInternalRange(range);
    }
  };
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Conditional API calls based on selected range
  const {
    data: data15Days,
    isLoading: loading15Days,
    error: error15Days,
  } = useGetReferralsMonthlyCountQuery(undefined, {
    skip: selectedRange !== "15days",
  });

  const {
    data: data3Months,
    isLoading: loading3Months,
    error: error3Months,
  } = useGetReferrals3MonthCountsQuery(undefined, {
    skip: selectedRange !== "3months",
  });

  const {
    data: data6Months,
    isLoading: loading6Months,
    error: error6Months,
  } = useGetReferrals6MonthCountsQuery(undefined, {
    skip: selectedRange !== "6months",
  });

  const {
    data: dataTillDate,
    isLoading: loadingTillDate,
    error: errorTillDate,
  } = useGetReferralsTillDateCountsQuery(undefined, {
    skip: selectedRange !== "tilldate",
  });

  // Determine current data and loading state
  const getData = () => {
    switch (selectedRange) {
      case "15days":
        return data15Days;
      case "3months":
        return data3Months;
      case "6months":
        return data6Months;
      case "tilldate":
        return dataTillDate;
    }
  };

  const isLoading =
    loading15Days || loading3Months || loading6Months || loadingTillDate;
  const error = error15Days || error3Months || error6Months || errorTillDate;

  // Debug errors
  if (error15Days) console.error("BizConnect 15 Days Error:", error15Days);
  if (error3Months) console.error("BizConnect 3 Months Error:", error3Months);
  if (error6Months) console.error("BizConnect 6 Months Error:", error6Months);
  if (errorTillDate)
    console.error("BizConnect Till Date Error:", errorTillDate);

  const currentData = getData();

  // Get the appropriate data array based on the response structure
  const getDataArray = () => {
    if (currentData?.dailyCounts) return currentData.dailyCounts;
    if (currentData?.fortnightCounts) return currentData.fortnightCounts;
    if (currentData?.monthCounts) return currentData.monthCounts;
    return [];
  };

  const dataArray = getDataArray();

  // Transform API data to chart format - handle different field names
  let chartData = dataArray.map((item: any) => ({
    date: item.day ? item.day.split("-").slice(1).join("/") : item.period || "",
    given: item.given || 0,
    received: item.referrals || 0,
  }));

  // Handle both response structures (Till Date uses different field names)
  const totalGiven =
    currentData?.totalGivenCount || currentData?.totalReferralsGiven || 0;
  const totalReceived =
    currentData?.totalReferralsCount ||
    currentData?.totalReferralsReceived ||
    0;

  // For "Till Date", create a summary chart with totals since there's no daily/period data
  if (
    selectedRange === "tilldate" &&
    chartData.length === 0 &&
    (totalGiven > 0 || totalReceived > 0)
  ) {
    chartData = [
      { date: "Total Given", given: totalGiven, received: 0 },
      { date: "Total Received", given: 0, received: totalReceived },
    ];
  }

  return (
    <div className="bg-white rounded-2xl p-6 lg:p-8 shadow-sm border border-gray-100">
      {/* Chart Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-8">
        <div>
          <p className="text-sm text-gray-500 mb-1">Analytics</p>
          <h2 className="text-2xl font-bold text-gray-900">
            BizConnect Overview
          </h2>
        </div>

        {/* Time Filter Buttons + Create Button */}
        <div className="flex flex-wrap gap-2 mt-4 sm:mt-0">
          {dateFilters.map((filter) => (
            <button
              key={filter.id}
              onClick={() => handleRangeChange(filter.id)}
              className={`px-4 py-2 text-sm rounded-lg font-semibold transition-all ${
                selectedRange === filter.id
                  ? "bg-[#4A62AD] text-white shadow-md"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {filter.label}
            </button>
          ))}
          {/* Create Button */}
          <button
            onClick={() => setIsFormOpen(true)}
            className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-md hover:shadow-lg"
            title="Create BizConnect"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <div
          onClick={() => setIsDetailModalOpen(true)}
          className="bg-gradient-to-br from-blue-50 to-blue-100 px-6 py-4 rounded-xl border border-blue-200 cursor-pointer hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-700 mb-1 font-medium">
                BizConnect Given
              </p>
              <p className="text-3xl font-bold text-blue-900">
                {isLoading ? "..." : totalGiven}
              </p>
            </div>
            <div className="w-12 h-12 rounded-full bg-blue-200 flex items-center justify-center">
              <svg
                className="w-6 h-6 text-blue-700"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </div>
          </div>
        </div>
        <div
          onClick={() => setIsDetailModalOpen(true)}
          className="bg-gradient-to-br from-green-50 to-green-100 px-6 py-4 rounded-xl border border-green-200 cursor-pointer hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-700 mb-1 font-medium">
                BizConnect Received
              </p>
              <p className="text-3xl font-bold text-green-900">
                {isLoading ? "..." : totalReceived}
              </p>
            </div>
            <div className="w-12 h-12 rounded-full bg-green-200 flex items-center justify-center">
              <svg
                className="w-6 h-6 text-green-700"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 17l-5-5m0 0l5-5m-5 5h12"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Chart Container */}
      <div className="mt-6">
        {isLoading ? (
          <div className="h-[400px] flex items-center justify-center bg-gray-50 rounded-xl">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4A62AD] mx-auto mb-4"></div>
              <p className="text-gray-500">Loading chart data...</p>
            </div>
          </div>
        ) : error ? (
          <div className="h-[400px] flex items-center justify-center bg-red-50 rounded-xl border border-red-200">
            <div className="text-center">
              <svg
                className="w-12 h-12 text-red-400 mx-auto mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-red-600 font-medium">
                Failed to load chart data
              </p>
              <p className="text-red-500 text-sm mt-1">
                Please try again later
              </p>
            </div>
          </div>
        ) : chartData.length === 0 ? (
          <div className="h-[400px] flex items-center justify-center bg-gray-50 rounded-xl border border-gray-200">
            <div className="text-center">
              <svg
                className="w-16 h-16 text-gray-300 mx-auto mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
              <p className="text-gray-600 font-medium">No data available</p>
              <p className="text-gray-400 text-sm mt-1">
                Data will appear once you have BizConnect activity
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-gray-50 rounded-xl p-4">
            <ResponsiveContainer width="100%" height={400}>
              <BarChart
                data={chartData}
                barGap={4}
                margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#e5e7eb"
                  vertical={false}
                />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 13, fill: "#6b7280", fontWeight: 500 }}
                  axisLine={{ stroke: "#d1d5db" }}
                  tickLine={{ stroke: "#d1d5db" }}
                />
                <YAxis
                  tick={{ fontSize: 13, fill: "#6b7280", fontWeight: 500 }}
                  axisLine={{ stroke: "#d1d5db" }}
                  tickLine={{ stroke: "#d1d5db" }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #e5e7eb",
                    borderRadius: "12px",
                    padding: "12px 16px",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  }}
                  labelStyle={{
                    fontWeight: "bold",
                    marginBottom: "8px",
                    color: "#111827",
                  }}
                  cursor={{ fill: "rgba(74, 98, 173, 0.05)" }}
                />
                <Legend
                  wrapperStyle={{ paddingTop: "24px" }}
                  iconType="circle"
                  iconSize={10}
                />
                <Bar
                  dataKey="given"
                  fill="#4A62AD"
                  radius={[8, 8, 0, 0]}
                  name="Given"
                  maxBarSize={60}
                  onClick={() => setIsDetailModalOpen(true)}
                  cursor="pointer"
                />
                <Bar
                  dataKey="received"
                  fill="#1DB212"
                  radius={[8, 8, 0, 0]}
                  name="Received"
                  maxBarSize={60}
                  onClick={() => setIsDetailModalOpen(true)}
                  cursor="pointer"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Create BizConnect Form Modal */}
      <CreateBizConnectForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSuccess={() => {
          // Optionally refresh chart data here
          window.location.reload();
        }}
      />

      {/* BizConnect Detail Modal */}
      <BizConnectDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        initialDateRange={selectedRange}
      />
    </div>
  );
}
