export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-gray-50 md:rounded-3xl">
      <div className="max-w-[1400px] mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 md:py-6 space-y-3 md:space-y-4 md:mt-8 lg:mt-12">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between mb-2">
          <div className="h-8 md:h-10 lg:h-12 w-48 bg-gray-200 animate-pulse rounded" />
        </div>

        {/* Dashboard Cards Grid Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-3 md:gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-white rounded-lg shadow-sm p-4 md:p-6 border border-gray-100"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 animate-pulse rounded w-3/4 mb-2" />
                  <div className="h-8 bg-gray-200 animate-pulse rounded w-1/2 mt-2" />
                </div>
                <div className="w-10 h-10 bg-gray-200 animate-pulse rounded-full" />
              </div>
            </div>
          ))}
        </div>

        {/* Chart Section Skeleton */}
        <div className="mt-3 md:mt-4">
          <div className="bg-white rounded-lg shadow-sm p-4 md:p-6 border border-gray-100">
            {/* Chart Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="h-6 w-32 bg-gray-200 animate-pulse rounded" />
              <div className="flex gap-2">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="h-8 w-20 bg-gray-200 animate-pulse rounded"
                  />
                ))}
              </div>
            </div>

            {/* Chart Stats Badges */}
            <div className="flex gap-2 mb-4 flex-wrap">
              <div className="h-8 w-32 bg-gray-200 animate-pulse rounded-full" />
              <div className="h-8 w-32 bg-gray-200 animate-pulse rounded-full" />
            </div>

            {/* Chart Area */}
            <div className="h-64 md:h-80 bg-gray-100 animate-pulse rounded flex items-center justify-center">
              <div className="text-gray-400 text-sm">Loading chart...</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}