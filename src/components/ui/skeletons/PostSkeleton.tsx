import React from "react";

export default function PostSkeleton() {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-4 animate-pulse">
            {/* Header: Avatar + Name + Time */}
            <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex-shrink-0" />
                <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/3" />
                    <div className="h-3 bg-gray-200 rounded w-1/4" />
                </div>
            </div>

            {/* Content: Title + Text */}
            <div className="space-y-3 mb-4">
                <div className="h-5 bg-gray-200 rounded w-3/4" />
                <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-full" />
                    <div className="h-4 bg-gray-200 rounded w-full" />
                    <div className="h-4 bg-gray-200 rounded w-2/3" />
                </div>
            </div>

            {/* Image Placeholder (optional, showing it sometimes makes it look more realistic) */}
            <div className="w-full h-48 bg-gray-200 rounded-lg mb-4" />

            {/* Footer: Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                <div className="flex space-x-4">
                    <div className="h-8 w-16 bg-gray-200 rounded-md" />
                    <div className="h-8 w-16 bg-gray-200 rounded-md" />
                </div>
                <div className="h-8 w-8 bg-gray-200 rounded-full" />
            </div>
        </div>
    );
}
