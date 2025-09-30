import React from 'react';

export interface StatsCardProps {
  /**
   * The main value to display (number or formatted string)
   */
  value: number | string;

  /**
   * Label text below the value
   */
  label: string;

  /**
   * Color theme for the value
   */
  color: 'blue' | 'green' | 'purple' | 'red' | 'orange' | 'gray';

  /**
   * Additional CSS classes
   */
  className?: string;

  /**
   * Optional icon to display alongside the value
   */
  icon?: React.ReactNode;

  /**
   * Click handler for interactive stats
   */
  onClick?: () => void;

  /**
   * Loading state
   */
  isLoading?: boolean;
}

/**
 * Reusable statistics card component
 * Eliminates duplication across dashboard components
 */
const StatsCard: React.FC<StatsCardProps> = ({
  value,
  label,
  color,
  className = '',
  icon,
  onClick,
  isLoading = false
}) => {
  const colorClasses = {
    blue: 'text-blue-600',
    green: 'text-green-600',
    purple: 'text-purple-600',
    red: 'text-red-600',
    orange: 'text-orange-600',
    gray: 'text-gray-600',
  };

  const baseClasses = "text-center transition-all duration-200";
  const interactiveClasses = onClick ? "cursor-pointer hover:bg-gray-50 rounded-lg p-2 -m-2" : "";

  if (isLoading) {
    return (
      <div className={`${baseClasses} ${className}`}>
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 rounded w-16 mx-auto mb-2"></div>
          <div className="h-4 bg-gray-300 rounded w-24 mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`${baseClasses} ${interactiveClasses} ${className}`}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <div className={`text-3xl font-bold ${colorClasses[color]} flex items-center justify-center gap-2`}>
        {icon && <span className="text-2xl">{icon}</span>}
        {value}
      </div>
      <div className="text-sm text-gray-600 mt-1">
        {label}
      </div>
    </div>
  );
};

export default StatsCard;