import { ChartData } from './data/dashboard-data';

interface DashboardChartProps {
  data: ChartData[];
  className?: string;
}

export default function DashboardChart({ data, className = "" }: DashboardChartProps) {
  // Generate dummy SVG chart as placeholder
  const maxValue = Math.max(...data.map(d => Math.max(d.given, d.received)));
  const chartHeight = 200;
  const chartWidth = 600;
  
  const givenPoints = data.map((d, i) => {
    const x = (i / (data.length - 1)) * chartWidth;
    const y = chartHeight - (d.given / maxValue) * chartHeight;
    return `${x},${y}`;
  }).join(' ');
  
  const receivedPoints = data.map((d, i) => {
    const x = (i / (data.length - 1)) * chartWidth;
    const y = chartHeight - (d.received / maxValue) * chartHeight;
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className={`bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100 ${className}`}>
      {/* Chart Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
            Fortnight Overview:
          </h2>
          <h3 className="text-base sm:text-lg font-medium text-dashboard-primary">
            BizConnect
          </h3>
        </div>
        
        {/* Time Filter Buttons */}
        <div className="flex flex-wrap gap-2 mt-4 sm:mt-0">
          <button className="px-3 py-1.5 bg-dashboard-orange text-white text-sm rounded-md font-medium">
            14 Days
          </button>
          <button className="px-3 py-1.5 bg-gray-100 text-gray-600 text-sm rounded-md font-medium hover:bg-gray-200">
            6 Months
          </button>
          <button className="px-3 py-1.5 bg-gray-100 text-gray-600 text-sm rounded-md font-medium hover:bg-gray-200">
            1 Year
          </button>
          <button className="px-3 py-1.5 bg-gray-100 text-gray-600 text-sm rounded-md font-medium hover:bg-gray-200">
            Till date
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-dashboard-primary"></div>
          <span className="text-sm text-gray-600 font-medium">Given</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
          <span className="text-sm text-gray-600 font-medium">Received</span>
        </div>
      </div>

      {/* Chart Container */}
      <div className="relative overflow-x-auto">
        <div className="min-w-[600px] h-[250px] sm:h-[300px]">
          <svg width="100%" height="100%" viewBox={`0 0 ${chartWidth} ${chartHeight + 40}`} className="w-full h-full">
            {/* Grid lines */}
            {[0, 20, 40, 60, 80, 100].map((value, i) => {
              const y = chartHeight - (value / 100) * chartHeight;
              return (
                <g key={i}>
                  <line
                    x1="0"
                    y1={y}
                    x2={chartWidth}
                    y2={y}
                    stroke="#f3f4f6"
                    strokeWidth="1"
                  />
                  <text
                    x="-10"
                    y={y + 4}
                    fill="#9ca3af"
                    fontSize="12"
                    textAnchor="end"
                  >
                    {value}
                  </text>
                </g>
              );
            })}
            
            {/* Date labels */}
            {data.map((d, i) => {
              const x = (i / (data.length - 1)) * chartWidth;
              return (
                <text
                  key={i}
                  x={x}
                  y={chartHeight + 20}
                  fill="#9ca3af"
                  fontSize="12"
                  textAnchor="middle"
                >
                  {d.date}
                </text>
              );
            })}
            
            {/* Chart lines */}
            <polyline
              points={givenPoints}
              fill="none"
              stroke="#4A62AD"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <polyline
              points={receivedPoints}
              fill="none"
              stroke="#22c55e"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            
            {/* Data points */}
            {data.map((d, i) => {
              const x = (i / (data.length - 1)) * chartWidth;
              const yGiven = chartHeight - (d.given / maxValue) * chartHeight;
              const yReceived = chartHeight - (d.received / maxValue) * chartHeight;
              
              return (
                <g key={i}>
                  <circle cx={x} cy={yGiven} r="4" fill="#4A62AD" />
                  <circle cx={x} cy={yReceived} r="4" fill="#22c55e" />
                </g>
              );
            })}
            
            {/* Fill areas */}
            <polygon
              points={`0,${chartHeight} ${givenPoints} ${chartWidth},${chartHeight}`}
              fill="#4A62AD"
              fillOpacity="0.1"
            />
            <polygon
              points={`0,${chartHeight} ${receivedPoints} ${chartWidth},${chartHeight}`}
              fill="#22c55e"
              fillOpacity="0.1"
            />
          </svg>
        </div>
      </div>

      {/* Current Stats */}
      <div className="mt-6 flex items-center justify-between bg-gray-50 rounded-lg p-4">
        <div className="text-center">
          <div className="text-2xl sm:text-3xl font-bold text-dashboard-primary">05</div>
          <div className="text-sm text-gray-600 mt-1">June 21, 2023</div>
        </div>
        <div className="w-px h-12 bg-gray-300"></div>
        <div className="flex items-center gap-2">
          <button className="p-2 bg-white rounded-full shadow-sm border border-gray-200">
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
