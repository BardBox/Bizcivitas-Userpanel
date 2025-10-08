"use client";

import React from "react";
import ProfilePreview from "@/components/Dashboard/MyProfile/ProfilePhoto/ProfilePreview";
import Avatar from "@/components/ui/Avatar";
import { useGetCurrentUserQuery } from "@/store/api";

export default function MyProfilePage() {
  const { data: user } = useGetCurrentUserQuery();

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Profile Header Section */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-6">
          {/* Large profile preview with edit functionality */}
          <ProfilePreview
            size="large"
            showEditButton={true}
            showMembershipBadge={true}
          />

          <div className="flex-1 text-center md:text-left">
            <h1 className="text-2xl font-bold text-gray-900">
              {user
                ? `${user.fname || ""} ${user.lname || ""}`.trim()
                : "Loading..."}
            </h1>
            <p className="text-gray-600 mt-1">{user?.membershipType} Member</p>
            <p className="text-gray-500 mt-2">
              {user?.companyName || user?.classification || "BizCivitas Member"}
            </p>
          </div>
        </div>
      </div>

      {/* Profile Details Section */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold mb-4">Profile Information</h2>

        {/* You can add more profile fields here */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <p className="text-gray-900">{user?.email || "Not provided"}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone
            </label>
            <p className="text-gray-900">{user?.mobile || "Not provided"}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Company
            </label>
            <p className="text-gray-900">
              {user?.companyName || "Not provided"}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Industry
            </label>
            <p className="text-gray-900">{user?.industry || "Not provided"}</p>
          </div>
        </div>
      </div>

      {/* Example of using Avatar component in different sizes */}
      <div className="bg-white rounded-lg shadow-lg p-6 mt-8">
        <h3 className="text-lg font-bold mb-4">Avatar Examples</h3>
        <div className="flex items-center space-x-4">
          <div className="text-center">
            <Avatar
              src={user?.avatar}
              fallbackText={`${user?.fname || ""} ${user?.lname || ""}`}
              size="xs"
              showMembershipBorder={true}
              membershipType={user?.membershipType}
            />
            <p className="text-xs mt-1">Extra Small</p>
          </div>

          <div className="text-center">
            <Avatar
              src={user?.avatar}
              fallbackText={`${user?.fname || ""} ${user?.lname || ""}`}
              size="sm"
              showMembershipBorder={true}
              membershipType={user?.membershipType}
            />
            <p className="text-xs mt-1">Small</p>
          </div>

          <div className="text-center">
            <Avatar
              src={user?.avatar}
              fallbackText={`${user?.fname || ""} ${user?.lname || ""}`}
              size="md"
              showMembershipBorder={true}
              membershipType={user?.membershipType}
              showCrown={true}
            />
            <p className="text-xs mt-1">Medium</p>
          </div>

          <div className="text-center">
            <Avatar
              src={user?.avatar}
              fallbackText={`${user?.fname || ""} ${user?.lname || ""}`}
              size="lg"
              showMembershipBorder={true}
              membershipType={user?.membershipType}
              showCrown={true}
            />
            <p className="text-xs mt-1">Large</p>
          </div>
        </div>
      </div>
    </div>
  );
}
