import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { query, includeImages = true, includeImageDescriptions = true } = await request.json();

    if (!query) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    if (!process.env.TAVILY_API_KEY) {
      console.error('TAVILY_API_KEY is not set');
      return NextResponse.json(
        { error: 'API key configuration error' },
        { status: 500 }
      );
    }

    const response = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.TAVILY_API_KEY}`
      },
      body: JSON.stringify({
        query,
        include_images: includeImages,
        include_image_descriptions: includeImageDescriptions,
        search_depth: 'advanced',
        api_key: process.env.TAVILY_API_KEY
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Tavily API error details:', error);
      return NextResponse.json(
        { error: 'Failed to fetch search results', details: error },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 