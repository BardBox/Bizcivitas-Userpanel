"use client";

import { useGridConfig } from "@/hooks/useGridLayout";

/**
 * Debug component to show current grid configuration
 * Add this temporarily to see how the layout adapts to screen size
 * Usage: <LayoutDebugger />
 */
export default function LayoutDebugger() {
  const config = useGridConfig();

  return (
    <div className="fixed bottom-4 right-4 bg-black/80 text-white p-3 rounded-lg text-xs font-mono z-50 shadow-lg">
      <div className="space-y-1">
        <div className="font-bold text-green-400">Grid Layout Info</div>
        <div>Breakpoint: <span className="text-yellow-400">{config.breakpoint}</span></div>
        <div>Columns: <span className="text-blue-400">{config.columns}</span></div>
        <div>Rows: <span className="text-blue-400">{config.rows}</span></div>
        <div>Items/Page: <span className="text-orange-400">{config.itemsPerPage}</span></div>
        <div className="text-gray-400 text-[10px] pt-1">
          {config.columns} × {config.rows} = {config.itemsPerPage}
        </div>
      </div>
    </div>
  );
}
