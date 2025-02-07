import { searchYouTubeVideos } from '@/lib/youtube';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { query, type = 'videos' } = await req.json();
    
    const isAnalytics = query.toLowerCase().includes('analytics') || 
                       query.toLowerCase().includes('stats') ||
                       type === 'analytics';
    
    const results = await searchYouTubeVideos(query, isAnalytics);
    
    if (!results) {
      throw new Error('No results found');
    }
    
    return NextResponse.json(results);
  } catch (error) {
    console.error('YouTube API route error:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch YouTube data',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 