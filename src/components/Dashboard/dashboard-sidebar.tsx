"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, memo, useCallback, useRef, useMemo } from "react";
import ProfileSection from "./ProfileSection";
import Image from "next/image"; // Still needed for logo
import { ChevronDown, ChevronRight } from "lucide-react";

// Optimized Icon component using CSS mask - No HTTP requests, dynamic colors!
const SidebarIcon = memo(function SidebarIcon({
  src,
  className = "w-5 h-5",
  isActive,
}: {
  src: string;
  className?: string;
  isActive?: boolean;
}) {
  return (
    <div 
      className={className}
      style={{
        WebkitMaskImage: `url(${src})`,
        maskImage: `url(${src})`,
        WebkitMaskRepeat: 'no-repeat',
        maskRepeat: 'no-repeat',
        WebkitMaskSize: 'contain',
        maskSize: 'contain',
        WebkitMaskPosition: 'center',
        maskPosition: 'center',
        backgroundColor: isActive ? '#2563eb' : '#6b7280', // blue-600 : gray-500
      }}
    />
  );
}, (prevProps, nextProps) => {
  return (
    prevProps.src === nextProps.src &&
    prevProps.className === nextProps.className &&
    prevProps.isActive === nextProps.isActive
  );
});

// Arrow Icons for sidebar toggle
const ArrowLeftIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M15 19l-7-7 7-7"
    />
  </svg>
);

const ArrowRightIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 5l7 7-7 7"
    />
  </svg>
);

// Navigation structure with sections
const navigationSections = [
  {
    title: "MAIN",
    items: [
      { href: "/feeds", text: "Home", icon: "/dashboard/sidebaricons/home.svg" },
      {
        href: "/feeds/dash",
        text: "Dashboard",
        icon: "/dashboard/sidebaricons/dashboard.svg",
      },
      {
        href: "/feeds/connections",
        text: "Connections",
        icon: "/dashboard/sidebaricons/connections.svg",
      },
      {
        href: "/feeds/events",
        text: "Events",
        icon: "/dashboard/sidebaricons/events.svg",
      },
    ],
  },
  {
    title: "CONNECT",
    items: [
      {
        href: "/feeds/member-directory",
        text: "Member Directory",
        icon: "/dashboard/sidebaricons/connections.svg",
      },
      {
        href: "/feeds/messages",
        text: "Messages",
        icon: "/dashboard/sidebaricons/notification.svg",
      },
    ],
  },
  {
    title: "ENGAGE",
    items: [
      {
        href: "/feeds/biz-pulse",
        text: "Biz Pulse",
        icon: "/dashboard/sidebaricons/bizpulse.svg",
      },
      {
        href: "/feeds/biz-hub",
        text: "Biz Hub",
        icon: "/dashboard/sidebaricons/bizhub.svg",
      },
      {
        href: "/feeds/knowledge-hub",
        text: "Knowledge Hub",
        icon: "/dashboard/sidebaricons/knowledgehub.svg",
      },
      {
        href: "/feeds/saved-resources",
        text: "Saved Resources",
        icon: "/dashboard/sidebaricons/notification.svg",
      },
    ],
  },
  {
    title: "ACCOUNT",
    items: [
      {
        href: "/feeds/rewards",
        text: "Rewards",
        icon: "/dashboard/sidebaricons/dashboard.svg",
      },
      {
        href: "/feeds/my-membership",
        text: "My Membership",
        icon: "/dashboard/sidebaricons/dashboard.svg",
      },
      {
        href: "/feeds/account-settings",
        text: "Account Settings",
        icon: "/dashboard/sidebaricons/settings.svg",
      },
    ],
  },
];

