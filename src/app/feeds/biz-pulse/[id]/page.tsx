'use client';

import { useSelector } from 'react-redux';
import { useParams, useRouter } from 'next/navigation';
import { Heart, MessageSquare, Share2, ArrowLeft, Send } from 'lucide-react';
import { useState } from 'react';
import type { RootState } from '../../../../../store/store';

export default function BizPulseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const postId = params.id as string;
  
  const post = useSelector((state: RootState) => 
    state.posts.posts.find(p => p.id === postId)
  );

  const [isLiked, setIsLiked] = useState(false);
  const [newComment, setNewComment] = useState('');

  if (!post) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="text-gray-500 text-lg mb-2">Post not found</div>
        <button 
          onClick={() => router.back()}
          className="text-blue-600 hover:text-blue-700 flex items-center space-x-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Go back</span>
        </button>
      </div>
    );
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((word) => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
  };

  const handleCommentSubmit = () => {
    if (newComment.trim()) {
      // Handle comment submission
      setNewComment('');
    }
  };

  return (
    <div className="space-y-0">
      {/* Header with title and breadcrumb */}
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-4">
        <div className="flex items-center space-x-2 text-sm mb-2 opacity-90">
          <button 
            onClick={() => router.back()}
            className="hover:underline"
          >
            Biz Hub
          </button>
          <span>›</span>
          <span className="truncate">{post.title}</span>
        </div>
        <h1 className="text-xl font-semibold">{post.title}</h1>
      </div>

      {/* Main Content */}
      <div className="bg-white">
        {/* Hero Image */}
        {post.image && (
          <div className="px-6 pt-6">
            <div className="w-full max-w-4xl mx-auto relative">
              <img 
                src={post.image} 
                alt={post.title}
                className="w-full h-64 md:h-80 lg:h-96 object-cover rounded-xl shadow-sm"
              />
            </div>
          </div>
        )}

        {/* Article Content */}
        <div className="px-6 py-6 max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">{post.title}</h2>
          
          <div className="prose max-w-none text-gray-700 mb-6">
            <p className="mb-4">{post.content}</p>
            
            <p className="mb-4">
              Mattis ipsum varius nulla eros velit pellentesque sed risus sit. Tempor vel sit vitae elit. Semper pulvinar in ornare viverra orci aliquam. Commodo lorem augue ut tincidunt posuere. Sed sed amet mi erat sed nam. Nibh urna cursus auctor felis habitant eget ullamcorper vitae. Eget sapien sit netus pretium aliquam non. Eu id turpis tincidunt porta pulvinar amet gravida risus consequat. Vitae egestas erat risus rhoncus proin vitae molestie lacus. Tempus imperdiet ac dictum turpis blandit in. Nunc blandit vitae orci eu magna nulla diam.
            </p>
            
            <p className="mb-4">
              Tempor amet quis id mollis tincidunt integer. Ut sit interdum mi est habitant. Lacus faucibus cursit odio velit pretium turpis bibendum urna quis arcu pharetra egestas. Ultrices justo nibh aliquam dignissim. Id faucibus eros dignissim aliquam faucibus. Orci ac proin duis.
            </p>
          </div>

          {/* Post Meta */}
          <div className="flex items-center justify-between py-4 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <span className="px-2 py-1 bg-indigo-100 text-indigo-800 text-xs rounded-full font-medium">
                {post.category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </span>
              <span className="text-sm text-gray-500">{post.timeAgo}</span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1 text-sm text-gray-500">
                <MessageSquare className="w-4 h-4" />
                <span>{post.stats.comments}</span>
              </div>
              <div className="flex items-center space-x-1 text-sm text-gray-500">
                <Heart className="w-4 h-4" />
                <span>{post.stats.likes + (isLiked ? 1 : 0)}</span>
              </div>
            </div>
          </div>

          {/* Comment Form */}
          <div className="py-6">
            <div className="flex space-x-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center text-white font-semibold flex-shrink-0">
                YJ
              </div>
              <div className="flex-1">
                <div className="relative">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Write a message..."
                    className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-12"
                    rows={3}
                  />
                  <button
                    onClick={handleCommentSubmit}
                    disabled={!newComment.trim()}
                    className="absolute bottom-3 right-3 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Comments Section */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-blue-600">Replies ({post.stats.comments})</h3>
              <button className="text-sm text-gray-500 hover:text-gray-700">See all ↓</button>
            </div>

            {/* Sample Comments */}
            <div className="space-y-6">
              <div className="flex space-x-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold flex-shrink-0">
                  MP
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="font-medium text-gray-900">Marley Philips</span>
                    <span className="text-sm text-gray-500">2h</span>
                    <button className="text-gray-400 hover:text-gray-600">⋯</button>
                  </div>
                  <p className="text-gray-700 mb-3">
                    Convallis rhoncus viverra euismod ut at. Integer bibendum ut mauris hendrerit ullamcorper condimentum. Ut sed laoreet enim ornare in sed amet. Pellentesque odio mauris nunc quam ac. Adipiscing tellus accumsan consectetur gravida facilisi morbi adipiscing purus.
                  </p>
                  <p className="text-gray-700 mb-4">
                    Locus congue gravida vitae augue orci arcu augue cras. Eu eget arcu praesent vestibulum ultrices odio a. A viverra blandit fermentum tempor. Odio...
                  </p>
                  <div className="flex items-center space-x-4">
                    <button className="text-sm text-gray-500 hover:text-gray-700">More ↓</button>
                    <button className="flex items-center space-x-1 text-sm text-gray-500 hover:text-gray-700">
                      <Heart className="w-4 h-4" />
                      <span>30</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Additional comments would go here */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
