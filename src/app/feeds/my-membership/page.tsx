"use client";

// ✅ PERFORMANCE: No loading states, instant rendering
export default function MyMembershipPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">My Membership</h1>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-600">Your Membership page content will go here.</p>
      </div>
    </div>
  );
}
