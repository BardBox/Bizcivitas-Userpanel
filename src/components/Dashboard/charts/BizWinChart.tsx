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
  useGetRecordLast15DaysCountsQuery,
  useGetRecord3MonthCountsQuery,
  useGetRecord6MonthCountsQuery,
  useGetRecordTillDateAmountsQuery,
} from "../../../../store/api/dashboardApi";
import { Plus } from "lucide-react";
import CreateBizWinForm from "../forms/CreateBizWinForm";
import BizWinDetailModal from "./BizWinDetailModal";

type DateRange = "15days" | "3months" | "6months" | "tilldate";

interface DateFilterButton {
  id: DateRange;
  label: string;
}

const dateFilters: DateFilterButton[] = [
  { id: "15days", label: "15 Days" },
  { id: "3months", label: "3 Months" },
  { id: "6months", label: "6 Months" },
  { id: "tilldate", label: "Till Date" },
];

// Currency formatting function
function formatCurrency(value: number): string {
  if (value >= 10000000) {
    return `₹${(value / 10000000).toFixed(2)} Cr`;
  } else if (value >= 100000) {
    return `₹${(value / 100000).toFixed(2)} L`;
  } else if (value >= 1000) {
    return `₹${(value / 1000).toFixed(2)} K`;
  }
  return `₹${value.toFixed(2)}`;
}

export default function BizWinChart() {
  const [selectedRange, setSelectedRange] = useState<DateRange>("15days");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Conditional API calls based on selected range
  const {
    data: data15Days,
    isLoading: loading15Days,
    error: error15Days,
  } = useGetRecordLast15DaysCountsQuery(undefined, {
    skip: selectedRange !== "15days",
  });

  const {
    data: data3Months,
    isLoading: loading3Months,
    error: error3Months,
  } = useGetRecord3MonthCountsQuery(undefined, {
    skip: selectedRange !== "3months",
  });

  const {
    data: data6Months,
    isLoading: loading6Months,
    error: error6Months,
  } = useGetRecord6MonthCountsQuery(undefined, {
    skip: selectedRange !== "6months",
  });

  const {
    data: dataTillDate,
    isLoading: loadingTillDate,
    error: errorTillDate,
  } = useGetRecordTillDateAmountsQuery(undefined, {
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
  if (error15Days) console.error('❌ BizWin 15 Days Error:', error15Days);
  if (error3Months) console.error('❌ BizWin 3 Months Error:', error3Months);
  if (error6Months) console.error('❌ BizWin 6 Months Error:', error6Months);
  if (errorTillDate) console.error('❌ BizWin Till Date Error:', errorTillDate);

  const currentData = getData();

  // Debug logging
  console.log('🔵 BizWin Chart - Selected Range:', selectedRange);
  console.log('🔵 BizWin Chart - Current Data:', currentData);
  console.log('🔵 BizWin Chart - 15 Days Data:', data15Days);
  console.log('🔵 BizWin Chart - 3 Months Data:', data3Months);
  console.log('🔵 BizWin Chart - 6 Months Data:', data6Months);
  console.log('🔵 BizWin Chart - Till Date Data:', dataTillDate);

  // Get the appropriate data array based on the response structure
  const getDataArray = () => {
    if (currentData?.dailySums) return currentData.dailySums;
    if (currentData?.fortnightSums) return currentData.fortnightSums;
    if (currentData?.monthSums) return currentData.monthSums;
    return [];
  };

  const dataArray = getDataArray();

  // Transform API data to chart format - handle different field names
  let chartData = dataArray.map((item: any) => ({
    date: item.date ? item.date.split("-").slice(1).join("/") : item.period || "",
    given: item.totalGiven || 0,
    received: item.totalReceived || 0,
  }));

  // Calculate totals - either from API or sum from data
  // Note: Till Date endpoint uses "totalGivenAmount" and "totalReceivedAmount" field names
  const totalGiven = currentData?.overallGiven || currentData?.totalGiven || currentData?.totalGivenAmount ||
    chartData.reduce((sum, item) => sum + item.given, 0);
  const totalReceived = currentData?.overallReceived || currentData?.totalReceived || currentData?.totalReceivedAmount ||
    chartData.reduce((sum, item) => sum + item.received, 0);

  console.log('🔵 BizWin Chart - Total Given:', totalGiven);
  console.log('🔵 BizWin Chart - Total Received:', totalReceived);
  console.log('🔵 BizWin Chart - Chart Data Length:', chartData.length);

  // For "Till Date", create a summary chart with totals since there's no daily/period data
  if (selectedRange === "tilldate" && chartData.length === 0 && (totalGiven > 0 || totalReceived > 0)) {
    console.log('✅ BizWin Chart - Creating Till Date summary chart');
    chartData = [
      { date: "Total Given", given: totalGiven, received: 0 },
      { date: "Total Received", given: 0, received: totalReceived },
    ];
  } else if (selectedRange === "tilldate" && chartData.length === 0) {
    console.log('❌ BizWin Chart - Till Date has NO DATA (totalGiven:', totalGiven, 'totalReceived:', totalReceived, ')');
  }

  return (
    <div className="bg-white rounded-2xl p-6 lg:p-8 shadow-sm border border-gray-100">
      {/* Chart Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-8">
        <div>
          <p className="text-sm text-gray-500 mb-1">Analytics</p>
          <h2 className="text-2xl font-bold text-gray-900">
            BizWin Overview (TYFCB)
          </h2>
        </div>

        {/* Time Filter Buttons + Create Button */}
        <div className="flex flex-wrap gap-2 mt-4 sm:mt-0">
          {dateFilters.map((filter) => (
            <button
              key={filter.id}
              onClick={() => setSelectedRange(filter.id)}
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
            className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all shadow-md hover:shadow-lg"
            title="Create BizWin"
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
              <p className="text-sm text-blue-700 mb-1 font-medium">BizWin Given</p>
              <p className="text-3xl font-bold text-blue-900">
                {isLoading ? "..." : formatCurrency(totalGiven)}
              </p>
            </div>
            <div className="w-12 h-12 rounded-full bg-blue-200 flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
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
              <p className="text-sm text-green-700 mb-1 font-medium">BizWin Received</p>
              <p className="text-3xl font-bold text-green-900">
                {isLoading ? "..." : formatCurrency(totalReceived)}
              </p>
            </div>
            <div className="w-12 h-12 rounded-full bg-green-200 flex items-center justify-center">
              <svg className="w-6 h-6 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-gray-600 font-medium">No data available</p>
              <p className="text-gray-400 text-sm mt-1">Data will appear once you have BizWin transactions</p>
            </div>
          </div>
        ) : (
          <div className="bg-gray-50 rounded-xl p-4">
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={chartData} barGap={4} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
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
                  tickFormatter={(value) => formatCurrency(value)}
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
                  formatter={(value: number) => formatCurrency(value)}
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

      {/* Create BizWin Form Modal */}
      <CreateBizWinForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSuccess={() => {
          window.location.reload();
        }}
      />

      {/* BizWin Detail Modal */}
      <BizWinDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        initialDateRange={selectedRange}
      />
    </div>
  );
}
