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
  useGetMeetingsLast15DaysInvitedCountQuery,
  useGetMeetings3MonthFortnightInvitedCountQuery,
  useGetMeetings6MonthInvitedCountQuery,
  useGetMeetingsAllTimeInvitedPeopleCountQuery,
} from "../../../../store/api/dashboardApi";
import { Plus } from "lucide-react";

type DateRange = "15days" | "3months" | "6months" | "tilldate";

interface DateFilterButton {
  id: DateRange;
  label: string;
}

interface VisitorInvitationChartProps {
  selectedRange?: DateRange;
  onRangeChange?: (range: DateRange) => void;
}

const dateFilters: DateFilterButton[] = [
  { id: "15days", label: "15 Days" },
  { id: "3months", label: "3 Months" },
  { id: "6months", label: "6 Months" },
  { id: "tilldate", label: "Till Date" },
];

export default function VisitorInvitationChart({
  selectedRange: externalRange,
  onRangeChange,
}: VisitorInvitationChartProps = {}) {
  const [internalRange, setInternalRange] = useState<DateRange>("15days");
  const selectedRange = externalRange || internalRange;

  const handleRangeChange = (range: DateRange) => {
    if (onRangeChange) {
      onRangeChange(range);
    } else {
      setInternalRange(range);
    }
  };

  // Conditional API calls based on selected range
  const {
    data: data15Days,
    isLoading: loading15Days,
    error: error15Days,
  } = useGetMeetingsLast15DaysInvitedCountQuery(undefined, {
    skip: selectedRange !== "15days",
  });

  const {
    data: data3Months,
    isLoading: loading3Months,
    error: error3Months,
  } = useGetMeetings3MonthFortnightInvitedCountQuery(undefined, {
    skip: selectedRange !== "3months",
  });

  const {
    data: data6Months,
    isLoading: loading6Months,
    error: error6Months,
  } = useGetMeetings6MonthInvitedCountQuery(undefined, {
    skip: selectedRange !== "6months",
  });

  const {
    data: dataTillDate,
    isLoading: loadingTillDate,
    error: errorTillDate,
  } = useGetMeetingsAllTimeInvitedPeopleCountQuery(undefined, {
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
  console.log('🟠 Visitor Chart - Selected Range:', selectedRange);
  console.log('🟠 Visitor Chart - Current Data:', currentData);
  console.log('🟠 Visitor Chart - 15 Days Data:', data15Days);
  console.log('🟠 Visitor Chart - 3 Months Data:', data3Months);
  console.log('🟠 Visitor Chart - 6 Months Data:', data6Months);
  console.log('🟠 Visitor Chart - Till Date Data:', dataTillDate);

  // Get the appropriate data array based on the response structure
  const getDataArray = () => {
    if (currentData?.dayWiseData) return currentData.dayWiseData;
    if (currentData?.fortnightCounts) return currentData.fortnightCounts; // Backend uses "Counts" not "Data"
    if (currentData?.monthCounts) return currentData.monthCounts; // Backend uses "Counts" not "Data"
    return [];
  };

  const dataArray = getDataArray();
  console.log('🟠 Visitor Chart - Data Array:', dataArray);

  // Transform API data to chart format - handle different field names
  let chartData = dataArray.map((item: any) => ({
    date: item.date ? item.date.split("-").slice(1).join("/") : item.period || "",
    count: item.count || 0,
  }));

  // Handle different field names from backend (tilldate uses totalInvitedPeopleCount)
  const totalCount =
    selectedRange === "15days"
      ? currentData?.last15DaysCount || 0
      : currentData?.allTimeCount || currentData?.totalInvitedPeopleCount || 0;

  console.log('🟠 Visitor Chart - Total Count:', totalCount);
  console.log('🟠 Visitor Chart - Chart Data:', chartData);

  // For "Till Date", create a summary chart with total since there's no daily/period data
  if (selectedRange === "tilldate" && chartData.length === 0 && totalCount > 0) {
    chartData = [{ date: "Total Invitations", count: totalCount }];
  }

  return (
    <div className="bg-white rounded-2xl p-6 lg:p-8 shadow-sm border border-gray-100">
      {/* Chart Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-8">
        <div>
          <p className="text-sm text-gray-500 mb-1">Analytics</p>
          <h2 className="text-2xl font-bold text-gray-900">
            Visitor Invitation Overview
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
          <button
            onClick={() => alert("Visitor Invitation form coming soon!")}
            className="p-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-all shadow-md hover:shadow-lg"
            title="Create Visitor Invitation"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Stats Card */}
      <div className="mb-8">
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 px-6 py-4 rounded-xl border border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-orange-700 mb-1 font-medium">Total Invitations</p>
              <p className="text-3xl font-bold text-orange-900">
                {isLoading ? "..." : totalCount}
              </p>
            </div>
            <div className="w-12 h-12 rounded-full bg-orange-200 flex items-center justify-center">
              <svg className="w-6 h-6 text-orange-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
              <p className="text-gray-600 font-medium">No invitations yet</p>
              <p className="text-gray-400 text-sm mt-1">Data will appear once you invite visitors</p>
            </div>
          </div>
        ) : (
          <div className="bg-gray-50 rounded-xl p-4">
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 13, fill: "#6b7280", fontWeight: 500 }}
                  axisLine={{ stroke: "#d1d5db" }}
                  tickLine={{ stroke: "#d1d5db" }}
                />
                <YAxis
                  label={{
                    value: "(no of invitations)",
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
                  fill="#EA580C"
                  radius={[8, 8, 0, 0]}
                  name="Invitations"
                  maxBarSize={60}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
