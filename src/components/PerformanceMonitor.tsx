"use client";

import React, { useEffect, useState, memo } from "react";
import { usePerformanceOptimization } from "@/hooks/usePerformanceOptimization";

interface PerformanceStats {
  renderCount: number;
  lastRenderTime: number;
  apiCalls: number;
  slowApiCalls: number;
  memoryUsage?: number;
}

const PerformanceMonitor = memo(function PerformanceMonitor() {
  const [stats, setStats] = useState<PerformanceStats>({
    renderCount: 0,
    lastRenderTime: 0,
    apiCalls: 0,
    slowApiCalls: 0,
  });
  const [isVisible, setIsVisible] = useState(false);
  const [networkLogs, setNetworkLogs] = useState<string[]>([]);
  const { getPerformanceStats } = usePerformanceOptimization();

  // Track renders using ref (no state updates to avoid infinite loop)
  const renderCountRef = React.useRef(0);
  renderCountRef.current += 1;

  // Monitor API calls
  useEffect(() => {
    // Intercept fetch
    const originalFetch = window.fetch;
    let apiCallCount = 0;
    let slowCallCount = 0;

    window.fetch = async (...args) => {
      const startTime = performance.now();
      const url = args[0]?.toString() || "Unknown URL";


      try {
        const response = await originalFetch(...args);
        const endTime = performance.now();
        const duration = endTime - startTime;

        apiCallCount++;

        if (duration > 1000) {
          slowCallCount++;
          console.warn(`⚠️ SLOW API Call (${duration.toFixed(0)}ms): ${url}`);
          setNetworkLogs((prev) => [
            ...prev.slice(-9),
            `🐌 ${duration.toFixed(0)}ms: ${url.substring(0, 50)}`,
          ]);
        } else {
          setNetworkLogs((prev) => [
            ...prev.slice(-9),
            `✅ ${duration.toFixed(0)}ms: ${url.substring(0, 50)}`,
          ]);
        }

        setStats((prev) => ({
          ...prev,
          apiCalls: apiCallCount,
          slowApiCalls: slowCallCount,
        }));

        return response;
      } catch (error) {
        console.error(`❌ API Error: ${url}`, error);
        setNetworkLogs((prev) => [
          ...prev.slice(-9),
          `❌ Error: ${url.substring(0, 50)}`,
        ]);
        throw error;
      }
    };

    // Monitor memory (if available)
    const memoryInterval = setInterval(() => {
      if ((performance as any).memory) {
        setStats((prev) => ({
          ...prev,
          memoryUsage: Math.round((performance as any).memory.usedJSHeapSize / 1024 / 1024),
        }));
      }
    }, 5000);

    return () => {
      window.fetch = originalFetch;
      clearInterval(memoryInterval);
    };
  }, []);

  // Only show in development
  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  return (
    <div
      className={`fixed bottom-4 right-4 z-50 bg-white border border-gray-300 rounded-lg shadow-lg p-4 max-w-sm ${
        isVisible ? "block" : "hidden"
      }`}
    >
      {/* Toggle Button */}
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="absolute -top-10 right-0 bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700"
      >
        {isVisible ? "Hide" : "Show"} Perf
      </button>

      {/* Header */}
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-bold text-gray-800">Performance Monitor</h3>
        <button
          onClick={() => setIsVisible(false)}
          className="text-gray-500 hover:text-gray-700"
        >
          ×
        </button>
      </div>

      {/* Stats */}
      <div className="space-y-2 mb-3">
        <div className="flex justify-between">
          <span className="text-gray-600">Renders:</span>
          <span
            className={`font-bold ${
              renderCountRef.current > 10 ? "text-red-600" : "text-green-600"
            }`}
          >
            {renderCountRef.current} {renderCountRef.current > 10 && "⚠️"}
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-600">API Calls:</span>
          <span className="font-bold text-blue-600">{stats.apiCalls}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-600">Slow API Calls:</span>
          <span
            className={`font-bold ${
              stats.slowApiCalls > 0 ? "text-red-600" : "text-green-600"
            }`}
          >
            {stats.slowApiCalls} {stats.slowApiCalls > 0 && "🐌"}
          </span>
        </div>

        {stats.memoryUsage && (
          <div className="flex justify-between">
            <span className="text-gray-600">Memory:</span>
            <span className="font-bold text-purple-600">
              {stats.memoryUsage} MB
            </span>
          </div>
        )}
      </div>

      {/* Network Logs */}
      <div className="border-t pt-2">
        <h4 className="font-bold mb-2 text-gray-700">Recent API Calls:</h4>
        <div className="space-y-1 max-h-48 overflow-y-auto bg-gray-50 p-2 rounded">
          {networkLogs.length === 0 ? (
            <p className="text-gray-400 text-xs">No API calls yet...</p>
          ) : (
            networkLogs.map((log, index) => (
              <div key={index} className="text-xs break-all">
                {log}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Tips */}
      <div className="mt-3 pt-2 border-t text-xs text-gray-600">
        <p className="font-bold mb-1">💡 What to look for:</p>
        <ul className="list-disc list-inside space-y-1 text-xs">
          <li>Renders &gt; 10: Too many re-renders</li>
          <li>Slow calls &gt; 1000ms: Backend is slow</li>
          <li>Many API calls: Optimize caching</li>
        </ul>
      </div>

      {/* Actions */}
      <div className="mt-3 pt-2 border-t space-y-2">
        <button
          onClick={() => {
            renderCountRef.current = 0;
            setStats({
              renderCount: 0,
              lastRenderTime: 0,
              apiCalls: 0,
              slowApiCalls: 0,
            });
            setNetworkLogs([]);
          }}
          className="w-full bg-blue-600 text-white py-1 px-2 rounded hover:bg-blue-700 text-xs"
        >
          🔄 Reset Stats
        </button>

        <button
          onClick={() => {
            console.clear();
            console.log({
              ...stats,
              renderCount: renderCountRef.current,
            });
          }}
          className="w-full bg-gray-600 text-white py-1 px-2 rounded hover:bg-gray-700 text-xs"
        >
          📋 Log to Console
        </button>
      </div>
    </div>
  );
});

export default PerformanceMonitor;