import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  return NextResponse.json(
    { 
      error: 'Service is busy at the moment, please try again later',
      status: 'unavailable'
    }, 
    { status: 503 }
  );
} 