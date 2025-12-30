"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState, useCallback, memo } from "react";
import {
  ChevronDown,
  ChevronRight,
  MessageSquare,
  Bookmark,
  LogOut,
  type LucideIcon,
} from "lucide-react";
import { useLogoutMutation } from "@/store/api";
import { useAppDispatch } from "@/store/hooks";
import { logout as logoutAction } from "@/store/slices/authSlice";
import { useSidebar } from "@/contexts/SidebarContext";
import toast from "react-hot-toast";
import ProfileSection from "./ProfileSection";

const Arrow = ({ collapsed }: { collapsed: boolean }) => (
  <svg
    className="w-5 h-5 text-white"
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
      className={`transition-all duration-300 ${isCollapsed ? "w-6 h-6" : "w-5 h-5"
        }`}
      style={{
        WebkitMask: `url(${src}) center/contain no-repeat`,
        mask: `url(${src}) center/contain no-repeat`,
        backgroundColor: isActive ? "#2563eb" : "#6b7280",
      }}
    />
  ),
  (prev, next) => prev.src === next.src && prev.isActive === next.isActive && prev.isCollapsed === next.isCollapsed
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
        icon: "/dashboard/sidebaricons/connection.png",
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
        lucideIcon: MessageSquare,
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
        href: "/feeds/saved-resources?tab=knowledge",
        text: "Saved Resources",
        lucideIcon: Bookmark,
      },
    ],
  },
  {
    title: "ACCOUNT",
    items: [
      {
        href: "/feeds/rewards",
        text: "Rewards",
        icon: "/dashboard/sidebaricons/rewards.png",
      },
      {
        href: "/feeds/my-membership",
        text: "My Membership",
        icon: "/dashboard/sidebaricons/membership.png",
      },
      {
        href: "/feeds/account-settings",
        text: "Account Settings",
        icon: "/dashboard/sidebaricons/accountsetting.png",
      },
      // {
      //   href: "#",
      //   text: "Logout",
      //   lucideIcon: LogOut,
      //   isLogout: true,
      // },
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
  const searchParams = useSearchParams();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [logoutUser] = useLogoutMutation();
  const { isCollapsed, setIsCollapsed } = useSidebar();
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
    else setIsCollapsed(!isCollapsed);
  };

  const handleLogout = async () => {
    try {
      // Get FCM token from localStorage
      // Use placeholder if not found (backend requires fcmToken field)
      const fcmToken = localStorage.getItem("fcmToken") || "no-fcm-token";

      await logoutUser({ fcmToken }).unwrap();

      // Dispatch Redux logout action to clear auth state
      dispatch(logoutAction());

      // Clear all local storage
      localStorage.clear();

      toast.success("Logged out successfully");

      // Force immediate hard redirect to home page (root page)
      window.location.href = "/";
    } catch (error: any) {
      console.error("Logout error:", error);
      toast.error(error?.data?.message || "Logout failed");
    }
  };

  return (
    <aside
      className={`h-full z-50 md:relative flex flex-col border-r border-gray-200 bg-gradient-to-b from-slate-50 to-white transition-all duration-300 group/sidebar ${isCollapsed ? "w-24" : "w-64 xl:w-72"
        }`}
    >
      {/* Logo */}
      <div className="pt-6 px-5 mb-6 flex justify-center">
        <Link href="/feeds" className="transition-transform hover:scale-105 flex justify-center">
          <Image
            src={isCollapsed ? "/favicon.ico" : "/bizcivitas.svg"}
            width={isCollapsed ? 40 : 150}
            height={40}
            alt="BizCivitas"
            priority
            className={isCollapsed ? "w-10 h-10 object-contain" : "w-auto h-10"}
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
          className="absolute top-1/2 -translate-y-1/2 -right-10 z-50 transition-all duration-300 bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-r-lg shadow-lg"
          title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          <Arrow collapsed={isCollapsed} />
        </button>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-2 pb-24 scrollbar-thin">
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
                <ul className={`${!isCollapsed ? "ml-4" : ""} space-y-2`}>
                  {items.map((item) => {
                    // Get the 'from' query parameter
                    const fromParam = searchParams?.get('from');

                    // Extract path from href (remove query parameters for comparison)
                    const itemPath = item.href.split('?')[0];

                    // Check if current path matches or is a child route
                    // For exact match on home page, only match /feeds exactly
                    let isActive =
                      itemPath === "/feeds"
                        ? pathname === "/feeds"
                        : pathname.startsWith(itemPath);

                    // Special handling for connection profile pages
                    // If we're on /feeds/connections/[id] with a 'from' parameter,
                    // highlight the page we came from instead
                    if (pathname.startsWith("/feeds/connections/") && fromParam) {
                      if (fromParam === "member-directory" && item.href === "/feeds/member-directory") {
                        isActive = true;
                      } else if (fromParam === "member-directory" && item.href === "/feeds/connections") {
                        isActive = false;
                      } else if (fromParam.startsWith("my-network") && item.href === "/feeds/connections") {
                        isActive = true;
                      } else if (fromParam === "requests" && item.href === "/feeds/connections") {
                        isActive = true;
                      } else if (fromParam === "messages" && item.href === "/feeds/messages") {
                        isActive = true;
                      }
                    }

                    return (
                      <SidebarLink
                        key={item.href}
                        {...item}
                        isActive={isActive}
                        isCollapsed={isCollapsed}
                        onClick={(item as any).isLogout ? handleLogout : onNavigate}
                      />
                    );
                  })}
                </ul>
              )}
            </div>
          );
        })}
      </nav>

      {/* Logout Button */}
      <div className="p-2 border-t border-gray-200 bg-white">
        <button
          onClick={handleLogout}
          className={`w-full group flex items-center rounded-md transition-all duration-300 text-gray-600 hover:bg-red-50 hover:text-red-600 ${isCollapsed ? "justify-center px-2 py-3" : "px-3 py-2.5"
            }`}
          title={isCollapsed ? "Logout" : undefined}
        >
          <LogOut
            strokeWidth={2.5}
            className={`transition-all duration-300 ${isCollapsed ? "w-6 h-6" : "w-5 h-5"
              } text-gray-500 group-hover:text-red-600`}
          />
          {!isCollapsed && <span className="ml-3 truncate text-sm font-medium">Logout</span>}
        </button>
      </div>
    </aside>
  );
}

