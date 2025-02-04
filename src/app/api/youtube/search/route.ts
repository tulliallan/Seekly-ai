import { NextResponse } from 'next/server';

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const DEFAULT_RESULTS = [
  {
    id: '1',
    title: 'Sample Video 1',
    thumbnail: 'https://via.placeholder.com/320x180',
    duration: '3:45'
  },
  {
    id: '2',
    title: 'Sample Video 2',
    thumbnail: 'https://via.placeholder.com/320x180',
    duration: '4:20'
  }
];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  if (!query) {
    return NextResponse.json({ items: [] });
  }

  try {
    if (!YOUTUBE_API_KEY) {
      // Return default results if no API key
      return NextResponse.json({ items: DEFAULT_RESULTS });
    }

    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${query}&type=video&key=${YOUTUBE_API_KEY}&maxResults=9`
    );

    const data = await response.json();

    const items = data.items.map((item: any) => ({
      id: item.id.videoId,
      title: item.snippet.title,
      thumbnail: item.snippet.thumbnails.medium.url,
      duration: 'Duration unavailable' // Would need additional API call to get duration
    }));

    return NextResponse.json({ items });
  } catch (error) {
    console.error('YouTube API error:', error);
    return NextResponse.json({ items: DEFAULT_RESULTS });
  }
} 