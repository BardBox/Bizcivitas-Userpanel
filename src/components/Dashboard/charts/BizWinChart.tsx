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
  useGetRecordCustomRangeQuery,
} from "../../../../store/api/dashboardApi";
import { Plus } from "lucide-react";
import CreateBizWinForm from "../forms/CreateBizWinForm";
import BizWinDetailModal from "./BizWinDetailModal";

type DateRange = "15days" | "3months" | "6months" | "tilldate" | "custom";

interface DateFilterButton {
  id: DateRange;
  label: string;
}

interface BizWinChartProps {
  selectedRange?: DateRange;
  onRangeChange?: (range: DateRange) => void;
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

export default function BizWinChart({
  selectedRange: externalRange,
  onRangeChange,
}: BizWinChartProps = {}) {
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
  const [selectedTab, setSelectedTab] = useState<"given" | "received">("given");

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

  const {
    data: dataCustomRange,
    isLoading: loadingCustomRange,
    error: errorCustomRange,
  } = useGetRecordCustomRangeQuery(
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

  // Debug errors
  if (error15Days) console.error('❌ BizWin 15 Days Error:', error15Days);
  if (error3Months) console.error('❌ BizWin 3 Months Error:', error3Months);
  if (error6Months) console.error('❌ BizWin 6 Months Error:', error6Months);
  if (errorTillDate) console.error('❌ BizWin Till Date Error:', errorTillDate);

  const currentData = getData();

  // Get the appropriate data array based on the response structure
  const getDataArray = () => {
    if (currentData?.dailySums) return currentData.dailySums;
    if (currentData?.fortnightSums) return currentData.fortnightSums;
    if (currentData?.monthSums) return currentData.monthSums;
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
      given: item.totalGiven || 0,
      received: item.totalReceived || 0,
    };
  });

  // For 3 months view, aggregate fortnight data into monthly data
  if (selectedRange === "3months" && chartData.length > 0) {
    const monthlyData: Record<string, { given: number; received: number }> = {};

    chartData.forEach((item) => {
      if (!monthlyData[item.date]) {
        monthlyData[item.date] = { given: 0, received: 0 };
      }
      monthlyData[item.date].given += item.given;
      monthlyData[item.date].received += item.received;
    });

    chartData = Object.entries(monthlyData).map(([date, values]) => ({
      date,
      given: values.given,
      received: values.received,
    }));
  }

  // Calculate totals - either from API or sum from data
  // Note: Till Date endpoint uses "totalGivenAmount" and "totalReceivedAmount" field names
  const totalGiven = currentData?.overallGiven || currentData?.totalGiven || currentData?.totalGivenAmount ||
    chartData.reduce((sum, item) => sum + item.given, 0);
  const totalReceived = currentData?.overallReceived || currentData?.totalReceived || currentData?.totalReceivedAmount ||
    chartData.reduce((sum, item) => sum + item.received, 0);


  // For "Till Date", create a summary chart with totals since there's no daily/period data
  if (selectedRange === "tilldate" && chartData.length === 0 && (totalGiven > 0 || totalReceived > 0)) {
    chartData = [
      { date: "Total Given", given: totalGiven, received: 0 },
      { date: "Total Received", given: 0, received: totalReceived },
    ];
  }

  return (
    <div className="bg-white rounded-2xl p-3 md:p-6 lg:p-8 shadow-sm border border-gray-100">
      {/* Chart Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <h3 className="text-xl font-bold text-gray-900">
          BizWin Overview (TYFCB)
        </h3>

        <div className="flex flex-wrap items-center gap-3">
          <div className="grid grid-cols-2 sm:flex sm:items-center gap-1 bg-gray-50 p-1 rounded-xl border border-gray-100 w-full sm:w-auto">
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
            onClick={() => setIsFormOpen(true)}
            className="w-9 h-9 bg-[#4A62AD] text-white rounded-full hover:bg-[#3a4d8a] transition-all shadow-md hover:shadow-lg flex items-center justify-center flex-shrink-0"
            title="Create BizWin"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <div
          onClick={() => {
            setSelectedTab("given");
            setIsDetailModalOpen(true);
          }}
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
          onClick={() => {
            setSelectedTab("received");
            setIsDetailModalOpen(true);
          }}
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
          <div className="bg-gray-50 rounded-xl">
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={chartData} barGap={4} margin={{ top: 20, right: 5, left: -20, bottom: 20 }}>
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
        initialTab={selectedTab}
        initialDateRange={selectedRange}
      />
    </div>
  );
}
