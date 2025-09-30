"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import ProfileSection from "./ProfileSection";
import Image from "next/image";

// Component to load and display inline SVG
function InlineSvgIcon({
  src,
  className = "w-4 h-4",
  color,
}: {
  src: string;
  className?: string;
  color?: string;
}) {
  const [svgContent, setSvgContent] = useState<string>("");
  useEffect(() => {
    fetch(src)
      .then((response) => response.text())
      .then((svg) => {
        // If color is provided, modify the SVG to use that color
        if (color) {
          // Replace stroke and fill attributes with the desired color
          const modifiedSvg = svg
            .replace(/stroke="[^"]*"/g, `stroke="${color}"`)
            .replace(/fill="[^"]*"/g, (match) => {
              // Only replace fill if it's not "none"
              return match.includes('fill="none"') ? match : `fill="${color}"`;
            });
          setSvgContent(modifiedSvg);
        } else {
          setSvgContent(svg);
        }
      })
      .catch((error) => console.error("Error loading SVG:", error));
  }, [src, color]);

  if (!svgContent) {
    return <div className={`${className} bg-gray-200 animate-pulse rounded`} />;
  }

  return (
    <div
      className={className}
      dangerouslySetInnerHTML={{ __html: svgContent }}
    />
  );
}

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

const navigationItems = [
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
  const pathname = usePathname();

  // User data is now fetched directly in ProfileSection component

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
      className={`sticky top-0 h-screen  shadow-md transition-all duration-300 ${
        isCollapsed ? "w-20" : "w-64"
      }`}
    >
      <div className="p-4">
        {/* Logo Section */}
        <div className="mb-4 flex justify-center">
          <div className="flex items-center space-x-2">
            {!isCollapsed && (
              <>
                <Link href="/feeds" className="flex items-center">
                  <Image
                    src="/bizcivitas.svg"
                    width={150} // Adjust based on your logo's dimensions
                    height={40} // Adjust based on your logo's dimensions
                    alt="BizCivitas Logo"
                    className="object-contain"
                  />
                </Link>
              </>
            )}
            {isCollapsed && (
              <Link href="/" className="flex items-center">
                <Image
                  src="/favicon.ico"
                  width={150} // Adjust based on your logo's dimensions
                  height={40} // Adjust based on your logo's dimensions
                  alt="BizCivitas Logo"
                />
              </Link>
            )}
          </div>
        </div>
        {/* Horizontal Line */}
        <hr className="mb-6 border-gray-200" />
        {/* User Profile Section */}
        <ProfileSection isCollapsed={isCollapsed} />
        {/* Toggle Button - Hide on mobile */}
        {!isMobile && (
          <div
            className={`fixed z-10 transition-all duration-300 ${
              isCollapsed ? "left-[66px]" : "left-[254px]"
            } top-20`}
          >
            <button
              onClick={handleToggleClick}
              className="bg-orange-400 hover:bg-orange-500 text-white p-2 rounded-full shadow-lg transition"
              title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
              {isCollapsed ? (
                <ArrowRightIcon className="w-4 h-4 text-white" />
              ) : (
                <ArrowLeftIcon className="w-4 h-4 text-white" />
              )}
            </button>
          </div>
        )}{" "}
        {/* Navigation */}
        <nav>
          {!isCollapsed && (
            <h3 className="mb-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Main
            </h3>
          )}
          <ul className="space-y-2">
            {navigationItems.map((item) => (
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

function SidebarLink({
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
        className={`
          flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200
          ${
            isActive
              ? " text-blue-700 shadow-sm"
              : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
          }
          ${isCollapsed ? "justify-center" : "justify-start"}
        `}
        title={isCollapsed ? text : undefined}
      >
        <InlineSvgIcon
          src={iconPath}
          className={`${isCollapsed ? "w-5 h-5" : "w-5 h-5 mr-3"}`}
          color={isActive ? "#1d4ed8" : "#6b7280"} // Blue for active, gray for inactive
        />
        {!isCollapsed && <span className="truncate">{text}</span>}
      </Link>
    </li>
  );
}
