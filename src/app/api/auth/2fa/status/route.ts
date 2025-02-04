import { NextResponse } from 'next/server';
import { kv } from '@vercel/kv';

export async function POST(req: Request) {
  try {
    const { userId } = await req.json();
    
    // Check if user has 2FA enabled
    const secret = await kv.get(`2fa:${userId}`);
    
    return NextResponse.json({ enabled: !!secret });
  } catch (error) {
    console.error('2FA Status Check Error:', error);
    return NextResponse.json(
      { error: 'Failed to check 2FA status' },
      { status: 500 }
    );
  }
} 