const SidebarLink = memo(
  ({
    href,
    text,
    icon,
    lucideIcon: LucideIcon,
    isActive,
    isCollapsed,
    onClick,
    isLogout,
  }: {
    href: string;
    text: string;
    icon?: string;
    lucideIcon?: LucideIcon;
    isActive: boolean;
    isCollapsed: boolean;
    onClick?: () => void;
    isLogout?: boolean;
  }) => {
    const content = (
      <>
        {isActive && isCollapsed && !isLogout && (
          <div className="absolute left-0 w-1 h-8 bg-gradient-to-b from-blue-500 to-blue-600 rounded-r-full" />
        )}
        {LucideIcon ? (
          <LucideIcon
            strokeWidth={2.5}
            className={`transition-all duration-300 ${isCollapsed ? "w-6 h-6" : "w-5 h-5"
              } ${isLogout
                ? "text-gray-500 group-hover:text-red-600"
                : isActive
                  ? "text-blue-600"
                  : "text-gray-500"
              }`}
          />
        ) : icon ? (
          <SidebarIcon
            src={icon}
            isActive={isActive}
            isCollapsed={isCollapsed}
          />
        ) : null}
        {!isCollapsed && <span className="ml-3 truncate text-sm">{text}</span>}
      </>
    );

    const className = `group flex items-center rounded-md transition-all duration-300 ${isLogout
      ? "text-gray-600 hover:bg-red-50 hover:text-red-600"
      : isActive
        ? "bg-blue-50/50 text-blue-700 font-semibold"
        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
      } ${isCollapsed ? "justify-center px-2 py-3" : "px-3 py-2.5"}`;

    return (
      <li>
        {isLogout ? (
          <button
            onClick={onClick}
            className={className}
            title={isCollapsed ? text : undefined}
          >
            {content}
          </button>
        ) : (
          <Link
            href={href}
            onClick={onClick}
            prefetch={false}
            className={className}
            title={isCollapsed ? text : undefined}
          >
            {content}
          </Link>
        )}
      </li>
    );
  },
  (prev, next) =>
    prev.href === next.href &&
    prev.isActive === next.isActive &&
    prev.isCollapsed === next.isCollapsed &&
    prev.isLogout === next.isLogout
);
