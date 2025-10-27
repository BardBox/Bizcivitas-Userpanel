"use client";

// Test page for navigation loading
export default function NavigationTestPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Navigation Test</h1>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-600 mb-4">
          This page was loaded with the new navigation loading improvement.
        </p>

        <p className="text-gray-600">
          You should see a loading indicator when navigating to/from this page.
        </p>
      </div>
    </div>
  );
}
