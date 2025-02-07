import { motion } from 'framer-motion';
import Image from 'next/image';

interface YouTubeVideo {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  channelTitle: string;
  publishedAt: string;
  analytics?: {
    viewCount: string;
    likeCount: string;
    commentCount: string;
  };
}

// Add this type for channel analytics
interface ChannelAnalytics {
  subscriberCount: string;
  viewCount: string;
  videoCount: string;
}

export function YouTubeResults({ videos, channelAnalytics }: { 
  videos?: YouTubeVideo[],
  channelAnalytics?: ChannelAnalytics 
}) {
  if (channelAnalytics) {
    return (
      <div className="bg-white/5 backdrop-blur-xl rounded-xl p-6 border border-white/10">
        <h3 className="text-xl font-medium text-white mb-4">Channel Analytics</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white/5 rounded-lg p-4">
            <div className="text-2xl font-bold text-white">
              {parseInt(channelAnalytics.subscriberCount).toLocaleString()}
            </div>
            <div className="text-sm text-gray-400">Subscribers</div>
          </div>
          <div className="bg-white/5 rounded-lg p-4">
            <div className="text-2xl font-bold text-white">
              {parseInt(channelAnalytics.viewCount).toLocaleString()}
            </div>
            <div className="text-sm text-gray-400">Total Views</div>
          </div>
          <div className="bg-white/5 rounded-lg p-4">
            <div className="text-2xl font-bold text-white">
              {parseInt(channelAnalytics.videoCount).toLocaleString()}
            </div>
            <div className="text-sm text-gray-400">Videos</div>
          </div>
        </div>
      </div>
    );
  }

  if (!videos || videos.length === 0) {
    return (
      <div className="text-center text-gray-400 py-8">
        No videos found
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {videos.map((video, idx) => (
        <motion.div
          key={video.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.1 }}
          className="bg-white/5 backdrop-blur-xl rounded-xl overflow-hidden border border-white/10 hover:border-white/20 transition-all group"
        >
          <a
            href={`https://youtube.com/watch?v=${video.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="block"
          >
            <div className="relative aspect-video">
              <Image
                src={video.thumbnail}
                alt={video.title}
                fill
                className="object-cover transition-transform group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0" />
            </div>
            
            <div className="p-4">
              <h3 className="text-white font-medium line-clamp-2 mb-2">
                {video.title}
              </h3>
              
              <div className="flex items-center gap-2 text-sm text-gray-400 mb-3">
                <span>{video.channelTitle}</span>
                <span>•</span>
                <span>{new Date(video.publishedAt).toLocaleDateString()}</span>
              </div>
              
              {video.analytics && (
                <div className="grid grid-cols-3 gap-2 text-xs text-gray-400">
                  <div className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    {parseInt(video.analytics.viewCount).toLocaleString()} views
                  </div>
                  <div className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                    </svg>
                    {parseInt(video.analytics.likeCount).toLocaleString()}
                  </div>
                  <div className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                    </svg>
                    {parseInt(video.analytics.commentCount).toLocaleString()}
                  </div>
                </div>
              )}
            </div>
          </a>
        </motion.div>
      ))}
    </div>
  );
} 