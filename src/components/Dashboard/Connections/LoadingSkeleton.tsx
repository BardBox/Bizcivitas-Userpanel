import React from 'react';

export interface LoadingSkeletonProps {
  /**
   * Type of skeleton to render
   */
  type: 'connectionCard' | 'userProfile' | 'statsList' | 'postCard' | 'eventCard';

  /**
   * Number of skeleton items to render
   */
  count?: number;

  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * Reusable loading skeleton component for connections
 * Eliminates duplication of loading states across components
 */
const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  type,
  count = 1,
  className = ''
}) => {
  const ConnectionCardSkeleton = () => (
    <div className="bg-gray-50 rounded-lg p-4 animate-pulse">
      <div className="flex items-center space-x-3 mb-3">
        <div className="w-12 h-12 rounded-full bg-gray-300"></div>
        <div className="flex-1">
          <div className="h-4 bg-gray-300 rounded mb-2"></div>
          <div className="h-3 bg-gray-300 rounded w-2/3"></div>
        </div>
      </div>
      <div className="space-y-2 mb-4">
        <div className="h-3 bg-gray-300 rounded"></div>
        <div className="h-3 bg-gray-300 rounded w-3/4"></div>
      </div>
      <div className="h-8 bg-gray-300 rounded"></div>
    </div>
  );

  const UserProfileSkeleton = () => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 animate-pulse">
      <div className="flex items-start space-x-4 mb-4">
        <div className="w-14 h-14 rounded-full bg-gray-300"></div>
        <div className="flex-1">
          <div className="h-5 bg-gray-300 rounded mb-2"></div>
          <div className="h-4 bg-gray-300 rounded w-1/2"></div>
        </div>
      </div>
      <div className="space-y-2 mb-4">
        <div className="h-3 bg-gray-300 rounded"></div>
        <div className="h-3 bg-gray-300 rounded w-3/4"></div>
      </div>
      <div className="h-3 bg-gray-300 rounded w-1/2 mb-4"></div>
      <div className="h-10 bg-gray-300 rounded"></div>
    </div>
  );

  const StatsListSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
      {[1, 2, 3].map((i) => (
        <div key={i} className="text-center">
          <div className="h-8 bg-gray-300 rounded w-16 mx-auto mb-2"></div>
          <div className="h-4 bg-gray-300 rounded w-24 mx-auto"></div>
        </div>
      ))}
    </div>
  );

  const PostCardSkeleton = () => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6 animate-pulse">
      <div className="flex items-center space-x-3 mb-4">
        <div className="w-12 h-12 rounded-full bg-gray-300"></div>
        <div className="flex-1">
          <div className="h-4 bg-gray-300 rounded w-32 mb-2"></div>
          <div className="h-3 bg-gray-300 rounded w-24"></div>
        </div>
      </div>
      <div className="space-y-3 mb-4">
        <div className="h-4 bg-gray-300 rounded"></div>
        <div className="h-4 bg-gray-300 rounded w-5/6"></div>
        <div className="h-4 bg-gray-300 rounded w-4/6"></div>
      </div>
      <div className="h-48 bg-gray-300 rounded-lg mb-4"></div>
      <div className="flex items-center space-x-6">
        <div className="h-8 bg-gray-300 rounded w-16"></div>
        <div className="h-8 bg-gray-300 rounded w-16"></div>
        <div className="h-8 bg-gray-300 rounded w-16"></div>
      </div>
    </div>
  );

  const EventCardSkeleton = () => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden animate-pulse">
      <div className="h-48 bg-gray-300"></div>
      <div className="p-6">
        <div className="h-6 bg-gray-300 rounded w-3/4 mb-3"></div>
        <div className="space-y-2 mb-4">
          <div className="h-3 bg-gray-300 rounded"></div>
          <div className="h-3 bg-gray-300 rounded w-5/6"></div>
        </div>
        <div className="flex items-center space-x-4 mb-4">
          <div className="h-4 bg-gray-300 rounded w-24"></div>
          <div className="h-4 bg-gray-300 rounded w-32"></div>
        </div>
        <div className="h-10 bg-gray-300 rounded"></div>
      </div>
    </div>
  );

  const renderSkeleton = () => {
    switch (type) {
      case 'connectionCard':
        return <ConnectionCardSkeleton />;
      case 'userProfile':
        return <UserProfileSkeleton />;
      case 'statsList':
        return <StatsListSkeleton />;
      case 'postCard':
        return <PostCardSkeleton />;
      case 'eventCard':
        return <EventCardSkeleton />;
      default:
        return <ConnectionCardSkeleton />;
    }
  };

  if (type === 'statsList') {
    // Stats list is rendered once, not in a loop
    return (
      <div className={className}>
        {renderSkeleton()}
      </div>
    );
  }

  return (
    <div className={className}>
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className={index > 0 ? 'mt-4' : ''}>
          {renderSkeleton()}
        </div>
      ))}
    </div>
  );
};

export default LoadingSkeleton;