export default function DashboardSidebar({
  onNavigate,
  onToggleMobile,
  isMobile = false,
}: {
  onNavigate?: () => void;
  onToggleMobile?: () => void;
  isMobile?: boolean;
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    () => new Set(["MAIN", "CONNECT", "ENGAGE", "ACCOUNT"]) // All sections open by default
  );
  const pathname = usePathname();
  const scrollRef = useRef<HTMLDivElement>(null);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Memoize active item calculations for better performance
  const activeItemPositions = useMemo(() => {
    const positions: Record<string, { index: number; top: number }> = {};
    navigationSections.forEach(section => {
      const activeIndex = section.items.findIndex(item => pathname === item.href);
      if (activeIndex !== -1) {
        positions[section.title] = {
          index: activeIndex,
          top: activeIndex * 44 + 1
        };
      }
    });
    return positions;
  }, [pathname]);

  // Auto-hide scrollbar: Show when scrolling, hide when idle
  useEffect(() => {
    const scrollElement = scrollRef.current;
    if (!scrollElement) return;

    const handleScroll = () => {
      // Add scrolling class
      scrollElement.classList.add('scrolling');
      
      // Clear existing timeout
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      
      // Remove scrolling class after 1 second of no scrolling
      scrollTimeoutRef.current = setTimeout(() => {
        scrollElement.classList.remove('scrolling');
      }, 1000);
    };

    scrollElement.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      scrollElement.removeEventListener('scroll', handleScroll);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  // Toggle section expand/collapse
  const toggleSection = useCallback((sectionTitle: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectionTitle)) {
        newSet.delete(sectionTitle);
      } else {
        newSet.add(sectionTitle);
      }
      return newSet;
    });
  }, []);

  const handleNavClick = () => {
    if (onNavigate) {
      onNavigate();
    }
  };

  const handleToggleClick = () => {
    if (isMobile && onToggleMobile) {
      onToggleMobile();
    } else {
      setIsCollapsed(!isCollapsed);
    }
  };

  return (
    <aside
      className={`sticky top-0 h-screen bg-gradient-to-b from-slate-50 to-white border-r border-gray-200 transition-all duration-300 flex flex-col ${
        isCollapsed ? "w-20" : "w-72"
      }`}
    >
      {/* Fixed Header Section - Logo + Profile */}
      <div className="flex-shrink-0 pt-6 px-5 ">
        {/* Logo Section */}
        <div className="mb-6 flex justify-center">
          <div className="flex items-center space-x-2">
            {!isCollapsed && (
              <>
                <Link
                  href="/feeds"
                  prefetch={false}
                  className="flex items-center transition-transform hover:scale-105"
                >
                  <Image
                    src="/bizcivitas.svg"
                    width={150}
                    height={40}
                    alt="BizCivitas Logo"
                    className="object-contain"
                    priority
                  />
                </Link>
              </>
            )}
            {isCollapsed && (
              <Link href="/feeds" prefetch={false} className="flex items-center transition-transform hover:scale-110">
                <Image
                  src="/favicon.ico"
                  width={150}
                  height={40}
                  alt="BizCivitas Logo"
                  priority
                />
              </Link>
            )}
          </div>
        </div>
        
        {/* User Profile Section - Fixed, no scroll */}
        <ProfileSection isCollapsed={isCollapsed} onNavigate={handleNavClick} />
        
        {/* Elegant Divider after profile */}
        <div className="mt-4 mb-2 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
      </div>

      {/* Scrollable Navigation Area - Starts from MAIN section */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto overflow-x-hidden px-4 pb-6 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent hover:scrollbar-thumb-gray-400">
        {/* Toggle Button - Hide on mobile */}
        {!isMobile && (
          <div
            className={`fixed z-10 transition-all duration-300 ${
              isCollapsed ? "left-[66px]" : "left-[276px]"
            } top-24`}
          >
            <button
              onClick={handleToggleClick}
              className="bg-white border-2 border-orange-400 hover:bg-orange-400 text-orange-500 hover:text-white p-2 rounded-full shadow-md hover:shadow-lg transition-all duration-200 group"
                title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
              {isCollapsed ? (
                <ArrowRightIcon className="w-3.5 h-3.5 text-orange-500 group-hover:text-white" />
              ) : (
                <ArrowLeftIcon className="w-3.5 h-3.5 text-orange-500 group-hover:text-white" />
              )}
            </button>
          </div>
        )}
        {/* Navigation with Collapsible Sections */}
        <nav className="py-3">
          {navigationSections.map((section, sectionIndex) => {
            const isExpanded = expandedSections.has(section.title);
            
            return (
              <div key={section.title} className={sectionIndex > 0 ? "mt-6" : ""}>
                {/* Section Title - Clickable to expand/collapse */}
                {!isCollapsed && (
                  <button
                    onClick={() => toggleSection(section.title)}
                    className="w-full flex items-center justify-between px-2 py-2.5 mb-3 text-[13px] font-bold text-gray-700 uppercase tracking-wide text-orange-600 transition-colors duration-150 rounded-lg group"
                  >
                    <span className="flex items-center gap-2.5">
                      <div className="w-1 h-5 bg-gradient-to-b from-orange-400 to-orange-500 rounded-full"></div>
                      <span>{section.title}</span>
                    </span>
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4 text-gray-500 text-orange-500 transition-colors duration-150" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-orange-500 transition-colors duration-150" />
                    )}
                  </button>
                )}
                
                {/* Section Divider for collapsed sidebar */}
                {isCollapsed && sectionIndex > 0 && (
                  <div className="my-3 mx-3 border-t border-gray-200"></div>
                )}
                
                {/* Navigation Items - Show when expanded or sidebar collapsed */}
                {(isExpanded || isCollapsed) && (
                  <div className={`relative ${!isCollapsed ? 'ml-4 pl-3' : ''}`}>
                    {/* Static gray line for parent section */}
                    {!isCollapsed && (
                      <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-gray-200 rounded-full"></div>
                    )}
                    
                    {/* Animated blue indicator that slides to active item */}
                    {!isCollapsed && activeItemPositions[section.title] && (
                      <div 
                        className="absolute left-0 w-[3px] h-[42px] bg-gradient-to-b from-blue-500 to-blue-600 rounded-full transition-all duration-200 ease-out"
                        style={{
                          top: `${activeItemPositions[section.title].top}px`,
                          willChange: 'top'
                        }}
                      />
                    )}
                    
                    <ul className="space-y-1">
                      {section.items.map((item) => (
                        <SidebarLink
                          key={item.href}
                          href={item.href}
                          text={item.text}
                          iconPath={item.icon}
                          isActive={pathname === item.href}
                          isCollapsed={isCollapsed}
                          onClick={handleNavClick}
                        />
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </div>
    </aside>
  ); 
}

interface SidebarLinkProps {
  href: string;
  text: string;
  iconPath: string;
  isActive: boolean;
  isCollapsed: boolean;
  onClick?: () => void;
}

// Memoize SidebarLink to prevent unnecessary re-renders
const SidebarLink = memo(function SidebarLink({
  href,
  text,
  iconPath,
  isActive,
  isCollapsed,
  onClick,
}: SidebarLinkProps) {
  return (
    <li>
      <Link
        href={href}
        onClick={onClick}
        prefetch={false}
        className={`
          group relative flex items-center rounded-xl px-3 py-2.5 text-sm font-medium transition-colors duration-150
          ${
            isActive
              ? "bg-blue-50/50 text-blue-700"
              : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
          }
          ${isCollapsed ? "justify-center px-4" : "justify-start"}
        `}
        title={isCollapsed ? text : undefined}
      >
        {/* Active indicator - only for collapsed sidebar */}
        {isActive && isCollapsed && (
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-blue-500 to-blue-600 rounded-r-full"></div>
        )}
        
        <div className={isCollapsed ? "" : "mr-3"}>
          <SidebarIcon
            src={iconPath}
            className="w-5 h-5"
            isActive={isActive}
          />
        </div>
         {!isCollapsed && (
           <span className={`truncate text-sm ${isActive ? "font-semibold" : "font-medium"}`}>
             {text}
           </span>
         )}
      </Link>
    </li>
  );
}, (prevProps, nextProps) => {
  // Only re-render if these props change
  return (
    prevProps.href === nextProps.href &&
    prevProps.isActive === nextProps.isActive &&
    prevProps.isCollapsed === nextProps.isCollapsed
  );
});