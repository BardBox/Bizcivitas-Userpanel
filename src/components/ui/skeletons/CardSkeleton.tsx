import React from "react";

export default function CardSkeleton() {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden animate-pulse">
            {/* Banner/Image */}
            <div className="h-32 bg-gray-200 w-full" />

            {/* Content */}
            <div className="p-4 space-y-3">
                {/* Title */}
                <div className="h-5 bg-gray-200 rounded w-3/4" />

                {/* Subtitle/Date */}
                <div className="h-4 bg-gray-200 rounded w-1/2" />

                {/* Description lines */}
                <div className="space-y-2 pt-2">
                    <div className="h-3 bg-gray-200 rounded w-full" />
                    <div className="h-3 bg-gray-200 rounded w-5/6" />
                </div>

                {/* Footer/Button */}
                <div className="pt-4 mt-2">
                    <div className="h-9 bg-gray-200 rounded-lg w-full" />
                </div>
            </div>
        </div>
    );
}
