"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  href?: string;
  isActive?: boolean;
  onClick?: () => void;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumb({ items }: BreadcrumbProps) {
  const router = useRouter();

  return (
    <nav aria-label="Breadcrumb" className="py-2 px-3 sm:px-4">
      <ol className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm">
        {items.map((item, index) => (
          <li key={index} className="flex items-center">
            {index > 0 && (
              <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 mx-1 sm:mx-2 flex-shrink-0" />
            )}

            {index === 0 ? (
              item.onClick ? (
                <button
                  onClick={item.onClick}
                  className="flex items-center text-gray-600 hover:text-blue-600 transition-colors"
                >
                  <Home className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="sr-only sm:not-sr-only sm:ml-1">{item.label}</span>
                </button>
              ) : item.href ? (
                <Link
                  href={item.href}
                  className="flex items-center text-gray-600 hover:text-blue-600 transition-colors"
                >
                  <Home className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="sr-only sm:not-sr-only sm:ml-1">{item.label}</span>
                </Link>
              ) : (
                <div className="flex items-center text-gray-600">
                  <Home className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="sr-only sm:not-sr-only sm:ml-1">{item.label}</span>
                </div>
              )
            ) : item.isActive || index === items.length - 1 ? (
              <span className="text-gray-900 font-medium truncate max-w-[120px] sm:max-w-none" aria-current="page">
                {item.label}
              </span>
            ) : item.onClick ? (
              <button
                onClick={item.onClick}
                className="text-gray-600 hover:text-blue-600 transition-colors truncate max-w-[120px] sm:max-w-none"
              >
                {item.label}
              </button>
            ) : item.href ? (
              <Link
                href={item.href}
                className="text-gray-600 hover:text-blue-600 transition-colors truncate max-w-[120px] sm:max-w-none"
              >
                {item.label}
              </Link>
            ) : (
              <span className="text-gray-600 truncate max-w-[120px] sm:max-w-none">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
