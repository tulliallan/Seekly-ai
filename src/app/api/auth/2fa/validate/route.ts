import { NextResponse } from 'next/server';
import speakeasy from 'speakeasy';
import { kv } from '@vercel/kv';

export async function POST(req: Request) {
  try {
    const { userId, token } = await req.json();
    
    // Get the user's 2FA secret
    const secret = await kv.get(`2fa:${userId}`);
    
    if (!secret) {
      return NextResponse.json(
        { error: '2FA not set up for this user' },
        { status: 400 }
      );
    }

    // Verify the token
    const verified = speakeasy.totp.verify({
      secret: secret as string,
      encoding: 'base32',
      token,
      window: 1
    });

    return NextResponse.json({ verified });
  } catch (error) {
    console.error('2FA Validation Error:', error);
    return NextResponse.json(
      { error: 'Failed to validate code' },
      { status: 500 }
    );
  }
} 