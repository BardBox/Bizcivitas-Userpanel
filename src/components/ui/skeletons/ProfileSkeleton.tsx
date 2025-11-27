import React from "react";

export default function ProfileSkeleton() {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 animate-pulse flex flex-col items-center">
            {/* Avatar */}
            <div className="w-24 h-24 bg-gray-200 rounded-full mb-4" />

            {/* Name */}
            <div className="h-5 bg-gray-200 rounded w-1/2 mb-2" />

            {/* Role/Title */}
            <div className="h-4 bg-gray-200 rounded w-1/3 mb-6" />

            {/* Stats Row */}
            <div className="flex justify-between w-full px-4 mb-6">
                <div className="flex flex-col items-center space-y-1">
                    <div className="h-4 w-8 bg-gray-200 rounded" />
                    <div className="h-3 w-12 bg-gray-200 rounded" />
                </div>
                <div className="flex flex-col items-center space-y-1">
                    <div className="h-4 w-8 bg-gray-200 rounded" />
                    <div className="h-3 w-12 bg-gray-200 rounded" />
                </div>
                <div className="flex flex-col items-center space-y-1">
                    <div className="h-4 w-8 bg-gray-200 rounded" />
                    <div className="h-3 w-12 bg-gray-200 rounded" />
                </div>
            </div>

            {/* Button */}
            <div className="h-10 bg-gray-200 rounded-lg w-full" />
        </div>
    );
}
