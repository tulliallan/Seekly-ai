import { NextResponse } from 'next/server';
import speakeasy from 'speakeasy';
import { kv } from '@vercel/kv';

export async function POST(req: Request) {
  try {
    const { userId, token, secret } = await req.json();
    
    if (!secret) {
      return NextResponse.json(
        { error: 'No secret provided' },
        { status: 400 }
      );
    }

    // Verify the token
    const verified = speakeasy.totp.verify({
      secret: secret,
      encoding: 'base32',
      token: token,
      window: 1
    });

    if (!verified) {
      return NextResponse.json(
        { error: 'Invalid verification code' },
        { status: 400 }
      );
    }

    // Store the verified secret permanently
    await kv.set(`2fa:${userId}`, secret);

    return NextResponse.json({ verified: true });
  } catch (error) {
    console.error('2FA Verification Error:', error);
    return NextResponse.json(
      { error: 'Failed to verify code' },
      { status: 500 }
    );
  }
} 