"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState, useCallback, memo } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import ProfileSection from "./ProfileSection";

const Arrow = ({ collapsed }: { collapsed: boolean }) => (
  <svg
    className="w-4 h-4 text-orange-500 group-hover:text-white"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d={collapsed ? "M9 5l7 7-7 7" : "M15 19l-7-7 7-7"}
    />
  </svg>
);

const SidebarIcon = memo(
  ({
    src,
    isActive,
    isCollapsed,
  }: {
    src: string;
    isActive?: boolean;
    isCollapsed?: boolean;
  }) => (
    <div
      className={`transition-all duration-300 ${
        isCollapsed ? "w-6 h-6" : "w-5 h-5"
      }`}
      style={{
        WebkitMask: `url(${src}) center/contain no-repeat`,
        mask: `url(${src}) center/contain no-repeat`,
        backgroundColor: isActive ? "#2563eb" : "#6b7280",
      }}
    />
  ),
  (prev, next) => prev.src === next.src && prev.isActive === next.isActive
);

const navigationSections = [
  {
    title: "MAIN",
    items: [
      {
        href: "/feeds",
        text: "Home",
        icon: "/dashboard/sidebaricons/home.svg",
      },
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
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [expanded, setExpanded] = useState(
    new Set(navigationSections.map((s) => s.title))
  );

  const toggleSection = useCallback((title: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(title) ? next.delete(title) : next.add(title);
      return next;
    });
  }, []);

  const handleToggle = () => {
    if (isMobile) onToggleMobile?.();
    else setIsCollapsed((prev) => !prev);
  };

  return (
    <aside
      className={`h-full fixed md:relative flex flex-col border-r border-gray-200 bg-gradient-to-b from-slate-50 to-white transition-all duration-300 ${
        isCollapsed ? "w-24" : "w-72"
      }`}
    >
      {/* Logo */}
      <div className="pt-6 px-5 mb-6 flex justify-center">
        <Link href="/feeds" className="transition-transform hover:scale-105">
          <Image
            src={isCollapsed ? "/favicon.ico" : "/bizcivitas.svg"}
            width={150}
            height={40}
            alt="BizCivitas"
            priority
          />
        </Link>
      </div>

      {/* Profile */}
      <ProfileSection isCollapsed={isCollapsed} onNavigate={onNavigate} />

      <div className="my-4 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent" />

      {/* Sidebar Toggle */}
      {!isMobile && (
        <button
          onClick={handleToggle}
          className={`fixed top-24 z-50 transition-all duration-300 ${
            isCollapsed ? "left-20" : "left-72"
          } bg-white border-2 border-orange-400 hover:bg-orange-400 text-orange-500 hover:text-white p-2 rounded-full shadow-md hover:shadow-lg group`}
          title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          <Arrow collapsed={isCollapsed} />
        </button>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-4 pb-6">
        {navigationSections.map(({ title, items }, i) => {
          const open = expanded.has(title);
          return (
            <div key={title} className={i > 0 ? "mt-6" : ""}>
              {!isCollapsed && (
                <button
                  onClick={() => toggleSection(title)}
                  className="w-full flex justify-between items-center px-2 py-2.5 mb-3 text-[13px] font-bold text-orange-600 uppercase tracking-wide"
                >
                  <span className="flex items-center gap-2">
                    <div className="w-1 h-5 bg-gradient-to-b from-orange-400 to-orange-500 rounded-full" />
                    {title}
                  </span>
                  {open ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                </button>
              )}
              {(open || isCollapsed) && (
                <ul className={`${!isCollapsed ? "ml-4" : ""} space-y-1`}>
                  {items.map((item) => (
                    <SidebarLink
                      key={item.href}
                      {...item}
                      isActive={pathname === item.href}
                      isCollapsed={isCollapsed}
                      onClick={onNavigate}
                    />
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}

const SidebarLink = memo(
  ({
    href,
    text,
    icon,
    isActive,
    isCollapsed,
    onClick,
  }: {
    href: string;
    text: string;
    icon: string;
    isActive: boolean;
    isCollapsed: boolean;
    onClick?: () => void;
  }) => (
    <li>
      <Link
        href={href}
        onClick={onClick}
        prefetch={false}
        className={`group flex items-center rounded-md transition-all duration-300 ${
          isActive
            ? "bg-blue-50/50 text-blue-700 font-semibold"
            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
        } ${isCollapsed ? "justify-center px-2 py-3" : "px-3 py-2.5"}`}
        title={isCollapsed ? text : undefined}
      >
        {isActive && isCollapsed && (
          <div className="absolute left-0 w-1 h-8 bg-gradient-to-b from-blue-500 to-blue-600 rounded-r-full" />
        )}
        <SidebarIcon src={icon} isActive={isActive} isCollapsed={isCollapsed} />
        {!isCollapsed && <span className="ml-3 truncate text-sm">{text}</span>}
      </Link>
    </li>
  ),
  (prev, next) =>
    prev.href === next.href &&
    prev.isActive === next.isActive &&
    prev.isCollapsed === next.isCollapsed
);
