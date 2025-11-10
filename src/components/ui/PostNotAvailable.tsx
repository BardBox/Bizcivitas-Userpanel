import React from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle, ArrowLeft, UserX, ShieldOff } from 'lucide-react';
import Image from 'next/image';
import { getAbsoluteImageUrl } from '@/utils/imageUtils';

interface PostAuthor {
  _id: string;
  name?: string;
  fname?: string;
  lname?: string;
  avatar?: string;
  username?: string;
  classification?: string;
}

interface PostNotAvailableProps {
  reason?: 'hidden' | 'reported' | 'permission' | 'not-found' | 'deleted';
  postTitle?: string;
  postAuthor?: PostAuthor;
  errorMessage?: string;
  onGoBack?: () => void;
}

export default function PostNotAvailable({
  reason = 'not-found',
  postTitle,
  postAuthor,
  errorMessage,
  onGoBack,
}: PostNotAvailableProps) {
  const router = useRouter();

  const handleGoBack = () => {
    if (onGoBack) {
      onGoBack();
    } else {
      router.back();
    }
  };

  // Determine icon and colors based on reason
  const getReasonConfig = () => {
    switch (reason) {
      case 'hidden':
      case 'reported':
        return {
          icon: <ShieldOff className="w-16 h-16" />,
          iconColor: 'text-orange-500',
          bgColor: 'bg-orange-50',
          borderColor: 'border-orange-200',
          title: 'Content Not Available',
          description: 'This post is no longer available. It may have been hidden or reported by you.',
          suggestion: 'If you believe this is an error, please contact support.',
        };
      case 'permission':
        return {
          icon: <UserX className="w-16 h-16" />,
          iconColor: 'text-red-500',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          title: 'Access Denied',
          description: 'You do not have permission to view this post.',
          suggestion: 'This content may be private or restricted to certain members.',
        };
      case 'deleted':
        return {
          icon: <AlertCircle className="w-16 h-16" />,
          iconColor: 'text-gray-500',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          title: 'Post Deleted',
          description: 'This post has been deleted by the author or administrators.',
          suggestion: 'The content is no longer available.',
        };
      default: // 'not-found'
        return {
          icon: <AlertCircle className="w-16 h-16" />,
          iconColor: 'text-blue-500',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          title: 'Post Not Found',
          description: 'The post you\'re looking for doesn\'t exist or has been removed.',
          suggestion: 'It may have been deleted or the link is incorrect.',
        };
    }
  };

  const config = getReasonConfig();
  const authorName = postAuthor?.name ||
    (postAuthor?.fname && postAuthor?.lname ? `${postAuthor.fname} ${postAuthor.lname}` : null);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Main Card */}
        <div className={`bg-white rounded-2xl shadow-xl border-2 ${config.borderColor} overflow-hidden`}>
          {/* Header with gradient */}
          <div className={`${config.bgColor} px-6 py-8 border-b ${config.borderColor}`}>
            <div className="flex flex-col items-center text-center">
              <div className={`${config.iconColor} mb-4`}>
                {config.icon}
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {config.title}
              </h1>
              <p className="text-gray-600 max-w-md">
                {errorMessage || config.description}
              </p>
            </div>
          </div>

          {/* Post Info Section (if available) */}
          {(postTitle || postAuthor) && (
            <div className="px-6 py-6 bg-gray-50 border-b border-gray-200">
              <div className="space-y-4">
                {postTitle && (
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Post Title</p>
                    <p className="text-base font-semibold text-gray-900 line-clamp-2">
                      {postTitle}
                    </p>
                  </div>
                )}

                {postAuthor && authorName && (
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-2">Author</p>
                    <div className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-gray-200">
                      {postAuthor.avatar ? (
                        <div className="relative w-12 h-12 rounded-full overflow-hidden flex-shrink-0 border-2 border-gray-200">
                          <Image
                            src={getAbsoluteImageUrl(postAuthor.avatar) || '/placeholder-avatar.png'}
                            alt={authorName}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                          {authorName.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 truncate">
                          {authorName}
                        </p>
                        {postAuthor.classification && (
                          <p className="text-sm text-gray-500 truncate">
                            {postAuthor.classification}
                          </p>
                        )}
                        {postAuthor.username && (
                          <p className="text-xs text-gray-400 truncate">
                            @{postAuthor.username}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Suggestion Section */}
          <div className="px-6 py-6 bg-white">
            <div className="flex items-start space-x-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex-shrink-0 mt-0.5">
                <svg
                  className="w-5 h-5 text-blue-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-blue-900 mb-1">What happened?</p>
                <p className="text-sm text-blue-700">
                  {config.suggestion}
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="px-6 py-6 bg-gray-50 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleGoBack}
                className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors shadow-sm hover:shadow-md"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Go Back</span>
              </button>
              <button
                onClick={() => router.push('/feeds/biz-hub')}
                className="flex-1 px-6 py-3 bg-white hover:bg-gray-50 text-gray-700 font-medium rounded-lg transition-colors border border-gray-300 shadow-sm hover:shadow-md"
              >
                Browse Posts
              </button>
            </div>
          </div>
        </div>

        {/* Additional Help */}
        {reason === 'reported' && (
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Need to view this post?{' '}
              <a
                href="mailto:support@bizcivitas.com"
                className="text-blue-600 hover:text-blue-700 font-medium underline"
              >
                Contact Support
              </a>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
