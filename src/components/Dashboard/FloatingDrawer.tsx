'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

interface FloatingDrawerProps {
  onToggle?: (isOpen: boolean) => void;
}

export default function FloatingDrawer({ onToggle }: FloatingDrawerProps = {}) {
  const [isOpen, setIsOpen] = useState(false);
  const [manuallyToggled, setManuallyToggled] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Set initial state based on screen size
  useEffect(() => {
    setIsMounted(true);
    
    const checkScreenSize = () => {
      // Only auto-adjust if user hasn't manually toggled
      if (!manuallyToggled) {
        const isLargeScreen = window.innerWidth >= 1024; // lg breakpoint
        setIsOpen(isLargeScreen);
        onToggle?.(isLargeScreen);
      }
    };

    // Set initial state immediately
    checkScreenSize();

    // Listen for resize events
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, [onToggle, manuallyToggled]);

  const toggleDrawer = () => {
    const newState = !isOpen;
    setIsOpen(newState);
    setManuallyToggled(true); // Mark as manually toggled
    onToggle?.(newState);
  };

  return (
    <>
      {/* Floating Toggle Button - Always visible */}
      <button
        onClick={toggleDrawer}
        className={`fixed top-1/2 transform -translate-y-1/2 z-50 bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-l-lg shadow-lg transition-all duration-300 ${
          isOpen ? 'right-80' : 'right-0'
        }`}
        title={isOpen ? 'Close drawer' : 'Open drawer'}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d={isOpen ? "M9 5l7 7-7 7" : "M15 19l-7-7 7-7"} 
          />
        </svg>
      </button>

      {/* Floating Drawer */}
      <div className={`fixed top-18 w-[80%] right-0 h-full md:w-80 bg-white shadow-2xl transition-all duration-300 z-40 ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <div className="h-full overflow-y-auto scrollbar-hide" style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}>
          <style jsx>{`
            div::-webkit-scrollbar {
              display: none;
            }
          `}</style>
          {/* Drawer Header */}
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Recent posts</h3>
              <button
                onClick={toggleDrawer}
                className="text-gray-500 hover:text-gray-700 p-1"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Drawer Content */}
          <div className="p-4 space-y-4">
            {/* Recent Posts List */}
            {[1, 2, 3, 4, 5].map((item) => (
              <div key={item} className="flex space-x-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-semibold">
                      {String.fromCharCode(64 + item)}
                    </span>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-gray-900 truncate">
                    Egestas libero nulla facilisi ut ac diam rhoncus feugiat
                  </h4>
                  <p className="text-xs text-gray-500 mt-1">
                    Neque porro quisquam est qui dolorem ipsum quia dolor sit amet...
                  </p>
                  <div className="flex items-center mt-2 text-xs text-gray-400">
                    <span>2 hours ago</span>
                    <span className="mx-2">•</span>
                    <span>Business</span>
                  </div>
                </div>
              </div>
            ))}

            {/* Community Events Section */}
            <div className="border-t border-gray-200 pt-4 mt-6">
              <h4 className="text-sm font-semibold text-gray-900 mb-3">Community Choice Webinar 2025</h4>
              <div className="space-y-3">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <h5 className="text-sm font-medium text-blue-900">Upcoming Events</h5>
                  <p className="text-xs text-blue-700 mt-1">Join our weekly networking sessions</p>
                  <button className="mt-2 px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600">
                    Register Now
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="border-t border-gray-200 pt-4 mt-6">
              <h4 className="text-sm font-semibold text-gray-900 mb-3">Quick Actions</h4>
              <div className="space-y-2">
                <button className="w-full p-2 text-left text-sm text-gray-700 hover:bg-gray-50 rounded">
                  📝 Create Post
                </button>
                <button className="w-full p-2 text-left text-sm text-gray-700 hover:bg-gray-50 rounded">
                  🎯 Join Event
                </button>
                <button className="w-full p-2 text-left text-sm text-gray-700 hover:bg-gray-50 rounded">
                  👥 Find Connections
                </button>
                <button className="w-full p-2 text-left text-sm text-gray-700 hover:bg-gray-50 rounded">
                  📊 View Analytics
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Backdrop - Only show on mobile screens */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-25 z-30 md:hidden"
          onClick={toggleDrawer}
        />
      )}
    </>
  );
}
