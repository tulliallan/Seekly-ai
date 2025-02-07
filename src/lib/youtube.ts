import { google } from 'googleapis';

const youtube = google.youtube({
  version: 'v3',
  auth: process.env.YOUTUBE_API_KEY
});

export async function searchYouTubeVideos(query: string, isAnalytics: boolean = false) {
  try {
    // If it's an analytics query, try to find the channel first
    if (isAnalytics) {
      const channelSearch = await youtube.search.list({
        part: ['snippet'],
        q: query,
        type: ['channel'],
        maxResults: 1
      });

      if (channelSearch.data.items?.[0]) {
        const channelId = channelSearch.data.items[0].snippet?.channelId;
        const channelDetails = await getChannelDetails(channelId);
        const channelAnalytics = await getChannelAnalytics(channelId);

        return {
          type: 'channel',
          details: channelDetails,
          analytics: channelAnalytics
        };
      }
    }

    // Regular video search
    const response = await youtube.search.list({
      part: ['snippet'],
      q: query,
      maxResults: 10,
      type: ['video'],
      videoEmbeddable: 'true'
    });

    const videos = response.data.items?.map(item => ({
      id: item.id?.videoId,
      title: item.snippet?.title,
      description: item.snippet?.description,
      thumbnail: item.snippet?.thumbnails?.medium?.url,
      channelTitle: item.snippet?.channelTitle,
      channelId: item.snippet?.channelId,
      publishedAt: item.snippet?.publishedAt
    })) || [];

    // Get analytics for each video
    const videosWithAnalytics = await Promise.all(
      videos.map(async (video) => {
        const analytics = await getVideoAnalytics(video.id);
        return { ...video, analytics };
      })
    );

    return {
      type: 'videos',
      items: videosWithAnalytics
    };
  } catch (error) {
    console.error('YouTube API Error:', error);
    return null;
  }
}

export async function getVideoAnalytics(videoId: string) {
  try {
    const response = await youtube.videos.list({
      part: ['statistics'],
      id: [videoId]
    });

    return response.data.items?.[0]?.statistics || null;
  } catch (error) {
    console.error('YouTube Analytics Error:', error);
    return null;
  }
}

export async function getChannelAnalytics(channelId: string) {
  try {
    const response = await youtube.channels.list({
      part: ['statistics'],
      id: [channelId]
    });

    return response.data.items?.[0]?.statistics || null;
  } catch (error) {
    console.error('Channel Analytics Error:', error);
    return null;
  }
}

export async function getChannelDetails(channelId: string) {
  try {
    const response = await youtube.channels.list({
      part: ['snippet', 'statistics', 'brandingSettings'],
      id: [channelId]
    });

    return response.data.items?.[0] || null;
  } catch (error) {
    console.error('Channel Details Error:', error);
    return null;
  }
} 