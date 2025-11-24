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
  useGetMeetingsCustomRangeQuery,
} from "../../../../store/api/dashboardApi";
import { Plus } from "lucide-react";
import VisitorInvitationDetailModal from "./VisitorInvitationDetailModal";
import CreateVisitorInvitationForm from "../forms/CreateVisitorInvitationForm";

type DateRange = "15days" | "3months" | "6months" | "tilldate" | "custom";

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

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

  // Custom date range state
  const getDefaultDates = () => {
    const endDate = new Date().toISOString().split("T")[0];
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 15);
    return {
      start: startDate.toISOString().split("T")[0],
      end: endDate,
    };
  };

  const [customDateRange, setCustomDateRange] = useState(getDefaultDates());

  // Conditional API calls based on selected range
  const {
    data: data15Days,
    isLoading: loading15Days,
    error: error15Days,
    refetch: refetch15Days,
  } = useGetMeetingsLast15DaysInvitedCountQuery(undefined, {
    skip: selectedRange !== "15days",
  });

  const {
    data: data3Months,
    isLoading: loading3Months,
    error: error3Months,
    refetch: refetch3Months,
  } = useGetMeetings3MonthFortnightInvitedCountQuery(undefined, {
    skip: selectedRange !== "3months",
  });

  const {
    data: data6Months,
    isLoading: loading6Months,
    error: error6Months,
    refetch: refetch6Months,
  } = useGetMeetings6MonthInvitedCountQuery(undefined, {
    skip: selectedRange !== "6months",
  });

  const {
    data: dataTillDate,
    isLoading: loadingTillDate,
    error: errorTillDate,
    refetch: refetchTillDate,
  } = useGetMeetingsAllTimeInvitedPeopleCountQuery(undefined, {
    skip: selectedRange !== "tilldate",
  });

  const {
    data: dataCustomRange,
    isLoading: loadingCustomRange,
    error: errorCustomRange,
    refetch: refetchCustomRange,
  } = useGetMeetingsCustomRangeQuery(
    {
      startDate: customDateRange.start,
      endDate: customDateRange.end,
    },
    {
      skip: selectedRange !== "custom",
    }
  );

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
      case "custom":
        return dataCustomRange;
    }
  };

  const isLoading =
    loading15Days || loading3Months || loading6Months || loadingTillDate || loadingCustomRange;
  const error = error15Days || error3Months || error6Months || errorTillDate || errorCustomRange;

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
  let chartData = dataArray.map((item: any, index: number) => {
    let dateLabel = item.date
      ? item.date.split("-").slice(1).join("/")
      : item.period || "";

    // Clean up labels for better readability
    if (!item.date && item.period) {
      const cleanPeriod = item.period.replace(/^(Fortnight \d+|Month): /, "");

      if (selectedRange === "3months" || selectedRange === "6months") {
        // Attempt to parse date to show Month Name
        const match = cleanPeriod.match(/(\d{4})-(\d{2})/);
        if (match) {
          const year = parseInt(match[1]);
          const month = parseInt(match[2]) - 1;
          const date = new Date(year, month, 1);
          dateLabel = date.toLocaleString("default", { month: "long" });
        } else {
          dateLabel = cleanPeriod;
        }
      } else {
        dateLabel = cleanPeriod;
      }
    }

    return {
      date: dateLabel,
      count: item.count || 0,
    };
  });

  // For 3 months view, aggregate fortnight data into monthly data
  if (selectedRange === "3months" && chartData.length > 0) {
    const monthlyData: Record<string, { count: number }> = {};

    chartData.forEach((item) => {
      if (!monthlyData[item.date]) {
        monthlyData[item.date] = { count: 0 };
      }
      monthlyData[item.date].count += item.count;
    });

    chartData = Object.entries(monthlyData).map(([date, values]) => ({
      date,
      count: values.count,
    }));
  }

  // Handle different field names from backend (tilldate uses totalInvitedPeopleCount)
  // Calculate total from chart data if not provided by API
  const apiTotalCount =
    selectedRange === "15days"
      ? currentData?.last15DaysCount
      : currentData?.allTimeCount || currentData?.totalInvitedPeopleCount;

  const totalCount = apiTotalCount !== undefined
    ? apiTotalCount
    : chartData.reduce((sum, item) => sum + item.count, 0);


  // For "Till Date", create a summary chart with total since there's no daily/period data
  if (selectedRange === "tilldate" && chartData.length === 0 && totalCount > 0) {
    chartData = [{ date: "Total Invitations", count: totalCount }];
  }

  return (
    <div className="bg-white rounded-2xl p-3 md:p-6 lg:p-8 shadow-sm border border-gray-100">
      {/* Chart Header */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 mb-6">
        <h3 className="text-xl font-bold text-gray-900">
          Visitor Invitation Overview
        </h3>

        <div className="flex flex-wrap items-center gap-3">
          <div className="grid grid-cols-2 xl:flex xl:items-center gap-1 bg-gray-50 p-1 rounded-xl border border-gray-100 w-full xl:w-auto">
            {dateFilters.map((filter) => (
              <button
                key={filter.id}
                onClick={() => handleRangeChange(filter.id)}
                className={`px-2 py-1.5 text-xs sm:text-sm rounded-lg font-medium transition-all whitespace-nowrap flex justify-center ${selectedRange === filter.id
                  ? "bg-[#4A62AD] text-white shadow-sm"
                  : "text-gray-500 hover:bg-gray-200 hover:text-gray-700"
                  }`}
              >
                {filter.label}
              </button>
            ))}
          </div>

          {/* Create Button */}
          <button
            onClick={() => setIsInviteModalOpen(true)}
            className="w-9 h-9 bg-[#4A62AD] text-white rounded-full hover:bg-[#3a4d8a] transition-all shadow-md hover:shadow-lg flex items-center justify-center flex-shrink-0"
            title="Create Visitor Invitation"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Stats Card */}
      <div className="mb-8">
        <div
          onClick={() => setIsDetailModalOpen(true)}
          className="bg-gradient-to-br from-blue-50 to-blue-100 px-4 py-4 rounded-xl border border-blue-200 cursor-pointer hover:shadow-lg transition-shadow max-w-sm"
        >
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm text-blue-700 mb-1 font-medium">Total Invitations</p>
              <p className="text-3xl font-bold text-blue-900">
                {isLoading ? "..." : totalCount}
              </p>
            </div>
            <div className="w-12 h-12 rounded-full bg-blue-200 flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                  fill="#4A62AD"
                  radius={[8, 8, 0, 0]}
                  name="Invitations"
                  maxBarSize={60}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Visitor Invitation Detail Modal */}
      <VisitorInvitationDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        initialDateRange={selectedRange}
      />

      {/* Create Visitor Invitation Form */}
      <CreateVisitorInvitationForm
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        onSuccess={() => {
          // Refetch data based on current range
          if (selectedRange === "15days") refetch15Days();
          if (selectedRange === "3months") refetch3Months();
          if (selectedRange === "6months") refetch6Months();
          if (selectedRange === "tilldate") refetchTillDate();
          if (selectedRange === "custom") refetchCustomRange();
        }}
      />
    </div>
  );
}
