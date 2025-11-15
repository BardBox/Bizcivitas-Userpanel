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
  useGetMeetupsMeetingCountQuery,
  useGetMeetups3MonthCountsQuery,
  useGetMeetups6MonthCountsQuery,
  useGetMeetupsAllTimeCountQuery,
} from "../../../../store/api/dashboardApi";
import { Plus } from "lucide-react";
import CreateMeetupForm from "../forms/CreateMeetupForm";
import MeetupsDetailModal from "./MeetupsDetailModal";

type DateRange = "15days" | "3months" | "6months" | "tilldate";

interface DateFilterButton {
  id: DateRange;
  label: string;
}

interface MeetupsChartProps {
  selectedRange?: DateRange;
  onRangeChange?: (range: DateRange) => void;
}

const dateFilters: DateFilterButton[] = [
  { id: "15days", label: "15 Days" },
  { id: "3months", label: "3 Months" },
  { id: "6months", label: "6 Months" },
  { id: "tilldate", label: "Till Date" },
];

export default function MeetupsChart({
  selectedRange: externalRange,
  onRangeChange,
}: MeetupsChartProps = {}) {
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
  } = useGetMeetupsMeetingCountQuery(undefined, {
    skip: selectedRange !== "15days",
  });

  const {
    data: data3Months,
    isLoading: loading3Months,
    error: error3Months,
  } = useGetMeetups3MonthCountsQuery(undefined, {
    skip: selectedRange !== "3months",
  });

  const {
    data: data6Months,
    isLoading: loading6Months,
    error: error6Months,
  } = useGetMeetups6MonthCountsQuery(undefined, {
    skip: selectedRange !== "6months",
  });

  const {
    data: dataTillDate,
    isLoading: loadingTillDate,
    error: errorTillDate,
  } = useGetMeetupsAllTimeCountQuery(undefined, {
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

  const currentData = getData();

  // Debug logging

  // Get the appropriate data array based on the response structure
  const getDataArray = () => {
    if (currentData?.dayWiseData) return currentData.dayWiseData;
    if (currentData?.fortnightCounts) return currentData.fortnightCounts; // Backend uses "Counts" not "Data"
    if (currentData?.monthCounts) return currentData.monthCounts; // Backend uses "Counts" not "Data"
    return [];
  };

  const dataArray = getDataArray();

  // Transform API data to chart format - handle different field names
  let chartData = dataArray.map((item: any) => ({
    date: item.date ? item.date.split("-").slice(1).join("/") : item.period || "",
    count: item.count || 0,
  }));

  // Handle different field names from backend (tilldate uses totalMeetupCount)

  const totalCount =
    selectedRange === "15days"
      ? currentData?.last15DaysMeetupCount || 0
      : currentData?.totalMeetupCount || currentData?.allTimeCount || 0;


  // For "Till Date", create a summary chart with total since there's no daily/period data
  if (selectedRange === "tilldate" && chartData.length === 0 && totalCount > 0) {
    chartData = [{ date: "Total Meetups", count: totalCount }];
  }

  return (
    <div className="bg-white rounded-2xl p-6 lg:p-8 shadow-sm border border-gray-100">
      {/* Chart Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-8">
        <div>
          <p className="text-sm text-gray-500 mb-1">Analytics</p>
          <h2 className="text-2xl font-bold text-gray-900">
            Meetups Overview
          </h2>
        </div>

        {/* Time Filter Buttons + Create Button */}
        <div className="flex flex-col gap-2 mt-4 sm:mt-0 w-full sm:w-auto">
          {/* Date Filter Buttons */}
          <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2">
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
          </div>
          {/* Create Button - Full width on mobile */}
          <button
            onClick={() => setIsFormOpen(true)}
            className="w-full sm:w-auto sm:px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all shadow-md hover:shadow-lg flex items-center justify-center"
            title="Create Meetup"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Stats Card */}
      <div className="mb-8">
        <div
          onClick={() => setIsDetailModalOpen(true)}
          className="bg-gradient-to-br from-purple-50 to-purple-100 px-6 py-4 rounded-xl border border-purple-200 cursor-pointer hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-700 mb-1 font-medium">Total Meetups</p>
              <p className="text-3xl font-bold text-purple-900">
                {isLoading ? "..." : totalCount}
              </p>
            </div>
            <div className="w-12 h-12 rounded-full bg-purple-200 flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
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
              <svg className="w-12 h-12 text-red-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-red-600 font-medium">Failed to load chart data</p>
              <p className="text-red-500 text-sm mt-1">Please try again later</p>
            </div>
          </div>
        ) : chartData.length === 0 ? (
          <div className="h-[400px] flex items-center justify-center bg-gray-50 rounded-xl border border-gray-200">
            <div className="text-center">
              <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <p className="text-gray-600 font-medium">No meetups yet</p>
              <p className="text-gray-400 text-sm mt-1">Data will appear once you create meetups</p>
            </div>
          </div>
        ) : (
          <div className="bg-gray-50 rounded-xl">
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={chartData} margin={{ top: 20, right: 5, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 13, fill: "#6b7280", fontWeight: 500 }}
                  axisLine={{ stroke: "#d1d5db" }}
                  tickLine={{ stroke: "#d1d5db" }}
                />
                <YAxis
                  label={{
                    value: "(no of meetups)",
                    angle: -90,
                    position: "insideLeft",
                    style: { fontSize: 12, fill: "#6b7280" },
                  }}
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
                  labelStyle={{ fontWeight: "bold", marginBottom: "8px", color: "#111827" }}
                  cursor={{ fill: "rgba(74, 98, 173, 0.05)" }}
                />
                <Legend
                  wrapperStyle={{ paddingTop: "24px" }}
                  iconType="circle"
                  iconSize={10}
                />
                <Bar
                  dataKey="count"
                  fill="#7C3AED"
                  radius={[8, 8, 0, 0]}
                  name="Meetups"
                  maxBarSize={60}
                  onClick={() => setIsDetailModalOpen(true)}
                  cursor="pointer"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Create Meetup Form Modal */}
      <CreateMeetupForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSuccess={() => window.location.reload()}
      />

      {/* Meetups Detail Modal */}
      <MeetupsDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        initialDateRange={selectedRange}
      />
    </div>
  );
}
